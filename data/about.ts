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
      "Mythos Running là một dự án độc lập về kiến thức, công cụ và cộng đồng chạy bộ, được xây dựng tại Huế. Mục tiêu không phải tạo thêm một trang tin nhanh, mà là một nơi mà mỗi con số và mỗi lời khuyên đều có thể kiểm chứng.",
    storyTitle: "Vì sao có Mythos",
    story:
      "Người chạy Việt Nam có rất nhiều nguồn thông tin rời rạc: một bài đăng về pace, một video về giày, một bảng tính chia sẻ trong nhóm. Mythos gom những mảnh đó lại thành một hệ sinh thái có cấu trúc: bài viết nền tảng, máy tính hoạt động thật, dữ liệu giải chạy, cung đường địa phương và một cộng đồng minh bạch. Chúng tôi tin rằng hiểu rõ mình đang làm gì quan trọng hơn việc chạy nhanh hơn người khác.",
    principlesTitle: "Nguyên tắc",
    principles: [
      { title: "Bằng chứng trước cảm hứng", desc: "Nội dung dựa trên tài liệu có thể tra cứu, không dựa trên khẩu hiệu." },
      { title: "Công cụ phải hoạt động", desc: "Máy tính hiển thị công thức và cho kết quả ngay, không phải bản demo." },
      { title: "Minh bạch cả giới hạn", desc: "Chúng tôi nói rõ đâu là ước tính, đâu là bằng chứng và đâu là giả thuyết." },
      { title: "Địa phương, không sao chép", desc: "Cung đường, sự kiện và bối cảnh được viết cho người chạy Việt Nam." },
    ],
    hueTitle: "Được xây dựng ở Huế",
    hue: "Huế là nơi có sông, có đồi, có mùa mưa dài và những cung đường chạy rất riêng. Chúng tôi bắt đầu từ đây, với mong muốn ghi lại những gì thực sự hữu ích cho người chạy trong điều kiện khí hậu và địa hình của miền Trung.",
    ctaTitle: "Bắt đầu từ kiến thức nền tảng",
    ctaDesc: "Đọc Học viện, thử một công cụ, hoặc gửi cho chúng tôi cung đường bạn muốn thấy trên Mythos.",
    cta: "Khám phá Học viện",
  },
  en: {
    intro:
      "Mythos Running is an independent project for running knowledge, tools and community, built in Hue. The goal is not another fast-news site, but a place where every number and every recommendation can be checked.",
    storyTitle: "Why Mythos exists",
    story:
      "Runners in Vietnam have plenty of fragmented information: a post about pace, a video about shoes, a spreadsheet shared in a group chat. Mythos brings those pieces into a structured ecosystem: foundational articles, calculators that actually work, race data, local routes and a transparent community. We believe understanding what you are doing matters more than running faster than someone else.",
    principlesTitle: "Principles",
    principles: [
      { title: "Evidence before inspiration", desc: "Content is based on traceable material, not slogans." },
      { title: "Tools must work", desc: "Calculators show their formulas and return real results, not demos." },
      { title: "Transparent about limits", desc: "We state clearly what is an estimate, what is evidence and what is a hypothesis." },
      { title: "Local, not copied", desc: "Routes, events and context are written for runners in Vietnam." },
    ],
    hueTitle: "Built in Hue",
    hue: "Hue has rivers, hills, a long rainy season and very particular running routes. We start here, documenting what is genuinely useful for runners in the climate and terrain of central Vietnam.",
    ctaTitle: "Start with the foundations",
    ctaDesc: "Read the Academy, try a tool, or send us the route you want to see on Mythos.",
    cta: "Explore the Academy",
  },
  "zh-CN": {
    intro:
      "Mythos Running 是一个独立的跑步知识、工具与社区项目，建于顺化。目标不是再做一个快讯网站，而是让每一个数字和建议都能被核查。",
    storyTitle: "为什么有 Mythos",
    story:
      "越南跑者面对的是大量碎片化信息：一条关于配速的帖子、一个关于跑鞋的视频、群里分享的表格。Mythos 把这些片段整合成有结构的生态：基础文章、真正可用的计算器、赛事数据、本地路线和透明的社区。我们相信，理解自己在做什么，比跑得比别人快更重要。",
    principlesTitle: "原则",
    principles: [
      { title: "证据先于激励", desc: "内容基于可追溯资料，而不是口号。" },
      { title: "工具必须可用", desc: "计算器公开公式并立即给出真实结果，而不是演示。" },
      { title: "坦白局限", desc: "我们明确说明哪些是估算、哪些是证据、哪些是假设。" },
      { title: "本地而非照搬", desc: "路线、赛事与语境都为越南跑者而写。" },
    ],
    hueTitle: "建于顺化",
    hue: "顺化有河流、山丘、漫长雨季和独特的跑步路线。我们从这里出发，记录在中部气候与地形下真正有用的内容。",
    ctaTitle: "从基础开始",
    ctaDesc: "阅读学院、试用工具，或把你希望在 Mythos 看到的路线发给我们。",
    cta: "探索学院",
  },
  ja: {
    intro:
      "Mythos Running は、フエで生まれたランニングの知識、ツール、コミュニティの独立プロジェクトです。目的は速報サイトではなく、すべての数字と提案を検証できる場所をつくることです。",
    storyTitle: "Mythos の理由",
    story:
      "ベトナムのランナーは、ペースについての投稿、シューズの動画、グループで共有される表など、断片的な情報に囲まれています。Mythos はそれらを構造あるエコシステムにまとめます。基礎記事、実際に動く計算機、大会データ、ローカルルート、透明なコミュニティ。何をしているかを理解することが、誰より速く走ることより重要だと考えています。",
    principlesTitle: "原則",
    principles: [
      { title: "刺激より証拠", desc: "内容はスローガンではなく、追跡可能な資料に基づきます。" },
      { title: "ツールは動くこと", desc: "計算機は式を公開し、デモではなく実際の結果を返します。" },
      { title: "限界も透明に", desc: "推定、証拠、仮説の違いを明確にします。" },
      { title: "コピーではなくローカル", desc: "ルート、大会、文脈はベトナムのランナー向けに書きます。" },
    ],
    hueTitle: "フエで構築",
    hue: "フエには川、丘、長い雨季、独特のランニングルートがあります。中部の気候と地形で本当に役立つことを記録するため、ここから始めました。",
    ctaTitle: "基礎から始める",
    ctaDesc: "アカデミーを読む、ツールを試す、または Mythos で見たいルートを送ってください。",
    cta: "アカデミーを見る",
  },
};
