export const siteConfig = {
  name: "Mythos Running",
  legalName: "Mythos Running",
  description:
    "A digital ecosystem for runners: training knowledge, working tools, community, events, routes and research from Hue, Vietnam.",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://mythos-running.vercel.app",
  locale: "vi",
  location: "Hue, Vietnam",
  github: "https://github.com/varustran/mythos-running",
  social: [
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "Strava", href: "https://www.strava.com/" },
    { label: "YouTube", href: "https://www.youtube.com/" },
  ],
};

export const navItems = [
  { key: "academy", href: "/academy" },
  { key: "tools", href: "/tools" },
  { key: "events", href: "/events" },
  { key: "routes", href: "/routes" },
  { key: "gear", href: "/gear" },
  { key: "community", href: "/community" },
  { key: "labs", href: "/labs" },
] as const;

export const footerGroups = [
  {
    titleKey: "explore",
    links: [
      { label: "Academy", href: "/academy" },
      { label: "Tools", href: "/tools" },
      { label: "Events", href: "/events" },
      { label: "Routes", href: "/routes" },
      { label: "Gear", href: "/gear" },
    ],
  },
  {
    titleKey: "company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Mythos Labs", href: "/labs" },
      { label: "Community", href: "/community" },
    ],
  },
  {
    titleKey: "legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Editorial policy", href: "/editorial-policy" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
  },
];
