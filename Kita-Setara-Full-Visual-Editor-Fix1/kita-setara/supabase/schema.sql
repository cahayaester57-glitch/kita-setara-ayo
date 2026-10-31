-- Kita Setara: visual editor + publish workflow
-- Run this file in Supabase SQL Editor before deploying.
create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.site_pages (
  slug text primary key check (slug in ('/','/edukasi','/studi-kasus','/solusi','/panduan-melapor','/tentang')),
  title text not null default 'Halaman',
  draft_content jsonb not null default '[]'::jsonb,
  published_content jsonb,
  updated_by uuid references auth.users(id),
  published_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

alter table public.site_admins enable row level security;
alter table public.site_pages enable row level security;
-- No browser-side access to admin list or draft content.
revoke all on public.site_admins from anon, authenticated;
revoke all on public.site_pages from anon, authenticated;
-- Public visitors can read only the slug and published JSON. Server-side admin
-- routes use the service-role key after independently verifying the auth session
-- and membership in site_admins.
grant select (slug, published_content) on public.site_pages to anon, authenticated;
drop policy if exists "public reads published pages" on public.site_pages;
create policy "public reads published pages" on public.site_pages
  for select to anon, authenticated using (published_content is not null);

-- After creating the intended admin user in Supabase Authentication > Users,
-- copy that user's UUID and run:
-- insert into public.site_admins(user_id) values ('YOUR-AUTH-USER-UUID');
