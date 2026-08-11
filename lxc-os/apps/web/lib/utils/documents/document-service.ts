import PDFDocument from 'pdfkit';
import { prisma } from '@/lib/prisma';
import { uploadFile } from '@/lib/config/upload';
import { renderProfessionalCertificate, CertificateData } from './certificate-renderer';
import { generateStudentIdCard, StudentIdCardData } from '../id-card-generator';

export class DocumentService {
  static async generateAndIssue(params: {
    templateId: string;
    targetUserId: string;
    schoolId: string;
    issuedById: string;
    customData?: any;
  }) {
    const { templateId, targetUserId, schoolId, issuedById, customData } = params;

    const template = await prisma.documentTemplate.findFirst({
      where: {
        id: templateId,
        OR: [
          { schoolId },
          { schoolId: null }
        ]
      },
    });

    if (!template) throw new Error("Template not found");

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { 
        student: { 
          include: { 
            class: true,
            school: { include: { user: true } },
            user: true
          } 
        },
        teacher: true,
        school: { include: { user: true } }
      }
    });

    if (!targetUser) throw new Error("Target user not found");

    const documentNo = `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${documentNo}`;

    let buffer: Buffer;

    if (template.type === 'ID_CARD') {
      // Use existing ID card logic if applicable, or adapt
      if (targetUser.student) {
        buffer = await generateStudentIdCard(targetUser.student as any, template.category as any);
      } else {
        throw new Error("ID Card generation for non-students not yet implemented");
      }
    } else if (template.type === 'CERTIFICATE') {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
      const buffers: Buffer[] = [];
      doc.on('data', b => buffers.push(b));
      
      const certData: CertificateData = {
        schoolName: targetUser.school?.schoolName || "LearnXChain School",
        schoolLogo: targetUser.school?.schoolLogo || undefined,
        studentName: targetUser.name || "N/A",
        studentPhoto: targetUser.profilePic || undefined,
        admissionNo: targetUser.student?.admissionNo || "N/A",
        className: targetUser.student?.class?.name || "N/A",
        date: new Date().toLocaleDateString(),
        certificateType: template.name,
        content: this.interpolateContent(template.content as string, targetUser, customData),
        documentNo,
        verificationUrl
      };

      await renderProfessionalCertificate(doc, certData);
      doc.end();
      
      buffer = await new Promise(resolve => {
        doc.on('end', () => resolve(Buffer.concat(buffers)));
      });
    } else {
      throw new Error(`Document type ${template.type} not supported yet`);
    }

    // Upload to Cloudinary
    const uploadResult = await uploadFile(buffer, `documents/${schoolId}`, 'raw', `${documentNo}.pdf`);

    // Save to IssuedDocument
    const issuedDoc = await prisma.issuedDocument.create({
      data: {
        documentNo,
        templateId,
        schoolId,
        targetUserId,
        issuedById,
        data: customData || {},
        pdfUrl: uploadResult.url,
      }
    });

    return issuedDoc;
  }

  private static interpolateContent(content: string, user: any, customData: any): string {
    let result = typeof content === 'string' ? content : JSON.stringify(content);
    const placeholders = {
      '{{name}}': user.name,
      '{{admissionNo}}': user.student?.admissionNo || '',
      '{{class}}': user.student?.class?.name || '',
      ...customData
    };

    Object.entries(placeholders).forEach(([key, value]) => {
      result = result.replace(new RegExp(key, 'g'), value as string);
    });

    return result;
  }
}
