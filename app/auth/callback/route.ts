import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") || "/vi/admin";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/vi/admin";

  if (!code) {
    return NextResponse.redirect(new URL("/vi/login?error=missing_code", url.origin));
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/vi/login?error=not_configured", url.origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/vi/login?error=auth", url.origin));
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
