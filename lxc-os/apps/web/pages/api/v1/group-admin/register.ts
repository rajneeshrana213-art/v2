import { NextApiRequest, NextApiResponse } from "next";
import { DashboardService } from "../../../../lib/services/dashboard";
import { cors } from "../../../../lib/middleware/cors";

// Public endpoint: intentionally accessible without session authentication.
// New organizations (group admins) self-register here before they have an
// account. Email uniqueness is enforced at the database level (P2002).
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      name,
      email,
      phone,
      password,
      organizationName,
      address,
      city,
      state,
      country,
      pincode,
    } = req.body;

    // Basic validation
    if (!name || !email || !password || !organizationName) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    // Check if user already exists
    const existingUser = await DashboardService.groupAdmin.registerOrganization(
      {
        name,
        email,
        phone,
        password,
        organizationName,
        address,
        city,
        state,
        country,
        pincode,
      },
    );

    return res.status(201).json({
      message: "Organization registered successfully",
      user: {
        id: existingUser.user.id,
        email: existingUser.user.email,
        name: existingUser.user.name,
      },
      group: {
        id: existingUser.group.id,
        name: existingUser.group.name,
      },
    });
  } catch (error: any) {
    console.error("Organization Registration API Error:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0] || "Email";
      return res.status(400).json({ error: `${field} already exists` });
    }

    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
