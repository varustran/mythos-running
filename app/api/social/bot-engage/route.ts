import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const COMMUNITY_BOTS = [
  { name: "Myso Bot Thảo Luận", handle: "myso_spark", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" },
  { name: "Tech Curator AI", handle: "tech_curator", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
  { name: "Cộng Đồng Sáng Tạo", handle: "creative_hub", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
];

export async function POST(req: Request) {
  try {
    const { post_id } = await req.json();
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

    // Increment like on the post to simulate natural community reception
    const { data: post } = await supabase
      .from("social_posts")
      .select("likes_count")
      .eq("id", post_id)
      .single();

    if (post) {
      const updatedLikes = (post.likes_count || 0) + 1;
      await supabase
        .from("social_posts")
        .update({ likes_count: updatedLikes })
        .eq("id", post_id);

      const bot = COMMUNITY_BOTS[Math.floor(Math.random() * COMMUNITY_BOTS.length)];

      return NextResponse.json({
        success: true,
        likes_count: updatedLikes,
        engaged_by: bot.handle,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
