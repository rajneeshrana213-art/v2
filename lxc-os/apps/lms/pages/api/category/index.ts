import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth-options"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const allCategories = await prisma.courseCategory.findMany()
      return res.status(200).json({
        success: true,
        data: allCategories,
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return res.status(401).json({
        success: false,
        message: "Only Admins can create categories",
      })
    }

    try {
      const { name, description } = req.body
      if (!name) {
        return res.status(400).json({ success: false, message: "Name is required" })
      }

      const category = await prisma.courseCategory.create({
        data: { name, description }
      })

      return res.status(200).json({
        success: true,
        message: "CourseCategory Created Successfully",
        data: category
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
