/**
 * Promotion Rules Engine
 *
 * Config-driven promotion eligibility checker for School, College, and University
 * Supports: Attendance threshold, Subject pass/fail, Grace marks, Backlog allowance
 */

import { prisma } from "../../../prisma";
import Logger from "../../../utils/logger";

export interface PromotionRuleConfig {
  // Institution type
  institutionType: "SCHOOL" | "COLLEGE" | "UNIVERSITY";

  // Attendance rules
  minAttendancePercentage: number; // e.g., 75
  attendanceGracePercentage?: number; // e.g., 5 (allows 70% if grace is 5)

  // Academic rules
  minPassPercentage: number; // e.g., 40 or 50
  allowGraceMarks: boolean;
  maxGraceMarks?: number; // Maximum grace marks per subject
  maxBacklogSubjects?: number; // Maximum allowed backlog subjects (0 = no backlogs allowed)

  // Subject-specific rules
  requireAllSubjectsPass?: boolean; // If true, all subjects must pass
  criticalSubjects?: string[]; // Subject IDs that must pass

  // Manual override
  allowManualOverride: boolean;
  overrideRequiresReason: boolean;
}

export interface StudentEligibilityResult {
  isEligible: boolean;
  status:
    | "ELIGIBLE"
    | "DETAINED"
    | "BACKLOG"
    | "ATTENDANCE_SHORT"
    | "MANUAL_OVERRIDE";
  reasons: string[];
  attendancePercentage: number;
  passedSubjects: number;
  failedSubjects: number;
  backlogSubjects: string[]; // Subject IDs
  totalSubjects: number;
  averageScore?: number;
  canPromoteWithBacklog: boolean;
}

export interface PromotionAuditData {
  studentId: string;
  fromClassId: string;
  toClassId: string;
  fromSection: string;
  toSection: string;
  academicYear: string;
  toSession: string;
  ruleConfig: PromotionRuleConfig;
  eligibilityResult: StudentEligibilityResult;
  promotedBy: string; // User ID
  overrideReason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Default promotion rules based on institution type
 */
export function getDefaultPromotionRules(
  institutionType: "SCHOOL" | "COLLEGE" | "UNIVERSITY",
): PromotionRuleConfig {
  switch (institutionType) {
    case "SCHOOL":
      return {
        institutionType: "SCHOOL",
        minAttendancePercentage: 75,
        attendanceGracePercentage: 5,
        minPassPercentage: 40,
        allowGraceMarks: true,
        maxGraceMarks: 5,
        maxBacklogSubjects: 0, // Schools typically don't allow backlogs
        requireAllSubjectsPass: true,
        allowManualOverride: true,
        overrideRequiresReason: true,
      };

    case "COLLEGE":
      return {
        institutionType: "COLLEGE",
        minAttendancePercentage: 75,
        attendanceGracePercentage: 5,
        minPassPercentage: 40,
        allowGraceMarks: true,
        maxGraceMarks: 5,
        maxBacklogSubjects: 2, // Allow up to 2 backlogs
        requireAllSubjectsPass: false,
        allowManualOverride: true,
        overrideRequiresReason: true,
      };

    case "UNIVERSITY":
      return {
        institutionType: "UNIVERSITY",
        minAttendancePercentage: 75,
        attendanceGracePercentage: 5,
        minPassPercentage: 40,
        allowGraceMarks: true,
        maxGraceMarks: 5,
        maxBacklogSubjects: 3, // Allow up to 3 backlogs
        requireAllSubjectsPass: false,
        allowManualOverride: true,
        overrideRequiresReason: true,
      };

    default:
      return getDefaultPromotionRules("SCHOOL");
  }
}

/**
 * Check student eligibility for promotion
 */
export async function checkStudentEligibility(
  studentId: string,
  academicYear: string,
  ruleConfig: PromotionRuleConfig,
): Promise<StudentEligibilityResult> {
  const reasons: string[] = [];

  try {
    // Fetch student with class and school info
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: true,
        school: true,
        dashboardSummary: true,
      },
    });

    if (!student) {
      return {
        isEligible: false,
        status: "DETAINED",
        reasons: ["Student not found"],
        attendancePercentage: 0,
        passedSubjects: 0,
        failedSubjects: 0,
        backlogSubjects: [],
        totalSubjects: 0,
        canPromoteWithBacklog: false,
      };
    }

    if (!student.classId) {
      return {
        isEligible: false,
        status: "DETAINED",
        reasons: ["Student is not assigned to any class"],
        attendancePercentage: 0,
        passedSubjects: 0,
        failedSubjects: 0,
        backlogSubjects: [],
        totalSubjects: 0,
        canPromoteWithBacklog: false,
      };
    }

    // Check if already promoted for this academic year
    const existingPromotion = await prisma.studentPromotion.findFirst({
      where: {
        studentId,
        academicYear,
      },
    });

    if (existingPromotion) {
      return {
        isEligible: false,
        status: "DETAINED",
        reasons: ["Student already promoted for this academic year"],
        attendancePercentage: 0,
        passedSubjects: 0,
        failedSubjects: 0,
        backlogSubjects: [],
        totalSubjects: 0,
        canPromoteWithBacklog: false,
      };
    }

    // 1. Check Attendance
    const attendancePercentage =
      student.dashboardSummary?.attendancePercentage || 0;
    const minAttendance = ruleConfig.minAttendancePercentage;
    const graceAttendance =
      minAttendance - (ruleConfig.attendanceGracePercentage || 0);
    const attendanceMet = attendancePercentage >= graceAttendance;

    if (!attendanceMet) {
      reasons.push(
        `Attendance ${attendancePercentage.toFixed(1)}% is below required ${minAttendance}% (grace: ${graceAttendance}%)`,
      );
    }

    // 2. Check Exam Results
    // Fetch subjects for the class
    const classSubjects = await prisma.subject.findMany({
      where: {
        classId: student.classId,
        status: "ACTIVE",
      },
    });
    const totalSubjects = classSubjects.length;

    if (totalSubjects === 0) {
      reasons.push("No subjects found for the class");
      return {
        isEligible: false,
        status: "DETAINED",
        reasons,
        attendancePercentage,
        passedSubjects: 0,
        failedSubjects: 0,
        backlogSubjects: [],
        totalSubjects: 0,
        canPromoteWithBacklog: false,
      };
    }

    // Get all exams for this class in the academic year
    const exams = await prisma.exam.findMany({
      where: {
        classId: student.classId,
      },
      include: {
        subject: true,
        results: {
          where: { studentId },
        },
      },
    });

    // Group results by subject
    const subjectResults: Record<
      string,
      {
        subjectId: string;
        subjectName: string;
        passed: boolean;
        score?: number;
        passMark?: number;
        totalMarks?: number;
      }
    > = {};

    for (const subject of classSubjects) {
      subjectResults[subject.id] = {
        subjectId: subject.id,
        subjectName: subject.name,
        passed: false,
      };
    }

    // Process exam results
    for (const exam of exams) {
      const result = exam.results[0];
      if (!result) continue;

      const subjectId = exam.subjectId;
      if (!subjectResults[subjectId]) continue;

      const passMark = exam.passMark || ruleConfig.minPassPercentage;
      const score = result.score;
      const passed = score >= passMark;

      // Update subject result (keep best score if multiple exams)
      if (
        !subjectResults[subjectId].score ||
        score > (subjectResults[subjectId].score || 0)
      ) {
        subjectResults[subjectId].score = score;
        subjectResults[subjectId].passMark = passMark;
        subjectResults[subjectId].totalMarks = exam.totalMarks || undefined;
        subjectResults[subjectId].passed = passed;
      }
    }

    // Count passed/failed subjects
    const subjectResultsArray = Object.values(subjectResults);
    const passedSubjects = subjectResultsArray.filter((s) => s.passed).length;
    const failedSubjects = subjectResultsArray.filter((s) => !s.passed).length;
    const backlogSubjects = subjectResultsArray
      .filter((s) => !s.passed)
      .map((s) => s.subjectId);

    // Calculate average score
    const scores = subjectResultsArray
      .filter((s) => s.score !== undefined)
      .map((s) => s.score!);
    const averageScore =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : undefined;

    // Check if all subjects have results
    const subjectsWithResults = subjectResultsArray.filter(
      (s) => s.score !== undefined,
    ).length;
    if (subjectsWithResults < totalSubjects && subjectsWithResults > 0) {
      reasons.push(
        `${totalSubjects - subjectsWithResults} subject(s) have no exam results`,
      );
    } else if (subjectsWithResults === 0 && totalSubjects > 0) {
      // No exam results at all
      reasons.push("No exam results found for any subject");
      // If no results, consider as not eligible (unless manual override)
      return {
        isEligible: false,
        status: "DETAINED",
        reasons,
        attendancePercentage,
        passedSubjects: 0,
        failedSubjects: totalSubjects,
        backlogSubjects: [],
        totalSubjects,
        canPromoteWithBacklog: false,
      };
    }

    // Apply grace marks if allowed
    let finalFailedSubjects = failedSubjects;
    if (ruleConfig.allowGraceMarks && ruleConfig.maxGraceMarks) {
      // Check if grace marks can help pass borderline subjects
      const borderlineSubjects = subjectResultsArray.filter((s) => {
        if (s.passed || !s.score || !s.passMark) return false;
        const deficit = s.passMark - s.score;
        return deficit > 0 && deficit <= ruleConfig.maxGraceMarks!;
      });

      if (borderlineSubjects.length > 0) {
        // Apply grace marks to borderline subjects (up to maxGraceMarks per subject)
        finalFailedSubjects = subjectResultsArray.filter((s) => {
          if (s.passed) return false;
          if (!s.score || !s.passMark) return true;
          const deficit = s.passMark - s.score;
          return deficit > ruleConfig.maxGraceMarks!;
        }).length;
      }
    }

    // Determine eligibility
    let isEligible = true;
    let status: StudentEligibilityResult["status"] = "ELIGIBLE";

    // Check attendance requirement
    if (!attendanceMet) {
      isEligible = false;
      status = "ATTENDANCE_SHORT";
    }

    // Check subject pass requirements
    if (ruleConfig.requireAllSubjectsPass && failedSubjects > 0) {
      isEligible = false;
      status = "DETAINED";
      reasons.push(
        `Failed in ${failedSubjects} subject(s). All subjects must pass.`,
      );
    } else if (finalFailedSubjects > 0) {
      // Check backlog allowance
      const allowedBacklogs = ruleConfig.maxBacklogSubjects || 0;
      if (finalFailedSubjects > allowedBacklogs) {
        isEligible = false;
        status = "DETAINED";
        reasons.push(
          `Failed in ${finalFailedSubjects} subject(s). Maximum ${allowedBacklogs} backlog(s) allowed.`,
        );
      } else if (finalFailedSubjects > 0) {
        status = "BACKLOG";
        reasons.push(
          `Has ${finalFailedSubjects} backlog subject(s). Can promote with backlog.`,
        );
      }
    }

    // Check critical subjects
    if (ruleConfig.criticalSubjects && ruleConfig.criticalSubjects.length > 0) {
      const failedCriticalSubjects = backlogSubjects.filter((id) =>
        ruleConfig.criticalSubjects!.includes(id),
      );
      if (failedCriticalSubjects.length > 0) {
        isEligible = false;
        status = "DETAINED";
        reasons.push(
          `Failed in critical subject(s). Critical subjects must pass.`,
        );
      }
    }

    // Check minimum pass percentage
    if (
      averageScore !== undefined &&
      averageScore < ruleConfig.minPassPercentage
    ) {
      isEligible = false;
      status = "DETAINED";
      reasons.push(
        `Average score ${averageScore.toFixed(1)}% is below minimum ${ruleConfig.minPassPercentage}%`,
      );
    }

    return {
      isEligible,
      status,
      reasons,
      attendancePercentage,
      passedSubjects,
      failedSubjects: finalFailedSubjects,
      backlogSubjects: backlogSubjects,
      totalSubjects,
      averageScore,
      canPromoteWithBacklog:
        status === "BACKLOG" && (ruleConfig.maxBacklogSubjects || 0) > 0,
    };
  } catch (error) {
    Logger.error(`Error checking student eligibility for ${studentId}:`, error);
    return {
      isEligible: false,
      status: "DETAINED",
      reasons: [
        "Error checking eligibility: " +
          (error instanceof Error ? error.message : "Unknown error"),
      ],
      attendancePercentage: 0,
      passedSubjects: 0,
      failedSubjects: 0,
      backlogSubjects: [],
      totalSubjects: 0,
      canPromoteWithBacklog: false,
    };
  }
}

/**
 * Batch check eligibility for multiple students
 */
export async function checkBatchEligibility(
  studentIds: string[],
  academicYear: string,
  ruleConfig: PromotionRuleConfig,
): Promise<Map<string, StudentEligibilityResult>> {
  const results = new Map<string, StudentEligibilityResult>();

  // Process in batches to avoid overwhelming the database
  const batchSize = 50;
  for (let i = 0; i < studentIds.length; i += batchSize) {
    const batch = studentIds.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (studentId) => {
        const eligibility = await checkStudentEligibility(
          studentId,
          academicYear,
          ruleConfig,
        );
        return { studentId, eligibility };
      }),
    );

    batchResults.forEach(({ studentId, eligibility }) => {
      results.set(studentId, eligibility);
    });
  }

  return results;
}
