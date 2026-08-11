import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { 
    updateSchoolInfo, 
    getPaymentConfig, 
    updatePaymentConfig, 
    getAcademicYearsBySchoolId, 
    createAcademicYear, 
    updateAcademicYear 
} from "@/lib/services/school-service";

import multer from "multer";
import { runMiddleware } from "@/lib/middleware/run-middleware";
import { uploadFile } from "@/lib/config/upload";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(
    req: any,
    res: NextApiResponse
) {
    const user = await verifyAuth(req, res);
    if (!user) return;

    if (user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    const { type, id } = req.query;
    const schoolId = user.schoolId;

    if (!schoolId) {
        return res.status(400).json({ error: "User is not associated with any school" });
    }

    // For other methods, we need to parse body if not handled by multer
    if (req.method === "PATCH" || req.method === "POST") {
        if (!req.headers['content-type']?.includes('multipart/form-data')) {
            // Manually parse JSON if bodyParser is disabled
            if (typeof req.body === 'string' && req.body.length > 0) {
                try {
                    req.body = JSON.parse(req.body);
                } catch (e) {
                    console.error("JSON Parse Error:", e);
                }
            } else if (!req.body || (typeof req.body === 'object' && Object.keys(req.body).length === 0)) {
                // If it's already an object but empty, it might be due to bodyParser: false
                // But Next.js sometimes populates it? Usually not if disabled.
                // We'll read the stream if necessary, but let's try a simpler approach if possible.
                // Actually, let's just use runMiddleware for all PATCH/POST if we want a unified way or just parse once.
            }
        }
    }

    try {
        // --- SCHOOL SETTINGS ---
        if (type === "school") {
            if (req.method === "GET") {
                const { getSchoolInfoByUserId } = await import("@/lib/services/school-service");
                const school = await getSchoolInfoByUserId(user.id);
                return res.status(200).json(school);
            }
            if (req.method === "PATCH") {
                await runMiddleware(req, res, upload.single("schoolLogo"));
                
                const { schoolName } = req.body;
                let schoolLogo = req.body.schoolLogo; // In case it's a URL already

                if (req.file) {
                    const uploadResult = await uploadFile(req.file.buffer, "school-logos", "auto", req.file.originalname);
                    schoolLogo = uploadResult.url;
                }

                const result = await updateSchoolInfo(schoolId, { schoolName, schoolLogo });
                return res.status(200).json(result);
            }
        }

        // --- PAYMENT SETTINGS ---
        if (type === "payment") {
            if (req.method === "GET") {
                const config = await getPaymentConfig(schoolId);
                return res.status(200).json(config || { keyId: "", keySecret: "" });
            }
            if (req.method === "PATCH") {
                const { keyId, keySecret } = req.body;
                if (!keyId || !keySecret) {
                    return res.status(400).json({ error: "Key ID and Key Secret are required" });
                }
                const result = await updatePaymentConfig(schoolId, { keyId, keySecret });
                return res.status(200).json({ message: "Payment configuration updated successfully" });
            }
        }

        // --- ACADEMIC YEARS ---
        if (type === "academic-years") {
            if (req.method === "GET") {
                const years = await getAcademicYearsBySchoolId(schoolId);
                return res.status(200).json(years);
            }
            if (req.method === "POST") {
                const { year, startDate, endDate, isActive } = req.body;
                const result = await createAcademicYear(schoolId, { 
                    year, 
                    startDate: new Date(startDate), 
                    endDate: new Date(endDate), 
                    isActive 
                });
                return res.status(201).json(result);
            }
            if (req.method === "PATCH") {
                const yearId = id as string;
                if (!yearId) return res.status(400).json({ error: "Year ID required" });
                
                const { year, startDate, endDate, isActive } = req.body;
                const result = await updateAcademicYear(yearId, schoolId, {
                    year,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    isActive
                });
                return res.status(200).json(result);
            }
        }

        return res.status(404).json({ error: "Not found" });
    } catch (error: any) {
        console.error(`Settings API Error (${type}):`, error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
