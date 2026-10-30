-- Migration 0003 Fixed syntax for Postgres:

-- 1. Policies for direct wiki edits & creation
drop policy if exists "Allow public insert on wiki_articles" on public.wiki_articles;
create policy "Allow public insert on wiki_articles" on public.wiki_articles for insert with check (true);

drop policy if exists "Allow public update on wiki_articles" on public.wiki_articles;
create policy "Allow public update on wiki_articles" on public.wiki_articles for update using (true);

-- 2. Notes update & delete for burn-after-read and view count
drop policy if exists "Allow public update on notes" on public.notes;
create policy "Allow public update on notes" on public.notes for update using (true);

drop policy if exists "Allow public delete on notes" on public.notes;
create policy "Allow public delete on notes" on public.notes for delete using (true);

-- 3. Community posts upvotes & update
alter table public.community_posts add column if not exists upvotes int not null default 0;

drop policy if exists "Allow public update on community_posts" on public.community_posts;
create policy "Allow public update on community_posts" on public.community_posts for update using (true);

-- 4. Reddit & Voz style discussion comments
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  author_name text not null default 'Thành viên Myso',
  content text not null,
  upvotes int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.post_comments enable row level security;

drop policy if exists "Allow public read on post_comments" on public.post_comments;
create policy "Allow public read on post_comments" on public.post_comments for select using (true);

drop policy if exists "Allow public insert on post_comments" on public.post_comments;
create policy "Allow public insert on post_comments" on public.post_comments for insert with check (true);

drop policy if exists "Allow public update on post_comments" on public.post_comments;
create policy "Allow public update on post_comments" on public.post_comments for update using (true);

notify pgrst, 'reload schema';
