import type { RunningEvent } from "./types";

export const events: RunningEvent[] = [
  {
    slug: "mythos-sunrise-10k-sample",
    title: {
      vi: "Mythos Sunrise 10K (mẫu)",
      en: "Mythos Sunrise 10K (sample)",
      "zh-CN": "Mythos 日出 10K（示例）",
      ja: "Mythos サンライズ 10K（サンプル）",
    },
    description: {
      vi: "Sự kiện mẫu minh họa hệ thống quản lý giải chạy. Đây không phải giải chạy đang mở đăng ký.",
      en: "A sample record demonstrating the event system. This is not a real race open for registration.",
      "zh-CN": "用于演示赛事系统的示例记录，并非真实开放报名的比赛。",
      ja: "イベント管理システムを示すサンプルです。実際に募集している大会ではありません。",
    },
    date: "2026-12-13T05:30:00+07:00",
    location: {
      vi: "Phố đi bộ Nguyễn Đình Chiểu, Huế",
      en: "Nguyen Dinh Chieu pedestrian street, Hue",
      "zh-CN": "顺化阮廷沼步行街",
      ja: "フエ、グエンディンチエウ歩行者通り",
    },
    city: "Hue",
    distances: [5, 10],
    organizer: "Mythos Running Community (demo)",
    officialUrl: null,
    featured: true,
    sample: true,
  },
  {
    slug: "huong-river-half-sample",
    title: {
      vi: "Hương River Half Marathon (mẫu)",
      en: "Huong River Half Marathon (sample)",
      "zh-CN": "香江半程马拉松（示例）",
      ja: "フオンリバー・ハーフマラソン（サンプル）",
    },
    description: {
      vi: "Sự kiện mẫu với cự ly bán marathon dọc sông Hương. Thông tin ngày và đăng ký sẽ được cập nhật từ ban tổ chức thật.",
      en: "A sample half marathon along the Huong River. Dates and registration will be updated from the actual organiser.",
      "zh-CN": "沿香江的半程马拉松示例。日期与报名信息将由真实主办方更新。",
      ja: "フオン川沿いのハーフマラソンサンプル。日程とエントリーは実際の主催者が更新します。",
    },
    date: "2027-03-21T04:45:00+07:00",
    location: {
      vi: "Công viên Tứ Tượng, Huế",
      en: "Tu Tuong Park, Hue",
      "zh-CN": "顺化四象公园",
      ja: "フエ、トゥトゥオン公園",
    },
    city: "Hue",
    distances: [10, 21.1],
    organizer: "Mythos Running Community (demo)",
    officialUrl: null,
    sample: true,
  },
  {
    slug: "community-trail-day-sample",
    title: {
      vi: "Community Trail Day (mẫu)",
      en: "Community Trail Day (sample)",
      "zh-CN": "社区越野日（示例）",
      ja: "コミュニティ・トレイルデー（サンプル）",
    },
    description: {
      vi: "Buổi chạy trail cộng đồng mẫu quanh đồi Vọng Cảnh, dành cho mọi trình độ. Không có đăng ký chính thức.",
      en: "A sample community trail run around Vong Canh Hill for all levels. No official registration.",
      "zh-CN": "围绕望景山的社区越野示例活动，适合各水平跑者。无官方报名。",
      ja: "ヴォンカインの丘周辺を走るコミュニティトレイルのサンプル。公式エントリーはありません。",
    },
    date: "2027-06-06T05:00:00+07:00",
    location: {
      vi: "Đồi Vọng Cảnh, Huế",
      en: "Vong Canh Hill, Hue",
      "zh-CN": "顺化望景山",
      ja: "フエ、ヴォンカインの丘",
    },
    city: "Hue",
    distances: [8, 15],
    organizer: "Mythos Running Community (demo)",
    officialUrl: null,
    sample: true,
  },
];

export function getEvent(slug: string) {
  return events.find((event) => event.slug === slug);
}

export function getUpcomingEvents(limit = 3) {
  const now = Date.now();
  return events
    .filter((event) => new Date(event.date).getTime() >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);
}
