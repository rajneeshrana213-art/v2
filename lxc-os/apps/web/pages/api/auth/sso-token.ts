import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateJwtToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized: No active session found" });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: session.user.email }, { userName: session.user.email }],
      },
      include: { school: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate JWT access token for SSO redirection (7 days expiry matching mobile/API)
    const accessToken = await generateJwtToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        schoolId: user.school?.id || user?.schoolId || null,
      },
      "7d",
      false
    );

    return res.status(200).json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId || user.school?.id || null,
      },
    });
  } catch (error: any) {
    console.error("Error in sso-token endpoint:", error);
    return res.status(500).json({
      error: process.env.NODE_ENV === "development"
        ? `Server Error: ${error.message}`
        : "Something went wrong. Please try again.",
    });
  }
}
