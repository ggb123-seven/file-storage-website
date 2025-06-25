'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: any
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('React Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    })

    this.setState({
      error,
      errorInfo
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="card-cool max-w-md w-full mx-4 animate-scale-bounce">
            <div className="text-center">
              <div className="relative mb-6">
                <AlertTriangle className="mx-auto h-16 w-16 text-red-400 animate-pulse-glow" />
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-orange-500/20 rounded-full blur-xl"></div>
              </div>
              
              <h2 className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent mb-4">
                🚨 系统错误
              </h2>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                抱歉，页面遇到了意外错误。我们已经记录了这个问题，请稍后重试。
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-left">
                  <h3 className="text-sm font-medium text-red-300 mb-2">错误详情 (开发模式):</h3>
                  <pre className="text-xs text-red-200 overflow-auto max-h-32">
                    {this.state.error.message}
                    {this.state.error.stack && '\n\n' + this.state.error.stack}
                  </pre>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 glass-effect px-4 py-3 border border-blue-400/30 text-blue-300 hover:text-blue-200 hover:border-blue-400/50 rounded-lg transition-all hover:scale-105 neon-glow"
                >
                  <RefreshCw className="h-4 w-4 mr-2 inline" />
                  重试
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 glass-effect px-4 py-3 border border-cyan-400/30 text-cyan-300 hover:text-cyan-200 hover:border-cyan-400/50 rounded-lg transition-all hover:scale-105"
                >
                  <Home className="h-4 w-4 mr-2 inline" />
                  返回首页
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// 简化的错误显示组件
export function ErrorDisplay({ 
  error, 
  onRetry, 
  title = "出错了" 
}: { 
  error: string
  onRetry?: () => void
  title?: string 
}) {
  return (
    <div className="card-cool p-6 text-center animate-scale-bounce">
      <div className="relative mb-4">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
        <div className="absolute inset-0 bg-red-400/20 rounded-full blur-md"></div>
      </div>
      
      <h3 className="text-lg font-bold text-red-300 mb-2">{title}</h3>
      <p className="text-gray-300 mb-4">{error}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="glass-effect px-4 py-2 border border-blue-400/30 text-blue-300 hover:text-blue-200 rounded-lg transition-all"
        >
          <RefreshCw className="h-4 w-4 mr-2 inline" />
          重试
        </button>
      )}
    </div>
  )
}

// 加载状态组件
export function LoadingSpinner({ message = "加载中..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
        <span className="text-gray-300">{message}</span>
      </div>
    </div>
  )
}

// 空状态组件
export function EmptyState({ 
  icon: Icon = AlertTriangle,
  title = "暂无数据",
  description = "没有找到相关内容",
  action
}: {
  icon?: React.ComponentType<any>
  title?: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="text-center py-12">
      <div className="relative mb-4">
        <Icon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="absolute inset-0 bg-gray-400/10 rounded-full blur-md"></div>
      </div>
      <h3 className="text-lg font-medium text-gray-300 mb-2">{title}</h3>
      <p className="text-gray-400 mb-4">{description}</p>
      {action}
    </div>
  )
}
