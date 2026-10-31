import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "root",
  "system",
  "myso",
  "api",
  "wiki",
  "login",
  "auth",
  "settings",
  "onboarding",
  "profile",
  "u",
  "user",
  "help",
  "support",
  "terms",
  "privacy",
  "legal",
]);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUsername = searchParams.get("username") || "";
    const username = rawUsername.trim().toLowerCase().replace(/^@/, "");

    if (!username) {
      return NextResponse.json({ available: false, reason: "Tên người dùng không được để trống" });
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({ available: false, reason: "Độ dài từ 3 đến 20 ký tự" });
    }

    if (!/^[a-z0-9_]+$/.test(username)) {
      return NextResponse.json({
        available: false,
        reason: "Chỉ được chứa chữ thường (a-z), chữ số (0-9) và dấu gạch dưới (_)",
      });
    }

    if (RESERVED_USERNAMES.has(username)) {
      return NextResponse.json({ available: false, reason: "Tên định danh này đã được hệ thống bảo lưu" });
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

    const { data: existing } = await supabase
      .from("profiles")
      .select("id, user_id, username")
      .ilike("username", username)
      .maybeSingle();

    if (existing) {
      // If belongs to current user, it's available for them
      if (user && (existing.user_id === user.id || existing.id === user.id)) {
        return NextResponse.json({ available: true, isCurrent: true });
      }
      return NextResponse.json({ available: false, reason: "Tên định danh này đã có người sử dụng" });
    }

    return NextResponse.json({ available: true });
  } catch (err: any) {
    return NextResponse.json({ available: false, reason: "Lỗi kiểm tra" }, { status: 500 });
  }
}
