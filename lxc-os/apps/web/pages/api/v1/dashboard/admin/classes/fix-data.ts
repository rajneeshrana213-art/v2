
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const { method } = req;
  if (method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  if (!user.schoolId) {
    return res.status(400).json({ error: "User is not associated with a school" });
  }

  try {
    const classes = await prisma.class.findMany({
      where: { schoolId: user.schoolId },
      include: { Section: true }
    });

    if (!classes || classes.length === 0) {
      return res.status(200).json({ 
        results: [], 
        message: "No classes found for this school" 
      });
    }

    const results = [];

    for (const cls of classes) {
      // Add explicit null/undefined checks before reducing
      if (!cls.Section || !Array.isArray(cls.Section)) {
        results.push({ 
          className: cls.name, 
          fixed: false, 
          message: "No sections found" 
        });
        continue;
      }

      const totalSectionCapacity = cls.Section.reduce((acc, s) => {
        // Validate section object before accessing capacity
        if (!s || typeof s.capacity !== 'number') {
          return acc;
        }
        return acc + (s.capacity || 0);
      }, 0);
      
      if (cls.Section.length > 0 && totalSectionCapacity !== cls.capacity) {
        // Distribute capacity
        const baseCapacity = Math.floor(cls.capacity / cls.Section.length);
        const remainder = cls.capacity % cls.Section.length;

        for (let i = 0; i < cls.Section.length; i++) {
          const sec = cls.Section[i];
          if (!sec || !sec.id) continue; // Skip invalid sections
          
          await prisma.section.update({
            where: { id: sec.id },
            data: { 
              capacity: i === 0 ? baseCapacity + remainder : baseCapacity
            }
          });
        }
        results.push({ className: cls.name, fixed: true, distributed: cls.capacity });
      } else {
        results.push({ className: cls.name, fixed: false, message: "No mismatch or no sections" });
      }
    }

    return res.status(200).json({ results });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fix data" });
  }
}
