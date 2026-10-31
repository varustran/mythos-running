import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("post_id");
    const authorHandle = searchParams.get("author_handle");

    if (!postId && !authorHandle) {
      return NextResponse.json({ comments: [] });
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

    let query = supabase.from("social_comments").select("*");

    if (postId) {
      query = query.eq("post_id", postId).order("created_at", { ascending: true });
    } else if (authorHandle) {
      const cleanHandle = authorHandle.replace(/^@/, "").trim().toLowerCase();
      query = query.ilike("author_handle", cleanHandle).order("created_at", { ascending: false }).limit(50);
    }

    const { data: comments, error } = await query;

    if (error) {
      return NextResponse.json({ comments: [] });
    }

    return NextResponse.json({ comments: comments || [] });
  } catch (err: any) {
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(req: Request) {
  try {
    const { post_id, content, author_name, author_handle, author_avatar, parent_id } =
      await req.json();

    if (!post_id || !content || !content.trim()) {
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const name = author_name || user?.user_metadata?.full_name || "Thành viên Myso";
    const handle = author_handle || user?.user_metadata?.username || user?.email?.split("@")[0] || "user";
    const avatar = author_avatar || user?.user_metadata?.avatar_url || null;

    let depth = 0;
    if (parent_id) {
      const { data: parentComment } = await supabase
        .from("social_comments")
        .select("depth")
        .eq("id", parent_id)
        .maybeSingle();
      depth = Math.min((parentComment?.depth ?? 0) + 1, 3);
    }

    const { data: comment, error } = await supabase
      .from("social_comments")
      .insert({
        post_id,
        content: content.trim(),
        author_name: name,
        author_handle: handle.replace(/^@/, ""),
        author_avatar: avatar,
        parent_id: parent_id || null,
        depth,
        likes_count: 0,
        upvotes_count: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Increment comments_count on post
    try {
      await supabase.rpc("increment_comments_count", { p_id: post_id });
    } catch {
      // Fallback direct update
      const { data: postData } = await supabase
        .from("social_posts")
        .select("comments_count")
        .eq("id", post_id)
        .single();
      if (postData) {
        await supabase
          .from("social_posts")
          .update({ comments_count: (postData.comments_count || 0) + 1 })
          .eq("id", post_id);
      }
    }

    return NextResponse.json({ comment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create comment" }, { status: 500 });
  }
}
