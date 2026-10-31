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

    const isAuthorViewingOwn =
      currentUserHandle &&
      authorHandle &&
      currentUserHandle.toLowerCase() === authorHandle.toLowerCase().replace(/^@/, "");

    if (isAuthorViewingOwn) {
      // Author can see their own public, unlisted, private posts, and drafts/schedules
      query = query.ilike("author_handle", authorHandle.replace(/^@/, ""));
      if (!includeDrafts) {
        query = query.eq("status", "published");
      }
    } else {
      // Public / Other visitors can ONLY EVER see published & public posts!
      query = query.eq("status", "published").eq("visibility", "public");

      if (authorHandle) {
        query = query.ilike("author_handle", authorHandle.replace(/^@/, ""));
      }
    }

    // Community filter
    if (communityId && communityId !== "all") {
      query = query.eq("community_id", communityId);
    }

    // Category filter
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    // Feed sorting & filtering
    if (feed === "popular") {
      query = query.order("likes_count", { ascending: false }).order("created_at", { ascending: false });
    } else if (feed === "wiki") {
      query = query.eq("post_type", "wiki").order("created_at", { ascending: false });
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
      visibility: safeVisibility,
      post_type: safePostType,
      status: safeStatus,
      scheduled_at: scheduled_at ? new Date(scheduled_at).toISOString() : null,
      community_id: community_id || "general",
      flair: flair || null,
      poll_data: poll_data || null,
      likes_count: 0,
      reposts_count: 0,
      comments_count: 0,
      bookmarks_count: 0,
      views_count: 1,
      monetized: isMonetized,
      custom_icon: custom_icon || null,
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

    return NextResponse.json({ post: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create post" },
      { status: 500 }
    );
  }
}
