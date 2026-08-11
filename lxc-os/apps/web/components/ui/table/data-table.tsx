import * as React from "react";
import {
  DataTable as BaseDataTable,
  type DataTableProps as BaseDataTableProps,
  type ColumnDef,
} from "@/components/ui/data-table";
import { cn } from "@/lib/utils";

export type { ColumnDef };

export interface EnhancedDataTableProps<T> extends BaseDataTableProps<T> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  toolbar?: React.ReactNode;
  pagination?: React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  title,
  description,
  toolbar,
  pagination,
  className,
  ...props
}: EnhancedDataTableProps<T>) {
  return (
    <div className={cn("space-y-3", className)}>
      {(title || description || toolbar) && (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            {title && (
              <h3 className="text-sm font-semibold tracking-tight text-slate-50">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-slate-400">{description}</p>
            )}
          </div>
          {toolbar && (
            <div className="flex flex-wrap items-center gap-2">{toolbar}</div>
          )}
        </div>
      )}

      <BaseDataTable {...props} />

      {pagination && <div className="pt-1">{pagination}</div>}
    </div>
  );
}


