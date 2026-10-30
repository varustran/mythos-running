import type { Locale } from "@/lib/i18n/settings";

type AboutContent = {
  intro: string;
  storyTitle: string;
  story: string;
  principlesTitle: string;
  principles: { title: string; desc: string }[];
  hueTitle: string;
  hue: string;
  ctaTitle: string;
  ctaDesc: string;
  cta: string;
};

export const aboutContent: Record<Locale, AboutContent> = {
  vi: {
    intro:
      "Myso là một mạng lưới tri thức mở đa lĩnh vực, nền tảng xuất bản tự do có cơ chế kiếm tiền minh bạch, bộ công cụ hữu ích và studio trò chơi trực tuyến. Mục tiêu là xây dựng một siêu cộng đồng tự do, dân chủ và kiểm duyệt độc lập.",
    storyTitle: "Vì sao có Myso",
    story:
      "Thế giới số hiện nay chứa đầy những mảnh thông tin bị phân mảnh, thuật toán giật tít và các bức tường thu phí. Myso hợp nhất bách khoa toàn thư mở Wikipedia với cơ chế kiểm duyệt 2-Peer IP Review độc lập, tạo không gian để bất kỳ ai cũng có thể chia sẻ, viết bài kiếm tiền theo lượt xem và tiếp cận những công cụ mở mạnh mẽ.",
    principlesTitle: "Nguyên tắc cốt lõi của Myso",
    principles: [
      { title: "Mở và phi tập trung", desc: "Đóng góp không cần đăng nhập bắt buộc. Kiểm duyệt dựa trên 2 địa chỉ IP độc lập và nguồn trích dẫn rõ ràng." },
      { title: "Tôn vinh giá trị sáng tạo", desc: "Chính sách phân chia doanh thu theo lượt xem minh bạch (Creator Rewards) cho mọi người viết." },
      { title: "Công cụ phải hoạt động thật", desc: "Máy tính hiển thị công thức minh bạch, bộ ghi chú bảo mật tức thì, không dùng mockup giả lập." },
      { title: "Bảo mật & Quyền riêng tư", desc: "Không bán dữ liệu người dùng, hỗ trợ mã hóa ghi chú và tự hủy sau khi đọc." },
    ],
    hueTitle: "Hệ Sinh Thái Mở Không Biên Giới",
    hue: "Myso hoạt động như một nền tảng toàn cầu mở, kết nối tri thức từ Wikipedia, cộng đồng lập trình viên, người yêu thể thao, nhà sáng tạo nội dung và độc giả khắp nơi.",
    ctaTitle: "Bắt đầu khám phá và sáng tạo cùng Myso",
    ctaDesc: "Tra cứu bách khoa Myso Wiki, viết bài đầu tiên để bật kiếm tiền, hoặc trải nghiệm bộ game arcade trực tiếp trên web.",
    cta: "Khám phá Myso Wiki",
  },
  en: {
    intro:
      "Myso is a multi-domain open knowledge network, creator publishing platform with view-based rewards, suite of working utilities, and browser game studio. Our mission is to empower an open, transparent, peer-verified super community.",
    storyTitle: "Why Myso exists",
    story:
      "The modern web is filled with fragmented silos, paywalls, and sensationalist algorithms. Myso unites live Wikipedia federation with decentralized 2-peer IP moderation, giving everyone the freedom to read, contribute, write, and earn transparently.",
    principlesTitle: "Core Principles",
    principles: [
      { title: "Open & Decentralized", desc: "Contribute without barriers. Moderated by 2 distinct IP peer reviewers with mandatory citations." },
      { title: "Creator Revenue Sharing", desc: "Transparent view-based compensation (Creator Rewards) for quality publications." },
      { title: "Working Real Utilities", desc: "Transparent formulas, instant self-destruct pastebins, and zero fake mockups." },
      { title: "Privacy by Design", desc: "No personal data selling, client-side encryption, and ephemeral secret notes." },
    ],
    hueTitle: "Global Borderless Ecosystem",
    hue: "Myso operates as an open global ecosystem connecting knowledge, sports scientists, tech developers, and creative writers worldwide.",
    ctaTitle: "Start exploring and creating with Myso",
    ctaDesc: "Browse Myso Wiki, publish your first monetized post, or play our original arcade games online.",
    cta: "Explore Myso Wiki",
  },
  "zh-CN": {
    intro:
      "Myso 是一个跨领域的开放知识网络、创作者收益共享出版平台、实用工具集与浏览器游戏工作室。",
    storyTitle: "为什么创建 Myso",
    story:
      "Myso 将维基百科实时引用与去中心化 2-Peer 对等审核相结合，为每个人提供自由阅读、编写百科、发表文章获取收益的开放数字生态。",
    principlesTitle: "核心原则",
    principles: [
      { title: "开放与对等审核", desc: "无需门槛自由贡献，需 2 个独立 IP 核验与来源引用。" },
      { title: "创作者收益透明", desc: "基于有效阅读量的透明分成计划。" },
      { title: "真实可用工具", desc: "即时便签、运动计算与科学公式。" },
      { title: "隐私至上", desc: "阅后即焚、密码保护与绝不出售个人隐私。" },
    ],
    hueTitle: "无边界开放网络",
    hue: "Myso 面向全球用户，连接来自世界各地的创作者、开发者与知识探索者。",
    ctaTitle: "开启 Myso 探索之旅",
    ctaDesc: "浏览 Myso 百科，发表文章参与变现，或畅玩街机游戏。",
    cta: "探索 Myso 百科",
  },
  ja: {
    intro:
      "Myso は多分野にわたるオープン知識ネットワーク、収益分配型クリエイター出版プラットフォーム、実用ツール集、ブラウザゲームスタジオです。",
    storyTitle: "Myso の存在理由",
    story:
      "Myso は Wikipedia とのリアルタイム連携と 2-Peer ピアレビューを統合し、誰でも知識を検索・執筆し、透明性の高い収益を得られるエコシステムを提供します。",
    principlesTitle: "基本原則",
    principles: [
      { title: "オープン＆分散型", desc: "ログイン不要で投稿可能。2 つの独立 IP による承認と情報源の明記が条件。" },
      { title: "クリエイター報酬", desc: "閲覧数に応じた透明な収益分配プログラム。" },
      { title: "真に動く実用ツール", desc: "自己消去ノート、計算機、すべてが本物。" },
      { title: "プライバシー重視", desc: "個人データの売却なし、暗号化とセキュアな設計。" },
    ],
    hueTitle: "国境なきグローバルエコシステム",
    hue: "Myso は世界中のクリエイター、研究者、ランナー、開発者を繋ぐ開かれたネットワークです。",
    ctaTitle: "Myso を体験しよう",
    ctaDesc: "Myso 百科で調べものをするか、記事を書いて収益化を始めましょう。",
    cta: "Myso 百科を見る",
  },
};
