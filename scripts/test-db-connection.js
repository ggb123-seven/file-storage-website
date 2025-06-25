// 测试数据库连接
const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient()
  
  try {
    console.log('测试数据库连接...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '已配置' : '未配置')
    
    // 测试连接
    await prisma.$connect()
    console.log('✅ 数据库连接成功')
    
    // 测试基本查询
    const fileCount = await prisma.file.count()
    console.log(`📊 数据库中有 ${fileCount} 个文件记录`)
    
    // 测试创建操作
    console.log('🧪 测试数据库操作...')
    const testFile = await prisma.file.create({
      data: {
        filename: 'test_connection.txt',
        originalName: 'connection-test.txt',
        mimeType: 'text/plain',
        size: 100,
        path: '/tmp/test.txt',
        description: '数据库连接测试文件'
      }
    })
    console.log('✅ 创建测试记录成功:', testFile.id)
    
    // 删除测试记录
    await prisma.file.delete({
      where: { id: testFile.id }
    })
    console.log('✅ 删除测试记录成功')
    
    console.log('🎉 数据库连接和操作测试通过！')
    
  } catch (error) {
    console.error('❌ 数据库连接测试失败:', error.message)
    
    if (error.code === 'P1001') {
      console.log('💡 建议检查:')
      console.log('   1. DATABASE_URL是否正确配置')
      console.log('   2. 数据库服务是否运行')
      console.log('   3. 网络连接是否正常')
    }
    
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  testConnection().catch(console.error)
}

module.exports = { testConnection }