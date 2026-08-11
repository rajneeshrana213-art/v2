/**
 * Promotion Export Service
 * 
 * Generates CSV/Excel reports for bulk promotion operations
 */

import { StudentEligibilityResult } from './promotionRulesEngine';
import { StudentClearanceResult } from './studentClearanceEngine';

export interface PromotionExportRow {
  admissionNo: string;
  rollNo: string;
  name: string;
  fromClass: string;
  toClass: string;
  academicYear: string;
  toSession: string;
  status: string;
  outcome: string;
  eligibilityStatus?: string;
  clearanceStatus?: string;
  reasons?: string;
  promotedBy?: string;
  promotedAt?: string;
}

/**
 * Convert promotion data to CSV format
 */
export function generatePromotionCSV(
  rows: PromotionExportRow[]
): string {
  if (rows.length === 0) {
    return '';
  }

  // CSV Headers
  const headers = [
    'Admission No',
    'Roll No',
    'Name',
    'From Class',
    'To Class',
    'Academic Year',
    'To Session',
    'Status',
    'Outcome',
    'Eligibility Status',
    'Clearance Status',
    'Reasons',
    'Promoted By',
    'Promoted At',
  ];

  // CSV Rows
  const csvRows = rows.map((row) => {
    return [
      row.admissionNo || '',
      row.rollNo || '',
      row.name || '',
      row.fromClass || '',
      row.toClass || '',
      row.academicYear || '',
      row.toSession || '',
      row.status || '',
      row.outcome || '',
      row.eligibilityStatus || '',
      row.clearanceStatus || '',
      row.reasons || '',
      row.promotedBy || '',
      row.promotedAt || '',
    ].map((field) => {
      // Escape commas and quotes in CSV
      const stringField = String(field || '');
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    });
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...csvRows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Generate promotion summary report
 */
export function generatePromotionSummary(
  total: number,
  promoted: number,
  detained: number,
  backlog: number,
  blocked: number,
  failed: number
): string {
  return `
PROMOTION SUMMARY REPORT
========================

Total Students: ${total}
Promoted: ${promoted}
Detained: ${detained}
Backlog: ${backlog}
Blocked (Clearance): ${blocked}
Failed: ${failed}

Success Rate: ${total > 0 ? ((promoted / total) * 100).toFixed(2) : 0}%
Generated At: ${new Date().toISOString()}
`;
}

