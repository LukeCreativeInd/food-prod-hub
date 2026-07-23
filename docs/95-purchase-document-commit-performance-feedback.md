# Purchase Document Commit Performance Feedback

## Problem Solved

Committing larger reviewed purchase documents can take around 20-30 seconds while supplier, item, mapping and price records are checked or created.

The commit duration is acceptable for early development, but the user needs clear feedback so the app does not feel frozen and accidental double submits are avoided.

## Commit Loading UX

The review page now uses a focused commit action panel.

When `Commit reviewed records` is clicked:

- the button immediately changes to `Committing records...`
- the commit button is disabled
- the save button is disabled
- a message explains that larger invoices can take 20-30 seconds
- a staged static checklist is shown:
  - Checking supplier
  - Checking supplier items
  - Checking internal items
  - Creating mappings
  - Recording price observations
  - Updating approved prices
  - Finalising document

This is explanatory progress messaging only. It does not use websockets, polling or live server progress.

## Double-Submit Prevention

Both save and commit controls are disabled while any review form submission is pending.

This reduces accidental duplicate clicks while preserving the existing idempotent server-side commit behaviour.

## Success And Error Feedback

Successful commit redirects back to the review page with the commit status and safe elapsed duration when available.

Unexpected commit errors redirect with a clear safe error message explaining:

- the commit failed before completion
- review data remains available
- no stock movements were created
- supplier bank/payment details were not changed
- the user should check logs before repeatedly retrying

## Development Timing Logs

The generic commit helper now logs development-only timing diagnostics when `NODE_ENV !== 'production'`.

Logged stages include:

- auth/context
- load document and lines
- validation
- supplier find/create
- supplier aliases find/create
- per-line supplier item
- per-line internal item
- per-line mapping
- per-line price observation
- per-line approved price where applicable
- ignored/informational rules
- line status updates
- final document status update
- total commit duration

Logs do not include signed URLs, secrets, service-role keys, bank details or supplier payment details.

## Low-Risk Performance Improvements

This step does not rewrite the commit flow.

The main low-risk improvement is better user feedback and diagnostic visibility. The ordered find-or-create commit logic remains unchanged so existing idempotency behaviour is preserved.

## Known Limitations

- Progress steps are static explanatory messages, not live progress from the server.
- The commit flow is still ordered application writes rather than one database transaction.
- Larger invoices may still take noticeable time.
- If an unexpected error occurs part-way through commit, idempotent retry behaviour is relied on until a transaction/RPC hardening step exists.

## Future RPC / Transaction Recommendation

A later task should move the generic commit flow into a reviewed database RPC/transaction for:

- stronger atomicity
- fewer round trips
- better performance
- cleaner rollback handling
- more precise live progress or final summary data

## Non-Goals

This step does not add:

- parser changes
- OCR
- AI extraction
- migrations
- RLS changes
- permissions changes
- Platform Admin changes
- stock movements
- purchase orders
- Goods Inwards receiving
- supplier payment/bank updates
- Xero/accounting sync
- demo-user Purchase Document access
