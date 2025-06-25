# 🚀 完整部署指南

## 📋 部署概述

本指南将帮助您将文件存储网站成功部署到Vercel平台，实现全球公网访问。

## ✅ 部署前准备

### 1. 账号准备
- [ ] **Vercel账号**: 注册 https://vercel.com/signup
- [ ] **GitHub账号**: 确保代码已推送到GitHub仓库
- [ ] **Cloudinary账号**: 注册 https://cloudinary.com/users/register_free

### 2. 服务配置
- [ ] **Vercel Postgres**: 在Vercel控制台创建数据库
- [ ] **Cloudinary设置**: 获取API密钥
- [ ] **域名准备**: 确保域名DNS可以配置

### 3. 本地验证
```bash
# 检查部署准备状态
npm run deploy:check

# 验证构建
npm run build

# 本地测试
npm run dev
```

## 🔧 环境变量配置

### 在Vercel控制台配置以下环境变量：

#### 🗄️ 数据库配置
```bash
DATABASE_URL="postgresql://username:password@hostname:port/database"
```
**获取方式**: Vercel控制台 → Storage → Postgres → Connection String

#### 🔐 安全配置
```bash
ADMIN_SECRET_KEY="your-super-secure-admin-key-32-chars-min"
NEXTAUTH_SECRET="your-nextauth-secret-32-chars-minimum"
```
**生成方式**: 
```bash
# 使用Node.js生成
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### ☁️ Cloudinary配置
```bash
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```
**获取方式**: Cloudinary控制台 → Dashboard → API Keys

#### 🌐 域名配置
```bash
NEXTAUTH_URL="https://opening.icu"
DOMAIN_NAME="opening.icu"
```

#### 📁 文件配置
```bash
MAX_FILE_SIZE="104857600"
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,text/markdown,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
```

## 🚀 部署步骤

### 步骤1: 连接GitHub仓库
1. 登录Vercel控制台
2. 点击 "New Project"
3. 选择GitHub仓库
4. 点击 "Import"

### 步骤2: 配置项目设置
1. **Framework Preset**: Next.js (自动检测)
2. **Root Directory**: `.` (项目根目录)
3. **Build Command**: `npm run build` (默认)
4. **Output Directory**: `.next` (默认)
5. **Install Command**: `npm install` (默认)

### 步骤3: 配置环境变量
1. 进入项目设置 → Environment Variables
2. 逐一添加上述环境变量
3. 选择环境: Production, Preview, Development

### 步骤4: 执行部署
1. 点击 "Deploy" 开始首次部署
2. 监控构建日志
3. 等待部署完成

### 步骤5: 数据库初始化
```bash
# 在Vercel控制台的Functions页面执行
# 或通过API调用初始化数据库表结构
```

## 🧪 部署验证

### 自动化验证
```bash
# 使用部署验证脚本
node scripts/verify-deployment.js https://your-domain.vercel.app your-admin-key

# 检查部署状态
node scripts/check-deployment-status.js
```

### 手动验证清单
- [ ] **网站访问**: 主页可以正常加载
- [ ] **文件列表**: API返回文件列表
- [ ] **数据库连接**: 数据查询正常
- [ ] **文件上传**: 管理员可以上传文件
- [ ] **文件下载**: 文件可以正常下载
- [ ] **文件预览**: 支持的文件类型可以预览
- [ ] **搜索功能**: 文件搜索正常工作
- [ ] **权限验证**: 管理员权限正确验证
- [ ] **错误处理**: 错误页面正常显示
- [ ] **性能测试**: API响应时间合理

## 🔍 故障排除

### 常见问题及解决方案

#### 1. 构建失败
**错误**: `Build failed with exit code 1`
**解决方案**:
- 检查TypeScript类型错误
- 验证所有依赖是否正确安装
- 确认环境变量配置正确

#### 2. 数据库连接失败
**错误**: `P1001: Can't reach database server`
**解决方案**:
- 验证DATABASE_URL格式正确
- 确认Vercel Postgres数据库运行正常
- 检查网络连接和防火墙设置

#### 3. Cloudinary上传失败
**错误**: `Invalid API Key`
**解决方案**:
- 验证Cloudinary环境变量配置
- 确认API密钥没有多余空格
- 检查Cloudinary账号状态

#### 4. 函数超时
**错误**: `Function execution timed out`
**解决方案**:
- 检查vercel.json中的maxDuration设置
- 优化文件上传逻辑
- 考虑使用Cloudinary直接上传

#### 5. 权限验证失败
**错误**: `无权限删除文件`
**解决方案**:
- 检查ADMIN_SECRET_KEY配置
- 确认请求头中的x-admin-key正确
- 验证密钥没有特殊字符问题

## 📊 性能优化

### Vercel配置优化
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 60,
      "memory": 1024
    }
  },
  "regions": ["iad1"]
}
```

### Next.js配置优化
```typescript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com'
      }
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  }
}
```

### Cloudinary优化
- 启用自动图片优化
- 配置CDN缓存策略
- 使用适当的图片格式转换

## 🔒 安全配置

### 安全头部
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 环境变量安全
- 使用强密钥（32位以上）
- 定期轮换密钥
- 不在代码中硬编码密钥
- 使用Vercel的环境变量加密

## 📈 监控和维护

### 部署监控
- 监控Vercel部署状态
- 设置错误告警
- 定期检查性能指标

### 数据库维护
- 定期备份数据库
- 监控数据库性能
- 清理无效文件记录

### Cloudinary管理
- 监控存储使用量
- 清理未使用的文件
- 优化存储成本

## 🎯 部署后检查清单

### 功能验证
- [ ] 网站正常访问
- [ ] 所有API端点响应正常
- [ ] 文件上传下载功能正常
- [ ] 数据库操作正常
- [ ] 搜索功能正常
- [ ] 权限验证正常

### 性能检查
- [ ] 页面加载速度 < 3秒
- [ ] API响应时间 < 2秒
- [ ] 文件上传速度合理
- [ ] CDN缓存正常工作

### 安全检查
- [ ] HTTPS正常工作
- [ ] 安全头部配置正确
- [ ] 管理员权限验证正常
- [ ] 文件类型限制生效

### 监控设置
- [ ] 错误监控已配置
- [ ] 性能监控已启用
- [ ] 日志记录正常
- [ ] 告警通知已设置

## 📞 支持和帮助

### 官方文档
- [Vercel文档](https://vercel.com/docs)
- [Next.js文档](https://nextjs.org/docs)
- [Prisma文档](https://www.prisma.io/docs)
- [Cloudinary文档](https://cloudinary.com/documentation)

### 社区支持
- [Vercel社区](https://github.com/vercel/vercel/discussions)
- [Next.js社区](https://github.com/vercel/next.js/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/vercel)

---

**部署完成后，您的文件存储网站将在全球范围内可访问！** 🎉