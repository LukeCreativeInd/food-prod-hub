# Del-Re National Food Group Parser

## Status

A supplier-specific Purchase Document parser has been added for Del-Re National Food Group invoices.

This step does not add OCR, AI extraction, a generic all-supplier parser, auto-commit, stock movements, purchase orders, Goods Inwards, Xero integration, Platform Admin changes, RLS changes, service-role usage or demo-user Purchase Document access.

## Parser Added

Parser key:

```text
del_re_national_food_group
```

Parser label:

```text
Del-Re National Food Group
```

Supplier legal name:

```text
DEL-RE National Food Group
```

Tenant display name:

```text
Del-Re National Food Group
```

## Detection Anchors

The parser detects the known Del-Re invoice layout using a combination of anchors:

- `DEL-RE National Food Group`
- `ABN 24 111 521 834`
- `Invoice No: 1354283`
- `Account: 215799`
- `Item Code Item Description Brand Ordered Shipped UOM Item Price GST Line Total`
- `CHHIME2.27P`
- `CHTA2RD`
- `PIBRBU5W`
- `PEBL1T`
- `SUBR15C`
- `Total (Incl. GST)`

The uploaded known invoice can be recognised from the shifted-font decoded text candidate produced by the existing extraction candidate flow.

## Parsed Fields

The parser populates editable review fields:

- supplier legal name
- supplier trading/display name
- ABN
- account number
- invoice number
- invoice date
- GST/tax total
- invoice total
- currency
- invoice lines

Supplier address, phone number, delivery instructions, bank details, carrier, order references and customer address are not stored in the current purchase document metadata.

## Lines Extracted

The known invoice `1354283` creates 9 reviewed draft ingredient lines:

- Hi-Melt Burger Cheese Slices
- Tasty Shredded Cheese
- Bread And Butter Pickles
- Cheese Sauce Pouch
- Garam Masala
- Lemon Juice
- Black Pepper Ground Pre-Mix
- Cooking Salt
- Brown Sugar

All item lines are classified as `ingredient`.

Internal item names are suggestions only and remain editable by the reviewer before commit.

## Unit And Pack Handling

Supplier UOM values are preserved exactly:

- `EA`
- `CTN`

No pack conversion is applied. Pack size, carton handling and base-unit conversion remain future reviewed costing/inventory work.

## Excluded Content

The parser does not create lines for:

- Fuel Levy
- totals
- GST summary
- bank details
- customer address
- delivery instructions
- credit request note
- biller code
- page number

Fuel Levy is intentionally excluded in this first parser version rather than being committed as an ingredient.

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

- This is a supplier-specific parser, not a generic foodservice invoice parser.
- The parser currently targets the known `1354283` invoice layout.
- Brand values are kept in review notes because there is no dedicated purchase document line brand field yet.
- Fuel Levy is excluded rather than modelled as a non-stock charge in this first parser version.
- Future Del-Re layouts may still fall through to unknown-parser diagnostics.

## How To Test

1. Open uploaded purchase document `TAX INVOICE - 1354283.pdf`.
2. Click `Extract invoice data`.
3. Confirm extraction succeeds.
4. Confirm supplier identity and invoice metadata populate.
5. Confirm 9 ingredient lines are created.
6. Confirm internal item names are editable suggestions.
7. Confirm UOM values are preserved as `EA` and `CTN`.
8. Confirm no Fuel Levy, total, GST, bank, customer, delivery or page lines are created.
9. Re-run extraction and confirm duplicate lines are not created.
10. Review and save the document before using the generic commit action.

## No Auto-Commit Rule

This parser is extraction/review only. It prepares data for reviewer correction and the generic commit action, but it does not create trusted supplier, item, price or stock records by itself.
