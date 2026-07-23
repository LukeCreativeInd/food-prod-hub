# Multi-Supplier Parser Registry and Unknown Invoice Diagnostics

## Status

The Purchase Document extraction prototype now has a parser registry and unknown-invoice diagnostics.

Step 101 moves the visible workspace into the new Tools module as Supplier Invoice Intake. Parser keys, routes and extraction behaviour are unchanged.

This step does not add a second supplier parser, external OCR, AI extraction, generic all-supplier invoice parsing, auto-commit, stock movements, purchase orders, Goods Inwards, Xero integration, Platform Admin changes, RLS changes, service-role usage or demo-user Purchase Document access.

## Why This Exists

Clean Eats needs to upload more supplier invoices while staff gather recipe and procedure data.

The first working extraction path supports Cammaroto Poultry. The next supplier parsers should be added one at a time through a clear adapter model instead of embedding supplier-specific logic directly into the extraction flow.

## Parser Adapter Pattern

Purchase document parsers now follow a small adapter structure:

```text
key
label
supplier hint
detect(context)
parse(context)
```

Detection returns:

- matched / not matched
- score
- matched anchors
- reason

Parsing remains review-first. A parser can create draft review metadata and `purchase_document_lines`, but it must not commit supplier, item, price or stock records.

## Current Registered Parser

Current parser registry:

- `cammaroto_poultry` - Cammaroto Poultry
- `melbourne_produce_merchants` - Melbourne Produce Merchants
- `del_re_national_food_group` - Del-Re National Food Group
- `pacific_meat_sales` - Pacific Meat Sales
- `alba_cheese` - Alba Cheese
- `grange_meat_co` - Grange Meat Co
- `il_nonno` - Il Nonno

The Cammaroto parser still supports the uploaded invoice with shifted-font embedded PDF text. It remains supplier-specific and intentionally narrow.

Step 091 adds the Melbourne Produce Merchants parser for known Fresho invoices including `F56088214` and repeat invoice `F56478121`; see [Melbourne Produce Merchants Parser](91-melbourne-produce-parser.md). It is also supplier-specific and review-first. Its fallback can use a Fresho filename plus a known Melbourne Produce invoice number when embedded PDF text is glyph-encoded and has no readable anchors.

Step 093 adds the Del-Re National Food Group parser for known invoice `1354283`; see [Del-Re National Food Group Parser](93-del-re-parser.md). It is also supplier-specific, review-first and excludes Fuel Levy from item-line extraction.

Step 097 adds the Pacific Meat Sales parser for known invoice `928733`; see [Pacific Meat Sales Parser](97-pacific-meats-parser.md). The uploaded Pacific PDF has no usable embedded text, so this parser includes a narrow filename/invoice-number fallback until OCR is planned.

Step 098 adds the Alba Cheese parser for known invoice `SO148136`; see [Alba Cheese Parser](98-alba-cheese-parser.md). It is supplier-specific, review-first and preserves the supplier unit `Box` without automatic pack conversion.

Step 099 adds the Grange Meat Co parser for known invoice `349708`; see [Grange Meat Co Parser](99-grange-meat-parser.md). It is supplier-specific, review-first and treats delivery/comment lines as informational/ignored so only the lamb line becomes ingredient data.

Step 100 adds the Il Nonno parser for known invoice `INV-6136`; see [Il Nonno Parser](100-il-nonno-parser.md). It is supplier-specific, review-first and imports only the tax invoice product line so the delivery note page does not duplicate the item.

## Candidate Text Flow

Extraction builds text candidates before parser detection:

- raw embedded PDF text
- shifted-font decoded text where the PDF glyph encoding requires it
- narrow filename/invoice-number fallback for explicitly supported no-text PDFs

Parsers run detection against the selected best candidate. The best parser match is chosen by score.

## Unknown Invoice Diagnostic Flow

When no parser matches:

- no `purchase_document_lines` are created
- no supplier records are created
- no supplier item records are created
- no internal item records are created
- no price records are created
- no stock records are created
- the document returns to `uploaded`
- the review page shows a parser-needed message

When a PDF has no usable embedded text and no supported filename fallback:

- no parser runs from OCR
- no `purchase_document_lines` are created
- no supplier, item, price or stock records are created
- the document returns to `uploaded`
- the review page explains that OCR is not connected yet

Diagnostics include:

- extracted text length
- best candidate type
- best candidate score
- matched anchors
- parser candidates checked
- safe extracted text preview

Diagnostics do not include signed URLs, service-role keys or secrets.

## UI Behaviour

On `/purchase-documents/[id]`, an unknown parser result shows:

- Parser needed
- Source file saved
- No lines created
- No supplier/item/price records created
- diagnostic panel for authorised review users

The diagnostic panel is visible to users with `purchase_documents.review`, including platform admins. The Phase 1 demo user remains blocked from Purchase Documents.

## How To Add The Next Supplier Parser

Recommended next supplier parser steps:

1. Upload a representative invoice.
2. Run extraction.
3. Use the unknown-parser diagnostic text preview and matched anchors.
4. Add a new parser adapter with a stable `key` and label.
5. Implement narrow detection anchors for that supplier.
6. Implement review-first parsing into editable metadata and line values.
7. Keep commit separate and explicit.
8. Test repeated extraction does not duplicate lines.

Do not add broad generic invoice parsing until multiple supplier-specific adapters have shown the common patterns.

## Security Notes

The extraction flow:

- requires authenticated app access
- requires `purchase_documents.review`
- uses the authenticated Supabase server client
- reads private tenant-scoped Storage paths
- does not use service-role keys
- does not make the bucket public
- does not expose signed URLs in diagnostics
- does not grant demo-user access

## Limitations

- Only Cammaroto Poultry, Melbourne Produce Merchants, Del-Re National Food Group, Pacific Meat Sales, Alba Cheese, Grange Meat Co and Il Nonno have supplier-specific parsers today.
- Scanned PDFs still require future OCR/provider planning.
- Unknown diagnostics are for parser development and review, not a substitute for a parser.
- Unknown invoices do not create review lines until a supplier parser is added.
- The shifted-font decoder is still a narrow helper for known embedded-text PDF behaviour.

## Next Recommended Task

Add the next known supplier parser from a real uploaded invoice using the diagnostic output, or collect two to three unsupported supplier examples before choosing the next adapter.
