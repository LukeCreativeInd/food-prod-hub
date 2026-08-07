export type ProductionDemandActionMessage = {
  tone: "success" | "warning" | "danger" | "info";
  message: string;
};

const messages: Record<string, ProductionDemandActionMessage> = {
  draft: { tone: "success", message: "Review evidence was captured as a draft." },
  reviewed: { tone: "success", message: "The review is marked reviewed and is ready for final freeze checks." },
  frozen: { tone: "success", message: "Production Demand was frozen. The base evidence is now immutable." },
  cancelled: { tone: "info", message: "The review candidate was cancelled. Its evidence remains historical." },
  pending_review: { tone: "success", message: "A cumulative delta candidate was generated for review." },
  retained: { tone: "info", message: "Current evidence is unchanged, so the existing pending delta was retained." },
  approved: { tone: "success", message: "The cumulative delta was approved and is now the effective adjustment." },
  rejected: { tone: "info", message: "The delta candidate was rejected. The current approved adjustment is unchanged." },
  review_already_open: { tone: "warning", message: "A review candidate is already open for this facility and production date." },
  frozen_base_exists: { tone: "warning", message: "This facility and production date already has an immutable frozen base." },
  no_live_demand: { tone: "warning", message: "No active Production Demand exists for that scope. Empty reviews are not allowed." },
  no_unowned_live_demand: { tone: "warning", message: "All current demand in that scope is already committed through another frozen review." },
  live_demand_reconciliation_failed: { tone: "danger", message: "Live demand does not reconcile with its active contributions. Review capture was blocked." },
  scoped_blockers_present: { tone: "warning", message: "Current scoped blockers must be resolved before this review can freeze." },
  unscoped_blockers_require_acknowledgement: { tone: "warning", message: "Review and acknowledge the current organisation-wide unscoped blockers before freezing." },
  unscoped_blockers_changed: { tone: "warning", message: "The unscoped blocker set changed. Capture a new review before freezing." },
  review_stale: { tone: "warning", message: "Current contribution evidence changed. This review is stale and was not frozen." },
  delta_stale: { tone: "warning", message: "Current source evidence changed. This delta is stale and was not approved." },
  commitment_ownership_conflict: { tone: "warning", message: "A source line was committed by another frozen review. No duplicate commitment was created." },
  freeze_confirmation_required: { tone: "warning", message: "Type FREEZE to confirm the irreversible freeze." },
  invalid_rejection_category: { tone: "warning", message: "Choose a valid rejection reason." },
  permission_denied: { tone: "danger", message: "You do not have permission to change Production Demand." },
  error: { tone: "danger", message: "Production Demand could not be updated. No frozen or approved state was assumed." },
};

export function getProductionDemandActionMessage(
  status?: string,
): ProductionDemandActionMessage | null {
  return status ? messages[status] ?? null : null;
}
