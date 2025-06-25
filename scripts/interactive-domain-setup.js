// 交互式域名配置向导
const readline = require('readline')
const { DomainConfigChecker } = require('./check-domain-config.js')

class InteractiveDomainSetup {
  constructor() {
    this.domain = 'opening.icu'
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    this.currentStep = 1
    this.totalSteps = 8
    this.config = {
      vercelIP: '76.76.19.61',
      vercelCNAME: 'cname.vercel-dns.com',
      completed: []
    }
  }

  // 显示欢迎信息
  showWelcome() {
    console.log('\n🎉 欢迎使用 opening.icu 域名配置向导!')
    console.log('=' * 60)
    console.log('我将逐步指导您完成域名配置，每一步都会有详细说明和验证。')
    console.log(`📋 总共 ${this.totalSteps} 个步骤，预计需要 30-60 分钟`)
    console.log('🔧 我会在每一步提供具体的操作指导和验证')
    console.log('❓ 如果遇到问题，我会立即提供解决方案')
    console.log('=' * 60)
  }

  // 询问用户输入
  async askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim())
      })
    })
  }

  // 等待用户确认
  async waitForConfirmation(message) {
    console.log(`\n${message}`)
    const answer = await this.askQuestion('完成后请输入 "y" 继续，或输入 "h" 获取帮助: ')
    
    if (answer.toLowerCase() === 'h') {
      await this.showHelp()
      return await this.waitForConfirmation(message)
    }
    
    return answer.toLowerCase() === 'y'
  }

  // 显示帮助信息
  async showHelp() {
    console.log('\n📞 需要帮助？')
    console.log('1. 如果遇到技术问题，请描述具体错误信息')
    console.log('2. 如果不确定如何操作，请告诉我您看到的界面')
    console.log('3. 我可以为您提供截图说明或详细步骤')
    console.log('4. 输入 "skip" 可以跳过当前步骤（不推荐）')
    
    await this.askQuestion('按回车键继续...')
  }

  // 步骤1: 检查前置条件
  async step1_checkPrerequisites() {
    console.log(`\n📋 步骤 ${this.currentStep}/${this.totalSteps}: 检查前置条件`)
    console.log('=' * 40)
    
    console.log('✅ 检查以下条件是否满足:')
    console.log('1. 您拥有 opening.icu 域名的管理权限')
    console.log('2. 您有 Vercel 账号并且项目已部署')
    console.log('3. 您可以修改域名的 DNS 设置')
    
    const hasAccess = await this.askQuestion('您是否满足以上所有条件？(y/n): ')
    
    if (hasAccess.toLowerCase() !== 'y') {
      console.log('\n❌ 请先确保满足前置条件后再继续配置')
      console.log('💡 如需帮助获取域名管理权限或创建Vercel账号，请告诉我')
      return false
    }
    
    console.log('✅ 前置条件检查通过!')
    this.config.completed.push('prerequisites')
    return true
  }

  // 步骤2: Vercel项目检查
  async step2_checkVercelProject() {
    console.log(`\n🚀 步骤 ${this.currentStep}/${this.totalSteps}: 检查Vercel项目状态`)
    console.log('=' * 40)
    
    console.log('请访问您的Vercel控制台检查项目状态:')
    console.log('🔗 https://vercel.com/dashboard')
    console.log('')
    console.log('确认以下信息:')
    console.log('1. 文件存储项目已成功部署')
    console.log('2. 项目状态显示为 "Ready"')
    console.log('3. 可以通过 .vercel.app 域名正常访问')
    
    const projectReady = await this.waitForConfirmation('✅ 项目状态正常，可以继续配置域名')
    
    if (projectReady) {
      console.log('✅ Vercel项目检查通过!')
      this.config.completed.push('vercel-project')
      return true
    }
    
    return false
  }

  // 步骤3: 添加自定义域名到Vercel
  async step3_addDomainToVercel() {
    console.log(`\n🌐 步骤 ${this.currentStep}/${this.totalSteps}: 在Vercel中添加自定义域名`)
    console.log('=' * 40)
    
    console.log('请按照以下步骤操作:')
    console.log('')
    console.log('1. 在Vercel控制台中，进入您的文件存储项目')
    console.log('2. 点击 "Settings" 标签页')
    console.log('3. 在左侧菜单中点击 "Domains"')
    console.log('4. 点击 "Add Domain" 按钮')
    console.log('5. 输入域名: opening.icu')
    console.log('6. 点击 "Add" 按钮确认')
    console.log('')
    console.log('⚠️  Vercel会显示域名状态为 "Invalid" 或 "Pending"，这是正常的')
    console.log('📝 Vercel会显示需要配置的DNS记录信息')
    
    const domainAdded = await this.waitForConfirmation('✅ 已在Vercel中添加 opening.icu 域名')
    
    if (domainAdded) {
      console.log('✅ Vercel域名添加完成!')
      console.log('📋 接下来我们需要配置DNS记录')
      this.config.completed.push('vercel-domain')
      return true
    }
    
    return false
  }

  // 步骤4: 配置DNS记录
  async step4_configureDNS() {
    console.log(`\n🔧 步骤 ${this.currentStep}/${this.totalSteps}: 配置DNS记录`)
    console.log('=' * 40)
    
    console.log('现在需要在您的域名提供商后台配置DNS记录:')
    console.log('')
    console.log('📋 需要添加的DNS记录:')
    console.log('')
    console.log('🔸 主域名A记录:')
    console.log(`   类型: A`)
    console.log(`   名称: @ (或留空)`)
    console.log(`   值: ${this.config.vercelIP}`)
    console.log(`   TTL: 300`)
    console.log('')
    console.log('🔸 www子域名CNAME记录:')
    console.log(`   类型: CNAME`)
    console.log(`   名称: www`)
    console.log(`   值: ${this.config.vercelCNAME}`)
    console.log(`   TTL: 300`)
    console.log('')
    
    const dnsProvider = await this.askQuestion('请告诉我您的域名提供商 (如: Cloudflare, 阿里云, 腾讯云等): ')
    
    if (dnsProvider.toLowerCase().includes('cloudflare')) {
      await this.showCloudflareInstructions()
    } else {
      await this.showGenericDNSInstructions()
    }
    
    const dnsConfigured = await this.waitForConfirmation('✅ 已配置DNS记录')
    
    if (dnsConfigured) {
      console.log('✅ DNS记录配置完成!')
      console.log('⏳ DNS传播通常需要5-30分钟')
      this.config.completed.push('dns-config')
      return true
    }
    
    return false
  }

  // Cloudflare特定说明
  async showCloudflareInstructions() {
    console.log('\n📘 Cloudflare DNS配置说明:')
    console.log('1. 登录 Cloudflare 控制台')
    console.log('2. 选择 opening.icu 域名')
    console.log('3. 进入 "DNS" → "Records" 页面')
    console.log('4. 添加A记录:')
    console.log('   - Type: A')
    console.log('   - Name: @')
    console.log(`   - IPv4 address: ${this.config.vercelIP}`)
    console.log('   - Proxy status: DNS only (灰色云朵)')
    console.log('5. 添加CNAME记录:')
    console.log('   - Type: CNAME')
    console.log('   - Name: www')
    console.log(`   - Target: ${this.config.vercelCNAME}`)
    console.log('   - Proxy status: DNS only (灰色云朵)')
    console.log('')
    console.log('⚠️  重要: 请确保代理状态设置为 "DNS only" (灰色云朵)')
  }

  // 通用DNS配置说明
  async showGenericDNSInstructions() {
    console.log('\n📘 通用DNS配置说明:')
    console.log('1. 登录您的域名提供商控制台')
    console.log('2. 找到 opening.icu 的DNS管理页面')
    console.log('3. 添加或修改以下记录:')
    console.log('')
    console.log('A记录配置:')
    console.log('   - 记录类型: A')
    console.log('   - 主机记录: @ (或留空)')
    console.log(`   - 记录值: ${this.config.vercelIP}`)
    console.log('   - TTL: 300 (或最小值)')
    console.log('')
    console.log('CNAME记录配置:')
    console.log('   - 记录类型: CNAME')
    console.log('   - 主机记录: www')
    console.log(`   - 记录值: ${this.config.vercelCNAME}`)
    console.log('   - TTL: 300 (或最小值)')
  }

  // 步骤5: 验证DNS传播
  async step5_verifyDNSPropagation() {
    console.log(`\n🔍 步骤 ${this.currentStep}/${this.totalSteps}: 验证DNS传播`)
    console.log('=' * 40)
    
    console.log('现在我们来检查DNS记录是否已经传播:')
    console.log('')
    
    // 运行DNS检查
    console.log('🧪 正在检查DNS配置...')
    try {
      const checker = new DomainConfigChecker(this.domain)
      await checker.checkARecord()
      await checker.checkCNAMERecord()
      await checker.checkDNSPropagation()
      
      console.log('\n📊 DNS检查完成!')
      
      const dnsWorking = await this.askQuestion('DNS检查是否显示配置正确？(y/n): ')
      
      if (dnsWorking.toLowerCase() === 'y') {
        console.log('✅ DNS传播验证通过!')
        this.config.completed.push('dns-propagation')
        return true
      } else {
        console.log('⏳ DNS可能还在传播中，我们可以继续等待或检查配置')
        const waitMore = await this.askQuestion('是否等待更长时间？(y/n): ')
        
        if (waitMore.toLowerCase() === 'y') {
          console.log('⏳ 请等待5-10分钟后重新运行检查')
          return false
        }
      }
    } catch (error) {
      console.log(`❌ DNS检查出错: ${error.message}`)
      console.log('💡 这可能是因为DNS还在传播中')
    }
    
    return false
  }

  // 步骤6: 等待Vercel验证
  async step6_waitVercelValidation() {
    console.log(`\n⏳ 步骤 ${this.currentStep}/${this.totalSteps}: 等待Vercel域名验证`)
    console.log('=' * 40)
    
    console.log('请回到Vercel控制台检查域名状态:')
    console.log('1. 进入项目设置 → Domains')
    console.log('2. 查看 opening.icu 的状态')
    console.log('3. 等待状态从 "Invalid" 变为 "Valid"')
    console.log('')
    console.log('⏳ 这个过程通常需要1-15分钟')
    console.log('🔄 如果状态仍为 "Invalid"，可以点击域名旁的刷新按钮')
    
    const vercelValid = await this.waitForConfirmation('✅ Vercel显示域名状态为 "Valid"')
    
    if (vercelValid) {
      console.log('✅ Vercel域名验证通过!')
      console.log('🔒 SSL证书将自动配置')
      this.config.completed.push('vercel-validation')
      return true
    }
    
    return false
  }

  // 步骤7: 更新环境变量
  async step7_updateEnvironmentVariables() {
    console.log(`\n🔧 步骤 ${this.currentStep}/${this.totalSteps}: 更新环境变量`)
    console.log('=' * 40)
    
    console.log('现在需要更新Vercel项目的环境变量:')
    console.log('')
    console.log('1. 在Vercel控制台，进入项目设置 → Environment Variables')
    console.log('2. 找到 NEXTAUTH_URL 变量，点击编辑')
    console.log('3. 将值更改为: https://opening.icu')
    console.log('4. 找到 DOMAIN_NAME 变量，点击编辑')
    console.log('5. 将值更改为: opening.icu')
    console.log('6. 保存更改')
    console.log('7. 触发重新部署 (Deployments → 最新部署 → Redeploy)')
    console.log('')
    console.log('📋 需要更新的环境变量:')
    console.log('   NEXTAUTH_URL = https://opening.icu')
    console.log('   DOMAIN_NAME = opening.icu')
    
    const envUpdated = await this.waitForConfirmation('✅ 已更新环境变量并重新部署')
    
    if (envUpdated) {
      console.log('✅ 环境变量更新完成!')
      this.config.completed.push('env-variables')
      return true
    }
    
    return false
  }

  // 步骤8: 最终验证
  async step8_finalVerification() {
    console.log(`\n🎯 步骤 ${this.currentStep}/${this.totalSteps}: 最终功能验证`)
    console.log('=' * 40)
    
    console.log('让我们验证所有功能是否正常工作:')
    console.log('')
    
    // 运行完整验证
    console.log('🧪 正在进行完整功能验证...')
    try {
      const checker = new DomainConfigChecker(this.domain)
      await checker.runAllChecks()
      
      console.log('\n🌐 请在浏览器中测试以下功能:')
      console.log('1. 访问 https://opening.icu')
      console.log('2. 检查网站是否正常加载')
      console.log('3. 测试文件列表是否显示')
      console.log('4. 测试文件搜索功能')
      console.log('5. 如果有管理员密钥，测试文件上传功能')
      
      const allWorking = await this.askQuestion('所有功能是否正常工作？(y/n): ')
      
      if (allWorking.toLowerCase() === 'y') {
        console.log('🎉 恭喜！域名配置完全成功!')
        this.config.completed.push('final-verification')
        return true
      } else {
        console.log('🔧 让我帮您诊断问题...')
        await this.troubleshootIssues()
      }
    } catch (error) {
      console.log(`❌ 验证过程出错: ${error.message}`)
      await this.troubleshootIssues()
    }
    
    return false
  }

  // 故障排除
  async troubleshootIssues() {
    console.log('\n🔧 故障排除助手')
    console.log('=' * 30)
    
    const issue = await this.askQuestion('请描述遇到的具体问题: ')
    
    if (issue.toLowerCase().includes('无法访问') || issue.toLowerCase().includes('打不开')) {
      console.log('\n💡 网站无法访问的可能原因:')
      console.log('1. DNS传播尚未完成 - 请等待更长时间')
      console.log('2. DNS记录配置错误 - 请检查A记录和CNAME记录')
      console.log('3. Vercel域名验证失败 - 请检查Vercel控制台状态')
    } else if (issue.toLowerCase().includes('ssl') || issue.toLowerCase().includes('证书')) {
      console.log('\n💡 SSL证书问题的解决方案:')
      console.log('1. 等待Vercel自动配置SSL证书 (最长15分钟)')
      console.log('2. 在Vercel控制台重新触发SSL配置')
      console.log('3. 确认DNS记录正确指向Vercel')
    } else if (issue.toLowerCase().includes('功能') || issue.toLowerCase().includes('api')) {
      console.log('\n💡 功能异常的解决方案:')
      console.log('1. 确认环境变量已正确更新')
      console.log('2. 确认项目已重新部署')
      console.log('3. 检查API端点是否响应正常')
    }
    
    console.log('\n📞 如需进一步帮助，请提供:')
    console.log('1. 具体的错误信息')
    console.log('2. Vercel控制台的状态截图')
    console.log('3. DNS配置的截图')
  }

  // 显示配置总结
  showSummary() {
    console.log('\n🎉 域名配置完成总结')
    console.log('=' * 50)
    console.log(`✅ 域名: ${this.domain}`)
    console.log(`✅ 完成步骤: ${this.config.completed.length}/${this.totalSteps}`)
    console.log('')
    console.log('🌐 您的网站现在可以通过以下地址访问:')
    console.log(`   https://${this.domain}`)
    console.log(`   https://www.${this.domain}`)
    console.log('')
    console.log('🔧 配置的DNS记录:')
    console.log(`   A记录: @ → ${this.config.vercelIP}`)
    console.log(`   CNAME记录: www → ${this.config.vercelCNAME}`)
    console.log('')
    console.log('🎯 功能验证:')
    console.log('   ✅ HTTPS访问')
    console.log('   ✅ SSL证书')
    console.log('   ✅ API端点')
    console.log('   ✅ 文件功能')
    console.log('')
    console.log('🎉 恭喜！opening.icu 域名配置完全成功!')
  }

  // 运行配置向导
  async runWizard() {
    this.showWelcome()
    
    const steps = [
      () => this.step1_checkPrerequisites(),
      () => this.step2_checkVercelProject(),
      () => this.step3_addDomainToVercel(),
      () => this.step4_configureDNS(),
      () => this.step5_verifyDNSPropagation(),
      () => this.step6_waitVercelValidation(),
      () => this.step7_updateEnvironmentVariables(),
      () => this.step8_finalVerification()
    ]
    
    for (let i = 0; i < steps.length; i++) {
      this.currentStep = i + 1
      
      const success = await steps[i]()
      
      if (!success) {
        console.log(`\n⏸️  步骤 ${this.currentStep} 未完成`)
        const retry = await this.askQuestion('是否重试此步骤？(y/n): ')
        
        if (retry.toLowerCase() === 'y') {
          i-- // 重试当前步骤
          continue
        } else {
          console.log('❌ 配置过程中断')
          console.log('💡 您可以稍后重新运行此向导继续配置')
          break
        }
      }
      
      console.log(`✅ 步骤 ${this.currentStep} 完成!`)
      
      if (i < steps.length - 1) {
        await this.askQuestion('\n按回车键继续下一步...')
      }
    }
    
    if (this.config.completed.length === this.totalSteps) {
      this.showSummary()
    }
    
    this.rl.close()
  }
}

// 命令行启动
if (require.main === module) {
  const wizard = new InteractiveDomainSetup()
  wizard.runWizard().catch(console.error)
}

module.exports = { InteractiveDomainSetup }