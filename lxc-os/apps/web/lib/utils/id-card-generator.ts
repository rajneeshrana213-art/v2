import PDFDocument from "pdfkit";
import {
  Student,
  User,
  Class,
  School,
  StudentAcademicRecord,
} from "@prisma/client";
import {
  renderTemplate,
  TemplateId,
  TEMPLATE_CONFIGS,
  StudentData,
} from "./id-card-templates";

export type StudentIdCardData = Student & {
  user: User;
  class: Class | null;
  school: School & { user: User };
  academicRecords?: StudentAcademicRecord[];
};

export const generateStudentIdCard = async (
  student: StudentIdCardData,
  templateId: TemplateId = "classic_horizontal",
): Promise<Buffer> => {
  const config =
    TEMPLATE_CONFIGS[templateId] || TEMPLATE_CONFIGS.classic_horizontal;
  const doc = new PDFDocument({
    size: [config.dimensions.width, config.dimensions.height],
    margin: 0,
  });
  const buffers: Buffer[] = [];

  doc.on("data", (d) => buffers.push(d));
  await renderTemplate(templateId, doc, student as StudentData);
  doc.end();

  return new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
  });
};

export const generateBulkIdCards = async (
  students: StudentIdCardData[],
  templateId: TemplateId = "classic_horizontal",
): Promise<Buffer> => {
  if (students.length === 0) {
    throw new Error("No students provided for bulk generation");
  }

  const config =
    TEMPLATE_CONFIGS[templateId] || TEMPLATE_CONFIGS.classic_horizontal;
  const cardWidth = config.dimensions.width;
  const cardHeight = config.dimensions.height;

  const doc = new PDFDocument({
    size: [cardWidth, cardHeight],
    margin: 0,
  });
  const buffers: Buffer[] = [];

  doc.on("data", (d) => buffers.push(d));

  await renderTemplate(templateId, doc, students[0] as StudentData);

  for (let i = 1; i < students.length; i++) {
    doc.addPage({ size: [cardWidth, cardHeight], margin: 0 });
    await renderTemplate(templateId, doc, students[i] as StudentData);
  }

  doc.end();

  return new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
  });
};
