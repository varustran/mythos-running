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
  { key: "wiki", href: "/wiki" },
  { key: "chat", href: "/chat" },
  { key: "notes", href: "/notes" },
  { key: "standards", href: "/legal/standards" },
] as const;

export const footerGroups = [
  {
    titleKey: "explore",
    links: [
      { label: "Bảng tin Mạng xã hội", href: "/" },
      { label: "Bách khoa Myso Wiki", href: "/wiki" },
      { label: "Chat mã hóa E2EE", href: "/chat" },
      { label: "Ghi chú nhanh bảo mật", href: "/notes" },
    ],
  },
  {
    titleKey: "creator",
    links: [
      { label: "Tạo tài khoản & Profile", href: "/login" },
      { label: "Thiết lập hồ sơ Onboarding", href: "/onboarding" },
      { label: "Cài đặt tài khoản", href: "/settings" },
      { label: "Đóng góp bài viết Wiki", href: "/wiki/propose" },
    ],
  },
  {
    titleKey: "legal",
    links: [
      { label: "Tiêu chuẩn cộng đồng & Pháp lý", href: "/legal/standards" },
      { label: "Bảo mật & Quyền riêng tư", href: "/privacy" },
      { label: "Điều khoản sử dụng", href: "/terms" },
      { label: "Miễn trừ trách nhiệm", href: "/disclaimer" },
    ],
  },
];
