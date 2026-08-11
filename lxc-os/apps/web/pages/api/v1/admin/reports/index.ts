
import { NextApiRequest, NextApiResponse } from "next";
import { AdminReportsService } from "@/lib/services/reports/admin-reports-service";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;

    const user = (req as any).user;
    if (!user.schoolId) {
      return res.status(400).json({ error: "User is not associated with a school" });
    }

    const { tab, from, to } = req.query;
    const schoolId = user.schoolId;

    let data;
    switch (tab) {
      case "overview":
        data = await AdminReportsService.getOverviewReport(schoolId, from as string, to as string);
        break;
      case "classes":
        data = await AdminReportsService.getAcademicReport(schoolId, from as string, to as string);
        break;
      case "attendance":
        data = await AdminReportsService.getAttendanceReport(schoolId, from as string, to as string);
        break;
      case "accounts":
        data = await AdminReportsService.getFinanceReport(schoolId, from as string, to as string);
        break;
      case "transport":
        data = await AdminReportsService.getTransportReport(schoolId);
        break;
      case "staff":
        data = await AdminReportsService.getStaffReport(schoolId);
        break;
      case "library":
        data = await AdminReportsService.getLibraryReport(schoolId);
        break;
      case "hostel":
        data = await AdminReportsService.getHostelReport(schoolId);
        break;
      case "inventory":
        data = await AdminReportsService.getInventoryReport(schoolId, from as string, to as string);
        break;
      case "hr":
        data = await AdminReportsService.getHRReport(schoolId, from as string, to as string);
        break;
      case "operations":
        data = await AdminReportsService.getOperationsReport(schoolId, from as string, to as string);
        break;
      case "all":
        data = await Promise.all([
          AdminReportsService.getOverviewReport(schoolId, from as string, to as string),
          AdminReportsService.getAcademicReport(schoolId, from as string, to as string),
          AdminReportsService.getAttendanceReport(schoolId, from as string, to as string),
          AdminReportsService.getFinanceReport(schoolId, from as string, to as string),
          AdminReportsService.getTransportReport(schoolId),
          AdminReportsService.getStaffReport(schoolId),
          AdminReportsService.getLibraryReport(schoolId),
          AdminReportsService.getHostelReport(schoolId),
          AdminReportsService.getInventoryReport(schoolId, from as string, to as string),
          AdminReportsService.getHRReport(schoolId, from as string, to as string),
          AdminReportsService.getOperationsReport(schoolId, from as string, to as string),
        ]).then(([overview, academics, attendance, finance, transport, staff, library, hostel, inventory, hr, operations]) => ({
            overview, academics, attendance, finance, transport, staff, library, hostel, inventory, hr, operations
        }));
        break;
      default:
        data = await AdminReportsService.getOverviewReport(schoolId, from as string, to as string);
    }

    res.status(200).json(data);
  } catch (error: any) {
    console.error("Reports API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
