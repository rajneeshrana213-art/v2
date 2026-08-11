import { prisma } from "@/lib/prisma";
import { HostelType, Prisma } from "@prisma/client";

export class HostelService {
  /**
   * Create a new Hostel with optional initial configuration
   */
  static async createHostel(data: {
    name: string;
    type: HostelType;
    schoolId: string;
    capacity: number;
    address?: string;
    wardenId?: string;
    rules?: string;
  }) {
    return await prisma.hostel.create({
      data: {
        name: data.name,
        type: data.type,
        schoolId: data.schoolId,
        capacity: data.capacity,
        address: data.address,
        wardenId: data.wardenId,
        rules: data.rules,
      },
    });
  }

  /**
   * Update existing Hostel details
   */
  static async updateHostel(
    id: string,
    data: {
      name?: string;
      type?: HostelType;
      capacity?: number;
      address?: string;
      wardenId?: string;
      rules?: string;
    }
  ) {
    return await prisma.hostel.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a Hostel (Cascade delete is handled by database, but good to be explicit if needed)
   */
  static async deleteHostel(id: string) {
    return await prisma.hostel.delete({
      where: { id },
    });
  }

  /**
   * Get Hostel by ID with optional full hierarchy (Blocks -> Floors -> Rooms -> Beds)
   */
  static async getHostelById(id: string, includeHierarchy: boolean = false) {
    const hostel = await prisma.hostel.findUnique({
      where: { id },
      include: {
        warden: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        _count: {
          select: {
            allocation: { where: { status: "ACTIVE" } },
            blocks: true,
          }
        },
        blocks: includeHierarchy ? {
          include: {
            floors: {
              include: {
                rooms: {
                  include: {
                    beds: true
                  }
                }
              }
            }
          }
        } : undefined
      },
    });

    if (!hostel) return null;

    // Manual count for rooms since it's nested
    const roomCount = await prisma.hostelRoom.count({
      where: {
        floor: {
          block: {
            hostelId: id
          }
        }
      }
    });

    return {
      ...hostel,
      _count: {
        ...hostel._count,
        rooms: roomCount
      }
    };
  }

  /**
   * List all Hostels with basic stats
   */
  static async getAllHostels(
    schoolId: string,
    query?: string,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.HostelWhereInput = {
      schoolId,
      ...(query && {
        name: { contains: query, mode: "insensitive" },
      }),
    };

    const [hostels, total] = await Promise.all([
      prisma.hostel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          warden: {
            select: { name: true }
          },
          _count: {
            select: {
              allocation: { where: { status: "ACTIVE" } } // Count active students
            }
          }
        },
      }),
      prisma.hostel.count({ where }),
    ]);

    // Fetch room counts for each hostel
    const hostelsWithRooms = await Promise.all(hostels.map(async (hostel) => {
      const rooms = await prisma.hostelRoom.count({
        where: { floor: { block: { hostelId: hostel.id } } }
      });
      return {
        ...hostel,
        _count: {
          ...hostel._count,
          rooms
        }
      };
    }));

    return {
      data: hostelsWithRooms,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Infrastructure: Add a Block
   */
  static async createBlock(hostelId: string, name: string) {
    return await prisma.hostelBlock.create({
      data: {
        hostelId,
        name
      }
    });
  }

  /**
   * Infrastructure: Add a Floor
   */
  static async createFloor(blockId: string, floorNumber: number, name?: string) {
    return await prisma.hostelFloor.create({
      data: {
        blockId,
        floorNumber,
        name
      }
    });
  }

  /**
   * Infrastructure: Add a Room
   */
  static async createRoom(data: {
    floorId: string;
    roomNumber: string;
    type: any; // RoomType enum
    capacity: number;
    hasAC: boolean;
    baseRent: number;
  }) {
    // Auto-generate beds based on capacity
    return await prisma.hostelRoom.create({
      data: {
        floorId: data.floorId,
        roomNumber: data.roomNumber,
        type: data.type,
        capacity: data.capacity,
        hasAC: data.hasAC,
        baseRent: data.baseRent,
        beds: {
          create: Array.from({ length: data.capacity }).map((_, i) => ({
            bedNumber: `${i + 1}`,
          }))
        }
      },
      include: {
        beds: true
      }
    });
  }
}
