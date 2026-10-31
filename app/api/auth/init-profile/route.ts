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
      return NextResponse.json({ error: "Chưa đăng nhập Supabase" }, { status: 401 });
    }

    // 1. Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .or(`user_id.eq.${user.id},id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (existingProfile) {
      // If user_id is missing, update it
      if (!existingProfile.user_id) {
        await supabase
          .from("profiles")
          .update({ user_id: user.id })
          .eq("id", existingProfile.id);
      }
      return NextResponse.json({ profile: existingProfile, initialized: false });
    }

    // 2. Initialize new profile safely
    const isRootAdmin = user.email === "chuitv1907@gmail.com";
    const defaultName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Thành viên Myso";

    const baseUsername = (user.email?.split("@")[0] || "user")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "");

    // Check username collision
    let chosenUsername = baseUsername;
    const { data: collision } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", chosenUsername)
      .maybeSingle();

    if (collision) {
      chosenUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const newProfileData = {
      user_id: user.id,
      email: user.email,
      full_name: defaultName,
      username: chosenUsername,
      avatar_url: user.user_metadata?.avatar_url || null,
      role: isRootAdmin ? "admin" : "user",
    };

    const { data: created, error: insertError } = await supabase
      .from("profiles")
      .insert(newProfileData)
      .select()
      .single();

    if (insertError) {
      console.error("Init profile error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ profile: created, initialized: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to initialize profile" }, { status: 500 });
  }
}
