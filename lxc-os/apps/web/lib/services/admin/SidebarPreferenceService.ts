import { prisma } from "@/lib/prisma";

export interface SidebarPreferences {
  [key: string]: boolean; // e.g., "section:Overview": true, "item:Overview:/admin": false
}

export class SidebarPreferenceService {
  /**
   * Get sidebar preferences for a user
   */
  static async getPreferences(userId: string): Promise<SidebarPreferences> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { sidebarPreferences: true },
      });

      return (user?.sidebarPreferences as SidebarPreferences) || {};
    } catch (error) {
      console.error("Error fetching sidebar preferences:", error);
      return {};
    }
  }

  /**
   * Save sidebar preferences for a user
   */
  static async savePreferences(
    userId: string,
    preferences: SidebarPreferences
  ): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          sidebarPreferences: preferences as any,
        },
      });
    } catch (error) {
      console.error("Error saving sidebar preferences:", error);
      throw error;
    }
  }
}
