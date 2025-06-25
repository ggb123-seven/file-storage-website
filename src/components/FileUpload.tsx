'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, File, AlertCircle, CheckCircle } from 'lucide-react'
import { formatFileSize, isValidFileType } from '@/lib/utils'

interface FileUploadProps {
  onUploadSuccess?: (file: any) => void
  onUploadError?: (error: string) => void
  adminKey?: string
}

interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  result?: any
}

export default function FileUpload({ onUploadSuccess, onUploadError, adminKey }: FileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 生成唯一ID
  const generateId = () => Math.random().toString(36).substring(2, 15)

  // 验证文件
  const validateFile = (file: File): string | null => {
    if (!isValidFileType(file.type)) {
      return '不支持的文件类型'
    }
    
    const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '104857600')
    if (file.size > maxSize) {
      return '文件大小超出限制'
    }
    
    return null
  }

  // 添加文件到列表
  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles: UploadFile[] = []
    
    newFiles.forEach(file => {
      const error = validateFile(file)
      validFiles.push({
        file,
        id: generateId(),
        progress: 0,
        status: error ? 'error' : 'pending',
        error: error || undefined
      })
    })
    
    setFiles(prev => [...prev, ...validFiles])
  }, [])

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    addFiles(selectedFiles)
    // 清空input值，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 处理拖拽
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = Array.from(event.dataTransfer.files)
    addFiles(droppedFiles)
  }

  // 移除文件
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  // 上传单个文件
  const uploadSingleFile = async (uploadFile: UploadFile) => {
    if (!adminKey) {
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'error', error: '缺少管理员密钥' }
          : f
      ))
      return
    }

    setFiles(prev => prev.map(f => 
      f.id === uploadFile.id 
        ? { ...f, status: 'uploading', progress: 0 }
        : f
    ))

    try {
      const formData = new FormData()
      formData.append('file', uploadFile.file)
      formData.append('description', description)
      formData.append('tags', tags)

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-admin-key': adminKey
        },
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'success', progress: 100, result: result.data }
            : f
        ))
        onUploadSuccess?.(result.data)
      } else {
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'error', error: result.error }
            : f
        ))
        onUploadError?.(result.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败'
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'error', error: errorMessage }
          : f
      ))
      onUploadError?.(errorMessage)
    }
  }

  // 上传所有待上传文件
  const uploadAllFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending')
    
    for (const file of pendingFiles) {
      await uploadSingleFile(file)
    }
  }

  // 清空所有文件
  const clearAllFiles = () => {
    setFiles([])
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* 拖拽上传区域 */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          拖拽文件到此处或点击选择
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          支持多种文件格式，单文件最大 100MB
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          选择文件
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* 文件描述和标签 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            文件描述
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="可选的文件描述"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标签
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="用逗号分隔的标签"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900">
              文件列表 ({files.length})
            </h4>
            <div className="space-x-2">
              <button
                onClick={uploadAllFiles}
                disabled={!files.some(f => f.status === 'pending') || !adminKey}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                上传全部
              </button>
              <button
                onClick={clearAllFiles}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                清空列表
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {files.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <File className="h-5 w-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadFile.file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* 状态指示器 */}
                  {uploadFile.status === 'pending' && (
                    <span className="text-xs text-gray-500">待上传</span>
                  )}
                  {uploadFile.status === 'uploading' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadFile.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-blue-600">上传中</span>
                    </div>
                  )}
                  {uploadFile.status === 'success' && (
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-600">成功</span>
                    </div>
                  )}
                  {uploadFile.status === 'error' && (
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-xs text-red-600" title={uploadFile.error}>
                        失败
                      </span>
                    </div>
                  )}

                  {/* 操作按钮 */}
                  {uploadFile.status === 'pending' && (
                    <button
                      onClick={() => uploadSingleFile(uploadFile)}
                      disabled={!adminKey}
                      className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                    >
                      上传
                    </button>
                  )}
                  
                  <button
                    onClick={() => removeFile(uploadFile.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 权限提示 */}
      {!adminKey && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                需要管理员权限
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                文件上传需要管理员密钥。请联系管理员获取权限。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
