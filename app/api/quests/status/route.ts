import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ quests: [], user: null });
    }

    const todayDate = new Date().toISOString().split("T")[0];

    const { data: quests } = await supabase
      .from("user_quests")
      .select("quest_type, points_reward, completed_date")
      .eq("user_id", user.id)
      .eq("completed_date", todayDate);

    const { data: history } = await supabase
      .from("user_quests")
      .select("quest_type, points_reward, completed_date, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    return NextResponse.json({
      todayQuests: quests || [],
      history: history || [],
    });
  } catch (err: any) {
    return NextResponse.json({ todayQuests: [], history: [] });
  }
}
