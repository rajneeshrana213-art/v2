import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { viewAssignmentSchema } from '@/lib/validations/student';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const bodyResult = viewAssignmentSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({ error: bodyResult.error.errors });
    }
    const { studentId, assignmentId } = bodyResult.data;

    await prisma.assignmentView.upsert({
      where: { studentId_assignmentId: { studentId, assignmentId } },
      create: { studentId, assignmentId, viewedAt: new Date() },
      update: { viewedAt: new Date() }
    });
    
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error marking assignment viewed:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
