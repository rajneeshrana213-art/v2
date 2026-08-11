import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import mailSender from "../../../lib/mail-sender"
import { paymentSuccessEmail } from "../../../lib/mail-templates/payment-success-email"

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

  const { orderId, paymentId, amount } = req.body
  const userId = (session.user as any).id
  const userName = `${session.user?.name}`
  const userEmail = `${session.user?.email}`

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all details" })
  }

  try {
    await mailSender(
      userEmail,
      `Payment Received`,
      paymentSuccessEmail(userName, amount / 100, orderId, paymentId)
    )
    return res.status(200).json({ success: true, message: "Email sent successfully" })
  } catch (error: any) {
    console.error("Payment success email failed:", error)
    return res.status(500).json({ success: false, message: "Could not send email" })
  }
}
