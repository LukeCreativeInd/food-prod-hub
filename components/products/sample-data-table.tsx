import { StatusBadge } from "@/components/ui";

type SampleDataTableProps = {
  columns: string[];
  rows: Record<string, string>[];
  badgeColumns?: string[];
};

function badgeTone(value: string) {
  const normalisedValue = value.toLowerCase();

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
          {rows.map((row, index) => (
            <tr key={`${row[columns[0]]}-${index}`}>
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
                      {row[column]}
                    </StatusBadge>
                  ) : (
                    row[column]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
