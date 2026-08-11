import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "../../../lib/prisma"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ success: false, message: "Method not allowed" })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session || (session.user as any).lmsAccountType !== "Instructor") {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { courseId } = req.body

  if (!courseId) {
    return res.status(400).json({ success: false, message: "Course ID is required" })
  }

  try {
    // Delete-related data (cascade handles some in Prisma if configured, 
    // but here we manually handle complex removals like enrollments if necessary)
    
    // Check if the instructor owns the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course || course.instructorId !== (session.user as any).id) {
        return res.status(403).json({ success: false, message: "Forbidden" })
    }

    await prisma.course.delete({
      where: { id: courseId },
    })

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error: any) {
    console.error("Delete course error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}
