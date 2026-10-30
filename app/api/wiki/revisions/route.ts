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

    const { data, error } = await supabase
      .from("wiki_revisions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      return NextResponse.json({ revisions: [] });
    }

    return NextResponse.json({ revisions: data || [] });
  } catch {
    return NextResponse.json({ revisions: [] });
  }
}
