import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const updateCouponSchema = z.object({
  code: z.string().min(3).regex(/^[A-Za-z0-9_-]+$/).optional(),
  description: z.string().min(1, "Description is required"),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).optional(),
  discountValue: z.number().min(0).optional(),
  scope: z.enum(['GLOBAL', 'SPECIFIC_PLAN', 'SPECIFIC_FEATURE']).optional(),
  planId: z.string().optional().nullable(),
  featureKey: z.string().optional().nullable(),
  expiryDate: z.string().or(z.date()).optional(),
  maxUsage: z.number().min(0).optional().nullable(), // Allow null for unlimited
  isActive: z.boolean().optional(),
}).refine(data => {
  if (data.discountType === 'PERCENTAGE' && data.discountValue && data.discountValue > 100) {
    return false;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%",
  path: ["discountValue"]
}).refine(data => {
  if (data.expiryDate) {
    const expiry = new Date(data.expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expiry >= today;
  }
  return true;
}, {
  message: "Expiry date cannot be in the past",
  path: ["expiryDate"]
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user || user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  if (req.method === 'PUT') {
    return handlePut(req, res, id);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res, id);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    console.log('DEBUG: PUT Coupon Payload:', req.body);
    const valid = updateCouponSchema.safeParse(req.body);
    if (!valid.success) {
      console.error('DEBUG: PUT Coupon Validation Failed:', valid.error.errors);
      return res.status(400).json({ message: 'Validation failed', errors: valid.error.errors });
    }

    const data = valid.data;
    
    // Check if code is being updated and is unique
    if (data.code) {
      const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
      if (existing && existing.id !== id) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }
    }

    const updateData: any = { ...data };
    
    // Handle expiry date conversion and automatic reactivation
    if (data.expiryDate) {
      const expiry = new Date(data.expiryDate);
      expiry.setHours(23, 59, 59, 999);
      updateData.expiryDate = expiry;

      // If updating expiry date and it's in the future, automatically reactivate
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiry >= today) {
        updateData.isActive = true;
      }
    }
    
    // Handle planId and featureKey logic based on scope
    if (data.scope === 'GLOBAL') {
      updateData.planId = null;
      updateData.featureKey = null;
    } else if (data.scope === 'SPECIFIC_PLAN') {
      updateData.featureKey = null;
    } else if (data.scope === 'SPECIFIC_FEATURE') {
      updateData.planId = null;
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData as any,
    });

    return res.status(200).json({ message: 'Coupon updated successfully', coupon });

  } catch (error) {
     if ((error as any).code === 'P2025') {
        return res.status(404).json({ message: 'Coupon not found' });
     }
    console.error('Error updating coupon:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    await prisma.coupon.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (error) {
     if ((error as any).code === 'P2025') {
        return res.status(404).json({ message: 'Coupon not found' });
     }
    console.error('Error deleting coupon:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
