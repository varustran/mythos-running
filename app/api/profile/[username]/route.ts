import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username: rawUsername } = await params;
    const cleanUsername = decodeURIComponent(rawUsername).replace(/^@/, "").trim().toLowerCase();

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Query profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, user_id, email, username, full_name, avatar_url, bio, verified, streak_days, created_at, role, wallet_address, points_balance, gold_balance")
      .ilike("username", cleanUsername)
      .maybeSingle();

    if (error || !profile) {
      // Fallback for default admin handle
      if (cleanUsername === "myso") {
        return NextResponse.json({
          profile: {
            username: "myso",
            full_name: "Myso Team",
            avatar_url: "/favicon.svg",
            cover_url: null,
            bio: "Tài khoản chính thức của Đội ngũ Phát triển Nền tảng Myso.",
            interests: ["Công nghệ", "Cộng đồng", "Wiki", "Bảo mật"],
            skills: ["Fullstack", "Product Design", "Security"],
            topics: ["Myso Core", "Open Source"],
            verified: true,
            streak_days: 12,
            followers_count: 320,
            following_count: 5,
            posts_count: 12,
            wiki_count: 4,
            communities_count: 4,
            created_at: "2026-01-01T00:00:00Z",
            role: "admin",
            is_self: user?.email === "chuitv1907@gmail.com",
            is_following: false,
          },
        });
      }
      return NextResponse.json({ error: "Không tìm thấy hồ sơ người dùng" }, { status: 404 });
    }

    const isSelf = user ? (profile.user_id === user.id || profile.id === user.id || user.email === profile.email) : false;

    // Real followers count
    const { count: realFollowersCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .ilike("following_handle", cleanUsername);

    // Real following count
    const { count: realFollowingCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .ilike("follower_handle", cleanUsername);

    // Real posts count from social_posts table
    const { count: realPostsCount } = await supabase
      .from("social_posts")
      .select("*", { count: "exact", head: true })
      .ilike("author_handle", cleanUsername);

    // Real Wiki contributions count
    let wikiCount = 0;
    try {
      const { count } = await supabase
        .from("wiki_revisions")
        .select("*", { count: "exact", head: true })
        .ilike("author_handle", cleanUsername);
      wikiCount = count || 0;
    } catch {
      wikiCount = 0;
    }

    // Check if the current logged-in user is following this profile
    let isFollowing = false;
    if (user && !isSelf) {
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("username")
        .or(`user_id.eq.${user.id},id.eq.${user.id},email.eq.${user.email}`)
        .maybeSingle();

      const myHandle = (myProfile?.username || user.email?.split("@")[0] || "").toLowerCase();
      if (myHandle) {
        const { data: followRecord } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_handle", myHandle)
          .ilike("following_handle", cleanUsername)
          .maybeSingle();
        isFollowing = Boolean(followRecord);
      }
    }

    return NextResponse.json({
      profile: {
        ...profile,
        cover_url: null,
        interests: ["Công nghệ", "AI", "Web3"],
        skills: ["Tri thức số", "Sáng tạo nội dung"],
        topics: ["Myso Web2.5"],
        followers_count: realFollowersCount ?? 0,
        following_count: realFollowingCount ?? 0,
        posts_count: realPostsCount ?? 0,
        wiki_count: wikiCount,
        communities_count: 1,
        is_self: isSelf,
        is_following: isFollowing,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi máy chủ" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username: rawUsername } = await params;
    const cleanUsername = decodeURIComponent(rawUsername).replace(/^@/, "").trim().toLowerCase();

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { full_name, bio, avatar_url, cover_url, interests, skills, topics } = body;

    const updateFields: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (full_name && full_name.trim()) updateFields.full_name = full_name.trim();
    if (bio !== undefined) updateFields.bio = bio ? bio.trim() : null;
    if (avatar_url !== undefined) updateFields.avatar_url = avatar_url;

    const { data: updated, error } = await supabase
      .from("profiles")
      .update(updateFields)
      .or(`id.eq.${user.id},user_id.eq.${user.id},email.eq.${user.email}`)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update profile" }, { status: 500 });
  }
}
