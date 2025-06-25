// 部署状态检查脚本
const fs = require('fs')
const path = require('path')

class DeploymentStatusChecker {
  constructor() {
    this.checks = []
    this.status = {
      ready: true,
      warnings: [],
      errors: [],
      summary: {}
    }
  }

  // 添加检查项
  addCheck(name, checkFn, required = true) {
    this.checks.push({ name, checkFn, required })
  }

  // 记录结果
  logResult(name, passed, message, required = true) {
    const result = { name, passed, message, required }
    
    if (passed) {
      console.log(`✅ ${name}: ${message}`)
    } else {
      console.log(`${required ? '❌' : '⚠️'} ${name}: ${message}`)
      if (required) {
        this.status.ready = false
        this.status.errors.push(result)
      } else {
        this.status.warnings.push(result)
      }
    }
  }

  // 检查必需文件
  checkRequiredFiles() {
    const requiredFiles = [
      { file: 'package.json', desc: '项目配置文件' },
      { file: 'vercel.json', desc: 'Vercel部署配置' },
      { file: 'next.config.ts', desc: 'Next.js配置文件' },
      { file: '.vercelignore', desc: 'Vercel忽略文件' },
      { file: 'src/app/layout.tsx', desc: '应用布局文件' },
      { file: 'src/app/page.tsx', desc: '首页文件' },
      { file: 'prisma/schema.prisma', desc: 'Prisma数据库模式' }
    ]

    let allPresent = true
    for (const { file, desc } of requiredFiles) {
      const exists = fs.existsSync(file)
      this.logResult(`文件检查 - ${desc}`, exists, exists ? '文件存在' : `缺少文件: ${file}`)
      if (!exists) allPresent = false
    }

    return allPresent
  }

  // 检查package.json配置
  checkPackageJson() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
      
      // 检查必需的脚本
      const requiredScripts = ['build', 'start', 'dev']
      const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script])
      
      if (missingScripts.length === 0) {
        this.logResult('package.json脚本', true, '所有必需脚本已配置')
      } else {
        this.logResult('package.json脚本', false, `缺少脚本: ${missingScripts.join(', ')}`)
        return false
      }

      // 检查必需的依赖
      const requiredDeps = ['next', 'react', '@prisma/client', 'cloudinary']
      const missingDeps = requiredDeps.filter(dep => 
        !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
      )
      
      if (missingDeps.length === 0) {
        this.logResult('package.json依赖', true, '所有必需依赖已安装')
      } else {
        this.logResult('package.json依赖', false, `缺少依赖: ${missingDeps.join(', ')}`)
        return false
      }

      return true
    } catch (error) {
      this.logResult('package.json检查', false, `读取失败: ${error.message}`)
      return false
    }
  }

  // 检查vercel.json配置
  checkVercelConfig() {
    try {
      const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'))
      
      // 检查基本配置
      const hasVersion = vercelConfig.version === 2
      this.logResult('Vercel版本配置', hasVersion, hasVersion ? 'Vercel配置版本正确' : 'Vercel配置版本错误')
      
      // 检查环境变量配置
      const requiredEnvs = [
        'DATABASE_URL',
        'ADMIN_SECRET_KEY',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET'
      ]
      
      const configuredEnvs = Object.keys(vercelConfig.env || {})
      const missingEnvs = requiredEnvs.filter(env => !configuredEnvs.includes(env))
      
      if (missingEnvs.length === 0) {
        this.logResult('Vercel环境变量', true, '所有必需环境变量已配置')
      } else {
        this.logResult('Vercel环境变量', false, `缺少环境变量: ${missingEnvs.join(', ')}`)
        return false
      }

      // 检查函数配置
      const hasFunctionConfig = vercelConfig.functions && vercelConfig.functions['src/app/api/**/*.ts']
      this.logResult('Vercel函数配置', hasFunctionConfig, hasFunctionConfig ? '函数配置已设置' : '缺少函数配置')

      return hasVersion && missingEnvs.length === 0 && hasFunctionConfig
    } catch (error) {
      this.logResult('vercel.json检查', false, `读取失败: ${error.message}`)
      return false
    }
  }

  // 检查Next.js配置
  checkNextConfig() {
    try {
      // 检查文件是否存在
      if (!fs.existsSync('next.config.ts')) {
        this.logResult('Next.js配置', false, 'next.config.ts文件不存在')
        return false
      }

      // 读取配置内容
      const configContent = fs.readFileSync('next.config.ts', 'utf8')
      
      // 检查关键配置
      const hasCloudinaryConfig = configContent.includes('res.cloudinary.com')
      this.logResult('Cloudinary图片配置', hasCloudinaryConfig, hasCloudinaryConfig ? 'Cloudinary图片域名已配置' : '缺少Cloudinary图片配置')

      const hasPrismaConfig = configContent.includes('prisma')
      this.logResult('Prisma外部包配置', hasPrismaConfig, hasPrismaConfig ? 'Prisma外部包已配置' : '缺少Prisma配置')

      return hasCloudinaryConfig && hasPrismaConfig
    } catch (error) {
      this.logResult('Next.js配置检查', false, `读取失败: ${error.message}`)
      return false
    }
  }

  // 检查Prisma配置
  checkPrismaConfig() {
    try {
      const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8')
      
      // 检查数据库提供商
      const isPostgreSQL = schemaContent.includes('provider = "postgresql"')
      this.logResult('Prisma数据库提供商', isPostgreSQL, isPostgreSQL ? 'PostgreSQL配置正确' : '数据库提供商配置错误')

      // 检查数据模型
      const hasFileModel = schemaContent.includes('model File')
      this.logResult('Prisma数据模型', hasFileModel, hasFileModel ? 'File模型已定义' : '缺少File数据模型')

      return isPostgreSQL && hasFileModel
    } catch (error) {
      this.logResult('Prisma配置检查', false, `读取失败: ${error.message}`)
      return false
    }
  }

  // 检查API路由
  checkApiRoutes() {
    const apiRoutes = [
      { path: 'src/app/api/files/route.ts', desc: '文件列表API' },
      { path: 'src/app/api/upload/route.ts', desc: '文件上传API' },
      { path: 'src/app/api/download/[id]/route.ts', desc: '文件下载API' }
    ]

    let allPresent = true
    for (const { path, desc } of apiRoutes) {
      const exists = fs.existsSync(path)
      this.logResult(`API路由 - ${desc}`, exists, exists ? 'API路由存在' : `缺少API路由: ${path}`)
      if (!exists) allPresent = false
    }

    return allPresent
  }

  // 检查环境变量示例
  checkEnvExample() {
    const hasEnvExample = fs.existsSync('.env.example')
    this.logResult('环境变量示例', hasEnvExample, hasEnvExample ? '环境变量示例文件存在' : '建议创建.env.example文件', false)
    return hasEnvExample
  }

  // 检查文档
  checkDocumentation() {
    const docs = [
      { file: 'README.md', desc: '项目说明文档' },
      { file: 'docs/VERCEL_ENV_SETUP.md', desc: 'Vercel环境配置指南' },
      { file: 'DEPLOYMENT_CHECKLIST.md', desc: '部署检查清单' }
    ]

    let score = 0
    for (const { file, desc } of docs) {
      const exists = fs.existsSync(file)
      this.logResult(`文档 - ${desc}`, exists, exists ? '文档存在' : `建议创建: ${file}`, false)
      if (exists) score++
    }

    return score >= 2 // 至少有2个文档
  }

  // 运行所有检查
  async runAllChecks() {
    console.log('🔍 开始检查部署准备状态...')
    console.log('=' * 50)

    const checks = [
      { name: '必需文件检查', fn: () => this.checkRequiredFiles() },
      { name: 'package.json配置', fn: () => this.checkPackageJson() },
      { name: 'vercel.json配置', fn: () => this.checkVercelConfig() },
      { name: 'Next.js配置', fn: () => this.checkNextConfig() },
      { name: 'Prisma配置', fn: () => this.checkPrismaConfig() },
      { name: 'API路由检查', fn: () => this.checkApiRoutes() },
      { name: '环境变量示例', fn: () => this.checkEnvExample(), required: false },
      { name: '文档完整性', fn: () => this.checkDocumentation(), required: false }
    ]

    let passedCount = 0
    let totalRequired = 0

    for (const check of checks) {
      const required = check.required !== false
      if (required) totalRequired++

      try {
        const result = await check.fn()
        if (result && required) passedCount++
      } catch (error) {
        this.logResult(check.name, false, `检查失败: ${error.message}`, required)
      }
    }

    this.status.summary = {
      passedRequired: passedCount,
      totalRequired: totalRequired,
      warnings: this.status.warnings.length,
      errors: this.status.errors.length
    }

    this.printSummary()
    return this.status
  }

  // 打印总结
  printSummary() {
    console.log('\n' + '=' * 50)
    console.log('📊 部署准备状态总结')
    console.log('=' * 50)
    
    const { passedRequired, totalRequired, warnings, errors } = this.status.summary
    
    console.log(`✅ 必需检查通过: ${passedRequired}/${totalRequired}`)
    console.log(`⚠️ 警告: ${warnings}`)
    console.log(`❌ 错误: ${errors}`)
    
    if (this.status.ready) {
      console.log('\n🎉 项目已准备好部署到Vercel!')
      console.log('\n📋 下一步操作:')
      console.log('1. 确保已注册Vercel账号并连接GitHub')
      console.log('2. 在Vercel控制台配置环境变量')
      console.log('3. 运行: npm run deploy 或 vercel --prod')
    } else {
      console.log('\n❌ 项目尚未准备好部署，请修复以下问题:')
      this.status.errors.forEach(error => {
        console.log(`   - ${error.name}: ${error.message}`)
      })
    }

    if (warnings > 0) {
      console.log('\n⚠️ 建议修复的警告:')
      this.status.warnings.forEach(warning => {
        console.log(`   - ${warning.name}: ${warning.message}`)
      })
    }
  }
}

// 命令行使用
async function main() {
  const checker = new DeploymentStatusChecker()
  const status = await checker.runAllChecks()
  
  // 保存检查结果
  const resultsFile = `deployment-status-${Date.now()}.json`
  fs.writeFileSync(resultsFile, JSON.stringify(status, null, 2))
  console.log(`\n📄 详细结果已保存到: ${resultsFile}`)
  
  process.exit(status.ready ? 0 : 1)
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { DeploymentStatusChecker }