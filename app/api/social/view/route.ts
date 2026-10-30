import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { post_id, viewer_handle } = await req.json();

    if (!post_id) {
      return NextResponse.json({ error: "Missing post_id" }, { status: 400 });
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

    // Fetch current views
    const { data: post } = await supabase
      .from("social_posts")
      .select("views_count")
      .eq("id", post_id)
      .single();

    const newViews = (post?.views_count || 0) + 1;

    // Update views_count
    await supabase
      .from("social_posts")
      .update({ views_count: newViews })
      .eq("id", post_id);

    return NextResponse.json({ success: true, views_count: newViews });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to record view" }, { status: 500 });
  }
}
