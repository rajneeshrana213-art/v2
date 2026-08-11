import { z } from 'zod';

// Board options enum
export const BOARD_OPTIONS = [
  'CBSE',
  'ICSE',
  'State Board',
  'IB',
  'IGCSE',
  'Other',
] as const;

// Demo booking validation schema
// Maps to existing DemoBooking model: { name, email, school, dateTime }
export const demoBookingSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .trim(),
  
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number')
    .trim(),
  
  schoolName: z
    .string()
    .min(2, 'School name must be at least 2 characters')
    .max(200, 'School name must not exceed 200 characters')
    .trim(),
  
  studentCount: z
    .string()
    .min(1, 'Student count is required')
    .max(50, 'Student count must not exceed 50 characters')
    .trim(),
  
  board: z
    .enum(BOARD_OPTIONS, {
      errorMap: () => ({ message: 'Please select a valid board' }),
    }),
  
  problem: z
    .string()
    .max(1000, 'Problem description must not exceed 1000 characters')
    .trim()
    .optional(),

  demoType: z.string().optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
});

export type DemoBookingInput = z.infer<typeof demoBookingSchema>;
