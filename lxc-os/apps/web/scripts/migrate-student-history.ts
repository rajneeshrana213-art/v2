import {
  PrismaClient,
  ActiveStatus,
  StudentLifecycleStatus,
  PromotionStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Starting student data migration to StudentAcademicRecord...");

  const students = await prisma.student.findMany();
  console.log(`Found ${students.length} students to migrate.`);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const student of students) {
    if (!student.classId) {
      skippedCount++;
      continue;
    }

    try {
      // Create StudentAcademicRecord if it doesn't exist
      const existingRecord = await prisma.studentAcademicRecord.findUnique({
        where: {
          studentId_academicYear: {
            studentId: student.id,
            academicYear: "2024-25",
          },
        },
      });

      if (!existingRecord) {
        await prisma.studentAcademicRecord.create({
          data: {
            studentId: student.id,
            academicYear: "2024-25", // Hardcoding default since it's removed from Student
            rollNumber: "N/A", // Hardcoding default since it's removed from Student
            classId: student.classId,
            sectionId: null, // Hardcoding default since it's removed from Student
            promotionStatus: PromotionStatus.PROMOTED,
          },
        });
        migratedCount++;
      } else {
        skippedCount++;
      }

      // Explicitly set the new status based on current ActiveStatus definition
      await prisma.student.update({
        where: { id: student.id },
        data: {
          status:
            student.status === ActiveStatus.ACTIVE
              ? StudentLifecycleStatus.ACTIVE
              : StudentLifecycleStatus.DROPPED_OUT,
        },
      });
    } catch (e) {
      console.error(`Error migrating student ${student.id}:`, e);
    }
  }

  console.log(
    `✅ Migration complete. Migrated: ${migratedCount}, Skipped: ${skippedCount}`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
