import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const authUser = await verifyAuth(req, res);
  if (!authUser || authUser.role !== "superadmin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Super Admin access required" });
  }

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Missing or invalid group ID" });
  }

  // GET: fetch group details
  if (req.method === "GET") {
    try {
      const group = await prisma.schoolGroup.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              profilePic: true,
              sex: true,
              bloodType: true,
              address: true,
              city: true,
              state: true,
              country: true,
              pincode: true,
              createdAt: true,
            },
          },
          schools: {
            where: { isDeleted: false },
            select: {
              id: true,
              schoolName: true,
              schoolLogo: true,
              isActive: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: { schools: true },
          },
        },
      });

      if (!group) {
        return res.status(404).json({ message: "Organization not found" });
      }

      // Fetch user counts for all schools in this group
      const userCounts = await prisma.user.groupBy({
        by: ["role"],
        where: {
          school: {
            groupId: id,
          },
          isDeleted: false,
        },
        _count: true,
      });

      // Map user counts
      const counts = {
        totalStudents:
          userCounts.find((c) => c.role === "student")?._count || 0,
        totalTeachers:
          userCounts.find((c) => c.role === "teacher")?._count || 0,
        totalParents: userCounts.find((c) => c.role === "parent")?._count || 0,
        totalUsers: userCounts.reduce((acc, curr) => acc + curr._count, 0),
      };

      // Fetch active subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          schoolGroupId: id,
          isActive: true,
          isDeleted: false,
          endDate: { gte: new Date() },
        },
        include: {
          plan: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({
        ...group,
        isActive: !group.isDeleted,
        address: `${group.owner.address}, ${group.owner.city}, ${group.owner.state}, ${group.owner.country} - ${group.owner.pincode}`,
        counts,
        subscription: subscription
          ? {
              planName: subscription.plan.name,
              status: subscription.status,
              startDate: subscription.startDate,
              endDate: subscription.endDate,
              userLimit: subscription.userLimit,
              branchLimit: subscription.branchLimit,
            }
          : null,
      });
    } catch (error: any) {
      console.error("Error fetching group:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // PATCH: toggle active state (isDeleted = !isActive on the group)
  if (req.method === "PATCH") {
    try {
      const { isActive } = req.body;
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ message: "isActive must be a boolean" });
      }

      const group = await prisma.schoolGroup.findUnique({ where: { id } });
      if (!group) {
        return res.status(404).json({ message: "Organization not found" });
      }

      await prisma.schoolGroup.update({
        where: { id },
        data: { isDeleted: !isActive },
      });

      return res.status(200).json({
        message: `Organization ${isActive ? "enabled" : "disabled"} successfully`,
      });
    } catch (error: any) {
      console.error("Error updating group:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // DELETE: soft-delete the group
  if (req.method === "DELETE") {
    try {
      const group = await prisma.schoolGroup.findUnique({ where: { id } });
      if (!group) {
        return res.status(404).json({ message: "Organization not found" });
      }

      await prisma.schoolGroup.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: authUser.id,
        },
      });

      return res
        .status(200)
        .json({ message: "Organization deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting group:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["GET", "PATCH", "DELETE", "PUT"]);
  return res.status(405).json({ message: "Method not allowed" });
}
