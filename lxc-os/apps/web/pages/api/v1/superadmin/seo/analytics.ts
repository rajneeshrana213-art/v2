import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";
import { formatISTDateKey, parseInstitutionalDate } from "@/lib/utils/date-utils";

// Format date to YYYY-MM-DD for Google APIs
const formatDate = (date: Date) => {
  // Use institutional calendar day (IST) to avoid UTC day shifts on Vercel.
  return formatISTDateKey(date);
};

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
      // 1. Fetch all configured keywords from the database
      const seoRecords = await prisma.seoMeta.findMany({
        select: {
          pageSlug: true,
          keywords: true,
        },
      });

      // Extract and split keywords into a unique list
      const extractedKeywords = new Set<string>();
      seoRecords.forEach((record) => {
        if (record.keywords) {
          record.keywords.split(",").forEach((kw) => {
            const cleaned = kw.trim();
            if (cleaned) extractedKeywords.add(cleaned);
          });
        }
      });

      const keywordsArray = Array.from(extractedKeywords);

      // Check if Search Console credentials are provided
      if (
        !process.env.GSC_CLIENT_EMAIL ||
        !process.env.GSC_PRIVATE_KEY ||
        !process.env.GSC_PROPERTY_URI
      ) {
        return res.status(503).json({
          error:
            "Google Search Console credentials not fully configured in environment variables.",
          code: "GSC_NOT_CONFIGURED",
        });
      }

      // 2. Authenticate with Google API
      const privateKey = process.env.GSC_PRIVATE_KEY.replace(/\\n/g, "\n");
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GSC_CLIENT_EMAIL,
          private_key: privateKey,
        },
        scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
      });

      const authClient = await auth.getClient();
      const searchConsole = google.searchconsole({
        version: "v1",
        auth: authClient as any,
      });

      const siteUrl = process.env.GSC_PROPERTY_URI;

      // Calculate date ranges dynamically based on the 'range' query param
      const range = (req.query.range as string) || "16m";
      const today = new Date();
      const startDateObj = new Date();

      const prevStartDateObj = new Date();
      const prevEndDateObj = new Date();

      if (range === "7d") {
        startDateObj.setDate(today.getDate() - 7);
        prevEndDateObj.setDate(today.getDate() - 7);
        prevStartDateObj.setDate(today.getDate() - 14);
      } else if (range === "30d") {
        startDateObj.setDate(today.getDate() - 30);
        prevEndDateObj.setDate(today.getDate() - 30);
        prevStartDateObj.setDate(today.getDate() - 60);
      } else if (range === "90d") {
        startDateObj.setDate(today.getDate() - 90);
        prevEndDateObj.setDate(today.getDate() - 90);
        prevStartDateObj.setDate(today.getDate() - 180);
      } else {
        // Default to '16m' (All Time in GSC context, max retrievable limit)
        // No trend comparison for all time
        startDateObj.setMonth(today.getMonth() - 16);
        prevEndDateObj.setDate(today.getDate());
        prevStartDateObj.setDate(today.getDate());
      }

      const startDate = formatDate(startDateObj);
      const endDate = formatDate(today);

      const prevStartDate = formatDate(prevStartDateObj);
      const prevEndDate = formatDate(prevEndDateObj);

      // 3. Fetch Overall Website Performance metrics and Chart Data
      const [dateResponse, prevDateResponse] = await Promise.all([
        searchConsole.searchanalytics.query({
          siteUrl,
          requestBody: {
            startDate,
            endDate,
            dimensions: ["date"],
          },
        }),
        range !== "16m"
          ? searchConsole.searchanalytics.query({
              siteUrl,
              requestBody: {
                startDate: prevStartDate,
                endDate: prevEndDate,
                dimensions: ["date"],
              },
            })
          : Promise.resolve({ data: { rows: [] } }),
      ]);

      const dateRows = dateResponse.data.rows || [];
      const prevDateRows = prevDateResponse.data?.rows || [];

      // Calculate overall aggregates from date rows
      let totalClicks = 0;
      let totalImpressions = 0;
      let sumPosition = 0;

      const chartData = dateRows.map((row: any) => {
        totalClicks += row.clicks || 0;
        totalImpressions += row.impressions || 0;
        sumPosition += (row.position || 0) * (row.impressions || 0); // Weighted average calculation

        const dateObj = parseInstitutionalDate(row.keys![0]);
        return {
          date: dateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          clicks: row.clicks || 0,
          impressions: row.impressions || 0,
        };
      });

      // Overall average CTR and Position
      const averageCtr =
        totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const averagePosition =
        totalImpressions > 0 ? sumPosition / totalImpressions : 0;

      // Calculate previous period aggregates
      let prevTotalClicks = 0;
      let prevTotalImpressions = 0;
      let prevSumPosition = 0;

      prevDateRows.forEach((row: any) => {
        prevTotalClicks += row.clicks || 0;
        prevTotalImpressions += row.impressions || 0;
        prevSumPosition += (row.position || 0) * (row.impressions || 0);
      });

      const prevAverageCtr =
        prevTotalImpressions > 0
          ? (prevTotalClicks / prevTotalImpressions) * 100
          : 0;
      const prevAveragePosition =
        prevTotalImpressions > 0 ? prevSumPosition / prevTotalImpressions : 0;

      // Trend Calculation Helper
      const calcTrend = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0; // If previous was 0 and now we have something, 100% up. If both 0, 0%.
        return Number((((current - previous) / previous) * 100).toFixed(1));
      };

      const overview = {
        totalClicks,
        totalImpressions,
        averageCtr: Number(averageCtr.toFixed(2)),
        averagePosition: Number(averagePosition.toFixed(1)),
        clicksTrend:
          range !== "16m" ? calcTrend(totalClicks, prevTotalClicks) : 0,
        impressionsTrend:
          range !== "16m"
            ? calcTrend(totalImpressions, prevTotalImpressions)
            : 0,
        ctrTrend: range !== "16m" ? calcTrend(averageCtr, prevAverageCtr) : 0,
        positionTrend:
          range !== "16m" ? calcTrend(averagePosition, prevAveragePosition) : 0,
      };

      // 4. Fetch Keyword Rankings
      // Fetching up to 100 keywords to map against our DB keywords
      const queryResponse = await searchConsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ["query"],
          rowLimit: 500,
        },
      });

      const queryRows = queryResponse.data.rows || [];

      // Map Google results to our formatting, filtering by database keywords if there are any
      const keywordRankings = queryRows
        // We can optionally filter to only show keywords actually tracked in DB:
        // .filter(row => keywordsArray.length === 0 || keywordsArray.includes(row.keys![0]))
        .slice(0, 50) // limit for UI performance
        .map((row: any) => {
          const kw = row.keys![0];
          return {
            keyword: kw,
            position: Number((row.position || 0).toFixed(1)),
            volume: row.impressions || 0, // Using impressions as search volume proxy for this site
            traffic: row.clicks || 0,
            difficulty: Math.min(100, Math.max(10, kw.length * 8)), // Keep fake difficulty as GSC doesn't provide KD
            intent: [
              "Informational",
              "Navigational",
              "Commercial",
              "Transactional",
            ][kw.length % 4], // Fake intent mapping
          };
        });

      // Sort keywords primarily by traffic
      keywordRankings.sort((a: any, b: any) => b.traffic - a.traffic);

      // 5. Fetch Page Rankings (New Implementation)
      const pageResponse = await searchConsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ["page"],
          rowLimit: 100,
        },
      });

      const pageRows = pageResponse.data.rows || [];
      const pageRankings = pageRows
        .map((row: any) => {
          return {
            pageUrl: row.keys![0],
            clicks: row.clicks || 0,
            impressions: row.impressions || 0,
            ctr: Number(((row.ctr || 0) * 100).toFixed(2)),
            position: Number((row.position || 0).toFixed(1)),
          };
        })
        .sort((a: any, b: any) => b.clicks - a.clicks); // Sort mapped pages by clicks

      return res.status(200).json({
        overview,
        chartData,
        keywordRankings,
        pageRankings, // Emit the new property
      });
    } catch (error: any) {
      console.error("Error fetching SEO analytics:", error);
      return res.status(500).json({
        error: "Failed to fetch SEO analytics data. " + (error.message || ""),
      });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
