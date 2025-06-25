import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { getFileById } from '@/lib/file-service'

// GET /api/files/preview/[id] - 文件预览
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 查找文件记录
    const fileRecord = await getFileById(id)

    if (!fileRecord) {
      return NextResponse.json(
        { success: false, error: '文件不存在' },
        { status: 404 }
      )
    }

    // 检查是否为Cloudinary URL
    const isCloudinaryUrl = fileRecord.path.startsWith('http://') || fileRecord.path.startsWith('https://')

    if (!isCloudinaryUrl) {
      // 本地文件检查
      if (!existsSync(fileRecord.path)) {
        return NextResponse.json(
          { success: false, error: '文件已损坏或丢失' },
          { status: 404 }
        )
      }
    }

    // 检查是否为可预览的文件类型
    const previewableTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/markdown',
    ]

    if (!previewableTypes.includes(fileRecord.mimeType)) {
      return NextResponse.json(
        { success: false, error: '该文件类型不支持预览' },
        { status: 400 }
      )
    }

    if (isCloudinaryUrl) {
      // 对于Cloudinary文件，重定向到Cloudinary URL
      return NextResponse.redirect(fileRecord.path, 302)
    } else {
      // 读取本地文件
      const fileBuffer = await readFile(fileRecord.path)

      // 设置响应头
      const headers = new Headers()
      headers.set('Content-Type', fileRecord.mimeType)
      headers.set('Content-Length', fileRecord.size.toString())
      headers.set('Cache-Control', 'public, max-age=3600') // 1小时缓存

      // 对于图片，设置内联显示
      if (fileRecord.mimeType.startsWith('image/')) {
        headers.set('Content-Disposition', 'inline')
      }

      return new NextResponse(fileBuffer, {
        status: 200,
        headers,
      })
    }
  } catch (error) {
    console.error('文件预览失败:', error)
    return NextResponse.json(
      { success: false, error: '文件预览失败' },
      { status: 500 }
    )
  }
}
