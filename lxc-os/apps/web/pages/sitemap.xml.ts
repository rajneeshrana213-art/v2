import { GetServerSideProps } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://learnxchain.com";

const DEFAULT_PAGES = [
    "",
    "about",
    "contact",
    "product",
    "solutions",
    "ai",
    "login",
    "register",
    "book-demo",
];

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    try {
        // 1. Fetch dynamic SEO records that are NOT marked as noIndex
        const seoRecords = await prisma.seoMeta.findMany({
            where: { noIndex: false },
            select: { pageSlug: true, updatedAt: true },
        });

        // 2. Identify slugs controlled by DB
        const dbSlugs = new Set(
            seoRecords.map((r) => (r.pageSlug === "/" ? "" : r.pageSlug)),
        );

        // 3. Process static/default pages not in DB
        const urls: string[] = [];

        // Add default pages if they don't have an override in the DB
        DEFAULT_PAGES.forEach((page) => {
            if (!dbSlugs.has(page)) {
                urls.push(`
          <url>
            <loc>${BASE_URL}/${page}</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>${page === "" ? "daily" : "weekly"}</changefreq>
            <priority>${page === "" ? "1.0" : "0.8"}</priority>
          </url>
        `);
            }
        });

        // Add DB-controlled pages
        seoRecords.forEach((record) => {
            const route = record.pageSlug === "/" ? "" : record.pageSlug;
            urls.push(`
        <url>
          <loc>${BASE_URL}/${route}</loc>
          <lastmod>${record.updatedAt.toISOString()}</lastmod>
          <changefreq>${route === "" ? "daily" : "weekly"}</changefreq>
          <priority>${route === "" ? "1.0" : "0.9"}</priority>
        </url>
      `);
        });

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join("")}
</urlset>
    `;

        // Set cache control for 1 hour
        res.setHeader("Content-Type", "text/xml");
        res.setHeader(
            "Cache-Control",
            "public, s-maxage=3600, stale-while-revalidate=86400",
        );
        res.write(sitemap.trim());
        res.end();

        return {
            props: {},
        };
    } catch (error) {
        console.error("Error generating sitemap:", error);
        res.statusCode = 500;
        res.end();
        return { props: {} };
    }
};

export default function SitemapXml() {
    // This page is purely a server-side XML response
    return null;
}
