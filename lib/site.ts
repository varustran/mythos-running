export const siteConfig = {
  name: "Myso",
  legalName: "Myso Network",
  tagline: "Open Encyclopedia · Creator Network · Tools & Games",
  description:
    "Myso is a multi-domain open knowledge base, creator publication network, suite of working tools, and browser game studio with decentralized peer verification.",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://mythos-running.vercel.app",
  locale: "vi",
  github: "https://github.com/varustran/mythos-running",
  social: [
    { label: "X (Twitter)", href: "https://x.com/" },
    { label: "GitHub", href: "https://github.com/varustran/mythos-running" },
    { label: "Discord", href: "https://discord.com/" },
  ],
};

export const navItems = [
  { key: "wiki", href: "/wiki" },
  { key: "blog", href: "/blog" },
  { key: "notes", href: "/notes" },
  { key: "tools", href: "/tools" },
  { key: "arcade", href: "/arcade" },
  { key: "monetization", href: "/monetization" },
  { key: "community", href: "/community" },
] as const;

export const footerGroups = [
  {
    titleKey: "explore",
    links: [
      { label: "Bách khoa Myso Wiki", href: "/wiki" },
      { label: "Mạng Blog & Tác giả", href: "/blog" },
      { label: "Ghi chú nhanh (Myso Notes)", href: "/notes" },
      { label: "Công cụ đa năng", href: "/tools" },
      { label: "Myso Arcade (Games)", href: "/arcade" },
    ],
  },
  {
    titleKey: "creator",
    links: [
      { label: "Kiếm tiền từ bài viết", href: "/monetization" },
      { label: "Đăng bài mới", href: "/blog/create" },
      { label: "Hàng đợi kiểm duyệt 2-Peer", href: "/wiki/review" },
      { label: "Cộng đồng tác giả", href: "/community" },
    ],
  },
  {
    titleKey: "legal",
    links: [
      { label: "Miễn trừ trách nhiệm", href: "/disclaimer" },
      { label: "Chính sách kiểm duyệt", href: "/editorial-policy" },
      { label: "Điều khoản sử dụng", href: "/terms" },
      { label: "Bảo mật & Quyền riêng tư", href: "/privacy" },
    ],
  },
];
