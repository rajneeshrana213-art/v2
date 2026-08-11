import { NextApiRequest, NextApiResponse } from "next";
// import { verifyAuth } from "@/lib/auth"; 
import multer from "multer";
import { runMiddleware } from "@/lib/middleware/run-middleware";
import { registerAccountService, RegisterAccountInput } from "@/lib/services/account-service";
import { UserSex } from "@prisma/client";

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
        upload.single("profilePic")
    );

    // 2. Parse Body & Validate
    const body = req.body;
    const file = (req as any).file;

    if (!file) {
        return res.status(400).json({ error: "Profile picture is required" });
    }

    // 3. Prepare Service Input
    // Note: Zod or strict typing.
    // 'sex' comes as string from formData, need casting/validation.
    
    // Quick enum validation/fallback
    const sex = Object.values(UserSex).includes(body.sex as UserSex) 
        ? body.sex as UserSex 
        : UserSex.MALE; // Default or error?

    const input: RegisterAccountInput = {
        ...body,
        sex: sex,
        profilePicBuffer: file.buffer,
        profilePicName: file.originalname,
    };

    // 4. Call Service
    const result = await registerAccountService(input);

    return res.status(200).json({
        success: true,
        data: result
    });

  } catch (error: any) {
    console.error("Register Account Error:", error);
    return res.status(500).json({ 
        error: error.message || "Internal Server Error",
    });
  }
}
