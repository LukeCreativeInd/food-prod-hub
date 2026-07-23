# Alba Cheese Parser

## Status

A supplier-specific Purchase Document parser has been added for Alba Cheese Manufacturing invoice `SO148136`.

This step does not add OCR, AI extraction, a generic all-supplier parser, auto-commit, stock movements, purchase orders, Goods Inwards, Xero integration, Platform Admin changes, RLS changes, service-role usage or demo-user Purchase Document access.

## Parser Added

Parser key:

```text
alba_cheese
```

Parser label:

```text
Alba Cheese
```

Supplier legal name:

```text
Alba Cheese Manufacturing Pty Ltd
```

Tenant display name:

```text
Alba Cheese
```

## Detection Anchors

The parser detects the known Alba Cheese invoice layout using readable anchors:

- `Alba Cheese`
- `Alba Cheese Manufacturing Pty Ltd`
- `ABN 44 619 302 420`
- `SO148136`
- `Shredded Mozzarella 2kg`
- `QTY UNIT ITEM BATCH CODE PRICE TAX BALANCE`

The parser can also use the source filename `SO148136.pdf` as a supporting hint, but it does not key on the local purchase document id.

## Parsed Fields

The parser populates editable review fields:

- supplier legal name: `Alba Cheese Manufacturing Pty Ltd`
- supplier trading/display name: `Alba Cheese`
- ABN: `44 619 302 420`
- invoice number: `SO148136`
- invoice date: `2026-07-20`
- invoice total: `984.00`
- GST/tax total: `0.00`
- currency: `AUD`
- one ingredient line

Delivery date, terms, freight, supplier contact details, payment details, terms and footer content are not stored in dedicated purchase document metadata.

## Line Extracted

The known invoice creates one reviewed draft ingredient line:

- item code: `129`
- description: `Shredded Mozzarella 2kg`
- quantity: `8`
- unit: `Box`
- unit price: `123.00`
- tax: `0.00`
- line total: `984.00`
- internal item suggestion: `Shredded Mozzarella`

The invoice table includes batch `07/11/26`. There is no dedicated purchase document line batch field yet, so the batch value is preserved in review notes.

## Unit Handling

Supplier unit `Box` is preserved exactly.

No box-to-kg conversion is applied. Pack size, box conversion and costing-unit conversion remain future reviewed costing/inventory work.

## Excluded Content

The parser does not create lines for:

- freight
- payment options
- EFT/bank details
- terms and conditions
- footer/contact blocks
- delivery address
- customer address

Freight is intentionally excluded from item-line extraction in this first parser version rather than being committed as an ingredient.

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

- This is a supplier-specific parser, not a generic dairy invoice parser.
- The parser currently targets the known `SO148136` invoice layout.
- Batch is kept in review notes because there is no dedicated purchase document line batch field yet.
- Freight is excluded rather than modelled as a non-stock charge in this first parser version.
- Future Alba Cheese layouts may still fall through to unknown-parser diagnostics.

## How To Test

1. Open uploaded purchase document `SO148136.pdf`.
2. Click `Extract invoice data`.
3. Confirm extraction succeeds.
4. Confirm supplier identity and invoice metadata populate.
5. Confirm one ingredient line is created.
6. Confirm unit `Box` is preserved.
7. Confirm internal item name defaults to `Shredded Mozzarella` and remains editable.
8. Confirm batch `07/11/26` appears in review notes.
9. Confirm no freight, bank/payment, terms, footer, contact, delivery or address lines are created.
10. Re-run extraction and confirm duplicate lines are not created.
11. Review and save the document before using the generic commit action.

## No Auto-Commit Rule

This parser is extraction/review only. It prepares data for reviewer correction and the generic commit action, but it does not create trusted supplier, item, price or stock records by itself.
