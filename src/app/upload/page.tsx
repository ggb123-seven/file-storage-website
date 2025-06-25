'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/FileUpload'
import { Key, ArrowLeft, Upload } from 'lucide-react'

export default function UploadPage() {
  const [adminKey, setAdminKey] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const router = useRouter()

  // 验证管理员密钥
  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminKey.trim()) {
      setIsAuthenticated(true)
    }
  }

  // 处理上传成功
  const handleUploadSuccess = (file: any) => {
    setUploadedFiles(prev => [...prev, file])
  }

  // 处理上传错误
  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
    // 可以在这里添加错误提示
  }

  return (
    <div className="min-h-screen">
      {/* 炫酷头部导航 */}
      <header className="glass-effect border-b border-white/10 animate-slide-in-left">
        <div className="container-cool">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="glass-effect px-4 py-2 rounded-lg text-cyan-400 hover:text-cyan-300 transition-all hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5 mr-2 inline" />
                返回首页
              </button>
              <div className="h-6 w-px bg-gradient-to-b from-transparent via-cyan-400 to-transparent" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent flex items-center">
                <Upload className="h-6 w-6 mr-2 text-cyan-400 animate-float" />
                🚀 炫酷文件上传
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container-cool py-6">
        <div className="px-4 py-6 sm:px-0">
          {!isAuthenticated ? (
            /* 炫酷权限验证界面 */
            <div className="max-w-md mx-auto">
              <div className="card-cool animate-scale-bounce">
                <div className="text-center mb-6">
                  <div className="relative">
                    <Key className="mx-auto h-16 w-16 text-cyan-400 animate-pulse-glow" />
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-full blur-xl"></div>
                  </div>
                  <h2 className="mt-6 text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    🔐 管理员验证
                  </h2>
                  <p className="mt-3 text-sm text-gray-300 leading-relaxed">
                    请输入管理员密钥以访问炫酷文件上传功能
                  </p>
                </div>

                <form onSubmit={handleKeySubmit} className="space-y-6">
                  <div>
                    <label htmlFor="adminKey" className="sr-only">
                      管理员密钥
                    </label>
                    <input
                      id="adminKey"
                      type="password"
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                      placeholder="🔑 请输入管理员密钥"
                      className="w-full px-4 py-3 glass-effect border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full btn-primary neon-glow py-3 text-base font-semibold"
                  >
                    ✨ 验证并继续
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-400">
                    如果您没有管理员密钥，请联系系统管理员 👨‍💻
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* 炫酷文件上传界面 */
            <div className="space-y-6 animate-slide-in-right">
              {/* 炫酷成功提示 */}
              {uploadedFiles.length > 0 && (
                <div className="card-cool border-green-400/30 bg-green-400/10 animate-scale-bounce">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <svg className="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div className="absolute inset-0 bg-green-400/20 rounded-full blur-md"></div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-bold text-green-300">
                        🎉 上传成功
                      </h3>
                      <div className="mt-2 text-sm text-green-200">
                        <p>已成功上传 {uploadedFiles.length} 个文件 ✨</p>
                        <ul className="mt-2 space-y-1">
                          {uploadedFiles.slice(-3).map((file, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                              {file.originalName}
                            </li>
                          ))}
                          {uploadedFiles.length > 3 && (
                            <li className="flex items-center text-green-300">
                              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                              ... 还有 {uploadedFiles.length - 3} 个文件
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 文件上传组件 */}
              <FileUpload
                adminKey={adminKey}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />

              {/* 炫酷操作提示 */}
              <div className="card-cool border-cyan-400/30 bg-cyan-400/10">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <svg className="h-6 w-6 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-md"></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-bold text-cyan-300">
                      💡 使用提示
                    </h3>
                    <div className="mt-3 text-sm text-cyan-200">
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                          支持拖拽上传，可同时选择多个文件 🎯
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                          单个文件最大支持 100MB 📦
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                          支持常见的文档、图片、音视频格式 🎨
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                          可以添加文件描述和标签便于管理 🏷️
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                          上传后的文件可在首页查看和下载 ⬇️
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* 炫酷快捷操作 */}
              <div className="flex justify-center space-x-6">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="glass-effect px-6 py-3 border border-cyan-400/30 text-cyan-300 hover:text-cyan-200 hover:border-cyan-400/50 rounded-lg transition-all hover:scale-105 neon-glow"
                >
                  📂 查看文件列表
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthenticated(false)
                    setAdminKey('')
                    setUploadedFiles([])
                  }}
                  className="glass-effect px-6 py-3 border border-red-400/30 text-red-300 hover:text-red-200 hover:border-red-400/50 rounded-lg transition-all hover:scale-105"
                >
                  🚪 退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
