-- Migration 0007: Post Visibility, Schedules, Communities, Upvotes/Downvotes, and Enhanced Profile

-- 1. Extend social_posts table
ALTER TABLE public.social_posts
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
  ADD COLUMN IF NOT EXISTS post_type TEXT NOT NULL DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video', 'link', 'question', 'discussion', 'poll', 'wiki', 'multi-image', 'long-form')),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS community_id TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS flair TEXT,
  ADD COLUMN IF NOT EXISTS poll_data JSONB,
  ADD COLUMN IF NOT EXISTS upvotes_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS downvotes_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 2. Communities Table (Reddit-style sub-communities)
CREATE TABLE IF NOT EXISTS public.communities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  cover_image TEXT,
  rules TEXT[] DEFAULT '{}',
  moderator_handles TEXT[] DEFAULT '{}',
  members_count INTEGER NOT NULL DEFAULT 0,
  posts_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial communities
INSERT INTO public.communities (id, name, slug, description, icon)
VALUES 
  ('tech', 'Công nghệ & AI', 'tech', 'Thảo luận lập trình, AI, sản phẩm công nghệ và khởi nghiệp.', 'cpu'),
  ('running', 'Chạy bộ & Điền kinh', 'running', 'Chia sẻ kỹ thuật chạy bộ, dinh dưỡng, giáo án và giải đấu marathon.', 'flame'),
  ('lifestyle', 'Đời sống & Phát triển', 'lifestyle', 'Phong cách sống, tư duy, sách hay và trải nghiệm thường nhật.', 'sparkles'),
  ('science', 'Khoa học & Tri thức', 'science', 'Khám phá tự nhiên, vũ trụ, y học và các bài viết học thuật.', 'book-open'),
  ('qa', 'Hỏi đáp & Trợ giúp', 'qa', 'Đặt câu hỏi và nhận câu trả lời xác thực từ cộng đồng Myso.', 'help-circle')
ON CONFLICT (id) DO NOTHING;

-- 3. Community Memberships
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id TEXT REFERENCES public.communities(id) ON DELETE CASCADE,
  user_handle TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(community_id, user_handle)
);

-- 4. Social Votes (Unique Upvotes / Downvotes tracking per post and user/IP)
CREATE TABLE IF NOT EXISTS public.social_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE,
  voter_handle TEXT NOT NULL,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, voter_handle)
);

-- 5. Threaded Comments (Replies to comments)
ALTER TABLE public.social_comments
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.social_comments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS upvotes_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_edited BOOLEAN NOT NULL DEFAULT FALSE;

-- 6. User Profile Extended Fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT;

-- 7. RLS Security Policies
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on communities" ON public.communities;
CREATE POLICY "Allow public read on communities" ON public.communities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on community_members" ON public.community_members;
CREATE POLICY "Allow public read on community_members" ON public.community_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on community_members" ON public.community_members;
CREATE POLICY "Allow public insert on community_members" ON public.community_members FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete on community_members" ON public.community_members;
CREATE POLICY "Allow public delete on community_members" ON public.community_members FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read on social_votes" ON public.social_votes;
CREATE POLICY "Allow public read on social_votes" ON public.social_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update on social_votes" ON public.social_votes;
CREATE POLICY "Allow public insert on social_votes" ON public.social_votes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete on social_votes" ON public.social_votes;
CREATE POLICY "Allow public delete on social_votes" ON public.social_votes FOR DELETE USING (true);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
