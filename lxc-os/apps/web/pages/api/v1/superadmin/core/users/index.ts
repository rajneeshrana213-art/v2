import { NextApiRequest, NextApiResponse } from 'next';
import { UserManagementService } from '@/lib/services/superadmin/core/UserManagementService';
import { verifyAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const authUser = await verifyAuth(req, res);
    if (!authUser || authUser.role !== 'superadmin') {
        return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
    }

    try {
        if (req.method === 'GET') {
            const { role } = req.query;
            const data = await UserManagementService.getUsers(role as string);
            return res.status(200).json(data);
        }
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
    return res.status(405).end();
}
