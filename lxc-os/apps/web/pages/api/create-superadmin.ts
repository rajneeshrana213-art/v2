import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const createSuperAdminSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  userName: z.string().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  profilePic: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pincode: z.string().min(1, "Pincode is required"),
  bloodType: z.string().min(1, "Blood Type is required"),
  sex: z.enum(['MALE', 'FEMALE', 'OTHERS'], { errorMap: () => ({ message: "Sex must be MALE, FEMALE, or OTHERS" }) }),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Security Guard: Only allow creation if a specific ENV key matches
  // or if there are NO users in the database yet.
  const initKey = req.headers['x-init-key'];
  const masterKey = process.env.INIT_MASTER_KEY;

  if (!masterKey || initKey !== masterKey) {
    // Check if any superadmin already exists
    const superadminCount = await prisma.user.count({ where: { role: 'superadmin' } });
    if (superadminCount > 0) {
      return res.status(401).json({ message: 'Unauthorized: Initialization key missing or invalid' });
    }
  }

  try {
    const valid = createSuperAdminSchema.safeParse(req.body);
    if (!valid.success) {
      return res.status(400).json({ message: 'Validation failed', errors: valid.error.errors });
    }

    const { email, password, name, userName, phone, profilePic, address, city, state, country, pincode, bloodType, sex } = valid.data;

    // Check if user exists (email or username)
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email },
                ...(userName ? [{ userName }] : [])
            ]
        }
    });

    if (existingUser) {
        return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        userName: userName || email.split('@')[0], // Default username if not provided
        phone,
        profilePic,
        address,
        city,
        state,
        country,
        pincode,
        bloodType,
        sex,
        role: 'superadmin',
      },
      select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
      }
    });

    return res.status(201).json({ message: 'Superadmin created successfully', user });

  } catch (error) {
    console.error('Error creating superadmin:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
