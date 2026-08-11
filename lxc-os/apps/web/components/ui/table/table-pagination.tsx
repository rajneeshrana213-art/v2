import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
}

export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  pageSizeOptions = [10, 25, 50],
  onPageSizeChange,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(total, safePage * pageSize);

  const canPrev = safePage > 1;
  const canNext = safePage < totalPages;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-300 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
      <div className="flex items-center gap-1 text-[11px] text-slate-400">
        <span>
          Showing{" "}
          <span className="font-semibold text-slate-100">
            {start.toLocaleString()}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-slate-100">
            {end.toLocaleString()}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-100">
            {total.toLocaleString()}
          </span>{" "}
          records
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange && (
          <div className="flex items-center gap-1 rounded-full bg-slate-900/60 px-2 py-1 text-[11px] text-slate-400 ring-1 ring-white/5">
            <span>Rows per page</span>
            <select
              className={cn(
                "cursor-pointer rounded-full border-0 bg-transparent px-1 py-0.5 text-[11px] font-medium text-slate-100 focus:outline-none focus:ring-0"
              )}
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((size) => (
                <option
                  key={size}
                  value={size}
                  className="bg-slate-900 text-slate-100"
                >
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            disabled={!canPrev}
            onClick={() => canPrev && onPageChange(safePage - 1)}
            className="h-7 rounded-full px-2 text-[11px]"
          >
            Prev
          </Button>
          <span className="px-2 text-[11px] text-slate-400">
            Page{" "}
            <span className="font-semibold text-slate-100">
              {safePage.toLocaleString()}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-100">
              {totalPages.toLocaleString()}
            </span>
          </span>
          <Button
            variant="ghost"
            disabled={!canNext}
            onClick={() => canNext && onPageChange(safePage + 1)}
            className="h-7 rounded-full px-2 text-[11px]"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}


