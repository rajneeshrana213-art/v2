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
  const { courseId } = req.body

  if (!courseId) {
    return res.status(400).json({ success: false, message: "Course ID is required" })
  }

  try {
    const courseDetails = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          include: {
            profile: true,
          },
        },
        category: true,
        ratingAndReviews: {
          include: {
            user: true,
          },
        },
        courseContent: {
          include: {
            subSections: true,
          },
        },
      },
    })

    if (!courseDetails) {
      return res.status(404).json({ success: false, message: "Course not found" })
    }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((section) => {
      section.subSections.forEach((subSection) => {
        totalDurationInSeconds += parseInt(subSection.timeDuration || "0")
      })
    })

    const totalDuration = formatDuration(totalDurationInSeconds)

    // Handle progress if user is logged in
    let completedVideos: string[] = []
    if (session) {
      const courseProgress = await prisma.courseProgress.findFirst({
        where: {
          courseId,
          userId: (session.user as any).id,
        },
      })
      completedVideos = courseProgress?.completedVideos || []
    }

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos,
      },
    })
  } catch (error: any) {
    console.error("Course details API error:", error)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}
