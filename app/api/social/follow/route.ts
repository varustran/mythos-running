import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { target_handle } = await req.json();
    const cleanTarget = (target_handle || "").trim().toLowerCase().replace(/^@/, "");

    if (!cleanTarget) {
      return NextResponse.json({ error: "Missing target handle" }, { status: 400 });
    }

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
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để theo dõi" }, { status: 401 });
    }

    // Get current user profile
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("id, username")
      .or(`user_id.eq.${user.id},id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    const myHandle = (myProfile?.username || user.email?.split("@")[0] || "user").toLowerCase();

    if (myHandle === cleanTarget) {
      return NextResponse.json({ error: "Bạn không thể tự theo dõi chính mình" }, { status: 400 });
    }

    // Check existing follow
    const { data: existingFollow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_handle", myHandle)
      .eq("following_handle", cleanTarget)
      .maybeSingle();

    let isFollowing = false;

    if (existingFollow) {
      // Unfollow
      await supabase.from("follows").delete().eq("id", existingFollow.id);
      isFollowing = false;
    } else {
      // Follow
      await supabase.from("follows").insert({
        follower_handle: myHandle,
        following_handle: cleanTarget,
      });
      isFollowing = true;
    }

    // Recompute target followers count
    const { count: followersCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_handle", cleanTarget);

    // Recompute my following count
    const { count: myFollowingCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_handle", myHandle);

    // Update target profile
    await supabase
      .from("profiles")
      .update({ followers_count: followersCount || 0 })
      .ilike("username", cleanTarget);

    // Update my profile
    await supabase
      .from("profiles")
      .update({ following_count: myFollowingCount || 0 })
      .ilike("username", myHandle);

    return NextResponse.json({
      success: true,
      is_following: isFollowing,
      followers_count: followersCount || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to toggle follow" }, { status: 500 });
  }
}
