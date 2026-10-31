import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { post_id, vote_type, voter_handle } = await req.json();

    if (!post_id || typeof vote_type !== "number") {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
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

    const handle =
      user?.user_metadata?.username ||
      user?.email?.split("@")[0] ||
      voter_handle ||
      "guest";

    // Check existing vote
    const { data: existingVote } = await supabase
      .from("social_votes")
      .select("*")
      .eq("post_id", post_id)
      .eq("voter_handle", handle)
      .maybeSingle();

    if (existingVote) {
      if (vote_type === 0 || existingVote.vote_type === vote_type) {
        // Toggle off / delete vote
        await supabase
          .from("social_votes")
          .delete()
          .eq("id", existingVote.id);
      } else {
        // Change vote (+1 to -1 or vice versa)
        await supabase
          .from("social_votes")
          .update({ vote_type })
          .eq("id", existingVote.id);
      }
    } else if (vote_type !== 0) {
      // Insert new vote
      await supabase.from("social_votes").insert({
        post_id,
        voter_handle: handle,
        vote_type,
      });
    }

    // Recompute total upvotes & downvotes for the post
    const { data: allVotes } = await supabase
      .from("social_votes")
      .select("vote_type")
      .eq("post_id", post_id);

    let up = 0;
    let down = 0;
    if (allVotes) {
      allVotes.forEach((v) => {
        if (v.vote_type === 1) up++;
        if (v.vote_type === -1) down++;
      });
    }

    // Update post counts
    await supabase
      .from("social_posts")
      .update({
        upvotes_count: up,
        downvotes_count: down,
        likes_count: Math.max(0, up),
      })
      .eq("id", post_id);

    return NextResponse.json({
      success: true,
      upvotes: up,
      downvotes: down,
      current_user_vote: existingVote?.vote_type === vote_type ? 0 : vote_type,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to vote" }, { status: 500 });
  }
}
