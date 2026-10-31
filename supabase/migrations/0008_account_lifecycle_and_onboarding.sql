-- Migration 0008: Complete Account Lifecycle, Onboarding, and User ID Normalization

-- 1. Ensure user_id in public.profiles is properly indexed and uniquely references auth.users
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS topics TEXT[] DEFAULT '{}';

-- 2. Clean up roles constraint: default is 'user'
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'contributor', 'editor', 'moderator', 'admin'));

-- 3. Link existing orphaned profiles to auth.users by email
UPDATE public.profiles p
SET user_id = u.id
FROM auth.users u
WHERE p.email = u.email AND (p.user_id IS NULL OR p.user_id != u.id);

-- Ensure chuitv1907@gmail.com is admin and marked as completed onboarding
UPDATE public.profiles
SET role = 'admin', verified = TRUE, onboarding_completed = TRUE
WHERE email = 'chuitv1907@gmail.com';

-- Ensure varustran / hieuan110@gmail.com is marked as completed
UPDATE public.profiles
SET onboarding_completed = TRUE
WHERE email = 'hieuan110@gmail.com';

-- 4. Unique constraint on user_id so one user has at most one profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_unique'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- 5. Safe idempotent trigger for newly registered auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  initial_name TEXT;
  initial_username TEXT;
  initial_role TEXT := 'user';
BEGIN
  initial_name := COALESCE(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(new.email, '@', 1)
  );
  
  initial_username := COALESCE(
    new.raw_user_meta_data ->> 'username',
    split_part(new.email, '@', 1)
  );

  IF new.email = 'chuitv1907@gmail.com' THEN
    initial_role := 'admin';
  END IF;

  INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    username,
    avatar_url,
    role,
    onboarding_completed,
    onboarding_step
  ) VALUES (
    new.id,
    new.email,
    initial_name,
    initial_username,
    new.raw_user_meta_data ->> 'avatar_url',
    initial_role,
    (new.email = 'chuitv1907@gmail.com'),
    1
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Prevent auth failure if profile insertion fails; profile will be created on first login
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. RLS Policies on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on profiles" ON public.profiles;
CREATE POLICY "Allow public read on profiles" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
CREATE POLICY "Allow users to insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = id);

-- 7. Follows / Relationships Table Enhancement
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_handle TEXT NOT NULL,
  following_handle TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(follower_handle, following_handle)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on follows" ON public.follows;
CREATE POLICY "Allow public read on follows" ON public.follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on follows" ON public.follows;
CREATE POLICY "Allow public insert on follows" ON public.follows FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete on follows" ON public.follows;
CREATE POLICY "Allow public delete on follows" ON public.follows FOR DELETE USING (true);

-- Reload schema
NOTIFY pgrst, 'reload schema';
