import type { NextApiRequest, NextApiResponse } from 'next';
import { DemoService } from '@/lib/services/DemoService';
import { demoBookingSchema } from '@/lib/validations/demo';
import { ZodError } from 'zod';

type SuccessResponse = {
  success: true;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
};

type ErrorResponse = {
  success: false;
  message: string;
  errors?: Record<string, string>;
};

// Public endpoint: intentionally accessible without session authentication.
// Prospective customers book a product demo before they have an account.
// Input is validated via demoBookingSchema.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    // Validate request body
    const validatedData = demoBookingSchema.parse(req.body);

    // Create demo booking
    const result = await DemoService.createDemoBooking(validatedData);

    return res.status(201).json({
      success: true,
      message: 'Demo request submitted successfully! We\'ll contact you within 24 hours.',
      data: result.data,
    });
  } catch (error) {
    console.error('Demo booking error:', error);

    // Handle validation errors
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: fieldErrors,
      });
    }

    // Handle other errors
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    });
  }
}
