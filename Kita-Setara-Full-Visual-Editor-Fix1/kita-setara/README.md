# Kita Setara — Full Visual Editor

Next.js 14 website with a drag-and-drop visual page editor, Supabase-backed drafts and publishing, and server-verified admin access.

## Quick start

1. Install Node.js 18.17+.
2. Copy `.env.example` to `.env.local` and fill in the Supabase project values.
3. Run `npm install`.
4. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor.
5. Create the admin account in Supabase Authentication, then insert its UUID into `public.site_admins` using the SQL comment at the end of the schema file.
6. Run `npm run dev` and open `http://localhost:3000/admin/login`.

## Visual editor

- Open `/admin/login` and sign in with an administrator account.
- Open `/admin/editor`.
- Select one of the six information pages.
- Drag the grip handle to reorder sections.
- Add Hero, Heading, Text, Card, or CTA blocks.
- Edit headings, text, alignment, content width, background color, and CTA destination.
- Save Draft to store changes privately.
- Publish to update the content served to all visitors.

The story-game routes remain interactive and are not replaced by the page builder.

## Deployment

See `DEPLOY-VERCEL.md` for Supabase setup, environment variables, admin provisioning, and Vercel deployment instructions.

## Security

The service-role key is used only in server-side API routes. Each admin API request validates the Supabase Auth session and verifies membership in `site_admins`. RLS is enabled; public browser roles can read published content only and cannot read drafts or the admin list. Never commit real `.env` credentials.

## Important

This archive includes the application and database migration, but cannot include or provision your Supabase credentials or admin identity. Complete the setup steps above before the editor's database-backed Save and Publish functions can work in the deployed environment.

## Admin visual editor

- Admin login: `/admin/login`
- Visual editor: `/admin/editor` (admin-only)
- Supabase schema: `supabase/schema.sql`
- Vercel setup: `DEPLOY-VERCEL.md`
