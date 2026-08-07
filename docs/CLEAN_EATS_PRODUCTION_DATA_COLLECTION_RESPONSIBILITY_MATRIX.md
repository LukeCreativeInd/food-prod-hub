# Clean Eats Production Data Collection Responsibility Matrix

## Assignment Rule

Roles are authoritative; named people appear only where their role is known and still require assignment to the relevant dataset. `Clean Eats to nominate` is intentional and blocks final sign-off when the owner is required.

| Dataset | Operational owner role | Proposed Clean Eats owner if known | Reviewer role | QA involvement? | Warehouse involvement? | Final approver | Expected evidence | Escalation path | Unresolved owner? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Item Register | Product composition owner | Clean Eats to nominate | Product master reviewer | No by default | Eddie where material identity needs warehouse confirmation | Final operational approver; Tony as approval sponsor where assigned | Current item list, labels, existing EveryBatch match | Product owner -> Director/operational owner | Yes |
| Ingredient identity/UOM | Product composition owner | Clean Eats to nominate | Product master/UOM reviewer | No | Eddie where receiving/stock UOM evidence is relevant | Final operational approver | Current specification, supplier/manufacturer document, EveryBatch record | Product owner -> Warehouse -> approver | Yes |
| Packaging identity/context | Product/Production owner | Clean Eats to nominate | Warehouse/material reviewer | No by default | Eddie where nominated | Final operational approver | Current pack specification, labels, floor evidence | Product/Production owner -> Warehouse -> approver | Yes |
| Component identity | Product composition owner | Clean Eats to nominate | Product formula reviewer | No | No by default | Final operational approver | Current product list and Formula evidence | Product owner -> approver | Yes |
| Finished Product identity | Product composition owner | Clean Eats to nominate | Product master reviewer | No | No by default | Final operational approver | Current active range evidence | Product owner; Rob consulted only if wholesale-specific | Yes |
| Formula Header | Product composition owner | Clean Eats to nominate | Product formula reviewer | No | No by default | Final operational approver | Current controlled Formula source and staff confirmation | Product owner -> approver | Yes |
| Formula Lines | Product composition owner | Clean Eats to nominate | Product formula/UOM reviewer | No | Packaging review where relevant | Final operational approver | Current composition evidence | Product owner -> material reviewer -> approver | Yes |
| Nominal Output | Product composition owner | Clean Eats to nominate | Product formula reviewer | No | No | Final operational approver | Current composition basis and UOM | Product owner -> approver | Yes |
| Nested Component links | Product composition owner | Clean Eats to nominate | Product formula reviewer | No | No | Final operational approver | Approved Component identity/Formula evidence | Product owner -> approver | Yes |
| Method Header | Production process owner | Clean Eats to nominate | Production method reviewer | QA if method carries QA links | No by default | Final operational approver | Current floor process and controlled procedure | Production owner -> approver | Yes |
| Method Steps | Production process owner | Clean Eats to nominate | Kitchen/room leader; Clean Eats to nominate | QA for check-linked steps | Equipment/material reviewers as needed | Final operational approver | Current observed process and procedure | Process owner -> QA/material reviewer -> approver | Yes |
| Work Instructions | Production process owner | Clean Eats to nominate | Kitchen/room leader; Clean Eats to nominate | QA for safety/check content where relevant | No by default | Final operational approver | Current operator guidance and approved attachments | Process owner -> QA if relevant -> approver | Yes |
| Production Areas | Production process/facility owner | Clean Eats to nominate | Facility/configuration reviewer | No | Eddie only where warehouse area relevance exists | Final operational approver | Current area register and EveryBatch match | Facility owner -> approver | Yes |
| Batch Envelope | Production process owner | Clean Eats to nominate | Production method/equipment reviewer | No by default | No by default | Final operational approver | Current equipment/process constraint evidence | Process owner -> equipment reviewer -> approver | Yes |
| Yield/Loss | Production process owner | Clean Eats to nominate | Production method reviewer | QA where measurement/check controls apply | No | Final operational approver | Current measured/controlled evidence; legacy only as comparison | Process owner -> QA if relevant -> approver | Yes |
| Water/processing input | Joint Product and Production owners | Clean Eats to nominate | Product formula and method reviewers | QA where food-safety classification applies | No by default | Final operational approver | Current physical-use evidence | Product + Production owners -> QA -> approver | Yes |
| QA Links | Production process owner | Clean Eats to nominate | QA reviewer | Cettina or Luisa where nominated | No | Final operational approver after QA review | Existing QA definition or documented unresolved need | Production owner -> QA -> approver | Partly |
| Equipment/resources | Production process/facility owner | Clean Eats to nominate | Equipment/facility reviewer | QA where calibration/check relevance exists | No by default | Final operational approver | Current equipment register/capacity evidence | Facility owner -> QA if relevant -> approver | Yes |
| Wholesale applicability | Relevant Product/Production owner | Clean Eats to nominate | Wholesale reviewer | As underlying dataset requires | As underlying dataset requires | Final operational approver | Current wholesale product/process evidence | Owner -> Rob where nominated -> approver | Yes |
| Ambiguity/question | Owner of suspected domain | Clean Eats to nominate per question | Assigned domain reviewer | If QA is implicated | If material/warehouse implicated | Final operational approver for resolved value | Raw source plus all competing evidence | Domain reviewer -> Director/operational owner | Yes until assigned |
| Package sign-off | Final operational owner | Tony as known Director/operational owner, assignment to be confirmed | Product, Production and QA domain reviewers | Yes for QA scope | Yes for material scope | Authorised final approver | Completeness report and accepted warnings | Luke + Clean Eats operational owner | Yes until confirmed |

## Known Roles

- Tony: Director / operational owner.
- Cettina and Luisa: QA.
- Eddie: Warehousing.
- Rob: Wholesale.
- Product composition owner, Production process owner and kitchen/room leaders/operators: **Clean Eats to nominate**.

This matrix creates no HR record, permission or database role.
