import { NextApiRequest, NextApiResponse } from "next";
import { LibraryService } from "@/lib/services/library-service";
import { z } from "zod";
import { MemberType } from "@prisma/client";
import { verifyAuth } from "@/lib/auth";

const createMemberSchema = z.object({
    userId: z.string().min(1),
    type: z.nativeEnum(MemberType)
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { userId } = req.query;
        if (!userId) {
            // Admin: List all members
             try {
                const user = await verifyAuth(req, res);
                if (!user) return;
                
                const schoolId = user.schoolId;
                if (!schoolId) return res.status(400).json({ error: "School not found" });

                const { search, classId } = req.query;
                
                const members = await LibraryService.getAllMembers(schoolId, { 
                    search: search as string, 
                    classId: classId as string 
                });
                return res.status(200).json(members);
            } catch(e: any) {
                return res.status(500).json({error: e.message});
            }
        }
        
        if (typeof userId !== 'string') return res.status(400).json({ error: "Invalid User ID" });
        try {
            const member = await LibraryService.getMemberByUserId(userId);
            return res.status(200).json(member || null);
        } catch(e: any) {
             return res.status(500).json({error: e.message});
        }
    }

    if (req.method === 'POST') {
        const result = createMemberSchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ error: result.error.errors });
        try {
            const member = await LibraryService.createMember(result.data.userId, result.data.type);
            return res.status(201).json(member);
        } catch(e: any) {
             return res.status(500).json({error: e.message});
        }
    }
    
    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id || typeof id !== 'string') return res.status(400).json({ error: "Member ID required" });
        try {
            await LibraryService.deleteMember(id);
            return res.status(200).json({ message: "Member removed successfully" });
        } catch(e: any) {
             return res.status(500).json({error: e.message});
        }
    }
    
    return res.status(405).json({ error: "Method not allowed" });
}
