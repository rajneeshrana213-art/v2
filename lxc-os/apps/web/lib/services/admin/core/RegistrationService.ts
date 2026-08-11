import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import {
  StudentCreationService,
  StudentCreationData,
} from "@/lib/services/common/StudentCreationService";
import { SubscriptionService } from "@/lib/services/superadmin/SubscriptionService";
import * as fcmTriggers from "@/lib/services/notification/fcm-trigger-service";

export class RegistrationService {
  /**
   * Links Management
   */
  static async generateLink(
    schoolId: string,
    adminId: string,
    academicYearId?: string,
    expiresInDays = 30,
  ) {
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const where: any = { schoolId, isActive: true };
    if (academicYearId) where.academicYearId = academicYearId;

    // Deactivate old links
    await prisma.studentRegistrationLink.updateMany({
      where,
      data: { isActive: false },
    });

    return prisma.studentRegistrationLink.create({
      data: {
        schoolId,
        academicYearId,
        token,
        expiresAt,
        isActive: true,
        createdByAdminId: adminId,
      },
    });
  }

  static async getLinks(schoolId: string, academicYearId?: string) {
    const where: any = { schoolId };
    if (academicYearId) where.academicYearId = academicYearId;

    return prisma.studentRegistrationLink.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        academicYear: { select: { id: true, year: true } },
        _count: { select: { registrationRequests: true } },
      },
    });
  }

  static async revokeLink(id: string) {
    return prisma.studentRegistrationLink.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Requests Management
   */
  static async getRequests(
    schoolId: string,
    academicYearId?: string,
    status = "PENDING",
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { schoolId, status };
    if (academicYearId) where.academicYearId = academicYearId;

    const [requests, total] = await Promise.all([
      prisma.studentRegistrationRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: "desc" },
        include: {
          registrationLink: {
            select: { token: true, expiresAt: true, isActive: true },
          },
          academicYear: { select: { year: true } },
        },
      }),
      prisma.studentRegistrationRequest.count({ where }),
    ]);

    return { requests, total, pages: Math.ceil(total / limit) };
  }

  static async getRequestById(id: string) {
    return prisma.studentRegistrationRequest.findUnique({
      where: { id },
      include: {
        school: { select: { id: true, schoolName: true } },
        registrationLink: true,
      },
    });
  }

  static async updateRequest(id: string, formData: any) {
    return prisma.studentRegistrationRequest.update({
      where: { id },
      data: { formData },
    });
  }

  static async rejectRequest(id: string, reason: string, adminId: string) {
    return prisma.studentRegistrationRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        adminRemark: reason,
      },
    });
  }

  /**
   * Approval
   */
  static async approveRequest(id: string, adminId: string) {
    const request = await prisma.studentRegistrationRequest.findUnique({
      where: { id },
      include: {
        school: { select: { id: true, schoolName: true } },
        academicYear: true,
      },
    });

    if (!request || request.status !== "PENDING") {
      throw new Error("Invalid request or already processed");
    }

    // Enforce Enrollment Limits & Billing Rules
    await SubscriptionService.validateUserLimit(request.schoolId);
    await SubscriptionService.checkWriteAccess(request.schoolId);

    // Check subscription logic (simplified for migration, can add back detailed checks)
    const subscription = await prisma.subscription.findFirst({
      where: {
        schoolId: request.schoolId,
        isActive: true,
        endDate: { gte: new Date() },
      },
    });
    if (!subscription) throw new Error("No active subscription");

    // Prepare data
    const formData = request.formData as any;
    const classId = formData.classId;

    // Auto-generate roll number if not provided or set to N/A
    let finalRollNo = formData.rollNo;
    const academicYear =
      request.academicYear?.year || new Date().getFullYear().toString();

    if (!finalRollNo || finalRollNo === "N/A" || finalRollNo.trim() === "") {
      const existingRecords = await prisma.studentAcademicRecord.findMany({
        where: { classId, academicYear },
        select: { rollNumber: true },
      });

      const numericRollNos = existingRecords
        .map((s) => parseInt(s.rollNumber))
        .filter((n) => !isNaN(n));

      const maxRollNo =
        numericRollNos.length > 0 ? Math.max(...numericRollNos) : 0;
      finalRollNo = (maxRollNo + 1).toString();
    }

    // Construct required fields if missing from defaults
    const studentData: StudentCreationData = {
      ...formData,
      schoolId: request.schoolId,
      academicYear: academicYear,
      userName:
        formData.userName ||
        formData.email?.split("@")[0] ||
        `user${Date.now()}`,
      status: "ACTIVE",
      address: formData.currentAddress || formData.address || "Not Specified",
      admissionDate: formData.admissionDate || new Date().toISOString(),
      rollNo: finalRollNo,
      Religion: formData.Religion || "Not Specified",
      category: formData.category || "General",
      caste: formData.caste || "General",
      motherTongue: formData.motherTongue || "Not Specified",
      languagesKnown: formData.languagesKnown || "Not Specified",
      fatherOccupation: formData.fatherOccupation || "Not Specified",
      motherOccupation: formData.motherOccupation || "Not Specified",
      guardianOccupation: formData.guardianOccupation || "Not Specified",
      guardianAddress:
        formData.guardianAddress || formData.currentAddress || "Not Specified",
      areSiblingStudying: formData.areSiblingStudying || "No",
      siblingName: formData.siblingName || "N/A",
      siblingClass: formData.siblingClass || "N/A",
      siblingRollNo: formData.siblingRollNo || "N/A",
      siblingAdmissionNo: formData.siblingAdmissionNo || "N/A",
      permanentAddress:
        formData.permanentAddress || formData.currentAddress || "Not Specified",
      medicalCertificateUrl: "N/A",
      transferCertificateUrl: "N/A",
      profilePicUrl: null,
      schoolName: request.school.schoolName,
    };

    // Use retry logic
    const created =
      await StudentCreationService.createStudentWithParentWithRetry(
        studentData,
      );

    // Update request status
    await prisma.studentRegistrationRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        approvedByAdminId: adminId,
      } as any, // Force bypass if field missing in type definition
    });

    return created;
  }

  /**
   * Public Face
   */
  static async validateToken(token: string) {
    const link = await prisma.studentRegistrationLink.findUnique({
      where: { token, isActive: true },
      include: {
        school: { select: { id: true, schoolName: true, schoolLogo: true } },
        academicYear: { select: { id: true, year: true } },
      },
    });

    if (!link) throw new Error("Invalid or inactive registration link");
    if (new Date() > link.expiresAt) {
      await prisma.studentRegistrationLink.update({
        where: { id: link.id },
        data: { isActive: false },
      });
      throw new Error("Registration link has expired");
    }

    return link;
  }

  static async submitRequest(token: string, formData: any) {
    const link = await this.validateToken(token);

    const request = await prisma.studentRegistrationRequest.create({
      data: {
        schoolId: link.schoolId,
        academicYearId: link.academicYearId,
        registrationLinkId: link.id,
        formData: formData,
        status: "PENDING",
      },
    });

    // 🔔 Notify admins (fire-and-forget)
    const studentName = formData.name || formData.studentName || "New Student";
    fcmTriggers.notifyAdmissionRequest(studentName, link.schoolId);

    return request;
  }
}
