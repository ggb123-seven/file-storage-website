import { NextRequest, NextResponse } from 'next/server'
import { getFileStats } from '@/lib/file-service'

// GET /api/stats - 获取文件统计信息
export async function GET(request: NextRequest) {
  try {
    const stats = await getFileStats()

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('获取统计信息失败:', error)
    return NextResponse.json(
      { success: false, error: '获取统计信息失败' },
      { status: 500 }
    )
  }
}
