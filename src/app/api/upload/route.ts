import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { createFile } from '@/lib/file-service'
import { isValidFileType } from '@/lib/utils'
import { verifyAdminPermission } from '@/lib/auth'
import { uploadToCloudinary } from '@/lib/cloudinary'

// POST /api/upload - 文件上传
export async function POST(request: NextRequest) {
  try {
    // 检查管理员权限
    const permissionCheck = verifyAdminPermission(request.headers)
    if (!permissionCheck.isValid) {
      return NextResponse.json(
        { success: false, error: permissionCheck.error },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const description = formData.get('description') as string || ''
    const tags = formData.get('tags') as string || ''

    if (!file) {
      return NextResponse.json(
        { success: false, error: '未选择文件' },
        { status: 400 }
      )
    }

    // 验证文件类型
    if (!isValidFileType(file.type)) {
      return NextResponse.json(
        { success: false, error: '不支持的文件类型' },
        { status: 400 }
      )
    }

    // 验证文件大小
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '104857600') // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: '文件大小超出限制' },
        { status: 400 }
      )
    }

    // 生成唯一文件名
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = path.extname(file.name)
    const filename = `${timestamp}_${randomString}${fileExtension}`

    // 获取文件buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 检查是否使用Cloudinary (生产环境)
    const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
                          process.env.CLOUDINARY_API_KEY &&
                          process.env.CLOUDINARY_API_SECRET

    let filePath: string
    let cloudinaryData: any = null

    if (useCloudinary) {
      // 上传到Cloudinary
      try {
        cloudinaryData = await uploadToCloudinary(buffer, filename, file.type)
        filePath = cloudinaryData.secureUrl // 使用Cloudinary的安全URL
      } catch (cloudinaryError) {
        console.error('Cloudinary上传失败:', cloudinaryError)
        return NextResponse.json(
          { success: false, error: 'Cloudinary上传失败' },
          { status: 500 }
        )
      }
    } else {
      // 本地文件存储 (开发环境)
      const uploadDir = process.env.UPLOAD_DIR || './uploads'
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      filePath = path.join(uploadDir, filename)
      await writeFile(filePath, buffer)
    }

    // 保存文件信息到数据库
    const fileRecord = await createFile({
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      path: filePath, // 对于Cloudinary是URL，对于本地是文件路径
      description: description || undefined,
      tags: tags || undefined,
      // 如果使用Cloudinary，可以在tags中存储publicId用于删除
      ...(cloudinaryData && {
        tags: tags ? `${tags},cloudinary:${cloudinaryData.publicId}` : `cloudinary:${cloudinaryData.publicId}`
      })
    })

    return NextResponse.json({
      success: true,
      data: {
        id: fileRecord.id,
        filename: fileRecord.filename,
        originalName: fileRecord.originalName,
        size: fileRecord.size,
        mimeType: fileRecord.mimeType,
        uploadDate: fileRecord.uploadDate,
      },
    })
  } catch (error) {
    console.error('文件上传失败:', error)
    return NextResponse.json(
      { success: false, error: '文件上传失败' },
      { status: 500 }
    )
  }
}
