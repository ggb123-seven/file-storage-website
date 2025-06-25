# 🌐 自定义域名完整配置指南

## 📋 前置要求

### 必需条件：
1. ✅ **购买域名** (如: yourdomain.com)
2. ✅ **云平台部署** (网站必须在公网服务器上)
3. ✅ **DNS配置权限** (域名管理后台访问权)

## 🚀 方案1: Vercel + 自定义域名 (推荐)

### 优势：
- 🆓 **完全免费** (包括SSL证书)
- ⚡ **全球CDN** 加速
- 🔒 **自动HTTPS** 
- 🛠️ **零运维** 
- 📈 **自动扩展**

### 详细步骤：

#### 第1步: 部署到Vercel
```bash
# 1. 登录Vercel (需要GitHub账号)
vercel login

# 2. 部署项目
vercel --prod

# 3. 配置环境变量
# 在Vercel控制台设置:
# - DATABASE_URL (数据库连接)
# - ADMIN_SECRET_KEY (管理员密钥)
```

#### 第2步: 添加自定义域名
1. **Vercel控制台** → **项目设置** → **Domains**
2. **添加域名**: 输入您的域名 (如: files.yourdomain.com)
3. **获取DNS记录**: Vercel会提供DNS配置信息

#### 第3步: 配置DNS
在您的域名提供商后台添加记录：
```
类型: CNAME
名称: files (或 @)
值: cname.vercel-dns.com
```

#### 第4步: 等待生效
- ⏱️ **DNS传播**: 通常5-30分钟
- 🔒 **SSL证书**: 自动申请和配置
- ✅ **完成**: 您的网站可通过自定义域名访问

## 🏢 方案2: 云服务器 + 域名

### 适用场景：
- 需要完全控制
- 大文件存储需求
- 企业级部署

### 步骤概览：

#### 第1步: 购买云服务器
**推荐平台：**
- 🇨🇳 **阿里云**: 国内访问快
- 🇺🇸 **AWS**: 全球覆盖
- 🇺🇸 **DigitalOcean**: 简单易用
- 🇺🇸 **Vultr**: 性价比高

#### 第2步: 服务器部署
```bash
# 1. 连接服务器
ssh root@your-server-ip

# 2. 安装环境
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx

# 3. 部署代码
git clone your-repo
cd file-storage-website
npm install
npm run build

# 4. 配置PM2
npm install -g pm2
pm2 start npm --name "file-storage" -- start
pm2 startup
pm2 save
```

#### 第3步: Nginx配置
```nginx
server {
    listen 80;
    server_name files.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 100M;
    }
}
```

#### 第4步: SSL证书
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 申请SSL证书
sudo certbot --nginx -d files.yourdomain.com
```

#### 第5步: DNS配置
```
类型: A
名称: files (或 @)
值: your-server-ip
```

## 💰 成本对比

### Vercel方案 (推荐新手)
- 🆓 **部署**: 免费
- 💵 **域名**: $10-15/年
- 🔒 **SSL**: 免费
- 📊 **总成本**: ~$15/年

### 云服务器方案
- 💰 **服务器**: $5-20/月
- 💵 **域名**: $10-15/年
- 🔒 **SSL**: 免费 (Let's Encrypt)
- 📊 **总成本**: ~$75-255/年

## 🎯 推荐流程

### 对于个人/小团队：
1. **购买域名** (如: namecheap.com, godaddy.com)
2. **注册GitHub账号** 
3. **上传代码到GitHub**
4. **连接Vercel到GitHub**
5. **在Vercel添加自定义域名**
6. **配置DNS记录**

### 对于企业用户：
1. **购买域名**
2. **购买云服务器**
3. **部署应用到服务器**
4. **配置Nginx反向代理**
5. **申请SSL证书**
6. **配置DNS记录**

## 🔧 常见问题

### Q: 域名在哪里购买？
**A**: 推荐平台：
- 🌐 **Namecheap**: 便宜，界面友好
- 🌐 **GoDaddy**: 知名度高
- 🌐 **Cloudflare**: 价格透明
- 🇨🇳 **阿里云**: 国内用户

### Q: DNS配置多久生效？
**A**: 通常5-30分钟，最长48小时

### Q: 如何检查配置是否正确？
**A**: 使用在线工具：
- DNS检查: whatsmydns.net
- SSL检查: ssllabs.com

### Q: 可以使用免费域名吗？
**A**: 可以，但不推荐：
- Freenom (.tk, .ml, .ga)
- 稳定性差，可能被收回

## 📞 技术支持

如需帮助，请提供：
1. 域名提供商
2. 选择的部署方案
3. 遇到的具体问题
4. 错误信息截图

---

**建议**: 如果是第一次配置，强烈推荐使用Vercel方案，简单可靠！
