# Production Module UI Skeleton

## Status

Step 046 has created the Production module UI skeleton using safe sample data only.

No database migrations, Supabase changes, RLS changes, route guard changes, permission changes, Shopify API integration, CSV parsing, real report generation, Streamlit logic recreation, database queries or production writes were added.

## Pages Added or Updated

- `/production`: Production overview/module dashboard.
- `/production-report`: Production report generator preview.
- `/production-plan`: Production plan preview.
- `/production-areas`: Production area grouping preview.
- `/production-tasks`: Production task board preview.
- `/facility-tasks`: Facility/iPad task execution preview.

## Sample Data Included

The skeleton uses placeholder rows and counts for:

- Shopify/order demand
- production report sections
- meal summary
- bulk raw ingredients
- meal raw ingredients
- pre-pack room
- meat and veg prep
- sauces/mixes
- production checks
- production plans
- production areas
- production tasks
- facility/iPad task cards
- issue, waste and supervisor check prompts

Example sample items include Chicken Fajita Bowl, Naked Chicken Parma, Rice Batch, Sweet Potato Mash, Napoli Sauce, Chicken Mix and Burrito Bowls.

## Production Report Generator Preview

The `/production-report` screen previews how the current report workflow could eventually move into the HUB.

Current workflow:

- Shopify export CSVs are uploaded into the existing Streamlit app.
- The Streamlit app generates production reports.
- Those reports guide daily production and production areas/tasks.

Future workflow:

- Shopify API imports order demand automatically.
- The HUB generates the production report.
- The generated report feeds production plans, production areas, tasks, facility/iPad workflows and eventually inventory usage/traceability.

This task did not add file upload, CSV parsing, Shopify integration, PDF generation or real report generation.

## Facility/iPad Preview

The `/facility-tasks` screen previews what floor staff might eventually see on iPad or facility devices.

The preview includes:

- touch-friendly task cards
- task name
- production area
- batch/material placeholder
- required weight/quantity
- actual weight placeholder
- checks required
- status
- visual Start / Complete buttons
- Report issue, Log waste and Supervisor check placeholders

The buttons are visual placeholders only. No task completion logic or database writes were added.

## How Production May Connect Later

Future production work may connect:

- Shopify/order demand
- generated production reports
- production plans
- production areas
- production tasks
- component/batch prep
- iPad/facility execution
- inventory batches and usage
- waste/issues
- QA/supervisor checks
- finished product output

## Intentionally Not Connected Yet

- No real Shopify API integration.
- No Shopify CSV upload or parsing.
- No existing Streamlit report logic recreated.
- No real report generation.
- No production tables.
- No production task engine.
- No iPad portal logic.
- No inventory usage or traceability writes.
- No real Clean Eats production data imported.
- No production RLS policies.

## Auth, Routing and Security

Existing behaviour is preserved:

- Production pages are still protected through the existing app access flow.
- Sidebar module filtering remains enabled-module-aware.
- Permission rules were not changed.
- Route protection was not changed.
- RLS behaviour was not changed.

## Next Step

Recommended next step:

**047 - Inventory Module UI Skeleton**

The Inventory skeleton should use sample data only and preview goods inwards, batches, stock movements, BOM/traceability and kitchen/production issue flows before real inventory tables or live stock data are created.
