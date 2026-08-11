import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is missing.");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const plansToSeed = [
  // 🏫 SCHOOL CATEGORY PLANS
  { name: "RIT_AI_SCHOOL_IGNITE", price: 49, durationDays: 30 },
  { name: "RIT_AI_SCHOOL_ZENITH_PRO", price: 99, durationDays: 30 },
  { name: "RIT_AI_SCHOOL_ZENITH_ELITE", price: 199, durationDays: 30 },
  { name: "RIT_AI_SCHOOL_LIFETIME", price: 999, durationDays: 99999 },

  // 🎓 COLLEGE CATEGORY PLANS
  { name: "RIT_AI_COLLEGE_IGNITE", price: 199, durationDays: 30 },
  { name: "RIT_AI_COLLEGE_ZENITH_PRO", price: 299, durationDays: 30 },
  { name: "RIT_AI_COLLEGE_ZENITH_ELITE", price: 499, durationDays: 30 },
  { name: "RIT_AI_COLLEGE_LIFETIME", price: 2499, durationDays: 99999 },

  // 🎯 COMPETITIVE CATEGORY PLANS
  { name: "RIT_AI_COMPETITIVE_IGNITE", price: 199, durationDays: 30 },
  { name: "RIT_AI_COMPETITIVE_ZENITH_PRO", price: 299, durationDays: 30 },
  { name: "RIT_AI_COMPETITIVE_ZENITH_ELITE", price: 499, durationDays: 30 },
  { name: "RIT_AI_COMPETITIVE_LIFETIME", price: 3999, durationDays: 99999 },
];

async function main() {
  console.log("🌱 Starting RIT AI pricing plans seeding...");

  // Clean up any other existing RIT plans that are not in our seed list
  const seedPlanNames = plansToSeed.map((p) => p.name);
  const deleteResult = await prisma.plan.deleteMany({
    where: {
      planType: "RIT",
      name: {
        notIn: seedPlanNames,
      },
    },
  });
  console.log(`🧹 Cleaned up ${deleteResult.count} obsolete RIT plans.`);

  for (const planData of plansToSeed) {
    console.log(`Upserting plan: ${planData.name}...`);

    // Look for a plan with same name and planType: "RIT"
    const existingPlan = await prisma.plan.findFirst({
      where: {
        name: planData.name,
        planType: "RIT",
      },
    });

    if (existingPlan) {
      await prisma.plan.update({
        where: { id: existingPlan.id },
        data: {
          price: planData.price,
          durationDays: planData.durationDays,
          userLimit: 0,
          branchLimit: 1,
        },
      });
      console.log(`✅ Updated existing plan: ${planData.name}`);
    } else {
      await prisma.plan.create({
        data: {
          name: planData.name,
          price: planData.price,
          durationDays: planData.durationDays,
          userLimit: 0,
          branchLimit: 1,
          planType: "RIT",
        },
      });
      console.log(`✨ Created new plan: ${planData.name}`);
    }
  }

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
