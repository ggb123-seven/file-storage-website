import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { getFileById, incrementDownloadCount } from '@/lib/file-service'

// GET /api/download/[id] - 文件下载
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

    if (isCloudinaryUrl) {
      // 对于Cloudinary文件，重定向到Cloudinary URL
      await incrementDownloadCount(id)

      // 构建带下载参数的Cloudinary URL
      const downloadUrl = fileRecord.path.includes('?')
        ? `${fileRecord.path}&fl_attachment`
        : `${fileRecord.path}?fl_attachment`

      return NextResponse.redirect(downloadUrl, 302)
    } else {
      // 本地文件处理
      if (!existsSync(fileRecord.path)) {
        return NextResponse.json(
          { success: false, error: '文件已损坏或丢失' },
          { status: 404 }
        )
      }

      // 读取本地文件
      const fileBuffer = await readFile(fileRecord.path)

      // 更新下载计数
      await incrementDownloadCount(id)

      // 设置响应头
      const headers = new Headers()
      headers.set('Content-Type', fileRecord.mimeType)
      headers.set('Content-Length', fileRecord.size.toString())
      headers.set(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(fileRecord.originalName)}"`
      )
      headers.set('Cache-Control', 'public, max-age=31536000')

      return new NextResponse(fileBuffer, {
        status: 200,
        headers,
      })
    }
  } catch (error) {
    console.error('文件下载失败:', error)
    return NextResponse.json(
      { success: false, error: '文件下载失败' },
      { status: 500 }
    )
  }
}
