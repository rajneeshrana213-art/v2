import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth-options"
import prisma from '../../../lib/prisma'
import { uploadImageToCloudinary } from '../../../lib/image-uploader'
import formidable from 'formidable'
import { CourseStatus } from '@prisma/client'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session || (session.user as any).role !== "INSTRUCTOR") {
    return res.status(401).json({
      success: false,
      message: "Only Instructors can create courses",
    })
  }

  const form = formidable({ multiples: false })

  try {
    const [fields, files] = await form.parse(req)
    
    const courseName = fields.courseName?.[0]
    const courseDescription = fields.courseDescription?.[0]
    const whatYouWillLearn = fields.whatYouWillLearn?.[0]
    const price = parseFloat(fields.price?.[0] || "0")
    const categoryId = fields.category?.[0]
    const status = fields.status?.[0] as CourseStatus || CourseStatus.DRAFT
    
    // Arrays come as JSON stringified strings usually in these MERN patterns
    const tag = JSON.parse(fields.tag?.[0] || "[]")
    const instructions = JSON.parse(fields.instructions?.[0] || "[]")

    const thumbnailFile = files.thumbnailImage?.[0]

    if (!courseName || !courseDescription || !categoryId || !thumbnailFile) {
        return res.status(400).json({
            success: false,
            message: "Missing mandatory fields"
        })
    }

    // Upload to Cloudinary
    const thumbnailUpload = await uploadImageToCloudinary(
        thumbnailFile.filepath,
        process.env.FOLDER_NAME || "LMS"
    )

    // Create Course via Prisma
    const newCourse = await prisma.course.create({
        data: {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            tag,
            status,
            instructions,
            thumbnail: thumbnailUpload.secure_url,
            instructor: {
                connect: { id: (session.user as any).id }
            },
            category: {
                connect: { id: categoryId }
            }
        }
    })

    return res.status(200).json({
      success: true,
      data: newCourse,
      message: "Course Created Successfully",
    })

  } catch (error: any) {
    console.error(error.message)
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message
    })
  }
}
