# 🗂️ 文件存储网站

一个现代化、安全的文件存储和分享平台，支持管理员上传和公开访问功能。

## 功能特性

- 🚀 **现代化技术栈**: Next.js 14 + TypeScript + Tailwind CSS
- 📁 **文件管理**: 支持多种文件格式的上传和管理
- 🔍 **搜索筛选**: 实时搜索和文件类型筛选
- 👁️ **在线预览**: 图片、PDF、文档等文件的在线预览
- 🔒 **权限控制**: 简单的管理员/访客权限系统
- 📱 **响应式设计**: 完美适配桌面、平板和移动设备
- 🌐 **浏览器兼容**: 特别优化 Edge 浏览器支持

## 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Prisma ORM
- **数据库**: SQLite
- **文件处理**: Multer
- **UI组件**: Lucide React Icons

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装步骤

1. 克隆项目
```bash
git clone <repository-url>
cd file-storage-website
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env.local
# 编辑 .env.local 文件，设置你的配置
```

4. 初始化数据库
```bash
npx prisma generate
npx prisma db push
```

5. 启动开发服务器
```bash
npm run dev
```

6. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 环境变量配置

```env
# 数据库
DATABASE_URL="file:./dev.db"

# 应用配置
ADMIN_SECRET_KEY="your-admin-secret-key-here"
MAX_FILE_SIZE=104857600
UPLOAD_DIR="./uploads"
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain"

# Next.js 配置
NEXT_PUBLIC_APP_NAME="File Storage Website"
NEXT_PUBLIC_MAX_FILE_SIZE=104857600
```

## 项目结构

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API 路由
│   ├── upload/         # 上传页面
│   └── page.tsx        # 主页
├── components/         # React 组件
├── lib/               # 工具函数和配置
│   ├── db.ts          # 数据库连接
│   └── utils.ts       # 工具函数
prisma/
├── schema.prisma      # 数据库模型
uploads/               # 文件存储目录
```

## 开发指南

### 数据库操作

```bash
# 生成 Prisma 客户端
npx prisma generate

# 推送数据库变更
npx prisma db push

# 查看数据库
npx prisma studio
```

### 构建和部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 支持

如果你觉得这个项目有用，请给它一个 ⭐️！

---
*最后更新：2025-06-25 - 触发 Vercel 部署*
