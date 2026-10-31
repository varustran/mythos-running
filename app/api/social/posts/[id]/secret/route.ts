import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
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

    // Get Post
    const { data: post, error: postErr } = await supabase
      .from("social_posts")
      .select("id, author_id, author_handle, is_locked, unlock_price_gold, unlock_price_points, payload_metadata")
      .eq("id", id)
      .maybeSingle();

    if (postErr || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (!post.is_locked) {
      return NextResponse.json({
        unlocked: true,
        is_locked: false,
        secret_content: null,
      });
    }

    // Check user auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userHandle: string | null = null;
    if (user) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("username")
        .or(`id.eq.${user.id},user_id.eq.${user.id},email.eq.${user.email}`)
        .maybeSingle();
      userHandle = prof?.username || null;
    }

    const isAuthor =
      user &&
      (post.author_id === user.id ||
        (userHandle &&
          post.author_handle?.toLowerCase() === userHandle.toLowerCase()));

    const isRootAdmin = user?.email === "chuitv1907@gmail.com";

    if (isAuthor || isRootAdmin) {
      const { data: secret } = await supabase
        .from("post_secrets")
        .select("secret_content")
        .eq("post_id", id)
        .maybeSingle();

      return NextResponse.json({
        unlocked: true,
        is_author: true,
        secret_content: secret?.secret_content || "",
        attachments: [],
      });
    }

    // Check post_unlocks
    if (user) {
      const { data: unlockRecord } = await supabase
        .from("post_unlocks")
        .select("id, payment_method, amount_paid, created_at")
        .eq("post_id", id)
        .or(`user_id.eq.${user.id},user_handle.ilike.${userHandle || "none"}`)
        .maybeSingle();

      if (unlockRecord) {
        const { data: secret } = await supabase
          .from("post_secrets")
          .select("secret_content")
          .eq("post_id", id)
          .maybeSingle();

        return NextResponse.json({
          unlocked: true,
          unlocked_at: unlockRecord.created_at,
          secret_content: secret?.secret_content || "",
          attachments: [],
        });
      }
    }

    return NextResponse.json(
      {
        unlocked: false,
        is_locked: true,
        unlock_price_gold: post.unlock_price_gold || 0,
        unlock_price_points: post.unlock_price_points || 0,
        payload_metadata: post.payload_metadata,
      },
      { status: 403 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load secret payload" },
      { status: 500 }
    );
  }
}
