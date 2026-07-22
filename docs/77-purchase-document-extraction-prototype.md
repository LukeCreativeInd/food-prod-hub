# Purchase Document Extraction Prototype

## Status

This step adds the first controlled extraction prototype for uploaded purchase documents.

It does not add external OCR, AI extraction, a generic parser for all supplier layouts, generic commit automation, stock movements, purchase orders, Goods Inwards receiving, Xero, supplier payment/bank updates, Platform Admin changes or demo-user access.

## Purpose

Purchase Document Intake remains a bulk historical supplier invoice onboarding workflow.

Extraction should reduce manual keying by creating editable draft review data from uploaded source documents.

All extracted values remain reviewable before any commit action.

## Extraction Engine Scope

The prototype attempts embedded PDF text extraction only.

It uses a small internal parser based on Node.js built-in functionality. No package was added.

Supported now:

- uploaded PDFs with extractable embedded text
- first known supplier pattern: Cammaroto Poultry / Surefire Solutions Group Unit Trust
- second known supplier pattern: Melbourne Produce Merchants / Fresho invoice `F56088214`

Step 090 moves the Cammaroto parser into a registry/adapter model so future supplier parsers can be added one at a time. See [Multi-Supplier Parser Registry and Unknown Invoice Diagnostics](90-multi-supplier-parser-registry-diagnostics.md).

Not supported yet:

- image OCR
- scanned PDFs without embedded text
- broad supplier layout parsing
- AI/provider extraction

## Cammaroto Parser Behaviour

The first adapter detects known Cammaroto/Surefire invoice text and creates reviewed draft data for invoice `SI-00025954`.

The detector is tolerant of PDF extraction quirks:

- repeated whitespace is collapsed
- matching is case-insensitive
- compact matching handles line breaks or missing punctuation around values such as `SI-00025954` and `T/F-DCE M-VA`
- `DICEDMARINATED` is accepted as the source text appears on the invoice

The uploaded Cammaroto PDF uses embedded font-encoded text where extracted glyphs appear shifted, for example `6XUHILUH` instead of `Surefire` and `6,` instead of `SI-00025954`. The prototype now builds a temporary decoded candidate by shifting the relevant extracted glyph codes before parser recognition.

Candidate selection compares:

- raw extracted text
- decoded shifted-font text

The candidate with the strongest known Cammaroto anchors is used for recognition. This is still embedded PDF text decoding, not OCR.

If the Cammaroto invoice is recognised by supplier, invoice and line anchors but detailed line parsing is fragile, the prototype uses a narrow Cammaroto-specific fallback to create the known two review lines. This fallback is temporary and supplier-specific; it is not the final generic parser.

Extracted document fields:

- supplier legal name
- supplier trading name
- ABN
- account number
- invoice number
- invoice date
- invoice total
- tax total
- currency

Extracted lines:

- line 1 ingredient line for `T/F-DCE M-VA`
- line 2 informational `CTNS / CARTONS` line

Line 1 includes the temporary reviewed internal item marker:

```text
Internal item name: Chicken Thigh
```

The Review Import page exposes that value as an editable `Internal item name` field before commit.

## Review-First Output

Extraction creates only:

- updated `purchase_documents` source/metadata fields
- draft `purchase_document_lines`

Extraction does not create:

- suppliers
- supplier aliases
- supplier items
- internal items
- mappings
- price observations
- approved supplier prices
- ignored rules
- stock records

Commit remains explicit and separate.

Step 078 now enriches extracted Cammaroto lines with existing tenant supplier, supplier item, mapping, ignored-rule and approved-price data where available. See [Repeat Invoice and Price Change Behaviour](78-repeat-invoice-price-change-behaviour.md).

## Status Behaviour

Before extraction:

- uploaded documents are shown as `Uploaded / Extraction pending`

During extraction:

- document status is set to `processing`

Successful extraction:

- document status becomes `needs_review`
- draft review lines are created

Unsupported/no-text/unknown parser:

- document returns to `uploaded`
- no lines are created
- the review page shows a clear message
- unknown parser diagnostics show safe text previews and parser scores for authorised review users

Committed documents are not extracted again.

## Idempotency

Extraction will not duplicate lines.

If a document already has `purchase_document_lines`, extraction returns:

```text
Extraction has already created review lines for this document.
```

Future re-extraction can be planned as a separate reviewed action.

## Security

Extraction:

- requires authenticated app access
- requires `purchase_documents.review`
- loads the document only for the current organisation
- reads the private Storage object through the authenticated server Supabase client
- does not use service-role keys
- does not make the bucket public
- does not grant demo-user access
- does not read across tenants

## UI Changes

On `/purchase-documents/[id]`, uploaded documents with a source file and no lines show:

- source document preview/details
- `Extract invoice data` action
- loading label `Extracting...`

After extraction, the existing Review Import form displays editable supplier, invoice and line fields.

## Known Limitations

- Text extraction is intentionally minimal.
- Some PDFs may contain text in encodings this prototype cannot decode.
- Scanned PDFs and image uploads require future OCR/provider work.
- Only known supplier-specific parser patterns are implemented; this is not a generic invoice parser.
- Cammaroto remains a supplier-specific parser with a temporary fallback for the first uploaded sample invoice.
- Melbourne Produce Merchants is implemented as a second supplier-specific parser for a known Fresho invoice layout, with a temporary glyph-encoded fallback.
- The shifted-font decoder exists for the known uploaded Cammaroto PDF pattern and should not be treated as a generic PDF text engine.
- The generic commit engine remains future work.

## Next Recommended Task

Test the Cammaroto PDF extraction against real uploaded files, then decide whether to improve embedded PDF extraction, add a reviewed OCR provider plan, or add a second known supplier adapter.
