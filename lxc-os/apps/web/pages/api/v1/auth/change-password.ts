import { NextApiRequest, NextApiResponse } from "next";
import { changePasswordSchema } from "@/lib/validations/auth";
import { changePasswordService } from "@/lib/services/password-service";
import { verifyAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await verifyAuth(req, res);
    if (!user) return; // verifyAuth handles 401 response

    const { oldPassword, newPassword } = req.body;
    const userId = user.id;

    // Validate request body
    const parsed = changePasswordSchema.parse({ oldPassword, newPassword });

    // Change password
    const result = await changePasswordService(
      userId,
      parsed.oldPassword,
      parsed.newPassword
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Change password error:", error);

    // Handle specific errors
    if (
      error.message === "User not found" ||
      error.message === "User does not have a password set"
    ) {
      return res.status(404).json({ error: error.message });
    }

    if (error.message === "Old password is incorrect") {
      return res.status(400).json({ error: error.message });
    }

    // Validation errors
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors });
    }

    return res.status(500).json({ error: "Something went wrong, please try again" });
  }
}
