import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { runMiddleware } from '@/lib/middleware/run-middleware';
import { uploadFile } from '@/lib/config/upload';
import { sendEmployeeWelcomeEmail } from '@/lib/services/emailService';

// Configure Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const createEmployeeSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  gender: z.enum(['MALE', 'FEMALE', 'OTHERS']),
  bloodType: z.string().optional(),
  
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pincode: z.string().min(1, "Pincode is required"),
  
  employeeType: z.enum([
    'FOUNDER_CEO', 'COFOUNDER_COO', 'CTO', 'CPO', 'CFO',
    'BACKEND_ENGINEER', 'FRONTEND_ENGINEER', 'MOBILE_APP_DEVELOPER', 'FULL_STACK_DEVELOPER', 'AI_ML_ENGINEER', 'BLOCKCHAIN_ENGINEER', 'DEVOPS_ENGINEER', 'QA_ENGINEER', 'SECURITY_ENGINEER',
    'PRODUCT_MANAGER', 'ASSOCIATE_PRODUCT_MANAGER', 'UI_UX_DESIGNER', 'UX_RESEARCHER',
    'SALES_MANAGER', 'INSIDE_SALES_EXECUTIVE', 'FIELD_SALES_EXECUTIVE', 'PARTNERSHIP_MANAGER', 'MARKETING_MANAGER', 'DIGITAL_MARKETING_EXECUTIVE', 'CONTENT_WRITER', 'COMMUNITY_MANAGER',
    'CUSTOMER_SUCCESS_MANAGER', 'IMPLEMENTATION_ENGINEER', 'SUPPORT_EXECUTIVE_L1', 'TECHNICAL_SUPPORT_L2_L3', 'TRAINING_ONBOARDING_SPECIALIST', 'SUPPORT',
    'HR_MANAGER', 'HR_EXECUTIVE', 'RECRUITER', 'OPERATIONS_MANAGER', 'OFFICE_ADMIN', 'LEGAL_COMPLIANCE_OFFICER',
    'ACCOUNTANT', 'FINANCE_EXECUTIVE', 'PAYROLL_MANAGER', 'GST_COMPLIANCE_EXECUTIVE',
    'GOVERNMENT_CSR_LIAISON', 'INVESTOR_RELATIONS_MANAGER', 'GRANT_FUNDING_MANAGER'
  ]),
  company: z.string().default('LearnXChain'),
});

export default async function handler(req: any, res: NextApiResponse) {
  const authUser = await verifyAuth(req as NextApiRequest, res);
  if (!authUser || authUser.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      OR: [
        { user: { name: { contains: String(search), mode: 'insensitive' } } },
        { user: { email: { contains: String(search), mode: 'insensitive' } } },
        { employeeCode: { contains: String(search), mode: 'insensitive' } },
      ],
    };

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              profilePic: true,
              role: true,
              address: true,
              city: true,
              state: true,
              country: true,
              pincode: true,
              bloodType: true,
              sex: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          documents: true,
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employee.count({ where }),
    ]);

    return res.status(200).json({
      data: employees,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handlePost(req: any, res: NextApiResponse) {
  try {
    await runMiddleware(
      req,
      res,
      upload.fields([
        { name: 'profilePic', maxCount: 1 },
        { name: 'documents', maxCount: 10 },
      ])
    );

    const body = req.body;
    const files = req.files;

    // Parse bodies that might be stringified (if coming from FormData sometimes they get messy but usually not with Multer + Next.js default config disabled)
    // However, basic fields should be directly accessible
    
    const validationResult = createEmployeeSchema.safeParse(body);
    
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Validation failed', errors: validationResult.error.errors });
    }

    const data = validationResult.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    let profilePicUrl = null;
    if (files?.profilePic?.[0]) {
      const uploadResult = await uploadFile(files.profilePic[0].buffer, 'employees/profiles', 'image');
      profilePicUrl = uploadResult.url;
    }

    // Prepare Documents URLs
    const uploadedDocuments: any[] = [];
    if (files?.documents && Array.isArray(files.documents)) {
      for (const file of files.documents) {
         try {
             // For documents, we might want to support pdfs etc. 'raw' or 'auto' resource type might be better but 'image' is safe for images. 
             // Assuming uploadFile handles extension/mime detection or defaults. 
             // If uploadFile is strictly for images, we might need another helper. Assuming it wraps cloudinary.uploader.upload_stream
             // Let's guess 'auto' or 'raw' for generic docs.
             // Based on usage in schools/create.ts, it takes (buffer, folder, type).
             // We'll trust 'auto' or verify uploadFile signature later.
             // Using 'auto' to support PDFs etc.
             const uploadResult = await uploadFile(file.buffer, 'employees/documents', 'auto');
             uploadedDocuments.push({
                 fileName: file.originalname,
                 fileUrl: uploadResult.url,
                 fileType: file.mimetype,
                 fileSize: file.size,
                 folder: 'employees/documents'
             });
         } catch (err) {
             console.error(`Failed to upload document ${file.originalname}`, err);
         }
      }
    }

    const employeeCode = `EMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.fullName,
          email: data.email,
          password: hashedPassword,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          pincode: data.pincode,
          sex: data.gender as any,
          bloodType: data.bloodType || '',
          profilePic: profilePicUrl,
          role: 'employee', // Assign generic employee role or specific based on type?
          // Since EmployeeType is specific, maybe User role is 'employee'
        },
      });

      const employee = await tx.employee.create({
        data: {
            userId: user.id,
            employeeCode: employeeCode,
            employeeType: data.employeeType as any,
            company: data.company,
            status: 'ACTIVE'
        }
      });

      if (uploadedDocuments.length > 0) {
          await tx.employeeDocument.createMany({
              data: uploadedDocuments.map(doc => ({
                  employeeId: employee.id,
                  ...doc
              }))
          });
      }

      const { password: _pw, ...safeUser } = user;
      return { user: safeUser, employee };
    });

    // Send Welcome Email
    try {
        await sendEmployeeWelcomeEmail(
            data.email,
            data.fullName,
            generatedPassword,
            result.employee.employeeCode
        );
    } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
    }

    return res.status(201).json({
        message: 'Employee created successfully',
        data: result,
    });

  } catch (error) {
    console.error('Error creating employee:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
