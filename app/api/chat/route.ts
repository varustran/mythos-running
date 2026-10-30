import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user1 = searchParams.get("user1");
    const user2 = searchParams.get("user2");

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
      .from("direct_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(100);

    if (user1 && user2) {
      query = query.or(
        `and(sender_handle.eq.${user1},recipient_handle.eq.${user2}),and(sender_handle.eq.${user2},recipient_handle.eq.${user1})`
      );
    }

    const { data: messages, error } = await query;
    if (error) {
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (err: any) {
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sender_handle, sender_name, recipient_handle, encrypted_content, media_url } = body;

    if (!sender_handle || !recipient_handle || !encrypted_content || !encrypted_content.trim()) {
      return NextResponse.json(
        { error: "Nội dung tin nhắn và người nhận là bắt buộc." },
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

    const { data: message, error } = await supabase
      .from("direct_messages")
      .insert({
        sender_handle: sender_handle.replace(/^@/, ""),
        sender_name: sender_name || "Thành viên Myso",
        recipient_handle: recipient_handle.replace(/^@/, ""),
        encrypted_content: encrypted_content.trim(),
        media_url: media_url || null,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi gửi tin nhắn" }, { status: 500 });
  }
}
