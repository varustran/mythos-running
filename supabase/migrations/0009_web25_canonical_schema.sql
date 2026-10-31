-- Migration 0009: Web2.5 Canonical Schema for MYSO

-- 1. Profiles enhancement
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS wallet_address TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS points_balance INTEGER DEFAULT 100 CHECK (points_balance >= 0),
  ADD COLUMN IF NOT EXISTS gold_balance NUMERIC(18, 2) DEFAULT 0 CHECK (gold_balance >= 0),
  ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS preferred_locale TEXT DEFAULT 'en';

-- 2. Posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID,
  author_handle TEXT NOT NULL DEFAULT 'myso',
  author_name TEXT NOT NULL DEFAULT 'Myso Member',
  author_avatar TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  title TEXT NOT NULL DEFAULT '',
  public_preview TEXT NOT NULL DEFAULT '',
  content TEXT,
  preview_media_urls JSONB DEFAULT '[]'::jsonb,
  is_locked BOOLEAN DEFAULT FALSE,
  unlock_price_gold NUMERIC(18, 2) DEFAULT 0,
  unlock_price_points INTEGER DEFAULT 0,
  payload_metadata JSONB DEFAULT '{"wordsCount":0,"codeBlocksCount":0,"linksCount":0,"attachmentsCount":0}'::jsonb,
  upvotes_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reposts_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  visibility TEXT DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Post secrets table (Paywall payload)
CREATE TABLE IF NOT EXISTS public.post_secrets (
  post_id UUID PRIMARY KEY,
  secret_content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Post unlocks table
CREATE TABLE IF NOT EXISTS public.post_unlocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_handle TEXT,
  post_id UUID NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'POINTS',
  tx_hash TEXT UNIQUE,
  chain_id INTEGER,
  amount_paid NUMERIC(18, 4) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- 5. Comments table with nested hierarchy
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  author_id UUID,
  author_handle TEXT NOT NULL DEFAULT 'user',
  author_name TEXT NOT NULL DEFAULT 'Thành viên Myso',
  author_avatar TEXT,
  parent_id UUID,
  depth INTEGER DEFAULT 0,
  content TEXT NOT NULL,
  upvotes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. User Quests table
CREATE TABLE IF NOT EXISTS public.user_quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quest_type TEXT NOT NULL,
  completed_date DATE NOT NULL,
  points_reward INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quest_type, completed_date)
);

-- 7. Ledger entries table
CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_code TEXT NOT NULL,
  amount NUMERIC(18, 4) NOT NULL,
  direction TEXT NOT NULL DEFAULT 'CREDIT',
  transaction_type TEXT NOT NULL,
  reference_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

-- 9. Setup RLS Policies
DROP POLICY IF EXISTS "posts_select_policy" ON public.posts;
CREATE POLICY "posts_select_policy" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "posts_insert_policy" ON public.posts;
CREATE POLICY "posts_insert_policy" ON public.posts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "posts_update_policy" ON public.posts;
CREATE POLICY "posts_update_policy" ON public.posts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "comments_select_policy" ON public.comments;
CREATE POLICY "comments_select_policy" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "comments_insert_policy" ON public.comments;
CREATE POLICY "comments_insert_policy" ON public.comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "unlocks_select_policy" ON public.post_unlocks;
CREATE POLICY "unlocks_select_policy" ON public.post_unlocks FOR SELECT USING (true);

DROP POLICY IF EXISTS "unlocks_insert_policy" ON public.post_unlocks;
CREATE POLICY "unlocks_insert_policy" ON public.post_unlocks FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "quests_select_policy" ON public.user_quests;
CREATE POLICY "quests_select_policy" ON public.user_quests FOR SELECT USING (true);

DROP POLICY IF EXISTS "quests_insert_policy" ON public.user_quests;
CREATE POLICY "quests_insert_policy" ON public.user_quests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "ledger_select_policy" ON public.ledger_entries;
CREATE POLICY "ledger_select_policy" ON public.ledger_entries FOR SELECT USING (true);

DROP POLICY IF EXISTS "ledger_insert_policy" ON public.ledger_entries;
CREATE POLICY "ledger_insert_policy" ON public.ledger_entries FOR INSERT WITH CHECK (true);

-- 10. Seed 3 initial high-value posts
INSERT INTO public.posts (
  id, author_handle, author_name, author_avatar, category, title,
  public_preview, content, is_locked, unlock_price_gold, unlock_price_points,
  payload_metadata, likes_count, comments_count, reposts_count, views_count, status, visibility, created_at
) VALUES
(
  'e1111111-1111-1111-1111-111111111111',
  'myso',
  'Myso Architecture Team',
  '/favicon.svg',
  'Code & Dev',
  'Kiến trúc High-Concurrency Web2.5 Microblogging với Next.js 15 & Supabase',
  'Tài liệu phân tích kiến trúc chi tiết cách thiết kế mạng xã hội có khả năng chịu tải hàng trăm nghìn RPS kết hợp cơ chế khóa bài viết và phân bổ doanh thu phi tập trung 85/15. Bao gồm sơ đồ luồng dữ liệu, chiến lược cache tầng CDN và bộ mã nguồn tham khảo production.',
  'Tài liệu phân tích kiến trúc chi tiết cách thiết kế mạng xã hội có khả năng chịu tải hàng trăm nghìn RPS kết hợp cơ chế khóa bài viết và phân bổ doanh thu phi tập trung 85/15. Bao gồm sơ đồ luồng dữ liệu, chiến lược cache tầng CDN và bộ mã nguồn tham khảo production.',
  true,
  2.50,
  50,
  '{"wordsCount": 1820, "codeBlocksCount": 4, "linksCount": 3, "attachmentsCount": 1}'::jsonb,
  42,
  8,
  14,
  890,
  'published',
  'public',
  NOW() - INTERVAL '2 hours'
),
(
  'e2222222-2222-2222-2222-222222222222',
  'myso',
  'Myso AI Lab',
  '/favicon.svg',
  'AI & Prompts',
  'Bộ System Prompts độc quyền dành cho Autonomous Coding Agents (Cursor, Windsurf, Claude Code)',
  'Bộ 5 System Prompts tối ưu hóa khả năng suy luận logic và tự động kiểm thử cho AI Agent khi lập trình full-stack. Giúp AI hiểu sâu context hệ thống, tự động audit lỗ hổng bảo mật và viết unit test chính xác mà không bị lặp lại lỗi.',
  'Bộ 5 System Prompts tối ưu hóa khả năng suy luận logic và tự động kiểm thử cho AI Agent khi lập trình full-stack. Giúp AI hiểu sâu context hệ thống, tự động audit lỗ hổng bảo mật và viết unit test chính xác mà không bị lặp lại lỗi.',
  true,
  1.50,
  30,
  '{"wordsCount": 1240, "codeBlocksCount": 6, "linksCount": 2, "attachmentsCount": 0}'::jsonb,
  89,
  15,
  35,
  1420,
  'published',
  'public',
  NOW() - INTERVAL '5 hours'
),
(
  'e3333333-3333-3333-3333-333333333333',
  'myso',
  'Myso Official',
  '/favicon.svg',
  'General',
  'Chào mừng đến với MYSO — Mạng xã hội Tri thức & Microblogging Web2.5',
  'Myso chính thức ra mắt phiên bản v2.0 mang đến trải nghiệm lướt bài tốc độ cao, thảo luận phân nhánh chuyên sâu và cơ chế bảo vệ quyền tác giả thông minh. Khám phá ngay các tính năng nổi bật và bắt đầu hành trình sáng tạo nội dung của bạn!',
  'Myso chính thức ra mắt phiên bản v2.0 mang đến trải nghiệm lướt bài tốc độ cao, thảo luận phân nhánh chuyên sâu và cơ chế bảo vệ quyền tác giả thông minh. Khám phá ngay các tính năng nổi bật và bắt đầu hành trình sáng tạo nội dung của bạn!',
  false,
  0,
  0,
  '{"wordsCount": 420, "codeBlocksCount": 0, "linksCount": 4, "attachmentsCount": 0}'::jsonb,
  156,
  24,
  48,
  3200,
  'published',
  'public',
  NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;

-- Seed corresponding post_secrets for locked posts
INSERT INTO public.post_secrets (post_id, secret_content, attachments)
VALUES
(
  'e1111111-1111-1111-1111-111111111111',
  '### 1. Kiến trúc phân tầng (Tiered Architecture)

Dưới đây là mã nguồn middleware và logic rate-limiting chống DDoS:

```typescript
// Rate limiting middleware với Upstash Redis hoặc in-memory sliding window
export async function rateLimit(ip: string, limit: number = 60) {
  const key = `ratelimit:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60);
  return count <= limit;
}
```

### 2. Chiến lược xử lý Ledger & Smart Contract Webhook

Để ngăn chặn double-spending khi xử lý giao dịch on-chain:
- Tạo bảng `ledger_entries` với cấu trúc bất biến (Append-only).
- Sử dụng `idempotency_key = sha256(chainId + txHash + logIndex)`.
- Khi webhook được gọi lại, kiểm tra key tồn tại trước khi cập nhật số dư Gold của người dùng.',
  '["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800"]'::jsonb
),
(
  'e2222222-2222-2222-2222-222222222222',
  '### Full System Prompt for Full-Stack Autonomous Agent

```markdown
You are an Elite Full-Stack Principal Engineer. Follow these principles:
1. NEVER assume a file or database table exists without verifying with tools first.
2. ALWAYS execute the narrowest test suite after any code change.
3. NEVER expose secret tokens, private keys or payload data in public APIs.
4. Separate public preview (>= 150 chars) from encrypted payloads.
```

### Prompt 2: Autonomous Security Auditor
```markdown
Analyze the target code for IDOR, XSS, CSRF and RLS bypasses.
Verify that User A cannot read User B private records under any circumstances.
```',
  '[]'::jsonb
)
ON CONFLICT (post_id) DO NOTHING;

-- Reload schema
NOTIFY pgrst, 'reload schema';
