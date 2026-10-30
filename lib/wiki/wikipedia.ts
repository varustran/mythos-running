export interface WikiArticleItem {
  slug: string;
  title: string;
  domain: string;
  summary: string;
  content: string;
  thumbnail?: string;
  sourceUrl: string;
  sourceName: string;
  views: number;
  contributorsCount: number;
  approvalCount: number;
  lastUpdated: string;
}

export interface WikiSearchResult {
  title: string;
  snippet: string;
  pageid: number;
  thumbnail?: string;
}

// 1. Live Wikipedia Search (vi & en)
export async function searchWikipedia(query: string, lang: "vi" | "en" = "vi"): Promise<WikiSearchResult[]> {
  if (!query || query.trim().length === 0) return [];
  try {
    const endpoint = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query,
    )}&utf8=&format=json&origin=*&srlimit=8`;

    const res = await fetch(endpoint, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.query?.search || [];

    return items.map((item: any) => ({
      title: item.title,
      snippet: item.snippet.replace(/<[^>]+>/g, ""),
      pageid: item.pageid,
    }));
  } catch (err) {
    console.error("Wikipedia search failed:", err);
    return [];
  }
}

// 2. Fetch Full Article Summary & Thumbnail from Wikipedia
export async function fetchWikipediaArticle(title: string, lang: "vi" | "en" = "vi"): Promise<{
  title: string;
  extract: string;
  thumbnail?: string;
  url: string;
} | null> {
  try {
    const endpoint = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro=true&explaintext=true&piprop=thumbnail&pithumbsize=800&titles=${encodeURIComponent(
      title,
    )}&format=json&origin=*`;

    const res = await fetch(endpoint, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data.query?.pages || {};
    const pageId = Object.keys(pages)[0];
    if (!pageId || pageId === "-1") return null;

    const page = pages[pageId];
    return {
      title: page.title,
      extract: page.extract || "",
      thumbnail: page.thumbnail?.source,
      url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
    };
  } catch (err) {
    console.error("Wikipedia article fetch error:", err);
    return null;
  }
}

// 3. Local Curated Multi-domain Knowledge Base for Instant Lightning Speed & Offline Reliability
export const curatedWikiArticles: WikiArticleItem[] = [
  {
    slug: "tri-tue-nhan-tao-tong-quat-agi",
    title: "Trí tuệ nhân tạo tổng quát (AGI)",
    domain: "Công nghệ & AI",
    summary:
      "AGI là dạng trí tuệ nhân tạo giả định có khả năng hiểu, học hỏi và áp dụng trí thông minh trên toàn bộ phổ các nhiệm vụ trí tuệ của con người.",
    content: `Trí tuệ nhân tạo tổng quát (Artificial General Intelligence - AGI) là mục tiêu nghiên cứu hàng đầu của khoa học máy tính hiện đại. Khác với AI hẹp (Narrow AI) chỉ giải quyết các tác vụ chuyên biệt như chơi cờ hay tạo ảnh, AGI sở hữu tính linh hoạt nhận thức toàn diện, tư duy phản biện, lập luận trừu tượng và khả năng tự hoàn thiện mà không cần huấn luyện lại từ đầu.

### Tiêu chuẩn đánh giá AGI
1. **Khả năng khái quát hóa liên miền:** Chuyển giao tri thức từ vật lý sang sinh học hay nghệ thuật.
2. **Học tập vài mẫu (Few-shot Learning):** Nắm bắt kỹ năng mới chỉ qua vài quan sát thực tế.
3. **Ý thức về ngữ cảnh và an toàn:** Nhận biết giới hạn đạo đức và tuân thủ định hướng giá trị nhân loại.`,
    thumbnail: "/images/hero-running.jpg",
    sourceUrl: "https://vi.wikipedia.org/wiki/Tr%C3%AD_tu%E1%BB%87_nh%C3%A2n_t%E1%BA%A1o_t%E1%BB%95ng_qu%C3%A1t",
    sourceName: "Wikipedia Tiếng Việt & Stanford AI Index",
    views: 0,
    contributorsCount: 1,
    approvalCount: 2,
    lastUpdated: "2026-10-30",
  },
  {
    slug: "vo2-max-va-sinh-ly-suc-ben",
    title: "VO2 Max và Sinh lý học sức bền",
    domain: "Thể thao & Y sinh",
    summary:
      "VO2 Max phản ánh lượng oxy tối đa mà cơ thể có thể tiêu thụ trong mỗi phút trên mỗi kg thể trọng trong quá trình vận động cường độ cao.",
    content: `VO2 Max (Maximal Oxygen Uptake) là thước đo vàng cho hệ tim mạch và năng lực hiếu khí của vận động viên sức bền. Chỉ số này phản ánh khả năng bơm máu của tim, khả năng hấp thụ oxy của phổi và hiệu suất sử dụng oxy tại các tế bào cơ bắp qua mạng lưới mao mạch và ty thể.

### Các yếu tố quyết định VO2 Max
- **Lưu lượng tim tối đa (Maximal Cardiac Output):** Thể tích máu tâm thu nhân với nhịp tim tối đa.
- **Mật độ mao mạch cơ bắp:** Số lượng mao mạch cung cấp oxy cho các sợi cơ co rút chậm (Type I).
- **Mật độ ty thể tế bào:** "Nhà máy năng lượng" sản sinh ATP thông qua quá trình phosphoryl hóa oxy hóa.`,
    thumbnail: "/images/academy-physiology.jpg",
    sourceUrl: "https://vi.wikipedia.org/wiki/VO2_max",
    sourceName: "Wikipedia Sinh lý học Thể thao & ACSM",
    views: 0,
    contributorsCount: 1,
    approvalCount: 2,
    lastUpdated: "2026-10-30",
  },
  {
    slug: "webassembly-wasm-hieu-nang-web",
    title: "WebAssembly (Wasm) — Kỷ nguyên điện toán nhị phân trên Web",
    domain: "Công nghệ Web",
    summary:
      "Định dạng mã nhị phân cấp thấp cho phép chạy mã nguồn C/C++, Rust, Go trên trình duyệt web với tốc độ gần như native.",
    content: `WebAssembly (Wasm) là tiêu chuẩn mở của W3C định nghĩa một máy ảo dựa trên ngăn xếp nhị phân. Nó mang lại hiệu năng tính toán vượt trội cho các ứng dụng web phức tạp như game 3D, xử lý video, mật mã học và chạy các mô hình AI trực tiếp trong trình duyệt người dùng.

### Ưu điểm vượt trội
- Tốc độ thực thi tiệm cận mã máy gốc.
- Tính an toàn cao nhờ mô hình bộ nhớ sandbox biệt lập.
- Khả năng tương tác mượt mà hai chiều với JavaScript.`,
    thumbnail: "/images/gear-watch.jpg",
    sourceUrl: "https://vi.wikipedia.org/wiki/WebAssembly",
    sourceName: "W3C WebAssembly Specification & MDN",
    views: 0,
    contributorsCount: 1,
    approvalCount: 2,
    lastUpdated: "2026-10-30",
  },
  {
    slug: "nhip-sinh-hoc-circadian-rhythm",
    title: "Nhịp sinh học Circadian & Tối ưu hóa giấc ngủ",
    domain: "Khoa học & Đời sống",
    summary:
      "Chu kỳ sinh học nội sinh kéo dài xấp xỉ 24 giờ điều phối thân nhiệt, giải phóng hormone Melatonin và Cortisol, điều hòa khả năng hồi phục cơ thể.",
    content: `Giải Nobel Y học 2017 vinh danh các khám phá về cơ chế phân tử điều khiển nhịp sinh học. Nhân trên chéo (Suprachiasmatic Nucleus - SCN) tại vùng dưới đồi đóng vai trò đồng hồ chủ, tiếp nhận tín hiệu ánh sáng xanh từ mắt để đồng bộ hóa nhịp độ trao đổi chất của toàn bộ các cơ quan.

### Ứng dụng thực tiễn
- Tiếp xúc với ánh sáng mặt trời tự nhiên trong 30-60 phút đầu tiên sau khi thức dậy để kích hoạt Cortisol lành mạnh.
- Giảm thiểu ánh sáng nhân tạo và thiết bị điện tử 2 giờ trước khi ngủ để tuyến tùng tiết Melatonin tự nhiên.
- Duy trì giờ đi ngủ và thức dậy cố định ngay cả vào cuối tuần để tránh hiện tượng lệch múi giờ xã hội (Social Jetlag).`,
    thumbnail: "/images/academy-hydration.jpg",
    sourceUrl: "https://vi.wikipedia.org/wiki/Nh%E1%BB%8Bp_sinh_h%E1%BB%8Dc",
    sourceName: "Wikipedia Y học & Nobel Prize Physiology",
    views: 0,
    contributorsCount: 1,
    approvalCount: 2,
    lastUpdated: "2026-10-29",
  },
];
