import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { amount, network, tx_hash } = await req.json();

    const parsedAmount = Math.max(1, Math.min(10000, Number(amount) || 10));

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
        { error: "Vui lòng đăng nhập để nạp Myso Gold." },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, gold_balance, wallet_address")
      .or(`user_id.eq.${user.id},id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: "Không tìm thấy hồ sơ người dùng." }, { status: 404 });
    }

    const currentGold = Number(profile.gold_balance || 0);
    const newGold = currentGold + parsedAmount;

    const generatedTx = tx_hash || `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    // Update profile
    await supabase
      .from("profiles")
      .update({ gold_balance: newGold })
      .eq("id", profile.id);

    // Record in ledger
    await supabase.from("ledger_entries").insert({
      user_id: user.id,
      asset_code: "GOLD",
      amount: parsedAmount,
      direction: "IN",
      transaction_type: `deposit_${network || "web3"}`,
      tx_hash: generatedTx,
    });

    return NextResponse.json({
      success: true,
      amount: parsedAmount,
      new_balance: newGold,
      tx_hash: generatedTx,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process deposit" }, { status: 500 });
  }
}
