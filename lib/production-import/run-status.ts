export type ProductionImportRunStatus =
  | "draft"
  | "source_ready"
  | "parsing"
  | "parsed"
  | "needs_attention"
  | "ready_for_mapping"
  | "parser_failed"
  | "superseded"
  | "cancelled";

export type ProductionImportSourceStatus =
  | "pending_upload"
  | "uploaded_unverified"
  | "upload_failed"
  | "verified"
  | "superseded"
  | "archived";

export type ProductionImportParserStatus =
  | "running"
  | "completed"
  | "failed"
  | "superseded"
  | "cancelled";

export type ProductionImportRunStatusSource = {
  status: ProductionImportSourceStatus;
  parsers: Array<{
    status: ProductionImportParserStatus;
    isSelected: boolean;
    blockerCount: number;
    completedAt: number | null;
  }>;
};

export function deriveProductionImportRunStatus(
  currentStatus: ProductionImportRunStatus,
  sources: ProductionImportRunStatusSource[],
): ProductionImportRunStatus {
  if (currentStatus === "cancelled" || currentStatus === "superseded") {
    return currentStatus;
  }

  const activeSources = sources.filter(
    (source) => source.status !== "superseded" && source.status !== "archived",
  );
  if (activeSources.length === 0) return "draft";

  if (activeSources.some((source) => source.parsers.some((parser) => parser.status === "running"))) {
    return "parsing";
  }
  if (activeSources.some((source) => source.status === "pending_upload")) return "draft";
  if (activeSources.some((source) => source.status === "upload_failed")) {
    return "needs_attention";
  }

  const selectedCompletedParser = (source: ProductionImportRunStatusSource) =>
    source.parsers.find((parser) => parser.status === "completed" && parser.isSelected);

  const hasUnresolvedFailure = activeSources.some((source) => {
    const selected = selectedCompletedParser(source);
    return source.parsers.some(
      (parser) =>
        parser.status === "failed" &&
        (selected?.completedAt === null ||
          selected?.completedAt === undefined ||
          parser.completedAt === null ||
          selected.completedAt <= parser.completedAt),
    );
  });
  if (hasUnresolvedFailure) return "parser_failed";

  if (
    activeSources.some(
      (source) =>
        source.status === "uploaded_unverified" ||
        (source.status === "verified" && !selectedCompletedParser(source)),
    )
  ) {
    return "source_ready";
  }

  if (
    activeSources.some((source) => (selectedCompletedParser(source)?.blockerCount ?? 0) > 0)
  ) {
    return "needs_attention";
  }

  return "ready_for_mapping";
}
