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

  const { slug } = req.query;

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "Missing or invalid slug." });
  }

  const decodeSlug = decodeURIComponent(slug);

  if (req.method === "GET") {
    try {
      const cacheKey = `seo:slug:${decodeSlug}`;
      const cached = await cache.get(cacheKey);
      if (cached) return res.status(200).json(cached);

      const seoMeta = await prisma.seoMeta.findUnique({
        where: { pageSlug: decodeSlug },
      });

      if (!seoMeta) {
        return res.status(404).json({ error: "SEO record not found." });
      }

      await cache.set(cacheKey, seoMeta, SEO_CACHE_TTL);
      return res.status(200).json(seoMeta);
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to fetch SEO record" });
    }
  }

  if (req.method === "PUT") {
    try {
      const parsed = seoMetaSchema.parse(req.body);

      // Verify it exists, and handle slug change
      const existing = await prisma.seoMeta.findUnique({
        where: { pageSlug: decodeSlug },
      });

      if (!existing) {
        return res.status(404).json({ error: "SEO record not found." });
      }

      if (parsed.pageSlug !== decodeSlug) {
        const duplicateCheck = await prisma.seoMeta.findUnique({
          where: { pageSlug: parsed.pageSlug },
        });

        if (duplicateCheck) {
          return res.status(400).json({
            error: "Another SEO configuration already uses this page slug.",
          });
        }
      }

      const updatedSeoMeta = await prisma.seoMeta.update({
        where: { pageSlug: decodeSlug },
        data: parsed as any,
      });

      await cache.delete(`seo:slug:${decodeSlug}`);
      if (parsed.pageSlug !== decodeSlug)
        await cache.delete(`seo:slug:${parsed.pageSlug}`);
      await cache.delete(SEO_LIST_CACHE_KEY);
      return res.status(200).json(updatedSeoMeta);
    } catch (error: any) {
      console.error("Error updating SEO meta:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(500).json({ error: "Failed to update SEO record" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.seoMeta.delete({
        where: { pageSlug: decodeSlug },
      });

      await cache.delete(`seo:slug:${decodeSlug}`);
      await cache.delete(SEO_LIST_CACHE_KEY);
      return res
        .status(200)
        .json({ success: true, message: "SEO record deleted." });
    } catch (error: any) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "SEO record not found." });
      }
      return res.status(500).json({ error: "Failed to delete SEO record" });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
