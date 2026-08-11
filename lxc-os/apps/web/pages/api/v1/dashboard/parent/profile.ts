import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
import { verifyAuth } from "../../../../../lib/auth";
import { cors } from "../../../../../lib/middleware/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;
    const user = (req as any).user;

    const parent = await prisma.parent.findUnique({
      where: { userId: user.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!parent) {
      return res.status(404).json({ error: "Parent profile not found" });
    }

    const data = {
      personalInfo: {
        id: parent.id,
        name: parent.user?.name || "N/A",
        email: parent.user?.email || "N/A",
        phone: parent.user?.phone || "N/A",
        profilePic: null, // Parents don't currently have a distinct profile pic column, defaulting to null
        className: "N/A",
        rollNo: "N/A",
        admissionDate: null,
      },
    };

    res.status(200).json(data);
  } catch (error: any) {
    const status = error.message === "Parent profile not found" ? 404 : 500;
    res
      .status(status)
      .json({ error: error.message || "Internal server error" });
  }
}
