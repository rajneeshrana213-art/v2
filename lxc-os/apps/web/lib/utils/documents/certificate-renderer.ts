import PDFDocument from 'pdfkit';
import { placeImage, generateQRCode } from './common';

export interface CertificateData {
  schoolName: string;
  schoolLogo?: string;
  studentName: string;
  studentPhoto?: string;
  admissionNo?: string;
  className?: string;
  date: string;
  certificateType: string;
  content: string;
  principalSignature?: string;
  documentNo: string;
  verificationUrl: string;
}

export async function renderProfessionalCertificate(doc: PDFKit.PDFDocument, data: CertificateData): Promise<void> {
  const primaryColor = '#1a237e'; // Deep blue
  const secondaryColor = '#b71c1c'; // Deep red for emphasis
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // 1. Border
  doc.rect(20, 20, pageWidth - 40, pageHeight - 40).lineWidth(2).stroke(primaryColor);
  doc.rect(25, 25, pageWidth - 50, pageHeight - 50).lineWidth(1).stroke(primaryColor);

  // 2. Corner Ornaments (Simple geometric shapes)
  const size = 30;
  doc.fillColor(primaryColor);
  doc.rect(20, 20, size, size).fill();
  doc.rect(pageWidth - 20 - size, 20, size, size).fill();
  doc.rect(20, pageHeight - 20 - size, size, size).fill();
  doc.rect(pageWidth - 20 - size, pageHeight - 20 - size, size, size).fill();

  // 3. School Header
  if (data.schoolLogo) {
    await placeImage(doc, data.schoolLogo, pageWidth / 2 - 40, 50, 80, 80, 'LOGO');
  }
  
  doc.fillColor(primaryColor)
    .font('Helvetica-Bold')
    .fontSize(24)
    .text(data.schoolName.toUpperCase(), 0, 140, { width: pageWidth, align: 'center' });

  doc.fillColor('#666')
    .font('Helvetica')
    .fontSize(10)
    .text('Official Academic Document', 0, 170, { width: pageWidth, align: 'center' });

  // 4. Certificate Title
  doc.fillColor(secondaryColor)
    .font('Helvetica-Bold')
    .fontSize(32)
    .text(data.certificateType.toUpperCase(), 0, 220, { width: pageWidth, align: 'center' });

  // 5. Main Content
  doc.fillColor('#000')
    .font('Helvetica')
    .fontSize(14)
    .text('This is to certify that', 0, 280, { width: pageWidth, align: 'center' });

  doc.fillColor(primaryColor)
    .font('Helvetica-Bold')
    .fontSize(20)
    .text(data.studentName, 0, 310, { width: pageWidth, align: 'center' });

  if (data.studentPhoto) {
    await placeImage(doc, data.studentPhoto, pageWidth - 140, 280, 80, 100, 'Student Photo');
  }

  doc.fillColor('#000')
    .font('Helvetica')
    .fontSize(14)
    .text(data.content, 60, 360, { width: pageWidth - 120, align: 'center', lineGap: 10 });

  // 6. Footer - QR and Seal
  const qrBuffer = await generateQRCode(data.verificationUrl);
  if (qrBuffer) {
    doc.image(qrBuffer, 60, pageHeight - 160, { width: 80, height: 80 });
    doc.fontSize(8).fillColor('#666').text('Scan to Verify', 60, pageHeight - 75, { width: 80, align: 'center' });
  }

  doc.fontSize(10).fillColor('#000')
    .font('Helvetica-Bold')
    .text('Principal Signature', pageWidth - 200, pageHeight - 100, { width: 150, align: 'center' });
  
  doc.moveTo(pageWidth - 200, pageHeight - 105).lineTo(pageWidth - 50, pageHeight - 105).stroke();

  doc.fontSize(8).fillColor('#999')
    .text(`Document No: ${data.documentNo}`, 0, pageHeight - 40, { width: pageWidth, align: 'center' })
    .text(`Issued on: ${data.date}`, 0, pageHeight - 30, { width: pageWidth, align: 'center' });
}
