import { NextApiRequest, NextApiResponse } from "next";
import { prisma, rawPrisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { verifyAuth } from "@/lib/auth";

// Map of foreign key field → which model to look up and which fields to use as display name
const FIELD_RESOLVER: Record<string, { model: string; nameFields: string[] }> = {
  schoolId:      { model: "School",                nameFields: ["schoolName", "name"] },
  userId:        { model: "User",                  nameFields: ["name"] },
  parentId:      { model: "User",                  nameFields: ["name"] },
  teacherId:     { model: "User",                  nameFields: ["name"] },
  studentId:     { model: "User",                  nameFields: ["name"] },
  libraryId:     { model: "User",                  nameFields: ["name"] },
  transportId:   { model: "User",                  nameFields: ["name"] },
  accountId:     { model: "User",                  nameFields: ["name"] },
  deletedBy:     { model: "User",                  nameFields: ["name"] },
  departmentId:  { model: "Department",            nameFields: ["name"] },
  designationId: { model: "Designation",           nameFields: ["name"] },
  schoolGroupId: { model: "SchoolGroup",           nameFields: ["name"] },
  academicYearId:{ model: "AcademicYear",          nameFields: ["name", "year", "title"] },
  classId:       { model: "Class",                 nameFields: ["name"] },
  subjectId:     { model: "Subject",               nameFields: ["name"] },
  busId:         { model: "Bus",                   nameFields: ["busNumber", "name"] },
  routeId:       { model: "Route",                 nameFields: ["name", "routeName"] },
  conductorId:   { model: "Conductor",             nameFields: ["name"] },
  categoryId:    { model: "SchoolExpenseCategory", nameFields: ["name"] },
  feeGroupId:    { model: "FeeGroup",              nameFields: ["name"] },
  feeHeadId:     { model: "FeeHead",               nameFields: ["name"] },
  groupId:       { model: "SchoolGroup",           nameFields: ["name"] },
  ownerId:       { model: "User",                  nameFields: ["name"] },
};

// Per-model: which fields to select and use as display name (in priority order)
const MODEL_SELECT: Record<string, { select: Record<string, boolean>; nameFields: string[] }> = {
  User:                  { select: { id: true, name: true, email: true },        nameFields: ["name", "email"] },
  School:                { select: { id: true, schoolName: true },                nameFields: ["schoolName"] },
  Department:            { select: { id: true, name: true },                      nameFields: ["name"] },
  Designation:           { select: { id: true, name: true },                      nameFields: ["name"] },
  SchoolGroup:           { select: { id: true, name: true },                      nameFields: ["name"] },
  AcademicYear:          { select: { id: true, name: true },                      nameFields: ["name"] },
  Class:                 { select: { id: true, name: true },                      nameFields: ["name"] },
  Subject:               { select: { id: true, name: true },                      nameFields: ["name"] },
  Bus:                   { select: { id: true, busNumber: true },                 nameFields: ["busNumber"] },
  Route:                 { select: { id: true, name: true },                      nameFields: ["name"] },
  Conductor:             { select: { id: true, name: true },                      nameFields: ["name"] },
  SchoolExpenseCategory: { select: { id: true, name: true },                      nameFields: ["name"] },
  FeeGroup:              { select: { id: true, name: true },                      nameFields: ["name"] },
  FeeHead:               { select: { id: true, name: true },                      nameFields: ["name"] },
};

async function resolveNames(
  records: any[]
): Promise<Record<string, Record<string, string>>> {
  // Collect IDs per model
  const toResolve: Record<string, Set<string>> = {};

  for (const rec of records) {
    for (const [field, config] of Object.entries(FIELD_RESOLVER)) {
      const val = rec.data[field];
      if (val && typeof val === "string" && val.length > 5) {
        if (!toResolve[config.model]) toResolve[config.model] = new Set();
        toResolve[config.model].add(val);
      }
    }
  }

  // Batch fetch names per model using per-model select config
  const resolved: Record<string, Record<string, string>> = {};
  await Promise.all(
    Object.entries(toResolve).map(async ([model, ids]) => {
      const modelConfig = MODEL_SELECT[model];
      if (!modelConfig) return;
      try {
        const modelNameLower = model.charAt(0).toLowerCase() + model.slice(1);
        // Use rawPrisma (no soft-delete middleware) so we can resolve names
        // for records regardless of whether the related record is deleted or not
        const rows = await (rawPrisma as any)[modelNameLower].findMany({
          where: { id: { in: Array.from(ids) } },
          select: modelConfig.select,
        });
        resolved[model] = {};
        for (const row of rows) {
          // Only use the resolved name if it's a real name — never fall back to the raw ID
          const name = modelConfig.nameFields.map((f) => row[f]).find(Boolean);
          if (name) resolved[model][row.id] = name;
        }
      } catch {
        // Silently skip models that fail
      }
    })
  );

  return resolved;
}

function buildResolvedNames(
  recordData: any,
  nameMap: Record<string, Record<string, string>>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [field, config] of Object.entries(FIELD_RESOLVER)) {
    const val = recordData[field];
    if (val && typeof val === "string" && nameMap[config.model]?.[val]) {
      result[field] = nameMap[config.model][val];
    }
  }
  return result;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const user = await verifyAuth(req, res);
    if (!user || user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { page = "1", limit = "20", model: filterModel = "" } = req.query;
    const pageInt = parseInt(page as string);
    const limitInt = parseInt(limit as string);
    const skip = (pageInt - 1) * limitInt;

    const softDeletableModels = Prisma.dmmf.datamodel.models
      .filter((m) => m.fields.some((f) => f.name === "isDeleted"))
      .map((m) => m.name);

    const modelsToQuery = filterModel
      ? softDeletableModels.filter((m) => m === filterModel)
      : softDeletableModels;

    let allDeletedRecords: any[] = [];

    await Promise.all(
      modelsToQuery.map(async (modelName) => {
        try {
          const records = await (prisma as any)[modelName].findMany({
            where: { isDeleted: true },
            take: 500,
            orderBy: { deletedAt: "desc" },
          });
          records.forEach((record: any) => {
            allDeletedRecords.push({
              id: record.id,
              model: modelName,
              isDeleted: record.isDeleted,
              deletedAt: record.deletedAt,
              deletedBy: record.deletedBy,
              data: record,
            });
          });
        } catch {
          console.warn(`Failed to fetch deleted records for ${modelName}`);
        }
      })
    );

    allDeletedRecords.sort(
      (a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()
    );

    const total = allDeletedRecords.length;
    const paginatedRecords = allDeletedRecords.slice(skip, skip + limitInt);

    // Resolve foreign key names only for the current page
    const nameMap = await resolveNames(paginatedRecords);

    const recordsWithNames = paginatedRecords.map((rec) => ({
      ...rec,
      resolvedNames: buildResolvedNames(rec.data, nameMap),
    }));

    return res.status(200).json({
      success: true,
      records: recordsWithNames,
      availableModels: softDeletableModels,
      pagination: {
        total,
        page: pageInt,
        limit: limitInt,
        totalPages: Math.ceil(total / limitInt),
      },
    });
  } catch (error: any) {
    console.error("Deleted Records Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
