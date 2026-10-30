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
    const { revision_id } = await req.json();
    if (!revision_id) {
      return NextResponse.json({ error: "Thiếu ID đề xuất kiểm duyệt." }, { status: 400 });
    }

    const clientIp = getClientIp(req);
    const reviewerIpHash = hashIp(clientIp);

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

    // 1. Fetch current revision
    const { data: rev, error: fetchErr } = await supabase
      .from("wiki_revisions")
      .select("*")
      .eq("id", revision_id)
      .single();

    if (fetchErr || !rev) {
      return NextResponse.json({ error: "Không tìm thấy đề xuất này." }, { status: 404 });
    }

    if (rev.status === "approved") {
      return NextResponse.json({ message: "Đề xuất này đã được phê duyệt và đưa vào bách khoa chính thức." });
    }

    // 2. Strict Rules: Author cannot approve their own submission
    if (rev.author_ip_hash === reviewerIpHash) {
      return NextResponse.json(
        { error: "Tác giả đề xuất không được tự phê duyệt cho chính mình. Cần người dùng độc lập khác IP kiểm duyệt." },
        { status: 403 }
      );
    }

    // 3. Strict Rules: Same reviewer IP cannot vote twice
    const existingReviewers: string[] = rev.approved_ip_hashes || [];
    if (existingReviewers.includes(reviewerIpHash)) {
      return NextResponse.json(
        { error: "Địa chỉ IP của bạn đã bỏ phiếu phê duyệt đề xuất này trước đó." },
        { status: 403 }
      );
    }

    // 4. Update approval
    const newApprovals = (rev.approval_count || 0) + 1;
    const updatedApprovedIps = [...existingReviewers, reviewerIpHash];
    const isNowApproved = newApprovals >= 2;

    const { error: updateErr } = await supabase
      .from("wiki_revisions")
      .update({
        approval_count: newApprovals,
        approved_ip_hashes: updatedApprovedIps,
        status: isNowApproved ? "approved" : "pending",
      })
      .eq("id", revision_id);

    if (updateErr) {
      return NextResponse.json({ error: "Không thể cập nhật trạng thái duyệt." }, { status: 500 });
    }

    // 5. If reached 2 approvals: Merge directly into canonical wiki_articles!
    if (isNowApproved) {
      await supabase
        .from("wiki_articles")
        .upsert(
          {
            slug: rev.article_slug,
            title: rev.title,
            summary: rev.summary,
            content_md: rev.content_md,
            sources: rev.sources,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "slug" }
        );
    }

    return NextResponse.json({
      success: true,
      approval_count: newApprovals,
      approved: isNowApproved,
      message: isNowApproved
        ? "Đề xuất đã đạt đủ 2/2 lượt phê duyệt từ 2 IP độc lập và được chính thức cập nhật vào Myso Wiki!"
        : `Bạn đã phê duyệt thành công. Tiến độ hiện tại: ${newApprovals}/2 phiếu. Cần thêm 1 phiếu từ IP khác để hoàn tất.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi xử lý duyệt" }, { status: 500 });
  }
}
