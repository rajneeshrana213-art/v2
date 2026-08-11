import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth-options"
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET ALL REVIEWS
  if (req.method === 'GET') {
    try {
      const { courseId } = req.query
      
      if (courseId) {
        const result = await prisma.ratingAndReview.aggregate({
          where: { courseId: courseId as string },
          _avg: { rating: true }
        })
        return res.status(200).json({
          success: true,
          averageRating: result._avg.rating || 0
        })
      }

      const allReviews = await prisma.ratingAndReview.findMany({
        orderBy: { rating: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true, image: true } },
          course: { select: { courseName: true } }
        }
      })
      return res.status(200).json({ success: true, data: allReviews })
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  // CREATE RATING
  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ success: false, message: "Authentication required" })
    }
    const userId = (session.user as any).id
    const { rating, review, courseId } = req.body

    try {
      // Check enrollment
      const enrolled = await prisma.course.findFirst({
        where: {
          id: courseId,
          studentsEnrolled: { some: { id: userId } }
        }
      })

      if (!enrolled) {
        return res.status(404).json({ success: false, message: "Student is not enrolled in this course" })
      }

      // Check if already reviewed
      const alreadyReviewed = await prisma.ratingAndReview.findFirst({
        where: { userId, courseId }
      })

      if (alreadyReviewed) {
        return res.status(403).json({ success: false, message: "Course already reviewed by user" })
      }

      const ratingReview = await prisma.ratingAndReview.create({
        data: {
          rating,
          review,
          userId,
          courseId
        }
      })

      return res.status(201).json({
        success: true,
        message: "Rating and review created successfully",
        ratingReview,
      })
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
