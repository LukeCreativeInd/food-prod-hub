# Purchase Document Intake Generalisation UX Polish

## Status

Purchase Document Intake has been reframed as a general supplier invoice and purchase document intake workspace.

The existing Cammaroto path remains available as a controlled sample/test invoice workflow, but it is no longer presented as the identity of the tool.

## Generalised Wording

The `/purchase-documents` page now describes the workspace as a reviewed intake flow for supplier invoices and purchase documents.

It communicates that supplier data, supplier items, internal item mappings and approved prices are updated only after review and explicit commit.

The page is organised around:

- intake overview
- documents requiring review
- recently reviewed/committed documents
- sample/test invoice
- upload/extraction coming next

## Cammaroto Sample Positioning

The Cammaroto invoice is now labelled as a sample workflow.

The sample action explains that it creates or opens a controlled Cammaroto Poultry test invoice so the current intake workflow can be tested end to end.

Server-side duplicate prevention remains in place.

## Loading and Action Feedback

A focused client submit button component was added for action feedback:

- create sample review shows `Creating review...`
- save review progress shows `Saving...`
- commit reviewed records shows `Committing...`

Buttons are disabled while the server action is pending to reduce accidental double submits.

Success and already-existing states continue to be shown through the existing redirected query-state messages.

## Review Page Improvements

The review route now presents as `Review Import`.

The page now makes these areas clearer:

- supplier identity
- invoice metadata
- invoice lines
- internal item mapping
- price decision
- proposed commit actions
- validation and guardrails
- commit result

Line-level wording separates supplier source descriptions, corrected supplier descriptions and internal item names.

Committed summaries now call out:

- supplier
- supplier aliases
- supplier item
- internal item
- mapping
- price observation
- approved supplier price
- informational rule
- no stock movement created
- no supplier payment/bank detail update
- source supplier descriptions preserved

## No Database Changes

No migrations were added.

No Supabase tables, RLS policies or permissions were changed.

## Still Not Included

This polish step does not add:

- OCR
- real file upload/storage
- generic arbitrary invoice commit automation
- stock movements
- supplier bank/payment detail updates
- purchase orders
- Goods Inwards receiving
- Xero/accounting integration
- Platform Admin changes
- demo-user access

## Existing Behaviour Preserved

The following behaviour remains in place:

- Cammaroto sample creation
- duplicate sample prevention
- saved review progress
- reviewer-controlled internal item name
- controlled Cammaroto commit flow
- idempotent commit behaviour
- demo user blocked by permission checks
- signed-out users redirected through existing auth protection

## Recommended Next Task

Next recommended task: Generic Invoice Review and Commit Planning.

That planning step should decide how to move from the controlled Cammaroto path to a generic reviewed invoice model without weakening tenant isolation, RLS or review/commit guardrails.

This planning now exists in [Generic Invoice Extraction and Commit Planning](75-generic-invoice-extraction-and-commit-planning.md).
