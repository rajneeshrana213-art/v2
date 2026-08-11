import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { isLeaveApproved } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = await verifyAuth(req, res);
  if (!user || user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  const { id } = req.query;
  const { action, rejectionReason, adminNote, userId } = req.body; // userId is the admin approving/rejecting

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  if (!['APPROVE', 'REJECT'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action. Must be APPROVE or REJECT' });
  }

  try {
    const status = action === 'APPROVE' ? isLeaveApproved.APPROVED : isLeaveApproved.REJECTED;

    // Optional: You might want to get the actual admin user ID from the session/token here
    // For now assuming it is passed in body or we handle it via middleware/context effectively later.
    // If you have a way to get logged in user id, use it for 'approvedBy'

    const updateData: any = {
      isApproved: status,
      status: status === isLeaveApproved.APPROVED ? 'APPROVED' : 'REJECTED', // Updating the secondary status field as well
       // If REJECTED, we might want to set approvedBy as well to track who rejected it?
       // The schema says `approvedBy`, `approver`. Maybe we can use it for both.
       // actually schema has `approvedBy` @map("approved_by")
    };
    
    // Schema fields:
    // approvedBy      String?   @map("approved_by")
    // approvedAt      DateTime? @map("approved_at")
    // rejectionReason String?   @map("rejection_reason")
    // adminNote       String?   @map("admin_note")
    
    if (action === 'APPROVE') {
        updateData.approvedBy = userId; 
        updateData.approvedAt = new Date();
        if (adminNote) updateData.adminNote = adminNote;
    } else {
        updateData.rejectionReason = rejectionReason;
        updateData.approvedBy = userId; // Tracking who performed the action
        updateData.approvedAt = new Date(); // Time of action
        if (adminNote) updateData.adminNote = adminNote;
    }

    const updatedRequest = await prisma.leaveRequest.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json(updatedRequest);
  } catch (error) {
    console.error('Error updating leave request:', error);
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
}
