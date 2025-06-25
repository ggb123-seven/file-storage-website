// 快速部署到Vercel的指导脚本
const { execSync } = require('child_process')
const fs = require('fs')

console.log('🚀 Vercel部署指导助手')
console.log('=' * 40)

// 检查是否有git仓库
if (!fs.existsSync('.git')) {
  console.log('📋 步骤1: 初始化Git仓库')
  console.log('请运行以下命令:')
  console.log('git init')
  console.log('git add .')
  console.log('git commit -m "Initial commit: File storage website"')
  console.log('')
} else {
  console.log('✅ Git仓库已存在')
}

// 检查是否有远程仓库
try {
  const remotes = execSync('git remote -v', { encoding: 'utf8' })
  if (remotes.trim()) {
    console.log('✅ 远程仓库已配置')
    console.log('远程仓库:', remotes.trim().split('\n')[0])
  } else {
    console.log('📋 步骤2: 配置远程仓库')
    console.log('1. 在GitHub创建新仓库: https://github.com/new')
    console.log('2. 仓库名建议: file-storage-website')
    console.log('3. 运行: git remote add origin YOUR_REPO_URL')
    console.log('4. 运行: git push -u origin main')
  }
} catch (error) {
  console.log('⚠️  无法检查远程仓库状态')
}

console.log('')
console.log('📋 步骤3: 在Vercel部署')
console.log('1. 访问: https://vercel.com/dashboard')
console.log('2. 点击 "New Project"')
console.log('3. 选择 "Import Git Repository"')
console.log('4. 选择您的GitHub仓库')
console.log('5. 点击 "Import" 开始部署')
console.log('')
console.log('⏳ 部署完成后，您会获得一个 .vercel.app 域名')
console.log('🎯 然后就可以继续域名配置向导了！')