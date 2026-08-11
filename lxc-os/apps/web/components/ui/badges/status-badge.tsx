import * as React from "react";
import { Badge } from "@/components/ui/badge";

export type StatusVariant =
  | "active"
  | "pending"
  | "blocked"
  | "draft"
  | "error"
  | "success";

export interface StatusBadgeProps {
  status: StatusVariant | string;
  className?: string;
}

function getStatusTone(status: string) {
  const normalized = status.toLowerCase();

  if (["active", "live", "enabled"].includes(normalized)) {
    return { label: "Active", tone: "success" as const };
  }
  if (["pending", "awaiting", "in_review", "review"].includes(normalized)) {
    return { label: "Pending", tone: "warning" as const };
  }
  if (["blocked", "suspended", "disabled"].includes(normalized)) {
    return { label: "Blocked", tone: "danger" as const };
  }
  if (["draft"].includes(normalized)) {
    return { label: "Draft", tone: "neutral" as const };
  }
  if (["error", "failed"].includes(normalized)) {
    return { label: "Error", tone: "danger" as const };
  }
  if (["success", "completed"].includes(normalized)) {
    return { label: "Success", tone: "success" as const };
  }

  return { label: status, tone: "accent" as const };
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = getStatusTone(status);

  return (
    <Badge
      variant="soft"
      tone={config.tone}
      className={className}
    >
      {config.label}
    </Badge>
  );
}


