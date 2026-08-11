import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import multer from 'multer';
import { runMiddleware } from '@/lib/middleware/run-middleware';
import { uploadFile } from '@/lib/config/upload';
import { verifyAuth } from '@/lib/auth';

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

const updateEmployeeSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHERS']).optional(),
  bloodType: z.string().optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  pincode: z.string().min(1).optional(),
  employeeType: z.enum([
    'FOUNDER_CEO', 'COFOUNDER_COO', 'CTO', 'CPO', 'CFO',
    'BACKEND_ENGINEER', 'FRONTEND_ENGINEER', 'MOBILE_APP_DEVELOPER', 'FULL_STACK_DEVELOPER', 'AI_ML_ENGINEER', 'BLOCKCHAIN_ENGINEER', 'DEVOPS_ENGINEER', 'QA_ENGINEER', 'SECURITY_ENGINEER',
    'PRODUCT_MANAGER', 'ASSOCIATE_PRODUCT_MANAGER', 'UI_UX_DESIGNER', 'UX_RESEARCHER',
    'SALES_MANAGER', 'INSIDE_SALES_EXECUTIVE', 'FIELD_SALES_EXECUTIVE', 'PARTNERSHIP_MANAGER', 'MARKETING_MANAGER', 'DIGITAL_MARKETING_EXECUTIVE', 'CONTENT_WRITER', 'COMMUNITY_MANAGER',
    'CUSTOMER_SUCCESS_MANAGER', 'IMPLEMENTATION_ENGINEER', 'SUPPORT_EXECUTIVE_L1', 'TECHNICAL_SUPPORT_L2_L3', 'TRAINING_ONBOARDING_SPECIALIST', 'SUPPORT',
    'HR_MANAGER', 'HR_EXECUTIVE', 'RECRUITER', 'OPERATIONS_MANAGER', 'OFFICE_ADMIN', 'LEGAL_COMPLIANCE_OFFICER',
    'ACCOUNTANT', 'FINANCE_EXECUTIVE', 'PAYROLL_MANAGER', 'GST_COMPLIANCE_EXECUTIVE',
    'GOVERNMENT_CSR_LIAISON', 'INVESTOR_RELATIONS_MANAGER', 'GRANT_FUNDING_MANAGER'
  ]).optional(),
  company: z.string().optional(),
});

export default async function handler(req: any, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user || user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res, id);
  } else if (req.method === 'PUT') {
    return handlePut(req, res, id);
  } else if (req.method === 'PATCH') {
    return handlePatch(req, res, id);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res, id);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: true,
        documents: true,
        assignedTickets: {
            take: 5,
            orderBy: { createdAt: 'desc' }
        },
        attendances: {
            take: 10,
            orderBy: { date: 'desc' }
        }
      },
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Attach ticket stats
    const ticketStats = await prisma.ticket.groupBy({
        by: ['status'],
        where: {
            OR: [
                { assignedToId: employee.userId },
                { employeeId: employee.id }
            ]
        },
        _count: {
            status: true
        }
    });
    
    // Format stats into a simpler object
    const stats = ticketStats.reduce((acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
    }, {} as Record<string, number>);


    return res.status(200).json({ ...employee, stats });
  } catch (error) {
    console.error('Error fetching employee:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handlePut(req: any, res: NextApiResponse, id: string) {
  try {
    console.log('PUT received. Content-Type:', req.headers['content-type']);
    
    // Run Multer to parse formData
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
    
    console.log('Body after multer:', JSON.stringify(body, null, 2));
    console.log('Files after multer:', files ? Object.keys(files) : 'No files');

    const validation = updateEmployeeSchema.safeParse(body);
    if (!validation.success) {
        console.error('Validation Error:', JSON.stringify(validation.error.errors, null, 2));
        return res.status(400).json({ message: 'Validation failed', errors: validation.error.errors });
    }
    
    const data = validation.data;
    
    // Retrieve existing employee to get userId
    const existingEmployee = await prisma.employee.findUnique({ where: { id } });
    if (!existingEmployee) return res.status(404).json({ message: 'Employee not found' });

    let profilePicUrl: string | undefined;
    if (files?.profilePic?.[0]) {
        const uploadResult = await uploadFile(files.profilePic[0].buffer, 'employees/profiles', 'image');
        profilePicUrl = uploadResult.url;
    }

    // Upload New Documents
    const newDocuments: any[] = [];
    if (files?.documents && Array.isArray(files.documents)) {
         for (const file of files.documents) {
            try {
                const uploadResult = await uploadFile(file.buffer, 'employees/documents', 'auto');
                newDocuments.push({
                    fileName: file.originalname,
                    fileUrl: uploadResult.url,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    folder: 'employees/documents',
                    employeeId: id
                });
            } catch (err) {
                console.error('Failed to upload doc', err);
            }
         }
    }

    await prisma.$transaction(async (tx) => {
        // Update User info
        const userData: any = {};
        if (data.fullName) userData.name = data.fullName;
        if (data.email) userData.email = data.email; // Note: Email constraints might fail if dup
        if (data.phone) userData.phone = data.phone;
        if (data.address) userData.address = data.address;
        if (data.city) userData.city = data.city;
        if (data.state) userData.state = data.state;
        if (data.country) userData.country = data.country;
        if (data.pincode) userData.pincode = data.pincode;
        if (data.gender) userData.sex = data.gender;
        if (data.bloodType) userData.bloodType = data.bloodType;
        if (profilePicUrl) userData.profilePic = profilePicUrl;

        if (Object.keys(userData).length > 0) {
            await tx.user.update({
                where: { id: existingEmployee.userId },
                data: userData
            });
        }

        // Update Employee info
        const empData: any = {};
        if (data.employeeType) empData.employeeType = data.employeeType;
        if (data.company) empData.company = data.company;
        
        if (Object.keys(empData).length > 0) {
            await tx.employee.update({
                where: { id },
                data: empData
            });
        }

        // Add new documents
        if (newDocuments.length > 0) {
            await tx.employeeDocument.createMany({ data: newDocuments });
        }
    });

    return res.status(200).json({ message: 'Employee updated successfully' });

  } catch (error) {
    console.error('Error updating employee:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handlePatch(req: NextApiRequest, res: NextApiResponse, id: string) {
    try {
        let body = req.body;
        // If bodyParser is disabled, req.body is undefined. We need to parse it manually for JSON.
        if (!body) {
            const buffers = [];
            for await (const chunk of req) {
                buffers.push(chunk);
            }
            const data = Buffer.concat(buffers).toString();
            if (data) {
                try {
                    body = JSON.parse(data);
                } catch (e) {
                    console.error("Failed to parse JSON body in PATCH:", e);
                    return res.status(400).json({ message: 'Invalid JSON body' });
                }
            }
        }

        const { status } = body || {};
        if (!status || !['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
             return res.status(400).json({ message: 'Invalid status' });
        }

        const employee = await prisma.employee.update({
            where: { id },
            data: { status }
        });

        return res.status(200).json({ message: 'Status updated', data: employee });
    } catch (error) {
         console.error('Error updating employee status:', error);
         return res.status(500).json({ message: 'Internal server error' });
    }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, id: string) {
    try {
        const employee = await prisma.employee.findUnique({ where: { id } });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        // Delete User will cascade delete Employee (based on schema? No, Schema says Employee->User is cascade delete from User side? 
        // Let's check Schema: Employee -> user User @relation(fields: [userId] references:[id] onDelete: Cascade)
        // So deleting User deletes Employee.
        // We should delete the User.
        
        await prisma.user.delete({
            where: { id: employee.userId }
        });

        return res.status(200).json({ message: 'Employee and user account deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
