import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  const { method } = req;

  if (method === "GET") {
    const { type, academicYearId } = req.query;

    try {
      const where: any = {
        schoolId: user.schoolId,
      };

      if (type) {
        where.type = type;
      }

      if (academicYearId) {
        where.academicYearId = academicYearId;
      }

      const accounts = await prisma.account.findMany({
        where,
        orderBy: { name: "asc" },
      });

      return res.status(200).json(accounts);
    } catch (error: any) {
      console.error("Get Accounts Error:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  } else if (method === "POST") {
    try {
      const { code, name, type, academicYearId, description } = req.body;

      if (!code || !name || !type || !academicYearId) {
        return res
          .status(400)
          .json({ error: "Code, name, type, and academicYearId are required" });
      }

      const account = await prisma.account.create({
        data: {
          schoolId: user.schoolId,
          academicYearId,
          code,
          name,
          type,
          description,
        },
      });

      return res.status(201).json(account);
    } catch (error: any) {
      console.error("Create Account Error:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  } else if (method === "PUT") {
    try {
      const { id } = req.query;
      const { code, name, description } = req.body;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "Account ID is required" });
      }

      const account = await prisma.account.update({
        where: { id },
        data: {
          code,
          name,
          description,
        },
      });

      return res.status(200).json(account);
    } catch (error: any) {
      console.error("Update Account Error:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  } else if (method === "DELETE") {
    try {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "Account ID is required" });
      }

      // Check if the account is used in any fee heads
      const usedInFeeHeads = await prisma.feeHead.findFirst({
        where: { revenueAccountId: id },
      });

      if (usedInFeeHeads) {
        return res.status(400).json({
          error: "Cannot delete account as it is mapped to one or more fee heads.",
        });
      }

      await prisma.account.delete({
        where: { id },
      });

      return res.status(200).json({ message: "Account deleted successfully" });
    } catch (error: any) {
      console.error("Delete Account Error:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).json({ error: `Method ${method} not allowed` });
  }
}
