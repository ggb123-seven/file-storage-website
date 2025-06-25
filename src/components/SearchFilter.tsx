'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, X, Calendar, HardDrive, BarChart3 } from 'lucide-react'

interface SearchFilterProps {
  onSearch?: (term: string) => void
  onTypeFilter?: (type: string) => void
  onSizeFilter?: (minSize: number, maxSize: number) => void
  onDateFilter?: (startDate: string, endDate: string) => void
  onClearFilters?: () => void
}

interface FilterStats {
  totalFiles: number
  totalSize: number
  filesByType: Array<{
    mimeType: string
    _count: { mimeType: number }
    _sum: { size: number }
  }>
}

export default function SearchFilter({
  onSearch,
  onTypeFilter,
  onSizeFilter,
  onDateFilter,
  onClearFilters
}: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [sizeRange, setSizeRange] = useState({ min: '', max: '' })
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [stats, setStats] = useState<FilterStats | null>(null)

  // 文件类型选项
  const fileTypes = [
    { value: '', label: '全部类型', icon: '📁' },
    { value: 'image/', label: '图片', icon: '🖼️' },
    { value: 'application/pdf', label: 'PDF', icon: '📄' },
    { value: 'text/', label: '文本', icon: '📝' },
    { value: 'application/msword', label: 'Word', icon: '📘' },
    { value: 'application/vnd.openxmlformats', label: 'Office', icon: '📊' },
    { value: 'video/', label: '视频', icon: '🎥' },
    { value: 'audio/', label: '音频', icon: '🎵' },
  ]

  // 文件大小预设
  const sizePresets = [
    { label: '全部大小', min: 0, max: Infinity },
    { label: '小文件 (<1MB)', min: 0, max: 1024 * 1024 },
    { label: '中等文件 (1-10MB)', min: 1024 * 1024, max: 10 * 1024 * 1024 },
    { label: '大文件 (10-100MB)', min: 10 * 1024 * 1024, max: 100 * 1024 * 1024 },
    { label: '超大文件 (>100MB)', min: 100 * 1024 * 1024, max: Infinity },
  ]

  // 加载统计信息
  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('加载统计信息失败:', error)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  // 处理搜索
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    onSearch?.(term)
  }

  // 处理类型筛选
  const handleTypeFilter = (type: string) => {
    setSelectedType(type)
    onTypeFilter?.(type)
  }

  // 处理大小筛选
  const handleSizeFilter = (min: number, max: number) => {
    setSizeRange({ 
      min: min === 0 ? '' : (min / (1024 * 1024)).toString(),
      max: max === Infinity ? '' : (max / (1024 * 1024)).toString()
    })
    onSizeFilter?.(min, max)
  }

  // 处理自定义大小筛选
  const handleCustomSizeFilter = () => {
    const minBytes = sizeRange.min ? parseFloat(sizeRange.min) * 1024 * 1024 : 0
    const maxBytes = sizeRange.max ? parseFloat(sizeRange.max) * 1024 * 1024 : Infinity
    onSizeFilter?.(minBytes, maxBytes)
  }

  // 处理日期筛选
  const handleDateFilter = () => {
    onDateFilter?.(dateRange.start, dateRange.end)
  }

  // 清除所有筛选
  const handleClearAll = () => {
    setSearchTerm('')
    setSelectedType('')
    setSizeRange({ min: '', max: '' })
    setDateRange({ start: '', end: '' })
    onClearFilters?.()
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 获取文件类型统计
  const getTypeStats = (mimeType: string) => {
    if (!stats) return { count: 0, size: 0 }
    
    const typeStats = stats.filesByType.filter(item => 
      item.mimeType.startsWith(mimeType) || mimeType === ''
    )
    
    return typeStats.reduce((acc, item) => ({
      count: acc.count + item._count.mimeType,
      size: acc.size + (item._sum.size || 0)
    }), { count: 0, size: 0 })
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* 基础搜索 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          搜索文件
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="输入文件名、描述或标签..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 文件类型筛选 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          文件类型
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {fileTypes.map((type) => {
            const typeStats = getTypeStats(type.value)
            return (
              <button
                key={type.value}
                onClick={() => handleTypeFilter(type.value)}
                className={`p-3 text-left border rounded-lg transition-colors ${
                  selectedType === type.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{type.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{type.label}</div>
                    <div className="text-xs text-gray-500">
                      {typeStats.count} 个文件
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 高级筛选 */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <Filter className="h-4 w-4" />
          <span>高级筛选</span>
          <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
            {/* 文件大小筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文件大小
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                {sizePresets.slice(0, 3).map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handleSizeFilter(preset.min, preset.max)}
                    className="p-2 text-sm border border-gray-200 rounded hover:border-gray-300 text-left"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {sizePresets.slice(3).map((preset, index) => (
                  <button
                    key={index + 3}
                    onClick={() => handleSizeFilter(preset.min, preset.max)}
                    className="p-2 text-sm border border-gray-200 rounded hover:border-gray-300 text-left"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="最小 (MB)"
                  value={sizeRange.min}
                  onChange={(e) => setSizeRange(prev => ({ ...prev, min: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="最大 (MB)"
                  value={sizeRange.max}
                  onChange={(e) => setSizeRange(prev => ({ ...prev, max: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={handleCustomSizeFilter}
                  className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  应用
                </button>
              </div>
            </div>

            {/* 上传日期筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                上传日期
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={handleDateFilter}
                  className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  应用
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 统计信息 */}
      {stats && (
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            存储统计
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-4 w-4 text-blue-500" />
              <div>
                <div className="font-medium">{stats.totalFiles}</div>
                <div className="text-gray-500">总文件数</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <div>
                <div className="font-medium">{formatFileSize(stats.totalSize)}</div>
                <div className="text-gray-500">总大小</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 清除筛选 */}
      {(searchTerm || selectedType || sizeRange.min || sizeRange.max || dateRange.start || dateRange.end) && (
        <div className="border-t pt-4">
          <button
            onClick={handleClearAll}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
            <span>清除所有筛选</span>
          </button>
        </div>
      )}
    </div>
  )
}
