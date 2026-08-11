import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth-options"
import prisma from '../../../../lib/prisma'
import { uploadImageToCloudinary } from '../../../../lib/image-uploader'
import formidable from 'formidable'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session || (session.user as any).role !== "INSTRUCTOR") {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    })
  }

  const form = formidable({ multiples: false })

  // CREATE SUBSECTION
  if (req.method === 'POST') {
    try {
      const [fields, files] = await form.parse(req)
      
      const { sectionId, title, description } = Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [k, v?.[0]])
      )
      const videoFile = files.video?.[0]

      if (!sectionId || !title || !description || !videoFile) {
        return res.status(400).json({ success: false, message: "Missing required fields" })
      }

      const uploadDetails = await uploadImageToCloudinary(
        videoFile.filepath,
        process.env.FOLDER_NAME || "LMS"
      )

      const subSection = await prisma.subSection.create({
        data: {
          title,
          description,
          timeDuration: `${uploadDetails.duration}`,
          videoUrl: uploadDetails.secure_url,
          section: { connect: { id: sectionId } }
        }
      })

      const updatedSection = await prisma.courseSection.findUnique({
        where: { id: sectionId },
        include: { subSections: true }
      })

      return res.status(200).json({
        success: true,
        message: "Subsection created successfully",
        data: updatedSection,
      })
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  // UPDATE SUBSECTION
  if (req.method === 'PUT') {
    try {
        const [fields, files] = await form.parse(req)
        const { subSectionId, sectionId, title, description } = Object.fromEntries(
          Object.entries(fields).map(([k, v]) => [k, v?.[0]])
        )
        const videoFile = files.video?.[0]
  
        if (!subSectionId || !sectionId) {
          return res.status(400).json({ success: false, message: "Missing IDs" })
        }

        const data: any = {}
        if (title) data.title = title
        if (description) data.description = description
        
        if (videoFile) {
            const uploadDetails = await uploadImageToCloudinary(
                videoFile.filepath,
                process.env.FOLDER_NAME || "LMS"
            )
            data.videoUrl = uploadDetails.secure_url
            data.timeDuration = `${uploadDetails.duration}`
        }

        await prisma.subSection.update({
            where: { id: subSectionId },
            data
        })

        const updatedSection = await prisma.courseSection.findUnique({
            where: { id: sectionId },
            include: { subSections: true }
        })

        return res.status(200).json({
            success: true,
            message: "Subsection updated successfully",
            data: updatedSection,
        })
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  // DELETE SUBSECTION
  if (req.method === 'DELETE') {
    // Formidable doesn't parse DELETE bodies by default easily, use regular req.body if sent via query or JSON
    // However, some clients send DELETE with application/x-www-form-urlencoded.
    // For simplicity, I'll switch to querying if needed, but here assuming they send standard body if we enable it.
    // But since config.bodyParser is false, I'll use form.parse for consistency.
    try {
        const [fields] = await form.parse(req)
        const { subSectionId, sectionId } = Object.fromEntries(
            Object.entries(fields).map(([k, v]) => [k, v?.[0]])
        )

        if (!subSectionId || !sectionId) {
            return res.status(400).json({ success: false, message: "Missing IDs" })
        }

        await prisma.subSection.delete({
            where: { id: subSectionId }
        })

        const updatedSection = await prisma.courseSection.findUnique({
            where: { id: sectionId },
            include: { subSections: true }
        })

        return res.status(200).json({
            success: true,
            message: "Subsection deleted successfully",
            data: updatedSection,
        })
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
