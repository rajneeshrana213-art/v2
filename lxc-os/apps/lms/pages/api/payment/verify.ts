import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "../../../lib/prisma"
import crypto from "crypto"
import mailSender from "../../../lib/mail-sender"
import { courseEnrollmentEmail } from "../../../lib/mail-templates/course-enrollment-email"

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

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courses } = req.body
  const userId = (session.user as any).id
  const userName = `${session.user?.name}`
  const userEmail = `${session.user?.email}`

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses) {
    return res.status(400).json({ success: false, message: "Payment info missing" })
  }

  // Verify Signature
  const body = razorpay_order_id + "|" + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET!)
    .update(body.toString())
    .digest("hex")

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: "Payment verification failed" })
  }

  try {
    // Enroll the student in courses
    for (const courseId of courses) {
      const updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: {
          studentsEnrolled: {
            connect: { id: userId },
          },
        },
      })

      await prisma.user.update({
        where: { id: userId },
        data: {
          enrolledCourses: {
            connect: { id: courseId },
          },
        },
      })

      // Initialize Course Progress
      await prisma.courseProgress.create({
        data: {
          courseId,
          userId,
          completedVideos: [],
        },
      })

      // Send Enrollment Email
      try {
        await mailSender(
          userEmail,
          `Successfully Enrolled into ${updatedCourse.courseName}`,
          courseEnrollmentEmail(updatedCourse.courseName, userName)
        )
      } catch (emailError) {
        console.error("Enrollment email failed:", emailError)
      }
    }

    return res.status(200).json({ success: true, message: "Payment verified and enrollment successful" })
  } catch (error: any) {
    console.error("Payment verification error:", error)
    return res.status(500).json({ success: false, message: "Internal server error during enrollment" })
  }
}
