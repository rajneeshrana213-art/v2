import { NextApiRequest, NextApiResponse } from 'next';
import { DemoService } from '@/lib/services/DemoService';
import { verifyAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  const user = await verifyAuth(req, res);
  if (!user || user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await DemoService.getAllDemoBookings(page, limit);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching demo requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch demo requests',
    });
  }
}
