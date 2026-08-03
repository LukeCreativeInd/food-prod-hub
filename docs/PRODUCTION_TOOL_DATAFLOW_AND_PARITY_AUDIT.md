# Production Tool Dataflow And Parity Audit

## Audit Boundary

Task 224 traced one matched production day through three raw Zapiet exports, two cleanup outputs and the generated 22-page Production Report. Findings are evidence of current behaviour, not approval of legacy values as EveryBatch master data.

## Current Chain

```text
Shopify storefront orders
-> Zapiet eligibility/date selection and staff filtering
-> three already-filtered production exports
-> Streamlit cleanup tool
-> combined Clean Eats workbook + Made Active workbook
-> manual Production Report uploads and quantity review
-> fixed meal/filter/calculation modules
-> PDF + paired CSV saved through GitHub API
-> printed/distributed room packs
```

The cleanup source is `LEG-CLEANUP-SRC-001`; the report source is `LEG-REPORT-SRC-001`. Exact deployment host and current operator ownership were not verified.

## Raw Schema And Provenance

All three CSVs contain only:

`Quantity`, `Product name`, `Variant name`, `Item properties`, `Product Id`, `Variant Id`.

They do not contain source store, order ID, order-line ID, order reference/prefix, SKU, delivery date, production date, postcode, state, region, zone, courier, service, order status, edit/cancellation/refund state, price or discount. Therefore the files cannot independently reconstruct the Zapiet filter, delivery promise, order lifecycle or source-line trace.

`Product Id` and `Variant Id` survive the export but both legacy tools ignore them. Matching and exclusion are exact product-title operations. Variant names and item properties are also ignored by cleanup calculations.

## Store Identification

- `FIX-MADE-RAW-001` is identified as Made Active with high confidence from its Made-specific aliases, bundle form and exact reconciliation through the Made mapping table (`made_active.py:5-28`). No explicit store column survives.
- `FIX-CE-RAW-A-001` and `FIX-CE-RAW-B-001` are the two Clean Eats exports and reconcile exactly when combined. Their exact CEA versus CEW assignment cannot be verified from retained data. File A's aggregated plain lines look wholesale-like and file B's consumer bundle metadata looks retail-like, but this remains architecturally inferred.
- Cleanup merges both Clean Eats sources before output (`app.py:57-86`), so store attribution is intentionally lost.
- Made Active remains a separate report brand column. Elite support exists in source only; no Elite fixture was supplied and Elite is not an active future connector requirement.

## Bundle And Line Handling

`FIX-MADE-RAW-001` contains child-line `_sb_bundle_*` metadata and separate parent rows for a 20-pack and a seven-pack. `FIX-CE-RAW-B-001` contains `_rc_bundle`, `_rc_bundle_parent`, contents and bundle identifiers, plus parent products for configurable or named packs. No subscription-specific key was found.

Current cleanup does not parse those properties:

- Clean Eats concatenates files, keeps only the fixed 26 exact titles, groups them and fills missing titles with zero (`clean_eats.py:7-14`). This removes the three observed Clean parent titles after child meal rows have already contributed.
- Made Active maps four aliases, groups every title and retains unknown extras (`made_active.py:5-28`). Its cleaned workbook therefore still contains two pack parents.
- Production Report accepts only its fixed 26 titles (`app.py:136-144,420-451`), removing those Made extras at the next stage.

Quantity is summed unchanged. No parent contents are expanded. Correctness therefore depends on Zapiet already exporting child meal contributions and on parent titles remaining outside the allowlist. Unknown production titles can be silently dropped; renamed products can produce zero demand; changed bundle behaviour can double-count or omit demand.

The exports have no price/order-state columns, so free-item contribution and refunds/cancellations cannot be audited.

## Raw-To-Cleaned Reconciliation

| Source | Raw rows | Raw quantity | Transformation | Removed/ignored | Cleaned rows | Cleaned quantity |
| --- | ---: | ---: | --- | ---: | ---: | ---: |
| `FIX-CE-RAW-A-001` + `FIX-CE-RAW-B-001` | 124 | 3,483 | Concatenate; exact fixed-title filter; exact-title group/sum | 10 known parent-pack units | 26 fixed rows, 23 non-zero | 3,473 |
| `FIX-MADE-RAW-001` | 27 | 143 | Four title aliases; exact-title group/sum; append extras | 0 at cleanup stage | 28 rows, including two extras | 143 |

Both workbook outputs match the source implementation exactly with zero variance.

### Representative Source-To-Contribution Trace

`P/V` records the retained source product ID and variant ID. The two Clean Eats files cannot be assigned definitively to CEA or CEW, so the trace preserves their evidence labels rather than inventing store identity.

| Source | P/V | Source title | Raw qty | Classification | Cleanup name | Cleaned contribution | Report contribution | Difference / reason |
| --- | --- | --- | ---: | --- | --- | ---: | ---: | --- |
| Clean raw A, exact store unresolved | `7968008110137/44702776819769` | Beef Burrito Bowl | 145 | Production child/line | Beef Burrito Bowl | 145 | 145 | 0 |
| Clean raw B, exact store unresolved | `8272106193119/44733945479391` | Beef Burrito Bowl | 51 | Production child/line | Beef Burrito Bowl | 51 | 51 | 0 |
| Clean raw B, exact store unresolved | `8805737234655/46322306351327` | Make Your Own Mega Pack | 8 | Bundle parent | Not accepted | 0 | 0 | -8; exact title outside allowlist |
| Clean raw B, exact store unresolved | `8742272631007/46144907116767` | FEED ME BEEF | 1 | Bundle parent | Not accepted | 0 | 0 | -1; exact title outside allowlist |
| Clean raw B, exact store unresolved | `8742277349599/46144919929055` | GIVE ME CHICKEN | 1 | Bundle parent | Not accepted | 0 | 0 | -1; exact title outside allowlist |
| Made Active | `8642024734949/45216506839269` | Butter Chicken with Basmati Rice | 12 | Production child/line | Butter Chicken | 12 | 12 | 0; explicit alias |
| Made Active | `8891709063397/45968205447397` | Chicken with Broccoli & Beans | 4 | Production child/line | Chicken with Vegetables | 4 | 4 | 0; explicit alias |
| Made Active | `9353935945957/48043270799589` | 20 Pack | 1 | Bundle parent | 20 Pack extra | 1 | 0 | -1; retained by cleanup, rejected by report fixed list |
| Made Active | `9475815276773/48469867856101` | Choose Your 7 Pack | 1 | Bundle parent | Choose Your 7 Pack extra | 1 | 0 | -1; retained by cleanup, rejected by report fixed list |

The complete accepted 26-meal contribution is recorded below. Order and order-line identifiers are absent, so traceability cannot be extended below source product/variant identity for this fixture.

## Cleaned-To-PDF Reconciliation

| Stage | Clean Eats | Made Active | Already Made | Final |
| --- | ---: | ---: | ---: | ---: |
| Cleaned workbook totals | 3,473 | 143 | n/a | 3,616 before report filtering |
| Report-recognised totals | 3,473 | 141 | 0 | 3,614 |
| Generated PDF totals, pages 1-2 | 3,473 | 141 | 0 | 3,614 |

The two-unit Made difference is fully explained by `20 Pack` and `Choose Your 7 Pack`, which survive Made cleanup but are absent from the Production Report's fixed meal list. Total raw quantity is 3,626; total report quantity is 3,614; all 12 ignored units are known parent/non-production pack rows. No unresolved quantity variance remains for this fixture.

`Already Made` is a manually editable report field initialised to zero. Total is `(sum of uploaded brand columns - Already Made).clip(lower=0)` (`app.py:420-451`). It is not backed by a stock, production-completion or demand-adjustment record.

## Accepted Meal Contributions

| Production meal | Clean Eats | Made Active | Final |
| --- | ---: | ---: | ---: |
| Spaghetti Bolognese | 167 | 13 | 180 |
| Beef Chow Mein | 117 | 4 | 121 |
| Shepherd's Pie | 139 | 0 | 139 |
| Beef Burrito Bowl | 196 | 9 | 205 |
| Beef Meatballs | 169 | 4 | 173 |
| Lebanese Beef Stew | 107 | 0 | 107 |
| Mongolian Beef | 207 | 6 | 213 |
| Chicken with Vegetables | 40 | 4 | 44 |
| Chicken with Sweet Potato and Beans | 103 | 0 | 103 |
| Naked Chicken Parma | 295 | 14 | 309 |
| Chicken Pesto Pasta | 209 | 16 | 225 |
| Chicken and Broccoli Pasta | 140 | 0 | 140 |
| Butter Chicken | 244 | 12 | 256 |
| Thai Green Chicken Curry | 204 | 10 | 214 |
| Moroccan Chicken | 75 | 0 | 75 |
| Steak with Mushroom Sauce | 241 | 4 | 245 |
| Creamy Chicken & Mushroom Gnocchi | 158 | 0 | 158 |
| Roasted Lemon Chicken & Potatoes | 115 | 8 | 123 |
| Beef Lasagna | 285 | 16 | 301 |
| Bean Nachos with Rice | 0 | 0 | 0 |
| Lamb Souvlaki | 157 | 14 | 171 |
| Chicken Fajita Bowl | 95 | 7 | 102 |
| Steak On Its Own | 0 | 0 | 0 |
| Chicken On Its Own | 0 | 0 | 0 |
| Family Mac and 3 Cheese Pasta Bake | 2 | 0 | 2 |
| Baked Family Lasagna | 8 | 0 | 8 |

The row-level trace ends at source product/variant identity because order and order-line references are absent. A future parser fixture should retain every raw source line and derive classification, mapping and contribution without discarding source evidence.

## Delivery And Production Calendar

No supplied CSV/workbook retains delivery or production date. The PDF retains only the manually selected production date, 3 August 2026. The report cannot prove which delivery dates, states, zones, services or stores were included.

Luke-confirmed examples remain staff/context evidence, not global constants:

- Monday production includes Tuesday VIC deliveries.
- Tuesday production can combine Wednesday/Thursday VIC, Thursday/Friday NSW and Thursday/Friday QLD deliveries.
- Thursday production can combine Friday/Saturday VIC and Monday NSW deliveries.

The current matched exports therefore appear to have been filtered upstream in Zapiet or by staff. Exact cutoff, public-holiday, blackout, courier-change, wholesale/residential and late-order handling remain unknown. Future effective-dated configuration must preserve connection/store, source order/line, delivery date, zone/region, service, production date, facility and rule/version evidence.

## Production Report Calculation And Output

The report source:

- accepts separate Clean Eats, Made Active and Elite summary uploads (`app.py:375-416`);
- allows manual production date, four bulk-prepared toggles and editable quantities (`app.py:387-460`);
- filters again to 26 fixed titles;
- calculates downstream bulk, meal raw ingredient, pre-pack and meat/veg requirements from hard-coded Python dictionaries;
- rounds calculated displayed totals upward (`utils.py:3-45`);
- generates a PDF and paired CSV, writes report history through the GitHub Contents API and can build weekly summary PDFs (`app.py:146-225,563-913`).

This history/weekly capability was not captured in the earlier inventory and must be considered during retirement planning. It is still not a source-order or execution audit trail.

## PDF Structure

| Pages | Section | Copies | Current purpose | Likely EveryBatch owner/view |
| --- | --- | ---: | --- | --- |
| 1-2 | Meal Production Summary and use-by dates | 2 | Global demand/control summary | Production Admin plus controlled printable fallback |
| 3-8 | Bulk Raw Ingredients to Cook | 3 | Bulk preparation requirements | Bulk Production/Kitchen tasks; optional area pack |
| 9-16 | Meal Raw Ingredients to Cook | 2 | Meal-level ingredient/batch tables | Kitchen/Production tasks and approved formula/method source |
| 17-19 | Pre-Pack Room | 1 | Sauces, mixes, ready ingredients and cooked quantity checks | Prepack area tasks plus linked QA where validated |
| 20-22 | Meat Order and Veg Prep | 3 | Meat and vegetable preparation requirements | Warehouse/Store and Meat/Veg Prep tasks |

Every page repeats the report title, production date/copy position and static HACCP form/issue/prepared/approved header. The PDF has no captured signatures, task start/complete evidence, measured result fields, lot allocation, hold-aware availability, shortage, actual usage, output or operator identity.

## Failure And Traceability Gaps

- Missing/malformed upload columns produce UI errors; unknown titles do not produce an exception queue.
- GitHub read/write methods generally reduce failures to boolean warnings; no durable retry/idempotency ledger is visible.
- Manual edits and `Already Made` values are saved only in output CSV/PDF, not linked to source orders or authorised adjustment records.
- Changing a fixed title, hard-coded quantity or source module changes future output without versioned formula/method evidence.
- Generated history can be deleted through the tool.
- No raw-to-summary lineage, freeze/delta model or post-freeze change record exists.

## Parity Conclusion

The supplied day provides a valid golden fixture for raw parsing, current title-based normalisation, aggregation and PDF summary/section comparison. It is not sufficient to approve legacy formulas, scheduling rules, methods, Work Instructions, room ownership or decommission. Those require current approved data, more exception fixtures, parallel runs and staff validation.
