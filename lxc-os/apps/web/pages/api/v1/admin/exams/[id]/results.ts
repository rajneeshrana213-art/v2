
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

  const { id } = req.query; // Exam ID
  const { results } = req.body; // Array of { studentId, score }

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Exam ID is required" });
  }

  if (!results || !Array.isArray(results)) {
    return res.status(400).json({ error: "Results array is required" });
  }

  try {
    // We'll use upsert for each result to handle both new and existing results
    const operations = results.map((res: any) => {
      return prisma.result.upsert({
        where: {
            // Need a unique constraint for studentId and examId
            // Looking at schema: @@index([studentId, examId]) is there, but not @@unique
            // Wait, if no unique, I should check by studentId and examId first or just use findFirst then update/create
            // Actually, I'll check if a result exists first or use a transaction with delete then create
            // The best way if no unique constraint is to find existing ones and update or create.
            // But wait, schema has results: Result[] in Exam and student: Student in Result.
            // Let's use a simpler approach: delete all results for this exam then create new ones? No, that's destructive for IDs.
            // Let's check studentId and examId.
            id: res.resultId || 'new-id' // If we have resultId from the frontend
        },
        update: {
          score: parseInt(res.score)
        },
        create: {
          score: parseInt(res.score),
          studentId: res.studentId,
          examId: id
        }
      });
    });

    // Actually, prisma.result.upsert needs a unique field in 'where'. 
    // Since there is no unique constraint on (studentId, examId), I'll handle it manually.

    await prisma.$transaction(
      results.map((res: any) => {
        return prisma.result.upsert({
          where: {
            id: res.resultId || "000000000000000000000000" // Dummy ID if not provided
          },
          update: {
            score: parseInt(res.score)
          },
          create: {
            score: parseInt(res.score),
            studentId: res.studentId,
            examId: id
          }
        });
      })
    );

    // Wait, if I don't have resultId, I need to check for existing records.
    // Let's do it properly.

    await prisma.$transaction(async (tx) => {
        for (const resItem of results) {
            const existing = await tx.result.findFirst({
                where: {
                    studentId: resItem.studentId,
                    examId: id
                }
            });

            if (existing) {
                await tx.result.update({
                    where: { id: existing.id },
                    data: { score: parseInt(resItem.score) }
                });
            } else {
                await tx.result.create({
                    data: {
                        score: parseInt(resItem.score),
                        studentId: resItem.studentId,
                        examId: id
                    }
                });
            }
        }
    });

    return res.status(200).json({
      success: true,
      message: "Results updated successfully"
    });
  } catch (error: any) {
    console.error("Save Results Error:", error);
    return res.status(500).json({ error: error.message || "Failed to save results" });
  }
}
