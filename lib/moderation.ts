// Myso Automated Keyword Moderation Engine
// Vietnamese accent normalization and multi-lingual pattern filtering

export function removeVietnameseAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export interface ModerationResult {
  isAllowed: boolean;
  severity: "clean" | "warning" | "blocked";
  violationCategory?: string;
  flaggedWord?: string;
  userMessage?: string;
}

// Prohibited term clusters
const PROHIBITED_KEYWORDS: { category: string; terms: string[] }[] = [
  {
    category: "scam_and_fraud",
    terms: [
      "tai xiu", "tài xỉu", "danh bac", "đánh bạc", "hack pass", "hack nick",
      "tin dung den", "tín dụng đen", "vay nong", "vay nóng", "rua tien", "rửa tiền",
      "keo tai xiu", "kèo tài xỉu", "ban acc gia re", "lua tien", "lừa tiền"
    ],
  },
  {
    category: "illegal_weapons_and_drugs",
    terms: [
      "che tao bom", "chế tạo bom", "mua sung", "mua súng", "ban sung", "bán súng",
      "ma tuy", "ma túy", "thuoc phien", "thuốc phiện", "cung cap ma tuy"
    ],
  },
  {
    category: "harassment_and_doxxing",
    terms: [
      "lo clip rieng tu", "lộ clip riêng tư", "tung anh nong", "tung ảnh nóng",
      "doxxing", "ban data ca nhan", "bán data cá nhân", "tong tien", "tống tiền"
    ],
  },
];

export function inspectContent(content: string): ModerationResult {
  if (!content) return { isAllowed: true, severity: "clean" };

  const rawLower = content.toLowerCase();
  const normalized = removeVietnameseAccents(content);

  for (const cluster of PROHIBITED_KEYWORDS) {
    for (const term of cluster.terms) {
      const termNorm = removeVietnameseAccents(term);
      if (rawLower.includes(term) || normalized.includes(termNorm)) {
        return {
          isAllowed: false,
          severity: "blocked",
          violationCategory: cluster.category,
          flaggedWord: term,
          userMessage: `Nội dung chứa cụm từ vi phạm Tiêu chuẩn Cộng đồng (${term}). Hệ thống đã tự động ngăn chặn để bảo vệ an toàn người dùng.`,
        };
      }
    }
  }

  return { isAllowed: true, severity: "clean" };
}
