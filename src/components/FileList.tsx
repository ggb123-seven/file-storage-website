'use client'

import { useState, useEffect } from 'react'
import { 
  File, 
  Image, 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  HardDrive,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Grid,
  List
} from 'lucide-react'
import { formatFileSize, formatDate, getFileTypeCategory, isPreviewable } from '@/lib/utils'

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

interface FileListProps {
  onFilePreview?: (file: FileItem) => void
  onFileDownload?: (file: FileItem) => void
  adminKey?: string
}

export default function FileList({ onFilePreview, onFileDownload, adminKey }: FileListProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [sortBy, setSortBy] = useState('uploadDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [limit] = useState(12)

  // 获取文件类型图标
  const getFileIcon = (mimeType: string) => {
    const category = getFileTypeCategory(mimeType)
    switch (category) {
      case 'image':
        return <Image className="h-8 w-8 text-blue-500" />
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />
      case 'text':
        return <FileText className="h-8 w-8 text-green-500" />
      case 'document':
        return <FileText className="h-8 w-8 text-blue-600" />
      default:
        return <File className="h-8 w-8 text-gray-500" />
    }
  }

  // 获取文件类型颜色
  const getTypeColor = (mimeType: string) => {
    const category = getFileTypeCategory(mimeType)
    switch (category) {
      case 'image':
        return 'bg-blue-100 text-blue-800'
      case 'pdf':
        return 'bg-red-100 text-red-800'
      case 'text':
        return 'bg-green-100 text-green-800'
      case 'document':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 加载文件列表
  const loadFiles = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        search: searchTerm,
        mimeType: selectedType,
        sortBy,
        sortOrder
      })

      const response = await fetch(`/api/files?${params}`)
      const data = await response.json()

      if (data.success) {
        setFiles(data.data.files)
        setTotalPages(data.data.pagination.totalPages)
      } else {
        setError(data.error || '加载文件列表失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 处理搜索
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  // 处理类型筛选
  const handleTypeFilter = (type: string) => {
    setSelectedType(type)
    setCurrentPage(1)
  }

  // 处理排序
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setCurrentPage(1)
  }

  // 处理文件预览
  const handlePreview = (file: FileItem) => {
    if (isPreviewable(file.mimeType)) {
      onFilePreview?.(file)
    }
  }

  // 处理文件下载
  const handleDownload = async (file: FileItem) => {
    try {
      // 直接使用下载链接，让浏览器处理下载
      const downloadUrl = `/api/download/${file.id}`
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = file.originalName
      a.target = '_blank' // 在新标签页打开，适用于重定向
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      onFileDownload?.(file)
    } catch (err) {
      setError('下载失败，请检查网络连接')
    }
  }

  // 页面变化时重新加载
  useEffect(() => {
    loadFiles()
  }, [currentPage, searchTerm, selectedType, sortBy, sortOrder])

  // 文件类型选项
  const fileTypes = [
    { value: '', label: '全部类型' },
    { value: 'image/', label: '图片' },
    { value: 'application/pdf', label: 'PDF' },
    { value: 'text/', label: '文本' },
    { value: 'application/', label: '文档' },
  ]

  // 排序选项
  const sortOptions = [
    { value: 'uploadDate', label: '上传时间' },
    { value: 'originalName', label: '文件名' },
    { value: 'size', label: '文件大小' },
    { value: 'downloadCount', label: '下载次数' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">加载中...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">加载失败</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={loadFiles}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 搜索和筛选栏 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* 搜索框 */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索文件名或描述..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 筛选和排序 */}
          <div className="flex flex-wrap items-center space-x-4">
            {/* 文件类型筛选 */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => handleTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {fileTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 排序 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">排序:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            {/* 视图模式切换 */}
            <div className="flex items-center space-x-1 border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 文件列表 */}
      {files.length === 0 ? (
        <div className="text-center py-12">
          <File className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无文件</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedType ? '没有找到匹配的文件' : '还没有上传任何文件'}
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            /* 网格视图 */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  {/* 文件图标和类型 */}
                  <div className="p-4 text-center">
                    {getFileIcon(file.mimeType)}
                    <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(file.mimeType)}`}>
                      {getFileTypeCategory(file.mimeType)}
                    </span>
                  </div>

                  {/* 文件信息 */}
                  <div className="px-4 pb-4">
                    <h3 className="text-sm font-medium text-gray-900 truncate" title={file.originalName}>
                      {file.originalName}
                    </h3>
                    <div className="mt-2 space-y-1 text-xs text-gray-500">
                      <div className="flex items-center">
                        <HardDrive className="h-3 w-3 mr-1" />
                        {formatFileSize(file.size)}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(file.uploadDate)}
                      </div>
                      <div className="flex items-center">
                        <Download className="h-3 w-3 mr-1" />
                        {file.downloadCount} 次下载
                      </div>
                    </div>
                    {file.description && (
                      <p className="mt-2 text-xs text-gray-600 line-clamp-2" title={file.description}>
                        {file.description}
                      </p>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="px-4 pb-4 flex space-x-2">
                    {isPreviewable(file.mimeType) && (
                      <button
                        onClick={() => handlePreview(file)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        预览
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(file)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      下载
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 列表视图 */
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      文件
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      大小
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      上传时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      下载次数
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {getFileIcon(file.mimeType)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={file.originalName}>
                              {file.originalName}
                            </div>
                            <div className="text-sm text-gray-500">
                              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(file.mimeType)}`}>
                                {getFileTypeCategory(file.mimeType)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(file.uploadDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {file.downloadCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {isPreviewable(file.mimeType) && (
                          <button
                            onClick={() => handlePreview(file)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            预览
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(file)}
                          className="text-green-600 hover:text-green-900"
                        >
                          下载
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                第 {currentPage} 页，共 {totalPages} 页
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  上一页
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
