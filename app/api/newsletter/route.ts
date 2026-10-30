import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: { email?: string; locale?: string };
  try {
    body = (await request.json()) as { email?: string; locale?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Newsletter is not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Newsletter is not configured." }, { status: 503 });
  }

  const { error } = await supabase.from("newsletter_subscribers").insert({
    email,
    locale: body.locale || "vi",
  });

  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "Could not subscribe." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
