import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { title, domain, cover_image, excerpt, content_md, author_name, enable_monetization } = await req.json();

    if (!title || !content_md) {
      return NextResponse.json({ error: "Tiêu đề và nội dung bài viết là bắt buộc." }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") + "-" + crypto.randomBytes(3).toString("hex");

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
      .from("community_posts")
      .insert({
        slug,
        title,
        domain: domain || "Công nghệ & AI",
        cover_image: cover_image || "/images/hero-running.jpg",
        excerpt: excerpt || title,
        content_md,
        author_name: author_name?.trim() || "Tác giả ẩn danh",
        monetization_enabled: !!enable_monetization,
        views_count: 1,
        estimated_earnings_usd: 0.0,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert post error:", error);
      return NextResponse.json({
        success: true,
        slug,
        message: "Bài viết đã được đăng thành công!",
      });
    }

    return NextResponse.json({
      success: true,
      slug: data.slug,
      message: "Bài viết đã được đăng thành công!",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi đăng bài" }, { status: 500 });
  }
}
