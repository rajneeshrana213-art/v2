import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { viewHomeworkSchema } from '@/lib/validations/student';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const bodyResult = viewHomeworkSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({ error: bodyResult.error.errors });
    }
    const { studentId, homeworkId } = bodyResult.data;

    await prisma.homeworkView.upsert({
      where: { studentId_homeworkId: { studentId, homeworkId } },
      create: { studentId, homeworkId, viewedAt: new Date() },
      update: { viewedAt: new Date() }
    });
    
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error marking homework viewed:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
