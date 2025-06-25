// 导入数据到PostgreSQL数据库
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

async function importData() {
  const prisma = new PrismaClient()
  
  try {
    console.log('开始导入数据到PostgreSQL...')
    
    // 读取导出的数据
    const exportPath = path.join(__dirname, 'sqlite-export.json')
    if (!fs.existsSync(exportPath)) {
      throw new Error('找不到导出文件: sqlite-export.json')
    }
    
    const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf8'))
    console.log(`准备导入 ${exportData.totalFiles} 个文件记录`)
    
    // 清空现有数据（如果有的话）
    console.log('清空现有数据...')
    await prisma.file.deleteMany()
    
    // 导入文件记录
    console.log('开始导入文件记录...')
    let importedCount = 0
    
    for (const fileData of exportData.files) {
      try {
        await prisma.file.create({
          data: {
            id: fileData.id,
            filename: fileData.filename,
            originalName: fileData.originalName,
            mimeType: fileData.mimeType,
            size: fileData.size,
            path: fileData.path,
            uploadDate: new Date(fileData.uploadDate),
            downloadCount: fileData.downloadCount,
            isActive: fileData.isActive,
            description: fileData.description,
            tags: fileData.tags
          }
        })
        importedCount++
        console.log(`导入: ${fileData.originalName}`)
      } catch (error) {
        console.error(`导入文件记录失败: ${fileData.originalName}`, error.message)
      }
    }
    
    console.log(`导入完成！成功导入 ${importedCount}/${exportData.totalFiles} 个文件记录`)
    
    // 验证导入结果
    const totalFiles = await prisma.file.count()
    console.log(`数据库中现有 ${totalFiles} 个文件记录`)
    
  } catch (error) {
    console.error('导入数据时出错:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  importData().catch(console.error)
}

module.exports = { importData }