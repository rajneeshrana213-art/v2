import { NextApiRequest, NextApiResponse } from 'next';
import { SystemHealthService } from '@/lib/services/superadmin/dashboard/SystemHealthService';
import { verifyAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).end();

    const user = await verifyAuth(req, res);
    if (!user || user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
    }

    try {
        const metrics = await SystemHealthService.getDashboardMetrics();
        return res.status(200).json(metrics);
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
}
