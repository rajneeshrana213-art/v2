import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Seeding completed successfully. This endpoint is now disabled for security.
  return res.status(404).json({ error: "Not found" });
}
