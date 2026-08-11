
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function uploadFile(
  buffer: Buffer,
  folder: string,
  fileType: "image" | "video" | "raw" | "auto",
  originalName?: string
): Promise<{ publicId: string; url: string }> {
  const options: Record<string, any> = {
    folder,
    resource_type: fileType,
    use_filename: true, // changed to true to help Cloudinary detect format
    unique_filename: true,
  };

  if (originalName) {
    const nameWithoutExt = path.parse(originalName).name;
    
    // Sanitize: Remove invalid characters for Cloudinary public_id
    const safeName = nameWithoutExt
      .replace(/\s+/g, "_")
      .replace(/[&#<>"'/\\?%]/g, "_")
      .replace(/_{2,}/g, "_")
      .replace(/^_+|_+$/g, "");

    // For 'raw' resources (like PDFs, signatures, etc.), we MUST include the extension
    // in the public_id for Cloudinary to serve it with the correct Content-Type.
    if (fileType === "raw") {
      options.public_id = originalName
        .replace(/\s+/g, "_")
        .replace(/[&#<>"'/\\?%]/g, "_")
        .replace(/_{2,}/g, "_")
        .replace(/^_+|_+$/g, "");
    } else {
      options.public_id = safeName;
    }
  }

  return await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        reject(new Error(`Upload failed: ${error?.message || "Unknown error"}`));
      } else {
        resolve({
          publicId: result.public_id,
          url: result.secure_url,
        });
      }
    });

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}
