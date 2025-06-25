// 权限验证工具函数

/**
 * 验证管理员密钥
 * @param key 用户提供的密钥
 * @returns 是否有效
 */
export function validateAdminKey(key: string): boolean {
  const adminKey = process.env.ADMIN_SECRET_KEY
  return adminKey ? key === adminKey : false
}

/**
 * 从请求头中获取管理员密钥
 * @param headers 请求头对象
 * @returns 管理员密钥或null
 */
export function getAdminKeyFromHeaders(headers: Headers): string | null {
  return headers.get('x-admin-key')
}

/**
 * 验证请求是否具有管理员权限
 * @param headers 请求头对象
 * @returns 是否有管理员权限
 */
export function hasAdminPermission(headers: Headers): boolean {
  const key = getAdminKeyFromHeaders(headers)
  return key ? validateAdminKey(key) : false
}

/**
 * 创建权限验证中间件
 * @param headers 请求头对象
 * @returns 权限验证结果
 */
export function verifyAdminPermission(headers: Headers): {
  isValid: boolean
  error?: string
} {
  const key = getAdminKeyFromHeaders(headers)
  
  if (!key) {
    return {
      isValid: false,
      error: '缺少管理员密钥'
    }
  }
  
  if (!validateAdminKey(key)) {
    return {
      isValid: false,
      error: '无效的管理员密钥'
    }
  }
  
  return {
    isValid: true
  }
}

/**
 * 权限错误响应
 */
export const PERMISSION_ERRORS = {
  MISSING_KEY: '缺少管理员密钥',
  INVALID_KEY: '无效的管理员密钥',
  UNAUTHORIZED: '无权限执行此操作'
} as const
