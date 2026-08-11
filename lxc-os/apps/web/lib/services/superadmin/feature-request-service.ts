import { prisma } from "../../prisma";
import { Prisma } from "@prisma/client";

export interface FeaturesRequestListQuery {
  // Pagination
  page?: number;
  limit?: number;
  
  // Filtering
  status?: number; // 0 = pending, 1 = approved, 2 = rejected
  schoolId?: string;
  moduleName?: string;
  userId?: string;
  
  // Date filtering
  startDate?: string;
  endDate?: string;
  
  // Search
  search?: string; // Search in school name, module name, user name
  
  // Sorting
  sortBy?: "createdAt" | "updatedAt" | "moduleName" | "schoolName" | "status";
  sortOrder?: "asc" | "desc";
}

export interface FeaturesRequestListResponse {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  summary: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byModule: Array<{
      moduleName: string;
      count: number;
    }>;
    bySchool: Array<{
      schoolId: string;
      schoolName: string;
      count: number;
    }>;
  };
}

/**
 * Get comprehensive features request list with pagination, filtering, and sorting
 */
export async function getFeaturesRequestList(
  query: FeaturesRequestListQuery
): Promise<FeaturesRequestListResponse> {
  const {
    page = 1,
    limit = 20,
    status,
    schoolId,
    moduleName,
    userId,
    startDate,
    endDate,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  // Build where clause
  const where: Prisma.SchoolFeatureRequestsWhereInput = {};

  // Status filter
  if (status !== undefined) {
    where.status = status;
  }

  // School filter
  if (schoolId) {
    where.schoolId = schoolId;
  }

  // Module filter
  if (moduleName) {
    where.moduleName = {
      contains: moduleName,
      mode: "insensitive",
    };
  }

  // User filter
  if (userId) {
    where.userId = userId;
  }

  // Date range filter
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate);
    }
  }

  // Search filter (across multiple fields)
  if (search) {
    where.OR = [
      {
        moduleName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        school: {
          schoolName: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        user: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        user: {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  // Build order by clause
  let orderBy: Prisma.SchoolFeatureRequestsOrderByWithRelationInput;
  
  switch (sortBy) {
    case "schoolName":
      // For school name sorting, we need to use a different approach
      // Prisma doesn't support nested sorting directly in orderBy
      // We'll sort by createdAt as fallback and handle school name sorting in application layer if needed
      orderBy = { createdAt: sortOrder };
      break;
    case "moduleName":
      orderBy = { moduleName: sortOrder };
      break;
    case "status":
      orderBy = { status: sortOrder };
      break;
    case "createdAt":
      orderBy = { createdAt: sortOrder };
      break;
    case "updatedAt":
      orderBy = { updatedAt: sortOrder };
      break;
    default:
      orderBy = { createdAt: sortOrder };
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const take = limit;

  // Execute queries in parallel
  const [requests, total, summaryData] = await Promise.all([
    // Get paginated requests
    prisma.schoolFeatureRequests.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        school: {
          select: {
            id: true,
            schoolName: true,
            schoolCode: true,
            schoolLogo: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    }),
    // Get total count
    prisma.schoolFeatureRequests.count({ where }),
    // Get summary statistics
    Promise.all([
      // Total counts by status
      prisma.schoolFeatureRequests.groupBy({
        by: ["status"],
        _count: true,
      }),
      // Counts by module
      prisma.schoolFeatureRequests.groupBy({
        by: ["moduleName"],
        _count: true,
        orderBy: {
          _count: {
            moduleName: "desc",
          },
        },
        take: 10,
      }),
      // Counts by school
      prisma.schoolFeatureRequests.groupBy({
        by: ["schoolId"],
        _count: true,
        orderBy: {
          _count: {
            schoolId: "desc",
          },
        },
        take: 10,
      }),
    ]),
  ]);

  // Process summary data
  const statusCounts = summaryData[0].reduce(
    (acc, item) => {
      acc[item.status] = item._count;
      return acc;
    },
    { 0: 0, 1: 0, 2: 0 } as Record<number, number>
  );

  // Get school names for summary
  const schoolIds = summaryData[2].map((item) => item.schoolId);
  const schools = await prisma.school.findMany({
    where: { id: { in: schoolIds } },
    select: { id: true, schoolName: true },
  });
  const schoolMap = new Map(schools.map((s) => [s.id, s.schoolName]));

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    data: requests,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },
    summary: {
      total,
      pending: statusCounts[0] || 0,
      approved: statusCounts[1] || 0,
      rejected: statusCounts[2] || 0,
      byModule: summaryData[1].map((item) => ({
        moduleName: item.moduleName,
        count: item._count,
      })),
      bySchool: summaryData[2].map((item) => ({
        schoolId: item.schoolId,
        schoolName: schoolMap.get(item.schoolId) || "Unknown",
        count: item._count,
      })),
    },
  };
}

/**
 * Get single feature request by ID with full details
 */
export async function getFeatureRequestById(
  id: string
) {
  const request = await prisma.schoolFeatureRequests.findUnique({
    where: { id },
    include: {
      school: {
        select: {
          id: true,
          schoolName: true,
          schoolCode: true,
          schoolLogo: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        },
      },
    },
  });

  return request;
}

/**
 * Get feature request statistics
 */
export async function getFeatureRequestStatistics(
  schoolId?: string,
  startDate?: Date,
  endDate?: Date
) {
  const where: Prisma.SchoolFeatureRequestsWhereInput = {};

  if (schoolId) {
    where.schoolId = schoolId;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [total, byStatus, byModule, bySchool, recentRequests] = await Promise.all([
    prisma.schoolFeatureRequests.count({ where }),
    prisma.schoolFeatureRequests.groupBy({
      by: ["status"],
      _count: true,
      where,
    }),
    prisma.schoolFeatureRequests.groupBy({
      by: ["moduleName"],
      _count: true,
      where,
      orderBy: {
        _count: {
          moduleName: "desc",
        },
      },
      take: 10,
    }),
    prisma.schoolFeatureRequests.groupBy({
      by: ["schoolId"],
      _count: true,
      where,
      orderBy: {
        _count: {
          schoolId: "desc",
        },
      },
      take: 10,
    }),
    prisma.schoolFeatureRequests.findMany({
      where,
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        school: {
          select: {
            id: true,
            schoolName: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  return {
    total,
    byStatus: byStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count;
        return acc;
      },
      { 0: 0, 1: 0, 2: 0 } as Record<number, number>
    ),
    byModule: byModule.map((item) => ({
      moduleName: item.moduleName,
      count: item._count,
    })),
    bySchool: bySchool.map((item) => ({
      schoolId: item.schoolId,
      count: item._count,
    })),
    recentRequests,
  };
}
