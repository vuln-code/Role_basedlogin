# AccessFlow — Dynamic Role-Based Authentication System

AccessFlow is a lightweight B.Tech project demonstrating the difference between authentication and authorization. Supabase Auth verifies the account; PostgreSQL grants and Row Level Security (RLS) decide which `profiles` rows that account may read; React renders the matching dashboard only after the authorized profile is returned.

## Assignment coverage

- One animated email/password login with validation, loading, safe errors, session restoration, show/hide password, and password recovery.
- Automatic ADMIN, MANAGER, or USER dashboard selection from the database profile.
- A read-only admin directory with real role counts, search, and filtering.
- A manager team view that queries only rows assigned through `manager_id`.
- A personal user view containing only the authenticated profile.
- Responsive shared navigation, accessible controls, loading/error/empty states, and secure logout.
- Supabase PostgreSQL schema, safe Auth trigger, least-privilege grants, and non-recursive RLS.

## Technology

React 19, Vite 8, TypeScript 7, Tailwind CSS 4, Lucide React, Supabase JS 2, PostgreSQL RLS, and Vitest. There is no custom backend, password table, Redux store, service-role key, or mock authentication.

The interface adapts two components retrieved legitimately through the connected 21st.dev MCP free allowance:

1. **Modern Animated Sign In** by arunachalam — adapted into a Vite-compatible, CSS-first login without Next.js, social login, Motion, or demo logging.
2. **Dashboard Sidebar** by arunjdass — adapted into one responsive, role-aware application shell without mock workspaces or unrelated navigation.

Every statistics card, profile panel, table, state screen, and role-specific dashboard was built locally with React and CSS/Tailwind.

## Project structure

```text
src/
  components/       Login, shared shell, role dashboards, reusable UI
  context/          Session and authenticated-profile lifecycle
  lib/              Supabase client and tested profile utilities
  App.tsx            Auth/profile state router
  index.css          Shared responsive design system
supabase/
  schema.sql         Table, trigger, helper, privileges, and RLS
  admin-setup.sql    Trusted role/manager assignment example
  rls-verification.sql
.env.example
```

## Authentication and authorization flow

```text
User enters credentials
        ↓
Supabase Auth verifies credentials
        ↓
Authenticated session established
        ↓
Authorized own profile retrieved
        ↓
Database role identified
        ↓
Corresponding dashboard displayed
```

```text
Authenticated database request
        ↓
PostgreSQL table grants checked
        ↓
RLS policy evaluated
        ↓
Only authorized rows returned
        ↓
Unauthorized data remains unavailable
```

Frontend navigation and state are not security boundaries. Editing React state, local storage, or a URL cannot change database permissions.

## Database model

`public.profiles` contains:

| Column | Purpose |
| --- | --- |
| `id uuid` | Primary key and foreign key to `auth.users.id` |
| `full_name text` | Display name |
| `email text` | Account email for the project directory |
| `role app_role` | Restricted to `ADMIN`, `MANAGER`, or `USER` |
| `manager_id uuid` | Optional manager profile relationship |
| `created_at timestamptz` | Account creation time |

The Auth trigger always creates a `USER`; it never trusts a role from editable user metadata. Browser roles receive only `SELECT` on `profiles`. Anonymous clients receive no table access. Role and manager changes require trusted SQL administration.

RLS permits:

| Caller | Rows returned |
| --- | --- |
| ADMIN | All profiles |
| MANAGER | Own profile and profiles assigned to that manager |
| USER | Own profile only |
| Anonymous | None |

## Supabase setup

These steps use only Supabase free-tier-compatible features.

1. Create a project at [Supabase](https://supabase.com/dashboard).
2. Open **SQL Editor**, paste all of `supabase/schema.sql`, and run it.
3. Open the project's **Connect** dialog. Copy the project URL and the browser-safe publishable key (`sb_publishable_...`). A legacy `anon` key also works, but publishable keys are the current recommendation.
4. Copy `.env.example` to `.env.local`:

   ```powershell
   Copy-Item .env.example .env.local
   ```

5. Set the two values:

   ```dotenv
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_VALUE
   ```

6. Never put a secret key, service-role key, database password, or 21st.dev key in a `VITE_` variable. Vite browser variables are public by design.

### Password-reset URL configuration

In **Supabase Dashboard → Authentication → URL Configuration**:

1. Set the local **Site URL** to `http://localhost:5173` while developing.
2. Add `http://localhost:5173/reset-password` to **Redirect URLs**.
3. Keep `http://localhost:5173` allowed if older recovery emails or a customized email template redirect to the root.
4. For deployment, add the exact production `/reset-password` URL and configure the host to serve `index.html` for that SPA route.

The login screen calls `resetPasswordForEmail()` with the dedicated reset URL. The application also handles `PASSWORD_RECOVERY` events and root URLs containing `type=recovery`. After `updateUser({ password })` succeeds, the temporary recovery session is signed out and the token-bearing URL is replaced with `/`.

Official references: [Supabase browser API keys](https://supabase.com/docs/guides/getting-started/api-keys), [user-data triggers](https://supabase.com/docs/guides/auth/managing-user-data), and [RLS grants and policies](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Demonstration accounts

1. In Supabase, open **Authentication → Users → Add user**.
2. Create three email/password accounts. Use **Auto Confirm User** for a classroom demonstration, or complete the confirmation email before testing.
3. Do not commit or document the passwords. Keep them in a local password manager or private demonstration note.
4. Copy each account UUID from Authentication → Users.
5. Open `supabase/admin-setup.sql` and replace the three placeholder UUIDs:
   - first UUID: ADMIN;
   - second UUID: MANAGER;
   - third UUID: USER;
   - the USER's `manager_id`: the MANAGER UUID.
6. Run the edited statements in SQL Editor and confirm that the final query returns exactly three rows with the intended roles.
7. Never expose this trusted assignment process as a public endpoint.

## Run locally

```powershell
npm install
npm run dev
```

Open the URL shown by Vite (normally `http://localhost:5173`). After changing `.env.local`, restart the dev server.

Quality commands:

```powershell
npm run typecheck
npm run test:run
npm run build
npm run preview
```

## Testing

Automated unit tests cover profile validation, role counting, search, role filtering, and safe date formatting. `npm run build` performs strict TypeScript checking and a production bundle.

Live authentication/RLS testing requires your configured Supabase project and private test credentials:

1. Sign in as ADMIN; confirm the directory and counts match `profiles`.
2. Sign in as MANAGER; confirm only the assigned USER appears.
3. Sign in as USER; confirm only the personal profile is shown.
4. Try invalid credentials and empty fields.
5. Refresh each valid session; verify the correct dashboard returns without flashing another role.
6. Log out, refresh, and confirm protected content does not return.
7. Run each identity section in `supabase/rls-verification.sql` with the relevant UUID.
8. Confirm USER and MANAGER `UPDATE` attempts fail with `permission denied`.
9. Confirm an anonymous `SELECT` fails.
10. In the browser console, changing frontend variables must not expand a database query because the JWT identity and RLS policy remain authoritative.

Password-reset verification:

1. Select **Forgot Password?**, enter an existing test-account email, and submit once.
2. Confirm the UI shows the same generic success response regardless of whether an email exists.
3. Open the newest recovery email and confirm it lands on `/reset-password` (or the root for an older template).
4. Confirm mismatched or short passwords are rejected before a request is sent.
5. Set a valid new password and confirm the app returns to login rather than a role dashboard.
6. Confirm the old password fails and the new password signs in successfully.
7. Re-open the used link or open `/reset-password` directly; confirm password submission is unavailable without a valid recovery session.

Do not mark the database checks as passed until they have been run against the live project.

## Security notes

- Passwords are submitted only through `supabase.auth.signInWithPassword` and never stored in `profiles`.
- Session persistence and refresh use Supabase's supported browser client behavior.
- Auth listeners are unsubscribed, stale profile requests are ignored, and protected React state is cleared before logout completes.
- The role is accepted only from an RLS-authorized database row and validated against a closed TypeScript role set.
- The RLS helper takes no target-user argument, has a fixed empty `search_path`, and returns only the current caller's role.
- The `manager_id` policy column is indexed.
- The application never renders raw HTML and does not log credentials or tokens.

## Known limitations

- This repository cannot create or configure your external Supabase project; live auth and RLS results must be verified after setup.
- Recovery email delivery, redirect allow-list behavior, token expiry, and the live password update require manual verification against your configured Supabase project. Supabase's default SMTP service is rate-limited.
- Role assignment intentionally remains a trusted SQL task. There is no browser role editor.
- The project is read-only by assignment, so profile editing and account lifecycle management are omitted.
- Search operates client-side only after RLS has returned the already-authorized rows.
- For a larger production directory, counts and filtering should move to carefully secured database functions with pagination.
