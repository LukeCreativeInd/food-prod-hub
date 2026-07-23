# Il Nonno Parser

## Status

A supplier-specific Purchase Document parser has been added for Il Nonno invoice `INV-6136`.

This step does not add OCR, AI extraction, a generic all-supplier parser, auto-commit, stock movements, purchase orders, Goods Inwards, Xero integration, Platform Admin changes, RLS changes, service-role usage or demo-user Purchase Document access.

## Parser Added

Parser key:

```text
il_nonno
```

Parser label:

```text
Il Nonno
```

Supplier legal name:

```text
Il Nonno Foods Pty Ltd
```

Tenant display name:

```text
Il Nonno
```

## Detection Anchors

Readable anchors, when PDF text is available normally:

- `Il Nonno`
- `Il Nonno Foods`
- `ABN 43 218 394 993`
- `INV-6136`
- `POTATO GNOCCHI (FROZEN) 5KG`
- `Invoice Total AUD`
- `Amount Due AUD`
- `Description Quantity Unit Price`
- `Delivery Note`

The uploaded known invoice can expose glyph-encoded embedded text. The parser therefore also has a narrow fallback for the known Il Nonno invoice:

- source filename includes `INV-6136` or `INV6136`
- source filename includes `Il Nonno`/`ilnonno` when present
- known glyph-encoded invoice text shape may be present

The fallback does not key on the local purchase document id.

## Parsed Fields

The parser populates editable review fields:

- supplier legal name: `Il Nonno Foods Pty Ltd`
- supplier trading/display name: `Il Nonno`
- ABN: `43 218 394 993`
- invoice number: `INV-6136`
- invoice date: `2026-07-17`
- invoice total: `840.00`
- GST/tax total: `0.00`
- currency: `AUD`
- one ingredient line

Due date, payment terms, supplier address, phone, email, customer address and amount-due/payment blocks are not stored in dedicated purchase document metadata.

## Line Extracted

Ingredient line:

- description: `POTATO GNOCCHI (FROZEN) 5KG`
- quantity: `16.00`
- unit: `carton`
- unit price: `52.50`
- GST: `GST Free`
- line total: `840.00`
- internal item suggestion: `Potato Gnocchi Frozen`

There is no supplier item code on the invoice. The source item code is left blank so the generic commit flow can use the supplier description.

## Delivery Note Duplicate Handling

The PDF has two pages:

- page 1: tax invoice
- page 2: delivery note repeating the same product/quantity

The parser creates only one invoice line. The delivery note page is not imported as a second product line.

Delivery note signature fields, temperature fields and repeated product rows are excluded from item extraction.

## Unit And Pack Handling

Supplier unit `carton` is preserved exactly.

No carton-to-kg conversion is applied, and no per-kg price is inferred from `5KG` in the description. Pack conversion remains future reviewed costing/inventory work.

## Commit Expectations

After review, the generic commit flow should:

- create/reuse the Il Nonno supplier
- create/reuse a supplier item for `POTATO GNOCCHI (FROZEN) 5KG`
- create/reuse internal item `Potato Gnocchi Frozen`
- create mapping and price observation/approved price according to reviewer decision
- create no stock movements
- update no bank/payment details

## Excluded Content

The parser does not create lines for:

- payment terms
- direct debit/bank details
- due date/payment notes
- delivery note duplicate product row
- delivery note signature fields
- delivery note temperature fields
- storage warnings
- footer/contact/payment text
- totals

## Limitations

- This is a supplier-specific parser, not a generic pasta invoice parser.
- The glyph/filename fallback targets known invoice `INV-6136`.
- OCR/provider-based extraction remains future work.
- Pack conversion and costing-unit conversion are not added.
- Future Il Nonno layouts may still fall through to unknown-parser diagnostics.

## How To Test

1. Open uploaded purchase document `Invoice INV-6136.pdf`.
2. Click `Extract invoice data`.
3. Confirm extraction recognises Il Nonno.
4. Confirm supplier identity and invoice metadata populate.
5. Confirm invoice number `INV-6136`, date `2026-07-17` and total `840.00`.
6. Confirm one ingredient line is created.
7. Confirm unit `carton` is preserved.
8. Confirm internal item name defaults to `Potato Gnocchi Frozen` and remains editable.
9. Confirm the delivery note page does not create a duplicate line.
10. Confirm no bank/payment/footer/delivery-note/signature lines are created.
11. Re-run extraction and confirm duplicate lines are not created.
12. Review and save the document before using the generic commit action.

## No Auto-Commit Rule

This parser is extraction/review only. It prepares data for reviewer correction and the generic commit action, but it does not create trusted supplier, item, price or stock records by itself.
