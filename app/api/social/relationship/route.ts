import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get("user");
    const target = searchParams.get("target");

    if (!user || !target) {
      return NextResponse.json({ error: "Missing user or target parameter" }, { status: 400 });
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

    const { data: rel } = await supabase
      .from("social_relationships")
      .select("*")
      .or(`and(user_handle.eq.${user},target_handle.eq.${target}),and(user_handle.eq.${target},target_handle.eq.${user})`)
      .maybeSingle();

    return NextResponse.json({
      status: rel ? rel.status : "stranger", // 'friends' | 'pending' | 'stranger'
      relationship: rel || null,
    });
  } catch (err: any) {
    return NextResponse.json({ status: "stranger" });
  }
}

export async function POST(req: Request) {
  try {
    const { user_handle, target_handle, action } = await req.json(); // action: 'add_friend' | 'accept_friend' | 'block'

    if (!user_handle || !target_handle || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    const statusValue = action === "accept_friend" ? "friends" : action === "block" ? "blocked" : "pending";

    const { data, error } = await supabase
      .from("social_relationships")
      .upsert(
        {
          user_handle,
          target_handle,
          status: statusValue,
        },
        { onConflict: "user_handle,target_handle" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: statusValue, relationship: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update relationship" }, { status: 500 });
  }
}
