import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
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
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await req.json();
    const {
      onboarding_step,
      full_name,
      username,
      avatar_url,
      cover_url,
      bio,
      interests,
      skills,
      onboarding_completed,
    } = body;

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof full_name === "string" && full_name.trim()) {
      updatePayload.full_name = full_name.trim();
    }
    if (typeof username === "string" && username.trim()) {
      updatePayload.username = username.trim().toLowerCase().replace(/^@/, "");
    }
    if (avatar_url !== undefined) {
      updatePayload.avatar_url = avatar_url;
    }
    if (bio !== undefined) {
      updatePayload.bio = bio ? bio.trim() : null;
    }

    // Update profile
    const { data: updated, error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .or(`user_id.eq.${user.id},id.eq.${user.id},email.eq.${user.email}`)
      .select()
      .single();

    if (error) {
      console.error("Onboarding update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update onboarding" }, { status: 500 });
  }
}
