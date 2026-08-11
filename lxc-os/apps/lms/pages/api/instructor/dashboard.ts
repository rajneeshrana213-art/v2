import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "../../../lib/prisma"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session || (session.user as any).lmsAccountType !== "INSTRUCTOR") {
    return res.status(401).json({
      success: false,
      message: "Only Instructors can access this dashboard",
    })
  }

  const instructorId = (session.user as any).id

  try {
    const courseDetails = await prisma.course.findMany({
      where: { instructorId },
      include: {
        studentsEnrolled: true,
      },
    })

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnrolled.length
      const totalAmountGenerated = totalStudentsEnrolled * (course.price || 0)

      return {
        id: course.id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        totalStudentsEnrolled,
        totalAmountGenerated,
      }
    })

    return res.status(200).json({
      success: true,
      courses: courseData,
    })
  } catch (error: any) {
    console.error("Instructor stats API error:", error)
    return res.status(500).json({ success: false, message: "Server Error" })
  }
}
