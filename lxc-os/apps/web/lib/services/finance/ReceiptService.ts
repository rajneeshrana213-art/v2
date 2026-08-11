/**
 * Receipt Service - Generate and Send Payment Receipts
 *
 * Features:
 * - Generate PDF receipts for payments
 * - Send receipts via WhatsApp
 * - Store receipt URLs
 */

import { prisma } from "@/lib/prisma";
import puppeteer from "puppeteer";
import { uploadFile } from "@/lib/config/upload";
import { WhatsAppNotificationService } from "./WhatsAppNotificationService";
import { getMSG91Config } from "@/lib/services/msg91-service";

export interface ReceiptData {
  receiptNumber: string;
  studentName: string;
  admissionNo: string;
  rollNo?: string;
  className: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  description?: string;
  schoolName: string;
  schoolLogo?: string;
  address?: string;
  phone?: string;
  email?: string;
  session?: string;
  fatherName?: string;
  batch?: string; // Optional, derive from Class or Session if needed
  bankAccount?: string; // Optional, placeholder or from School config
  referenceNumber?: string;
}

export class ReceiptService {
  /**
   * Generate receipt number
   */
  static async generateReceiptNumber(schoolId: string): Promise<string> {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}`;

    const lastReceipt = await prisma.payment.findFirst({
      where: {
        schoolId,
        receiptNumber: { not: null },
      },
      orderBy: { createdAt: "desc" },
    });

    let receiptNumber = 1;
    if (lastReceipt?.receiptNumber) {
      const parts = lastReceipt.receiptNumber.split("-");
      const lastNum = parseInt(parts[parts.length - 1] || "0");
      if (!isNaN(lastNum)) receiptNumber = lastNum + 1;
    }

    const schoolSegment = schoolId.replace(/-/g, "").slice(0, 6).toUpperCase();
    return `RCP-${schoolSegment}-${yearMonth}-${receiptNumber.toString().padStart(4, "0")}`;
  }

  // Helper to convert number to words (Simplified version)
  private static numberToWords(amount: number): string {
    // Basic implementation or placeholder. For production, use a library like 'number-to-words'
    // This is a quick placeholder implementation
    // Ideally user should use a library like 'number-to-words'
    return `${amount} (Only)`;
  }

  /**
   * Generate receipt HTML matching the specific design (College Copy + Student Copy)
   */
  /**
   * Generate HTML for a single copy (no side-by-side layout)
   */
  static generateStudentOnlyReceiptHTML(data: ReceiptData): string {
    const amountInWords = this.numberToWords(data.amount);
    const feeRow = `
      <tr>
        <td style="height: 40px; vertical-align: middle;">${data.description || "Academic Fees"}</td>
        <td style="text-align: right; vertical-align: middle;">${data.amount.toFixed(2)}</td>
      </tr>
      <tr>
        <td><strong>Total</strong></td>
        <td style="text-align: right;"><strong>${data.amount.toFixed(2)}</strong></td>
      </tr>
    `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          @page { size: A5; margin: 10mm; }
          body { font-family: 'Helvetica', Arial, sans-serif; margin: 0; padding: 0; font-size: 11px; }
          .receipt-box { border: 1px solid #000; padding: 15px; }
          .header { display: flex; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 5px; }
          .logo-area { width: 60px; margin-right: 10px; }
          .logo { width: 50px; height: auto; }
          .logo-placeholder { width: 50px; height: 50px; background: #ddd; display: flex; align-items: center; justify-content: center; font-size: 10px; }
          .school-details { flex: 1; text-align: center; }
          .school-name { margin: 0; font-size: 14px; font-weight: bold; color: #1a5f7a; }
          .school-address { font-size: 10px; margin: 2px 0 5px 0; }
          .receipt-title-bar { border-top: 1px solid #ccc; margin-top: 5px; padding-top: 2px; font-weight: bold; font-size: 11px; }
          .copy-label { font-size: 9px; text-decoration: underline; margin-bottom: 2px; display: inline-block; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; grid-gap: 5px 15px; margin-bottom: 15px; border: 1px solid #eee; padding: 5px; }
          .info-row { display: flex; align-items: baseline; }
          .label { font-weight: bold; width: 90px; display: inline-block; color: #333; }
          .val { flex: 1; }
          .bold { font-weight: bold; }
          .fee-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          .fee-table th, .fee-table td { border: 1px solid #ccc; padding: 6px; font-size: 10px; }
          .fee-table th { background: #f9f9f9; }
          .payment-info { font-size: 10px; }
          .pi-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
          .pi-col { flex: 1; }
          .amount-row { margin-top: 5px; font-size: 11px; }
          .amount-words { font-style: italic; margin-top: 5px; font-size: 10px; }
          .computer-gen { text-align: center; font-size: 9px; color: #666; margin-top: 10px; border-top: 1px dotted #ccc; padding-top: 2px; }
          .footer-sign { margin-top: 25px; font-weight: bold; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="header">
            <div class="logo-area">
              ${data.schoolLogo ? `<img src="${data.schoolLogo}" alt="Logo" class="logo" />` : '<div class="logo-placeholder">LOGO</div>'}
            </div>
            <div class="school-details">
              <h2 class="school-name">${data.schoolName.toUpperCase()}</h2>
              <div class="school-address">${data.address || "Address Not Available"}</div>
              <div class="receipt-title-bar">
                <span class="copy-label">Student Copy</span><br/>Fee Receipt
              </div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-row"><span class="label">Receipt No</span> : <span class="val">${data.receiptNumber}</span></div>
            <div class="info-row"><span class="label">Roll No.</span> : <span class="val">${data.rollNo || "-"}</span></div>
            <div class="info-row"><span class="label">Name</span> : <span class="val bold">${data.studentName}</span></div>
            <div class="info-row"><span class="label">Father's Name</span> : <span class="val">${data.fatherName || "-"}</span></div>
            <div class="info-row"><span class="label">Date</span> : <span class="val">${data.paymentDate}</span></div>
            <div class="info-row"><span class="label">Session</span> : <span class="val">${data.session || "-"}</span></div>
            <div class="info-row"><span class="label">Course</span> : <span class="val">${data.className}</span></div>
            <div class="info-row"><span class="label">Batch</span> : <span class="val">${data.batch || "-"}</span></div>
          </div>

          <table class="fee-table">
            <thead>
              <tr>
                <th style="text-align:left;">Descriptions</th>
                <th style="text-align:right;">Paid Amount</th>
              </tr>
            </thead>
            <tbody>${feeRow}</tbody>
          </table>

          <div class="payment-info">
            <div class="pi-row">
              <div class="pi-col"><span class="label">Payment Mode</span> : ${data.paymentMethod}</div>
              <div class="pi-col"><span class="label">Chq./Ref. Number</span> : ${data.referenceNumber || "-"}</div>
            </div>
            <div class="pi-row">
              <div class="pi-col"><span class="label">Payment Date</span> : ${data.paymentDate}</div>
              <div class="pi-col"><span class="label">Bank Account</span> : ${data.bankAccount || "-"}</div>
            </div>
            <div class="pi-row amount-row">
              <span class="label">Net Paid Amount</span> : <span class="val bold">${data.amount.toFixed(2)}</span>
            </div>
            <div class="amount-words">Received with thanks a sum of ₹ ${data.amount.toFixed(2)} (${amountInWords} ONLY).</div>
            <div class="payment-timestamp">Only as payment on ${data.paymentDate}</div>
            <div class="computer-gen">-*- This is computer generated receipt and does not require any signature -*-</div>
          </div>

          <div class="footer-sign">Collected By</div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate receipt HTML matching the specific design (College Copy + Student Copy)
   */
  static generateReceiptHTML(data: ReceiptData): string {
    const amountInWords = this.numberToWords(data.amount);

    const feeRow = `
      <tr>
        <td style="height: 40px; vertical-align: middle;">${data.description || "Academic Fees"}</td>
        <td style="text-align: right; vertical-align: middle;">${data.amount.toFixed(2)}</td>
      </tr>
      <tr>
        <td><strong>Total</strong></td>
        <td style="text-align: right;"><strong>${data.amount.toFixed(2)}</strong></td>
      </tr>
    `;

    const singleReceipt = (copyTitle: string) => `
      <div class="receipt-box">
        <div class="header">
          <div class="logo-area">
             ${data.schoolLogo ? `<img src="${data.schoolLogo}" alt="Logo" class="logo" />` : '<div class="logo-placeholder">LOGO</div>'}
          </div>
          <div class="school-details">
            <h2 class="school-name">${data.schoolName.toUpperCase()}</h2>
            <div class="school-address">${data.address || "Address Not Available"}</div>
            <div class="receipt-title-bar">
               <span class="copy-label">${copyTitle}</span><br/>
               Fee Receipt
            </div>
          </div>
        </div>

        <div class="info-grid">
           <!-- Left Column -->
           <div class="info-row"><span class="label">Receipt No</span> : <span class="val">${data.receiptNumber}</span></div>
           <div class="info-row"><span class="label">Roll No.</span> : <span class="val">${data.rollNo || "-"}</span></div>
           <div class="info-row"><span class="label">Name</span> : <span class="val bold">${data.studentName}</span></div>
           <div class="info-row"><span class="label">Father's Name</span> : <span class="val">${data.fatherName || "-"}</span></div>

           <!-- Right Column -->
           <div class="info-row"><span class="label">Date</span> : <span class="val">${data.paymentDate}</span></div>
           <div class="info-row"><span class="label">Session</span> : <span class="val">${data.session || "-"}</span></div>
           <div class="info-row"><span class="label">Course</span> : <span class="val">${data.className}</span></div>
           <div class="info-row"><span class="label">Batch</span> : <span class="val">${data.batch || "-"}</span></div>
        </div>

        <table class="fee-table">
          <thead>
            <tr>
              <th style="text-align:left;">Descriptions</th>
              <th style="text-align:right;">Paid Amount</th>
            </tr>
          </thead>
          <tbody>
            ${feeRow}
          </tbody>
        </table>

        <div class="payment-info">
          <div class="pi-row">
            <div class="pi-col"><span class="label">Payment Mode</span> : ${data.paymentMethod}</div>
            <div class="pi-col"><span class="label">Chq./Ref. Number</span> : ${data.referenceNumber || "-"}</div>
          </div>
          <div class="pi-row">
             <div class="pi-col"><span class="label">Payment Date</span> : ${data.paymentDate}</div>
             <div class="pi-col"><span class="label">Bank Account</span> : ${data.bankAccount || "-"}</div>
          </div>
          <div class="pi-row amount-row">
             <span class="label">Net Paid Amount</span> : <span class="val bold">${data.amount.toFixed(2)}</span>
          </div>
           <div class="amount-words">
             Received with thanks a sum of ₹ ${data.amount.toFixed(2)} (${amountInWords} ONLY).
           </div>
           <div class="payment-timestamp">
             Only as payment on ${data.paymentDate}
           </div>
           <div class="computer-gen">
             -*- This is computer generated receipt and does not require any signature -*-
           </div>
        </div>

        <div class="footer-sign">
           Collected By
        </div>
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: 'Helvetica', Arial, sans-serif; margin: 0; padding: 0; font-size: 11px; }
          .container { display: flex; gap: 20px; width: 100%; justify-content: center; }
          .receipt-box {
            flex: 1;
            border: 1px solid #000;
            padding: 15px;
            max-width: 48%;
            box-sizing: border-box;
          }
          .header { display: flex; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 5px; }
          .logo-area { width: 60px; margin-right: 10px; }
          .logo { width: 50px; height: auto; }
          .logo-placeholder { width: 50px; height: 50px; background: #ddd; display: flex; align-items: center; justify-content: center; font-size: 10px; }
          .school-details { flex: 1; text-align: center; }
          .school-name { margin: 0; font-size: 14px; font-weight: bold; color: #1a5f7a; }
          .school-address { font-size: 10px; margin: 2px 0 5px 0; }
          .receipt-title-bar { border-top: 1px solid #ccc; margin-top: 5px; padding-top: 2px; font-weight: bold; font-size: 11px; }
          .copy-label { font-size: 9px; text-decoration: underline; margin-bottom: 2px; display: inline-block; }

          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-gap: 5px 15px;
            margin-bottom: 15px;
            border: 1px solid #eee;
            padding: 5px;
          }
          .info-row { display: flex; align-items: baseline; }
          .label { font-weight: bold; width: 90px; display: inline-block; color: #333; }
          .val { flex: 1; }
          .bold { font-weight: bold; }

          .fee-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          .fee-table th, .fee-table td { border: 1px solid #ccc; padding: 6px; font-size: 10px; }
          .fee-table th { background: #f9f9f9; }

          .payment-info { font-size: 10px; }
          .pi-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
          .pi-col { flex: 1; }
          .amount-row { margin-top: 5px; font-size: 11px; }
          .amount-words { font-style: italic; margin-top: 5px; font-size: 10px; }
          .computer-gen { text-align: center; font-size: 9px; color: #666; margin-top: 10px; border-top: 1px dotted #ccc; padding-top: 2px; }
          
          .footer-sign { margin-top: 25px; font-weight: bold; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          ${singleReceipt("College Copy")}
          ${singleReceipt("Student Copy")}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate PDF receipt
   */
  static async generatePDFReceipt(
    data: ReceiptData,
  ): Promise<{ url: string; buffer: Buffer }> {
    try {
      const html = this.generateReceiptHTML(data);

      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfBuffer = (await page.pdf({
        format: "A4",
        landscape: true,
        printBackground: true,
      })) as Buffer;

      await browser.close();

      const fileName = `receipt_${data.receiptNumber.replace(/\//g, "_")}_${Date.now()}.pdf`;
      const upload = await uploadFile(pdfBuffer, "receipts", "raw", fileName);

      return { url: upload.url, buffer: pdfBuffer };
    } catch (error) {
      console.error("Error generating PDF receipt:", error);
      throw error;
    }
  }

  /**
   * Generate and store receipt for payment, then notify.
   */
  static async generateReceiptForPayment(
    paymentId: string,
    sendWhatsApp: boolean = false,
  ): Promise<{ receiptNumber: string; receiptUrl: string }> {
    console.log(`[Receipt] Starting receipt generation for payment: ${paymentId}`);
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          student: {
            include: {
              user: true,
              class: true,
              academicRecords: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: { rollNumber: true, academicYear: true },
              },
              school: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      if (!payment) {
        console.warn(`[Receipt] Payment not found: ${paymentId}`);
        throw new Error("Payment record not found");
      }
      if (!payment.student) {
        console.warn(`[Receipt] Student not found for payment: ${paymentId}`);
        throw new Error("Student data not found");
      }
      if (!payment.schoolId) {
        console.warn(`[Receipt] School ID not found for payment: ${paymentId}`);
        throw new Error("School ID missing in payment");
      }

      const student = payment.student;
      console.log(`[Receipt] Generating receipt number for school: ${payment.schoolId}`);
      const receiptNumber = await this.generateReceiptNumber(payment.schoolId);
      console.log(`[Receipt] Generated receipt number: ${receiptNumber}`);

      // Determine Session from academicYear or current date logic
      const session =
        student.academicRecords?.[0]?.academicYear ||
        `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`;

      const receiptData: ReceiptData = {
        receiptNumber,
        studentName: student.user?.name || "N/A",
        admissionNo: student.admissionNo || "N/A",
        rollNo: student.academicRecords?.[0]?.rollNumber || "",
        className: student.class?.name || "N/A",
        session: session,
        fatherName: student.fatherName,
        batch: session,
        paymentDate: payment.paymentDate
          ? payment.paymentDate.toLocaleDateString("en-IN")
          : new Date().toLocaleDateString("en-IN"),
        amount: payment.amount,
        paymentMethod: payment.paymentMethod || "CASH",
        description: payment.description || "School Fee Payment",
        referenceNumber:
          payment.razorpayPaymentId || payment.invoiceNumber || undefined,
        schoolName: student.school?.schoolName || "School Name",
        schoolLogo: student.school?.schoolLogo || undefined,
        address: student.school?.user?.address || undefined,
        phone: student.school?.user?.phone || undefined,
        email: student.school?.user?.email || undefined,
      };

      // Generate full receipt PDF (both copies — for office)
      console.log(`[Receipt] Generating full PDF receipt...`);
      const { url: receiptUrl, buffer: pdfBuffer } =
        await this.generatePDFReceipt(receiptData);
      console.log(`[Receipt] Full PDF uploaded to: ${receiptUrl}`);

      // Generate student-only receipt PDF (single Student Copy)
      let studentReceiptUrl: string | undefined;
      try {
        console.log(`[Receipt] Generating student-only receipt copy...`);
        const studentHtml = this.generateStudentOnlyReceiptHTML(receiptData);
        const browser2 = await (
          await import("puppeteer")
        ).default.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page2 = await browser2.newPage();
        await page2.setContent(studentHtml, { waitUntil: "networkidle0" });
        const studentPdfBuffer = (await page2.pdf({
          format: "A5",
          printBackground: true,
        })) as Buffer;
        await browser2.close();
        const studentFileName = `receipt_student_${receiptData.receiptNumber.replace(/\//g, "_")}_${Date.now()}.pdf`;
        const studentUpload = await uploadFile(
          studentPdfBuffer,
          "receipts",
          "raw",
          studentFileName,
        );
        studentReceiptUrl = studentUpload.url;
        console.log(`[Receipt] Student PDF uploaded to: ${studentReceiptUrl}`);
      } catch (e) {
        console.error("Failed to generate student receipt copy:", e);
      }

      // Update payment record — store student copy in officeInvoiceUrl
      console.log(`[Receipt] Updating payment record ${paymentId} with receipt details...`);
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          receiptNumber,
          receiptUrl,
          ...(studentReceiptUrl ? { officeInvoiceUrl: studentReceiptUrl } : {}),
        },
      });
      console.log(`[Receipt] Payment record updated successfully.`);

      // Embed the receipt URL into the FinanceLedger descriptions
      const ledgers = await prisma.financeLedger.findMany({
        where: {
          referenceTable: "Payment",
          referenceId: paymentId,
        },
      });

      if (ledgers.length > 0) {
        // Append |||url:receiptUrl to the description of each ledger entry
        for (const ledger of ledgers) {
          const cleanDesc = ledger.description
            ? ledger.description.replace(/\|\|\|url:.+/, "").trim()
            : "";
          await prisma.financeLedger.update({
            where: { id: ledger.id },
            data: {
              description: `${cleanDesc}|||url:${receiptUrl}`,
            },
          });
        }
      }

      // Send WhatsApp notification if requested
      if (sendWhatsApp && student.guardianPhone) {
        try {
          const config = getMSG91Config();

          if (config.authKey && config.senderId) {
            await WhatsAppNotificationService.sendReceiptNotification(
              student.id,
              receiptNumber,
              receiptUrl,
              payment.amount,
              config,
            );
          }
        } catch (whatsappError) {
          // Don't fail receipt generation if WhatsApp notification fails
        }
      }

      return { receiptNumber, receiptUrl };
    } catch (error) {
      console.error("Error generating receipt:", error);
      throw error;
    }
  }
}
