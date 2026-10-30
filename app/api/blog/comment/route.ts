import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
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

    const { data, error } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_slug", slug)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ comments: [] });
    }

    return NextResponse.json({ comments: data || [] });
  } catch (err: any) {
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { post_slug, author_name, content } = body;

    if (!post_slug || !content || !content.trim()) {
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

    const { data, error } = await supabase
      .from("post_comments")
      .insert({
        post_slug,
        author_name: author_name?.trim() || "Thành viên Myso",
        content: content.trim(),
        upvotes: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Comment insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, comment: data });
  } catch (err: any) {
    console.error("Comment API error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
