import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cache } from "@/lib/cache";
import { z } from "zod";

const SEO_LIST_CACHE_KEY = "seo:list";
const SEO_CACHE_TTL = 300;

const seoMetaSchema = z.object({
  pageSlug: z
    .string()
    .min(1, "Page slug is required")
    .transform((s) => s.trim().toLowerCase()),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  keywords: z.string().optional().nullable(),
  ogImage: z.string().url().optional().nullable().or(z.literal("")),
  canonical: z.string().url().optional().nullable().or(z.literal("")),
  noIndex: z.boolean().default(false),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user || (session.user as any).role !== "superadmin") {
    return res
      .status(403)
      .json({ error: "Forbidden. Super Admin access required." });
  }

  if (req.method === "GET") {
    try {
      const cached = await cache.get(SEO_LIST_CACHE_KEY);
      if (cached) return res.status(200).json(cached);

      const seoRecords = await prisma.seoMeta.findMany({
        orderBy: { updatedAt: "desc" },
      });
      await cache.set(SEO_LIST_CACHE_KEY, seoRecords, SEO_CACHE_TTL);
      return res.status(200).json(seoRecords);
    } catch (error: any) {
      console.error("Error fetching SEO meta:", error);
      return res.status(500).json({ error: "Failed to fetch SEO records" });
    }
  }

  if (req.method === "POST") {
    try {
      const parsed = seoMetaSchema.parse(req.body);

      // Check for exact duplicate slug
      const existing = await prisma.seoMeta.findUnique({
        where: { pageSlug: parsed.pageSlug },
      });

      if (existing) {
        return res.status(400).json({
          error: "SEO configuration for this page slug already exists.",
        });
      }

      const seoMeta = await prisma.seoMeta.create({
        data: parsed as any,
      });

      await cache.delete(SEO_LIST_CACHE_KEY);
      return res.status(201).json(seoMeta);
    } catch (error: any) {
      console.error("Error creating SEO meta:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(500).json({ error: "Failed to create SEO record" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
