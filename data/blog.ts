export interface CommunityPostItem {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  domain: string;
  excerpt: string;
  content: string;
  authorName: string;
  viewsCount: number;
  monetizationEnabled: boolean;
  estimatedEarningsUsd: number;
  publishedAt: string;
}

export const starterCommunityPosts: CommunityPostItem[] = [
  {
    id: "post-1",
    slug: "huong-dan-xay-dung-ai-agent-tu-dong-2026",
    title: "Hướng dẫn xây dựng AI Agent tự hành từ con số 0 trong năm 2026",
    coverImage: "/images/hero-running.jpg",
    domain: "Công nghệ & AI",
    excerpt: "Cách kiến trúc hệ thống multi-agent có khả năng lập kế hoạch, sử dụng công cụ và tự sửa lỗi trong môi trường thực tế.",
    content: `Xu hướng phát triển phần mềm đang chuyển dịch mạnh mẽ từ các chatbot đối thoại đơn thuần sang các **Autonomous AI Agents** (Tác nhân AI tự hành) có khả năng thực thi nhiệm vụ phức tạp...`,
    authorName: "Alex Tran",
    viewsCount: 24500,
    monetizationEnabled: true,
    estimatedEarningsUsd: 110.25,
    publishedAt: "2026-10-28",
  },
  {
    id: "post-2",
    slug: "chay-marathon-duoi-4-gio-chien-luoc-pacing-dinh-duong",
    title: "Chạy Sub-4 Marathon: Toàn bộ chiến lược Pacing âm bản và nạp gel",
    coverImage: "/images/route-song-huong.jpg",
    domain: "Thể thao & Chạy bộ",
    excerpt: "Kinh nghiệm thực chiến giúp người chạy phong trào vượt qua rào cản Sub-4 một cách khoa học và không bị sụp đổ ở km 32.",
    content: `Mốc 4 giờ trong chạy cự ly Marathon 42.195 km đòi hỏi pace trung bình 5:41/km. Rất nhiều runner mắc sai lầm xuất phát quá nhanh ở nửa đầu giải...`,
    authorName: "Hoang Minh Runner",
    viewsCount: 18200,
    monetizationEnabled: true,
    estimatedEarningsUsd: 72.8,
    publishedAt: "2026-10-26",
  },
  {
    id: "post-3",
    slug: "biohacking-giac-ngu-sau-va-nang-luong-dinh-cao",
    title: "Biohacking giấc ngủ: 5 thay đổi giúp tăng 40% giấc ngủ sâu (Deep Sleep)",
    coverImage: "/images/academy-hydration.jpg",
    domain: "Sức khỏe & Biohacking",
    excerpt: "Các giao thức khoa học về tiếp xúc ánh sáng mặt trời, tắm lạnh và bổ sung magie glycinate để tối ưu hóa phục hồi thần kinh.",
    content: `Giấc ngủ sâu (Slow-wave sleep) là giai đoạn quan trọng nhất để não bộ giải phóng hormone tăng trưởng GH và hệ thống Glymphatic dọn dẹp các chất thải chuyển hóa...`,
    authorName: "Dr. Elena Nguyen",
    viewsCount: 31400,
    monetizationEnabled: true,
    estimatedEarningsUsd: 141.3,
    publishedAt: "2026-10-29",
  },
  {
    id: "post-4",
    slug: "kinh-nghiem-digital-nomad-tai-chau-a",
    title: "Cẩm nang sống và làm việc từ xa (Digital Nomad) tại Đông Nam Á",
    coverImage: "/images/community-1.jpg",
    domain: "Lối sống & Tự do",
    excerpt: "So sánh chi phí sinh hoạt, tốc độ Internet, cộng đồng khởi nghiệp và visa cư trú cho lập trình viên và nhà sáng tạo nội dung.",
    content: `Làm việc từ xa xuyên biên giới không còn là đặc quyền của thiểu số. Với sự phát triển của công nghệ điện toán đám mây và kết nối di động...`,
    authorName: "Khai Le Nomad",
    viewsCount: 15600,
    monetizationEnabled: true,
    estimatedEarningsUsd: 62.4,
    publishedAt: "2026-10-27",
  },
];
