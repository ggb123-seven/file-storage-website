// 测试Cloudinary集成
const { uploadToCloudinary, deleteFromCloudinary, configureCloudinary } = require('../src/lib/cloudinary.ts')
const fs = require('fs')
const path = require('path')

async function testCloudinary() {
  try {
    console.log('🧪 开始测试Cloudinary集成...')
    
    // 检查环境变量
    const requiredEnvs = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
    const missingEnvs = requiredEnvs.filter(env => !process.env[env])
    
    if (missingEnvs.length > 0) {
      console.log('⚠️  缺少Cloudinary环境变量:')
      missingEnvs.forEach(env => console.log(`   - ${env}`))
      console.log('💡 请在.env文件中配置这些变量后重试')
      return
    }
    
    console.log('✅ Cloudinary环境变量已配置')
    
    // 创建测试文件
    const testContent = `Cloudinary测试文件
创建时间: ${new Date().toISOString()}
测试内容: 这是一个用于测试Cloudinary上传功能的文件
`
    const testFileName = 'cloudinary-test.txt'
    const testBuffer = Buffer.from(testContent, 'utf8')
    
    console.log('📤 测试文件上传到Cloudinary...')
    
    // 上传测试文件
    const uploadResult = await uploadToCloudinary(testBuffer, testFileName, 'text/plain')
    
    console.log('✅ 文件上传成功!')
    console.log(`   URL: ${uploadResult.url}`)
    console.log(`   Secure URL: ${uploadResult.secureUrl}`)
    console.log(`   Public ID: ${uploadResult.publicId}`)
    
    // 等待几秒钟确保文件已处理
    console.log('⏳ 等待文件处理...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // 测试文件访问
    console.log('🔍 测试文件访问...')
    const response = await fetch(uploadResult.secureUrl)
    if (response.ok) {
      const content = await response.text()
      console.log('✅ 文件访问成功')
      console.log(`   内容长度: ${content.length} 字符`)
    } else {
      console.log('❌ 文件访问失败:', response.status)
    }
    
    // 测试文件删除
    console.log('🗑️  测试文件删除...')
    await deleteFromCloudinary(uploadResult.publicId)
    console.log('✅ 文件删除成功')
    
    // 验证文件已删除
    console.log('🔍 验证文件已删除...')
    const deleteResponse = await fetch(uploadResult.secureUrl)
    if (deleteResponse.status === 404) {
      console.log('✅ 文件已成功删除')
    } else {
      console.log('⚠️  文件可能仍然存在 (Cloudinary缓存延迟)')
    }
    
    console.log('🎉 Cloudinary集成测试完成!')
    
  } catch (error) {
    console.error('❌ Cloudinary测试失败:', error.message)
    
    if (error.message.includes('Invalid API Key')) {
      console.log('💡 请检查CLOUDINARY_API_KEY是否正确')
    } else if (error.message.includes('Invalid API Secret')) {
      console.log('💡 请检查CLOUDINARY_API_SECRET是否正确')
    } else if (error.message.includes('Invalid cloud name')) {
      console.log('💡 请检查CLOUDINARY_CLOUD_NAME是否正确')
    }
  }
}

if (require.main === module) {
  testCloudinary().catch(console.error)
}

module.exports = { testCloudinary }