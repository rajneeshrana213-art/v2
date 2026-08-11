import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import multer from "multer";
import { runMiddleware } from "@/lib/middleware/run-middleware";
import { createPYQService, getAllPYQsForTeacher, deletePYQService } from "@/lib/services/teacher/PYQService";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  if (user.role !== "teacher" && user.role !== "admin" && user.role !== "superadmin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const pyqs = await getAllPYQsForTeacher(user.id);
        return res.status(200).json(pyqs);
      } catch (error: any) {
        return res.status(500).json({ error: error.message || "Failed to fetch PYQs" });
      }

    case "POST":
      try {
        await runMiddleware(req, res, upload.single("file"));
        const file = (req as any).file;
        const body = req.body;

        if (!file) {
          return res.status(400).json({ error: "File is required" });
        }

        if (!body.title || !body.year || !body.classId || !body.subjectId) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        const currentYear = new Date().getFullYear();
        if (Number(body.year) > currentYear) {
          return res.status(400).json({ error: "Year cannot be in the future." });
        }

        const pyq = await createPYQService(
          {
            title: body.title,
            year: Number(body.year),
            classId: body.classId,
            subjectId: body.subjectId,
            uploaderId: user.id
          },
          file
        );

        return res.status(201).json(pyq);
      } catch (error: any) {
        return res.status(500).json({ error: error.message || "Failed to create PYQ" });
      }

    case "DELETE":
      try {
        const { id } = req.query;
        if (!id || typeof id !== "string") {
          return res.status(400).json({ error: "Invalid ID" });
        }
        await deletePYQService(id, user.id);
        return res.status(200).json({ message: "PYQ deleted successfully" });
      } catch (error: any) {
        return res.status(500).json({ error: error.message || "Failed to delete PYQ" });
      }

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
