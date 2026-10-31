import { NextResponse } from "next/server";
import { translateContent } from "@/lib/translation";

export async function POST(req: Request) {
  try {
    const { text, targetLang = "vi" } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Call enterprise translation engine
    const result = await translateContent(text, targetLang);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Translation error",
        translatedText: "",
        sourceLang: "auto",
        targetLang: "vi",
        provider: "error",
      },
      { status: 500 }
    );
  }
}
