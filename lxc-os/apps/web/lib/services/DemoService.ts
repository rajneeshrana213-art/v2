import { prisma } from '@/lib/prisma';
import { DemoBookingInput } from '@/lib/validations/demo';

/**
 * Demo Booking Service
 * Maps form data to existing DemoBooking schema
 */
export class DemoService {
  /**
   * Create a new demo booking request
   * Maps form fields to existing schema: { name, email, school, dateTime }
   * Additional info (phone, studentCount, board, problem) is stored in the school field as JSON
   */
  static async createDemoBooking(data: DemoBookingInput) {
    try {
      // Combine additional info into a structured format
      const additionalInfo = {
        phone: data.phone,
        studentCount: data.studentCount,
        board: data.board,
        problem: data.problem || '',
        demoType: data.demoType,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
      };

      // Map to existing schema
      const demoBooking = await prisma.demoBooking.create({
        data: {
          name: data.fullName,
          email: data.email,
          school: `${data.schoolName} | ${JSON.stringify(additionalInfo)}`,
          dateTime: new Date(),
        },
      });

      return {
        success: true,
        data: {
          id: demoBooking.id,
          name: demoBooking.name,
          email: demoBooking.email,
          createdAt: demoBooking.createdAt,
        },
      };
    } catch (error: any) {
      console.error('Error creating demo booking:', error);
      
      // Handle specific Prisma errors
      if (error.code === 'P2002') {
        throw new Error('A demo request with this email already exists');
      }
      
      throw new Error('Failed to create demo booking. Please try again.');
    }
  }

  /**
   * Get all demo bookings (for admin use)
   */
  static async getAllDemoBookings(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const [bookings, totalItems] = await Promise.all([
        prisma.demoBooking.findMany({
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.demoBooking.count(),
      ]);

      return {
        success: true,
        data: bookings,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
          limit,
        },
      };
    } catch (error) {
      console.error('Error fetching demo bookings:', error);
      throw new Error('Failed to fetch demo bookings');
    }
  }
}
