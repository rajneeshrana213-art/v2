import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import prisma from '../../../lib/prisma'
import { LmsAccountType } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body

    if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      })
    }

    // Find the most recent OTP for the email
    const recentOtp = await prisma.oTP.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' }
    })

    if (!recentOtp || otp !== recentOtp.otp) {
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const userLmsAccountType = accountType?.toUpperCase() as LmsAccountType || LmsAccountType.STUDENT
    
    // Auto-approve unless instructor? Original logic was bit weird with `approved === "Instructor" ? false : true`
    const isApproved = userLmsAccountType === LmsAccountType.INSTRUCTOR ? false : true

    // Create user with nested profile
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone: contactNumber || "0000000000",
        address: "N/A",
        city: "N/A",
        state: "N/A",
        country: "N/A",
        pincode: "000000",
        bloodType: "Unknown",
        sex: "OTHERS",
        role: userLmsAccountType === LmsAccountType.INSTRUCTOR ? "teacher" : "student",
        password: hashedPassword,
        lmsAccountType: userLmsAccountType,
        approved: isApproved,
        profile: {
          create: {
            contactNumber
          }
        }
      },
      include: {
        profile: true
      }
    })

    return res.status(200).json({
      success: true,
      user,
      message: "User registered successfully",
    })
  } catch (error: any) {
    console.error(error.message)
    return res.status(500).json({ success: false, message: error.message })
  }
}
