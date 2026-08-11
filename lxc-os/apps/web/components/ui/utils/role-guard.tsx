import * as React from "react";

export interface RoleGuardProps {
  userRole?: string | null;
  allowedRoles: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Simple client-side role guard. Pass the current userRole and the
 * roles that are allowed to view the content.
 *
 * Example:
 *  <RoleGuard userRole={session.role} allowedRoles={['ADMIN']}>
 *    <AdminDashboard />
 *  </RoleGuard>
 */
export function RoleGuard({
  userRole,
  allowedRoles,
  fallback = null,
  children,
}: RoleGuardProps) {
  if (!userRole) return <>{fallback}</>;

  const normalized = userRole.toLowerCase();
  const isAllowed = allowedRoles.some(
    (role) => role.toLowerCase() === normalized
  );

  if (!isAllowed) return <>{fallback}</>;

  return <>{children}</>;
}


