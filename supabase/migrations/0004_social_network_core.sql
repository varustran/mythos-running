-- Migration 0004: Social Network Core (Profiles, Posts, Comments, Reports, Direct Messages)

create extension if not exists pgcrypto;

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  username text unique,
  email text,
  full_name text not null default 'Thành viên Myso',
  avatar_url text,
  bio text,
  verified boolean default false,
  streak_days int default 1,
  followers_count int default 0,
  following_count int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Social Posts (Feed)
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete set null,
  author_name text not null default 'Thành viên Myso',
  author_handle text not null default 'user',
  author_avatar text,
  content text not null,
  media_urls text[] not null default '{}',
  category text not null default 'all',
  likes_count int not null default 0,
  reposts_count int not null default 0,
  comments_count int not null default 0,
  bookmarks_count int not null default 0,
  created_at timestamptz not null default now()
);

-- 3. Social Comments
create table if not exists public.social_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.social_posts(id) on delete cascade,
  author_name text not null default 'Thành viên Myso',
  author_handle text not null default 'user',
  author_avatar text,
  content text not null,
  likes_count int not null default 0,
  created_at timestamptz not null default now()
);

-- 4. Post Reports (Moderation & Legal Compliance)
create table if not exists public.post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.social_posts(id) on delete cascade,
  reporter_ip text not null default 'anonymous',
  reason text not null,
  details text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- 5. Direct Messages (Encrypted Telegram-style DM)
create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_handle text not null,
  sender_name text not null default 'Thành viên Myso',
  recipient_handle text not null,
  encrypted_content text not null,
  media_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.social_posts enable row level security;
alter table public.social_comments enable row level security;
alter table public.post_reports enable row level security;
alter table public.direct_messages enable row level security;

-- Policies for profiles
drop policy if exists "Allow public read on profiles" on public.profiles;
create policy "Allow public read on profiles" on public.profiles for select using (true);

drop policy if exists "Allow public insert on profiles" on public.profiles;
create policy "Allow public insert on profiles" on public.profiles for insert with check (true);

drop policy if exists "Allow public update on profiles" on public.profiles;
create policy "Allow public update on profiles" on public.profiles for update using (true);

-- Policies for social_posts
drop policy if exists "Allow public read on social_posts" on public.social_posts;
create policy "Allow public read on social_posts" on public.social_posts for select using (true);

drop policy if exists "Allow public insert on social_posts" on public.social_posts;
create policy "Allow public insert on social_posts" on public.social_posts for insert with check (true);

drop policy if exists "Allow public update on social_posts" on public.social_posts;
create policy "Allow public update on social_posts" on public.social_posts for update using (true);

-- Policies for social_comments
drop policy if exists "Allow public read on social_comments" on public.social_comments;
create policy "Allow public read on social_comments" on public.social_comments for select using (true);

drop policy if exists "Allow public insert on social_comments" on public.social_comments;
create policy "Allow public insert on social_comments" on public.social_comments for insert with check (true);

-- Policies for post_reports
drop policy if exists "Allow public read on post_reports" on public.post_reports;
create policy "Allow public read on post_reports" on public.post_reports for select using (true);

drop policy if exists "Allow public insert on post_reports" on public.post_reports;
create policy "Allow public insert on post_reports" on public.post_reports for insert with check (true);

-- Policies for direct_messages
drop policy if exists "Allow public read on direct_messages" on public.direct_messages;
create policy "Allow public read on direct_messages" on public.direct_messages for select using (true);

drop policy if exists "Allow public insert on direct_messages" on public.direct_messages;
create policy "Allow public insert on direct_messages" on public.direct_messages for insert with check (true);

notify pgrst, 'reload schema';
