import { cn } from "@/lib/utils";
import { Loader } from "./feedback/Loader";


export type ColumnDef<T> = {
  key: keyof T | string;
  header: React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: T, index: number) => React.ReactNode;
};

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  rowKey?: (row: T, index: number) => string | number;
  dense?: boolean;
  striped?: boolean;
  clickableRows?: boolean;
  onRowClick?: (row: T, index: number) => void;
  className?: string;
  emptyState?: React.ReactNode;
  loading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  dense,
  striped = true,
  clickableRows,
  onRowClick,
  className,
  emptyState,
  loading,
}: DataTableProps<T>) {
  const cellPadding = dense ? "px-3 py-2" : "px-4 py-3";

  const getAlignClass = (align?: ColumnDef<T>["align"]) => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  if (!data.length && emptyState) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-6 text-center text-sm text-gray-500 dark:border-white/10 dark:bg-gray-900/60 dark:text-gray-400",
          className
        )}
      >
        {emptyState}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-gray-200 bg-white/80 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/60",
        className
      )}
    >
      <div className="relative w-full overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-gray-50/80 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-900/80 dark:text-gray-400">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    cellPadding,
                    "font-medium",
                    getAlignClass(col.align)
                  )}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700 dark:divide-white/5 dark:text-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-20">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Loader size="md" />
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest animate-pulse">Loading Intelligence...</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-20">
                  {emptyState || (
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                      <p className="text-sm font-medium text-gray-500">No data available</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : !Array.isArray(data) ? (
              <tr>
                <td colSpan={columns.length} className="py-20">
                  <div className="flex flex-col items-center justify-center gap-3 text-center text-red-500">
                    <p className="text-sm font-medium">Invalid data format</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const key = rowKey ? rowKey(row, rowIndex) : rowIndex;
                const isStriped = striped && rowIndex % 2 === 1;

                return (
                  <tr
                    key={key}
                    className={cn(
                      isStriped && "bg-gray-50/60 dark:bg-gray-900/40",
                      clickableRows &&
                      "cursor-pointer transition-colors hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40"
                    )}
                    onClick={
                      clickableRows && onRowClick
                        ? () => onRowClick(row, rowIndex)
                        : undefined
                    }
                  >
                    {columns.map((col, colIndex) => {
                      const value =
                        typeof col.key === "string"
                          ? (row as any)[col.key]
                          : (row as any)[col.key as any];

                      return (
                        <td
                          key={colIndex}
                          className={cn(
                            cellPadding,
                            "align-middle",
                            getAlignClass(col.align)
                          )}
                        >
                          {col.render ? col.render(value, row, rowIndex) : value}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


