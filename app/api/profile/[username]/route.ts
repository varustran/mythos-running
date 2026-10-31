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
      .select("id, user_id, username, full_name, avatar_url, cover_url, bio, interests, verified, streak_days, followers_count, following_count, created_at, role")
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
            verified: true,
            streak_days: 12,
            followers_count: 320,
            following_count: 5,
            created_at: "2026-01-01T00:00:00Z",
            role: "admin",
            is_self: user?.email === "chuitv1907@gmail.com",
          },
        });
      }
      return NextResponse.json({ error: "Không tìm thấy hồ sơ người dùng" }, { status: 404 });
    }

    const isSelf = user ? (profile.user_id === user.id || profile.id === user.id) : false;

    return NextResponse.json({
      profile: {
        ...profile,
        is_self: isSelf,
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
    const { full_name, bio, avatar_url, cover_url, interests } = body;

    const { data: updated, error } = await supabase
      .from("profiles")
      .update({
        full_name: full_name?.trim(),
        bio: bio?.trim(),
        avatar_url: avatar_url || null,
        cover_url: cover_url || null,
        interests: Array.isArray(interests) ? interests : [],
        updated_at: new Date().toISOString(),
      })
      .or(`id.eq.${user.id},user_id.eq.${user.id}`)
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
