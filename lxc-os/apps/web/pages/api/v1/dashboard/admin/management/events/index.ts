
import { NextApiRequest, NextApiResponse } from "next";
import { EventService } from "@/lib/services/admin/EventService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const schoolId = (session.user as any).schoolId;
    if (!schoolId) {
        return res.status(400).json({ error: "School ID not found in session" });
    }

    try {
        if (req.method === "GET") {
            const events = await EventService.getEvents(schoolId);
            return res.status(200).json(events);
        }

        if (req.method === "POST") {
            const event = await EventService.createEvent({ ...req.body, schoolId });
            return res.status(201).json(event);
        }

        if (req.method === "PUT") {
            const { id, ...data } = req.body;
            const event = await EventService.updateEvent(id, data);
            return res.status(200).json(event);
        }

        if (req.method === "DELETE") {
            const { id } = req.query;
            await EventService.deleteEvent(id as string);
            return res.status(200).json({ success: true });
        }

        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error: any) {
        console.error("Event API Error:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
