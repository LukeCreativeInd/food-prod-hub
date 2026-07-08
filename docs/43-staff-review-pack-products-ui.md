# Staff Review Pack - Products/UI Foundation

## Meeting Purpose

The HUB is now past the technical foundation stage.

Login, users, permissions, modules and database security foundations are in place. The current Products screens are sample UI only.

The goal of this meeting is to collect practical feedback before real Clean Eats data is added. Staff feedback will help confirm terminology, fields, workflows and priorities before database tables are created.

## Plain-English Project Summary

We are building a Clean Eats operations hub that will eventually bring product data, costings, production, QA, inventory, logistics and reporting into one place.

What you are seeing now is not final data. It is a visual structure so we can confirm how the screens should work before we lock in the database and workflows.

## What Has Been Built So Far

- Secure login/logout
- Clean Eats tenant setup
- User, role and permission foundation
- Module enablement foundation
- Database security/RLS foundation
- Main app shell/sidebar
- Products module UI skeleton
- Sample screens for Ingredients, Components, Meals, Packaging and Suppliers

No real Clean Eats product data has been imported yet.

## What Staff Are Reviewing Today

| Screen | What to look for |
| --- | --- |
| Dashboard | Does the high-level layout make sense? What should managers see at a glance? |
| Products Overview | Does a Products dashboard make sense? Are the summary cards and quick actions useful? |
| Ingredients | Are the words, fields and columns useful for raw materials? |
| Components | Is this the right place for batch recipes, mixes and prepared items? |
| Meals | Should these be called Meals, Finished Meals or Finished Products? |
| Packaging | Are packaging items and links shown in a useful way? |
| Suppliers | Does the supplier information match daily ordering and review needs? |

For each screen, ask:

- Does the page make sense?
- Are the words/labels right?
- Are the columns useful?
- Is anything missing?
- Is anything unnecessary?
- Who should be able to see or edit this?

## General Feedback Questions

- Do the module names make sense?
- Do the page names make sense?
- Is `Components` the right word, or should it be `Batch Recipes`, `Mixes`, `Prepared Components`, or something else?
- Is `Meals` the right word, or should it be `Finished Meals`, `Finished Products`, or something else?
- What information do you look for daily?
- What information causes delays or mistakes today?
- What currently lives in spreadsheets, paper, Shopify, Xero, production reports, or people's heads?
- What should be visible to everyone?
- What should be manager-only?
- What should be tablet-friendly later?

## Products Overview Review

Ask:

- Does a Products overview/dashboard make sense?
- What summary numbers should appear here?
- What alerts would be useful?
- What quick actions should exist?
- What should be shown before production starts each day?
- What should managers see at a glance?

## Ingredients Review

Ask:

- What fields are required for each ingredient?
- What unit should be stored: kg, g, L, ml, each?
- Do we need supplier, supplier code, pack size, cost, allergen, storage type, shelf life and status?
- Do ingredients need categories?
- Do we need separate raw ingredient and prepared ingredient terminology?
- What ingredient data is needed for QA?
- What ingredient data is needed for costings?
- What ingredient data is needed for purchasing/inventory?

Suggested fields to confirm:

- Ingredient name
- Category
- Unit
- Supplier
- Pack size
- Cost
- Allergen flag
- Storage location/type
- Status

## Components Review

Components are currently intended to mean batch recipes, mixes or prepared items that feed into meals.

Ask:

- Is `Components` the right word?
- What do staff currently call these?
- Examples: rice batch, chicken mix, sauces, mash, salsa, meat mixes.
- Should sauces be components?
- Should cooked rice be a component?
- Should meat mixes be components?
- What fields matter: yield, batch size, ingredients used, production area, shelf life, cost, linked meals?
- Do components need their own recipes?
- Do components need QA checks?

Suggested fields to confirm:

- Component name
- Type
- Ingredients used
- Batch/yield
- Unit
- Used in meals
- Production area
- Cost status
- QA status

## Meals Review

Ask:

- Should the system call these Meals, Finished Meals or Finished Products?
- What fields are required for each meal?
- Do meals need versions?
- Do meals need active/inactive status?
- What links should meals have to components, ingredients and packaging?
- What meal-level data matters for costing?
- What meal-level data matters for production?
- What meal-level data matters for QA/labelling?
- Should family meals be treated differently?
- Should meal categories be standardised?

Suggested fields to confirm:

- Meal name
- Category
- Status
- Components
- Ingredients
- Packaging
- Portion size
- Costing status
- Production status
- Label/QA status

## Packaging Review

Ask:

- What packaging items should be tracked?
- Meal sleeves, trays, labels, cartons, sauce containers, liners, stickers, POS material?
- Should labels and sleeves have QA/compliance fields?
- Does packaging need supplier, cost, stock, pack size and usage links?
- Which packaging affects production?
- Which packaging affects dispatch/logistics?
- Which packaging should be included in costings?

Suggested fields to confirm:

- Packaging item name
- Type
- Unit
- Supplier
- Pack size
- Cost
- Used by
- Stock relevance
- Status

## Suppliers Review

Ask:

- Which supplier information matters?
- Do we need contacts, emails, phone numbers, ordering notes, delivery days and lead times?
- Should ingredient suppliers and packaging suppliers be in the same area?
- Do suppliers need status/approval?
- Does QA need supplier approval/compliance documents later?
- Does purchasing need minimum order or lead time data?

Suggested fields to confirm:

- Supplier name
- Supplier type
- Contact person
- Phone/email
- Linked items
- Delivery/lead time notes
- Approval/status
- Notes

## Role-Specific Feedback

### Tony

- production structure
- meals/components terminology
- reporting/dashboard priorities
- production-ready product data

### Cettina/Luisa

- QA fields
- allergens
- sign-offs
- labels/compliance
- supplier approval needs

### Eddie

- inventory fields
- goods inwards
- stock movement
- packaging/ingredient receiving
- warehouse visibility

### Rob

- customer/account/product visibility
- wholesale/CRM needs
- product availability/status
- customer-facing notes later

### Production Staff

- tablet-friendly fields
- task clarity
- what needs to be simple on the floor

## Data Collection Checklist

Ask the team to provide later:

- Current ingredients list
- Current supplier list
- Current packaging list
- Current meals/products list
- Current recipes/components/mixes
- Current costing spreadsheet/data if available
- Current production reports
- Current QA checklists
- Current inventory/stock sheets
- Any existing naming/category rules
- Any "this always causes problems" examples

Do not import everything immediately. First collect and review.

## Priority Rating

For each requested field/workflow, rate it as:

- Must have now
- Needed soon
- Nice to have later
- Not needed

## Meeting Notes Template

Date:

Attendees:

Main decisions:

Terminology changes:

Fields to add:

Fields to remove:

Questions still open:

Data files needed:

Next actions:

Owner:

Due date:

## Decisions We Need Before Database Tables

- Final naming for Ingredients / Components / Meals / Packaging / Suppliers
- Required fields for each area
- Which fields are manager-only
- Which fields are needed for costing
- Which fields are needed for production
- Which fields are needed for QA
- Which fields are needed for inventory/purchasing
- Which data should be imported first
- Whether components need recipes from day one
- Whether meals need versions from day one

## What Happens After Feedback

The wider staff meeting has now happened. The agreed next step is to build Phase 1 demo modules with dummy/sample data and collect CSV/source data in parallel. The updated plan is documented in [Staff Meeting Outcomes and Phase 1 Demo Plan](44-staff-meeting-outcomes-phase-1-demo-plan.md).

After staff feedback:

- update UI terminology if needed
- finalise Products data model
- create database tables with `organisation_id`
- add RLS for those tables
- then import or manually enter first Clean Eats data
- then start connecting UI to live data

## Short Executive Summary

This review pack is designed to make sure the HUB is built around how Clean Eats actually works. The current Products screens are sample layouts only. Staff feedback will decide what fields, wording and workflows should be included before real database tables and data imports begin.
