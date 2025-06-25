// 域名配置自动化脚本
const fs = require('fs')
const path = require('path')

class DomainSetupHelper {
  constructor(domain) {
    this.domain = domain
    this.config = {
      domain: domain,
      vercelIPs: ['76.76.19.61', '76.223.126.88'],
      vercelCNAME: 'cname.vercel-dns.com',
      setupSteps: []
    }
  }

  // 生成DNS配置信息
  generateDNSConfig() {
    const dnsConfig = {
      domain: this.domain,
      records: [
        {
          type: 'A',
          name: '@',
          value: this.config.vercelIPs[0],
          ttl: 300,
          description: '主域名指向Vercel'
        },
        {
          type: 'CNAME',
          name: 'www',
          value: this.config.vercelCNAME,
          ttl: 300,
          description: 'www子域名指向Vercel'
        }
      ],
      alternatives: [
        {
          type: 'CNAME',
          name: '@',
          value: this.config.vercelCNAME,
          ttl: 300,
          description: '主域名CNAME配置（某些DNS提供商支持）'
        }
      ]
    }

    return dnsConfig
  }

  // 生成Vercel配置步骤
  generateVercelSteps() {
    return [
      {
        step: 1,
        title: '登录Vercel控制台',
        description: '访问 https://vercel.com/dashboard',
        action: 'manual',
        details: [
          '使用GitHub账号登录',
          '选择文件存储项目',
          '确认项目已成功部署'
        ]
      },
      {
        step: 2,
        title: '添加自定义域名',
        description: '在项目设置中添加域名',
        action: 'manual',
        details: [
          '进入项目设置 → Domains',
          '点击 "Add Domain" 按钮',
          `输入域名: ${this.domain}`,
          '点击 "Add" 确认'
        ]
      },
      {
        step: 3,
        title: '获取DNS配置信息',
        description: 'Vercel会提供DNS配置要求',
        action: 'automatic',
        details: [
          'Vercel会显示需要的DNS记录',
          '记录下A记录或CNAME记录信息',
          '准备在DNS提供商后台配置'
        ]
      }
    ]
  }

  // 生成DNS配置步骤
  generateDNSSteps() {
    const dnsConfig = this.generateDNSConfig()
    
    return [
      {
        step: 4,
        title: '配置DNS记录',
        description: '在域名提供商后台添加DNS记录',
        action: 'manual',
        details: [
          '登录域名提供商控制台',
          '进入DNS管理页面',
          '添加以下DNS记录:'
        ],
        dnsRecords: dnsConfig.records
      },
      {
        step: 5,
        title: '等待DNS传播',
        description: 'DNS记录传播到全球',
        action: 'wait',
        details: [
          '通常需要5-30分钟',
          '最长可能需要48小时',
          '可以使用在线工具检查传播状态'
        ],
        checkTools: [
          'https://whatsmydns.net',
          'https://dnschecker.org',
          'nslookup命令'
        ]
      }
    ]
  }

  // 生成验证步骤
  generateVerificationSteps() {
    return [
      {
        step: 6,
        title: 'Vercel域名验证',
        description: '等待Vercel验证域名配置',
        action: 'automatic',
        details: [
          'Vercel会自动检测DNS配置',
          '域名状态会从"Pending"变为"Valid"',
          'SSL证书会自动申请和配置'
        ]
      },
      {
        step: 7,
        title: '更新环境变量',
        description: '更新项目环境变量',
        action: 'manual',
        details: [
          '进入Vercel项目设置 → Environment Variables',
          `更新 NEXTAUTH_URL 为 https://${this.domain}`,
          `更新 DOMAIN_NAME 为 ${this.domain}`,
          '保存并重新部署'
        ]
      },
      {
        step: 8,
        title: '功能验证测试',
        description: '验证所有功能正常工作',
        action: 'test',
        details: [
          `访问 https://${this.domain}`,
          '测试文件上传下载功能',
          '检查API端点响应',
          '验证SSL证书'
        ],
        testCommands: [
          `node scripts/check-domain-config.js ${this.domain}`,
          `node scripts/verify-deployment.js https://${this.domain}`
        ]
      }
    ]
  }

  // 生成完整配置指南
  generateSetupGuide() {
    const vercelSteps = this.generateVercelSteps()
    const dnsSteps = this.generateDNSSteps()
    const verificationSteps = this.generateVerificationSteps()
    
    const allSteps = [...vercelSteps, ...dnsSteps, ...verificationSteps]
    
    return {
      domain: this.domain,
      timestamp: new Date().toISOString(),
      estimatedTime: '30分钟 - 2小时',
      difficulty: '中等',
      prerequisites: [
        '拥有域名管理权限',
        'Vercel项目已部署',
        '项目功能正常工作'
      ],
      steps: allSteps,
      dnsConfig: this.generateDNSConfig(),
      troubleshooting: this.generateTroubleshooting()
    }
  }

  // 生成故障排除指南
  generateTroubleshooting() {
    return [
      {
        problem: 'DNS记录配置后域名仍无法访问',
        causes: [
          'DNS传播尚未完成',
          'DNS记录配置错误',
          'TTL设置过高'
        ],
        solutions: [
          '等待更长时间（最长48小时）',
          '检查DNS记录配置是否正确',
          '降低TTL值到300秒',
          '使用不同DNS服务器测试'
        ]
      },
      {
        problem: 'Vercel显示域名状态为Invalid',
        causes: [
          'DNS记录未正确指向Vercel',
          '域名被其他服务占用',
          'DNS传播未完成'
        ],
        solutions: [
          '确认DNS记录指向正确的Vercel IP',
          '检查域名是否在其他平台使用',
          '等待DNS传播完成',
          '在Vercel控制台重新验证域名'
        ]
      },
      {
        problem: 'SSL证书配置失败',
        causes: [
          'DNS配置不正确',
          '域名验证失败',
          'Let\'s Encrypt限制'
        ],
        solutions: [
          '确认DNS记录正确',
          '等待域名验证完成',
          '在Vercel控制台重新触发SSL配置',
          '联系Vercel支持'
        ]
      },
      {
        problem: '网站功能异常',
        causes: [
          '环境变量未更新',
          'API端点配置错误',
          '数据库连接问题'
        ],
        solutions: [
          '更新NEXTAUTH_URL和DOMAIN_NAME环境变量',
          '检查API端点是否正常响应',
          '验证数据库连接',
          '重新部署项目'
        ]
      }
    ]
  }

  // 保存配置指南到文件
  saveSetupGuide() {
    const guide = this.generateSetupGuide()
    const filename = `domain-setup-guide-${this.domain}-${Date.now()}.json`
    
    fs.writeFileSync(filename, JSON.stringify(guide, null, 2))
    return filename
  }

  // 生成Markdown格式的配置指南
  generateMarkdownGuide() {
    const guide = this.generateSetupGuide()
    const dnsConfig = guide.dnsConfig
    
    let markdown = `# ${this.domain} 域名配置指南\n\n`
    markdown += `**生成时间**: ${guide.timestamp}\n`
    markdown += `**预计时间**: ${guide.estimatedTime}\n`
    markdown += `**技术难度**: ${guide.difficulty}\n\n`
    
    markdown += `## 📋 前置条件\n\n`
    guide.prerequisites.forEach(req => {
      markdown += `- ${req}\n`
    })
    
    markdown += `\n## 🚀 配置步骤\n\n`
    guide.steps.forEach(step => {
      markdown += `### 步骤${step.step}: ${step.title}\n\n`
      markdown += `${step.description}\n\n`
      
      if (step.details) {
        step.details.forEach(detail => {
          markdown += `- ${detail}\n`
        })
        markdown += '\n'
      }
      
      if (step.dnsRecords) {
        markdown += `#### DNS记录配置\n\n`
        step.dnsRecords.forEach(record => {
          markdown += `**${record.description}**\n`
          markdown += `\`\`\`\n`
          markdown += `类型: ${record.type}\n`
          markdown += `名称: ${record.name}\n`
          markdown += `值: ${record.value}\n`
          markdown += `TTL: ${record.ttl}\n`
          markdown += `\`\`\`\n\n`
        })
      }
      
      if (step.testCommands) {
        markdown += `#### 验证命令\n\n`
        step.testCommands.forEach(cmd => {
          markdown += `\`\`\`bash\n${cmd}\n\`\`\`\n\n`
        })
      }
    })
    
    markdown += `## 🔧 故障排除\n\n`
    guide.troubleshooting.forEach(issue => {
      markdown += `### ${issue.problem}\n\n`
      markdown += `**可能原因**:\n`
      issue.causes.forEach(cause => {
        markdown += `- ${cause}\n`
      })
      markdown += `\n**解决方案**:\n`
      issue.solutions.forEach(solution => {
        markdown += `- ${solution}\n`
      })
      markdown += '\n'
    })
    
    return markdown
  }

  // 保存Markdown格式指南
  saveMarkdownGuide() {
    const markdown = this.generateMarkdownGuide()
    const filename = `domain-setup-${this.domain}.md`
    
    fs.writeFileSync(filename, markdown)
    return filename
  }

  // 显示配置摘要
  displaySummary() {
    const dnsConfig = this.generateDNSConfig()
    
    console.log(`🌐 域名配置摘要: ${this.domain}`)
    console.log('=' * 50)
    
    console.log('\n📋 需要配置的DNS记录:')
    dnsConfig.records.forEach(record => {
      console.log(`  ${record.type} 记录: ${record.name} → ${record.value}`)
    })
    
    console.log('\n🔧 Vercel配置:')
    console.log(`  1. 在Vercel项目中添加域名: ${this.domain}`)
    console.log(`  2. 配置DNS记录指向Vercel`)
    console.log(`  3. 等待DNS传播和SSL证书配置`)
    
    console.log('\n⏱️ 预计时间:')
    console.log(`  - DNS配置: 5分钟`)
    console.log(`  - DNS传播: 5-30分钟`)
    console.log(`  - SSL证书: 5-15分钟`)
    console.log(`  - 总计: 30分钟 - 2小时`)
    
    console.log('\n🧪 验证命令:')
    console.log(`  node scripts/check-domain-config.js ${this.domain}`)
    console.log(`  node scripts/verify-deployment.js https://${this.domain}`)
  }
}

// 命令行使用
async function main() {
  const args = process.argv.slice(2)
  const domain = args[0] || 'opening.icu'
  const action = args[1] || 'summary'
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('域名配置助手使用说明:')
    console.log('')
    console.log('用法:')
    console.log('  node scripts/setup-domain.js [DOMAIN] [ACTION]')
    console.log('')
    console.log('参数:')
    console.log('  DOMAIN  域名 (默认: opening.icu)')
    console.log('  ACTION  操作 (summary|guide|markdown|json)')
    console.log('')
    console.log('操作说明:')
    console.log('  summary   显示配置摘要 (默认)')
    console.log('  guide     生成详细配置指南')
    console.log('  markdown  生成Markdown格式指南')
    console.log('  json      生成JSON格式配置文件')
    console.log('')
    console.log('示例:')
    console.log('  node scripts/setup-domain.js opening.icu summary')
    console.log('  node scripts/setup-domain.js example.com guide')
    return
  }
  
  const helper = new DomainSetupHelper(domain)
  
  switch (action) {
    case 'summary':
      helper.displaySummary()
      break
      
    case 'guide':
      const guide = helper.generateSetupGuide()
      console.log(JSON.stringify(guide, null, 2))
      break
      
    case 'markdown':
      const mdFile = helper.saveMarkdownGuide()
      console.log(`✅ Markdown指南已生成: ${mdFile}`)
      break
      
    case 'json':
      const jsonFile = helper.saveSetupGuide()
      console.log(`✅ JSON配置文件已生成: ${jsonFile}`)
      break
      
    default:
      console.log(`❌ 未知操作: ${action}`)
      console.log('使用 --help 查看帮助信息')
      process.exit(1)
  }
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { DomainSetupHelper }