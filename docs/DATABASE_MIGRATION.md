# 📊 数据库迁移指南

## 🎯 迁移概述

将文件存储网站的数据库从SQLite迁移到Vercel Postgres，确保数据完整性和功能连续性。

## 📋 迁移状态

### ✅ 已完成
- [x] 备份原始SQLite数据库 (dev.db.backup)
- [x] 导出现有数据到JSON文件 (9个文件记录)
- [x] 修改Prisma schema配置为PostgreSQL
- [x] 生成新的Prisma客户端
- [x] 创建数据导入脚本

### 🔄 待完成 (需要Vercel Postgres)
- [ ] 获取Vercel Postgres连接字符串
- [ ] 更新DATABASE_URL环境变量
- [ ] 执行数据库表结构创建 (prisma db push)
- [ ] 导入现有数据到PostgreSQL
- [ ] 验证数据迁移完整性

## 📊 数据统计

### 现有数据概览
```
总文件数: 9个
文件类型: text/plain
总大小: 204 bytes
上传时间范围: 2025-06-24 18:36 - 19:26
下载总次数: 5次
```

### 文件记录详情
1. test-upload.txt (30 bytes, 1次下载)
2. document.txt (24 bytes, 0次下载)
3. image.txt (18 bytes, 0次下载)
4. data.txt (17 bytes, 0次下载)
5. final-test.txt (23 bytes, 1次下载)
6. authorized-test.txt (36 bytes, 1次下载)
7. test-image.txt (18 bytes, 1次下载)
8. test-document.txt (21 bytes, 0次下载)
9. test-data.txt (17 bytes, 1次下载)

## 🔧 迁移脚本

### 数据导出脚本
```bash
node scripts/export-data.js
```
- 导出SQLite数据到 `scripts/sqlite-export.json`
- 包含完整的文件记录信息

### 数据导入脚本
```bash
node scripts/import-data.js
```
- 从JSON文件导入数据到PostgreSQL
- 自动处理数据类型转换

## 🗄️ 数据库架构

### File表结构
```sql
CREATE TABLE "files" (
  "id" TEXT NOT NULL,
  "filename" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "path" TEXT NOT NULL,
  "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "downloadCount" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "description" TEXT,
  "tags" TEXT,
  
  CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- 索引
CREATE UNIQUE INDEX "files_filename_key" ON "files"("filename");
CREATE INDEX "files_uploadDate_idx" ON "files"("uploadDate");
CREATE INDEX "files_mimeType_idx" ON "files"("mimeType");
CREATE INDEX "files_isActive_idx" ON "files"("isActive");
```

## 🔄 迁移步骤

### 步骤1: 准备Vercel Postgres
1. 在Vercel控制台创建Postgres数据库
2. 获取连接字符串
3. 更新环境变量

### 步骤2: 执行迁移
```bash
# 1. 更新DATABASE_URL
export DATABASE_URL="postgresql://..."

# 2. 创建数据库表结构
npx prisma db push

# 3. 导入现有数据
node scripts/import-data.js

# 4. 验证迁移结果
node scripts/check-data.js
```

### 步骤3: 验证功能
- 测试文件上传功能
- 测试文件列表查询
- 测试文件下载功能
- 验证搜索和筛选功能

## 🔒 数据安全

### 备份策略
- ✅ 原始SQLite数据库已备份
- ✅ 数据已导出为JSON格式
- ✅ 所有文件记录信息完整保存

### 回滚计划
如果迁移失败，可以：
1. 恢复Prisma schema为SQLite配置
2. 使用备份的dev.db.backup文件
3. 重新生成Prisma客户端
4. 恢复原有功能

## 📝 注意事项

### PostgreSQL vs SQLite差异
1. **数据类型**: PostgreSQL更严格的类型检查
2. **索引**: PostgreSQL支持更多索引类型
3. **并发**: PostgreSQL更好的并发支持
4. **扩展性**: PostgreSQL更适合生产环境

### 环境变量配置
```bash
# 开发环境 (SQLite)
DATABASE_URL="file:./dev.db"

# 生产环境 (Vercel Postgres)
DATABASE_URL="postgresql://username:password@hostname:port/database"
```

---

**迁移状态**: 🔄 准备就绪，等待Vercel Postgres配置  
**下一步**: 获取Vercel Postgres连接字符串  
**预计时间**: 15分钟完成迁移