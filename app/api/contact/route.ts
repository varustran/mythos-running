import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: { name?: string; email?: string; message?: string; locale?: string };
  try {
    body = (await request.json()) as { name?: string; email?: string; message?: string; locale?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const message = (body.message || "").trim();

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!EMAIL.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  if (message.length < 10 || message.length > 4000) {
    return NextResponse.json({ error: "Please write a slightly longer message." }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Contact form is not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Contact form is not configured." }, { status: 503 });
  }

  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    message,
    locale: body.locale || "vi",
  });

  if (error) {
    return NextResponse.json({ error: "Could not send message." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
