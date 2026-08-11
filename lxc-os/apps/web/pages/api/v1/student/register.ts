import { NextApiRequest, NextApiResponse } from "next";
// import { verifyAuth } from "@/lib/auth"; // Uncomment when auth is needed on this route (usually yes)
import multer from "multer";
import { runMiddleware } from "@/lib/middleware/run-middleware";
import { registerStudentService, RegisterStudentInput } from "@/lib/services/student-service";
import { registerStudentSchema } from "@/lib/validations/admin/student";

// Configure Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const config = {
  api: {
    bodyParser: false, // Disable built-in parser for Multer
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
    // 1. Run Multer Middleware
    await runMiddleware(
        req, 
        res, 
        upload.fields([
            { name: 'profilePic', maxCount: 1 },
            { name: 'medicalCertificate', maxCount: 1 },
            { name: 'transferCertificate', maxCount: 1 }
        ])
    );

    // 2. Parse Body & Validate
    // req.body is now populated by Multer
    const body = req.body;
    
    // Zod validation
    // Note: FormData sends strings, so boolean/numbers might be strings. 
    // The Zod schema might need 'coerce' or manual parsing if strict.
    // Our schema handles input strings mostly.
    
    // 3. Extract Files
    const files = (req as any).files;
    const profilePic = files?.profilePic?.[0];
    const medical = files?.medicalCertificate?.[0];
    const transfer = files?.transferCertificate?.[0];

    if (!profilePic || !medical || !transfer) {
        return res.status(400).json({ error: "Missing required files (profilePic, medicalCertificate, transferCertificate)" });
    }

    // 4. Prepare Service Input
    const input: RegisterStudentInput = {
        ...body,
        // Files
        profilePicBuffer: profilePic.buffer,
        profilePicName: profilePic.originalname,
        medicalCertificateBuffer: medical.buffer,
        medicalCertificateName: medical.originalname,
        transferCertificateBuffer: transfer.buffer,
        transferCertificateName: transfer.originalname,
    };

    // 5. Call Service
    const result = await registerStudentService(input);

    return res.status(200).json({
        success: true,
        data: result
    });

  } catch (error: any) {
    console.error("Register Student Error:", error);
    return res.status(500).json({ 
        error: error.message || "Internal Server Error",
        details: error.errors || undefined
    });
  }
}
