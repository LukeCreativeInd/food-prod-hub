# UI Overhaul v2 Part D - Branding Controls Completion

## Purpose

This step completes the practical Organisation Settings branding controls started in 109C.

It does not redesign dashboards, change navigation order, change Supplier Invoice Intake behaviour, alter Platform Admin functionality, add business workflows, expose service-role keys or start the 110 performance overhaul.

## Logo Upload Behaviour

Organisation Settings now supports tenant logo upload for authorised users.

Supported file types:

- PNG
- JPG/JPEG
- WebP

Maximum file size:

- 5MB

SVG upload is intentionally excluded until sanitisation and rendering rules are reviewed.

Uploaded logos are stored in private Supabase Storage using the bucket:

```text
organisation-branding
```

Object path format:

```text
{organisation_id}/logo/{safe_filename}
```

The first path segment must be the tenant organisation UUID. The second path segment must be `logo`.

## Logo Display

New uploads store the private storage object path in `organisation_branding.logo_url`.

The app shell and Organisation Settings page resolve that stored path to a short-lived signed URL server-side before rendering the image. Existing `http` or `https` logo URL values remain supported for compatibility with the earlier 109C URL-only foundation.

If no logo is saved, the sidebar continues to show the clean `Client Logo` placeholder from 109A.

Future EveryBatch branding work should keep tenant logos and colours workspace-specific. EveryBatch can appear as a subtle trust layer in tenant workspaces, but Platform Admin and central login should use EveryBatch branding separately.

## Logo Removal

Organisation Settings includes a `Remove logo` control.

Removing a logo clears `organisation_branding.logo_url`, then the sidebar falls back to the placeholder.

Physical object deletion is intentionally deferred. This avoids adding update/delete storage policies before lifecycle rules and replacement cleanup are reviewed.

## Colour And Theme Controls

The existing 109C theme controls remain in place:

- primary colour
- accent colour
- success / good colour
- warning / medium colour
- danger / critical colour
- info colour
- light/dark theme mode

The form uses native colour inputs, shows hex values, validates hex values server-side and saves to `organisation_branding`.

A reset-to-defaults button updates the form preview back to:

- primary `#176B3A`
- accent `#A7D129`
- success `#15803D`
- warning `#B7791F`
- danger `#B91C1C`
- info `#0369A1`
- theme mode `light`

The reset is only saved when the authorised user submits the form.

## Live Preview

The branding form now includes a more useful live preview showing:

- logo preview
- sample card
- primary action
- accent action
- success badge
- warning badge
- danger badge
- info badge

The preview updates before save, while the actual app shell updates after a successful save and refresh.

## Permission And Access Behaviour

The page still requires:

```text
admin.organisation.view
```

Saving branding and uploading logos requires:

```text
admin.organisation.manage
```

Platform admins are also allowed through the existing helper pattern.

The `phase_1_demo_user` role is not granted new permissions and remains read-only/no-edit for Organisation Settings.

## Storage Security

Migration 026 creates a private Supabase Storage bucket and tenant-scoped policies.

Read policy:

- authenticated only
- platform admin can read tenant-scoped logo paths
- active tenant members can read their organisation logo paths
- no anon read access

Upload policy:

- authenticated only
- platform admin can upload to valid tenant-scoped logo paths
- active tenant members require `admin.organisation.manage`
- no anon upload access

No update/delete storage policies are created.

## Known Limitations

- No image cropper.
- No drag-and-drop media library.
- No SVG upload until sanitisation is reviewed.
- Removing a logo clears the database reference but does not delete the storage object yet.
- Dark mode remains a broad foundation; individual older pages may still need future polish.
- No performance overhaul is included in this step.

## Future Polish

- Add logo replacement cleanup after object lifecycle rules are agreed.
- Add optional image dimension guidance.
- Add safer SVG support only if sanitisation is implemented.
- Continue the planned 110 performance work separately.
- Align future platform-level branding with the EveryBatch brand/domain architecture from task 113 without replacing tenant branding controls.
