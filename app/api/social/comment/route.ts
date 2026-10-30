import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const post_id = searchParams.get("post_id");

    if (!post_id) {
      return NextResponse.json({ error: "post_id is required" }, { status: 400 });
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

    const { data: comments } = await supabase
      .from("social_comments")
      .select("*")
      .eq("post_id", post_id)
      .order("created_at", { ascending: true });

    return NextResponse.json({ comments: comments || [] });
  } catch (err: any) {
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { post_id, author_name, author_handle, author_avatar, content } = body;

    if (!post_id || !content || !content.trim()) {
      return NextResponse.json(
        { error: "Nội dung bình luận không được để trống." },
        { status: 400 }
      );
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

    const { data: comment, error } = await supabase
      .from("social_comments")
      .insert({
        post_id,
        author_name: author_name?.trim() || "Thành viên Myso",
        author_handle: (author_handle?.trim() || "user").replace(/^@/, ""),
        author_avatar: author_avatar || null,
        content: content.trim(),
        likes_count: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Increment comments_count in social_posts
    const { data: post } = await supabase
      .from("social_posts")
      .select("comments_count")
      .eq("id", post_id)
      .single();

    const currentCount = post?.comments_count || 0;
    await supabase
      .from("social_posts")
      .update({ comments_count: currentCount + 1 })
      .eq("id", post_id);

    return NextResponse.json({ success: true, comment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi gửi bình luận" }, { status: 500 });
  }
}
