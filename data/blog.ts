export interface CommunityPostItem {
  id: string;
  slug: string;
  title: string;
  flair: string;
  coverImage: string;
  domain: string;
  excerpt: string;
  content: string;
  authorName: string;
  viewsCount: number;
  upvotes: number;
  monetizationEnabled: boolean;
  estimatedEarningsUsd: number;
  publishedAt: string;
}

export const starterCommunityPosts: CommunityPostItem[] = [
  {
    id: "post-1",
    slug: "huong-dan-xay-dung-ai-agent-tu-dong-2026",
    title: "Hướng dẫn xây dựng AI Agent tự hành từ con số 0 trong năm 2026",
    flair: "[Kỹ thuật]",
    coverImage: "/images/hero-running.jpg",
    domain: "Công nghệ & AI",
    excerpt: "Cách kiến trúc hệ thống multi-agent có khả năng lập kế hoạch, sử dụng công cụ và tự sửa lỗi trong môi trường thực tế.",
    content: `Xu hướng phát triển phần mềm đang chuyển dịch mạnh mẽ từ các chatbot đối thoại đơn thuần sang các **Autonomous AI Agents** (Tác nhân AI tự hành) có khả năng thực thi nhiệm vụ phức tạp.

Khác với LLM thông thường chỉ phản hồi thụ động theo lượt hỏi-đáp, một Agent hoàn chỉnh tích hợp:
1. **Lập kế hoạch động (Dynamic Planning):** Phân rã mục tiêu lớn thành chuỗi tác vụ khả thi.
2. **Bộ nhớ đa tầng (Multi-tier Memory):** Lưu giữ bối cảnh phiên làm việc và trích xuất tri thức dài hạn qua vector embeddings.
3. **Gọi công cụ (Tool Calling):** Tương tác với hệ điều hành, trình duyệt web, cơ sở dữ liệu và API bên thứ ba.
4. **Vòng lặp tự kiểm tra và sửa sai (Self-reflection Loop):** Thẩm định kết quả và điều chỉnh chiến lược khi gặp lỗi.

Dưới đây là kiến trúc tham chiếu tiêu chuẩn cho production agent sẵn sàng triển khai trong thực tế.`,
    authorName: "Alex Tran",
    viewsCount: 0,
    upvotes: 0,
    monetizationEnabled: true,
    estimatedEarningsUsd: 0.0,
    publishedAt: "2026-10-30",
  },
  {
    id: "post-2",
    slug: "chay-marathon-duoi-4-gio-chien-luoc-pacing-dinh-duong",
    title: "Chạy Sub-4 Marathon: Toàn bộ chiến lược Pacing âm bản và nạp gel",
    flair: "[Chia sẻ]",
    coverImage: "/images/route-song-huong.jpg",
    domain: "Thể thao & Chạy bộ",
    excerpt: "Kinh nghiệm thực chiến giúp người chạy phong trào vượt qua rào cản Sub-4 một cách khoa học và không bị sụp đổ ở km 32.",
    content: `Mốc 4 giờ trong chạy cự ly Marathon 42.195 km đòi hỏi pace trung bình 5:41/km. Rất nhiều runner mắc sai lầm xuất phát quá nhanh ở nửa đầu giải (Positive Split) dẫn tới cạn kiệt glycogen và "đâm vào tường" (The Wall) từ km 30-35.

### Quy tắc Negative Split
- **Km 0 - 5:** Khởi động chậm hơn mục tiêu 10-15s/km (Pace 5:50 - 5:55). Ổn định nhịp tim và tìm khoảng trống.
- **Km 6 - 21:** Đưa về pace mục tiêu 5:40/km. Nhịp thở đều đặn 2-2 hoặc 3-3.
- **Km 22 - 35:** Giữ vững kỷ luật pace. Uống từng ngụm nước nhỏ tại mỗi trạm tiếp nước.
- **Km 36 - 42.195:** Nếu năng lượng còn dồi dào, tăng tốc nhẹ về pace 5:30/km để cán đích kiêu hãnh.

### Chiến lược nạp Carbohydrate
Nạp 1 gói năng lượng gel (chứa 25-30g carbs) cách mỗi 40-45 phút chạy, kèm 100-150ml nước lọc để hỗ trợ dạ dày hấp thụ tối ưu.`,
    authorName: "Hoang Minh Runner",
    viewsCount: 0,
    upvotes: 0,
    monetizationEnabled: true,
    estimatedEarningsUsd: 0.0,
    publishedAt: "2026-10-29",
  },
  {
    id: "post-3",
    slug: "biohacking-giac-ngu-sau-va-nang-luong-dinh-cao",
    title: "Biohacking giấc ngủ: 5 thay đổi giúp tăng 40% giấc ngủ sâu (Deep Sleep)",
    flair: "[Thảo luận]",
    coverImage: "/images/academy-hydration.jpg",
    domain: "Sức khỏe & Biohacking",
    excerpt: "Các giao thức khoa học về tiếp xúc ánh sáng mặt trời, tắm lạnh và bổ sung magie glycinate để tối ưu hóa phục hồi thần kinh.",
    content: `Giấc ngủ sâu (Slow-wave sleep) là giai đoạn quan trọng nhất để não bộ giải phóng hormone tăng trưởng GH và hệ thống Glymphatic dọn dẹp các chất thải chuyển hóa.

Năm giao thức đã được kiểm chứng lâm sàng:
1. **Ánh sáng ban mai:** 15 phút ngắm trời sáng ngay sau khi thức dậy nhằm đồng bộ đồng hồ sinh học SCN.
2. **Cắt giảm ánh sáng xanh sau 20:00:** Bật chế độ ban đêm trên mọi thiết bị màn hình hoặc đeo kính chặn ánh sáng xanh.
3. **Nhiệt độ phòng ngủ 18-20°C:** Thân nhiệt hạ là tín hiệu tự nhiên giúp cơ thể đi vào giấc ngủ sâu.
4. **Ngừng nạp Caffeine 9 tiếng trước giờ ngủ:** Đảm bảo nồng độ Adenosine tích lũy đủ để kích hoạt cơn buồn ngủ tự nhiên.
5. **Bổ sung Magie Glycinate hoặc L-Theanine:** Làm dịu hệ thần kinh trung ương và tăng sóng não Alpha/Delta.`,
    authorName: "Dr. Elena Nguyen",
    viewsCount: 0,
    upvotes: 0,
    monetizationEnabled: true,
    estimatedEarningsUsd: 0.0,
    publishedAt: "2026-10-28",
  },
  {
    id: "post-4",
    slug: "kinh-nghiem-digital-nomad-tai-chau-a",
    title: "Cẩm nang sống và làm việc từ xa (Digital Nomad) tại Đông Nam Á",
    flair: "[Review]",
    coverImage: "/images/community-1.jpg",
    domain: "Lối sống & Tự do",
    excerpt: "So sánh chi phí sinh hoạt, tốc độ Internet, cộng đồng khởi nghiệp và visa cư trú cho lập trình viên và nhà sáng tạo nội dung.",
    content: `Làm việc từ xa xuyên biên giới không còn là đặc quyền của thiểu số. Với sự phát triển của công nghệ điện toán đám mây và kết nối di động, việc tự do lựa chọn địa điểm làm việc đã trở thành hiện thực khả thi cho hàng triệu lập trình viên và kỹ sư phần mềm.

Kinh nghiệm tối quan trọng khi lựa chọn thành phố:
- Luôn kiểm tra tốc độ Upload/Download thực tế tại co-working space trước khi đặt cọc dài hạn.
- Dự phòng kết nối mạng 5G qua eSIM nội địa.
- Xây dựng kỷ luật giờ làm việc tách biệt với thời gian nghỉ ngơi để tránh kiệt sức (burnout).`,
    authorName: "Khai Le Nomad",
    viewsCount: 0,
    upvotes: 0,
    monetizationEnabled: true,
    estimatedEarningsUsd: 0.0,
    publishedAt: "2026-10-27",
  },
];
