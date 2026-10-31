import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
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

    const { data: post, error } = await supabase
      .from("social_posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Privacy logic:
    // 1. If public -> 200 OK
    // 2. If unlisted -> 200 OK (anyone with direct URL is permitted)
    // 3. If private -> Only owner or root admin can view!
    if (post.visibility === "private") {
      if (!user) {
        return NextResponse.json({ error: "Bài viết này được đặt ở chế độ Riêng tư." }, { status: 403 });
      }

      const isAuthor = post.author_id === user.id;
      const isAdmin = user.email === "chuitv1907@gmail.com";

      if (!isAuthor && !isAdmin) {
        return NextResponse.json({ error: "Bạn không có quyền xem bài viết riêng tư này." }, { status: 403 });
      }
    }

    // Increment view count
    try {
      await supabase.rpc("increment_post_views", { p_id: id });
    } catch {
      await supabase
        .from("social_posts")
        .update({ views_count: (post.views_count || 0) + 1 })
        .eq("id", id);
    }

    return NextResponse.json({ post });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check ownership
    const { data: post } = await supabase
      .from("social_posts")
      .select("author_id, author_handle")
      .eq("id", id)
      .maybeSingle();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isAuthor = post.author_id === user.id;
    const isAdmin = user.email === "chuitv1907@gmail.com";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: You are not the author" }, { status: 403 });
    }

    const { error: delErr } = await supabase.from("social_posts").delete().eq("id", id);
    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete" }, { status: 500 });
  }
}
