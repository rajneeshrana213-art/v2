import { NextApiRequest, NextApiResponse } from 'next';
import { FeatureService } from '@/lib/services/admin/dashboard/FeatureService';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

   // Needs auth middleware to get user context
   // Placeholder for user id extraction
   const userId = "placeholder_until_auth_middleware"; 
   
   if (req.method === 'GET') {
       try {
           const features = await FeatureService.getAllFeatures(userId);
           // Logic to merge with static list would go here or in service.
           return res.status(200).json({ message: "all permissions", featuresList: features });
       } catch (e: any) {
           return res.status(500).json({ error: e.message });
       }
   } else if (req.method === 'POST') {
       const { moduleName, schoolId } = req.body;
       if (!moduleName || !schoolId) return res.status(400).json({ error: "Missing moduleName or schoolId" });
       try {
           await FeatureService.requestFeature(userId, schoolId, moduleName);
           return res.status(200).json({ status: "ok" });
       } catch (e: any) {
           return res.status(500).json({ error: e.message });
       }
   }
   return res.status(405).json({ error: "Method not allowed" });
}
