import { NextApiRequest, NextApiResponse } from "next";

// Allowlist of trusted origins. Add your production/staging domains here.
const ALLOWED_ORIGINS: string[] = [
  process.env.FRONTEND_URL || "",
  process.env.NEXTAUTH_URL || "",
  "https://chat.learnxchain.com",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
].filter(Boolean);

if (ALLOWED_ORIGINS.length === 0) {
  console.warn(
    "[CORS] Warning: FRONTEND_URL and NEXTAUTH_URL are not set. " +
    "Cross-origin requests with credentials will be denied for all origins."
  );
}

/**
 * CORS middleware for Next.js API routes
 * Handles Cross-Origin Resource Sharing headers
 */
export async function cors(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const requestOrigin = req.headers.origin;

  const isAllowed = 
    requestOrigin && 
    (ALLOWED_ORIGINS.includes(requestOrigin) || 
     requestOrigin.endsWith(".learnxchain.com") || 
     requestOrigin.endsWith("chat.learnxchain.com") ||
     requestOrigin.endsWith("learnxchain.com")
    
    );

  // Only reflect the origin when it is explicitly in the allowlist.
  // Reflecting an arbitrary origin while also sending Allow-Credentials: true
  // is a critical CORS misconfiguration that allows any website to make
  // authenticated cross-origin requests on behalf of a logged-in user.
  if (requestOrigin && isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
}
