import { prisma } from "@/lib/prisma";

export class InventoryService {
  static async createInventory(data: {
    name: string;
    quantity: number;
    roomId: string;
  }) {
    return prisma.inventory.create({
      data: {
        name: data.name,
        quantity: data.quantity,
        roomId: data.roomId,
      },
    });
  }

  static async updateInventory(id: string, data: {
    name?: string;
    quantity?: number;
  }) {
    return prisma.inventory.update({
      where: { id },
      data,
    });
  }

  static async getInventoryById(id: string) {
    return prisma.inventory.findUnique({
      where: { id },
    });
  }

  static async getInventoriesByRoom(roomId: string) {
    return prisma.inventory.findMany({
      where: { roomId },
    });
  }

  static async deleteInventory(id: string) {
    return prisma.inventory.delete({
      where: { id },
    });
  }
}
