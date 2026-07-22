# Multi-Supplier Parser Registry and Unknown Invoice Diagnostics

## Status

The Purchase Document extraction prototype now has a parser registry and unknown-invoice diagnostics.

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

The Cammaroto parser still supports the uploaded invoice with shifted-font embedded PDF text. It remains supplier-specific and intentionally narrow.

## Candidate Text Flow

Extraction builds text candidates before parser detection:

- raw embedded PDF text
- shifted-font decoded text where the PDF glyph encoding requires it

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

- Only Cammaroto Poultry is registered today.
- Scanned PDFs still require future OCR/provider planning.
- Unknown diagnostics are for parser development and review, not a substitute for a parser.
- Unknown invoices do not create review lines until a supplier parser is added.
- The shifted-font decoder is still a narrow helper for known embedded-text PDF behaviour.

## Next Recommended Task

Add the next known supplier parser from a real uploaded invoice using the diagnostic output, or collect two to three unsupported supplier examples before choosing the next adapter.
