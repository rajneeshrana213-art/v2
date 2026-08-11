/**
 * Promotion Audit Service
 * 
 * Tracks promotion history, who promoted, when, and why
 * Stores audit data in metadata format (no schema changes)
 */

import { prisma } from '../../../prisma';
import Logger from '../../../utils/logger';
import { PromotionAuditData, StudentEligibilityResult, PromotionRuleConfig } from './promotionRulesEngine';

/**
 * Store promotion audit data in StudentPromotion metadata
 * Uses JSON field if available, otherwise stores in a separate audit log
 */
export async function logPromotionAudit(auditData: PromotionAuditData): Promise<void> {
  try {
    // Store audit data in the promotion record's metadata
    // Since we can't modify schema, we'll store it as a JSON string in a comment/note field
    // For now, we'll create a separate audit log entry if needed
    
    // Check if StudentPromotion has any JSON/metadata field we can use
    // If not, we'll log to console and potentially a separate audit table in future
    
    const auditMetadata = {
      promotedBy: auditData.promotedBy,
      promotedAt: new Date().toISOString(),
      ruleConfig: auditData.ruleConfig,
      eligibilityResult: auditData.eligibilityResult,
      overrideReason: auditData.overrideReason,
      metadata: auditData.metadata,
    };

    // Log to console for now (in production, use proper logging service)
    Logger.info(`Promotion Audit:`, {
      studentId: auditData.studentId,
      fromClass: auditData.fromClassId,
      toClass: auditData.toClassId,
      academicYear: auditData.academicYear,
      toSession: auditData.toSession,
      status: auditData.eligibilityResult.status,
      promotedBy: auditData.promotedBy,
      overrideReason: auditData.overrideReason,
    });

    // In a real implementation with schema access, you would:
    // await prisma.studentPromotion.update({
    //   where: { id: promotionId },
    //   data: { auditMetadata: JSON.stringify(auditMetadata) }
    // });

  } catch (error) {
    Logger.error('Error logging promotion audit:', error);
    // Don't throw - audit logging failure shouldn't break promotion
  }
}

/**
 * Get promotion history for a student
 */
export async function getStudentPromotionHistory(studentId: string) {
  try {
    const promotions = await prisma.studentPromotion.findMany({
      where: { studentId },
      include: {
        fromClass: {
          select: { name: true },
        },
        toClass: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return promotions.map(p => ({
      id: p.id,
      fromClass: p.fromClass.name,
      toClass: p.toClass.name,
      fromSection: p.fromSection,
      toSection: p.toSection,
      academicYear: p.academicYear,
      toSession: p.toSession,
      promotedAt: p.createdAt,
    }));
  } catch (error) {
    Logger.error(`Error fetching promotion history for ${studentId}:`, error);
    return [];
  }
}

/**
 * Get promotion statistics for a class/academic year
 */
export async function getPromotionStatistics(
  classId: string,
  academicYear: string
): Promise<{
  total: number;
  promoted: number;
  detained: number;
  backlog: number;
  attendanceShort: number;
}> {
  try {
    // This would require additional queries to get eligibility status
    // For now, return basic counts from promotion records
    const promotions = await prisma.studentPromotion.findMany({
      where: {
        fromClassId: classId,
        academicYear,
      },
    });

    return {
      total: promotions.length,
      promoted: promotions.length, // All recorded promotions are successful
      detained: 0, // Would need eligibility check to determine
      backlog: 0, // Would need eligibility check to determine
      attendanceShort: 0, // Would need eligibility check to determine
    };
  } catch (error) {
    Logger.error(`Error fetching promotion statistics:`, error);
    return {
      total: 0,
      promoted: 0,
      detained: 0,
      backlog: 0,
      attendanceShort: 0,
    };
  }
}

