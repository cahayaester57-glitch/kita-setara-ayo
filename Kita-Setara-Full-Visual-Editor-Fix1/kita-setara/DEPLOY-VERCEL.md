# Setup admin visual editor + Vercel

## 1. Create Supabase project
1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. In Authentication > Providers, enable Email + Password. Disable public signups after creating the administrator if the project is dedicated to this site.
4. Create the intended admin user in Authentication > Users. Copy the user's UUID and run the `insert into public.site_admins...` statement at the bottom of `schema.sql` with that UUID.
5. In Project Settings > API, copy the Project URL, anon/publishable key, and service_role key.

## 2. Configure Vercel
Add these Environment Variables for Production (and Preview/Development if desired):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; do not expose, commit, or prefix with NEXT_PUBLIC_)

Deploy the repository to Vercel. Install/build command: `npm install`; build command: `npm run build`.

## 3. Open editor
Visit `/admin/login`, sign in with the admin account, then edit pages at `/admin/editor`.
Select a page, drag the grip handle to reorder sections, add/remove blocks, change text/alignment/background colors, preview, save draft, and Publish. Public pages read only `published_content`; draft changes are not visible until Publish.

## Security model
- No public admin registration page.
- Every admin API request validates the Supabase Auth session and checks `site_admins` server-side.
- Service-role secret is used only in server route handlers and is never sent to the browser.
- RLS is enabled; browser roles cannot read draft content or admin membership. Public roles have column-limited access to published content only.
- Keep Supabase service-role key private and use a strong unique admin password. Enable MFA in Supabase if available for the project.

## Notes
The editor manages the six information pages (`/`, `/edukasi`, `/studi-kasus`, `/solusi`, `/panduan-melapor`, `/tentang`). Interactive story-game routes remain their purpose-built experiences and are not overwritten by page-builder content.
