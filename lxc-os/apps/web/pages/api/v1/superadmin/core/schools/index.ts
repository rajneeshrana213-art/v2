import { NextApiRequest, NextApiResponse } from 'next';
import { SchoolManagementService } from '@/lib/services/superadmin/core/SchoolManagementService';
import { verifyAuth } from '@/lib/auth';
import { registerSchoolSchema } from '@/lib/validations/superadmin/core';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const authUser = await verifyAuth(req, res);
    if (!authUser || authUser.role !== 'superadmin') {
        return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
    }

    try {
        if (req.method === 'GET') {
            const data = await SchoolManagementService.getSchools();
            return res.status(200).json(data);
        } else if (req.method === 'POST') {
            const result = registerSchoolSchema.safeParse(req.body);
            if (!result.success) return res.status(400).json({ error: result.error.errors });
            
            const data = await SchoolManagementService.registerSchool(result.data);
            return res.status(201).json(data);
        }
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
    return res.status(405).end();
}
