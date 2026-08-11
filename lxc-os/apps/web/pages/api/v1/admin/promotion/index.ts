import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { PromotionStatus, StudentLifecycleStatus } from "@prisma/client";
import { verifyAuth } from "@/lib/auth";

/**
 * Academic Promotion API
 * POST - Bulk promote/repeat/transfer/graduate/dropout students at end of academic year
 * GET  - List students with their current academic record for a given class & session
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method === "GET") {
    return handleGet(req, res);
  }
  if (req.method === "POST") {
    return handlePost(req, res);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

/**
 * GET /api/v1/admin/promotion?schoolId=...&classId=...&academicYear=...
 * Returns students in a given class for a given academic year, with their current academic record.
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { schoolId, classId, academicYear } = req.query;

    if (!schoolId || !academicYear) {
      return res
        .status(400)
        .json({ error: "schoolId and academicYear are required" });
    }

    const whereClause: any = {
      student: {
        schoolId: schoolId as string,
        status: StudentLifecycleStatus.ACTIVE,
        isDeleted: false,
      },
      academicYear: academicYear as string,
      isDeleted: false,
    };

    if (classId) {
      whereClause.classId = classId as string;
    }

    const records = await (prisma as any).studentAcademicRecord.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profilePic: true,
              },
            },
          },
        },
        class: {
          select: { id: true, name: true },
        },
        section: {
          select: { id: true, name: true },
        },
      },
      orderBy: { rollNumber: "asc" },
    });

    return res.status(200).json({ students: records });
  } catch (error: any) {
    console.error("Promotion GET error:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/v1/admin/promotion
 * Body: {
 *   schoolId: string,
 *   currentAcademicYear: string,   // e.g. "2025-26"
 *   nextAcademicYear: string,      // e.g. "2026-27"
 *   decisions: [
 *     {
 *       studentId: string,
 *       action: "PROMOTED" | "REPEATED" | "TRANSFERRED" | "DROPPED_OUT" | "GRADUATED",
 *       nextClassId?: string,      // required for PROMOTED
 *       nextSectionId?: string,
 *       nextRollNumber?: string,
 *       remarks?: string
 *     }
 *   ]
 * }
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { schoolId, currentAcademicYear, nextAcademicYear, decisions } =
      req.body;

    if (!schoolId || !currentAcademicYear || !decisions?.length) {
      return res.status(400).json({
        error: "schoolId, currentAcademicYear, and decisions are required",
      });
    }

    const results = {
      promoted: 0,
      repeated: 0,
      transferred: 0,
      droppedOut: 0,
      graduated: 0,
      errors: [] as string[],
    };

    for (const decision of decisions) {
      try {
        const {
          studentId,
          action,
          nextClassId,
          nextSectionId,
          nextRollNumber,
          remarks,
        } = decision;

        // Update the current academic record with the promotion status
        await (prisma as any).studentAcademicRecord.updateMany({
          where: {
            studentId,
            academicYear: currentAcademicYear,
          },
          data: {
            promotionStatus: action as PromotionStatus,
            remarks: remarks || null,
          },
        });

        switch (action) {
          case "PROMOTED": {
            if (!nextClassId || !nextAcademicYear) {
              results.errors.push(
                `Student ${studentId}: nextClassId and nextAcademicYear required for PROMOTED`,
              );
              break;
            }
            // Create new academic record for next year
            await (prisma as any).studentAcademicRecord.create({
              data: {
                studentId,
                academicYear: nextAcademicYear,
                classId: nextClassId,
                sectionId: nextSectionId || null,
                rollNumber: nextRollNumber || "TBD",
                promotionStatus: PromotionStatus.PROMOTED,
              },
            });
            results.promoted++;
            break;
          }

          case "REPEATED": {
            // Get the current record to find the current classId
            const currentRecord = await (
              prisma as any
            ).studentAcademicRecord.findFirst({
              where: { studentId, academicYear: currentAcademicYear },
            });

            if (currentRecord && nextAcademicYear) {
              await (prisma as any).studentAcademicRecord.create({
                data: {
                  studentId,
                  academicYear: nextAcademicYear,
                  classId: currentRecord.classId,
                  sectionId: nextSectionId || currentRecord.sectionId || null,
                  rollNumber: nextRollNumber || currentRecord.rollNumber,
                  promotionStatus: PromotionStatus.REPEATED,
                },
              });
            }
            results.repeated++;
            break;
          }

          case "TRANSFERRED": {
            await (prisma as any).student.update({
              where: { id: studentId },
              data: { status: StudentLifecycleStatus.TRANSFERRED },
            });
            results.transferred++;
            break;
          }

          case "DROPPED_OUT": {
            await (prisma as any).student.update({
              where: { id: studentId },
              data: { status: StudentLifecycleStatus.DROPPED_OUT },
            });
            results.droppedOut++;
            break;
          }

          case "GRADUATED": {
            await (prisma as any).student.update({
              where: { id: studentId },
              data: { status: StudentLifecycleStatus.ALUMNI },
            });
            results.graduated++;
            break;
          }

          default:
            results.errors.push(
              `Student ${studentId}: Unknown action "${action}"`,
            );
        }
      } catch (decisionError: any) {
        results.errors.push(
          `Student ${decision.studentId}: ${decisionError.message}`,
        );
      }
    }

    return res.status(200).json({
      message: "Promotion process completed",
      results,
    });
  } catch (error: any) {
    console.error("Promotion POST error:", error);
    return res.status(500).json({ error: error.message });
  }
}
