import { NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { updateSchoolInfo, getSchoolInfoByUserId } from "@/lib/services/school-service";
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

export default async function handler(req: any, res: NextApiResponse) {
    const user = await verifyAuth(req, res);
    if (!user) return;

    if (user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
    }

    const schoolId = user.schoolId;
    if (!schoolId) return res.status(400).json({ error: "No school associated" });

    if (req.method === "GET") {
        try {
            const school = await getSchoolInfoByUserId(user.id);
            return res.status(200).json(school);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === "PATCH") {
        try {
            await runMiddleware(req, res, upload.single("schoolLogo"));
            
            const { schoolName } = req.body;
            let schoolLogo = req.body.schoolLogo;

            if (req.file) {
                const uploadResult = await uploadFile(req.file.buffer, "school-logos", "auto", req.file.originalname);
                schoolLogo = uploadResult.url;
            }

            const result = await updateSchoolInfo(schoolId, { schoolName, schoolLogo });
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
