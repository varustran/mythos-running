import { NextResponse } from "next/server";
import { getAccountSession } from "@/lib/supabase/server";

export async function GET() {
  try {
    const sessionData = await getAccountSession();
    return NextResponse.json(sessionData);
  } catch (err: any) {
    return NextResponse.json(
      { user: null, profile: null, status: "guest", error: err.message },
      { status: 500 }
    );
  }
}
