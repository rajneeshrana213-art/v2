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
    const userId = (session.user as any).id

    // Fetch user with their enrolled courses
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrolledCourses: {
          include: {
            courseContent: {
              include: {
                subSections: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    const coursesWithProgress = await Promise.all(
      user.enrolledCourses.map(async (course) => {
        let totalDurationInSeconds = 0
        let totalSubSections = 0

        course.courseContent.forEach((section) => {
          totalSubSections += section.subSections.length
          section.subSections.forEach((subSection) => {
            totalDurationInSeconds += parseInt(subSection.timeDuration || "0")
          })
        })

        // Fetch progress for this specific course and user
        const courseProgress = await prisma.courseProgress.findFirst({
          where: {
            courseId: course.id,
            userId: userId,
          },
        })

        const completedCount = courseProgress?.completedVideos?.length || 0
        let progressPercentage = 100
        if (totalSubSections !== 0) {
          const multiplier = Math.pow(10, 2)
          progressPercentage =
            Math.round((completedCount / totalSubSections) * 100 * multiplier) / multiplier
        }

        return {
          ...course,
          totalDuration: formatDuration(totalDurationInSeconds),
          progressPercentage,
        }
      })
    )

    return res.status(200).json({
      success: true,
      data: coursesWithProgress,
    })
  } catch (error: any) {
    console.error("Enrolled courses API error:", error)
    return res.status(500).json({ success: false, message: error.message })
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
