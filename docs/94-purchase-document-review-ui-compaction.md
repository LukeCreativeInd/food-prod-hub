# Purchase Document Review UI Compaction

## Problem Solved

The Purchase Document Review page previously rendered every invoice line as a fully expanded form block.

That worked for the two-line Cammaroto sample, but larger invoices such as Del-Re and Melbourne Produce became too long to scan and review efficiently.

## Compact Line Table

The invoice line section now starts with a compact review table/list.

Each line shows:

- status
- supplier code
- supplier description
- quantity/unit
- unit price
- line total
- classification
- internal item name
- price decision
- issues
- review action

Ready lines are collapsed by default. Lines with issues are expanded by default.

## Expanded Details

Each row can be expanded to edit the existing review fields:

- classification
- line status
- corrected supplier code
- corrected supplier description
- corrected quantity
- corrected unit
- corrected unit price
- corrected line total
- corrected tax
- internal item name
- price decision display
- review notes

Collapsed rows still keep their form fields in the page so `Save review progress` continues to submit reviewed values.

## Readiness Summary

A summary above the table shows:

- total lines
- ready lines
- needs review lines
- informational/ignored lines
- missing internal item names
- price changes detected

Readiness is display-only. It does not silently save, commit or change line data.

## Expand / Collapse Controls

The line review section includes:

- Expand all
- Collapse all
- Show issues only
- Show all

These controls are local UI helpers only.

## Bulk Action Behaviour

Bulk mark-ready and dedicated per-line price decision controls were not added in this step.

They remain planned follow-ups because adding bulk write behaviour should be designed carefully around review provenance and commit validation.

## Commit Panel

The existing commit panel remains on the review page.

Commit wording continues to make clear that commit creates/reuses supplier, supplier item, internal item, mapping, price observation and approved supplier price records.

Commit still does not create stock movements or update supplier payment/bank details.

## Non-Goals

This step does not add:

- parser changes
- generic commit changes
- migrations
- RLS changes
- permission changes
- Platform Admin changes
- stock movements
- supplier bank/payment updates
- Xero integration
- demo-user Purchase Document access

## Testing Notes

Recommended checks:

- Del-Re invoice shows 9 compact line rows.
- Melbourne Produce invoice shows 11 compact line rows.
- Cammaroto invoice still shows 2 lines and remains easy to review.
- Ready lines are collapsed by default.
- Lines with issues are expanded by default.
- Expanding a row shows editable review fields.
- Save review progress still works.
- Commit reviewed records still works after review.
- Unknown parser diagnostics still work.
