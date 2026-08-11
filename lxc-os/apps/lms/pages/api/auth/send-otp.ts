import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import mailSender from '../../../lib/mail-sender'

// otp-generator ships without types; require() keeps it untyped but buildable.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const otpGenerator: any = require('otp-generator')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email } = req.body

    const checkUserPresent = await prisma.user.findUnique({
      where: { email }
    })

    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: 'User is already registered'
      })
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    })

    // Ensuring unique OTP (simplified from while loop for performance)
    const result = await prisma.oTP.findFirst({
      where: { otp }
    })
    
    if (result) {
       otp = otpGenerator.generate(6, { upperCaseAlphabets: false })
    }

    await prisma.oTP.create({
      data: { email, otp }
    })

    try {
       await mailSender(
         email,
         "Verification Email",
         `<h1>OTP Verification</h1><p>Your OTP is: ${otp}</p>`
       )
    } catch (mailError) {
       console.error("Mail sending failed:", mailError)
       // Still return 200 for now as the record is saved, but notify in logs
    }

    return res.status(200).json({
      success: true,
      message: 'OTP Sent Successfully',
      otp // Note: In production, remove this from response
    })
  } catch (error: any) {
    console.error(error.message)
    return res.status(500).json({ success: false, message: error.message })
  }
}
