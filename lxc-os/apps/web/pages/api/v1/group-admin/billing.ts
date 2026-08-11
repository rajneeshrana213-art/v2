import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { formatISTDateKey } from "@/lib/utils/date-utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    if (user.role !== "group_admin") {
      return res.status(403).json({ error: "Forbidden: group_admin access required" });
    }

    if (!user.schoolGroupId) {
      return res.status(400).json({ error: "User is not associated with an organization" });
    }

    const groupId = user.schoolGroupId;
    console.log("[DEBUG] Fetching billing for GroupID:", groupId);

    // Fetch active subscription for the group
    const subscription = await prisma.subscription.findFirst({
      where: {
        schoolGroupId: groupId,
        isActive: true,
      },
      orderBy: { endDate: "desc" },
      include: { plan: true },
    });
    console.log("[DEBUG] Active Subscription found:", subscription ? { id: subscription.id, plan: subscription.plan.name } : "NONE");

    const schoolGroup = await prisma.schoolGroup.findUnique({
      where: { id: groupId },
      select: { branchLimit: true },
    });
    console.log("[DEBUG] SchoolGroup details:", schoolGroup);

    // Fetch active branches (schools)
    const branches = await prisma.school.findMany({
      where: { groupId: groupId, isDeleted: false },
      select: { id: true },
    });
    const branchIds = branches.map(b => b.id);
    const branchCount = branches.length;
    console.log("[DEBUG] Branch Count:", branchCount, "IDs:", branchIds);

    const studentCount = await prisma.student.count({
      where: { schoolId: { in: branchIds }, status: "ACTIVE" },
    });
    console.log("[DEBUG] Student Count across branches:", studentCount);

    const groupSubscriptions = await prisma.subscription.findMany({
      where: { schoolGroupId: groupId },
      select: { paymentId: true },
    });
    const paymentIds = groupSubscriptions.map((sub) => sub.paymentId).filter(id => id != null);
    console.log("[DEBUG] Payment IDs found for group:", paymentIds);

    const invoicesData = await prisma.payment.findMany({
      where: { id: { in: paymentIds } },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    console.log("[DEBUG] Raw Invoices Count:", invoicesData.length);

    // Remove duplicates since many subscriptions might share the same paymentId
    const uniqueInvoices = Array.from(new Map(invoicesData.map(item => [item.id, item])).values());

    const invoices = uniqueInvoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || inv.razorpayOrderId,
      amount: inv.amount,
      status: inv.status,
      paymentDate: formatISTDateKey(new Date(inv.paymentDate ?? inv.createdAt)),
      description: inv.description || "Group Plan Subscription",
      receiptUrl: inv.receiptUrl || null,
      invoiceUrl: inv.invoiceUrl || null,
    }));

    const availablePlansRaw = await prisma.plan.findMany({
      orderBy: { price: "asc" },
    });

    const availablePlans = availablePlansRaw.filter(p => 
      p.name.toLowerCase().includes("group") || (p.branchLimit && p.branchLimit > 1)
    );

    const responseData = {
      plan: subscription
        ? {
          id: subscription.plan.id,
          name: subscription.plan.name,
          price: subscription.plan.price,
          endDate: subscription.endDate.toISOString(),
          userLimit: (subscription as any).userLimit || subscription.plan.userLimit || 5000,
          status: subscription.status,
        }
        : null,
      usage: {
        branchCount: branchIds.length,
        studentCount,
        branchLimit: (schoolGroup as any)?.branchLimit ?? 10,
      },
      availablePlans: availablePlans.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        userLimit: p.userLimit,
        durationDays: p.durationDays
      })),
      invoices,
    };

    console.log("[DEBUG] Returning Response Plan Name:", responseData.plan?.name || "NULL");
    return res.status(200).json(responseData);
  } catch (error) {
    console.error("[DEBUG] Error fetching group-admin billing data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
