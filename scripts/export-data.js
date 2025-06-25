// 导出SQLite数据到JSON文件
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

async function exportData() {
  const prisma = new PrismaClient()
  
  try {
    console.log('开始导出SQLite数据...')
    
    // 导出所有文件记录
    const files = await prisma.file.findMany({
      orderBy: {
        uploadDate: 'asc'
      }
    })
    
    console.log(`找到 ${files.length} 个文件记录`)
    
    // 创建导出数据对象
    const exportData = {
      exportDate: new Date().toISOString(),
      totalFiles: files.length,
      files: files.map(file => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        path: file.path,
        uploadDate: file.uploadDate.toISOString(),
        downloadCount: file.downloadCount,
        isActive: file.isActive,
        description: file.description,
        tags: file.tags
      }))
    }
    
    // 保存到JSON文件
    const exportPath = path.join(__dirname, 'sqlite-export.json')
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2))
    
    console.log(`数据已导出到: ${exportPath}`)
    console.log('导出完成！')
    
    return exportData
    
  } catch (error) {
    console.error('导出数据时出错:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  exportData().catch(console.error)
}

module.exports = { exportData }