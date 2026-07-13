# Purchase Document Upload and Review Actions

## Status

Purchase Document Intake now has its first server-side action foundation.

This step adds real saved document/review behaviour for the Cammaroto sample path only. It does not add OCR, storage-backed file upload, supplier/item/price commit logic, stock movements, Xero, purchase orders, bank/payment detail updates, service-role client code, Platform Admin changes, or demo-user access.

## Actions and Helpers Added

New helper/action areas:

- `lib/purchase-document-intake.ts`
- `app/purchase-documents/actions.ts`

The helper layer provides:

- `getPurchaseDocumentsForCurrentOrganisation`
- `getPurchaseDocumentReview`
- `createCammarotoSampleReview`
- `updatePurchaseDocumentReview`

The route action layer provides:

- `createCammarotoSampleReviewAction`
- `savePurchaseDocumentReviewAction`

All actions use the existing server Supabase client and existing auth/permission helpers. No service-role key is used.

## Routes Updated

Updated routes:

- `/purchase-documents`
- `/purchase-documents/[id]`

The list route now reads saved `purchase_documents` rows for the current organisation and shows an empty state when none exist.

The review route now loads a saved `purchase_documents` row and its `purchase_document_lines` rows from Supabase.

## Cammaroto Sample Creation

The Cammaroto sample action creates:

- one `purchase_documents` row
- two `purchase_document_lines` rows

It creates no records in:

- `suppliers`
- `supplier_aliases`
- `supplier_items`
- `internal_items`
- `supplier_item_mappings`
- `price_observations`
- `approved_supplier_prices`
- `ignored_line_rules`
- stock/inventory tables

Sample duplicate prevention checks for an existing document in the current organisation with the same invoice number, invoice date, invoice total, and Cammaroto/Surefire source identity. If found, the action redirects to the existing review and does not create duplicate lines.

## Save Review Progress

The review page can save editable review progress for:

- invoice number
- invoice date
- invoice total
- tax total
- currency
- source supplier identity fields
- document review status
- line classification
- line corrected code/description/quantity/unit/price/tax/total
- line review notes
- line review status

Source line fields are not edited by the review form. Corrected values are stored separately from source and normalised values.

The action supports `needs_review` and `ready_to_commit` status only. `ready_to_commit` requires the core invoice fields and non-unknown line classifications. Commit remains disabled.

## Permissions and Tenant Isolation

Access remains permission-gated:

- list/review requires `purchase_documents.view`
- creating the sample requires `purchase_documents.upload`
- saving review progress requires `purchase_documents.review`

The helper layer always scopes queries and writes to the current organisation. RLS remains enabled on all intake tables.

The `phase_1_demo_user` role is still not granted Purchase Document Intake permissions.

## Still Not Implemented

The following remain future work:

- storage-backed upload
- MIME validation and file metadata capture from real uploads
- OCR or external document extraction
- automatic classification
- commit to suppliers, supplier items, internal items, mappings, observations or approved prices
- stock movement creation
- purchase orders
- Xero integration
- duplicate/no-change result screens beyond the Cammaroto sample redirect

## Recommended Next Step

Step 073 should build the Cammaroto sample commit flow in a controlled way:

- review existing document/line data
- create or confirm supplier records
- create supplier aliases/items where approved
- create or link internal items/mappings where approved
- create price observations
- optionally update approved supplier prices
- keep stock movements out of scope unless separately reviewed
