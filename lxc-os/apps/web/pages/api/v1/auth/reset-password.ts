import { NextApiRequest, NextApiResponse } from "next";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { resetPasswordService } from "@/lib/services/password-service";
import { cors } from "@/lib/middleware/cors";

// Public endpoint: intentionally accessible without session authentication.
// Users must be unauthenticated when resetting a forgotten password.
// Access is gated by a one-time, time-limited reset token validated by
// resetPasswordSchema and resetPasswordService.
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
    const parsed = resetPasswordSchema.parse(req.body);

    // Reset password
    const result = await resetPasswordService(parsed.token, parsed.newPassword);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Reset password error:", error);

    // Handle specific errors
    if (
      error.message === "Invalid or expired token" ||
      error.message === "Token has expired" ||
      error.message === "Token has already been used"
    ) {
      return res.status(400).json({ error: error.message });
    }

    // Validation errors
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors });
    }

    return res.status(500).json({ error: "Something went wrong, please try again" });
  }
}
