# Melbourne Produce Merchants Parser

## Status

A supplier-specific Purchase Document parser has been added for Melbourne Produce Merchants invoices.

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
- QTY / CODE / DESCRIPTION
- UNIT PRICE / AMOUNT
- BAS003
- PBROFLO002
- PMUSHDIC20001
- PPOTSWDIC001
- Total incl GST

The uploaded known invoice uses glyph-encoded embedded PDF text, so the parser also has a narrow fallback for the known Fresho/Melbourne Produce invoice shape:

- source filename includes `FreshoInvoice` or `F56088214`
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

Internal item names are suggested only and remain editable by the reviewer before any future commit flow.

## Unit And Pack Handling

Supplier units are preserved exactly:

- `Bunch`
- `Bag (5kg)`
- `Kg`
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

The existing Cammaroto commit flow is intentionally not used for Melbourne Produce. A generic multi-line commit flow must be planned and built separately.

## Limitations

- This is a supplier-specific parser, not a generic Fresho parser.
- The glyph-encoded fallback is temporary because a deterministic decoder has not yet been inferred.
- The parser currently targets the known `F56088214` invoice layout.
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

## No Auto-Commit Rule

This parser is extraction/review only. It prepares data for reviewer correction and later commit planning, but it does not create trusted supplier, item, price or stock records.
