import { NextApiRequest, NextApiResponse } from 'next';
import { RegistrationService } from '@/lib/services/admin/core/RegistrationService';
import { publicRegisterStudentSchema } from '@/lib/validations/admin/registration';
import { cors } from '@/lib/middleware/cors';

// Public endpoint: intentionally accessible without session authentication.
// Student self-registration is gated by a one-time registration token
// (validated by RegistrationService) distributed by the school, making
// session-based auth unnecessary.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, formData } = req.body;

  if (!token || !formData) {
    return res.status(400).json({ error: 'Token and form data are required' });
  }

  try {
    // Validate form data
    const validatedData = publicRegisterStudentSchema.parse(formData);

    // Submit request
    const request = await RegistrationService.submitRequest(token, validatedData);

    return res.status(201).json({
      success: true,
      message: 'Registration request submitted successfully',
      requestId: request.id,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(400).json({ error: error.message });
  }
}
