import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { cors } from "@/lib/middleware/cors";

// Public endpoint: intentionally accessible without session authentication.
// Document verification links are shared publicly (e.g. printed on
// certificates) so recipients can confirm authenticity without logging in.
// The document is looked up by its unique documentNo which is hard to guess.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const { method } = req;
  const { docId } = req.query;

  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const document = await prisma.issuedDocument.findUnique({
      where: { documentNo: docId as string },
      include: {
        template: {
          select: {
            name: true,
            type: true,
            category: true,
          }
        },
        school: {
          select: {
            schoolName: true,
            schoolLogo: true,
            user: {
              select: {
                address: true,
                phone: true,
              }
            }
          }
        },
        targetUser: {
          select: {
            name: true,
            profilePic: true,
          }
        }
      }
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found or invalid" });
    }

    return res.status(200).json(document);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Verification failed" });
  }
}
