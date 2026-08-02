export type LogisticsActionFeedback = {
  message: string;
  tone: "success" | "warning" | "error";
};

function feedback(
  message: string,
  tone: LogisticsActionFeedback["tone"],
): LogisticsActionFeedback {
  return { message, tone };
}

export function getDispatchActionMessage(status: string | undefined) {
  if (!status) return null;
  const messages: Record<string, LogisticsActionFeedback> = {
    created: feedback("Draft dispatch run created with an authoritative run number.", "success"),
    run_updated: feedback("Dispatch run details saved.", "success"),
    delivery_added: feedback("Delivery added to the draft dispatch run.", "success"),
    delivery_updated: feedback("Delivery details saved.", "success"),
    delivery_archived: feedback("Delivery removed from the draft dispatch run.", "success"),
    line_added: feedback("Item line added to the delivery.", "success"),
    line_updated: feedback("Item line saved.", "success"),
    line_archived: feedback("Item line removed from the draft delivery.", "success"),
    validation_passed: feedback("Dispatch validation passed.", "success"),
    validation_failed: feedback("Dispatch validation found required fields or item lines that need attention.", "warning"),
    ready: feedback("Dispatch run marked ready.", "success"),
    already_ready: feedback("Dispatch run was already ready.", "success"),
    dispatched: feedback("Dispatch run marked dispatched.", "success"),
    already_dispatched: feedback("Dispatch run was already dispatched.", "success"),
    cancelled: feedback("Dispatch run cancelled.", "success"),
    already_cancelled: feedback("Dispatch run was already cancelled.", "success"),
    generated_manifest_exists: feedback("A generated manifest already exists. Regeneration and cancellation require a future reviewed correction workflow.", "warning"),
    generated_manifest_required: feedback("Generate an active manifest before marking the run dispatched.", "warning"),
    dispatch_run_not_ready: feedback("Mark the dispatch run ready before creating or generating its manifest.", "warning"),
    cancellation_reason_required: feedback("Enter a cancellation reason.", "warning"),
    invalid_transition: feedback("That dispatch lifecycle transition is not allowed.", "warning"),
    invalid_dispatch_type: feedback("Choose a valid dispatch type.", "warning"),
    invalid_dates: feedback("Delivery date must be on or after dispatch date.", "warning"),
    invalid_delivery_date: feedback("Enter a valid delivery date.", "warning"),
    invalid_carrier_service: feedback("The selected service must belong to the selected active carrier.", "warning"),
    invalid_carrier: feedback("The selected carrier is not available.", "warning"),
    missing_delivery_fields: feedback("Complete the required recipient and address fields.", "warning"),
    invalid_carton_count: feedback("Carton count must be a whole number of zero or more.", "warning"),
    invalid_weight: feedback("Weight cannot be negative.", "warning"),
    invalid_sequence: feedback("Sequence number must be a positive whole number.", "warning"),
    invalid_temperature_class: feedback("Choose a valid temperature class.", "warning"),
    invalid_email: feedback("Enter a valid email address or leave it blank.", "warning"),
    invalid_source_type: feedback("Source type must use lowercase letters, numbers, underscores or hyphens.", "warning"),
    missing_item_name: feedback("Enter the item name snapshot.", "warning"),
    invalid_quantity: feedback("Enter a positive item quantity.", "warning"),
    invalid_unit: feedback("Enter the dispatch unit.", "warning"),
    invalid_line_number: feedback("Line number must be a positive whole number.", "warning"),
    duplicate_line_number: feedback("That line number is already used by this delivery.", "warning"),
    invalid_internal_item: feedback("The selected internal item is not available in this organisation.", "warning"),
    dispatch_run_locked: feedback("This dispatch run is read-only because of its status or generated manifest.", "warning"),
    dispatch_run_not_found: feedback("The dispatch run could not be found.", "error"),
    dispatch_delivery_not_found: feedback("The editable delivery could not be found.", "error"),
    dispatch_line_not_found: feedback("The editable item line could not be found.", "error"),
    permission_denied: feedback("You do not have permission to perform that Logistics action.", "error"),
    organisation_not_found: feedback("The current tenant workspace could not be resolved.", "error"),
    number_sequence_exhausted: feedback("The daily authoritative number sequence is full.", "error"),
    error: feedback("The Logistics action could not be completed.", "error"),
  };
  return messages[status] ?? feedback("The Logistics action could not be completed.", "error");
}

export function getManifestActionMessage(status: string | undefined) {
  if (!status) return null;
  const messages: Record<string, LogisticsActionFeedback> = {
    draft_created: feedback("Manifest draft created for this dispatch run.", "success"),
    existing_draft: feedback("The existing manifest draft was opened.", "success"),
    generated: feedback("Manifest generated successfully. Delivery and item details are now locked as a historical snapshot.", "success"),
    already_generated: feedback("This manifest was already generated; no duplicate historical records were created.", "success"),
    validation_failed: feedback("Resolve the dispatch validation issues before generating this manifest.", "warning"),
    generated_manifest_exists: feedback("A generated manifest already exists for this dispatch run.", "warning"),
    manifest_not_found: feedback("The manifest could not be found.", "error"),
    manifest_not_draft: feedback("Only draft manifests can be generated.", "warning"),
    dispatch_run_not_found: feedback("The linked dispatch run could not be found.", "error"),
    dispatch_run_not_ready: feedback("Mark the linked dispatch run ready before generating this manifest.", "warning"),
    dispatch_run_locked: feedback("The source dispatch run is not available for generation.", "warning"),
    snapshot_state_conflict: feedback("This draft has an unexpected snapshot state and was not generated.", "error"),
    number_sequence_exhausted: feedback("The daily manifest number sequence is full.", "error"),
    permission_denied: feedback("You do not have permission to perform that manifest action.", "error"),
    error: feedback("The manifest action could not be completed.", "error"),
  };
  return messages[status] ?? feedback("The manifest action could not be completed.", "error");
}
