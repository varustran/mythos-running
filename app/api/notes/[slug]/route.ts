import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const url = new URL(req.url);
    const password = url.searchParams.get("password");

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

    const { data: note, error } = await supabase
      .from("notes")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !note) {
      return NextResponse.json({ error: "Ghi chú không tồn tại hoặc đã hết hạn." }, { status: 404 });
    }

    // Check expiration
    if (note.expires_at && new Date(note.expires_at) < new Date()) {
      await supabase.from("notes").delete().eq("slug", slug);
      return NextResponse.json({ error: "Ghi chú này đã hết hạn lưu trữ." }, { status: 410 });
    }

    // Password verification
    if (note.is_password_protected) {
      if (!password) {
        return NextResponse.json({
          note: {
            title: note.title,
            is_password_protected: true,
            burn_after_read: note.burn_after_read,
          },
        });
      }

      const inputHash = crypto.createHash("sha256").update(password.trim()).digest("hex");
      if (inputHash !== note.password_hash) {
        return NextResponse.json({ error: "Mật khẩu không chính xác." }, { status: 401 });
      }
    }

    // If burn after read: delete immediately upon view!
    if (note.burn_after_read) {
      await supabase.from("notes").delete().eq("slug", slug);
    } else {
      await supabase.from("notes").update({ views_count: (note.views_count || 0) + 1 }).eq("slug", slug);
    }

    return NextResponse.json({
      note: {
        title: note.title,
        content: note.content,
        is_password_protected: note.is_password_protected,
        burn_after_read: note.burn_after_read,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi xử lý ghi chú" }, { status: 500 });
  }
}
