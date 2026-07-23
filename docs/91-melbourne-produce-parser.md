# Melbourne Produce Merchants Parser

## Status

A supplier-specific Purchase Document parser has been added for Melbourne Produce Merchants invoices, including the repeat Fresho invoices `F56088214` and `F56478121`.

This step does not add OCR, AI extraction, a generic all-supplier parser, auto-commit, stock movements, purchase orders, Goods Inwards, Xero integration, Platform Admin changes, RLS changes, service-role usage or demo-user Purchase Document access.

## Parser Added

Parser key:

```text
melbourne_produce_merchants
```

Parser label:

```text
Melbourne Produce Merchants
```

Supplier:

```text
Melbourne Produce Merchants Pty Ltd
```

Tenant display name:

```text
Melbourne Produce Merchants
```

## Detection Anchors

Readable anchors, when PDF text is available normally:

- Melbourne Produce Merchants
- Melbourne Produce Merchants Pty Ltd
- ABN 72 666 557 286
- F56088214
- F56478121
- QTY / CODE / DESCRIPTION
- UNIT PRICE / AMOUNT
- UNIT PRICE ex TAX / AMOUNT
- BAS003
- PBROFLO002
- PCAPCHU30M001
- PCAPREDIC10M001
- PMUSHDIC20001
- PPOTWED001
- PPOTCHA002
- PPOTSWDIC001
- Total incl GST

The uploaded known invoices can use glyph-encoded embedded PDF text, so the parser also has a narrow fallback for known Fresho/Melbourne Produce invoice files:

- source filename includes `FreshoInvoice`, `F56088214` or `F56478121`
- source filename or extracted text includes a known Fresho invoice number such as `F56478121`
- extracted text length is close to the known glyph-encoded layout
- extracted text contains a high ratio of low-code glyph/control characters

The fallback does not key on the local purchase document id.

## Parsed Fields

The parser populates editable review fields:

- supplier legal name
- supplier trading/display name
- ABN
- invoice number
- invoice date
- invoice total
- GST/tax total
- currency
- invoice lines

Due date, phone numbers, email addresses and supplier address details are not stored in the current `purchase_documents` review metadata, so they are not committed into dedicated fields.

## Lines Extracted

The known invoice `F56088214` creates 11 reviewed draft ingredient lines:

- Basil
- Broccoli Florets
- Capsicum - Red 'Chunky Cut' 30mm
- Mushroom - Diced 20mm
- Onions - Brown 'Chunky Cut' 30mm
- Onions - Brown (Diced)
- Parsley - Continental
- Potato - Wedges 'Skin On'
- Potatoes - Chats (Peeled)
- Potatoes - Peeled and Diced
- Sweet Potatoes - Peeled & Diced

All lines are classified as `ingredient`.

The repeat invoice `F56478121` creates 5 reviewed draft ingredient lines:

- Capsicum - Red 'Chunky Cut' 30mm, 10 Kg
- Capsicum - Red 'Chunky Cut' 30mm, 5 Kg
- Capsicums - Red Diced 10mm, 5 Bag (1kg), zero-dollar line
- Potato - Wedges 'Skin On', 50 Kg
- Potatoes - Chats (Peeled), 4 Bag (10kg)

Internal item names are suggested only and remain editable by the reviewer before any future commit flow.

## Repeat Invoice Handling

`F56478121` includes `PCAPCHU30M001` twice as two separate invoice lines. Extraction preserves both rows so the review page can show the two actual supplier lines. If committed later, the generic commit flow should reuse the same supplier item, internal item and mapping, while creating separate price observations for each document line.

The `PCAPREDIC10M001` line has a unit price and line total of `0.00`. Extraction still creates the review line because it is visible on the supplier invoice, but the review note marks the line as `review_later` so the generic commit flow does not accidentally approve a current supplier price of `$0`.

## Unit And Pack Handling

Supplier units are preserved exactly:

- `Bunch`
- `Bag (5kg)`
- `Kg`
- `Bag (1kg)`
- `Bag (10kg)`

No pack-to-kg conversion is applied yet. Pack conversions remain a future reviewed costing/inventory concern.

## Excluded Content

The parser does not create lines for:

- subtotal
- GST
- total
- QR code text
- credit/replacement claim notes
- delivery address
- payment notes
- page numbers

## Review-First Behaviour

Extraction creates only:

- editable purchase document source/metadata fields
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

## Step 092 Update

Melbourne Produce extracted reviews can now commit through the generic reviewed Purchase Document commit flow documented in [Generic Purchase Document Commit Flow](92-generic-purchase-document-commit-flow.md).

For the known `F56088214` invoice, commit creates or reuses the Melbourne Produce supplier, aliases, 11 supplier items, 11 reviewed internal ingredient items, 11 mappings, 11 price observations and approved supplier prices according to the current default price-decision behaviour.

For `F56478121`, duplicate supplier item codes remain separate review lines, and the zero-dollar `PCAPREDIC10M001` line is marked for later review instead of approved current-price update.

Extraction still does not auto-commit. A reviewer must save/confirm the review and choose the commit action.

## Limitations

- This is a supplier-specific parser, not a generic Fresho parser.
- The glyph-encoded fallback is temporary because a deterministic decoder has not yet been inferred.
- The parser currently targets the known `F56088214` and `F56478121` invoice layouts.
- Future Melbourne Produce invoice layouts may still fall through to unknown-parser diagnostics.

## How To Test

1. Open the uploaded purchase document for `FreshoInvoice#F56088214.pdf`.
2. Click `Extract invoice data`.
3. Confirm the page redirects with extraction success.
4. Confirm supplier and invoice metadata are populated.
5. Confirm 11 ingredient lines are created.
6. Confirm units are preserved exactly.
7. Confirm internal item names are editable suggestions.
8. Confirm no commit happens automatically.
9. Re-run extraction and confirm duplicate lines are not created.

Repeat-invoice test:

1. Open the uploaded purchase document for `FreshoInvoice#F56478121.pdf`.
2. Click `Extract invoice data`.
3. Confirm invoice number `F56478121`, date `23 Jul 2026` and total `364.25` are populated.
4. Confirm 5 ingredient lines are created.
5. Confirm both `PCAPCHU30M001` rows are present as separate review lines.
6. Confirm the `PCAPREDIC10M001` zero-dollar line is present and marked for price review.
7. Confirm no subtotal, GST, total, QR, claim-note, delivery-address, payment-note or page-number lines are created.
8. Re-run extraction and confirm duplicate lines are not created.

## No Auto-Commit Rule

This parser is extraction/review only. It prepares data for reviewer correction and the generic commit action, but it does not create trusted supplier, item, price or stock records by itself.
