// Vercel部署验证脚本
const https = require('https')
const http = require('http')

class DeploymentVerifier {
  constructor(baseUrl, adminKey) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // 移除末尾斜杠
    this.adminKey = adminKey
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    }
  }

  // 发送HTTP请求
  async makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${path}`
      const isHttps = url.startsWith('https://')
      const client = isHttps ? https : http
      
      const requestOptions = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Deployment-Verifier/1.0',
          ...options.headers
        },
        timeout: 30000
      }

      const req = client.request(url, requestOptions, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            url: url
          })
        })
      })

      req.on('error', reject)
      req.on('timeout', () => reject(new Error('Request timeout')))
      
      if (options.body) {
        req.write(options.body)
      }
      
      req.end()
    })
  }

  // 记录测试结果
  logTest(name, passed, message, details = null) {
    const result = { name, passed, message, details, timestamp: new Date().toISOString() }
    this.results.tests.push(result)
    
    if (passed) {
      this.results.passed++
      console.log(`✅ ${name}: ${message}`)
    } else {
      this.results.failed++
      console.log(`❌ ${name}: ${message}`)
      if (details) {
        console.log(`   详情: ${JSON.stringify(details, null, 2)}`)
      }
    }
  }

  // 测试网站基本访问
  async testBasicAccess() {
    try {
      const response = await this.makeRequest('/')
      const passed = response.status === 200
      this.logTest(
        '网站基本访问',
        passed,
        passed ? '网站可以正常访问' : `HTTP状态码: ${response.status}`,
        { status: response.status, url: response.url }
      )
      return passed
    } catch (error) {
      this.logTest('网站基本访问', false, `访问失败: ${error.message}`, { error: error.message })
      return false
    }
  }

  // 测试API健康检查
  async testApiHealth() {
    try {
      const response = await this.makeRequest('/api/files')
      const passed = response.status === 200
      
      if (passed) {
        try {
          const data = JSON.parse(response.data)
          this.logTest(
            'API健康检查',
            true,
            `API正常响应，返回${data.data?.files?.length || 0}个文件`,
            { status: response.status, fileCount: data.data?.files?.length || 0 }
          )
        } catch (parseError) {
          this.logTest('API健康检查', false, 'API响应格式错误', { error: parseError.message })
          return false
        }
      } else {
        this.logTest('API健康检查', false, `API响应异常: ${response.status}`, { status: response.status })
      }
      
      return passed
    } catch (error) {
      this.logTest('API健康检查', false, `API请求失败: ${error.message}`, { error: error.message })
      return false
    }
  }

  // 测试数据库连接
  async testDatabaseConnection() {
    try {
      const response = await this.makeRequest('/api/files?limit=1')
      const passed = response.status === 200
      
      if (passed) {
        try {
          const data = JSON.parse(response.data)
          const hasValidStructure = data.success !== undefined && data.data !== undefined
          this.logTest(
            '数据库连接',
            hasValidStructure,
            hasValidStructure ? '数据库连接正常' : '数据库响应结构异常',
            { status: response.status, structure: hasValidStructure }
          )
          return hasValidStructure
        } catch (parseError) {
          this.logTest('数据库连接', false, '数据库响应解析失败', { error: parseError.message })
          return false
        }
      } else {
        this.logTest('数据库连接', false, `数据库查询失败: ${response.status}`, { status: response.status })
        return false
      }
    } catch (error) {
      this.logTest('数据库连接', false, `数据库连接测试失败: ${error.message}`, { error: error.message })
      return false
    }
  }

  // 测试管理员权限验证
  async testAdminAuth() {
    try {
      // 测试无权限访问
      const unauthorizedResponse = await this.makeRequest('/api/files', {
        method: 'DELETE',
        headers: {}
      })
      
      const unauthorizedPassed = unauthorizedResponse.status === 401
      this.logTest(
        '管理员权限-无权限',
        unauthorizedPassed,
        unauthorizedPassed ? '正确拒绝无权限请求' : '权限验证异常',
        { status: unauthorizedResponse.status }
      )

      // 测试错误密钥
      const wrongKeyResponse = await this.makeRequest('/api/files', {
        method: 'DELETE',
        headers: { 'x-admin-key': 'wrong-key' }
      })
      
      const wrongKeyPassed = wrongKeyResponse.status === 401
      this.logTest(
        '管理员权限-错误密钥',
        wrongKeyPassed,
        wrongKeyPassed ? '正确拒绝错误密钥' : '密钥验证异常',
        { status: wrongKeyResponse.status }
      )

      return unauthorizedPassed && wrongKeyPassed
    } catch (error) {
      this.logTest('管理员权限验证', false, `权限测试失败: ${error.message}`, { error: error.message })
      return false
    }
  }

  // 测试文件搜索功能
  async testFileSearch() {
    try {
      const response = await this.makeRequest('/api/files?search=test&limit=5')
      const passed = response.status === 200
      
      if (passed) {
        try {
          const data = JSON.parse(response.data)
          this.logTest(
            '文件搜索功能',
            true,
            `搜索功能正常，找到${data.data?.files?.length || 0}个结果`,
            { status: response.status, resultCount: data.data?.files?.length || 0 }
          )
        } catch (parseError) {
          this.logTest('文件搜索功能', false, '搜索响应解析失败', { error: parseError.message })
          return false
        }
      } else {
        this.logTest('文件搜索功能', false, `搜索请求失败: ${response.status}`, { status: response.status })
      }
      
      return passed
    } catch (error) {
      this.logTest('文件搜索功能', false, `搜索测试失败: ${error.message}`, { error: error.message })
      return false
    }
  }

  // 测试API响应时间
  async testApiPerformance() {
    const startTime = Date.now()
    try {
      const response = await this.makeRequest('/api/files?limit=10')
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      const passed = response.status === 200 && responseTime < 5000 // 5秒内
      this.logTest(
        'API响应性能',
        passed,
        `响应时间: ${responseTime}ms ${passed ? '(良好)' : '(较慢)'}`,
        { responseTime, status: response.status, threshold: 5000 }
      )
      
      return passed
    } catch (error) {
      const endTime = Date.now()
      const responseTime = endTime - startTime
      this.logTest('API响应性能', false, `性能测试失败: ${error.message}`, { responseTime, error: error.message })
      return false
    }
  }

  // 测试安全头部
  async testSecurityHeaders() {
    try {
      const response = await this.makeRequest('/')
      const headers = response.headers
      
      const requiredHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection'
      ]
      
      const missingHeaders = requiredHeaders.filter(header => !headers[header])
      const passed = missingHeaders.length === 0
      
      this.logTest(
        '安全头部配置',
        passed,
        passed ? '所有安全头部已配置' : `缺少安全头部: ${missingHeaders.join(', ')}`,
        { presentHeaders: requiredHeaders.filter(h => headers[h]), missingHeaders }
      )
      
      return passed
    } catch (error) {
      this.logTest('安全头部配置', false, `安全头部检查失败: ${error.message}`, { error: error.message })
      return false
    }
  }

  // 运行所有测试
  async runAllTests() {
    console.log(`🧪 开始验证部署: ${this.baseUrl}`)
    console.log('=' * 50)
    
    const tests = [
      () => this.testBasicAccess(),
      () => this.testApiHealth(),
      () => this.testDatabaseConnection(),
      () => this.testAdminAuth(),
      () => this.testFileSearch(),
      () => this.testApiPerformance(),
      () => this.testSecurityHeaders()
    ]

    for (const test of tests) {
      await test()
      await new Promise(resolve => setTimeout(resolve, 1000)) // 1秒间隔
    }

    this.printSummary()
    return this.results
  }

  // 打印测试总结
  printSummary() {
    console.log('\n' + '=' * 50)
    console.log('📊 测试总结')
    console.log('=' * 50)
    console.log(`✅ 通过: ${this.results.passed}`)
    console.log(`❌ 失败: ${this.results.failed}`)
    console.log(`📈 成功率: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`)
    
    if (this.results.failed > 0) {
      console.log('\n❌ 失败的测试:')
      this.results.tests
        .filter(test => !test.passed)
        .forEach(test => console.log(`   - ${test.name}: ${test.message}`))
    }
    
    console.log(`\n🎯 部署验证${this.results.failed === 0 ? '成功' : '需要修复'}!`)
  }
}

// 命令行使用
async function main() {
  const args = process.argv.slice(2)
  const baseUrl = args[0] || 'http://localhost:3000'
  const adminKey = args[1] || process.env.ADMIN_SECRET_KEY || 'your-admin-secret-key-here'
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Vercel部署验证脚本使用说明:')
    console.log('')
    console.log('用法:')
    console.log('  node scripts/verify-deployment.js [URL] [ADMIN_KEY]')
    console.log('')
    console.log('参数:')
    console.log('  URL        网站URL (默认: http://localhost:3000)')
    console.log('  ADMIN_KEY  管理员密钥 (默认: 从环境变量读取)')
    console.log('')
    console.log('示例:')
    console.log('  node scripts/verify-deployment.js https://opening.icu admin-key')
    console.log('  node scripts/verify-deployment.js http://localhost:3000')
    return
  }
  
  console.log(`🔍 验证目标: ${baseUrl}`)
  console.log(`🔑 管理员密钥: ${adminKey ? '已配置' : '未配置'}`)
  console.log('')
  
  const verifier = new DeploymentVerifier(baseUrl, adminKey)
  const results = await verifier.runAllTests()
  
  // 保存测试结果
  const fs = require('fs')
  const resultsFile = `deployment-verification-${Date.now()}.json`
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2))
  console.log(`\n📄 详细结果已保存到: ${resultsFile}`)
  
  process.exit(results.failed > 0 ? 1 : 0)
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { DeploymentVerifier }