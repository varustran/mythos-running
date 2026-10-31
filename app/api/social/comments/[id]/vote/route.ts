import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { vote_type } = await req.json(); // 1 for upvote, -1 for downvote, 0 to cancel

    if (!id) {
      return NextResponse.json({ error: "Missing comment ID" }, { status: 400 });
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

    const { data: comment } = await supabase
      .from("social_comments")
      .select("id, upvotes_count")
      .eq("id", id)
      .maybeSingle();

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const currentCount = Number(comment.upvotes_count || 0);
    const delta = vote_type === -1 ? -1 : 1;
    const newCount = Math.max(0, currentCount + delta);

    await supabase
      .from("social_comments")
      .update({ upvotes_count: newCount, likes_count: newCount })
      .eq("id", id);

    return NextResponse.json({ success: true, upvotes_count: newCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to vote comment" }, { status: 500 });
  }
}
