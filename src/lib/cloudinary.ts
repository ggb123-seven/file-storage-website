// Cloudinary配置和工具函数
import { v2 as cloudinary } from 'cloudinary'

// 配置Cloudinary
export const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

// 上传文件到Cloudinary
export const uploadToCloudinary = async (
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{
  url: string
  publicId: string
  secureUrl: string
}> => {
  configureCloudinary()

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        public_id: `file-storage/${Date.now()}_${filename}`,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else if (result) {
          resolve({
            url: result.url,
            publicId: result.public_id,
            secureUrl: result.secure_url,
          })
        } else {
          reject(new Error('Upload failed'))
        }
      }
    ).end(buffer)
  })
}

// 删除Cloudinary文件
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  configureCloudinary()
  
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Failed to delete from Cloudinary:', error)
    throw error
  }
}

// 获取Cloudinary文件信息
export const getCloudinaryFileInfo = async (publicId: string) => {
  configureCloudinary()
  
  try {
    const result = await cloudinary.api.resource(publicId)
    return result
  } catch (error) {
    console.error('Failed to get file info from Cloudinary:', error)
    throw error
  }
}
