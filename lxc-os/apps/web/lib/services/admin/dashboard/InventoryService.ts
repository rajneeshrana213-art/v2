
import { prisma } from "@/lib/prisma";

export class InventoryService {
    static async createItem(data: any) {
        return prisma.inventoryItem.create({ data });
    }

    static async getItems(schoolId: string) {
        return prisma.inventoryItem.findMany({
            where: { schoolId },
            include: { transactions: true }
        });
    }

    static async getItemById(id: string) {
        return prisma.inventoryItem.findUnique({
            where: { id },
             include: { transactions: true }
        });
    }

    static async updateItem(id: string, data: any) {
        return prisma.inventoryItem.update({ where: { id }, data });
    }

    static async deleteItem(id: string) {
        return prisma.inventoryItem.delete({ where: { id } });
    }

    static async recordTransaction(data: any) {
        return prisma.$transaction(async (tx) => {
            const transaction = await tx.inventoryTransaction.create({ data });

            if (data.type === "ADD") {
                await tx.inventoryItem.update({
                    where: { id: data.inventoryItemId },
                    data: { quantity: { increment: data.quantity } }
                });
            } else {
                 await tx.inventoryItem.update({
                    where: { id: data.inventoryItemId },
                    data: { quantity: { decrement: data.quantity } }
                });
            }

            return transaction;
        });
    }

    static async getItemTransactions(inventoryItemId: string) {
        return prisma.inventoryTransaction.findMany({
            where: { inventoryItemId },
            orderBy: { createdAt: "desc" }
        });
    }
}
