import type { LabProject } from "./types";

export const labProjects: LabProject[] = [
  {
    slug: "pace-heart-rate-relationship",
    title: {
      vi: "Quan hệ pace – nhịp tim: không tuyến tính",
      en: "Pace–heart rate: a non-linear relationship",
      "zh-CN": "配速与心率：非线性关系",
      ja: "ペースと心拍：非線形な関係",
    },
    summary: {
      vi: "Phân tích dữ liệu mẫu cho thấy nhịp tim tăng chậm ở pace dễ và tăng nhanh khi tiến gần ngưỡng.",
      en: "Sample data shows heart rate rising slowly at easy paces and steeply near threshold.",
      "zh-CN": "示例数据显示，轻松配速下心率上升缓慢，接近阈值时迅速上升。",
      ja: "サンプルデータでは、楽なペースでは心拍の上昇が緩やかで、閾値付近で急上昇します。",
    },
    description: {
      vi: "Chúng tôi thu thập dữ liệu từ các buổi chạy ổn định trên cùng một cung đường và so sánh pace với nhịp tim trung bình. Kết quả cho thấy một đường cong rõ ràng, nhưng độ phân tán giữa các ngày là đáng kể do nhiệt độ và giấc ngủ.",
      en: "We collected data from steady runs on the same route and compared pace with average heart rate. The result shows a clear curve, but day-to-day scatter is substantial due to temperature and sleep.",
      "zh-CN": "我们收集同一路线的稳定跑数据，比较配速与平均心率。结果显示明显曲线，但受温度与睡眠影响，日间离散度较大。",
      ja: "同じコースでの定速走データを集め、ペースと平均心拍を比較しました。明確な曲線が見られる一方、気温や睡眠により日ごとのばらつきは大きい結果でした。",
    },
    methodology: {
      vi: "Dữ liệu mẫu 42 buổi chạy, cùng một người, cùng cung đường. Loại bỏ 10 phút đầu và 5 phút cuối. Đây là quan sát thử nghiệm, không phải nghiên cứu có đối chứng.",
      en: "Sample of 42 runs, one runner, one route. First 10 and last 5 minutes excluded. This is an experimental observation, not a controlled study.",
      "zh-CN": "42 次跑步样本，同一跑者、同一路线，剔除前 10 分钟与最后 5 分钟。这是实验观察，并非对照研究。",
      ja: "同一ランナー・同一コースの42回のサンプル。最初の10分と最後の5分を除外。対照研究ではなく実験的観察です。",
    },
    status: "published",
    updatedAt: "2026-10-12",
  },
  {
    slug: "vietnam-runner-pace-distribution",
    title: {
      vi: "Phân bố pace của người chạy Việt Nam",
      en: "Pace distribution of Vietnamese runners",
      "zh-CN": "越南跑者的配速分布",
      ja: "ベトナム人ランナーのペース分布",
    },
    summary: {
      vi: "Dự án đang thu thập dữ liệu ẩn danh để mô tả phân bố pace 5K và 10K theo nhóm tuổi.",
      en: "An ongoing project collecting anonymised data to describe 5K and 10K pace by age group.",
      "zh-CN": "正在收集匿名数据，以描述不同年龄组的 5K 与 10K 配速分布。",
      ja: "年齢層別の5K・10Kペース分布を記述するため、匿名データを収集中です。",
    },
    description: {
      vi: "Mục tiêu là tạo một bức tranh thực tế, không phải bảng xếp hạng. Dữ liệu sẽ được công bố dưới dạng tổng hợp, không có thông tin cá nhân. Người tham gia có thể rút dữ liệu bất cứ lúc nào.",
      en: "The aim is a realistic picture, not a leaderboard. Data will be published in aggregate with no personal information. Participants can withdraw their data at any time.",
      "zh-CN": "目标是呈现真实图景，而非排行榜。数据将以汇总形式发布，不含个人信息。参与者可随时撤回数据。",
      ja: "目的はランキングではなく実態の把握です。データは個人情報を含まない集計として公開されます。参加者はいつでも撤回できます。",
    },
    methodology: {
      vi: "Thu thập tự nguyện qua biểu mẫu, chuẩn hóa theo tuổi, giới tính và cự ly. Loại bỏ kết quả không hợp lý. Chưa có đủ mẫu để kết luận.",
      en: "Voluntary collection via a form, normalised by age, sex and distance. Implausible results excluded. Not yet enough data for conclusions.",
      "zh-CN": "通过表单自愿收集，按年龄、性别与距离标准化，剔除不合理结果。目前样本不足以下结论。",
      ja: "フォームによる任意収集。年齢・性別・距離で標準化し、不自然な結果は除外。結論を出すにはまだサンプル不足です。",
    },
    status: "active",
    updatedAt: "2026-10-20",
  },
  {
    slug: "riegel-accuracy-10k-half",
    title: {
      vi: "Độ chính xác của Riegel từ 10K đến bán marathon",
      en: "Riegel accuracy from 10K to half marathon",
      "zh-CN": "Riegel 公式从 10K 到半马的准确性",
      ja: "10Kからハーフマラソンにおけるリーゲル式の精度",
    },
    summary: {
      vi: "So sánh dự đoán Riegel với thành tích thực tế trên một nhóm nhỏ người chạy địa phương.",
      en: "Comparing Riegel predictions with actual results in a small group of local runners.",
      "zh-CN": "在本地小型跑者群体中比较 Riegel 预测与实际成绩。",
      ja: "地元の小規模グループでリーゲル式の予測と実際の結果を比較します。",
    },
    description: {
      vi: "Riegel sử dụng số mũ 1,06, giả định khả năng chịu đựng giảm dần theo cự ly. Với người mới tăng cự ly nhanh, sai số có thể lớn. Chúng tôi đang ghi lại dự đoán trước đua và kết quả thực tế.",
      en: "Riegel uses an exponent of 1.06, assuming endurance decays with distance. For beginners increasing distance quickly, error can be large. We are recording pre-race predictions and actual results.",
      "zh-CN": "Riegel 使用 1.06 指数，假设耐力随距离衰减。对快速增加距离的新手，误差可能较大。我们正在记录赛前预测与实际成绩。",
      ja: "リーゲル式は指数1.06を用い、距離とともに持久力が低下すると仮定します。距離を急に伸ばす初心者では誤差が大きくなります。レース前の予測と実際の結果を記録中です。",
    },
    methodology: {
      vi: "Dự đoán được tạo ít nhất 7 ngày trước đua từ thành tích 10K gần nhất. Chỉ sử dụng các giải có kết quả chính thức. Mẫu hiện tại: 9 người.",
      en: "Predictions made at least 7 days before the race from the most recent 10K. Only races with official results included. Current sample: 9 runners.",
      "zh-CN": "根据最近 10K 成绩在赛前至少 7 天生成预测，仅纳入有官方成绩的赛事。当前样本：9 人。",
      ja: "直近の10K記録からレース7日以上前に予測。公式結果のあるレースのみ対象。現在のサンプルは9人です。",
    },
    status: "active",
    updatedAt: "2026-10-26",
  },
  {
    slug: "hue-safe-running-heatmap",
    title: {
      vi: "Bản đồ nhiệt giờ chạy an toàn tại Huế",
      en: "A heat map of safe running hours in Hue",
      "zh-CN": "顺化安全跑步时段热力图",
      ja: "フエの安全なランニング時間帯ヒートマップ",
    },
    summary: {
      vi: "Dự án dự kiến kết hợp dữ liệu thời tiết, giao thông và chất lượng không khí để gợi ý giờ chạy.",
      en: "A planned project combining weather, traffic and air-quality data to suggest running hours.",
      "zh-CN": "计划结合天气、交通与空气质量数据，给出跑步时段建议。",
      ja: "天気、交通、大気質データを組み合わせて走る時間帯を提案する予定のプロジェクトです。",
    },
    description: {
      vi: "Chúng tôi muốn tránh đưa ra khuyến nghị dựa trên cảm tính. Dự án sẽ công bố nguồn dữ liệu, thời gian cập nhật và giới hạn rõ ràng. Chưa có ngày công bố.",
      en: "We want to avoid recommendations based on intuition. The project will publish data sources, update times and clear limitations. No release date yet.",
      "zh-CN": "我们希望避免凭感觉给出建议。项目将公布数据来源、更新时间与明确局限。暂无发布日期。",
      ja: "感覚に基づく提案を避けたいと考えています。データソース、更新時刻、明確な限界を公開します。公開日は未定です。",
    },
    methodology: {
      vi: "Đang xem xét các nguồn dữ liệu công khai. Chưa triển khai thu thập dữ liệu.",
      en: "Reviewing public data sources. Data collection has not started.",
      "zh-CN": "正在评估公开数据源，尚未开始数据收集。",
      ja: "公開データソースを検討中。データ収集は未開始です。",
    },
    status: "planned",
    updatedAt: "2026-10-01",
  },
];

export function getLabProject(slug: string) {
  return labProjects.find((project) => project.slug === slug);
}
