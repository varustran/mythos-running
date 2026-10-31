export const siteConfig = {
  name: "Mythos Running",
  legalName: "Mythos Running Collective",
  tagline: "International Running Community · Editorial Publishing · Science & Culture",
  description:
    "Mythos Running is an international editorial publishing platform and community ecosystem for runners worldwide.",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://mythos-running.vercel.app",
  locale: "vi",
  github: "https://github.com/varustran/mythos-running",
  social: [
    { label: "X (Twitter)", href: "https://x.com/" },
    { label: "GitHub", href: "https://github.com/varustran/mythos-running" },
    { label: "Strava", href: "https://www.strava.com/" },
  ],
};

export const navItems = [
  { key: "feed", href: "/" },
  { key: "wiki", href: "/wiki" },
  { key: "chat", href: "/chat" },
  { key: "notes", href: "/notes" },
  { key: "blog", href: "/blog" },
  { key: "arcade", href: "/arcade" },
  { key: "standards", href: "/legal/standards" },
] as const;

export const footerGroups = [
  {
    titleKey: "explore",
    links: [
      { label: "Bảng tin Mạng xã hội", href: "/" },
      { label: "Bách khoa Mythos Wiki", href: "/wiki" },
      { label: "Chat mã hóa E2EE", href: "/chat" },
      { label: "Ghi chú nhanh bảo mật", href: "/notes" },
      { label: "Diễn đàn thảo luận", href: "/blog" },
      { label: "Trò chơi Arcade", href: "/arcade" },
    ],
  },
  {
    titleKey: "creator",
    links: [
      { label: "Tạo tài khoản & Profile", href: "/login" },
      { label: "Đăng bài viết mới", href: "/blog/create" },
      { label: "Tài liệu cơ chế kiếm tiền", href: "/monetization" },
      { label: "Câu hỏi thường gặp (FAQ)", href: "/legal/faq" },
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
