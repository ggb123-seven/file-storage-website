# 文件存储网站 - 部署指南

## 🚀 快速部署

### 1. 环境要求
- Node.js 18+ 
- PostgreSQL 数据库
- 至少 1GB 可用磁盘空间

### 2. 安装步骤

#### 步骤 1: 克隆项目
```bash
git clone <your-repo-url>
cd file-storage-website
```

#### 步骤 2: 安装依赖
```bash
npm install
```

#### 步骤 3: 环境配置
创建 `.env` 文件：
```bash
# 数据库连接
DATABASE_URL="postgresql://username:password@localhost:5432/filestore"

# 管理员密钥 (请更改为强密钥)
ADMIN_SECRET_KEY="your-super-secure-admin-key-change-this"

# 文件配置
MAX_FILE_SIZE=104857600
UPLOAD_DIR="./uploads"

# 应用配置
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

#### 步骤 4: 数据库设置
```bash
# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma db push

# (可选) 查看数据库
npx prisma studio
```

#### 步骤 5: 启动应用
```bash
# 开发模式
npm run dev

# 生产构建
npm run build
npm start
```

## 🌐 生产部署

### 方案 1: Vercel 部署 (推荐)

#### 1. 准备工作
```bash
npm install -g vercel
```

#### 2. 配置环境变量
在 Vercel 控制台设置：
- `DATABASE_URL`
- `ADMIN_SECRET_KEY`
- `MAX_FILE_SIZE`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

#### 3. 部署
```bash
vercel --prod
```

### 方案 2: Docker 部署

#### 1. 创建 Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### 2. 构建和运行
```bash
docker build -t file-storage-app .
docker run -p 3000:3000 --env-file .env file-storage-app
```

### 方案 3: VPS 部署

#### 1. 服务器准备
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2
```

#### 2. 应用部署
```bash
# 克隆代码
git clone <your-repo>
cd file-storage-website

# 安装依赖
npm ci --production

# 构建应用
npm run build

# 启动应用
pm2 start npm --name "file-storage" -- start
pm2 save
pm2 startup
```

## 🔧 配置优化

### 1. Nginx 反向代理
```nginx
server {
    listen 80;
    server_name your-domain.com;

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
        
        # 文件上传大小限制
        client_max_body_size 100M;
    }
}
```

### 2. SSL 证书 (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. 防火墙配置
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 📊 监控和维护

### 1. 日志监控
```bash
# PM2 日志
pm2 logs file-storage

# Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. 性能监控
```bash
# 系统资源
htop
df -h

# 应用状态
pm2 status
pm2 monit
```

### 3. 备份策略
```bash
# 数据库备份
pg_dump filestore > backup_$(date +%Y%m%d).sql

# 文件备份
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

## 🔒 安全配置

### 1. 环境变量安全
- 使用强随机密钥
- 定期轮换密钥
- 不在代码中硬编码敏感信息

### 2. 数据库安全
- 使用专用数据库用户
- 限制数据库访问权限
- 启用数据库连接加密

### 3. 文件系统安全
- 设置适当的文件权限
- 定期清理临时文件
- 监控磁盘使用情况

## 🚨 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查数据库状态
sudo systemctl status postgresql

# 测试连接
psql $DATABASE_URL
```

#### 2. 文件上传失败
- 检查 `UPLOAD_DIR` 权限
- 验证 `MAX_FILE_SIZE` 设置
- 确认管理员密钥正确

#### 3. 应用无法启动
```bash
# 检查端口占用
sudo netstat -tlnp | grep :3000

# 查看应用日志
pm2 logs file-storage
```

## 📞 支持

如需部署支持，请：
1. 检查日志文件
2. 验证环境配置
3. 联系技术支持

---

**部署成功后，请访问**: `http://your-domain.com`
**管理界面**: 使用配置的管理员密钥进行文件管理
