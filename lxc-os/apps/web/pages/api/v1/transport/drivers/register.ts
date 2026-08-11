import { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import { runMiddleware } from "@/lib/middleware/run-middleware";
import { DriverService, RegisterDriverInput } from "@/lib/services/transport-service";
import { registerDriverSchema } from "@/lib/validations/transport";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const config = {
  api: { bodyParser: false },
};

// Public endpoint: intentionally accessible without session authentication.
// Drivers self-register via this endpoint (e.g. from a mobile app or
// recruitment portal) before they have a platform account. A license photo
// is required to complete registration.
export default async function handler(
  req: NextApiRequest & { files: any },
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    // 1. Run Multer (fields for multiple files)
    await runMiddleware(
        req, 
        res, 
        upload.fields([{ name: 'profilePic', maxCount: 1 }, { name: 'licensePhoto', maxCount: 1 }])
    );

    const body = req.body;
    const files = (req as any).files;

    if (!files?.licensePhoto?.[0] || !files?.licensePhoto?.[0]?.buffer) {
        return res.status(400).json({ error: "License photo is required" });
    }

    // 2. Validate Body
    // Parse form data strings back to expected types if needed? 
    // Zod schema expects strings for IDs/text, so body should be fine. 
    // 'sex' enum might need check.
    
    // Explicit Validation before passing to service
    const validationResult = registerDriverSchema.safeParse(body);
    if (!validationResult.success) {
         return res.status(400).json({ error: validationResult.error.errors });
    }
    
    const validatedData = validationResult.data;

    const input: RegisterDriverInput = {
        ...validatedData,
        profilePicBuffer: files?.profilePic?.[0]?.buffer,
        profilePicName: files?.profilePic?.[0]?.originalname,
        licensePhotoBuffer: files.licensePhoto[0].buffer,
        licensePhotoName: files.licensePhoto[0].originalname,
    };

    const result = await DriverService.register(input);
    return res.status(201).json({ success: true, ...result });

  } catch (error: any) {
    console.error("Driver Registration Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
