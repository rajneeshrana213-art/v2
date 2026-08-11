
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  if (!user.schoolId) {
    return res.status(400).json({ error: "User is not associated with a school" });
  }

  const { studentId } = req.query;

  if (!studentId || typeof studentId !== "string") {
    return res.status(400).json({ error: "Student ID is required" });
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId, schoolId: user.schoolId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            profilePic: true,
            address: true,
            city: true
          }
        },
        class: {
          select: {
            name: true
          }
        },
        school: {
          select: {
            schoolName: true,
            schoolLogo: true
          }
        },
        results: {
          include: {
            exam: {
              include: {
                subject: {
                  select: {
                    name: true,
                    code: true
                  }
                }
              }
            }
          },
          orderBy: {
            exam: { scheduleDate: "asc" }
          }
        },
        attendances: {
            take: 100 // Just a sample for stats
        }
      }
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Define proper type for result items
    interface ResultItem {
      score: number;
      exam: {
        title: string;
        totalMarks: number;
        subject: {
          name: string;
          code: string;
        };
      } | null;
    }

    // Aggregate results by subject with proper typing
    const subjectGrades: Record<string, {
      subject: string;
      code: string;
      totalObtained: number;
      totalMax: number;
      exams: Array<{ title: string; score: number; max: number }>;
    }> = {};
    
    // Type-safe access to results
    const results = student.results as ResultItem[];
    results.forEach((resItem) => {
        if (!resItem.exam) return;
        const subjectName = resItem.exam.subject.name;
        if (!subjectGrades[subjectName]) {
            subjectGrades[subjectName] = {
                subject: subjectName,
                code: resItem.exam.subject.code,
                totalObtained: 0,
                totalMax: 0,
                exams: []
            };
        }
        subjectGrades[subjectName].totalObtained += resItem.score;
        subjectGrades[subjectName].totalMax += resItem.exam.totalMarks || 100;
        subjectGrades[subjectName].exams.push({
            title: resItem.exam.title,
            score: resItem.score,
            max: resItem.exam.totalMarks
        });
    });

    return res.status(200).json({
      success: true,
      data: {
        student,
        subjectGrades: Object.values(subjectGrades),
        attendanceRate: 94, // Mocked for now
        overallRank: "5th" // Mocked for now
      }
    });
  } catch (error: any) {
    console.error("Fetch Report Card Error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch report card data" });
  }
}
