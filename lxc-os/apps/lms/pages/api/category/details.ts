import { NextApiRequest, NextApiResponse } from "next"
import prisma from "../../../lib/prisma"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" })
  }

  const { categoryId } = req.body

  if (!categoryId) {
    return res.status(400).json({ success: false, message: "CourseCategory ID is required" })
  }

  try {
    // 1. Get courses for the specified category
    const selectedCategory = await prisma.courseCategory.findUnique({
      where: { id: categoryId },
      include: {
        courses: {
          where: { status: "PUBLISHED" },
          include: {
            instructor: true,
            ratingAndReviews: true,
          },
        },
      },
    })

    if (!selectedCategory) {
      return res.status(404).json({ success: false, message: "CourseCategory not found" })
    }

    // 2. Get courses for other categories
    const otherCategories = await prisma.courseCategory.findMany({
      where: {
        id: { not: categoryId },
      },
      include: {
        courses: {
          where: { status: "PUBLISHED" },
          take: 5,
        },
      },
    })

    const differentCategory = otherCategories.length > 0 
      ? otherCategories[Math.floor(Math.random() * otherCategories.length)]
      : null

    // 3. Get top-selling courses (simulated by students count since we don't have a 'sold' field in schema)
    // In our schema, we can look at the count of studentsEnrolled.
    const mostSellingCourses = await prisma.course.findMany({
      where: { status: "PUBLISHED" },
      orderBy: {
        studentsEnrolled: {
          _count: "desc",
        },
      },
      include: {
        instructor: true,
        ratingAndReviews: true,
        category: true,
      },
      take: 10,
    })

    return res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    })
  } catch (error: any) {
    console.error("CourseCategory page details error:", error)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}
