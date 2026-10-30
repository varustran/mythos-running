"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Globe, ExternalLink, BookOpen, CheckCircle, ShieldCheck, PlusCircle, Filter } from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import { localePath } from "@/lib/i18n/settings";
import { curatedWikiArticles, type WikiArticleItem, searchWikipedia, type WikiSearchResult } from "@/lib/wiki/wikipedia";

export function WikiSearchClient({ locale }: { locale: Locale }) {
  const [query, setQuery] = useState("");
  const [activeDomain, setActiveDomain] = useState("all");
  const [wikiResults, setWikiResults] = useState<WikiSearchResult[]>([]);
  const [searchingWiki, setSearchingWiki] = useState(false);

  const domains = [
    { id: "all", label: locale === "vi" ? "Tất cả lĩnh vực" : "All Domains" },
    { id: "tech", label: locale === "vi" ? "Công nghệ & AI" : "Tech & AI" },
    { id: "sports", label: locale === "vi" ? "Thể thao & Y sinh" : "Sports & Physiology" },
    { id: "science", label: locale === "vi" ? "Khoa học & Đời sống" : "Science & Life" },
  ];

  const handleWikipediaLiveSearch = async (term: string) => {
    if (!term || term.trim().length < 2) {
      setWikiResults([]);
      return;
    }
    setSearchingWiki(true);
    try {
      const results = await searchWikipedia(term, locale === "vi" ? "vi" : "en");
      setWikiResults(results);
    } catch {
      setWikiResults([]);
    } finally {
      setSearchingWiki(false);
    }
  };

  const filteredCurated = curatedWikiArticles.filter((art) => {
    const matchesDomain =
      activeDomain === "all" ||
      (activeDomain === "tech" && (art.domain.includes("Công nghệ") || art.domain.includes("Web"))) ||
      (activeDomain === "sports" && art.domain.includes("Thể thao")) ||
      (activeDomain === "science" && art.domain.includes("Khoa học"));

    const matchesQuery =
      query.trim() === "" ||
      art.title.toLowerCase().includes(query.toLowerCase()) ||
      art.summary.toLowerCase().includes(query.toLowerCase());

    return matchesDomain && matchesQuery;
  });

  return (
    <div className="space-y-10">
      {/* Search Input & Live Wikipedia Integration */}
      <div className="card p-6 border border-line bg-surface/80 backdrop-blur shadow-lg">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              handleWikipediaLiveSearch(e.target.value);
            }}
            placeholder={
              locale === "vi"
                ? "Tìm kiếm trên Myso Wiki & toàn bộ Wikipedia (VD: AGI, VO2 Max, WebAssembly, Nhịp sinh học...)"
                : "Search Myso Wiki & live Wikipedia (e.g., AGI, VO2 Max, WebAssembly, Circadian...)"
            }
            className="w-full rounded-2xl border border-line bg-canvas pl-12 pr-4 py-3.5 text-sm sm:text-base text-ink placeholder:text-muted focus:border-accent focus:outline-none transition shadow-inner"
          />
        </div>

        {/* Domain Filter Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted flex items-center gap-1 font-mono mr-1">
            <Filter className="h-3 w-3" />
            {locale === "vi" ? "Lĩnh vực:" : "Domain:"}
          </span>
          {domains.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveDomain(d.id)}
              className={`rounded-full px-3.5 py-1 text-xs font-medium transition ${
                activeDomain === d.id
                  ? "bg-accent text-white dark:text-[#04101F]"
                  : "border border-line bg-surface text-muted hover:text-ink hover:border-line/80"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Wikipedia API Results (if queried) */}
      {query.trim().length >= 2 && (
        <div className="card p-6 border border-teal/40 bg-teal/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-teal" />
              <h3 className="font-display text-sm font-semibold text-ink">
                {locale === "vi" ? "Nguồn Mở Wikipedia Kết Nối Trực Tiếp" : "Live Wikipedia Federated Results"}
              </h3>
            </div>
            <span className="font-mono text-[0.68rem] text-teal">
              {searchingWiki ? (locale === "vi" ? "Đang truy vấn API..." : "Querying API...") : `${wikiResults.length} kết quả`}
            </span>
          </div>

          {wikiResults.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {wikiResults.map((w) => (
                <div key={w.pageid} className="rounded-xl border border-line bg-surface p-4 hover:border-teal transition">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-display text-sm font-semibold text-ink">{w.title}</h4>
                    <a
                      href={`https://${locale === "vi" ? "vi" : "en"}.wikipedia.org/wiki/${encodeURIComponent(w.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted hover:text-teal transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <p className="mt-1 text-xs text-muted line-clamp-2 leading-relaxed">{w.snippet}...</p>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-line/60">
                    <span className="font-mono text-[0.62rem] text-subtle">Wikipedia Verified</span>
                    <Link
                      href={localePath(locale, `/wiki/propose?import_title=${encodeURIComponent(w.title)}`)}
                      className="font-mono text-[0.65rem] text-accent hover:underline inline-flex items-center gap-1"
                    >
                      <PlusCircle className="h-3 w-3" />
                      {locale === "vi" ? "Đưa vào Myso Wiki" : "Import to Myso"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : !searchingWiki ? (
            <p className="text-xs text-muted">
              {locale === "vi"
                ? "Không tìm thấy bài viết tương ứng trên Wikipedia tiếng Việt. Bạn có thể là người đầu tiên tạo bài viết này!"
                : "No matching articles found on Wikipedia. You can be the first to propose it!"}
            </p>
          ) : null}
        </div>
      )}

      {/* Curated Myso Wiki Articles */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="eyebrow">MYSO KNOWLEDGE BASE</span>
            <h2 className="display-title text-2xl sm:text-3xl">
              {locale === "vi" ? "Bách Khoa Myso Đã Kiểm Duyệt" : "Verified Myso Encyclopedia"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={localePath(locale, "/wiki/review")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink hover:border-accent transition"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-teal" />
              {locale === "vi" ? "Hàng Đợi Kiểm Duyệt 2-Peer" : "2-Peer Review Queue"}
            </Link>
            <Link
              href={localePath(locale, "/wiki/propose")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white dark:text-[#04101F] hover:opacity-90 transition shadow-sm"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              {locale === "vi" ? "Đóng Góp Bài Mới" : "Propose Article"}
            </Link>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {filteredCurated.map((item) => (
            <article
              key={item.slug}
              className="card card-hover flex flex-col justify-between p-6 border border-line bg-surface"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 font-mono text-[0.68rem] text-accent font-medium">
                    {item.domain}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[0.65rem] text-teal">
                    <CheckCircle className="h-3 w-3" />
                    {item.approvalCount} IP Verified
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold text-ink hover:text-accent transition">
                  <Link href={localePath(locale, `/wiki/${item.slug}`)}>{item.title}</Link>
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed line-clamp-3">
                  {item.summary}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs text-subtle font-mono">
                <span>{item.views.toLocaleString()} lượt xem</span>
                <span className="text-muted">Cập nhật: {item.lastUpdated}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
