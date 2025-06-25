# 文件存储分享网站 - 系统架构文档

## 文档信息
- **文档版本**: v1.0
- **创建日期**: 2025-01-24
- **负责人**: Bob (架构师)
- **项目代号**: FileShare-Web

## 系统架构概览

### 技术栈
- **前端框架**: Next.js 15.3.4 (App Router)
- **开发语言**: TypeScript
- **样式框架**: Tailwind CSS
- **数据库**: SQLite + Prisma ORM
- **文件处理**: Multer
- **运行环境**: Node.js 18+

### 架构模式
采用 **全栈单体架构** 模式，基于Next.js的App Router实现前后端一体化开发。

## 数据库设计

### 核心数据模型

#### File 模型
```prisma
model File {
  id           String   @id @default(cuid())
  filename     String   @unique // 存储文件名(唯一)
  originalName String   // 原始文件名
  mimeType     String   // 文件类型
  size         Int      // 文件大小(字节)
  path         String   // 文件存储路径
  uploadDate   DateTime @default(now())
  downloadCount Int     @default(0)
  isActive     Boolean  @default(true) // 文件是否可用
  description  String?  // 文件描述(可选)
  tags         String?  // 文件标签(可选，JSON格式)
  
  // 索引优化
  @@index([uploadDate])
  @@index([mimeType])
  @@index([isActive])
  @@map("files")
}
```

### 数据库特性
- **软删除**: 使用 `isActive` 字段实现软删除
- **索引优化**: 针对查询频繁的字段建立索引
- **唯一约束**: 存储文件名保证唯一性
- **扩展性**: 预留描述和标签字段支持未来功能

## API架构设计

### RESTful API 规范

#### 文件管理 API
```
GET    /api/files              # 获取文件列表
POST   /api/upload             # 文件上传
DELETE /api/files?id={id}      # 删除文件
GET    /api/stats              # 获取统计信息
```

#### 文件访问 API
```
GET /api/download/{id}         # 文件下载
GET /api/files/preview/{id}    # 文件预览
```

### API 功能特性

#### 1. 文件列表 API (`/api/files`)
- **分页支持**: page, limit 参数
- **搜索功能**: search 参数（文件名、描述）
- **类型筛选**: mimeType 参数
- **排序功能**: sortBy, sortOrder 参数
- **响应格式**: 统一的 JSON 格式

#### 2. 文件上传 API (`/api/upload`)
- **权限验证**: x-admin-key 头部验证
- **文件验证**: 类型白名单、大小限制
- **安全处理**: 文件名重命名、路径安全
- **元数据存储**: 自动记录文件信息

#### 3. 文件下载 API (`/api/download/{id}`)
- **安全下载**: 防止直接路径访问
- **统计记录**: 自动更新下载计数
- **缓存优化**: 设置适当的缓存头
- **文件名处理**: 正确的中文文件名编码

#### 4. 文件预览 API (`/api/files/preview/{id}`)
- **类型限制**: 仅支持可预览的文件类型
- **内联显示**: 图片文件内联显示
- **缓存策略**: 1小时缓存时间

## 服务层架构

### 文件服务 (`file-service.ts`)
提供数据库操作的抽象层，包含以下核心功能：

```typescript
// 核心接口
interface FileSearchParams {
  page?: number
  limit?: number
  search?: string
  mimeType?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 主要方法
- getFiles(params): 获取文件列表
- getFileById(id): 根据ID获取文件
- createFile(data): 创建文件记录
- incrementDownloadCount(id): 更新下载计数
- deleteFile(id): 软删除文件
- getFileStats(): 获取统计信息
```

### 工具函数库 (`utils.ts`)
提供通用的工具函数：

```typescript
// 文件处理
- formatFileSize(bytes): 格式化文件大小
- getFileExtension(filename): 获取文件扩展名
- isValidFileType(mimeType): 验证文件类型
- getFileTypeCategory(mimeType): 获取文件类型分类
- isPreviewable(mimeType): 判断是否可预览

// 日期处理
- formatDate(date): 格式化日期显示

// 样式处理
- cn(...inputs): 合并CSS类名
```

## 安全架构

### 权限控制
- **管理员验证**: 基于环境变量的密钥验证
- **访问控制**: 上传需要管理员权限，查看无需权限
- **会话管理**: 简单的基于头部的验证机制

### 文件安全
- **类型验证**: 文件类型白名单检查
- **大小限制**: 可配置的文件大小限制
- **路径安全**: 防止路径遍历攻击
- **文件名处理**: 安全的文件名重命名

### 数据安全
- **软删除**: 避免数据丢失
- **输入验证**: 所有用户输入进行验证
- **错误处理**: 统一的错误处理机制

## 性能优化

### 数据库优化
- **索引策略**: 针对查询字段建立索引
- **查询优化**: 使用 Prisma 的高效查询
- **分页处理**: 避免大量数据查询

### 文件处理优化
- **缓存策略**: 静态文件缓存
- **流式处理**: 大文件的流式读取
- **压缩优化**: 图片和文档的优化处理

### API性能
- **响应缓存**: 适当的HTTP缓存头
- **数据压缩**: 启用gzip压缩
- **并发处理**: 异步处理文件操作

## 部署架构

### 环境配置
```env
# 数据库配置
DATABASE_URL="file:./dev.db"

# 应用配置
ADMIN_SECRET_KEY="your-admin-secret-key-here"
MAX_FILE_SIZE=104857600
UPLOAD_DIR="./uploads"
ALLOWED_FILE_TYPES="image/jpeg,image/png,..."

# Next.js配置
NEXT_PUBLIC_APP_NAME="File Storage Website"
NEXT_PUBLIC_MAX_FILE_SIZE=104857600
```

### 目录结构
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   ├── files/         # 文件管理API
│   │   ├── upload/        # 文件上传API
│   │   ├── download/      # 文件下载API
│   │   └── stats/         # 统计API
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页
├── components/            # React组件
├── lib/                   # 工具库
│   ├── db.ts             # 数据库连接
│   ├── file-service.ts   # 文件服务层
│   └── utils.ts          # 工具函数
prisma/
├── schema.prisma         # 数据库模型
└── dev.db               # SQLite数据库文件
uploads/                 # 文件存储目录
```

## 扩展性设计

### 水平扩展
- **数据库**: 可轻松迁移到PostgreSQL/MySQL
- **文件存储**: 支持扩展到云存储(AWS S3, 阿里云OSS)
- **缓存**: 可集成Redis缓存
- **负载均衡**: 支持多实例部署

### 功能扩展
- **用户系统**: 预留用户管理接口
- **权限系统**: 可扩展为RBAC权限模型
- **文件处理**: 支持图片压缩、文档转换
- **搜索引擎**: 可集成Elasticsearch全文搜索

### 监控与日志
- **错误监控**: 统一的错误处理和日志记录
- **性能监控**: API响应时间和数据库查询监控
- **用户行为**: 文件访问和下载统计

## 技术决策记录

### 1. 选择SQLite作为数据库
**原因**: 
- 轻量级，无需额外配置
- 适合中小型应用
- 易于部署和备份
- 支持后续迁移到其他数据库

### 2. 使用Prisma ORM
**原因**:
- 类型安全的数据库访问
- 优秀的开发体验
- 自动生成类型定义
- 支持数据库迁移

### 3. 采用软删除策略
**原因**:
- 避免数据丢失
- 支持数据恢复
- 便于审计和统计
- 提高系统安全性

### 4. 基于环境变量的权限控制
**原因**:
- 简单易实现
- 满足当前需求
- 易于配置管理
- 支持后续扩展

## 风险评估与应对

### 高风险项
1. **文件存储空间**: 实施文件大小限制和清理策略
2. **安全漏洞**: 严格的文件类型验证和路径检查
3. **性能瓶颈**: 数据库索引优化和缓存策略

### 中风险项
1. **数据库性能**: 监控查询性能，必要时优化
2. **文件损坏**: 定期备份和完整性检查
3. **并发访问**: 数据库连接池和锁机制

### 低风险项
1. **浏览器兼容性**: 渐进式增强策略
2. **用户体验**: 持续优化和用户反馈

---

**架构文档结束**

*本文档将随着系统演进持续更新，确保架构设计与实际实现保持一致。*
