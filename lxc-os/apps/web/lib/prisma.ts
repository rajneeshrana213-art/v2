import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as {
  prisma: any;
  rawPrisma: any;
  pool: Pool;
  adapter: PrismaPg;
};

if (!globalForPrisma.pool) {
  globalForPrisma.pool = new Pool({
    connectionString: 
      process.env.NEON_DATABASE_URL || 
      process.env.DATABASE_URL || 
      process.env.POSTGRES_PRISMA_URL || 
      process.env.POSTGRES_URL,
    max: 20, // Increased pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}

if (!globalForPrisma.adapter) {
  globalForPrisma.adapter = new PrismaPg(globalForPrisma.pool);
}

const isDev = process.env.NODE_ENV === "development";

type PrismaClientWithEvents = PrismaClient<
  Prisma.PrismaClientOptions,
  "error" | "warn" | "info" | "query"
>;

const getExtendedClient = () => {
  const baseClient = new PrismaClient({
    adapter: globalForPrisma.adapter,
    log: [
      { emit: "event", level: "query" },
      { emit: "stdout", level: "error" },
      { emit: "stdout", level: "warn" },
    ],
  });

  if (isDev) {
    (baseClient as unknown as PrismaClientWithEvents).$on(
      "query",
      (e: Prisma.QueryEvent) => {
        if (e.duration >= 1000) {
          console.warn(
            `[PERF][DB] Slow query - ${e.duration}ms | ${e.query.slice(0, 500)}`,
          );
        }
      },
    );
  }

  // Pre-calculate soft deletable models ONCE per process/module load
  const softDeletableMap = new Map<string, string[]>();

  try {
      Prisma.dmmf.datamodel.models
        .filter((model) => model.fields.some((f) => f.name === "isDeleted"))
        .forEach((model) => {
          softDeletableMap.set(
              model.name,
              model.fields
                .filter((f) => f.isUnique && f.type === "String")
                .map((f) => f.name)
          );
        });
  } catch (err) {
      console.error("[PERF][DB] Error initializing soft-delete map:", err);
  }

  return baseClient.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const uniqueFields = softDeletableMap.get(model as string);

          if (uniqueFields !== undefined) {
            if (operation === "delete") {
              const where = (args as any).where || {};
              if (where.hardDelete) {
                const { hardDelete, ...realWhere } = where;
                (args as any).where = realWhere;
                return query(args);
              }

              const existing = await (baseClient as any)[
                model as string
              ].findUnique({
                where: (args as any).where,
              });

              const updateData: any = {
                isDeleted: true,
                deletedAt: new Date(),
              };

              if (existing) {
                const suffix = `_deleted_${Date.now()}`;
                for (const field of uniqueFields) {
                  if (
                    existing[field] &&
                    typeof existing[field] === "string" &&
                    !existing[field].includes("_deleted_")
                  ) {
                    updateData[field] = existing[field] + suffix;
                  }
                }
              }

              return (baseClient as any)[model as string].update({
                where: (args as any).where,
                data: updateData,
              });
            }
            if (operation === "deleteMany") {
              const matching = await (baseClient as any)[
                model as string
              ].findMany({
                where: (args as any).where,
                select: {
                  id: true,
                  ...Object.fromEntries(uniqueFields.map((f) => [f, true])),
                },
              });

              const suffix = `_deleted_${Date.now()}`;

              if (
                uniqueFields.length > 0 &&
                matching.length > 0 &&
                matching[0].id
              ) {
                const updates = matching.map((record: any) => {
                  const updateData: any = {
                    isDeleted: true,
                    deletedAt: new Date(),
                  };
                  for (const field of uniqueFields) {
                    if (
                      record[field] &&
                      typeof record[field] === "string" &&
                      !record[field].includes("_deleted_")
                    ) {
                      updateData[field] = record[field] + suffix;
                    }
                  }
                  return (baseClient as any)[model as string].update({
                    where: { id: record.id },
                    data: updateData,
                  });
                });

                await baseClient.$transaction(updates);
                return { count: matching.length };
              } else {
                return (baseClient as any)[model as string].updateMany({
                  ...args,
                  data: { isDeleted: true, deletedAt: new Date() },
                });
              }
            }

            if (
              operation === "findUnique" ||
              operation === "findUniqueOrThrow"
            ) {
              const targetOp =
                operation === "findUnique" ? "findFirst" : "findFirstOrThrow";
              if (!args) args = {} as any;
              if ((args as any).where?.isDeleted === undefined) {
                (args as any).where = {
                  ...(args as any).where,
                  isDeleted: false,
                };
              }
              return (baseClient as any)[model as string][targetOp](args);
            }

            const readOperations = [
              "findFirst",
              "findMany",
              "count",
              "aggregate",
              "groupBy",
              "findFirstOrThrow",
            ];

            if (readOperations.includes(operation)) {
              if (!args) args = {} as any;
              if ((args as any).where?.isDeleted === undefined) {
                (args as any).where = {
                  ...(args as any).where,
                  isDeleted: false,
                };
              }
            }
          }
          return query(args);
        },
      },
    },
  });
};

const prismaClient = globalForPrisma.prisma || getExtendedClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaClient;
}

export const prisma = prismaClient as unknown as PrismaClientWithEvents;

// Raw client without soft-delete middleware — for internal lookups that must
// read across both deleted and non-deleted records (e.g. name resolution).
const getRawClient = () =>
  new PrismaClient({ adapter: globalForPrisma.adapter });

const rawClient = globalForPrisma.rawPrisma || getRawClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.rawPrisma = rawClient;
}

export const rawPrisma = rawClient;
