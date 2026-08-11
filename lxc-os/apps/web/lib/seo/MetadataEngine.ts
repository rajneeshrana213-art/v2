import { prisma } from "@/lib/prisma";
import { cache } from "@/lib/cache";

export interface SeoData {
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  ogImage?: string | null;
  canonical?: string | null;
  noIndex?: boolean;
}

const SEO_CACHE_TTL = 300; // 5 minutes in seconds

export async function getSeoMetadata(
  pageSlug: string,
): Promise<SeoData | null> {
  const normalizedSlug = pageSlug === "" ? "/" : pageSlug.replace(/^\//, "");
  const cacheKey = `seo:slug:${normalizedSlug}`;

  // Check Redis cache first
  const cached = await cache.get<SeoData>(cacheKey);
  if (cached) return cached;

  try {
    const seo = await prisma.seoMeta.findUnique({
      where: {
        pageSlug: normalizedSlug,
      },
      select: {
        title: true,
        description: true,
        keywords: true,
        ogImage: true,
        canonical: true,
        noIndex: true,
      },
    });

    if (seo) {
      await cache.set(cacheKey, seo, SEO_CACHE_TTL);
    }

    return seo;
  } catch (error) {
    console.error("Error fetching SEO metadata for", pageSlug, error);
    return null;
  }
}
