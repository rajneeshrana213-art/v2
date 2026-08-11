import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { AccountService } from "@/lib/services/finance/AccountService";

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const user = authResult;
    const { academicYearId } = req.body;

    if (!user || !user.schoolId) {
        return res.status(401).json({ error: "Unauthorized: School ID not found in session" });
    }

    if (!academicYearId) {
        return res.status(400).json({ error: "Academic Year ID is required" });
    }

    try {
        const created = await AccountService.ensureSystemAccounts(
            user.schoolId,
            academicYearId
        );

        return res.status(200).json({
            message: `System accounts initialized. ${created.length} accounts created.`,
            count: created.length,
        });
    } catch (error: any) {
        console.error("Chart of accounts init error:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}

export default handler;
