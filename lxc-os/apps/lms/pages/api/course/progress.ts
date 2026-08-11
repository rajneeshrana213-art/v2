import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "../../../lib/prisma"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ success: false, message: "Authentication required" })
  }

  const userId = (session.user as any).id
  const { courseId, subsectionId } = req.body

  if (!courseId || !subsectionId) {
    return res.status(400).json({ success: false, message: "Missing required fields" })
  }

  try {
    const subsection = await prisma.subSection.findUnique({
      where: { id: subsectionId },
    })
    if (!subsection) {
      return res.status(404).json({ success: false, message: "Invalid subsection" })
    }

    let courseProgress = await prisma.courseProgress.findFirst({
      where: {
        courseId,
        userId,
      },
    })

    if (!courseProgress) {
      await prisma.courseProgress.create({
        data: {
          courseId,
          userId,
          completedVideos: [subsectionId],
        },
      })
    } else {
      if (courseProgress.completedVideos.includes(subsectionId)) {
        return res
          .status(200)
          .json({ success: true, message: "Already completed" })
      }

      await prisma.courseProgress.update({
        where: { id: courseProgress.id },
        data: {
          completedVideos: {
            push: subsectionId,
          },
        },
      })
    }

    return res.status(200).json({ success: true, message: "Progress updated successfully" })
  } catch (error: any) {
    console.error("Progress API error:", error)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}
