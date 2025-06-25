# 🔧 Vercel环境变量配置指南

## 📋 必需环境变量

在Vercel控制台的项目设置 → Environment Variables 中配置以下变量：

### 🗄️ 数据库配置
```bash
DATABASE_URL="postgresql://username:password@hostname:port/database"
```
- **来源**: Vercel Postgres数据库连接字符串
- **获取方式**: Vercel控制台 → Storage → Postgres → Connection String

### 🔐 应用安全配置
```bash
ADMIN_SECRET_KEY="your-super-secure-admin-key-change-this"
NEXTAUTH_SECRET="your-nextauth-secret-key-32-chars-min"
```
- **ADMIN_SECRET_KEY**: 管理员权限验证密钥（建议32位以上随机字符串）
- **NEXTAUTH_SECRET**: NextAuth.js会话加密密钥

### ☁️ Cloudinary配置
```bash
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```
- **来源**: Cloudinary控制台 → Dashboard → API Keys
- **获取方式**: https://cloudinary.com/console

### 🌐 域名和URL配置
```bash
NEXTAUTH_URL="https://opening.icu"
DOMAIN_NAME="opening.icu"
```
- **NEXTAUTH_URL**: 完整的网站URL（包含https://）
- **DOMAIN_NAME**: 域名（不包含协议）

### 📁 文件配置
```bash
MAX_FILE_SIZE="104857600"
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,text/markdown,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
```
- **MAX_FILE_SIZE**: 最大文件大小（字节），默认100MB
- **ALLOWED_FILE_TYPES**: 允许的文件类型（MIME类型，逗号分隔）

## 🔧 配置步骤

### 步骤1: 访问Vercel控制台
1. 登录 https://vercel.com
2. 选择您的项目
3. 进入 Settings → Environment Variables

### 步骤2: 添加环境变量
对于每个环境变量：
1. 点击 "Add New"
2. 输入变量名（如 `DATABASE_URL`）
3. 输入变量值
4. 选择环境：Production, Preview, Development
5. 点击 "Save"

### 步骤3: 重新部署
配置完成后，触发重新部署：
1. 进入 Deployments 页面
2. 点击最新部署的 "..." 菜单
3. 选择 "Redeploy"

## 🔒 安全最佳实践

### 密钥生成建议
```bash
# 生成强密钥的方法
# 方法1: 使用openssl
openssl rand -base64 32

# 方法2: 使用Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 方法3: 在线生成器
# https://generate-secret.vercel.app/32
```

### 环境分离
- **Production**: 生产环境，使用真实的数据库和API密钥
- **Preview**: 预览环境，可以使用测试数据库
- **Development**: 开发环境，通常使用本地配置

### 密钥轮换
- 定期更换 `ADMIN_SECRET_KEY` 和 `NEXTAUTH_SECRET`
- 更换后需要重新部署应用
- 建议每3-6个月轮换一次

## 📊 配置验证

### 验证脚本
创建一个简单的API端点来验证配置：

```typescript
// pages/api/health.ts
export default function handler(req, res) {
  const requiredEnvs = [
    'DATABASE_URL',
    'ADMIN_SECRET_KEY',
    'CLOUDINARY_CLOUD_NAME',
    'NEXTAUTH_SECRET'
  ]
  
  const missing = requiredEnvs.filter(env => !process.env[env])
  
  if (missing.length > 0) {
    return res.status(500).json({
      status: 'error',
      missing: missing
    })
  }
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  })
}
```

### 检查清单
- [ ] 所有必需环境变量已配置
- [ ] 数据库连接测试成功
- [ ] Cloudinary API密钥有效
- [ ] 域名配置正确
- [ ] 应用可以正常启动
- [ ] 文件上传功能正常
- [ ] 管理员权限验证正常

## 🚨 常见问题

### 问题1: 数据库连接失败
```
Error: P1001: Can't reach database server
```
**解决方案**:
- 检查 `DATABASE_URL` 格式是否正确
- 确认数据库服务是否运行
- 验证网络连接和防火墙设置

### 问题2: Cloudinary上传失败
```
Error: Invalid API Key
```
**解决方案**:
- 验证 `CLOUDINARY_API_KEY` 和 `CLOUDINARY_API_SECRET`
- 检查 `CLOUDINARY_CLOUD_NAME` 是否正确
- 确认Cloudinary账号状态正常

### 问题3: NextAuth错误
```
Error: Please define a NEXTAUTH_SECRET environment variable
```
**解决方案**:
- 设置 `NEXTAUTH_SECRET` 环境变量
- 确保密钥长度至少32个字符
- 重新部署应用

### 问题4: 管理员权限失败
```
Error: 无权限删除文件
```
**解决方案**:
- 检查 `ADMIN_SECRET_KEY` 配置
- 确认请求头中的 `x-admin-key` 值正确
- 验证密钥没有多余的空格或特殊字符

## 📝 配置模板

### 生产环境配置模板
```bash
# 数据库
DATABASE_URL="postgresql://user:pass@host:5432/db"

# 安全
ADMIN_SECRET_KEY="prod-admin-key-32-chars-minimum"
NEXTAUTH_SECRET="prod-nextauth-secret-32-chars-min"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-prod-cloud"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="your-prod-secret"

# 域名
NEXTAUTH_URL="https://opening.icu"
DOMAIN_NAME="opening.icu"

# 文件配置
MAX_FILE_SIZE="104857600"
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain"
```

### 开发环境配置模板
```bash
# 数据库
DATABASE_URL="file:./dev.db"

# 安全
ADMIN_SECRET_KEY="dev-admin-key-for-testing"
NEXTAUTH_SECRET="dev-nextauth-secret-for-testing"

# 域名
NEXTAUTH_URL="http://localhost:3000"
DOMAIN_NAME="localhost"

# 文件配置
MAX_FILE_SIZE="104857600"
UPLOAD_DIR="./uploads"
```

---

**配置完成后，您的文件存储网站将在Vercel上正常运行！**