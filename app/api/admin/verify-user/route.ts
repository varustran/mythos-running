import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const ROOT_ADMIN_EMAIL = "chuitv1907@gmail.com";

export async function POST(req: Request) {
  try {
    const { user_id, email, username, verify_status, requester_email } = await req.json();

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

    // Verify root admin authorization
    // In production, we verify either by session or by explicit verification check
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser();

    const currentEmail = sessionUser?.email || requester_email;

    if (currentEmail !== ROOT_ADMIN_EMAIL) {
      return NextResponse.json(
        {
          error: "Truy cập bị từ chối: Chỉ tài khoản Quản trị viên tối cao (chuitv1907@gmail.com) mới có quyền cấp tích xanh xác thực.",
        },
        { status: 403 }
      );
    }

    // Update verified badge
    let query = supabase.from("profiles").update({ verified: !!verify_status });

    if (user_id) {
      query = query.eq("user_id", user_id);
    } else if (username) {
      query = query.eq("username", username);
    } else if (email) {
      query = query.eq("email", email);
    } else {
      return NextResponse.json({ error: "Thiếu thông tin người dùng cần cấp tích xanh" }, { status: 400 });
    }

    const { data, error } = await query.select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Đã ${verify_status ? "cấp" : "thu hồi"} Tích xanh Xác thực chính thức thành công.`,
      updated: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Admin authorization failure" }, { status: 500 });
  }
}
