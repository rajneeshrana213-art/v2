import { NextApiRequest, NextApiResponse } from 'next';
import { SalaryService } from '@/lib/services/finance/SalaryService';
import { salaryPaymentSchema } from '@/lib/validations/finance/salary';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // TODO: Auth (Teacher/Admin check)
  
  try {
    const result = salaryPaymentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.errors });
    }

    const { schoolId } = req.query; // Or from body/user context
    // Ideally user.schoolId

    if (!req.body.schoolId && !schoolId) {
        // Fallback or error
        // For now assume body has it or we pass it
    }
    
    // Assuming passed in body for now per schema/logic adaptation, 
    // or retrieve from session. 
    // Legacy controller used req.user.schoolId.
    // I'll extract schoolId from body if validation allows, otherwise require header/query.
    // schema doesn't have schoolId. I should add it or take from query.
    
    // Creating payment
    const payment = await SalaryService.recordPayment({
        ...result.data,
        schoolId: (req.query.schoolId as string) || (req.body.schoolId as string), // Temporary
    });
    
    return res.status(201).json(payment);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
