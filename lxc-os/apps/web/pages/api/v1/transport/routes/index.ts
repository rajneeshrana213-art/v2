import { NextApiRequest, NextApiResponse } from "next";
import { RouteService } from "@/lib/services/transport-service";
import { createRouteSchema } from "@/lib/validations/transport";

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
      const routes = await RouteService.getAll(targetSchoolId as string);
      return res.status(200).json(routes);
    }

    if (req.method === "POST") {
      if (!userSchoolId) {
        return res
          .status(400)
          .json({ error: "No school ID associated with user" });
      }

      const parsed = createRouteSchema.parse(req.body);

      // Override with securely verified school ID
      const sanitizedData = {
        ...parsed,
        schoolId: userSchoolId,
      };
      const route = await RouteService.create(sanitizedData);
      return res.status(201).json(route);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
