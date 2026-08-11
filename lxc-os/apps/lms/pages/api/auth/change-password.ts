import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "./[...nextauth]"
import prisma from "../../../lib/prisma"
import bcrypt from "bcryptjs"
import mailSender from "../../../lib/mail-sender"
import { passwordUpdated } from "../../../lib/mail-templates/password-update"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { oldPassword, newPassword } = req.body

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "All fields are required" })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
    })

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password as string)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect current password" })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    // Send confirmation email
    try {
      await mailSender(
        user.email,
        "Password Updated",
        passwordUpdated(user.email, (user as any).firstName)
      )
    } catch (error) {
      console.error("Failed to send password update email:", error)
    }

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error: any) {
    console.error("Password change error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}
