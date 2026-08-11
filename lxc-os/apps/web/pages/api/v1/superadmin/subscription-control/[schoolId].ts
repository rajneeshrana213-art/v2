import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { PlanModelType } from '@prisma/client';
import { SubscriptionService } from '@/lib/services/superadmin/SubscriptionService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { schoolId } = req.query;

  if (!schoolId || typeof schoolId !== 'string') {
    return res.status(400).json({ message: 'Invalid school ID' });
  }

  const authUser = await verifyAuth(req, res);
  if (!authUser || authUser.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  if (req.method === 'GET') {
    return handleGet(schoolId, res);
  } else if (req.method === 'PATCH') {
    return handlePatch(schoolId, req, res);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGet(schoolId: string, res: NextApiResponse) {
  try {
    let config = await prisma.schoolSubscriptionConfig.findUnique({
      where: { schoolId },
    });

    if (!config) {
      // Create default config if not exists
      config = await prisma.schoolSubscriptionConfig.create({
        data: {
          schoolId,
          planModel: 'MODEL_A',
          allowedUsers: 300,
          extraUserPrice: 5,
          gracePeriodDays: 7,
          isReadOnlyAfterGrace: true,
          autoSuspendAfterGrace: false,
        },
      });
    }

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        subscription: {
          where: { isActive: true },
          take: 1,
        }
      }
    });

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const usage = await SubscriptionService.getUsageStats(schoolId);

    return res.status(200).json({ config, school: { ...school, count: usage } });
  } catch (error) {
    console.error('Error fetching school config:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handlePatch(schoolId: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    const { 
      planModel, 
      allowedUsers, 
      extraUserPrice, 
      gracePeriodDays, 
      isReadOnlyAfterGrace, 
      autoSuspendAfterGrace 
    } = req.body;

    const updatedConfig = await prisma.schoolSubscriptionConfig.upsert({
      where: { schoolId },
      update: {
        planModel: planModel as PlanModelType,
        allowedUsers: allowedUsers ? parseInt(allowedUsers) : undefined,
        extraUserPrice: extraUserPrice ? parseFloat(extraUserPrice) : undefined,
        gracePeriodDays: gracePeriodDays ? parseInt(gracePeriodDays) : undefined,
        isReadOnlyAfterGrace,
        autoSuspendAfterGrace,
      },
      create: {
        schoolId,
        planModel: (planModel as PlanModelType) || 'MODEL_A',
        allowedUsers: allowedUsers ? parseInt(allowedUsers) : 300,
        extraUserPrice: extraUserPrice ? parseFloat(extraUserPrice) : 5,
        gracePeriodDays: gracePeriodDays ? parseInt(gracePeriodDays) : 7,
        isReadOnlyAfterGrace: isReadOnlyAfterGrace ?? true,
        autoSuspendAfterGrace: autoSuspendAfterGrace ?? false,
      },
    });

    return res.status(200).json(updatedConfig);
  } catch (error) {
    console.error('Error updating school config:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
