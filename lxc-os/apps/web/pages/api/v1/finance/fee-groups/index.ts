import { NextApiRequest, NextApiResponse } from 'next';
import { FeeStructureService } from '@/lib/services/finance/FeeStructureService';
import { z } from 'zod';
import { verifyAuth } from "@/lib/auth";

const createFeeStructureSchema = z.object({
  schoolId: z.string().min(1),
  academicYearId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  classId: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  // TODO: Auth Middleware

  if (req.method === 'GET') {
    const { schoolId, academicYearId, classId } = req.query;

    if (!schoolId || typeof schoolId !== 'string') {
      return res.status(400).json({ error: "School ID required" });
    }
    if (!academicYearId || typeof academicYearId !== 'string') {
        // Ideally required, but maybe optional if listing all for school? 
        // Service requires it.
        return res.status(400).json({ error: "Academic Year ID required" });
    }

    try {
      const feeStructures = await FeeStructureService.getFeeStructures(
        schoolId, 
        academicYearId,
        { classId: classId as string }
      );
      return res.status(200).json(feeStructures);
    } catch (error: any) {
      console.error("Get Fee Structures Error:", error);
      return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  } else if (req.method === 'POST') {
    try {
      const result = createFeeStructureSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const feeStructure = await FeeStructureService.createFeeStructure({
        ...result.data,
      });
      return res.status(201).json(feeStructure);
    } catch (error: any) {
      console.error("Create Fee Structure Error:", error);
      return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      if (!id || typeof id !== 'string') return res.status(400).json({ error: "ID required" });

      const result = createFeeStructureSchema.partial().safeParse(req.body);
      if (!result.success) return res.status(400).json({ error: result.error.errors });

      const updated = await FeeStructureService.updateFeeStructure(id, result.data);
      return res.status(200).json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id || typeof id !== 'string') return res.status(400).json({ error: "ID required" });

      await FeeStructureService.deleteFeeStructure(id);
      return res.status(200).json({ message: "Deleted" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
