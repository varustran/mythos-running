import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, targetLang = "vi" } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const langCodeMap: Record<string, string> = {
      vi: "vi",
      en: "en",
      "zh-CN": "zh-CN",
      ja: "ja",
    };

    const target = langCodeMap[targetLang] || "vi";

    // Call translation endpoint
    const endpoint = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
      target
    )}&dt=t&q=${encodeURIComponent(text.trim())}`;

    const res = await fetch(endpoint, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json({
        translatedText: text,
        sourceLang: "auto",
        targetLang: target,
      });
    }

    const data = await res.json();
    let translated = "";
    if (Array.isArray(data[0])) {
      translated = data[0].map((item: any) => item[0]).join("");
    } else {
      translated = text;
    }

    const detectedLang = data[2] || "auto";

    return NextResponse.json({
      success: true,
      translatedText: translated,
      sourceLang: detectedLang,
      targetLang: target,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || "Translation failed",
      translatedText: "",
    });
  }
}
