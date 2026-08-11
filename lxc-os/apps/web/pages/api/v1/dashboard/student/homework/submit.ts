import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../../lib/prisma";
import { verifyAuth } from "../../../../../../lib/auth";
import { cors } from "../../../../../../lib/middleware/cors";
import { uploadFile } from "../../../../../../lib/config/upload";
import { StudentService } from "../../../../../../lib/services/dashboard/student-service";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;
    const user = (req as any).user;

    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!student) {
      return res.status(404).json({ error: "Student record not found" });
    }

    const { itemId, type, file, fileName } = req.body;

    if (!itemId || !type || !file) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Handle file upload
    let fileUrl = file;
    if (file.startsWith("data:")) {
      const base64Data = file.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      const uploadResult = await uploadFile(
        buffer,
        `submissions/${student.id}`,
        "auto",
        fileName || `submission_${itemId}`,
      );
      fileUrl = uploadResult.url;
    }

    let submission;
    if (type === "HOMEWORK") {
      submission = await StudentService.submitHomework(
        student.id,
        itemId,
        fileUrl,
      );
    } else if (type === "ASSIGNMENT") {
      submission = await StudentService.submitAssignment(
        student.id,
        itemId,
        fileUrl,
      );
    } else {
      return res.status(400).json({ error: "Invalid submission type" });
    }

    res.status(200).json({
      success: true,
      submission,
    });
  } catch (error: any) {
    console.error("Submission Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
