import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const createCouponSchema = z.object({
  code: z.string().min(3).regex(/^[A-Za-z0-9_-]+$/, "Code must be alphanumeric"),
  description: z.string().min(1, "Description is required"),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number().min(0),
  scope: z.enum(['GLOBAL', 'SPECIFIC_PLAN', 'SPECIFIC_FEATURE']),
  planId: z.string().optional().nullable(),
  featureKey: z.string().optional().nullable(),
  expiryDate: z.string().or(z.date()), // Accept string from JSON
  maxUsage: z.number().min(1).optional().nullable(), // Optional, if provided must be > 0
}).refine(data => {
  if (data.discountType === 'PERCENTAGE' && data.discountValue > 100) {
    return false;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%",
  path: ["discountValue"]
}).refine(data => {
  const expiry = new Date(data.expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expiry >= today;
}, {
  message: "Expiry date cannot be in the past",
  path: ["expiryDate"]
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user || user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { page = '1', limit = '10', search, isActive } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Lazy Cleanup: Mark expired coupons as inactive instead of deleting them
    await prisma.coupon.updateMany({
      where: {
        expiryDate: {
          lt: new Date(),
        },
        isActive: true, // Only update active ones
      },
      data: {
        isActive: false,
      },
    });

    const where: any = {};
    if (search) {
      where.OR = [
        { code: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [coupons, filteredCount] = await Promise.all([
      prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          plan: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.coupon.count({ where }),
    ]);

    // Global stats for the header cards
    const [allCouponsCount, activeCouponsCount, totalUsageCount] = await Promise.all([
      prisma.coupon.count(),
      prisma.coupon.count({ where: { isActive: true } }),
      prisma.coupon.aggregate({
        _sum: {
          usedCount: true
        }
      })
    ]);

    return res.status(200).json({
      coupons,
      stats: {
        total: allCouponsCount,
        active: activeCouponsCount,
        redeemed: totalUsageCount._sum?.usedCount || 0
      },
      pagination: {
        total: filteredCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(filteredCount / Number(limit)),
      }
    });


  } catch (error) {
    console.error('Error fetching coupons:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}




async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const valid = createCouponSchema.safeParse(req.body);
    if (!valid.success) {
      return res.status(400).json({ message: 'Validation failed', errors: valid.error.errors });
    }

    const { code, discountType, discountValue, scope, planId, featureKey, expiryDate, maxUsage, description } = valid.data;

    if (scope === 'SPECIFIC_PLAN' && !planId) {
      return res.status(400).json({ message: 'Plan ID is required for Specific Plan coupons' });
    }
    
    if (scope === 'SPECIFIC_FEATURE' && !featureKey) {
      return res.status(400).json({ message: 'Feature Key is required for Specific Feature coupons' });
    }

    // Check uniqueness
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    // Set expiry to the end of the selected day
    const expiry = new Date(expiryDate);
    expiry.setHours(23, 59, 59, 999);

    const coupon = await prisma.coupon.create({
      data: {
        code,
        discountType,
        discountValue,
        description,
        scope: scope as any,
        planId: scope === 'SPECIFIC_PLAN' ? planId : null,
        featureKey: scope === 'SPECIFIC_FEATURE' ? featureKey : null,
        expiryDate: expiry,
        maxUsage: maxUsage || null, // Handle 0 or undefined as null (unlimited)
      } as any,
    });

    return res.status(201).json({ message: 'Coupon created successfully', coupon });

  } catch (error) {
    console.error('Error creating coupon:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
