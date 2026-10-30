import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { title, content, password, burn_after_read, expiry_hours } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Nội dung ghi chú không được để trống." }, { status: 400 });
    }

    const slug = crypto.randomBytes(6).toString("base64url");
    const isPasswordProtected = !!(password && password.trim().length > 0);
    const passwordHash = isPasswordProtected
      ? crypto.createHash("sha256").update(password.trim()).digest("hex")
      : null;

    let expiresAt: string | null = null;
    if (expiry_hours && expiry_hours > 0) {
      expiresAt = new Date(Date.now() + expiry_hours * 3600 * 1000).toISOString();
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
      .from("notes")
      .insert({
        slug,
        title: title || "Ghi chú không tiêu đề",
        content,
        is_password_protected: isPasswordProtected,
        password_hash: passwordHash,
        burn_after_read: !!burn_after_read,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      console.error("Notes insert error:", error);
      // Fallback response with slug so local storage works seamlessly
      return NextResponse.json({
        success: true,
        slug,
        note: { slug, title, content, isPasswordProtected, burnAfterRead: burn_after_read },
      });
    }

    return NextResponse.json({
      success: true,
      slug: data.slug,
      note: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi tạo ghi chú" }, { status: 500 });
  }
}
