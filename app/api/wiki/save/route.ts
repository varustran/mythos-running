import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

function hashIp(ip: string): string {
  const salt = process.env.IP_SALT || "myso_peer_verification_secret_salt_2026";
  return crypto.createHash("sha256").update(ip + salt).digest("hex").slice(0, 16);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, title, summary, content_md, edit_summary } = body;

    if (!title || !content_md || !slug) {
      return NextResponse.json(
        { error: "Slug, tiêu đề và nội dung bài viết là bắt buộc." },
        { status: 400 }
      );
    }

    const clientIp = getClientIp(req);
    const ipHash = hashIp(clientIp);

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

    // 1. Direct update or insert into wiki_articles
    const { error: articleError } = await supabase
      .from("wiki_articles")
      .upsert(
        {
          slug,
          title,
          summary: summary || title.slice(0, 150),
          content_md,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" }
      );

    if (articleError) {
      console.error("Supabase wiki upsert error:", articleError);
      return NextResponse.json({ error: articleError.message }, { status: 500 });
    }

    // 2. Insert revision log for Wikipedia history tracking
    await supabase.from("wiki_revisions").insert({
      article_slug: slug,
      title,
      summary: edit_summary || "Chỉnh sửa bài viết trực tiếp",
      content_md,
      author_ip_hash: ipHash,
      status: "approved",
      approval_count: 2,
    });

    return NextResponse.json({
      success: true,
      slug,
      message: "Bài viết đã được lưu và cập nhật công khai trên Myso Wiki.",
    });
  } catch (err: any) {
    console.error("Wiki save API error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
