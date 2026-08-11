import { NextApiRequest, NextApiResponse } from "next";
import { StopService } from "@/lib/services/transport-service";
import { createBusStopSchema } from "@/lib/validations/transport";

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

    const userSchoolId = (session.user as any).schoolId;

    if (req.method === "GET") {
      const { schoolId } = req.query;
      const targetSchoolId = schoolId || userSchoolId;
      const stops = await StopService.getAll(targetSchoolId as string);
      return res.status(200).json(stops);
    }

    if (req.method === "POST") {
      if (!userSchoolId) {
        return res
          .status(400)
          .json({ error: "No school ID associated with user" });
      }

      const parsed = createBusStopSchema.parse(req.body);

      // Clean up empty relation IDs that Prisma rejects and strongly enforce the server session schoolId
      const sanitizedData = {
        ...parsed,
        routeId: parsed.routeId === "" ? null : parsed.routeId,
        schoolId: userSchoolId,
      };

      const stop = await StopService.create(sanitizedData);
      return res.status(201).json(stop);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
