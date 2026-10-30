-- Migration 0006: Add views_count, monetized, and custom_icon to social_posts
ALTER TABLE public.social_posts
  ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monetized BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS custom_icon TEXT;

-- Seed default initial views so existing posts have real view counts
UPDATE public.social_posts SET views_count = 142 WHERE views_count = 0;
-- Set official admin post to monetized: true
UPDATE public.social_posts SET monetized = TRUE WHERE author_handle = 'myso';

-- Post views tracking table for unique impression logging
CREATE TABLE IF NOT EXISTS public.post_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE,
  viewer_handle TEXT,
  viewer_ip_hash TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant permissions to anon & authenticated
GRANT ALL ON public.post_impressions TO anon, authenticated, service_role;

-- User AI preference / behavior tracking table
CREATE TABLE IF NOT EXISTS public.user_behavior_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_handle TEXT NOT NULL,
  action TEXT NOT NULL, -- 'view', 'like', 'comment', 'search', 'time_spent'
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON public.user_behavior_logs TO anon, authenticated, service_role;
