-- Migration 0005: Social Graph (Friends, Message Requests, Moderation Rules, Admin Verification)

create table if not exists public.social_relationships (
  id uuid primary key default gen_random_uuid(),
  user_handle text not null,
  target_handle text not null,
  status text not null default 'pending' check (status in ('pending', 'friends', 'blocked')),
  created_at timestamptz not null default now(),
  unique (user_handle, target_handle)
);

alter table public.social_relationships enable row level security;

drop policy if exists "Allow public read on social_relationships" on public.social_relationships;
create policy "Allow public read on social_relationships" on public.social_relationships for select using (true);

drop policy if exists "Allow public insert on social_relationships" on public.social_relationships;
create policy "Allow public insert on social_relationships" on public.social_relationships for insert with check (true);

drop policy if exists "Allow public update on social_relationships" on public.social_relationships;
create policy "Allow public update on social_relationships" on public.social_relationships for update using (true);

-- Add message_type to direct_messages
alter table public.direct_messages add column if not exists message_type text not null default 'normal';

-- Add role to profiles
alter table public.profiles add column if not exists role text not null default 'user';

-- Ensure chuitv1907@gmail.com has admin role
update public.profiles set role = 'admin', verified = true where email = 'chuitv1907@gmail.com';

notify pgrst, 'reload schema';
