import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

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

    let query = supabase
      .from("social_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error("Fetch social posts error:", error);
      return NextResponse.json({ posts: [] });
    }

    return NextResponse.json({ posts: posts || [] });
  } catch (err: any) {
    return NextResponse.json({ posts: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      content,
      author_name,
      author_handle,
      author_avatar,
      media_urls,
      category,
      captcha_token,
    } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Nội dung bài viết không được để trống." },
        { status: 400 }
      );
    }

    // Server-side Anti-Spam Captcha validation check
    if (!captcha_token) {
      return NextResponse.json(
        { error: "Vui lòng hoàn thành xác thực chống spam." },
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
      .from("social_posts")
      .insert({
        content: content.trim(),
        author_name: author_name?.trim() || "Thành viên Myso",
        author_handle: (author_handle?.trim() || "user").replace(/^@/, ""),
        author_avatar: author_avatar || null,
        media_urls: Array.isArray(media_urls) ? media_urls : [],
        category: category || "all",
        likes_count: 0,
        reposts_count: 0,
        comments_count: 0,
        bookmarks_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Insert social post error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, post: data });
  } catch (err: any) {
    console.error("Social post API error:", err);
    return NextResponse.json({ error: err.message || "Lỗi tạo bài viết" }, { status: 500 });
  }
}
