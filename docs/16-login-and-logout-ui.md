# Login and Logout UI

## Status

Basic Supabase Auth login and logout UI has been added.

This is the first visible auth step only. It does not add route protection, RLS, user creation, memberships, tenant data queries or business module logic.

## Route Added

- `/login`

The login page lives at `app/login/page.tsx` and uses a small client form component at `app/login/login-form.tsx`.

## How Login Works

The login form collects:

- Email
- Password

On submit, it uses the browser Supabase client helper from `lib/supabase/client.ts` and calls:

- `supabase.auth.signInWithPassword()`

On successful login, the user is sent to:

- `/dashboard`

The login form shows a basic loading state and a clear error message if Supabase Auth returns an error.

## How Logout Works

Logout is handled by `components/auth/logout-button.tsx`.

The logout button uses the browser Supabase client helper and calls:

- `supabase.auth.signOut()`

After logout, the user is sent to:

- `/login`

The logout control is shown subtly in the existing sidebar footer. It does not display profile or membership information.

## Intentionally Not Implemented Yet

- No sign-up UI
- No password reset UI
- No route protection
- No broad protected route redirects
- No middleware
- No RLS policies
- No Supabase CLI usage
- No database migrations
- No user creation
- No profile creation
- No membership creation
- No profile, membership, role, permission or tenant data queries
- No service-role key usage
- No business module logic

## RLS Reminder

RLS is still not enabled. It should remain deferred until the first admin auth user, profile, membership, route protection and tenant context helpers have been tested.

## Next Recommended Step

The next recommended step is to manually create the first Supabase Auth user, then create the matching profile and Clean Eats membership in a controlled setup flow.

Follow [First Admin Setup](17-first-admin-setup.md) before testing the login flow with Luke's real admin user.

After that, the app can add profile, membership and current organisation helpers before adding route protection.
