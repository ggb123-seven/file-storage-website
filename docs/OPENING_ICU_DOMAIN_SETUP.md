# 🌐 opening.icu 域名配置指南

## 📋 配置概述

本指南专门针对 **opening.icu** 域名在Vercel平台的配置，实现文件存储网站的自定义域名访问。

## ✅ 前置条件检查

### 必需条件
- [x] **域名所有权**: 确认拥有opening.icu域名管理权限
- [x] **Vercel项目**: 文件存储网站已在Vercel成功部署
- [x] **DNS管理权限**: 可以修改opening.icu的DNS记录
- [x] **项目功能**: 所有功能在Vercel默认域名下正常工作

### 域名信息
- **主域名**: opening.icu
- **目标用途**: 文件存储和分享网站
- **SSL需求**: 自动HTTPS证书
- **CDN需求**: 全球访问加速

## 🚀 Vercel域名配置步骤

### 步骤1: 登录Vercel控制台
1. 访问 https://vercel.com/dashboard
2. 选择文件存储项目
3. 进入项目设置页面

### 步骤2: 添加自定义域名
1. **导航**: 项目设置 → **Domains** 标签页
2. **添加域名**: 点击 "Add Domain" 按钮
3. **输入域名**: `opening.icu`
4. **确认添加**: 点击 "Add" 按钮

### 步骤3: 获取DNS配置信息
Vercel会提供以下DNS配置信息：

#### 主域名配置 (opening.icu)
```
类型: A
名称: @
值: 76.76.19.61
TTL: 300
```

#### 或者使用CNAME配置
```
类型: CNAME  
名称: @
值: cname.vercel-dns.com
TTL: 300
```

#### www子域名配置 (可选)
```
类型: CNAME
名称: www
值: cname.vercel-dns.com  
TTL: 300
```

### 步骤4: 配置DNS记录

#### 如果使用Cloudflare管理DNS
1. 登录 Cloudflare 控制台
2. 选择 opening.icu 域名
3. 进入 **DNS** → **Records** 页面
4. 添加/修改以下记录：

```
类型: A
名称: @
IPv4地址: 76.76.19.61
代理状态: 仅DNS (灰色云朵)
TTL: 自动
```

```
类型: CNAME
名称: www
目标: cname.vercel-dns.com
代理状态: 仅DNS (灰色云朵)  
TTL: 自动
```

#### 如果使用其他DNS提供商
根据您的DNS提供商界面，添加上述A记录和CNAME记录。

### 步骤5: 验证配置
1. **DNS传播检查**: 使用 https://whatsmydns.net 检查DNS传播状态
2. **Vercel状态**: 在Vercel控制台查看域名状态
3. **SSL证书**: 等待Vercel自动配置SSL证书

## 🔍 配置验证工具

### DNS检查命令
```bash
# 检查A记录
nslookup opening.icu

# 检查CNAME记录  
nslookup www.opening.icu

# 详细DNS信息
dig opening.icu
```

### 在线验证工具
- **DNS传播**: https://whatsmydns.net/?d=opening.icu&t=A
- **SSL检查**: https://www.ssllabs.com/ssltest/analyze.html?d=opening.icu
- **网站状态**: https://downforeveryoneorjustme.com/opening.icu

## ⏱️ 配置时间线

### 预期时间表
- **DNS记录添加**: 立即完成
- **DNS传播**: 5-30分钟
- **Vercel验证**: 1-5分钟
- **SSL证书配置**: 5-15分钟
- **完全生效**: 最长2小时

### 状态检查清单
- [ ] DNS记录已添加
- [ ] DNS传播完成 (全球节点)
- [ ] Vercel域名状态显示"Valid"
- [ ] SSL证书状态显示"Issued"
- [ ] 网站可通过 https://opening.icu 访问
- [ ] 所有功能正常工作

## 🧪 功能验证测试

### 基本访问测试
```bash
# 测试主域名访问
curl -I https://opening.icu

# 测试www重定向
curl -I https://www.opening.icu

# 测试API端点
curl https://opening.icu/api/files
```

### 完整功能验证
```bash
# 使用验证脚本
node scripts/verify-deployment.js https://opening.icu your-admin-key

# 检查所有功能
npm run deploy:verify https://opening.icu
```

## 🔧 环境变量更新

### 更新Vercel环境变量
配置域名后，需要更新以下环境变量：

```bash
NEXTAUTH_URL="https://opening.icu"
DOMAIN_NAME="opening.icu"
```

### 更新步骤
1. Vercel控制台 → 项目设置 → **Environment Variables**
2. 编辑 `NEXTAUTH_URL` 变量值为 `https://opening.icu`
3. 编辑 `DOMAIN_NAME` 变量值为 `opening.icu`
4. 保存更改并重新部署

## 🚨 故障排除

### 常见问题及解决方案

#### 1. DNS未传播
**症状**: 域名无法访问，DNS查询失败
**解决方案**:
- 等待更长时间 (最长48小时)
- 检查DNS记录配置是否正确
- 使用不同DNS服务器测试

#### 2. SSL证书配置失败
**症状**: 网站显示"不安全"或SSL错误
**解决方案**:
- 确认DNS记录正确配置
- 在Vercel控制台重新触发SSL配置
- 等待证书自动更新

#### 3. Vercel域名验证失败
**症状**: Vercel显示域名状态为"Invalid"
**解决方案**:
- 检查DNS记录是否指向正确的Vercel IP
- 确认域名没有被其他服务占用
- 联系Vercel支持

#### 4. 功能异常
**症状**: 网站可访问但功能不正常
**解决方案**:
- 检查环境变量是否更新
- 验证API端点是否正常响应
- 检查数据库连接

### 诊断命令
```bash
# 检查DNS解析
nslookup opening.icu 8.8.8.8

# 检查HTTP响应
curl -v https://opening.icu

# 检查SSL证书
openssl s_client -connect opening.icu:443 -servername opening.icu
```

## 📊 配置验证报告

### 验证清单
- [ ] **DNS A记录**: opening.icu → 76.76.19.61
- [ ] **DNS CNAME记录**: www.opening.icu → cname.vercel-dns.com
- [ ] **Vercel域名状态**: Valid
- [ ] **SSL证书状态**: Issued
- [ ] **HTTPS访问**: 正常
- [ ] **HTTP重定向**: 自动跳转HTTPS
- [ ] **环境变量**: 已更新
- [ ] **功能测试**: 全部通过

### 性能指标
- **DNS解析时间**: < 100ms
- **SSL握手时间**: < 500ms
- **首页加载时间**: < 3秒
- **API响应时间**: < 2秒

## 🎯 配置完成后的验证

### 自动化验证
```bash
# 运行完整验证
node scripts/verify-deployment.js https://opening.icu

# 检查域名配置
node scripts/check-domain-config.js opening.icu
```

### 手动验证
1. **访问测试**: 在浏览器中访问 https://opening.icu
2. **功能测试**: 测试文件上传、下载、搜索等功能
3. **性能测试**: 检查页面加载速度
4. **移动端测试**: 在手机上访问网站
5. **不同浏览器测试**: Chrome、Firefox、Safari等

## 📈 后续优化建议

### CDN优化
- 启用Cloudflare代理 (橙色云朵)
- 配置缓存规则
- 启用Brotli压缩

### 监控设置
- 配置域名监控告警
- 设置SSL证书到期提醒
- 启用性能监控

### SEO优化
- 配置robots.txt
- 添加sitemap.xml
- 设置适当的meta标签

---

**配置完成后，opening.icu将成为您的文件存储网站的正式域名！** 🎉

## 📞 支持联系

如果在配置过程中遇到问题，请提供：
1. 域名提供商信息
2. DNS配置截图
3. Vercel控制台状态截图
4. 具体错误信息

**预计配置时间**: 30分钟 - 2小时  
**技术难度**: 中等  
**成功率**: 95%+