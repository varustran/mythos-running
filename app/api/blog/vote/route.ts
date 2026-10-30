import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { target, id, slug, delta } = body; // target: 'post' | 'comment', delta: 1 | -1

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

    if (target === "comment" && id) {
      // Get current upvotes
      const { data: current } = await supabase
        .from("post_comments")
        .select("upvotes")
        .eq("id", id)
        .single();

      const newVotes = Math.max(0, (current?.upvotes || 0) + change);
      await supabase.from("post_comments").update({ upvotes: newVotes }).eq("id", id);
      return NextResponse.json({ success: true, newVotes });
    }

    if (target === "post" && slug) {
      const { data: current } = await supabase
        .from("community_posts")
        .select("upvotes")
        .eq("slug", slug)
        .single();

      const newVotes = Math.max(0, (current?.upvotes || 0) + change);
      await supabase.from("community_posts").update({ upvotes: newVotes }).eq("slug", slug);
      return NextResponse.json({ success: true, newVotes });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to vote" }, { status: 500 });
  }
}
