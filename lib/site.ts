export const siteConfig = {
  name: "Myso",
  legalName: "Myso",
  tagline: "Modern Community Platform · Editorial Publishing · Knowledge Discovery",
  description:
    "Myso is a modern community platform for writing, discussing, sharing knowledge, and connecting.",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://mythos-running.vercel.app",
  locale: "vi",
  github: "https://github.com/varustran/mythos-running",
  social: [
    { label: "X (Twitter)", href: "https://x.com/" },
    { label: "GitHub", href: "https://github.com/varustran/mythos-running" },
  ],
};

export const navItems = [
  { key: "feed", href: "/" },
  { key: "explore", href: "/explore" },
  { key: "quests", href: "/quests" },
  { key: "wallet", href: "/wallet" },
  { key: "standards", href: "/legal/standards" },
] as const;

export const footerGroups = [
  {
    titleKey: "explore",
    links: [
      { label: "Bảng tin Mạng xã hội", href: "/" },
      { label: "Khám phá Chủ đề & Tags", href: "/explore" },
      { label: "Trung tâm Nhiệm vụ (Earn Points)", href: "/quests" },
      { label: "Ví Đa chuỗi & Doanh thu", href: "/wallet" },
    ],
  },
  {
    titleKey: "creator",
    links: [
      { label: "Đăng nhập & Tài khoản", href: "/login" },
      { label: "Thiết lập Onboarding", href: "/onboarding" },
      { label: "Cài đặt tài khoản", href: "/settings" },
      { label: "Chính sách Doanh thu 85/15", href: "/monetization" },
    ],
  },
  {
    titleKey: "legal",
    links: [
      { label: "Tiêu chuẩn cộng đồng & Pháp lý", href: "/legal/standards" },
      { label: "Bảo mật & Quyền riêng tư", href: "/privacy" },
      { label: "Điều khoản dịch vụ", href: "/terms" },
      { label: "Miễn trừ trách nhiệm", href: "/disclaimer" },
      { label: "Câu hỏi thường gặp (FAQ)", href: "/legal/faq" },
    ],
  },
];
