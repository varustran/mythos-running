import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const QUEST_REWARDS: Record<string, { title: string; reward: number }> = {
  daily_checkin: { title: "Điểm danh hàng ngày", reward: 50 },
  share_post: { title: "Chia sẻ bài viết cộng đồng", reward: 20 },
  watch_ad: { title: "Xem nội dung tài trợ / Quảng cáo", reward: 30 },
  first_post: { title: "Xuất bản bài viết đầu tiên", reward: 100 },
};

export async function POST(req: Request) {
  try {
    const { quest_type } = await req.json();

    if (!quest_type || !QUEST_REWARDS[quest_type]) {
      return NextResponse.json({ error: "Loại nhiệm vụ không hợp lệ." }, { status: 400 });
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
        { error: "Vui lòng đăng nhập để nhận thưởng nhiệm vụ." },
        { status: 401 }
      );
    }

    const todayDate = new Date().toISOString().split("T")[0];

    // Check if already claimed today
    const { data: existingQuest } = await supabase
      .from("user_quests")
      .select("id")
      .eq("user_id", user.id)
      .eq("quest_type", quest_type)
      .eq("completed_date", todayDate)
      .maybeSingle();

    if (existingQuest) {
      return NextResponse.json(
        { error: "Bạn đã nhận phần thưởng nhiệm vụ này hôm nay. Hãy quay lại vào ngày mai!" },
        { status: 400 }
      );
    }

    const { reward, title } = QUEST_REWARDS[quest_type];

    // Fetch user profile
    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("id, points_balance")
      .or(`user_id.eq.${user.id},id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: "Không tìm thấy hồ sơ người dùng." }, { status: 404 });
    }

    const currentPoints = Number(profile.points_balance || 0);
    const newBalance = currentPoints + reward;

    // 1. Insert quest record
    await supabase.from("user_quests").insert({
      user_id: user.id,
      quest_type,
      completed_date: todayDate,
      points_reward: reward,
    });

    // 2. Update profile points balance
    await supabase
      .from("profiles")
      .update({ points_balance: newBalance })
      .eq("id", profile.id);

    // 3. Record in ledger
    await supabase.from("ledger_entries").insert({
      user_id: user.id,
      asset_code: "POINTS",
      amount: reward,
      direction: "IN",
      transaction_type: `quest_${quest_type}`,
    });

    return NextResponse.json({
      success: true,
      quest_type,
      title,
      reward,
      new_balance: newBalance,
    });
  } catch (err: any) {
    console.error("Quest claim error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to claim quest" },
      { status: 500 }
    );
  }
}
