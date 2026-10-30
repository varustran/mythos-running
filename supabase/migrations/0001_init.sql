-- Mythos Running — Supabase schema
-- Run this in the Supabase SQL editor, or via `supabase db push`.
-- Requires the pgcrypto extension for gen_random_uuid (enabled by default on Supabase).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'reader' check (role in ('admin', 'editor', 'reader')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor')
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Create a profile whenever a user signs up (email, magic link or OAuth).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Public, limited projection used by the community page (no emails).
create or replace view public.community_members
with (security_invoker = false) as
  select id, full_name, role, created_at
  from public.profiles
  where full_name is not null;

grant select on public.community_members to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Content tables (optional CMS-ready mirror of the repository content)
-- ---------------------------------------------------------------------------
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,
  excerpt jsonb,
  body jsonb,
  category text not null default 'training',
  cover_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,
  description jsonb,
  city text,
  venue text,
  event_date timestamptz,
  registration_url text,
  sample boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null,
  description jsonb,
  distance_km numeric,
  elevation_m integer,
  difficulty text check (difficulty in ('easy', 'moderate', 'hard')),
  gpx_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.articles enable row level security;
alter table public.events enable row level security;
alter table public.routes enable row level security;

drop policy if exists "articles_public_read" on public.articles;
create policy "articles_public_read" on public.articles
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists "articles_admin_all" on public.articles;
create policy "articles_admin_all" on public.articles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "events_public_read" on public.events;
create policy "events_public_read" on public.events
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists "events_admin_all" on public.events;
create policy "events_admin_all" on public.events
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "routes_public_read" on public.routes;
create policy "routes_public_read" on public.routes
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists "routes_admin_all" on public.routes;
create policy "routes_admin_all" on public.routes
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Contact messages
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  locale text not null default 'vi',
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "contact_messages_insert_public" on public.contact_messages;
create policy "contact_messages_insert_public" on public.contact_messages
  for insert to anon, authenticated
  with check (true);

drop policy if exists "contact_messages_admin_read" on public.contact_messages;
create policy "contact_messages_admin_read" on public.contact_messages
  for select to authenticated
  using (public.is_admin());

drop policy if exists "contact_messages_admin_update" on public.contact_messages;
create policy "contact_messages_admin_update" on public.contact_messages
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "contact_messages_admin_delete" on public.contact_messages;
create policy "contact_messages_admin_delete" on public.contact_messages
  for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Newsletter subscribers
-- ---------------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  locale text not null default 'vi',
  source text default 'website',
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "newsletter_insert_public" on public.newsletter_subscribers;
create policy "newsletter_insert_public" on public.newsletter_subscribers
  for insert to anon, authenticated
  with check (true);

drop policy if exists "newsletter_admin_read" on public.newsletter_subscribers;
create policy "newsletter_admin_read" on public.newsletter_subscribers
  for select to authenticated
  using (public.is_admin());

drop policy if exists "newsletter_admin_delete" on public.newsletter_subscribers;
create policy "newsletter_admin_delete" on public.newsletter_subscribers
  for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Bootstrap the first admin after signing in once:
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- ---------------------------------------------------------------------------
