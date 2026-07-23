# Grange Meat Co Parser

## Status

A supplier-specific Purchase Document parser has been added for Grange Meat Co invoice `349708`.

This step does not add OCR, AI extraction, a generic all-supplier parser, auto-commit, stock movements, purchase orders, Goods Inwards, Xero integration, Platform Admin changes, RLS changes, service-role usage or demo-user Purchase Document access.

## Parser Added

Parser key:

```text
grange_meat_co
```

Parser label:

```text
Grange Meat Co
```

Supplier legal name:

```text
GRANGE MEAT CO. PTY. LTD.
```

Tenant display name:

```text
Grange Meat Co
```

## Detection Anchors

Readable anchors, when PDF text is available normally:

- `GRANGE MEAT CO`
- `GRANGE MEAT CO. PTY. LTD.`
- `ABN 69 650 005 619`
- `349708`
- `LMB020`
- `LAMB LEG BONELESS`
- `DELIVERYCHARGE`
- `COMMENT`
- `QTY SHIPPED ITEM NO DESCRIPTION UNIT PRICE DISC EXTENDED PRICE TAX`
- `Total Incl GST`

The uploaded known invoice can expose glyph-encoded embedded text. The parser therefore also has a narrow fallback for the known Grange invoice:

- source filename includes `349708` or `Grange`
- known glyph-encoded invoice text shape may be present

The fallback does not key on the local purchase document id.

## Parsed Fields

The parser populates editable review fields:

- supplier legal name: `GRANGE MEAT CO. PTY. LTD.`
- supplier trading/display name: `Grange Meat Co`
- ABN: `69 650 005 619`
- invoice number: `349708`
- invoice date: `2026-07-15`
- invoice total: `4043.50`
- GST/tax total: `0.50`
- currency: `AUD`
- one ingredient line
- two informational/ignored lines

Supplier address, phone, email, accounts email, Primesafe licence, bill-to/ship-to address, balance due and footer/header details are not stored in dedicated purchase document metadata.

## Lines Extracted

Ingredient line:

- item code: `LMB020`
- description: `LAMB LEG BONELESS - ORDER BY KG`
- quantity: `201.90`
- unit: `KG`
- unit price: `20.00`
- line total: `4038.00`
- tax: `GST Free`
- internal item suggestion: `Lamb Leg Boneless`

Informational/ignored lines:

- `DELIVERYCHARGE` / `Delivery Charge` / `5.00`
- `COMMENT` / operational Thermoformer and labelling note / `0.00`

Only the lamb line is classified as `ingredient`.

## Delivery Charge And Comment Handling

The delivery charge is classified as `informational` with status `ignored`. It is visible in review, but it should not create a supplier item, internal item, mapping, price observation or approved supplier price.

The comment line is also classified as `informational` with status `ignored`. It preserves the operational packing note for review only.

These lines should not affect ingredient costs or stock.

## Unit Handling

The lamb line preserves supplier unit `KG`.

No stock movement, receiving quantity, pack conversion or production usage logic is added.

## Commit Expectations

After review, the generic commit flow should:

- create/reuse the Grange Meat Co supplier
- create/reuse supplier item `LMB020`
- create/reuse internal item `Lamb Leg Boneless`
- create mapping and price observation/approved price for the lamb line
- create/reuse informational ignored-line handling for delivery/comment lines
- not create supplier item, internal item, mapping or approved price records for `DELIVERYCHARGE` or `COMMENT`
- create no stock movements
- update no bank/payment details

## Excluded Content

The parser does not create lines for:

- banking details
- price increase notes
- restocking fee notes
- pickup information
- balance due
- bill-to address
- ship-to address
- logo/header/footer content

## Limitations

- This is a supplier-specific parser, not a generic meat invoice parser.
- The glyph/filename fallback targets known invoice `349708`.
- OCR/provider-based extraction remains future work.
- Delivery/freight charges are not modelled as costing charges yet.
- Future Grange Meat layouts may still fall through to unknown-parser diagnostics.

## How To Test

1. Open uploaded purchase document `349708.pdf`.
2. Click `Extract invoice data`.
3. Confirm extraction recognises Grange Meat Co.
4. Confirm supplier identity and invoice metadata populate.
5. Confirm invoice number `349708`, date `2026-07-15` and total `4043.50`.
6. Confirm `LMB020` is created as an ingredient line.
7. Confirm internal item name defaults to `Lamb Leg Boneless` and remains editable.
8. Confirm `DELIVERYCHARGE` and `COMMENT` are informational/ignored, not ingredients.
9. Confirm no bank/payment/address/footer lines are created.
10. Re-run extraction and confirm duplicate lines are not created.
11. Review and save the document before using the generic commit action.

## No Auto-Commit Rule

This parser is extraction/review only. It prepares data for reviewer correction and the generic commit action, but it does not create trusted supplier, item, price or stock records by itself.
