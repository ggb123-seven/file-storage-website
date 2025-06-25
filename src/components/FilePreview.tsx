'use client'

import { useState, useEffect } from 'react'
import { X, Download, ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react'
import { formatFileSize, formatDate, getFileTypeCategory } from '@/lib/utils'

interface FileItem {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  uploadDate: string
  downloadCount: number
  description?: string
  tags?: string
}

interface FilePreviewProps {
  file: FileItem | null
  isOpen: boolean
  onClose: () => void
  onDownload?: (file: FileItem) => void
}

export default function FilePreview({ file, isOpen, onClose, onDownload }: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 加载预览内容
  const loadPreview = async (fileItem: FileItem) => {
    try {
      setLoading(true)
      setError(null)
      setZoom(100)
      setRotation(0)

      const response = await fetch(`/api/files/preview/${fileItem.id}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
      } else {
        setError('预览加载失败')
      }
    } catch (err) {
      setError('预览加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 清理预览资源
  const cleanupPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setError(null)
    setZoom(100)
    setRotation(0)
    setIsFullscreen(false)
  }

  // 处理文件变化
  useEffect(() => {
    if (isOpen && file) {
      loadPreview(file)
    } else {
      cleanupPreview()
    }

    return () => {
      cleanupPreview()
    }
  }, [isOpen, file])

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'Escape':
          onClose()
          break
        case '+':
        case '=':
          setZoom(prev => Math.min(300, prev + 25))
          break
        case '-':
          setZoom(prev => Math.max(25, prev - 25))
          break
        case 'r':
        case 'R':
          setRotation(prev => (prev + 90) % 360)
          break
        case 'f':
        case 'F':
          setIsFullscreen(prev => !prev)
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // 处理下载
  const handleDownload = () => {
    if (file && onDownload) {
      onDownload(file)
    }
  }

  // 渲染预览内容
  const renderPreviewContent = () => {
    if (!file || !previewUrl) return null

    const category = getFileTypeCategory(file.mimeType)

    switch (category) {
      case 'image':
        return (
          <div className="flex items-center justify-center h-full">
            <img
              src={previewUrl}
              alt={file.originalName}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              }}
            />
          </div>
        )

      case 'pdf':
        return (
          <div className="w-full h-full">
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title={file.originalName}
            />
          </div>
        )

      case 'text':
        return (
          <div className="w-full h-full overflow-auto bg-white">
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title={file.originalName}
            />
          </div>
        )

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500">此文件类型不支持预览</p>
              <button
                onClick={handleDownload}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                下载文件
              </button>
            </div>
          </div>
        )
    }
  }

  if (!isOpen || !file) return null

  return (
    <div className={`fixed inset-0 z-50 ${isFullscreen ? 'bg-black' : 'bg-black bg-opacity-75'}`}>
      <div className={`flex flex-col h-full ${isFullscreen ? '' : 'p-4'}`}>
        {/* 头部工具栏 */}
        <div className={`flex items-center justify-between ${isFullscreen ? 'absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50' : ''} p-4`}>
          <div className="flex items-center space-x-4 text-white">
            <h2 className="text-lg font-medium truncate max-w-md" title={file.originalName}>
              {file.originalName}
            </h2>
            <div className="text-sm text-gray-300">
              {formatFileSize(file.size)} • {formatDate(file.uploadDate)}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* 图片控制按钮 */}
            {getFileTypeCategory(file.mimeType) === 'image' && (
              <>
                <button
                  onClick={() => setZoom(prev => Math.max(25, prev - 25))}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
                  title="缩小 (-)"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <span className="text-white text-sm min-w-[3rem] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom(prev => Math.min(300, prev + 25))}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
                  title="放大 (+)"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
                  title="旋转 (R)"
                >
                  <RotateCw className="h-5 w-5" />
                </button>
              </>
            )}

            {/* 全屏按钮 */}
            <button
              onClick={() => setIsFullscreen(prev => !prev)}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
              title="全屏 (F)"
            >
              <Maximize2 className="h-5 w-5" />
            </button>

            {/* 下载按钮 */}
            <button
              onClick={handleDownload}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
              title="下载文件"
            >
              <Download className="h-5 w-5" />
            </button>

            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
              title="关闭 (ESC)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 预览内容区域 */}
        <div className={`flex-1 ${isFullscreen ? '' : 'bg-white rounded-lg'} overflow-hidden`}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">加载中...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-4">{error}</p>
                <button
                  onClick={() => loadPreview(file)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  重试
                </button>
              </div>
            </div>
          ) : (
            renderPreviewContent()
          )}
        </div>

        {/* 底部信息栏 */}
        {!isFullscreen && file.description && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">文件描述</h3>
            <p className="text-sm text-gray-600">{file.description}</p>
            {file.tags && (
              <div className="mt-2">
                <span className="text-sm text-gray-500">标签: </span>
                <span className="text-sm text-blue-600">{file.tags}</span>
              </div>
            )}
          </div>
        )}

        {/* 键盘快捷键提示 */}
        {!isFullscreen && (
          <div className="mt-2 text-xs text-gray-400 text-center">
            快捷键: ESC 关闭 • +/- 缩放 • R 旋转 • F 全屏
          </div>
        )}
      </div>
    </div>
  )
}
