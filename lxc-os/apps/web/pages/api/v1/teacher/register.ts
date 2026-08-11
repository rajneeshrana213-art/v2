import { NextApiRequest, NextApiResponse } from "next";
// import { verifyAuth } from "@/lib/auth"; 
import multer from "multer";
import { runMiddleware } from "@/lib/middleware/run-middleware";
import { registerTeacherService, RegisterTeacherInput } from "@/lib/services/teacher-service";

// Configure Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest & { files: any },
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. Run Multer
    await runMiddleware(
        req, 
        res, 
        upload.fields([
            { name: "profilePic", maxCount: 1 },
            { name: "Resume", maxCount: 1 },
            { name: "joiningLetter", maxCount: 1 },
        ])
    );

    // 2. Parse Body & Validate
    const body = req.body;
    
    // 3. Extract Files
    const files = (req as any).files;
    const profilePic = files?.profilePic?.[0];
    const resume = files?.Resume?.[0];
    const joiningLetter = files?.joiningLetter?.[0];

    if (!profilePic || !resume || !joiningLetter) {
        return res.status(400).json({ error: "Missing required files (profilePic, Resume, joiningLetter)" });
    }

    // 4. Prepare Service Input
    // Note: coerce done by Schema or manual if needed. Service expects correct types.
    // Zod schema in service/validation will handle string -> date/number coercion if we use check.
    // But here we construct strict interface.
    
    // Helper to safely coerce
    const toNum = (v: any) => Number(v) || 0;
    
    const input: RegisterTeacherInput = {
        ...body,
        salary: toNum(body.salary),
        // Files
        profilePicBuffer: profilePic.buffer,
        profilePicName: profilePic.originalname,
        resumeBuffer: resume.buffer,
        resumeName: resume.originalname,
        joiningLetterBuffer: joiningLetter.buffer,
        joiningLetterName: joiningLetter.originalname,
    };

    // 5. Call Service
    const result = await registerTeacherService(input);

    return res.status(200).json({
        success: true,
        data: result
    });

  } catch (error: any) {
    console.error("Register Teacher Error:", error);
    return res.status(500).json({ 
        error: error.message || "Internal Server Error",
    });
  }
}
