import { NextApiRequest, NextApiResponse } from "next";
import { BusService } from "@/lib/services/transport-service";
import { createBusSchema } from "@/lib/validations/transport";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Ensure user has a schoolId assigned, otherwise fallback or error
    const userSchoolId = (session.user as any).schoolId;
    if (!userSchoolId && req.method === "POST") {
      return res
        .status(400)
        .json({ error: "No school ID associated with user" });
    }

    if (req.method === "GET") {
      const { schoolId } = req.query;
      // Admin can see their school's buses, superadmin might pass it
      const targetSchoolId = schoolId || userSchoolId;
      const buses = await BusService.getAll(targetSchoolId as string);
      return res.status(200).json(buses);
    }

    if (req.method === "POST") {
      const parsed = createBusSchema.parse({
        ...req.body,
        schoolId: userSchoolId, // Override frontend with trusted server session
      });
      const bus = await BusService.create(parsed);
      return res.status(201).json(bus);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
