import { prisma } from "@/lib/prisma";
import { RoomType, RoomStatus } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

export class RoomService {
  static async createRoom(data: {
    number: string;
    type: RoomType;
    status: string;
    hostelId: string;
  }) {
    return prisma.room.create({
      data: {
        id: uuidv4(),
        number: data.number,
        type: data.type,
        status: data.status as RoomStatus,
        hostel_id: data.hostelId,
      },
    });
  }

  static async updateRoom(
    id: string,
    data: {
      number?: string;
      type?: RoomType;
      status?: string;
      hostelId?: string;
    }
  ) {
    return prisma.room.update({
      where: { id },
      data: {
        number: data.number,
        type: data.type,
        status: data.status as RoomStatus,
        hostel_id: data.hostelId,
      },
    });
  }

  static async deleteRoom(id: string) {
    return prisma.room.delete({
      where: { id },
    });
  }

  static async getRoomById(id: string) {
    return prisma.room.findUnique({
      where: { id },
      include: {
        Inventory: true,
      }
    });
  }

  static async getAllRooms(
    hostelId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;
    return prisma.room.findMany({
      where: { hostel_id: hostelId },
      include: { Inventory: true },
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
    });
  }
}
