/**
 * Student Clearance Engine
 *
 * Computes real-time clearance status from existing data (NO new tables)
 * Checks: Finance, Library, Transport, Hostel, Discipline, Documents
 */

import { prisma } from "../../../prisma";
import Logger from "../../../utils/logger";
import { PaymentSettlementService } from "../../finance/PaymentSettlementService";

export interface ClearanceStatus {
  type:
    | "FINANCE"
    | "LIBRARY"
    | "TRANSPORT"
    | "HOSTEL"
    | "DISCIPLINE"
    | "DOCUMENTS";
  cleared: boolean;
  reason?: string;
  details?: Record<string, unknown>;
}

export interface StudentClearanceResult {
  studentId: string;
  overallStatus: "CLEARED" | "PARTIALLY_BLOCKED" | "FULLY_BLOCKED";
  clearances: ClearanceStatus[];
  blockedCount: number;
  totalCount: number;
  canPromote: boolean;
  canTransfer: boolean;
  canDownloadCertificate: boolean;
  canViewResults: boolean; // Always true
}

/**
 * Check Finance Clearance
 * Checks for outstanding fee dues
 */
async function checkFinanceClearance(
  studentId: string,
  schoolId: string,
  academicYearId?: string,
): Promise<ClearanceStatus> {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { schoolId: true },
    });

    if (!student) {
      return {
        type: "FINANCE",
        cleared: false,
        reason: "Student not found",
      };
    }

    // Get active academic year if not provided
    let activeAcademicYearId = academicYearId;
    if (!activeAcademicYearId) {
      const academicYear = await prisma.academicYear.findFirst({
        where: {
          schoolId: student.schoolId,
          isActive: true,
        },
      });
      activeAcademicYearId = academicYear?.id;
    }

    if (!activeAcademicYearId) {
      return {
        type: "FINANCE",
        cleared: true, // No active academic year = no dues to check
        reason: "No active academic year found",
      };
    }

    // Get student balance using PaymentSettlementService
    const balance = await PaymentSettlementService.getStudentBalance(
      student.schoolId,
      activeAcademicYearId,
      studentId,
    );

    const hasOutstanding = balance.netBalance > 0;

    return {
      type: "FINANCE",
      cleared: !hasOutstanding,
      reason: hasOutstanding
        ? `Outstanding dues: ₹${balance.netBalance.toFixed(2)}`
        : undefined,
      details: {
        receivable: balance.receivable,
        advance: balance.advance,
        netBalance: balance.netBalance,
      },
    };
  } catch (error) {
    Logger.error(`Error checking finance clearance for ${studentId}:`, error);
    return {
      type: "FINANCE",
      cleared: false,
      reason: "Error checking finance clearance",
    };
  }
}

/**
 * Check Library Clearance
 * Checks for issued books and unpaid fines
 */
async function checkLibraryClearance(
  studentId: string,
): Promise<ClearanceStatus> {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { userId: true },
    });

    if (!student) {
      return {
        type: "LIBRARY",
        cleared: false,
        reason: "Student not found",
      };
    }

    // Find library member for this student
    const libraryMember = await prisma.libraryMember.findUnique({
      where: { userId: student.userId },
    });

    if (!libraryMember) {
      // Student is not a library member, so no clearance needed
      return {
        type: "LIBRARY",
        cleared: true,
        reason: undefined,
      };
    }

    // Get all issued books (not returned)
    const issuedBooks = await prisma.issueTransaction.findMany({
      where: {
        memberId: libraryMember.id,
        returnDate: null, // Not returned
      },
      include: {
        bookCopy: {
          include: {
            book: {
              select: { title: true, isbn: true },
            },
          },
        },
        fineLedgers: {
          where: {
            status: "PENDING",
          },
          select: { amount: true },
        },
      },
    });

    // Calculate unpaid fines from fineLedgers and fineAmount on transaction
    const totalUnpaidFine = issuedBooks.reduce((sum, issue) => {
      const ledgerFines = issue.fineLedgers.reduce(
        (ledgerSum, ledger) => ledgerSum + ledger.amount,
        0,
      );
      return sum + ledgerFines + (issue.fineAmount || 0);
    }, 0);

    const hasIssuedBooks = issuedBooks.length > 0;
    const hasUnpaidFines = totalUnpaidFine > 0;

    return {
      type: "LIBRARY",
      cleared: !hasIssuedBooks && !hasUnpaidFines,
      reason:
        hasIssuedBooks || hasUnpaidFines
          ? `${issuedBooks.length} book(s) issued${hasUnpaidFines ? `, ₹${totalUnpaidFine.toFixed(2)} fine pending` : ""}`
          : undefined,
      details: {
        issuedBooksCount: issuedBooks.length,
        unpaidFineAmount: totalUnpaidFine,
        issuedBooks: issuedBooks.map((issue) => ({
          title: issue.bookCopy.book.title,
          isbn: issue.bookCopy.book.isbn,
          dueDate: issue.dueDate,
        })),
      },
    };
  } catch (error) {
    Logger.error(`Error checking library clearance for ${studentId}:`, error);
    return {
      type: "LIBRARY",
      cleared: false,
      reason: "Error checking library clearance",
    };
  }
}

/**
 * Check Transport Clearance
 * Checks for transport dues (if applicable)
 */
async function checkTransportClearance(
  studentId: string,
): Promise<ClearanceStatus> {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { busId: true, routeId: true },
    });

    if (!student || !student.busId) {
      // No transport assigned = cleared
      return {
        type: "TRANSPORT",
        cleared: true,
        reason: "No transport assigned",
      };
    }

    // Check if there are any transport-related dues
    // Note: Transport fees might be part of regular fees, so this is a placeholder
    // In a real system, you'd check transport-specific fee heads or a separate transport fee table

    return {
      type: "TRANSPORT",
      cleared: true, // Assuming transport fees are part of regular fees
      details: {
        busId: student.busId,
        routeId: student.routeId,
      },
    };
  } catch (error) {
    Logger.error(`Error checking transport clearance for ${studentId}:`, error);
    return {
      type: "TRANSPORT",
      cleared: false,
      reason: "Error checking transport clearance",
    };
  }
}

/**
 * Check Hostel Clearance
 * Checks for hostel dues and room status
 */
async function checkHostelClearance(
  studentId: string,
): Promise<ClearanceStatus> {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        hostelAllocations: {
          where: { status: "ACTIVE" },
          include: {
            hostel: { select: { name: true } },
            bed: {
              select: {
                bedNumber: true,
                room: { select: { roomNumber: true } },
              },
            },
          },
        },
      },
    });

    if (
      !student ||
      !student.hostelAllocations ||
      student.hostelAllocations.length === 0
    ) {
      // No hostel = cleared
      return {
        type: "HOSTEL",
        cleared: true,
        reason: "No hostel accommodation",
      };
    }

    const activeAllocation = student.hostelAllocations[0];
    const hostelName = activeAllocation.hostel.name;
    const roomNumber = activeAllocation.bed.room.roomNumber;

    // Check for unpaid hostel fees
    const unpaidHostelFees = await prisma.hostelFee.findMany({
      where: {
        student_id: studentId,
        status: { in: ["UNPAID", "OVERDUE"] as any },
      },
    });

    const totalDue = unpaidHostelFees.reduce(
      (sum, fee) => sum + Number(fee.amount),
      0,
    );

    // Check for open complaints
    const openComplaints = await prisma.complaint.findMany({
      where: {
        student_id: studentId,
        status: "OPEN",
      },
    });

    const hasDues = totalDue > 0;
    const hasOpenComplaints = openComplaints.length > 0;

    return {
      type: "HOSTEL",
      cleared: !hasDues && !hasOpenComplaints,
      reason:
        hasDues || hasOpenComplaints
          ? `${hasDues ? `₹${totalDue.toFixed(2)} dues` : ""}${hasDues && hasOpenComplaints ? ", " : ""}${hasOpenComplaints ? `${openComplaints.length} open complaint(s)` : ""}`
          : undefined,
      details: {
        hostelName: hostelName,
        roomNumber: roomNumber,
        unpaidFees: totalDue,
        openComplaints: openComplaints.length,
      },
    };
  } catch (error) {
    Logger.error(`Error checking hostel clearance for ${studentId}:`, error);
    return {
      type: "HOSTEL",
      cleared: false,
      reason: "Error checking hostel clearance",
    };
  }
}

/**
 * Check Discipline Clearance
 * Checks for open disciplinary cases
 */
async function checkDisciplineClearance(
  studentId: string,
): Promise<ClearanceStatus> {
  try {
    // Check for open complaints (disciplinary)
    const openComplaints = await prisma.complaint.findMany({
      where: {
        student_id: studentId,
        status: "OPEN",
      },
    });

    // In a real system, you might have a separate DisciplineCase model
    // For now, we use complaints as a proxy

    return {
      type: "DISCIPLINE",
      cleared: openComplaints.length === 0,
      reason:
        openComplaints.length > 0
          ? `${openComplaints.length} open disciplinary case(s)`
          : undefined,
      details: {
        openCases: openComplaints.length,
      },
    };
  } catch (error) {
    Logger.error(
      `Error checking discipline clearance for ${studentId}:`,
      error,
    );
    return {
      type: "DISCIPLINE",
      cleared: false,
      reason: "Error checking discipline clearance",
    };
  }
}

/**
 * Check Documents Clearance
 * Checks for TC/Migration certificate status
 */
async function checkDocumentsClearance(
  studentId: string,
): Promise<ClearanceStatus> {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        transferCertificate: true,
        status: true,
      },
    });

    if (!student) {
      return {
        type: "DOCUMENTS",
        cleared: false,
        reason: "Student not found",
      };
    }

    // If student is inactive and has transfer certificate, documents are cleared
    // If student is active, documents are not required yet
    const hasTC = !!student.transferCertificate;
    const isInactive = student.status !== "ACTIVE";

    return {
      type: "DOCUMENTS",
      cleared: isInactive ? hasTC : true, // Active students don't need TC yet
      reason:
        isInactive && !hasTC ? "Transfer Certificate not generated" : undefined,
      details: {
        hasTransferCertificate: hasTC,
        studentStatus: student.status,
      },
    };
  } catch (error) {
    Logger.error(`Error checking documents clearance for ${studentId}:`, error);
    return {
      type: "DOCUMENTS",
      cleared: false,
      reason: "Error checking documents clearance",
    };
  }
}

/**
 * Get comprehensive clearance status for a student
 */
export async function getStudentClearance(
  studentId: string,
  academicYearId?: string,
): Promise<StudentClearanceResult> {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { schoolId: true },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    // Check all clearances in parallel
    const [finance, library, transport, hostel, discipline, documents] =
      await Promise.all([
        checkFinanceClearance(studentId, student.schoolId, academicYearId),
        checkLibraryClearance(studentId),
        checkTransportClearance(studentId),
        checkHostelClearance(studentId),
        checkDisciplineClearance(studentId),
        checkDocumentsClearance(studentId),
      ]);

    const clearances: ClearanceStatus[] = [
      finance,
      library,
      transport,
      hostel,
      discipline,
      documents,
    ];

    const blockedCount = clearances.filter((c) => !c.cleared).length;
    const totalCount = clearances.length;

    // Determine overall status
    let overallStatus: "CLEARED" | "PARTIALLY_BLOCKED" | "FULLY_BLOCKED";
    if (blockedCount === 0) {
      overallStatus = "CLEARED";
    } else if (blockedCount < totalCount) {
      overallStatus = "PARTIALLY_BLOCKED";
    } else {
      overallStatus = "FULLY_BLOCKED";
    }

    // Decision matrix logic
    const canPromote = true; // Promotion allowed even with dues (dues carry forward)
    const canTransfer = blockedCount === 0; // Transfer blocked if ANY clearance pending
    const canDownloadCertificate =
      finance.cleared && library.cleared && discipline.cleared; // Certificate blocked if finance/library/discipline pending
    const canViewResults = true; // Always allowed

    return {
      studentId,
      overallStatus,
      clearances,
      blockedCount,
      totalCount,
      canPromote,
      canTransfer,
      canDownloadCertificate,
      canViewResults,
    };
  } catch (error) {
    Logger.error(`Error getting student clearance for ${studentId}:`, error);
    throw error;
  }
}

/**
 * Batch check clearance for multiple students
 */
export async function getBatchClearance(
  studentIds: string[],
  academicYearId?: string,
): Promise<Map<string, StudentClearanceResult>> {
  const results = new Map<string, StudentClearanceResult>();

  // Process in batches to avoid overwhelming the database
  const batchSize = 20;
  for (let i = 0; i < studentIds.length; i += batchSize) {
    const batch = studentIds.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(async (studentId) => {
        const clearance = await getStudentClearance(studentId, academicYearId);
        return { studentId, clearance };
      }),
    );

    batchResults.forEach((result) => {
      if (result.status === "fulfilled") {
        results.set(result.value.studentId, result.value.clearance);
      } else {
        Logger.error(`Failed to get clearance for student:`, result.reason);
      }
    });
  }

  return results;
}
