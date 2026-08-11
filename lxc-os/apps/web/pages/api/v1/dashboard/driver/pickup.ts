
import { NextApiRequest, NextApiResponse } from "next";
import { DriverService } from "../../../../../lib/services/dashboard/driver-service";
import { verifyAuth } from "../../../../../lib/auth";
import { cors } from "../../../../../lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);
  
  if (req.method === "GET") {
     const { routeId } = req.query;
     if (!routeId) return res.status(400).json({ error: "routeId is required" });
     try {
        const students = await DriverService.getRouteStudents(routeId as string);
        return res.status(200).json(students);
     } catch (error: any) {
        return res.status(500).json({ error: error.message });
     }
  }

  if (req.method === "PATCH") {
     const { tripId, studentId, status } = req.body;
     if (!tripId || !studentId || !status) return res.status(400).json({ error: "Missing fields" });
     try {
        const result = await DriverService.updateStudentStatus(tripId, studentId, status);
        return res.status(200).json(result);
     } catch (error: any) {
        return res.status(500).json({ error: error.message });
     }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
