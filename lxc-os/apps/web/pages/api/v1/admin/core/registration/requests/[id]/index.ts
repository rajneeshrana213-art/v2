import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { cors } from '@/lib/middleware/cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const request = await prisma.studentRegistrationRequest.findUnique({
                where: { id: id as string },
                include: {
                    registrationLink: true,
                    academicYear: true,
                }
            });

            if (!request) return res.status(404).json({ error: "Request not found" });

            // Enrich with class name if possible
            const formData = request.formData as any;
            if (formData && formData.classId && !formData.className) {
                const classData = await prisma.class.findUnique({
                    where: { id: formData.classId },
                    select: { name: true }
                });
                if (classData) {
                    (request.formData as any).className = classData.name;
                }
            }

            return res.status(200).json(request);
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    }
  return res.status(405).json({ error: "Method not allowed" });
}
