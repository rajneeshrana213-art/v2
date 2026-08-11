import {
  PrismaClient,
  ActiveStatus,
  UserSex,
  MaritalStatus,
  EmployeeType,
  KPIType,
  LeadStatus,
  DemoStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const demoUsers = [
  {
    name: "Rajneesh Rana",
    email: "superadmin@demo.com",
    password: "123456",
    role: "superadmin",
  },
  {
    name: "Aryan Sharma",
    email: "admin@demo.com",
    password: "123456",
    role: "admin",
  },
  {
    name: "Tejaswa Rajput",
    email: "employee@demo.com",
    password: "123456",
    role: "employee",
  },
  {
    name: "Sumit Singh",
    email: "teacher@demo.com",
    password: "123456",
    role: "teacher",
  },
  {
    name: "Rahul Kumar",
    email: "student@demo.com",
    password: "123456",
    role: "student",
  },
  {
    name: "Sunita Devi",
    email: "parent@demo.com",
    password: "123456",
    role: "parent",
  },
  {
    name: "Rajbir Jaat",
    email: "driver@demo.com",
    password: "123456",
    role: "driver",
  },
  {
    name: "Ranbir Kapoor",
    email: "hostel@demo.com",
    password: "123456",
    role: "hostel",
  },
  {
    name: "Biky Dev",
    email: "library@demo.com",
    password: "123456",
    role: "library",
  },
  {
    name: "Kuldeep Rana",
    email: "transport@demo.com",
    password: "123456",
    role: "transport",
  },
  {
    name: "Sanjay chauhan",
    email: "accounts@demo.com",
    password: "123456",
    role: "account",
  },
  {
    name: "Deepika Singh",
    email: "academics@demo.com",
    password: "123456",
    role: "academics",
  },
  {
    name: "Arjun Ranawat",
    email: "staff@demo.com",
    password: "123456",
    role: "staff",
  },
  {
    name: "Reetika",
    email: "org@demo.com",
    password: "123456",
    role: "group_admin",
  },
];

async function main() {
  console.log("🚀 Starting refined demo user seeding...");

  // 1. Create Super Admin First (to be the school owner)
  const superAdminData = demoUsers.find((u) => u.role === "superadmin")!;
  const hashedPassword = await bcrypt.hash(superAdminData.password, 10);

  console.log("Upserting Super Admin...");
  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminData.email },
    update: {
      password: hashedPassword,
      role: "superadmin",
      schoolId: null, // Super Admin is company-level
    },
    create: {
      name: superAdminData.name,
      email: superAdminData.email,
      phone: "1234567890",
      password: hashedPassword,
      role: "superadmin",
      address: "123 Super St",
      city: "Super City",
      state: "Super State",
      country: "India",
      pincode: "123456",
      bloodType: "O+",
      sex: "MALE",
      schoolId: null,
    },
  });

  console.log(`Super Admin ready: ${superAdmin.id} (${superAdmin.email})`);

  // 2. Ensure a default school exists, owned by Super Admin
  console.log("Checking for demo school...");
  let school = await prisma.school.findFirst({
    where: { schoolName: "Demo School" },
  });

  if (!school) {
    console.log(`Creating demo school owned by ${superAdmin.id}...`);
    school = await prisma.school.create({
      data: {
        schoolName: "LXC Demo School",
        userId: superAdmin.id,
      },
    });
  }

  // 1.1 Ensure an Academic Year exists
  let academicYear = await prisma.academicYear.findFirst({
    where: { schoolId: school.id },
  });

  if (!academicYear) {
    console.log("Creating academic year...");
    academicYear = await prisma.academicYear.create({
      data: {
        year: "2026-2027",
        startDate: new Date("2026-04-01"),
        endDate: new Date("2027-03-31"),
        isActive: true,
        schoolId: school.id,
      },
    });
  }

  // 1.2 Ensure a Bus exists
  let bus = await prisma.bus.findFirst({
    where: { schoolId: school.id },
  });

  if (!bus) {
    console.log("Creating demo bus...");
    bus = await prisma.bus.create({
      data: {
        busNumber: "DM01-B123",
        capacity: 40,
        schoolId: school.id,
      },
    });
  }

  // 1.3 Ensure a Class exists
  let demoClass = await prisma.class.findFirst({
    where: { schoolId: school.id },
  });

  if (!demoClass) {
    console.log("Creating demo class...");
    demoClass = await prisma.class.create({
      data: {
        name: "class 10",
        capacity: 50,
        schoolId: school.id,
      },
    });
  }

  // 2. Seed rest of the Users
  for (const userData of demoUsers) {
    if (userData.role === "superadmin") continue; // Already done

    console.log(`Processing user: ${userData.email} (${userData.role})...`);
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const isCompanyLevel =
      userData.role === "superadmin" ||
      userData.role === "employee" ||
      userData.role === "group_admin";
    const userSchoolId = isCompanyLevel ? null : school.id;

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        role: userData.role as any,
        password: hashedPassword,
        schoolId: userSchoolId,
      },
      create: {
        name: userData.name,
        email: userData.email,
        phone: "1234567890",
        password: hashedPassword,
        role: userData.role as any,
        address: "123 Demo St",
        city: "Demo City",
        state: "Demo State",
        country: "India",
        pincode: "123456",
        bloodType: "O+",
        sex: "MALE",
        schoolId: userSchoolId,
      },
    });

    // 3. Create role-specific records
    try {
      if (userData.role === "teacher") {
        await prisma.teacher.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
            schoolId: school.id,
            teacherSchoolId: "TCH001",
            fatherName: "Teacher Father",
            motherName: "Teacher Mother",
            dateOfBirth: new Date("1980-01-01"),
            maritalStatus: MaritalStatus.MARRIED,
            languagesKnown: "English, Hindi",
            qualification: "M.Ed",
            workExperience: "10 Years",
            previousSchool: "Old School",
            previousSchoolAddress: "Old Address",
            previousSchoolPhone: "0987654321",
            salary: 50000,
            accountNumber: "1234567890",
            bankName: "Demo Bank",
            ifscCode: "DBNK0001",
            branchName: "Main Branch",
            Resume: "resume_url",
            joiningLetter: "letter_url",
          },
        });
      } else if (userData.role === "student") {
        const existingStudent = await prisma.student.findUnique({
          where: { userId: user.id },
        });
        if (!existingStudent) {
          const newStudent = await prisma.student.create({
            data: {
              userId: user.id,
              schoolId: school.id,
              admissionNo: "ADM001",
              admissionDate: new Date(),
              dateOfBirth: new Date("2010-01-01"),
              languagesKnown: "English",
              fatherName: "Father Name",
              fatherPhone: "1234567890",
              fatherOccupation: "Engineer",
              motherName: "Mother Name",
              motherPhone: "1234567890",
              guardianName: "Guardian Name",
              guardianRelation: "Father",
              guardianEmail: "father@demo.com",
              guardianPhone: "1234567890",
              guardianOccupation: "Business",
              guardianAddress: "Demo Address",
              areSiblingStudying: "No",
              siblingName: "N/A",
              siblingClass: "N/A",
              siblingRollNo: "N/A",
              siblingAdmissionNo: "N/A",
              currentAddress: "Demo Address",
              permanentAddress: "Demo Address",
              medicalCertificate: "N/A",
              transferCertificate: "N/A",
              medicalCondition: "None",
              allergies: "None",
              medicationName: "None",
            },
          });
          // Create academic record separately
          await prisma.studentAcademicRecord.create({
            data: {
              studentId: newStudent.id,
              academicYear: academicYear.year,
              rollNumber: "1",
              classId: demoClass.id,
            },
          });
        }
      } else if (userData.role === "parent") {
        await prisma.parent.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
          },
        });
      } else if (userData.role === "driver") {
        await prisma.driver.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
            schoolId: school.id,
            busId: bus.id,
            license: "LIC123456" + user.id.slice(-4),
          },
        });
      } else if (userData.role === "hostel") {
        const existingHostel = await prisma.hostel.findFirst({
          where: { name: "Demo Hostel", schoolId: school.id },
        });
        if (existingHostel) {
          await prisma.hostel.update({
            where: { id: existingHostel.id },
            data: { wardenId: user.id },
          });
        } else {
          await prisma.hostel.create({
            data: {
              name: "Demo Hostel",
              schoolId: school.id,
              type: "COED",
              capacity: 100,
              wardenId: user.id,
            },
          });
        }
      } else if (userData.role === "library") {
        await prisma.library.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
            schoolId: school.id,
          },
        });

        // Create policy separately if needed
        const library = await prisma.library.findUnique({
          where: { userId: user.id },
        });
        if (library) {
          await prisma.libraryPolicy.upsert({
            where: { libraryId: library.id },
            update: { finePerDay: 5.0 },
            create: {
              libraryId: library.id,
              finePerDay: 5.0,
            },
          });
        }
      } else if (userData.role === "transport") {
        await prisma.transport.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
            schoolId: school.id,
          },
        });
      } else if (userData.role === "employee") {
        await prisma.employee.upsert({
          where: { userId: user.id },
          update: {
            employeeType: EmployeeType.BACKEND_ENGINEER,
            company: "LearnXChain",
          },
          create: {
            userId: user.id,
            employeeCode: "EMP" + user.id.slice(-4),
            employeeType: EmployeeType.BACKEND_ENGINEER,
            company: "LearnXChain",
            status: ActiveStatus.ACTIVE,
          },
        });
      } else if (userData.role === "group_admin") {
        let schoolGroup = await prisma.schoolGroup.findFirst({
          where: { ownerId: user.id },
        });
        if (!schoolGroup) {
          schoolGroup = await prisma.schoolGroup.create({
            data: {
              name: "Demo School Group",
              ownerId: user.id,
            },
          });
        }
        // Link the group-admin user to this group
        await prisma.user.update({
          where: { id: user.id },
          data: { schoolGroupId: schoolGroup.id },
        });
        // Link the school to this group
        await prisma.school.update({
          where: { id: school.id },
          data: { groupId: schoolGroup.id },
        });
      }
    } catch (error) {
      console.error(`Error creating sub-record for ${userData.role}:`, error);
    }
  }

  // 4. Link Parent and Student
  console.log("Linking parent and student...");
  const parentRec = await prisma.parent.findFirst({
    where: { user: { email: "parent@demo.com" } },
  });
  const studentRec = await prisma.student.findFirst({
    where: { user: { email: "student@demo.com" } },
  });

  if (parentRec && studentRec) {
    await prisma.parent.update({
      where: { id: parentRec.id },
      data: {
        students: {
          connect: { id: studentRec.id },
        },
      },
    });
    console.log("✅ Parent and Student linked successfully!");
  }

  // 5. Seed Demo Project Data (Leads, Demos, KPIs)
  const employeeUser = await prisma.user.findUnique({
    where: { email: "employee@demo.com" },
  });
  if (employeeUser) {
    console.log("Seeding dummy work data for demo employee...");
    const employee = await prisma.employee.findUnique({
      where: { userId: employeeUser.id },
    });

    // Create dummy leads
    const leads = await Promise.all([
      prisma.lead.upsert({
        where: { id: "demo-lead-1" },
        update: {},
        create: {
          id: "demo-lead-1",
          name: "Principal Sharma",
          schoolName: "Delhi Public School",
          phone: "9876543210",
          email: "sharma@dps.com",
          status: LeadStatus.NEW,
          assignedToId: employeeUser.id,
        },
      }),
      prisma.lead.upsert({
        where: { id: "demo-lead-2" },
        update: {},
        create: {
          id: "demo-lead-2",
          name: "Director Gupta",
          schoolName: "St. Xavier Academy",
          phone: "8765432109",
          email: "gupta@stx.com",
          status: LeadStatus.CONTACTED,
          assignedToId: employeeUser.id,
        },
      }),
    ]);

    // Create dummy demos
    await prisma.demo.upsert({
      where: { id: "demo-1" },
      update: {},
      create: {
        id: "demo-1",
        leadId: leads[0].id,
        scheduledAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 2), // 2 hours from now
        status: DemoStatus.SCHEDULED,
        conductedById: employeeUser.id,
        notes: "Initial product demo",
      },
    });

    // Create dummy KPIs
    if (employee) {
      const now = new Date();
      const currentPeriod = `${now.toLocaleString("default", { month: "short" })} ${now.getFullYear()}`;

      await prisma.employeeKPI.upsert({
        where: { id: "demo-kpi-1" },
        update: { value: 17, target: 20 },
        create: {
          id: "demo-kpi-1",
          employeeId: employee.id,
          type: KPIType.LEADS_GENERATED,
          value: 17,
          target: 20,
          period: currentPeriod,
        },
      });
    }
  }

  console.log("✅ Refined demo user seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
