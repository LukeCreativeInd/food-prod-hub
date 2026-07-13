import Link from "next/link";

import { StatusBadge } from "@/components/ui";

export type DataTableCell =
  | string
  | {
      label: string;
      href: string;
    };

type SampleDataTableProps = {
  columns: string[];
  rows: Record<string, DataTableCell>[];
  badgeColumns?: string[];
  emptyMessage?: string;
};

function getCellLabel(value: DataTableCell | undefined) {
  if (!value) {
    return "";
  }

  return typeof value === "string" ? value : value.label;
}

function badgeTone(value: DataTableCell | undefined) {
  const label = getCellLabel(value);
  const normalisedValue = label.toLowerCase();

  if (
    normalisedValue.includes("missing") ||
    normalisedValue.includes("review") ||
    normalisedValue.includes("flagged")
  ) {
    return "warning" as const;
  }

  if (
    normalisedValue.includes("active") ||
    normalisedValue.includes("linked") ||
    normalisedValue.includes("ready")
  ) {
    return "success" as const;
  }

  if (normalisedValue.includes("placeholder")) {
    return "info" as const;
  }

  return "neutral" as const;
}

export function SampleDataTable({
  columns,
  rows,
  badgeColumns = [],
  emptyMessage = "No rows to display yet.",
}: SampleDataTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-slate-500" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={`${row[columns[0] ?? "row"]}-${index}`}>
                {columns.map((column, columnIndex) => (
                  <td
                    key={column}
                    className={
                      columnIndex === 0
                        ? "px-4 py-3 font-semibold text-slate-900"
                        : "px-4 py-3 text-slate-600"
                    }
                  >
                    {badgeColumns.includes(column) ? (
                      <StatusBadge tone={badgeTone(row[column])}>
                        {getCellLabel(row[column])}
                      </StatusBadge>
                    ) : typeof row[column] === "object" ? (
                      <Link
                        className="font-semibold text-clean-green-700 hover:text-clean-green-900"
                        href={row[column].href}
                      >
                        {row[column].label}
                      </Link>
                    ) : (
                      row[column]
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
