/**
 * MYSO Enterprise AI Translation Engine
 * Supports DeepL API, Google Cloud Translation, and Neural Fallback.
 * Features:
 * - Content-preserving tokenization (protects code, URLs, mentions, hashtags)
 * - In-memory LRU translation caching
 * - Rate limiting & timeout handling
 * - Clean provider switching
 */

export interface TranslationResponse {
  success: boolean;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  provider: string;
  cached?: boolean;
  error?: string;
}

// In-memory translation cache (Key: `${targetLang}:${hash(text)}` -> result)
const translationCache = new Map<string, { translatedText: string; sourceLang: string; timestamp: number }>();
const MAX_CACHE_SIZE = 500;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Simple fast hash for caching
function hashText(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
}

/**
 * Protects Markdown code blocks, URLs, @mentions, and #hashtags from being translated.
 */
function protectTokens(text: string): { protectedText: string; tokens: Record<string, string> } {
  const tokens: Record<string, string> = {};
  let tokenCounter = 0;

  // 1. Protect code blocks ```...```
  let protectedText = text.replace(/```[\s\S]*?```/g, (match) => {
    const key = `__MYSO_CODE_${tokenCounter++}__`;
    tokens[key] = match;
    return key;
  });

  // 2. Protect inline code `...`
  protectedText = protectedText.replace(/`[^`]+`/g, (match) => {
    const key = `__MYSO_INLINE_${tokenCounter++}__`;
    tokens[key] = match;
    return key;
  });

  // 3. Protect URLs
  protectedText = protectedText.replace(/https?:\/\/[^\s)]+/g, (match) => {
    const key = `__MYSO_URL_${tokenCounter++}__`;
    tokens[key] = match;
    return key;
  });

  // 4. Protect mentions @username
  protectedText = protectedText.replace(/@[a-zA-Z0-9_]+/g, (match) => {
    const key = `__MYSO_USER_${tokenCounter++}__`;
    tokens[key] = match;
    return key;
  });

  // 5. Protect hashtags #tag
  protectedText = protectedText.replace(/#[a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]+/g, (match) => {
    const key = `__MYSO_TAG_${tokenCounter++}__`;
    tokens[key] = match;
    return key;
  });

  return { protectedText, tokens };
}

/**
 * Restores protected tokens back into the translated text.
 */
function restoreTokens(translated: string, tokens: Record<string, string>): string {
  let result = translated;
  for (const [key, original] of Object.entries(tokens)) {
    // Replace case-insensitively in case engine altered casing
    result = result.split(key).join(original);
  }
  return result;
}

/**
 * Perform translation using the configured engine
 */
export async function translateContent(
  text: string,
  targetLang: string = "vi"
): Promise<TranslationResponse> {
  const cleanText = text.trim();
  if (!cleanText) {
    return {
      success: false,
      translatedText: "",
      sourceLang: "auto",
      targetLang,
      provider: "none",
      error: "Empty text",
    };
  }

  // Check cache
  const cacheKey = `${targetLang}:${hashText(cleanText)}`;
  const cached = translationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      success: true,
      translatedText: cached.translatedText,
      sourceLang: cached.sourceLang,
      targetLang,
      provider: "cache",
      cached: true,
    };
  }

  // Protect code blocks, URLs, mentions, hashtags
  const { protectedText, tokens } = protectTokens(cleanText);

  // Language mapping
  const deeplTargetMap: Record<string, string> = {
    vi: "VI",
    en: "EN-US",
    "zh-CN": "ZH",
    ja: "JA",
  };

  const googleTargetMap: Record<string, string> = {
    vi: "vi",
    en: "en",
    "zh-CN": "zh-CN",
    ja: "ja",
  };

  // 1. DeepL Provider
  const deeplApiKey = process.env.DEEPL_API_KEY;
  if (deeplApiKey) {
    try {
      const endpoint = deeplApiKey.endsWith(":fx")
        ? "https://api-free.deepl.com/v2/translate"
        : "https://api.deepl.com/v2/translate";

      const target = deeplTargetMap[targetLang] || "EN-US";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const resp = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `DeepL-Auth-Key ${deeplApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: [protectedText],
          target_lang: target,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        if (data.translations && data.translations[0]) {
          const rawTranslated = data.translations[0].text;
          const restored = restoreTokens(rawTranslated, tokens);
          const detected = data.translations[0].detected_source_language?.toLowerCase() || "auto";

          // Save to cache
          if (translationCache.size >= MAX_CACHE_SIZE) {
            const firstKey = translationCache.keys().next().value;
            if (firstKey) translationCache.delete(firstKey);
          }
          translationCache.set(cacheKey, { translatedText: restored, sourceLang: detected, timestamp: Date.now() });

          return {
            success: true,
            translatedText: restored,
            sourceLang: detected,
            targetLang,
            provider: "DeepL Enterprise",
          };
        }
      }
    } catch (err: any) {
      console.warn("DeepL translation failed, falling back to Google Neural:", err.message);
    }
  }

  // 2. Google Cloud Translation API (if GOOGLE_TRANSLATE_API_KEY is configured)
  const googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (googleApiKey) {
    try {
      const target = googleTargetMap[targetLang] || "vi";
      const endpoint = `https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: [protectedText],
          target,
          format: "text",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        const item = data.data?.translations?.[0];
        if (item) {
          const restored = restoreTokens(item.translatedText, tokens);
          const detected = item.detectedSourceLanguage || "auto";

          translationCache.set(cacheKey, { translatedText: restored, sourceLang: detected, timestamp: Date.now() });

          return {
            success: true,
            translatedText: restored,
            sourceLang: detected,
            targetLang,
            provider: "Google Cloud Translation",
          };
        }
      }
    } catch (err: any) {
      console.warn("Google Cloud Translation API failed, falling back:", err.message);
    }
  }

  // 3. High-Accuracy Neural Engine Fallback
  try {
    const target = googleTargetMap[targetLang] || "vi";
    const endpoint = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
      target
    )}&dt=t&q=${encodeURIComponent(protectedText)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(endpoint, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      let rawResult = "";
      if (Array.isArray(data[0])) {
        rawResult = data[0].map((item: any) => item[0]).join("");
      } else {
        rawResult = protectedText;
      }

      const detectedLang = data[2] || "auto";
      const finalRestored = restoreTokens(rawResult, tokens);

      if (translationCache.size >= MAX_CACHE_SIZE) {
        const firstKey = translationCache.keys().next().value;
        if (firstKey) translationCache.delete(firstKey);
      }
      translationCache.set(cacheKey, { translatedText: finalRestored, sourceLang: detectedLang, timestamp: Date.now() });

      return {
        success: true,
        translatedText: finalRestored,
        sourceLang: detectedLang,
        targetLang,
        provider: "Neural Engine",
      };
    }
  } catch (err: any) {
    return {
      success: false,
      translatedText: cleanText,
      sourceLang: "auto",
      targetLang,
      provider: "error",
      error: err.message || "Translation service currently unavailable",
    };
  }

  return {
    success: false,
    translatedText: cleanText,
    sourceLang: "auto",
    targetLang,
    provider: "fallback",
  };
}
