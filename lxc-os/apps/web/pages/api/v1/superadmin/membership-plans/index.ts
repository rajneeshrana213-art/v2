import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { z } from "zod";

const createPlanSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    price: z.number().min(0, "Price must be positive"),
    discountedPrice: z.number().optional(),
    durationDays: z.number().min(1, "Duration must be at least 1 day"),
    planType: z.enum(["PLATFORM", "RIT"]).default("PLATFORM"),

    // Specific Limits
    userLimit: z.number().min(0).default(0),
    branchLimit: z.number().min(1).default(1),
  })
  .refine(
    (data) => {
      if (
        data.discountedPrice !== undefined &&
        data.discountedPrice > data.price
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Discounted price cannot be greater than the original price",
      path: ["discountedPrice"],
    },
  );

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const authUser = await verifyAuth(req, res);
  if (!authUser) return; // verifyAuth handles 401 response

  // Allow admins only for GET (viewing plans), restrict others to superadmin
  if (req.method === "GET") {
    if (authUser.role !== "superadmin" && authUser.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }
  } else if (authUser.role !== "superadmin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Super Admin access required" });
  }

  if (req.method === "GET") {
    return handleGet(req, res, authUser);
  } else if (req.method === "POST") {
    return handlePost(req, res);
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, authUser: any) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const planType = (req.query.planType as string) || "PLATFORM";
    const where: any = { planType };

    const category = req.query.category as string;
    if (planType === "RIT" && category && category !== "all") {
      where.name = {
        startsWith: `RIT_AI_${category.toUpperCase()}_`,
        mode: "insensitive",
      };
    }

    // If it's a school admin, hide plans that are intended for organizations/groups or demo
    if (authUser.role === "admin") {
      where.planType = "PLATFORM";
      where.AND = [
        {
          NOT: {
            name: {
              contains: "group",
              mode: "insensitive",
            },
          },
        },
        {
          NOT: {
            name: {
              contains: "LXC DEMO",
              mode: "insensitive",
            },
          },
        },
        {
          branchLimit: { lte: 1 },
        },
      ];
    }

    const [totalItems, plans] = await Promise.all([
      prisma.plan.count({ where }),
      prisma.plan.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return res.status(200).json({
      data: plans,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const validate = createPlanSchema.safeParse(req.body);
    if (!validate.success) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: validate.error.errors });
    }

    const { name, price, discountedPrice, durationDays, userLimit, branchLimit, planType } =
      validate.data;

    const plan = await prisma.plan.create({
      data: {
        name,
        price,
        discountedPrice: discountedPrice || null,
        durationDays,
        userLimit,
        branchLimit,
        planType,
      },
    });

    return res
      .status(201)
      .json({ message: "Plan created successfully", data: plan });
  } catch (error) {
    console.error("Error creating plan:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
