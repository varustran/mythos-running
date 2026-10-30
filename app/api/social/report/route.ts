import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

export async function POST(req: Request) {
  try {
    const { post_id, reason, details } = await req.json();

    if (!post_id || !reason) {
      return NextResponse.json({ error: "Thiếu thông tin báo cáo" }, { status: 400 });
    }

    const ip = getClientIp(req);
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

    const { error } = await supabase.from("post_reports").insert({
      post_id,
      reporter_ip: ip,
      reason,
      details: details || "",
      status: "pending",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Báo cáo của bạn đã được tiếp nhận. Đội ngũ kiểm duyệt Myso sẽ thẩm định trong vòng 24 giờ theo tiêu chuẩn pháp luật.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi gửi báo cáo" }, { status: 500 });
  }
}
