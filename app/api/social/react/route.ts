import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { post_id, type, delta } = await req.json(); // type: 'like' | 'repost' | 'bookmark'

    if (!post_id || !type) {
      return NextResponse.json({ error: "Missing post_id or type" }, { status: 400 });
    }

    const change = delta === -1 ? -1 : 1;
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

    const columnMap: Record<string, string> = {
      like: "likes_count",
      repost: "reposts_count",
      bookmark: "bookmarks_count",
    };

    const col = columnMap[type];
    if (!col) {
      return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
    }

    // Fetch current count
    const { data: post } = await supabase
      .from("social_posts")
      .select(col)
      .eq("id", post_id)
      .single();

    const currentCount = post ? (post as any)[col] || 0 : 0;
    const newCount = Math.max(0, currentCount + change);

    await supabase
      .from("social_posts")
      .update({ [col]: newCount })
      .eq("id", post_id);

    return NextResponse.json({ success: true, count: newCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to react" }, { status: 500 });
  }
}
