-- Myso Ecosystem Migration: Wiki, Peer-Review Verification Queue, Creator Blog & Monetization, Note2s Pastebin

create extension if not exists pgcrypto;

-- 1. Wiki Articles
create table if not exists public.wiki_articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  domain text not null default 'general',
  summary text not null,
  content_md text not null,
  sources jsonb not null default '[]'::jsonb,
  views_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Wiki Revisions & Verification Queue (Requires 2 independent IP approvals)
create table if not exists public.wiki_revisions (
  id uuid primary key default gen_random_uuid(),
  article_slug text not null,
  title text not null,
  summary text not null,
  content_md text not null,
  sources jsonb not null default '[]'::jsonb,
  author_ip_hash text not null,
  author_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approval_count int not null default 0,
  approved_ip_hashes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Community Posts & Creator Network
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  cover_image text,
  domain text not null default 'tech',
  excerpt text not null,
  content_md text not null,
  author_name text not null default 'Ẩn danh',
  author_id uuid references auth.users(id) on delete set null,
  views_count int not null default 0,
  monetization_enabled boolean not null default false,
  estimated_earnings_usd numeric(10, 4) not null default 0.0000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Myso Notes (Fast Shareable Pastebin / Note2s)
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text,
  content text not null,
  is_password_protected boolean not null default false,
  password_hash text,
  burn_after_read boolean not null default false,
  views_count int not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- 5. Creator Profiles & Earnings
create table if not exists public.creator_earnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  total_views int not null default 0,
  valid_posts_count int not null default 0,
  is_monetized boolean not null default false,
  pending_usd numeric(10, 2) not null default 0.00,
  paid_usd numeric(10, 2) not null default 0.00,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.wiki_articles enable row level security;
alter table public.wiki_revisions enable row level security;
alter table public.community_posts enable row level security;
alter table public.notes enable row level security;
alter table public.creator_earnings enable row level security;

-- Public read access
create policy "Allow public read on wiki_articles" on public.wiki_articles for select using (true);
create policy "Allow public read on wiki_revisions" on public.wiki_revisions for select using (true);
create policy "Allow public insert on wiki_revisions" on public.wiki_revisions for insert with check (true);
create policy "Allow public read on community_posts" on public.community_posts for select using (true);
create policy "Allow public insert on community_posts" on public.community_posts for insert with check (true);
create policy "Allow public read on notes" on public.notes for select using (true);
create policy "Allow public insert on notes" on public.notes for insert with check (true);
