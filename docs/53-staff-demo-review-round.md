# Staff Demo Review Round

## Status Summary

Phase 3A demo-module foundation is complete.

The demo user has been created and tested. Staff can now review Phase 1 demo modules using sample data. No real Clean Eats data is connected yet.

Feedback from this round will guide real database tables, future workflows and controlled data imports.

## Demo User Access Confirmed

Demo user:

- Clean Eats Demo User
- `hello@cleaneatsaustralia.com.au`
- role: `phase_1_demo_user`
- access: `viewer`
- tenant: Clean Eats Australia

Visible modules:

- Dashboard
- Products
- Costings
- Production
- Inventory

Hidden modules:

- Admin
- QA
- Logistics
- CRM
- Reports

Confirmed access tests:

- Demo user login works.
- Phase 1 modules are visible.
- Hidden modules are not visible.
- Direct hidden/admin URLs go to no-access.
- Sign out works.
- Luke/platform_admin still sees all intended modules.

Do not include passwords in docs, messages or the repo.

## Purpose of Staff Demo

The purpose is not to check whether sample data is correct.

The purpose is to review:

- layout
- terminology
- fields/columns
- workflow flow
- missing must-have features
- what should be manager-only
- what should be staff-facing
- what should be iPad/facility-facing
- what should happen before real data and database tables are created

## What Staff Should Review

### Dashboard

Review questions:

- Does it explain the Phase 1 review clearly?
- Does the module flow make sense?
- Are next steps/data collection clear?

### Products

Areas:

- Suppliers
- Ingredients
- Packaging
- Components
- Recipes
- Finished Products

Questions:

- Are these the right areas?
- Are the terms correct?
- Are fields missing?
- What should be linked together?
- What should be manager-only?

### Costings

Areas:

- Ingredient Costs
- Packaging Costs
- Component Costs
- Meal Margins
- Price History

Questions:

- What costing information matters first?
- What alerts are needed?
- What cost status should be shown?
- What should trigger review?
- What margin information is useful?

### Production

Areas:

- Production Report
- Production Plan
- Production Areas
- Production Tasks
- Facility/iPad View

Questions:

- Does the report-to-task flow make sense?
- What does the production report need to include?
- What should staff see on iPad?
- What checks/weights/confirmations are must-have?
- What issues/waste need to be logged?

### Inventory

Areas:

- Goods Inwards
- Batch Receiving
- Stock Locations
- Stock Movements
- Purchasing
- BOM / Traceability

Questions:

- Does the receiving-to-traceability flow make sense?
- What batch details must be captured?
- What locations matter?
- What stock movements happen daily?
- What purchasing prompts are needed?
- What traceability is required?

## Feedback Format

For each page/module, ask staff:

- What looks good?
- What is confusing?
- What is missing?
- What is unnecessary?
- What wording should change?
- What fields are must-have?
- What should be manager-only?
- What should be iPad/facility-facing?
- What examples from daily work should we consider?

## Priority Rating

Use:

- Must have before real data
- Needed soon
- Nice to have later
- Not needed

This helps decide what gets built now versus later.

## CSV/Data Collection Reminder

Agreed CSV/data collection order:

1. Suppliers
2. Ingredients
3. Packaging
4. Components and Batch Recipes / Items
5. Recipes
6. Finished Products

Guidance:

- Collect first.
- Review/clean second.
- Model database third.
- Import/connect later.
- Staff should fill what they know and leave blanks/notes where unsure.
- Sample data in the HUB should not be treated as real data.

## Review Timeline

Suggested flexible timeline:

Day 1:

- Staff log in and click through Dashboard/Products.

Day 2:

- Staff review Costings and Production.

Day 3:

- Staff review Inventory and traceability/BOM concepts.

Following days:

- Staff continue CSV/data collection.
- Luke collects feedback.
- Next build step starts after enough feedback is captured.

## Luke's Feedback Capture Template

```text
Date:
Reviewer:
Modules reviewed:
Main feedback:
Terminology changes:
Fields to add:
Fields to remove:
Must-have features:
Manager-only items:
iPad/facility items:
Data files promised:
Questions still open:
Priority:
Next action:
```

## Things To Watch During Review

- Staff may focus on sample data accuracy; remind them it is fake/sample only.
- Avoid promising every feature immediately.
- Capture "must-have" versus "later".
- Watch for repeated terminology confusion.
- Watch for workflow gaps between Products, Production and Inventory.
- Pay attention to BOM/traceability and iPad needs.
- Note any user access concerns.

## What Happens After Review

After feedback:

- consolidate notes
- adjust UI terminology/screens where needed
- finalise Products/Inventory data model planning
- create real database tables with `organisation_id`
- add RLS for new tables
- start small controlled real-data import
- then connect UI to live data gradually

## Phase 3A Closure

This review round closes the Phase 3A demo foundation because:

- demo modules exist
- dashboard landing page exists
- demo role exists
- demo user access is tested
- staff can now review safely

## Recommended Next Step

Recommended next step:

**054 - Staff Feedback Capture and Phase 1 Review Tracker**

The feedback tracker now exists at [Staff Feedback Capture and Phase 1 Review Tracker](54-staff-feedback-capture-phase-1-review-tracker.md). Use it to collect staff responses in one place while they review the demo.

Alternative after feedback:

**055 - Products/Inventory Data Model Planning**

## Short Executive Summary

Clean Eats staff can now safely review the Phase 1 demo modules using the demo account. The screens use sample data only. The goal is to identify missing fields, wrong terminology, workflow gaps and must-have features before real database tables and data imports are created.
