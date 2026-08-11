import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth-options"
import prisma from '../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session || (session.user as any).role !== "INSTRUCTOR") {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    })
  }

  // CREATE SECTION
  if (req.method === 'POST') {
    try {
      const { sectionName, courseId } = req.body
      if (!sectionName || !courseId) {
        return res.status(400).json({ success: false, message: "Missing fields" })
      }

      const newSection = await prisma.courseSection.create({
        data: {
          sectionName,
          course: { connect: { id: courseId } }
        }
      })

      const updatedCourse = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            courseContent: {
                include: { subSections: true }
            }
        }
      })

      return res.status(200).json({
        success: true,
        message: "CourseSection created successfully",
        updatedCourse,
      })
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  // UPDATE SECTION
  if (req.method === 'PUT') {
    try {
      const { sectionName, sectionId, courseId } = req.body
      if (!sectionName || !sectionId) {
        return res.status(400).json({ success: false, message: "Missing fields" })
      }

      const updatedSection = await prisma.courseSection.update({
        where: { id: sectionId },
        data: { sectionName }
      })

      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            courseContent: {
                include: { subSections: true }
            }
        }
      })

      return res.status(200).json({
        success: true,
        message: "CourseSection updated successfully",
        data: course,
      })
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  // DELETE SECTION
  if (req.method === 'DELETE') {
    try {
      const { sectionId, courseId } = req.body
      if (!sectionId) {
        return res.status(400).json({ success: false, message: "Missing sectionId" })
      }

      await prisma.courseSection.delete({
        where: { id: sectionId }
      })

      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            courseContent: {
                include: { subSections: true }
            }
        }
      })

      return res.status(200).json({
        success: true,
        message: "CourseSection deleted successfully",
        data: course,
      })
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
