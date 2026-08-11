import { v2 as cloudinary, UploadApiOptions } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
})

export const uploadImageToCloudinary = async (
  filePath: string,
  folder: string,
  height?: number,
  quality?: number
) => {
  const options: UploadApiOptions = { folder }
  if (height) options.height = height
  if (quality) options.quality = quality
  options.resource_type = "auto"
  
  return await cloudinary.uploader.upload(filePath, options)
}
