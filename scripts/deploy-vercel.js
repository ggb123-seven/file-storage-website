// Vercel部署脚本
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

async function deployToVercel() {
  try {
    console.log('🚀 开始Vercel部署流程...')
    
    // 检查必需文件
    console.log('📋 检查部署文件...')
    const requiredFiles = [
      'package.json',
      'vercel.json',
      'next.config.ts',
      '.vercelignore'
    ]
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`缺少必需文件: ${file}`)
      }
      console.log(`✅ ${file} 存在`)
    }
    
    // 检查环境变量配置
    console.log('🔧 检查环境变量配置...')
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'))
    const envVars = Object.keys(vercelConfig.env || {})
    
    console.log('📝 需要在Vercel控制台配置的环境变量:')
    envVars.forEach(env => {
      console.log(`   - ${env}`)
    })
    
    // 检查依赖
    console.log('📦 检查项目依赖...')
    try {
      execSync('npm list --depth=0', { stdio: 'pipe' })
      console.log('✅ 依赖检查通过')
    } catch (error) {
      console.log('⚠️  依赖可能有问题，但继续部署...')
    }
    
    // 构建测试
    console.log('🔨 测试构建...')
    try {
      execSync('npm run build', { stdio: 'inherit' })
      console.log('✅ 构建测试成功')
    } catch (error) {
      throw new Error('构建失败，请检查代码')
    }
    
    // 检查Vercel CLI
    console.log('🔍 检查Vercel CLI...')
    try {
      execSync('vercel --version', { stdio: 'pipe' })
      console.log('✅ Vercel CLI 已安装')
    } catch (error) {
      console.log('❌ Vercel CLI 未安装')
      console.log('💡 请运行: npm install -g vercel')
      return
    }
    
    // 部署到Vercel
    console.log('🚀 开始部署到Vercel...')
    console.log('📝 请按照提示完成部署配置')
    
    try {
      execSync('vercel --prod', { stdio: 'inherit' })
      console.log('🎉 部署完成!')
    } catch (error) {
      console.log('❌ 部署失败')
      console.log('💡 请检查Vercel配置和环境变量')
      throw error
    }
    
    // 部署后检查
    console.log('🔍 部署后检查...')
    console.log('📋 请手动验证以下功能:')
    console.log('   1. 网站可以正常访问')
    console.log('   2. 文件列表加载正常')
    console.log('   3. 文件上传功能正常（需要管理员密钥）')
    console.log('   4. 文件下载功能正常')
    console.log('   5. 数据库连接正常')
    
    console.log('✅ Vercel部署流程完成!')
    
  } catch (error) {
    console.error('❌ 部署失败:', error.message)
    process.exit(1)
  }
}

// 显示部署前检查清单
function showPreDeploymentChecklist() {
  console.log('📋 部署前检查清单:')
  console.log('')
  console.log('🔧 Vercel控制台配置:')
  console.log('   □ 已注册Vercel账号')
  console.log('   □ 已连接GitHub仓库')
  console.log('   □ 已创建Vercel项目')
  console.log('')
  console.log('🗄️ 数据库准备:')
  console.log('   □ 已创建Vercel Postgres数据库')
  console.log('   □ 已获取数据库连接字符串')
  console.log('   □ 已配置DATABASE_URL环境变量')
  console.log('')
  console.log('☁️ Cloudinary配置:')
  console.log('   □ 已注册Cloudinary账号')
  console.log('   □ 已获取API密钥')
  console.log('   □ 已配置Cloudinary环境变量')
  console.log('')
  console.log('🔐 安全配置:')
  console.log('   □ 已生成强管理员密钥')
  console.log('   □ 已配置NEXTAUTH_SECRET')
  console.log('   □ 已配置域名相关变量')
  console.log('')
  console.log('如果以上都已完成，运行: node scripts/deploy-vercel.js')
}

// 命令行参数处理
const args = process.argv.slice(2)

if (args.includes('--check') || args.includes('-c')) {
  showPreDeploymentChecklist()
} else if (args.includes('--help') || args.includes('-h')) {
  console.log('Vercel部署脚本使用说明:')
  console.log('')
  console.log('命令:')
  console.log('  node scripts/deploy-vercel.js        执行部署')
  console.log('  node scripts/deploy-vercel.js -c     显示部署前检查清单')
  console.log('  node scripts/deploy-vercel.js -h     显示帮助信息')
} else {
  deployToVercel()
}

module.exports = { deployToVercel, showPreDeploymentChecklist }