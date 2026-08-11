import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { q, lat, lon } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(400).json({ error: "Missing query parameter 'q'" });
  }

  try {
    const query = encodeURIComponent(q + ", India");

    // Calculate a bounding box (viewbox) to prioritize nearby results
    let boundingBox = "";
    if (lat && lon && typeof lat === "string" && typeof lon === "string") {
      const l = parseFloat(lon) - 0.5; // left
      const b = parseFloat(lat) - 0.5; // bottom
      const r = parseFloat(lon) + 0.5; // right
      const t = parseFloat(lat) + 0.5; // top
      boundingBox = `&viewbox=${l},${t},${r},${b}`;
    }

    // OpenStreetMap Nominatim: adding addressdetails=1 and loosening limits helps it find remote villages better than an overly strict string match.
    const externalRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&countrycodes=in&addressdetails=1${boundingBox}`,
      {
        headers: {
          // Nominatim requires a valid User-Agent to avoid blocking requests
          "User-Agent":
            "LearnXChain-Transport-Module/1.0 (contact: admin@learnxchain.com)",
          Accept: "application/json",
        },
      },
    );

    if (!externalRes.ok) {
      console.error(
        "Nominatim API error:",
        externalRes.status,
        externalRes.statusText,
      );
      return res
        .status(externalRes.status)
        .json({ error: "External geocoding service failed" });
    }

    const data = await externalRes.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Geocoding proxy error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error during geocoding" });
  }
}
