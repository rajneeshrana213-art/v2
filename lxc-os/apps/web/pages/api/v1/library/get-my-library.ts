import { NextApiRequest, NextApiResponse } from "next";
import { LibraryService } from "@/lib/services/library-service";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const user = await verifyAuth(req, res);
        if (!user) {
            return;
        }

        const schoolId = user.schoolId;
        
        if (!schoolId) {
            return res.status(400).json({ error: "School ID not found in user session" });
        }

        const library = await LibraryService.getLibraryBySchoolId(schoolId);
        return res.status(200).json(library);
    } catch (e: any) {
        console.error("[get-my-library] Error:", e);
        return res.status(500).json({ error: "Internal server error" });
    }
}
