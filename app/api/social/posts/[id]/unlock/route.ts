import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để mở khóa nội dung kỹ thuật này." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const method: "gold" | "points" = body.method === "points" ? "points" : "gold";

    // 1. Fetch post
    const { data: post, error: postErr } = await supabase
      .from("social_posts")
      .select("id, author_id, author_handle, is_locked, unlock_price_gold, unlock_price_points")
      .eq("id", id)
      .maybeSingle();

    if (postErr || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (!post.is_locked) {
      return NextResponse.json({ success: true, message: "Bài viết này đã mở công khai." });
    }

    // 2. Fetch User Profile
    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("id, username, points_balance, gold_balance")
      .or(`user_id.eq.${user.id},id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: "Không tìm thấy hồ sơ người dùng." }, { status: 404 });
    }

    // 3. Check if already unlocked
    const { data: existingUnlock } = await supabase
      .from("post_unlocks")
      .select("id")
      .eq("post_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingUnlock) {
      const { data: secret } = await supabase
        .from("post_secrets")
        .select("secret_content")
        .eq("post_id", id)
        .maybeSingle();

      return NextResponse.json({
        success: true,
        already_unlocked: true,
        secret_content: secret?.secret_content || "",
        attachments: [],
      });
    }

    // 4. Verify balance & Calculate deductions
    const priceGold = Number(post.unlock_price_gold) || 0;
    const pricePoints = Number(post.unlock_price_points) || 0;
    const currentPoints = Number(profile.points_balance) || 0;
    const currentGold = Number(profile.gold_balance) || 0;

    let amountDeducted = 0;
    let assetCode = "GOLD";

    if (method === "points") {
      assetCode = "POINTS";
      amountDeducted = pricePoints;
      if (currentPoints < pricePoints) {
        return NextResponse.json(
          {
            error: `Số dư Myso Points không đủ (${currentPoints}/${pricePoints} pts). Hãy hoàn thành nhiệm vụ để nhận thêm điểm miễn phí.`,
          },
          { status: 400 }
        );
      }

      // Deduct Points
      await supabase
        .from("profiles")
        .update({ points_balance: currentPoints - pricePoints })
        .eq("id", profile.id);
    } else {
      assetCode = "GOLD";
      amountDeducted = priceGold;
      if (currentGold < priceGold) {
        return NextResponse.json(
          {
            error: `Số dư Myso Gold không đủ (${currentGold}/${priceGold} Gold). Hãy nạp USDT hoặc sử dụng Myso Points để mở khóa.`,
          },
          { status: 400 }
        );
      }

      // Deduct Gold
      await supabase
        .from("profiles")
        .update({ gold_balance: currentGold - priceGold })
        .eq("id", profile.id);

      // 85/15 Creator Revenue Distribution
      if (priceGold > 0 && post.author_id) {
        const creatorCut = +(priceGold * 0.85).toFixed(4);

        // Fetch author profile
        const { data: authorProf } = await supabase
          .from("profiles")
          .select("id, gold_balance")
          .or(`user_id.eq.${post.author_id},id.eq.${post.author_id}`)
          .maybeSingle();

        if (authorProf) {
          const authorNewGold = Number(authorProf.gold_balance || 0) + creatorCut;
          await supabase
            .from("profiles")
            .update({ gold_balance: authorNewGold })
            .eq("id", authorProf.id);

          // Record author earnings in ledger
          await supabase.from("ledger_entries").insert({
            user_id: post.author_id,
            asset_code: "GOLD",
            amount: creatorCut,
            direction: "IN",
            transaction_type: "creator_revshare_85_15",
          });
        }
      }
    }

    // 5. Record spender transaction in ledger
    await supabase.from("ledger_entries").insert({
      user_id: user.id,
      asset_code: assetCode,
      amount: amountDeducted,
      direction: "OUT",
      transaction_type: "post_unlock_spend",
    });

    // 6. Grant Entitlement in post_unlocks
    await supabase.from("post_unlocks").insert({
      user_id: user.id,
      user_handle: profile.username || "user",
      post_id: id,
      payment_method: method,
      amount_paid: amountDeducted,
    });

    // 7. Fetch and return secret payload
    const { data: secret } = await supabase
      .from("post_secrets")
      .select("secret_content")
      .eq("post_id", id)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      method,
      amount_paid: amountDeducted,
      secret_content: secret?.secret_content || "",
      attachments: [],
    });
  } catch (err: any) {
    console.error("Unlock post error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to unlock post" },
      { status: 500 }
    );
  }
}
