import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth-options"
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    })
  }

  const userId = (session.user as any).id

  // GET ALL USER DETAILS
  if (req.method === 'GET') {
    try {
      const userDetails = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
      })

      return res.status(200).json({
        success: true,
        message: "User Data fetched successfully",
        data: userDetails,
      })
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  // UPDATE PROFILE
  if (req.method === 'PUT') {
    try {
      const {
        firstName,
        lastName,
        dateOfBirth,
        about,
        contactNumber,
        gender,
      } = req.body

      await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          profile: {
            upsert: {
              create: { dateOfBirth, about, contactNumber, gender },
              update: { dateOfBirth, about, contactNumber, gender }
            }
          }
        }
      })

      const updatedUserDetails = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
      })

      return res.json({
        success: true,
        message: "Profile updated successfully",
        updatedUserDetails,
      })
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  // DELETE ACCOUNT
  if (req.method === 'DELETE') {
    try {
      // In Prisma, cascade delete is configured in the schema for Profile.
      // We also need to handle Course enrollments (M:N).
      await prisma.user.delete({
        where: { id: userId }
      })

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
      })
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
