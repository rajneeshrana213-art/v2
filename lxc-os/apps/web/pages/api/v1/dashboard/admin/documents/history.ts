import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  const { method } = req;

  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const { targetUserId, type, category, schoolId: querySchoolId } = req.query;
    const targetSchoolId = user.role === "superadmin" ? (querySchoolId as string) : user.schoolId;

    const history = await prisma.issuedDocument.findMany({
      where: {
        ...(targetSchoolId && { schoolId: targetSchoolId }),
        ...(targetUserId && { targetUserId: targetUserId as string }),
        ...(type || category ? {
          template: {
            ...(type && { type: type as any }),
            ...(category && { category: category as any }),
          }
        } : {}),
      },
      include: {
        template: true,
        targetUser: {
          select: {
            name: true,
            email: true,
            profilePic: true,
            role: true,
          }
        },
        issuedBy: {
          select: {
            name: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(history);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch document history" });
  }
}
