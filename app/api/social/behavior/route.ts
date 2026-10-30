import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { category, tags, action, user_handle } = await req.json();

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

    await supabase.from("user_behavior_logs").insert({
      user_handle: user_handle || "guest",
      action: action || "view",
      category: category || "general",
      tags: Array.isArray(tags) ? tags : [],
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    // Non-blocking telemetry
    return NextResponse.json({ success: false });
  }
}
