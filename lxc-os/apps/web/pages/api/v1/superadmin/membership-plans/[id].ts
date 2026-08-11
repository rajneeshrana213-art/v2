import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const updatePlanSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  price: z.number().min(0, "Price must be positive").optional(),
  discountedPrice: z.number().optional(),
  durationDays: z.number().min(1, "Duration must be at least 1 day").optional(),
  planType: z.enum(["PLATFORM", "RIT"]).optional(),
  
  userLimit: z.number().min(0).optional(),
  branchLimit: z.number().min(1).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authUser = await verifyAuth(req, res);
  if (!authUser || authUser.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid plan ID' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res, id);
  } else if (req.method === 'PUT') {
    return handlePut(req, res, id);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res, id);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const plan = await prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    return res.status(200).json({ data: plan });
  } catch (error) {
    console.error('Error fetching plan:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const validate = updatePlanSchema.safeParse(req.body);
    if (!validate.success) {
      return res.status(400).json({ message: 'Validation failed', errors: validate.error.errors });
    }

    const data = validate.data;
    
    // Check if plan exists
    const existingPlan = await prisma.plan.findUnique({ where: { id } });
    if (!existingPlan) return res.status(404).json({ message: 'Plan not found' });

    // Validate pricing
    const price = data.price ?? existingPlan.price;
    const discountedPrice = data.discountedPrice ?? (existingPlan.discountedPrice || undefined);

    if (discountedPrice !== undefined && discountedPrice > price) {
        return res.status(400).json({ message: 'Discounted price cannot be greater than the original price' });
    }

    const updatedPlan = await prisma.plan.update({
      where: { id },
      data: {
        ...data,
      },
      // userLimit is explicitly in data if updated
    });

    return res.status(200).json({ message: 'Plan updated successfully', data: updatedPlan });
  } catch (error) {
    console.error('Error updating plan:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Check if plan is used in subscriptions? 
    // Schema has onDelete: Cascade for subscriptions on planId, so it might be dangerous without warning.
    // But requirement is simple delete.
    
    await prisma.plan.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
