import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
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
  if (!session) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const instructorCourses = await prisma.course.findMany({
      where: {
        instructorId: (session.user as any).id,
      },
      include: {
        category: true,
        courseContent: {
          include: {
            subSections: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message })
  }
}
