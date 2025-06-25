// 域名配置验证脚本
const dns = require('dns')
const https = require('https')
const http = require('http')

class DomainConfigChecker {
  constructor(domain) {
    this.domain = domain
    this.results = {
      domain: domain,
      timestamp: new Date().toISOString(),
      checks: [],
      summary: {
        passed: 0,
        failed: 0,
        warnings: 0
      }
    }
  }

  // 记录检查结果
  logResult(name, status, message, details = null) {
    const result = {
      name,
      status, // 'pass', 'fail', 'warning'
      message,
      details,
      timestamp: new Date().toISOString()
    }
    
    this.results.checks.push(result)
    
    const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️'
    console.log(`${icon} ${name}: ${message}`)
    
    if (details) {
      console.log(`   详情: ${JSON.stringify(details, null, 2)}`)
    }
    
    this.results.summary[status === 'pass' ? 'passed' : status === 'fail' ? 'failed' : 'warnings']++
  }

  // DNS A记录检查
  async checkARecord() {
    return new Promise((resolve) => {
      dns.resolve4(this.domain, (err, addresses) => {
        if (err) {
          this.logResult('DNS A记录', 'fail', `A记录解析失败: ${err.message}`, { error: err.code })
          resolve(false)
        } else {
          const vercelIPs = ['76.76.19.61', '76.223.126.88'] // Vercel常用IP
          const hasVercelIP = addresses.some(ip => vercelIPs.includes(ip))
          
          if (hasVercelIP) {
            this.logResult('DNS A记录', 'pass', `A记录正确指向Vercel: ${addresses.join(', ')}`, { addresses })
          } else {
            this.logResult('DNS A记录', 'warning', `A记录存在但可能不是Vercel IP: ${addresses.join(', ')}`, { addresses })
          }
          resolve(true)
        }
      })
    })
  }

  // DNS CNAME记录检查 (www子域名)
  async checkCNAMERecord() {
    const wwwDomain = `www.${this.domain}`
    return new Promise((resolve) => {
      dns.resolveCname(wwwDomain, (err, addresses) => {
        if (err) {
          this.logResult('DNS CNAME记录', 'warning', `www子域名CNAME记录未配置: ${err.message}`, { error: err.code })
          resolve(false)
        } else {
          const hasVercelCNAME = addresses.some(addr => addr.includes('vercel'))
          
          if (hasVercelCNAME) {
            this.logResult('DNS CNAME记录', 'pass', `www子域名CNAME记录正确: ${addresses.join(', ')}`, { addresses })
          } else {
            this.logResult('DNS CNAME记录', 'warning', `www子域名CNAME记录存在但可能不正确: ${addresses.join(', ')}`, { addresses })
          }
          resolve(true)
        }
      })
    })
  }

  // HTTP访问检查
  async checkHTTPAccess() {
    return new Promise((resolve) => {
      const req = http.request(`http://${this.domain}`, { timeout: 10000 }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400) {
          this.logResult('HTTP访问', 'pass', `HTTP正确重定向到HTTPS (${res.statusCode})`, { 
            statusCode: res.statusCode,
            location: res.headers.location 
          })
        } else {
          this.logResult('HTTP访问', 'warning', `HTTP响应异常 (${res.statusCode})`, { statusCode: res.statusCode })
        }
        resolve(true)
      })

      req.on('error', (err) => {
        this.logResult('HTTP访问', 'fail', `HTTP访问失败: ${err.message}`, { error: err.code })
        resolve(false)
      })

      req.on('timeout', () => {
        this.logResult('HTTP访问', 'fail', 'HTTP访问超时', { timeout: 10000 })
        req.destroy()
        resolve(false)
      })

      req.end()
    })
  }

  // HTTPS访问检查
  async checkHTTPSAccess() {
    return new Promise((resolve) => {
      const req = https.request(`https://${this.domain}`, { timeout: 10000 }, (res) => {
        if (res.statusCode === 200) {
          this.logResult('HTTPS访问', 'pass', `HTTPS访问正常 (${res.statusCode})`, { 
            statusCode: res.statusCode,
            headers: {
              'content-type': res.headers['content-type'],
              'server': res.headers['server']
            }
          })
        } else {
          this.logResult('HTTPS访问', 'warning', `HTTPS响应异常 (${res.statusCode})`, { statusCode: res.statusCode })
        }
        resolve(true)
      })

      req.on('error', (err) => {
        this.logResult('HTTPS访问', 'fail', `HTTPS访问失败: ${err.message}`, { error: err.code })
        resolve(false)
      })

      req.on('timeout', () => {
        this.logResult('HTTPS访问', 'fail', 'HTTPS访问超时', { timeout: 10000 })
        req.destroy()
        resolve(false)
      })

      req.end()
    })
  }

  // SSL证书检查
  async checkSSLCertificate() {
    return new Promise((resolve) => {
      const req = https.request(`https://${this.domain}`, { 
        timeout: 10000,
        rejectUnauthorized: false // 允许检查证书详情
      }, (res) => {
        const cert = res.socket.getPeerCertificate()
        
        if (cert && cert.subject) {
          const validFrom = new Date(cert.valid_from)
          const validTo = new Date(cert.valid_to)
          const now = new Date()
          const daysUntilExpiry = Math.floor((validTo - now) / (1000 * 60 * 60 * 24))
          
          if (now >= validFrom && now <= validTo) {
            this.logResult('SSL证书', 'pass', `SSL证书有效，${daysUntilExpiry}天后到期`, {
              subject: cert.subject.CN,
              issuer: cert.issuer.CN,
              validFrom: cert.valid_from,
              validTo: cert.valid_to,
              daysUntilExpiry
            })
          } else {
            this.logResult('SSL证书', 'fail', 'SSL证书已过期或尚未生效', {
              validFrom: cert.valid_from,
              validTo: cert.valid_to
            })
          }
        } else {
          this.logResult('SSL证书', 'fail', 'SSL证书信息获取失败', { cert })
        }
        resolve(true)
      })

      req.on('error', (err) => {
        this.logResult('SSL证书', 'fail', `SSL证书检查失败: ${err.message}`, { error: err.code })
        resolve(false)
      })

      req.on('timeout', () => {
        this.logResult('SSL证书', 'fail', 'SSL证书检查超时', { timeout: 10000 })
        req.destroy()
        resolve(false)
      })

      req.end()
    })
  }

  // API端点检查
  async checkAPIEndpoints() {
    const endpoints = [
      '/api/files',
      '/api/stats'
    ]

    let passedCount = 0
    
    for (const endpoint of endpoints) {
      try {
        const response = await this.makeHTTPSRequest(endpoint)
        if (response.statusCode === 200) {
          passedCount++
        }
      } catch (error) {
        // 错误已在makeHTTPSRequest中记录
      }
    }

    if (passedCount === endpoints.length) {
      this.logResult('API端点', 'pass', `所有API端点正常 (${passedCount}/${endpoints.length})`, { 
        endpoints,
        passedCount 
      })
    } else if (passedCount > 0) {
      this.logResult('API端点', 'warning', `部分API端点异常 (${passedCount}/${endpoints.length})`, { 
        endpoints,
        passedCount 
      })
    } else {
      this.logResult('API端点', 'fail', `所有API端点异常 (${passedCount}/${endpoints.length})`, { 
        endpoints,
        passedCount 
      })
    }
  }

  // 辅助方法：发送HTTPS请求
  async makeHTTPSRequest(path) {
    return new Promise((resolve, reject) => {
      const req = https.request(`https://${this.domain}${path}`, { timeout: 5000 }, (res) => {
        resolve({ statusCode: res.statusCode, headers: res.headers })
      })

      req.on('error', reject)
      req.on('timeout', () => {
        req.destroy()
        reject(new Error('Request timeout'))
      })

      req.end()
    })
  }

  // DNS传播检查
  async checkDNSPropagation() {
    const dnsServers = [
      '8.8.8.8',      // Google
      '1.1.1.1',      // Cloudflare
      '208.67.222.222', // OpenDNS
      '114.114.114.114' // 114 DNS
    ]

    let propagatedCount = 0
    const results = []

    for (const server of dnsServers) {
      try {
        const addresses = await this.queryDNSServer(server)
        results.push({ server, addresses, status: 'success' })
        propagatedCount++
      } catch (error) {
        results.push({ server, error: error.message, status: 'failed' })
      }
    }

    if (propagatedCount === dnsServers.length) {
      this.logResult('DNS传播', 'pass', `DNS已在所有服务器传播 (${propagatedCount}/${dnsServers.length})`, { results })
    } else if (propagatedCount > dnsServers.length / 2) {
      this.logResult('DNS传播', 'warning', `DNS部分传播 (${propagatedCount}/${dnsServers.length})`, { results })
    } else {
      this.logResult('DNS传播', 'fail', `DNS传播不足 (${propagatedCount}/${dnsServers.length})`, { results })
    }
  }

  // 查询指定DNS服务器
  async queryDNSServer(server) {
    return new Promise((resolve, reject) => {
      const resolver = new dns.Resolver()
      resolver.setServers([server])
      
      resolver.resolve4(this.domain, (err, addresses) => {
        if (err) {
          reject(err)
        } else {
          resolve(addresses)
        }
      })
    })
  }

  // 运行所有检查
  async runAllChecks() {
    console.log(`🔍 开始检查域名配置: ${this.domain}`)
    console.log('=' * 60)

    const checks = [
      () => this.checkARecord(),
      () => this.checkCNAMERecord(),
      () => this.checkDNSPropagation(),
      () => this.checkHTTPAccess(),
      () => this.checkHTTPSAccess(),
      () => this.checkSSLCertificate(),
      () => this.checkAPIEndpoints()
    ]

    for (const check of checks) {
      try {
        await check()
        await new Promise(resolve => setTimeout(resolve, 1000)) // 1秒间隔
      } catch (error) {
        console.error(`检查过程中出错: ${error.message}`)
      }
    }

    this.printSummary()
    return this.results
  }

  // 打印总结
  printSummary() {
    console.log('\n' + '=' * 60)
    console.log('📊 域名配置检查总结')
    console.log('=' * 60)
    
    const { passed, failed, warnings } = this.results.summary
    const total = passed + failed + warnings
    
    console.log(`✅ 通过: ${passed}`)
    console.log(`❌ 失败: ${failed}`)
    console.log(`⚠️ 警告: ${warnings}`)
    console.log(`📈 成功率: ${((passed / total) * 100).toFixed(1)}%`)
    
    if (failed === 0 && warnings <= 1) {
      console.log('\n🎉 域名配置完成，可以正常使用!')
    } else if (failed === 0) {
      console.log('\n✅ 域名基本配置正确，有少量警告')
    } else {
      console.log('\n❌ 域名配置存在问题，需要修复')
      
      console.log('\n需要修复的问题:')
      this.results.checks
        .filter(check => check.status === 'fail')
        .forEach(check => console.log(`   - ${check.name}: ${check.message}`))
    }
    
    console.log(`\n🕒 检查时间: ${this.results.timestamp}`)
    console.log(`🌐 检查域名: ${this.domain}`)
  }
}

// 命令行使用
async function main() {
  const args = process.argv.slice(2)
  const domain = args[0] || 'opening.icu'
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('域名配置检查脚本使用说明:')
    console.log('')
    console.log('用法:')
    console.log('  node scripts/check-domain-config.js [DOMAIN]')
    console.log('')
    console.log('参数:')
    console.log('  DOMAIN  要检查的域名 (默认: opening.icu)')
    console.log('')
    console.log('示例:')
    console.log('  node scripts/check-domain-config.js opening.icu')
    console.log('  node scripts/check-domain-config.js example.com')
    return
  }
  
  console.log(`🎯 检查目标域名: ${domain}`)
  console.log('')
  
  const checker = new DomainConfigChecker(domain)
  const results = await checker.runAllChecks()
  
  // 保存检查结果
  const fs = require('fs')
  const resultsFile = `domain-check-${domain}-${Date.now()}.json`
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2))
  console.log(`\n📄 详细结果已保存到: ${resultsFile}`)
  
  process.exit(results.summary.failed > 0 ? 1 : 0)
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { DomainConfigChecker }