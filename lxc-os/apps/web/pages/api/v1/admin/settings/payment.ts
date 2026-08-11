import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { getPaymentConfig, updatePaymentConfig } from "@/lib/services/school-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await verifyAuth(req, res);
    if (!user) return;

    if (user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
    }

    const schoolId = user.schoolId;
    if (!schoolId) return res.status(400).json({ error: "No school associated" });

    if (req.method === "GET") {
        try {
            const config = await getPaymentConfig(schoolId);
            return res.status(200).json(config || { keyId: "", keySecret: "" });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === "PATCH") {
        try {
            const { keyId, keySecret } = req.body;
            if (!keyId || !keySecret) return res.status(400).json({ error: "Missing fields" });

            await updatePaymentConfig(schoolId, { keyId, keySecret });
            return res.status(200).json({ message: "Updated successfully" });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
