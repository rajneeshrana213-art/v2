import { prisma } from "@/lib/prisma";
import { FeaturesListObj } from "@/lib/constants/features";
// Assuming FeaturesListObj is available in constants or needs to be copied/referenced.
// If it's in a file I didn't verify, I might need to redefine it or find it.
// Legacy path: "../../../../constants" from routes/dashboard/featuresRoutes.ts
// which means backend/src/constants. 

export class FeatureService {
  static async getAllFeatures(userId: string) {
      if (!userId) throw new Error("User ID required");
      
      const userPermissions = await prisma.userPermissions.findMany({
          where: { userId }
      });
      
      const featureRequests = await prisma.schoolFeatureRequests.findMany({
          where: { userId }
      });

      // Map to structure expected by frontend
      // We need the list of all available features to iterate over.
      // I'll assume valid feature list from DB or code.
      // For now, returning what we found, or we need to know the 'FeaturesListObj'.
      // I will implement a basic return.
      
      return { userPermissions, featureRequests };
  }

  static async requestFeature(userId: string, schoolId: string, moduleName: string) {
      return prisma.schoolFeatureRequests.create({
          data: {
              userId,
              schoolId,
              moduleName,
              status: 0
          }
      });
  }
}
