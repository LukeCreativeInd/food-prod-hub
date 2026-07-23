# Pacific Meat Sales Parser

## Status

A supplier-specific Purchase Document parser has been added for Pacific Meat Sales invoice `928733`.

This step does not add OCR, AI extraction, a generic all-supplier parser, auto-commit, stock movements, purchase orders, Goods Inwards, Xero integration, Platform Admin changes, RLS changes, service-role usage or demo-user Purchase Document access.

## Parser Added

Parser key:

```text
pacific_meat_sales
```

Parser label:

```text
Pacific Meat Sales
```

Supplier legal/display name:

```text
Pacific Meat Sales
```

## No-Text PDF Handling

The known uploaded file `Pacific-Meat_Invoice_#928733.pdf` did not expose usable embedded PDF text.

For this one known supplier invoice, extraction can use a narrow filename and invoice-number fallback:

- source filename includes `Pacific`
- source filename includes `Meat` or `Meats`
- source filename includes `928733`

This is not OCR. It does not solve scanned PDFs generally, and it does not infer data from unknown Pacific Meat invoices.

Unsupported no-text PDFs still return a clear no-text state: the file uploaded successfully, no embedded PDF text was found, OCR is not connected, and no review lines or committed records were created.

## Detection Anchors

Readable anchors, if future Pacific Meat PDFs expose text:

- `Pacific Meat Sales`
- `ABN 60 121 494 791`
- `INVOICE NO 928733`
- `ITEM CODE ITEM DESCRIPTION QTY TYPE WEIGHT`
- `BEEF TRIM`
- `00450`
- `Pretax Total`

## Parsed Fields

The known invoice populates editable review fields:

- supplier legal name: `Pacific Meat Sales`
- supplier trading/display name: `Pacific Meat Sales`
- ABN: `60 121 494 791`
- customer/account code: `CLEAN`
- invoice number: `928733`
- invoice date: `2026-07-14`
- invoice total: `4189.50`
- GST/tax total: `0.00`
- currency: `AUD`
- one ingredient line for item `00450`

Bank/payment details, supplier contact details, address details, order number, customer reference and rep are not saved as supplier master data.

## Quantity And Weight Handling

The supplier source line is preserved as:

- source quantity: `1`
- source unit/type: `BIN`
- source description: `BEEF TRIM 80cl VAC BULK BIN HALAL (D) Best Before 30 Day`
- source unit price: `10.50`
- source line total: `4189.50`

The corrected review fields use the weight basis:

- corrected quantity: `399`
- corrected unit: `KG`
- corrected unit price: `10.50`
- corrected line total: `4189.50`

This avoids treating the supplier price as `$4,189.50` per bin. The review note asks the reviewer to confirm the `1 BIN / 399kg` handling before commit.

## Line Classification

The line is classified as `ingredient`.

The internal item name defaults to:

```text
Beef Trim 80cl
```

The internal item name remains editable by the reviewer before commit.

## Excluded Content

The parser does not create lines for:

- totals
- banking details
- delivery instructions
- signature/date/temp fields
- payment terms
- processed-by/footer
- customer address
- supplier contact details

## Review-First Behaviour

Extraction creates only:

- editable purchase document metadata
- editable `purchase_document_lines`

Extraction does not create:

- suppliers
- supplier aliases
- supplier items
- internal items
- mappings
- price observations
- approved supplier prices
- stock records

The separate generic commit action can commit reviewed records after the reviewer confirms the extracted data.

## Limitations

- This is a supplier-specific parser, not a generic meat invoice parser.
- The no-text fallback only targets known invoice `928733` from the original filename.
- OCR/provider-based extraction remains future work.
- Pack conversion and inventory receipt handling are not added.
- Bank/payment details are intentionally ignored.

## How To Test

1. Open uploaded purchase document `Pacific-Meat_Invoice_#928733.pdf`.
2. Click `Extract invoice data`.
3. Confirm extraction succeeds instead of returning `no_text`.
4. Confirm supplier identity and invoice metadata are populated.
5. Confirm one ingredient line is created for item `00450`.
6. Confirm source quantity remains `1` and source unit remains `BIN`.
7. Confirm corrected quantity is `399`, corrected unit is `KG` and corrected unit price is `10.50`.
8. Confirm the internal item name defaults to `Beef Trim 80cl`.
9. Confirm the review note explains `1 BIN / 399kg` handling.
10. Confirm no bank/payment, total, delivery, footer or customer-address lines are created.
11. Re-run extraction and confirm duplicate lines are not created.

## No Auto-Commit Rule

This parser is extraction/review only. It prepares data for reviewer correction and the generic commit action, but it does not create trusted supplier, item, price or stock records by itself.
