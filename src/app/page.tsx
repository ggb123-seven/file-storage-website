'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Upload, FolderOpen, BarChart3 } from 'lucide-react'
import FileList from '@/components/FileList'
import FilePreview from '@/components/FilePreview'
import SearchFilter from '@/components/SearchFilter'

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

export default function Home() {
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // 处理文件预览
  const handleFilePreview = (file: FileItem) => {
    setPreviewFile(file)
    setIsPreviewOpen(true)
  }

  // 处理文件下载
  const handleFileDownload = (file: FileItem) => {
    // 下载逻辑已在FileList组件中处理
    console.log('文件下载:', file.originalName)
  }

  // 关闭预览
  const handleClosePreview = () => {
    setIsPreviewOpen(false)
    setPreviewFile(null)
  }
  return (
    <div className="min-h-screen">
      {/* 炫酷头部导航 */}
      <header className="glass-effect border-b border-white/10 animate-slide-in-left">
        <div className="container-cool">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <FolderOpen className="h-8 w-8 text-cyan-400 mr-3 animate-float" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                🚀 炫酷文件存储
              </h1>
            </div>
            <nav className="flex space-x-4">
              <Link
                href="/upload"
                className="btn-primary neon-glow"
              >
                <Upload className="h-4 w-4 mr-2" />
                上传文件
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container-cool py-6">
        <div className="px-4 py-6 sm:px-0">
          {/* 炫酷欢迎区域 */}
          <div className="card-cool mb-6 animate-scale-bounce">
            <div className="text-center">
              <div className="relative">
                <FolderOpen className="mx-auto h-16 w-16 text-cyan-400 animate-pulse-glow" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-full blur-xl"></div>
              </div>
              <h2 className="mt-6 text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                欢迎使用炫酷文件存储平台
              </h2>
              <p className="mt-4 text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
                🌟 这是一个超级炫酷的文件存储和分享平台 🌟<br/>
                支持拖拽上传、实时预览、智能搜索，让文件管理变得如此简单而有趣！
              </p>
            </div>
          </div>

          {/* 炫酷功能卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* 文件上传 */}
            <div className="card-cool neon-glow animate-slide-in-left">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <Upload className="h-8 w-8 text-cyan-400" />
                      <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-md"></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">
                      🚀 文件上传
                    </h3>
                    <p className="text-sm text-gray-300">
                      支持拖拽上传，多种文件格式
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    href="/upload"
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                  >
                    开始上传 →
                  </Link>
                </div>
              </div>
            </div>

            {/* 文件浏览 */}
            <div className="card-cool neon-glow animate-slide-in-left" style={{animationDelay: '0.2s'}}>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <FolderOpen className="h-8 w-8 text-green-400" />
                      <div className="absolute inset-0 bg-green-400/20 rounded-full blur-md"></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">
                      📁 文件浏览
                    </h3>
                    <p className="text-sm text-gray-300">
                      查看、搜索、下载文件
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <a
                    href="#file-list"
                    className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
                  >
                    查看文件 →
                  </a>
                </div>
              </div>
            </div>

            {/* 统计信息 */}
            <div className="card-cool neon-glow animate-slide-in-left" style={{animationDelay: '0.4s'}}>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <BarChart3 className="h-8 w-8 text-purple-400" />
                      <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-md"></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">
                      📊 统计信息
                    </h3>
                    <p className="text-sm text-gray-300">
                      文件数量、存储使用情况
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors cursor-pointer">
                    查看统计 →
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 炫酷文件管理区域 */}
          <div id="file-list" className="space-y-6 animate-slide-in-right">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                📂 文件管理中心
              </h3>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`glass-effect px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    showFilters
                      ? 'border-cyan-400/50 text-cyan-300 bg-cyan-400/10'
                      : 'border-white/20 text-gray-300 hover:text-white hover:border-white/30'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {showFilters ? '隐藏筛选' : '显示筛选'}
                </button>
                <Link
                  href="/upload"
                  className="btn-primary neon-glow"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  上传文件
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* 筛选侧边栏 */}
              {showFilters && (
                <div className="lg:col-span-1">
                  <SearchFilter />
                </div>
              )}

              {/* 文件列表 */}
              <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
                <FileList
                  onFilePreview={handleFilePreview}
                  onFileDownload={handleFileDownload}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 文件预览模态框 */}
      <FilePreview
        file={previewFile}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onDownload={handleFileDownload}
      />

      {/* 炫酷页脚 */}
      <footer className="glass-effect border-t border-white/10 mt-12">
        <div className="container-cool py-8">
          <div className="text-center">
            <p className="text-sm bg-gradient-to-r from-gray-400 to-gray-300 bg-clip-text text-transparent">
              © 2025 炫酷文件存储平台 ✨ 专为现代化文件管理而设计 🚀
            </p>
            <div className="mt-4 flex justify-center space-x-6 text-xs text-gray-400">
              <span>🔒 安全存储</span>
              <span>⚡ 极速上传</span>
              <span>🎨 炫酷界面</span>
              <span>📱 响应式设计</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
