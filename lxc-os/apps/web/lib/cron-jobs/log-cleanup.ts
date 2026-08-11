
import { prisma } from "../prisma";
import Logger from "../utils/logger";

export async function runLogCleanup() {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await prisma.log.deleteMany({
      where: {
        createdAt: { lt: oneDayAgo },
      },
    });

    Logger.info(`Log cleanup: Deleted ${result.count} old log entries`);
    return { success: true, deletedCount: result.count };
  } catch (error: any) {
    Logger.error("Log cleanup error:", error);
    throw error;
  }
}
