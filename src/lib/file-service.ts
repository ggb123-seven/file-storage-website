import { prisma } from './db'
import { Prisma } from '@prisma/client'
import { deleteFromCloudinary } from './cloudinary'

export interface FileSearchParams {
  page?: number
  limit?: number
  search?: string
  mimeType?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CreateFileData {
  filename: string
  originalName: string
  mimeType: string
  size: number
  path: string
  description?: string
  tags?: string
}

// 获取文件列表
export async function getFiles(params: FileSearchParams = {}) {
  const {
    page = 1,
    limit = 20,
    search = '',
    mimeType = '',
    sortBy = 'uploadDate',
    sortOrder = 'desc'
  } = params

  // 构建查询条件
  const where: Prisma.FileWhereInput = {
    isActive: true,
  }

  if (search) {
    where.OR = [
      { originalName: { contains: search } },
      { description: { contains: search } },
    ]
  }

  if (mimeType) {
    where.mimeType = { startsWith: mimeType }
  }

  // 计算分页
  const skip = (page - 1) * limit

  // 构建排序
  const orderBy: Prisma.FileOrderByWithRelationInput = {}
  orderBy[sortBy as keyof Prisma.FileOrderByWithRelationInput] = sortOrder

  // 查询文件列表和总数
  const [files, total] = await Promise.all([
    prisma.file.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        filename: true,
        originalName: true,
        mimeType: true,
        size: true,
        uploadDate: true,
        downloadCount: true,
        description: true,
        tags: true,
      },
    }),
    prisma.file.count({ where }),
  ])

  return {
    files,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// 根据ID获取文件
export async function getFileById(id: string) {
  return prisma.file.findUnique({
    where: { id, isActive: true },
  })
}

// 创建文件记录
export async function createFile(data: CreateFileData) {
  return prisma.file.create({
    data: {
      ...data,
      description: data.description || null,
      tags: data.tags || null,
    },
  })
}

// 更新文件下载计数
export async function incrementDownloadCount(id: string) {
  return prisma.file.update({
    where: { id },
    data: { downloadCount: { increment: 1 } },
  })
}

// 软删除文件
export async function deleteFile(id: string) {
  // 首先获取文件信息
  const file = await prisma.file.findUnique({
    where: { id }
  })

  if (!file) {
    throw new Error('文件不存在')
  }

  // 检查是否为Cloudinary文件
  const isCloudinaryFile = file.path.startsWith('http://') || file.path.startsWith('https://')

  if (isCloudinaryFile && file.tags) {
    // 从tags中提取Cloudinary publicId
    const cloudinaryTag = file.tags.split(',').find(tag => tag.startsWith('cloudinary:'))
    if (cloudinaryTag) {
      const publicId = cloudinaryTag.replace('cloudinary:', '')
      try {
        // 从Cloudinary删除文件
        await deleteFromCloudinary(publicId)
        console.log(`已从Cloudinary删除文件: ${publicId}`)
      } catch (error) {
        console.error(`从Cloudinary删除文件失败: ${publicId}`, error)
        // 即使Cloudinary删除失败，仍然继续软删除数据库记录
      }
    }
  }

  // 软删除数据库记录
  return prisma.file.update({
    where: { id },
    data: { isActive: false },
  })
}

// 获取文件统计信息
export async function getFileStats() {
  const [totalFiles, totalSize, filesByType] = await Promise.all([
    prisma.file.count({ where: { isActive: true } }),
    prisma.file.aggregate({
      where: { isActive: true },
      _sum: { size: true },
    }),
    prisma.file.groupBy({
      by: ['mimeType'],
      where: { isActive: true },
      _count: { mimeType: true },
      _sum: { size: true },
    }),
  ])

  return {
    totalFiles,
    totalSize: totalSize._sum.size || 0,
    filesByType,
  }
}
