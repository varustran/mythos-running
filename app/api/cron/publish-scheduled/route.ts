import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
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

    const nowIso = new Date().toISOString();

    // Find all scheduled posts that are due to be published
    const { data: duePosts, error: findError } = await supabase
      .from("social_posts")
      .select("id, author_handle, scheduled_at")
      .eq("status", "scheduled")
      .lte("scheduled_at", nowIso);

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    if (!duePosts || duePosts.length === 0) {
      return NextResponse.json({ published_count: 0, message: "No scheduled posts pending publication." });
    }

    const idsToPublish = duePosts.map((p) => p.id);

    // Update their status to published
    const { error: updateError } = await supabase
      .from("social_posts")
      .update({ status: "published" })
      .in("id", idsToPublish);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      published_count: idsToPublish.length,
      published_ids: idsToPublish,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process scheduler" }, { status: 500 });
  }
}
