import { NextApiRequest, NextApiResponse } from "next";
import { LibraryService } from "@/lib/services/library-service";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const user = await verifyAuth(req, res);
        if (!user) return;

        let libraryId = req.query.libraryId as string;
        
        if (!libraryId) {
            if (!user.schoolId) {
                return res.status(400).json({ error: "School ID not found in user session" });
            }
            const library = await LibraryService.getLibraryBySchoolId(user.schoolId);
            if (library) {
                libraryId = library.id;
            }
        }

        if (!libraryId || typeof libraryId !== 'string') {
            return res.status(400).json({ error: "Library ID required" });
        }

        const classes = await LibraryService.getLibraryClasses(libraryId);
        return res.status(200).json(classes);
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
}
