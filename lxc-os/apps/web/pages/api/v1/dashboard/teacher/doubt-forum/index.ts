import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { createDoubtReplyService } from "@/lib/services/common/DoubtService";
import { DoubtStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("─── [DoubtForum] Handler START", { method: req.method });
    
    // Inline CORS to avoid any potential import/callback issues
    res.setHeader("Access-Control-Allow-Credentials", "true");
    const origin = req.headers.origin || "*";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
    if (req.method === "OPTIONS") return res.status(200).end();
    
    console.log("─── [DoubtForum] Headers set");

    const user = await verifyAuth(req, res);
    if (!user) {
      console.log("─── [DoubtForum] Auth result: NO USER");
      return; // verifyAuth sends 401
    }
    console.log("─── [DoubtForum] Auth result: OK", { userId: user.id, schoolId: user.schoolId });

    if (user.role !== "teacher" && user.role !== "admin" && user.role !== "superadmin") {
      console.log("─── [DoubtForum] Unauthorized role:", user.role);
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { method } = req;
    if (method === "GET") {
      const { classId, subjectId, status, search, page = "1", limit = "20" } = req.query;
      console.log("─── [DoubtForum] Fetching dudas with query:", req.query);

      const parsedPage = Math.max(1, parseInt(page as string) || 1);
      const parsedLimit = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
      const skip = (parsedPage - 1) * parsedLimit;
      const take = parsedLimit;

      const where: any = {};
      const filterClassId = classId && classId !== "undefined" && classId !== "" ? classId as string : null;

      if (user.schoolId) {
        if (filterClassId) {
          where.class = { id: filterClassId, schoolId: user.schoolId };
        } else {
          where.class = { schoolId: user.schoolId };
        }
      }

      if (subjectId && subjectId !== "undefined" && subjectId !== "") {
        where.subjectId = subjectId as string;
      }
      if (status && status !== "undefined" && status !== "" && status !== "ALL") {
        where.status = status as DoubtStatus;
      }
      if (search && search !== "undefined" && search !== "") {
        where.OR = [
          { title: { contains: search as string, mode: "insensitive" } },
          { content: { contains: search as string, mode: "insensitive" } },
        ];
      }

      console.log("─── [DoubtForum] Final prisma where:", JSON.stringify(where, null, 2));

      const [doubts, total] = await Promise.all([
        prisma.doubt.findMany({
          where,
          include: {
            user: { select: { name: true, profilePic: true } },
            subject: { select: { id: true, name: true } },
            class: { select: { id: true, name: true } },
            _count: { select: { replies: true } },
          },
          orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
          skip,
          take,
        }),
        prisma.doubt.count({ where }),
      ]);

      console.log("─── [DoubtForum] Query results:", { count: doubts.length, total });
      return res.status(200).json({ 
        data: doubts, 
        pagination: { total, page: parsedPage, limit: parsedLimit, totalPages: Math.ceil(total / parsedLimit) } 
      });
    }

    if (method === "POST") {
      const { doubtId, content, attachmentUrl } = req.body;
      const reply = await createDoubtReplyService({
        doubtId,
        userId: user.id,
        role: user.role,
        content,
        attachmentUrl,
      });
      return res.status(201).json(reply);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${method} Not Allowed`);

  } catch (err: any) {
    console.error("─── [DoubtForum] FATAL ERROR:", err);
    return res.status(500).json({ error: "Internal server error: " + err.message });
  }
}
