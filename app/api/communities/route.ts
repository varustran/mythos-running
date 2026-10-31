import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
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

    const { data: communities, error } = await supabase
      .from("communities")
      .select("*")
      .order("members_count", { ascending: false });

    if (error) {
      return NextResponse.json({ communities: [] });
    }

    return NextResponse.json({ communities: communities || [] });
  } catch (err: any) {
    return NextResponse.json({ communities: [] });
  }
}

export async function POST(req: Request) {
  try {
    const { community_id, action, user_handle } = await req.json(); // action: "join" | "leave"
    if (!community_id || !action) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
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
    } = await supabase.auth.getUser();

    const handle =
      user?.user_metadata?.username ||
      user?.email?.split("@")[0] ||
      user_handle ||
      "guest";

    if (action === "join") {
      await supabase.from("community_members").upsert(
        { community_id, user_handle: handle, role: "member" },
        { onConflict: "community_id, user_handle" }
      );
    } else if (action === "leave") {
      await supabase
        .from("community_members")
        .delete()
        .eq("community_id", community_id)
        .eq("user_handle", handle);
    }

    // Update community members count
    const { count } = await supabase
      .from("community_members")
      .select("*", { count: "exact", head: true })
      .eq("community_id", community_id);

    await supabase
      .from("communities")
      .update({ members_count: count || 0 })
      .eq("id", community_id);

    return NextResponse.json({ success: true, members_count: count || 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
