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
    const { article_slug, title, summary, content_md, sources } = body;

    if (!title || !content_md) {
      return NextResponse.json({ error: "Tiêu đề và nội dung là bắt buộc." }, { status: 400 });
    }

    // Strict citation requirement for community wiki edits!
    const validSources = Array.isArray(sources) ? sources.filter((s: string) => s && s.trim().startsWith("http")) : [];
    if (validSources.length === 0) {
      return NextResponse.json(
        { error: "Đóng góp Wiki bắt buộc phải có ít nhất 1 nguồn trích dẫn / tài liệu tham khảo hợp lệ (URL bắt đầu bằng http/https)." },
        { status: 400 }
      );
    }

    const clientIp = getClientIp(req);
    const ipHash = hashIp(clientIp);
    const slug = article_slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

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
      .from("wiki_revisions")
      .insert({
        article_slug: slug,
        title,
        summary: summary || title,
        content_md,
        sources: validSources,
        author_ip_hash: ipHash,
        status: "pending",
        approval_count: 0,
        approved_ip_hashes: [],
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert revision error:", error);
      return NextResponse.json({ error: "Không thể lưu đề xuất kiểm duyệt.", details: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Đề xuất đã được gửi vào Hàng đợi kiểm duyệt 2-Peer. Cần 2 người dùng khác IP duyệt để chính thức cập nhật vào Myso Wiki.",
      revision: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi hệ thống" }, { status: 500 });
  }
}
