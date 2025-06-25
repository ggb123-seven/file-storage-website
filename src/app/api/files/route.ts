import { NextRequest, NextResponse } from 'next/server'
import { getFiles, deleteFile } from '@/lib/file-service'

// GET /api/files - 获取文件列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      search: searchParams.get('search') || '',
      mimeType: searchParams.get('mimeType') || '',
      sortBy: searchParams.get('sortBy') || 'uploadDate',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    }

    const result = await getFiles(params)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('获取文件列表失败:', error)
    return NextResponse.json(
      { success: false, error: '获取文件列表失败' },
      { status: 500 }
    )
  }
}

// DELETE /api/files - 删除文件
export async function DELETE(request: NextRequest) {
  try {
    // 检查管理员权限
    const adminKey = request.headers.get('x-admin-key')
    if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: '无权限删除文件' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: '缺少文件ID' },
        { status: 400 }
      )
    }

    // 软删除文件（标记为不可用）
    const updatedFile = await deleteFile(fileId)

    return NextResponse.json({
      success: true,
      data: { id: updatedFile.id, message: '文件删除成功' },
    })
  } catch (error) {
    console.error('删除文件失败:', error)
    return NextResponse.json(
      { success: false, error: '删除文件失败' },
      { status: 500 }
    )
  }
}
