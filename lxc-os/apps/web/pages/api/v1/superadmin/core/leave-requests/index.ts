import { NextApiRequest, NextApiResponse } from 'next';
import { LeaveRequestService } from '@/lib/services/superadmin/core/LeaveRequestService';
import { verifyAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const authUser = await verifyAuth(req, res);
    if (!authUser || authUser.role !== 'superadmin') {
        return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
    }

    try {
        if (req.method === 'GET') {
            const data = await LeaveRequestService.getLeaveRequests(req.query);
            return res.status(200).json(data);
        } else if (req.method === 'POST') {
            const data = await LeaveRequestService.createLeaveRequest(req.body);
            return res.status(201).json(data);
        }
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
    return res.status(405).end();
}
