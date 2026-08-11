import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { z } from "zod";
import { createPlanInvoice } from "@/lib/utils/invoice-utils";

const assignPlanSchema = z.object({
  groupId: z.string().min(1, "Organization ID is required"),
  planId: z.string().min(1, "Plan ID is required"),
  durationDays: z.number().int().positive("Duration must be a positive number"),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const authUser = await verifyAuth(req, res);
  if (!authUser || authUser.role !== "superadmin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Super Admin access required" });
  }

  try {
    const { groupId, planId, durationDays } = assignPlanSchema.parse(req.body);

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const group = await prisma.schoolGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + durationDays);

    // Get all schools in the group 
    const schools = await prisma.school.findMany({
      where: { groupId: groupId, isDeleted: false },
      select: { id: true },
    });

    // Fallback: if no member schools are linked yet, use the group owner's school
    // if (schools.length === 0) {
    //   const ownerSchool = await prisma.school.findFirst({
    //     where: { userId: group.ownerId, isDeleted: false },
    //     select: { id: true },
    //   });
    //   if (ownerSchool) {
    //     schools = [ownerSchool];
    //   }
    // }

    if (schools.length === 0) {
      return res.status(400).json({
        message:
          "No schools found for this organization. Ensure the group admin has a school registered, or add school branches to the organization first.",
      });
    }

    // Create a single manual payment for this group assignment
    const payment = await prisma.payment.create({
      data: {
        amount: 0,
        razorpayOrderId: "MANUAL_ORG_" + Date.now(),
        status: "COMPLETED",
        description: `Manual plan assignment by Super Admin for ${group.name}`,
      },
    });

    // Deactivate existing active subscriptions for all schools in the group
    await prisma.subscription.updateMany({
      where: {
        schoolId: { in: schools.map((s) => s.id) },
        isActive: true,
      },
      data: { isActive: false, status: "CANCELLED" },
    });

    // Create a subscription for each school in the group, all linked to the groupId
    const subscriptions = await Promise.all(
      schools.map(async (school) => {
        const sub = await prisma.subscription.create({
          data: {
            schoolGroupId: groupId,
            planId: planId,
            schoolId: school.id,
            startDate,
            endDate,
            isActive: true,
            status: "ACTIVE",
            paymentId: payment.id,
          },
        });

        // Trigger the invoice generation and email in the background
        createPlanInvoice(sub.id).catch((err) =>
          console.error(`Background manual invoice error for school ${school.id}:`, err),
        );

        return sub;
      }),
    );

    return res.status(200).json({
      message: `Plan assigned successfully to ${schools.length} school(s) in ${group.name}`,
      count: subscriptions.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: error.errors });
    }
    console.error("Error assigning plan to organization:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
