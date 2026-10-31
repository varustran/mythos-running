import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const feed = searchParams.get("feed") || "latest"; // "for_you", "latest", "popular", "following", "wiki", "communities"
    const authorHandle = searchParams.get("author_handle");
    const communityId = searchParams.get("community_id");
    const includeDrafts = searchParams.get("include_drafts") === "true";

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

    // Get current authenticated user to verify author ownership
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let currentUserHandle: string | null = null;
    if (user) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("username")
        .or(`id.eq.${user.id},user_id.eq.${user.id},email.eq.${user.email}`)
        .maybeSingle();
      currentUserHandle = prof?.username || null;
    }

    let query = supabase.from("social_posts").select("*");

    if (authorHandle) {
      query = query.ilike("author_handle", authorHandle.replace(/^@/, ""));
    }

    // Category filter
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    // Feed sorting
    if (feed === "popular") {
      query = query.order("likes_count", { ascending: false }).order("created_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    query = query.limit(50);

    const { data: posts, error } = await query;

    if (error) {
      console.error("Fetch social posts error:", error);
      return NextResponse.json({ posts: [] });
    }

    return NextResponse.json({ posts: posts || [] });
  } catch (err: any) {
    return NextResponse.json({ posts: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      content,
      author_name,
      author_handle,
      author_avatar,
      media_urls,
      category,
      custom_icon,
      visibility = "public",
      post_type = "text",
      status = "published",
      scheduled_at = null,
      community_id = "general",
      flair = null,
      poll_data = null,
      is_locked = false,
      public_preview = null,
      unlock_price_gold = 0,
      unlock_price_points = 0,
      secret_content = null,
    } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Nội dung bài viết không được để trống." },
        { status: 400 }
      );
    }

    // Validate visibility
    const safeVisibility = ["public", "private", "unlisted"].includes(visibility)
      ? visibility
      : "public";

    // Validate post_type
    const safePostType = [
      "text",
      "image",
      "video",
      "link",
      "question",
      "discussion",
      "poll",
      "wiki",
      "multi-image",
      "long-form",
    ].includes(post_type)
      ? post_type
      : "text";

    // Validate status
    const safeStatus = ["draft", "scheduled", "published", "archived"].includes(status)
      ? status
      : "published";

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

    const cleanHandle = (author_handle?.trim() || "user").replace(/^@/, "");
    const isMonetized = cleanHandle === "myso";

    const insertPayload: Record<string, any> = {
      content: content.trim(),
      author_id: user?.id || null,
      author_name: author_name?.trim() || "Thành viên Myso",
      author_handle: cleanHandle,
      author_avatar: author_avatar || null,
      media_urls: Array.isArray(media_urls) ? media_urls : [],
      category: category || "all",
      likes_count: 0,
      reposts_count: 0,
      comments_count: 0,
      bookmarks_count: 0,
      views_count: 1,
      monetized: isMonetized,
      custom_icon: custom_icon || null,
      is_locked: Boolean(is_locked),
      public_preview: is_locked ? (public_preview?.trim() || content.trim()) : null,
      unlock_price_gold: is_locked ? Math.max(0, Number(unlock_price_gold) || 0) : 0,
      unlock_price_points: is_locked ? Math.max(0, Number(unlock_price_points) || 0) : 0,
      payload_metadata: is_locked
        ? {
            wordsCount: (secret_content || "").trim().split(/\s+/).filter(Boolean).length,
            codeBlocksCount: ((secret_content || "").match(/```[\s\S]*?```/g) || []).length,
            linksCount: ((secret_content || "").match(/https?:\/\/[^\s]+/g) || []).length,
            attachmentsCount: Array.isArray(media_urls) ? media_urls.length : 0,
          }
        : { wordsCount: 0, codeBlocksCount: 0, linksCount: 0, attachmentsCount: 0 },
    };

    const { data, error } = await supabase
      .from("social_posts")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert post error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If post is locked and secret content is provided, save in isolated post_secrets table
    if (is_locked && secret_content && secret_content.trim()) {
      const { error: secErr } = await supabase.from("post_secrets").insert({
        post_id: data.id,
        secret_content: secret_content.trim(),
      });
      if (secErr) {
        console.error("post_secrets insert error:", secErr);
      }
    }

    return NextResponse.json({ post: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create post" },
      { status: 500 }
    );
  }
}
