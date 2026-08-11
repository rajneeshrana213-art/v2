import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await cors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const user = await verifyAuth(req, res);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { reason } = req.body;

    // Create a high-priority ticket for account deletion
    const ticket = await prisma.ticket.create({
      data: {
        title: "Account Deletion Request",
        description: `User ${user.name} (${user.email}, ID: ${user.id}) has requested account deletion.${reason ? ` Reason: ${reason}` : ""}`,
        category: "Account",
        priority: "HIGH",
        userId: user.id,
        schoolId: user.schoolId || null,
        status: "OPEN",
      },
    });

    return res.status(200).json({ 
      success: true, 
      message: "Account deletion request submitted successfully. Our team will review it shortly.",
      ticketId: ticket.id 
    });
  } catch (error: any) {
    console.error("Failed to submit account deletion request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
