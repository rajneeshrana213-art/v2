import { NextApiRequest, NextApiResponse } from "next";
import { getTemplates, getSchoolBranding, generateStudentIdCardService, generateBulkIdCardsService } from "@/lib/services/student-id-card-service";
import { TemplateId } from "@/lib/utils/id-card-templates";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    try {
        if (req.method === 'GET') {
            const { action, studentId, schoolId, template } = req.query;

            if (action === 'templates') {
                return res.status(200).json({ templates: getTemplates() });
            }

            if (action === 'branding' && schoolId && typeof schoolId === 'string') {
                const branding = await getSchoolBranding(schoolId);
                return res.status(200).json(branding);
            }


            // Generate ID Card
            if (studentId && typeof studentId === 'string') {
                const pdfBuffer = await generateStudentIdCardService(
                    studentId, 
                    (template as TemplateId) || 'classic_horizontal'
                );
                
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=id_card_${studentId}.pdf`);
                return res.send(pdfBuffer);
            }
        }

        if (req.method === 'POST') {
            const { action } = req.query;
            
            if (action === 'bulk-generate') {
                const { studentIds, templateId, classId } = req.body;
                
                if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
                     return res.status(400).json({ error: "studentIds array is required" });
                }

                const pdfBuffer = await generateBulkIdCardsService(
                    studentIds,
                    (templateId as TemplateId) || 'classic_horizontal',
                    classId
                );
                
                const filename = classId 
                    ? `class_id_cards_${classId}.pdf`
                    : `bulk_id_cards_${Date.now()}.pdf`;

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
                return res.send(pdfBuffer);
            }
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (error: any) {
        console.error("ID Card API Error:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
