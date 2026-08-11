import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "../../../lib/prisma"
import { instance } from "../../../lib/razorpay"

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

  const { courses } = req.body
  const userId = (session.user as any).id

  if (!courses || courses.length === 0) {
    return res.status(400).json({ success: false, message: "Please provide course IDs" })
  }

  let total_amount = 0

  try {
    for (const course_id of courses) {
      const course = await prisma.course.findUnique({
        where: { id: course_id },
        include: { studentsEnrolled: true },
      })

      if (!course) {
        return res
          .status(404)
          .json({ success: false, message: "Could not find the course" })
      }

      // Check if user is already enrolled
      const isEnrolled = course.studentsEnrolled.some((student) => student.id === userId)
      if (isEnrolled) {
        return res
          .status(400)
          .json({ success: false, message: "Student is already enrolled" })
      }

      total_amount += course.price || 0
    }

    const options = {
      amount: total_amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    }

    const paymentResponse = await instance.orders.create(options)
    
    return res.status(200).json({
      success: true,
      data: paymentResponse,
    })
  } catch (error: any) {
    console.error("Payment capture error:", error)
    return res.status(500).json({ success: false, message: "Could not initiate order" })
  }
}
