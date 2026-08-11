/**
 * Promotion Decision Matrix
 * 
 * Determines what actions are allowed based on:
 * - Promotion type (same school vs transfer)
 * - Clearance status
 * - Eligibility status
 * - Role permissions
 */

import { StudentClearanceResult } from './studentClearanceEngine';
import { StudentEligibilityResult } from './promotionRulesEngine';

export type PromotionType = 'SAME_SCHOOL' | 'TRANSFER' | 'EXIT';
export type ActionType = 'PROMOTE' | 'TRANSFER' | 'VIEW_RESULTS' | 'DOWNLOAD_CERTIFICATE' | 'EXIT';

export interface DecisionResult {
  allowed: boolean;
  reason?: string;
  requiresOverride: boolean;
  overrideReason?: string;
}

export interface PromotionDecisionContext {
  promotionType: PromotionType;
  action: ActionType;
  clearance: StudentClearanceResult;
  eligibility?: StudentEligibilityResult;
  userRole?: string;
  isPrincipalOverride?: boolean;
  overrideReason?: string;
}

/**
 * Decision Matrix
 * 
 * Rules:
 * 1. Promotion (same school): Allowed even with dues (dues carry forward)
 * 2. Transfer / School Change: Blocked if ANY clearance pending
 * 3. Result Viewing: Always allowed
 * 4. Certificate Download: Blocked if finance/library/discipline pending
 * 5. Principal Override: Allowed with mandatory reason (logged)
 */
export function evaluatePromotionDecision(
  context: PromotionDecisionContext
): DecisionResult {
  const { action, clearance, promotionType, isPrincipalOverride, overrideReason } = context;

  // Principal override (with reason) can bypass most restrictions
  if (isPrincipalOverride && overrideReason) {
    if (action === 'TRANSFER' && clearance.blockedCount > 0) {
      return {
        allowed: true,
        reason: 'Principal override with reason',
        requiresOverride: true,
        overrideReason,
      };
    }
    if (action === 'DOWNLOAD_CERTIFICATE' && !clearance.canDownloadCertificate) {
      return {
        allowed: true,
        reason: 'Principal override with reason',
        requiresOverride: true,
        overrideReason,
      };
    }
  }

  // Action-specific rules
  switch (action) {
    case 'PROMOTE':
      // Promotion (same school) is always allowed
      // Dues will carry forward to next academic year
      if (promotionType === 'SAME_SCHOOL') {
        return {
          allowed: true,
          reason: 'Promotion allowed (dues will carry forward)',
          requiresOverride: false,
        };
      }
      // Transfer promotion requires full clearance
      if (promotionType === 'TRANSFER') {
        if (!clearance.canTransfer) {
          return {
            allowed: false,
            reason: `Transfer blocked: ${clearance.clearances.filter(c => !c.cleared).map(c => c.type).join(', ')} clearance pending`,
            requiresOverride: true,
          };
        }
        return {
          allowed: true,
          reason: 'Transfer allowed (all clearances passed)',
          requiresOverride: false,
        };
      }
      // Exit requires full clearance
      if (promotionType === 'EXIT') {
        if (clearance.blockedCount > 0) {
          return {
            allowed: false,
            reason: `Exit blocked: ${clearance.clearances.filter(c => !c.cleared).map(c => c.type).join(', ')} clearance pending`,
            requiresOverride: true,
          };
        }
        return {
          allowed: true,
          reason: 'Exit allowed (all clearances passed)',
          requiresOverride: false,
        };
      }
      return {
        allowed: false,
        reason: 'Unknown promotion type',
        requiresOverride: false,
      };

    case 'TRANSFER':
      // Transfer requires full clearance
      if (!clearance.canTransfer) {
        return {
          allowed: false,
          reason: `Transfer blocked: ${clearance.clearances.filter(c => !c.cleared).map(c => c.type).join(', ')} clearance pending`,
          requiresOverride: true,
        };
      }
      return {
        allowed: true,
        reason: 'Transfer allowed',
        requiresOverride: false,
      };

    case 'VIEW_RESULTS':
      // Always allowed
      return {
        allowed: true,
        reason: 'Result viewing always allowed',
        requiresOverride: false,
      };

    case 'DOWNLOAD_CERTIFICATE':
      // Blocked if finance/library/discipline pending
      if (!clearance.canDownloadCertificate) {
        const blockedTypes = clearance.clearances
          .filter((c) => !c.cleared && ['FINANCE', 'LIBRARY', 'DISCIPLINE'].includes(c.type))
          .map((c) => c.type);
        return {
          allowed: false,
          reason: `Certificate download blocked: ${blockedTypes.join(', ')} clearance pending`,
          requiresOverride: true,
        };
      }
      return {
        allowed: true,
        reason: 'Certificate download allowed',
        requiresOverride: false,
      };

    case 'EXIT':
      // Exit requires full clearance
      if (clearance.blockedCount > 0) {
        return {
          allowed: false,
          reason: `Exit blocked: ${clearance.clearances.filter(c => !c.cleared).map(c => c.type).join(', ')} clearance pending`,
          requiresOverride: true,
        };
      }
      return {
        allowed: true,
        reason: 'Exit allowed',
        requiresOverride: false,
      };

    default:
      return {
        allowed: false,
        reason: 'Unknown action type',
        requiresOverride: false,
      };
  }
}

/**
 * Check if user role has permission for action
 */
export function checkRolePermission(
  action: ActionType,
  userRole?: string
): boolean {
  // Only admin, principal, dean can perform promotion actions
  const allowedRoles = ['admin', 'superadmin', 'principal', 'dean'];
  
  if (!userRole) {
    return false;
  }

  const normalizedRole = userRole.toLowerCase();
  
  switch (action) {
    case 'PROMOTE':
    case 'TRANSFER':
    case 'EXIT':
      return allowedRoles.includes(normalizedRole);
    
    case 'VIEW_RESULTS':
      // Everyone can view results
      return true;
    
    case 'DOWNLOAD_CERTIFICATE':
      // Admin, principal, dean, and students/parents can download
      return allowedRoles.includes(normalizedRole) || 
             ['student', 'parent'].includes(normalizedRole);
    
    default:
      return false;
  }
}

