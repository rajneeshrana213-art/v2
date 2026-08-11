
export interface PlanInvoiceData {
  schoolName: string;
  invoiceNumber: string;
  planName: string;
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  date: string;
  logoUrl?: string;
  address?: string;
  qrImage?: string;
  lang?: "EN" | "HI";
}

export interface FeeInvoiceData {
  schoolName: string;
  studentName: string;
  className: string;
  invoiceNumber: string;
  paymentDate: string;
  paymentMethod: string;
  totalFee: number;
  amountPaid: number;
  pendingAmount: number;
  feeStatus: string;
  logoUrl?: string;
  address?: string;
  qrImage?: string;
  lang?: "EN" | "HI";
}

// ----------------------------
// GST Tax Invoice (SaaS B2B)
// ----------------------------

export type GstType = "CGST_SGST" | "IGST";

export interface GstInvoiceSeller {
  name: string;
  addressLines: string[];
  city: string;
  state: string;
  pinCode: string;
  email: string;
  website?: string;
  gstin?: string;
  pan?: string;
  llpin?: string;
  logoUrl?: string;
}

/**
 * Default seller profile for LearnXChain LLP (can be overridden per-invoice if needed).
 * GSTIN / PAN / LLPIN stay optional so they can be populated from configuration.
 */
export const LEARNXCHAIN_SELLER: GstInvoiceSeller = {
  name: "LearnXChain LLP",
  addressLines: ["48 and 49 Common Light", "East Guru Angad Nagar, Laxmi Nagar"],
  city: "New Delhi",
  state: "Delhi",
  pinCode: "110092",
  email: "billing@learnxchain.com",
  website: "https://learnxchain.com",
};

export interface GstInvoiceBuyer {
  schoolName: string;
  addressLines: string[];
  city: string;
  state: string;
  pinCode: string;
  gstin?: string;
  placeOfSupplyState: string;
  contactPersonName: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl?: string;
}

export interface GstInvoiceLineItem {
  description: string;
  sacCode: string;
  billingPeriodFrom: string; // e.g. "01 Jan 2025"
  billingPeriodTo: string; // e.g. "30 Jun 2025"
  quantity: number;
  unitPrice: number;
  taxableAmount: number;
  gstRate: number; // e.g. 18
  gstAmount: number;
  lineTotal: number;
}

export interface GstInvoiceMeta {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  paymentStatus: "PAID" | "UNPAID" | "DUE" | "FAILED";
  paymentMethod: string; // Razorpay / UPI / Bank Transfer
  paymentReference: string; // transaction id / payment reference
}

export interface GstInvoiceTaxSummary {
  gstType: GstType;
  taxableValue: number;
  cgstRate: number; // 0 or 9
  sgstRate: number; // 0 or 9
  igstRate: number; // 0 or 18
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  grandTotal: number;
}

export interface GstInvoiceData {
  seller: GstInvoiceSeller;
  buyer: GstInvoiceBuyer;
  meta: GstInvoiceMeta;
  lineItems: GstInvoiceLineItem[];
  taxSummary: GstInvoiceTaxSummary;
  amountInWords: string; // "Rupees One Thousand Only"
  qrImage?: string; // invoice verification / payment QR
  notes?: string;
}

const STRINGS = {
  EN: {
    invoice: "Invoice Number",
    date: "Date",
    plan: "Plan",
    base: "Base Amount",
    gst: "GST (18%)",
    total: "Total",
    paymentDate: "Payment Date",
    student: "Student",
    class: "Class",
    method: "Payment Method",
    totalFee: "Total Fee",
    amountPaid: "Amount Paid",
    pending: "Pending Amount",
    status: "Status",
    thanks: "Thank you for your payment!",
  },
  HI: {
    invoice: "चालान संख्या",
    date: "तारीख",
    plan: "प्लान",
    base: "मूल राशि",
    gst: "जीएसटी (18%)",
    total: "कुल",
    paymentDate: "भुगतान तिथि",
    student: "विद्यार्थी",
    class: "कक्षा",
    method: "भुगतान माध्यम",
    totalFee: "कुल शुल्क",
    amountPaid: "भुगतान राशि",
    pending: "बकाया राशि",
    status: "स्थिति",
    thanks: "आपके भुगतान के लिए धन्यवाद!",
  },
};

/**
 * Production-grade GST TAX INVOICE template for B2B SaaS (A4, PDF-friendly).
 * Designed for multi-tenant SaaS with full GST breakdown and corporate styling.
 */
export const generatePlanInvoiceHtml = (data: GstInvoiceData): string => {
  const { seller, buyer, meta, lineItems, taxSummary, amountInWords, qrImage, notes } = data;

  const gstLabel = taxSummary.gstType === "IGST" ? "IGST @ 18%" : "CGST @ 9% + SGST @ 9%";

  const paymentStatusColor = meta.paymentStatus === "PAID" ? "#16a34a" : "#b91c1c";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>TAX INVOICE - ${meta.invoiceNumber}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap" rel="stylesheet" />
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #111827;
      background-color: #ffffff;
    }
    .invoice-wrapper {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #e5e7eb;
      padding: 24px 28px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #111827;
      padding-bottom: 16px;
      margin-bottom: 16px;
      gap: 16px;
    }
    .logo-block {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex: 1 1 auto;
      min-width: 0;
    }
    .logo {
      height: 50px;
      object-fit: contain;
    }
    .company-title {
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .invoice-title {
      text-align: right;
      flex: 0 0 auto;
      min-width: 200px;
    }
    .invoice-title-main {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.10em;
      text-transform: uppercase;
    }
    .invoice-status {
      margin-top: 4px;
      display: inline-block;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 600;
      color: #ffffff;
    }
    .section {
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .grid-2 {
      display: flex;
      gap: 24px;
    }
    .grid-col {
      flex: 1;
    }
    .label {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 1px;
    }
    .value {
      font-size: 12px;
      color: #111827;
    }
    .muted {
      color: #6b7280;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
    }
    .meta-table td {
      padding: 4px 8px;
      font-size: 11px;
    }
    .meta-table td.label-cell {
      width: 32%;
      color: #6b7280;
      white-space: nowrap;
    }
    .meta-table td.value-cell {
      color: #111827;
    }
    table.line-items {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
      font-size: 10px;
      table-layout: fixed;
    }
    table.line-items th,
    table.line-items td {
      border: 1px solid #e5e7eb;
      padding: 4px 5px;
      vertical-align: top;
      word-break: break-word;
      overflow-wrap: break-word;
    }
    table.line-items th {
      background-color: #f9fafb;
      text-align: left;
      font-weight: 600;
      color: #374151;
      white-space: normal;
    }
    table.line-items td.numeric {
      text-align: right;
    }
    .totals-row {
      background-color: #f9fafb;
      font-weight: 600;
    }
    .tax-summary {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      margin-top: 8px;
    }
    .tax-summary-left {
      flex: 1;
      font-size: 11px;
    }
    .tax-summary-right {
      width: 280px;
    }
    table.tax-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    table.tax-table th,
    table.tax-table td {
      border: 1px solid #e5e7eb;
      padding: 6px 6px;
    }
    table.tax-table th {
      background-color: #f9fafb;
      text-align: left;
      font-weight: 600;
      color: #374151;
    }
    table.tax-table td.numeric {
      text-align: right;
      white-space: nowrap;
    }
    .footer {
      border-top: 1px solid #e5e7eb;
      margin-top: 18px;
      padding-top: 10px;
      font-size: 10px;
      color: #6b7280;
      display: flex;
      justify-content: space-between;
      gap: 24px;
    }
    .signature-block {
      text-align: right;
      font-size: 11px;
    }
    .signature-line {
      margin-top: 8px;
      border-top: 1px solid #d1d5db;
      padding-top: 4px;
    }
    .signature-name {
      font-family: 'Pinyon Script', cursive;
      font-size: 22px;
      font-weight: 400;
      color: #1e3a8a;
      line-height: 1.2;
      letter-spacing: 1px;
      display: block;
      margin: 8px 0 4px;
    }
    .qr-block {
      margin-top: 4px;
      font-size: 10px;
      color: #6b7280;
    }
    .qr-image {
      margin-top: 4px;
      height: 72px;
    }
    @page {
      size: A4;
      margin: 16mm 12mm;
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <div class="header">
      <div class="logo-block">
        ${data.seller.logoUrl ? `<img src="${data.seller.logoUrl}" alt="LearnXChain LLP" class="logo" />` : ""}
        <div>
          <div class="company-title">${seller.name}</div>
          <div class="muted" style="margin-top:2px;">
            ${seller.addressLines.join(", ")}<br />
            ${seller.city}, ${seller.state} - ${seller.pinCode}
          </div>
          <div class="muted" style="margin-top:2px;">
            Email: ${seller.email}${seller.website ? ` &nbsp; | &nbsp; Website: ${seller.website}` : ""}
          </div>
          <div class="muted" style="margin-top:2px;">
            ${seller.gstin ? `GSTIN: ${seller.gstin}` : ""}${
              seller.gstin && (seller.pan || seller.llpin) ? " &nbsp; | &nbsp; " : ""
            }${seller.pan ? `PAN: ${seller.pan}` : ""}${seller.llpin ? ` &nbsp; | &nbsp; LLPIN: ${seller.llpin}` : ""}
          </div>
        </div>
      </div>
      <div class="invoice-title">
        <div class="invoice-title-main">TAX INVOICE</div>
        <div
          class="invoice-status"
          style="background-color:${paymentStatusColor}; color:#ffffff; display:inline-block; margin-top:6px; padding:3px 14px; border-radius:999px; font-size:11px; font-weight:700; letter-spacing:0.08em;"
        >
          ✓ ${meta.paymentStatus}
        </div>
        <div style="margin-top:8px; font-size:11px; color:#6b7280;">
          Invoice No: <strong style="color:#111827;">${meta.invoiceNumber}</strong><br />
          Invoice Date: ${meta.invoiceDate}<br />
          Due Date: ${meta.dueDate}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="grid-2">
        <div class="grid-col">
          <div class="section-title">Billed To</div>
          <div class="value" style="font-weight:600;">${buyer.schoolName}</div>
          <div class="muted" style="margin-top:2px;">
            ${buyer.addressLines.join(", ")}<br />
            ${buyer.city}, ${buyer.state} - ${buyer.pinCode}
          </div>
          <div class="muted" style="margin-top:2px;">
            ${buyer.gstin ? `GSTIN: ${buyer.gstin}` : "GSTIN: Not Provided"}
          </div>
          <div class="muted" style="margin-top:2px;">
            Place of Supply: ${buyer.placeOfSupplyState}
          </div>
          <div class="muted" style="margin-top:6px;">
            Contact: ${buyer.contactPersonName}<br />
            Email: ${buyer.contactEmail}${buyer.contactPhone ? ` &nbsp; | &nbsp; Phone: ${buyer.contactPhone}` : ""}
          </div>
        </div>
        <div class="grid-col">
          <div class="section-title">Payment Details</div>
          <table class="meta-table">
            <tr>
              <td class="label-cell">Payment Method</td>
              <td class="value-cell">${meta.paymentMethod}</td>
            </tr>
            <tr>
              <td class="label-cell">Payment Reference</td>
              <td class="value-cell">${meta.paymentReference}</td>
            </tr>
            <tr>
              <td class="label-cell">GST Summary</td>
              <td class="value-cell">${gstLabel}</td>
            </tr>
          </table>
          ${
            qrImage
              ? `<div class="qr-block">
            <div>Invoice Verification / Payment QR</div>
            <img src="${qrImage}" alt="Invoice QR" class="qr-image" />
          </div>`
              : ""
          }
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Invoice Line Items</div>
      <table class="line-items">
        <thead>
          <tr>
            <th style="width:22%;">Description</th>
            <th style="width:10%;">SAC Code</th>
            <th style="width:16%;">Billing Period</th>
            <th style="width:6%;">Quantity</th>
            <th style="width:10%;">Unit Price (₹)</th>
            <th style="width:10%;">Taxable Amount (₹)</th>
            <th style="width:6%;">GST %</th>
            <th style="width:10%;">GST Amount (₹)</th>
            <th style="width:10%;">Line Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${
            lineItems.length === 0
              ? `<tr><td colspan="9" style="text-align:center; padding:12px;">No line items</td></tr>`
              : lineItems
                  .map(
                    (item) => `
          <tr>
            <td>
              <div>${item.description}</div>
              <div class="muted">SaaS Subscription – LearnXChain</div>
            </td>
            <td>${item.sacCode}</td>
            <td>
              <div>${item.billingPeriodFrom}</div>
              <div class="muted">to ${item.billingPeriodTo}</div>
            </td>
            <td class="numeric">${item.quantity}</td>
            <td class="numeric">${item.unitPrice.toFixed(2)}</td>
            <td class="numeric">${item.taxableAmount.toFixed(2)}</td>
            <td class="numeric">${item.gstRate.toFixed(2)}</td>
            <td class="numeric">${item.gstAmount.toFixed(2)}</td>
            <td class="numeric">${item.lineTotal.toFixed(2)}</td>
          </tr>`
                  )
                  .join("")
          }
          <tr class="totals-row">
            <td colspan="5" style="text-align:right;">Total</td>
            <td class="numeric">${taxSummary.taxableValue.toFixed(2)}</td>
            <td></td>
            <td class="numeric">${taxSummary.totalTax.toFixed(2)}</td>
            <td class="numeric">${taxSummary.grandTotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section tax-summary">
      <div class="tax-summary-left">
        <div class="label">Amount in words</div>
        <div class="value" style="margin-top:2px;">${amountInWords}</div>
        ${
          notes
            ? `<div style="margin-top:10px;">
          <div class="label">Notes</div>
          <div class="value" style="margin-top:2px;">${notes}</div>
        </div>`
            : ""
        }
      </div>
      <div class="tax-summary-right">
        <table class="tax-table">
          <tr>
            <th>Description</th>
            <th class="numeric">Amount (₹)</th>
          </tr>
          <tr>
            <td>Taxable Value</td>
            <td class="numeric">${taxSummary.taxableValue.toFixed(2)}</td>
          </tr>
          ${
            taxSummary.gstType === "IGST"
              ? `
          <tr>
            <td>IGST @ ${taxSummary.igstRate.toFixed(2)}%</td>
            <td class="numeric">${taxSummary.igstAmount.toFixed(2)}</td>
          </tr>`
              : `
          <tr>
            <td>CGST @ ${taxSummary.cgstRate.toFixed(2)}%</td>
            <td class="numeric">${taxSummary.cgstAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td>SGST @ ${taxSummary.sgstRate.toFixed(2)}%</td>
            <td class="numeric">${taxSummary.sgstAmount.toFixed(2)}</td>
          </tr>`
          }
          <tr>
            <td><strong>Total Tax</strong></td>
            <td class="numeric"><strong>${taxSummary.totalTax.toFixed(2)}</strong></td>
          </tr>
          <tr>
            <td><strong>Grand Total (₹)</strong></td>
            <td class="numeric"><strong>${taxSummary.grandTotal.toFixed(2)}</strong></td>
          </tr>
        </table>
      </div>
    </div>

    <div class="footer">
      <div>
        <div>
          This is a digitally signed, computer-generated invoice and does not require a physical signature.
        </div>
        <div style="margin-top:4px;">
          For billing queries, contact <strong>billing@learnxchain.io</strong>.
        </div>
      </div>
      <div class="signature-block">
        <div>For <strong>LearnXChain LLP</strong></div>
        <span class="signature-name">Rajneesh Rana</span>
        <div class="signature-line">
          Authorized Signatory &ndash; LearnXChain LLP
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
};

export const generateFeeInvoiceHtml = (data: FeeInvoiceData) => {
  const lang = data.lang || "EN";
  const t = (k: keyof (typeof STRINGS)["EN"]) => STRINGS[lang][k];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Fee Receipt</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; position: relative; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px; border: 1px solid #ddd; }
    .header { text-align: center; margin-bottom: 20px; }
    .watermark { position:absolute; top:40%; left:25%; font-size:50px; color:rgba(0,0,0,0.05); transform:rotate(-30deg); }
  </style>
</head>
<body>
  <div class="watermark">PAID</div>
  <div class="header">
    ${data.logoUrl ? `<img src="${data.logoUrl}" style="height:60px" />` : ""}
    <h2>${data.schoolName}</h2>
    ${data.address ? `<div>${data.address}</div>` : ""}
    <h3>Fee Receipt</h3>
  </div>
  <table>
    <tr><td>${t("invoice")}</td><td>${data.invoiceNumber}</td></tr>
    <tr><td>${t("paymentDate")}</td><td>${data.paymentDate}</td></tr>
    <tr><td>${t("student")}</td><td>${data.studentName}</td></tr>
    <tr><td>${t("class")}</td><td>${data.className}</td></tr>
    <tr><td>${t("method")}</td><td>${data.paymentMethod}</td></tr>
    <tr><td>${t("totalFee")}</td><td>₹${data.totalFee}</td></tr>
    <tr><td>${t("amountPaid")}</td><td>₹${data.amountPaid}</td></tr>
    <tr><td>${t("pending")}</td><td>₹${data.pendingAmount}</td></tr>
    <tr><td>${t("status")}</td><td>${data.feeStatus}</td></tr>
  </table>
  ${data.qrImage ? `<img src="${data.qrImage}" style="height:80px;margin-top:20px" />` : ""}
  <p style="text-align:center;margin-top:20px;">${t("thanks")}</p>
</body>
</html>`;
};
