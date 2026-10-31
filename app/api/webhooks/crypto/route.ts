import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("x-myso-webhook-secret");
    const configuredSecret = process.env.CRYPTO_WEBHOOK_SECRET || "myso_webhook_secret_production";

    if (authHeader && authHeader !== configuredSecret) {
      return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 });
    }

    const payload = await req.json();
    const {
      tx_hash,
      event_type, // "GoldPurchased" | "PostUnlocked"
      wallet_address,
      token_symbol = "USDT",
      amount,
      post_id,
    } = payload;

    if (!tx_hash || !wallet_address || !amount) {
      return NextResponse.json({ error: "Missing required payload fields" }, { status: 400 });
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

    // 1. Idempotency Check: Prevent duplicate transaction credit
    const { data: existingTx } = await supabase
      .from("ledger_entries")
      .select("id")
      .eq("tx_hash", tx_hash)
      .maybeSingle();

    if (existingTx) {
      return NextResponse.json({ status: "already_processed", tx_hash });
    }

    // 2. Locate User by Wallet Address
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("id, user_id, gold_balance")
      .ilike("wallet_address", wallet_address)
      .maybeSingle();

    if (!userProfile) {
      return NextResponse.json(
        { error: "No profile found for provided wallet address" },
        { status: 404 }
      );
    }

    const parsedAmount = Number(amount);

    if (event_type === "GoldPurchased") {
      const currentGold = Number(userProfile.gold_balance || 0);
      const newGold = currentGold + parsedAmount;

      // Update gold balance
      await supabase
        .from("profiles")
        .update({ gold_balance: newGold })
        .eq("id", userProfile.id);

      // Record in ledger
      await supabase.from("ledger_entries").insert({
        user_id: userProfile.user_id || userProfile.id,
        asset_code: "GOLD",
        amount: parsedAmount,
        direction: "IN",
        transaction_type: "crypto_deposit_usdt",
        tx_hash,
      });

      return NextResponse.json({
        success: true,
        event_type,
        credited_gold: parsedAmount,
        new_balance: newGold,
      });
    }

    return NextResponse.json({ success: true, processed: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
