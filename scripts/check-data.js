// 检查SQLite数据库中的数据
const { PrismaClient } = require('@prisma/client')

async function checkData() {
  const prisma = new PrismaClient()
  
  try {
    console.log('检查SQLite数据库中的文件记录...')
    
    const files = await prisma.file.findMany()
    console.log(`找到 ${files.length} 个文件记录:`)
    
    files.forEach((file, index) => {
      console.log(`${index + 1}. ${file.originalName} (${file.filename})`)
      console.log(`   大小: ${file.size} bytes`)
      console.log(`   类型: ${file.mimeType}`)
      console.log(`   上传时间: ${file.uploadDate}`)
      console.log(`   路径: ${file.path}`)
      console.log(`   下载次数: ${file.downloadCount}`)
      console.log('---')
    })
    
    if (files.length > 0) {
      console.log('\n需要导出这些数据到PostgreSQL')
    } else {
      console.log('\n数据库为空，无需导出数据')
    }
    
  } catch (error) {
    console.error('检查数据时出错:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkData()