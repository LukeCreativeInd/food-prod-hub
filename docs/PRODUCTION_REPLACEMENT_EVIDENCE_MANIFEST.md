# Production Replacement Evidence Manifest

## Scope And Handling

This manifest records the read-only evidence inspected for Task 224. Raw evidence remains in Luke's machine-specific Downloads folder and was not copied into EveryBatch. Temporary extraction occurred under `/private/tmp/everybatch-task224.XelkG1`, outside the repository.

Privacy scan result: the three CSVs, two workbooks and matched PDF contain production-product and quantity data. No customer name, email, phone, street-address, payment or delivery-instruction fields were present. The fixtures are classified customer-derived privacy-safe/internal operational. Source code references the secret name `GITHUB_TOKEN`, but no secret value was present or recorded.

## Evidence Register

| ID | Source / original filename | Store or role | Size | Count | SHA-256 | Privacy | Status and limitations |
| --- | --- | --- | ---: | ---: | --- | --- | --- |
| `LEG-CLEANUP-SRC-001` | `zapiet-report-cleanup-main.zip` | Cleanup/aggregation source | 6,218 bytes | 304 Python lines plus 4 requirement lines | `86f42a28061123ec4ef715e380667c58fc3a0d47643ddc445f4b11d22d74c4be` | Internal operational | ZIP integrity passed; fully inspected. Not a Git repository. Archive comment `40a3280eebd0f59fbefe05a2911dd59ebe0c9ad5` resembles a source snapshot identifier but is not independently verified Git history. |
| `LEG-REPORT-SRC-001` | `daily-producton-report-main.zip` | Production Report source and retained report history | 6,767,667 bytes | 2,505 Python lines, 5 requirement lines, 493 archived report/data files | `d8f7f31be7a9b7125044e3c474ce53edd722f3d4c05a4635f717bc7f94bb752f` | Internal operational | ZIP integrity passed; fully inspected for business logic. Not a Git repository. Archive comment `5aca4a5ab44f37fc7d3ad779776548b5b4f5a9b4` is not independently verified Git history. Archived generated reports are historical evidence, not canonical data. |
| `FIX-MADE-RAW-001` | `zapiet-production-report-76a32e64-f7ec-4d8c-ac73-eac5375b2fe7.csv` | Made Active, high-confidence product/mapping evidence | 4,467 bytes | 27 data rows | `8d52a01db04b485c6ddd70ba903d706937fd612b438dcaa46ec98d30d5120896` | Customer-derived privacy-safe | Inspected. No order/store/date columns. Store identification is supported by Made-specific titles and exact matched-output reconciliation, but not by retained store metadata. |
| `FIX-CE-RAW-A-001` | `zapiet-production-report-e3028fc4-5f74-4ebb-8303-a0367ff1ab3c.csv` | One of CEA/CEW; exact store unresolved | 1,750 bytes | 23 data rows | `d93c985cd326de982341f1a7608e26b6dc0f0ad4f9def13710cdc254adce05dc` | Customer-derived privacy-safe | Inspected. No item properties and no store/order/date identifiers. The high aggregated quantities suggest wholesale, but that is an inference and is not accepted as verified identity. |
| `FIX-CE-RAW-B-001` | `zapiet-production-report-ea142ff8-3c0a-4a07-b7a8-fefa06711bcb.csv` | The other CEA/CEW store; exact store unresolved | 12,990 bytes | 101 data rows | `56ae7a489a9b27394c2631840d6ac5c82db9f8871d5c88e863a2e3a41a9db18d` | Customer-derived privacy-safe | Inspected. Bundle metadata strongly suggests consumer bundle ordering, but no retained field proves CEA versus CEW. |
| `FIX-CE-CLEAN-001` | `product_quantity_summary (5) 7.56.20 am.xlsx` | Combined Clean Eats output | 5,958 bytes | `Summary`: 26 data rows | `64f149d8b0d8e04780bccb0bd7ba14df7f812d89c5c291b8714506006726a4e2` | Customer-derived privacy-safe | Inspected and exactly reconciled to the two Clean Eats raw files under current cleanup logic. CEA/CEW attribution is already merged. |
| `FIX-MADE-CLEAN-001` | `product_quantity_summary (6) 7.56.20 am.xlsx` | Made Active output | 5,964 bytes | `Summary`: 28 data rows | `b64b25e3d3965e4046ec044a85f756d252240d47f71a0ffae377c5d4cacf634c` | Customer-derived privacy-safe | Inspected and exactly reconciled. It totals 143 because two pack-parent rows remain as extras; the report later filters them out. |
| `FIX-PDF-001` | `daily_production_report_2026-08-03_04-23-05.pdf` | Matched generated Production Report | 51,690 bytes | 22 pages | `37494359352e4022da5d23edbff3723fe15d9d955f73fe23a36754a53b6e83ed` | Internal operational | Text and rendered pages inspected. Production date, 26 summary rows, totals, five section types and copy counts verified. |

Machine-specific source paths are under `/Users/cealukemichalowsky/Downloads/`. These paths are locators, not repository dependencies.

## Business-Significant Source Hashes

Neither archive contains `.git`, so branch, status and commit cannot be verified. The inspected business files are independently fingerprinted below.

| Evidence | Relative file | Lines | SHA-256 |
| --- | --- | ---: | --- |
| `LEG-CLEANUP-SRC-001` | `app.py` | 124 | `c5dc326bea3633ade3716a3b7ecc535df26c7cfeed3a9f5d228f44198a425c45` |
| `LEG-CLEANUP-SRC-001` | `clean_eats.py` | 29 | `912d0fde9bc1c51f87de315320dce0511eb18cea02c1a79b00de7fbd5cb1be29` |
| `LEG-CLEANUP-SRC-001` | `made_active.py` | 44 | `b3bd4fb9e7614e1bff2c6b59d82c4b95281f0f5b3b8eace018bd0b72a25a2fe1` |
| `LEG-CLEANUP-SRC-001` | `elite_meals.py` | 107 | `87c4916ddfcc04b16ccabc707e5ab6753c0f0154ea24805641b5517b17605f5f` |
| `LEG-REPORT-SRC-001` | `app.py` | 913 | `081a5826056f2c9bcbc65ded47e3b1593f5da246efcdce30cf47c0b8cdc945ca` |
| `LEG-REPORT-SRC-001` | `bulk_section.py` | 267 | `57344e57b2e5804eed957c17edd9e2fc5bc48e7db0c2d87167dea08b8bd7fff5` |
| `LEG-REPORT-SRC-001` | `recipes_section.py` | 241 | `71a9f777089900785beecd9f322999ce26a458dbb526cea0b6b0593359b8c0e4` |
| `LEG-REPORT-SRC-001` | `prepack_room_section.py` | 523 | `289969eaaea29c246d239fb09cc54236f6e8aa012e79709a38583da37201a62c` |
| `LEG-REPORT-SRC-001` | `meat_veg_section.py` | 233 | `039e14a16397644d48dfac5edad71421f922bccd95e9fc686fe4995314d592c4` |
| `LEG-REPORT-SRC-001` | `utils.py` | 45 | `b440f465d93699845f2f88d81cdc30bbb20632d2bed12347ec57900a2ce93027` |
| `LEG-REPORT-SRC-001` | `chicken_mixing_section.py` | 85 | `503223349b327643f502149d9544bb568bdc938a2808d1f9a8c254938d5eb6c2` |
| `LEG-REPORT-SRC-001` | `fridge_section.py` | 125 | `24a24f7bc307d8530955aceec3e3afc8caca82cb3b5b5a59c47c3296d3caa295` |
| `LEG-REPORT-SRC-001` | `sauces_section.py` | 73 | `f2ba7771641ad4ce5157e90e8658d2fef5a16849740b747560d3da00160e40e3` |

The last three report modules are not imported by the current `app.py`; their conflicting values are classified as possible obsolete residue, not active behaviour.

## Integrity Conclusion

All eight requested attachments were accessible and structurally valid. Both archives passed ZIP integrity checks. No attachment was modified. No evidence was copied into EveryBatch. The evidence set is sufficient for one matched-day transformation audit and source-rule inventory, but not for final CEA/CEW identity, production-calendar automation, approved formula migration or full legacy retirement.
