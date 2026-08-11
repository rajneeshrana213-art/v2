import { NextApiRequest, NextApiResponse } from "next";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { requestPasswordResetService } from "@/lib/services/password-service";
import { cors } from "@/lib/middleware/cors";

// Public endpoint: intentionally accessible without session authentication.
// Users cannot be authenticated when they have forgotten their password,
// so this route must remain unauthenticated. The request is validated via
// the forgotPasswordSchema and rate-limiting should be applied at the
// infrastructure level.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Run CORS middleware
  await cors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Validate request body
    const parsed = forgotPasswordSchema.parse(req.body);

    // Request password reset
    const result = await requestPasswordResetService(parsed.email);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Forgot password error:", error);

    // Handle specific errors
    if (error.message === "User not found") {
      return res.status(404).json({ error: "User not found" });
    }

    // Validation errors
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors });
    }

    return res.status(500).json({ error: "Something went wrong, please try again" });
  }
}
