import type { GearReview } from "./types";

export const gearReviews: GearReview[] = [
  {
    slug: "chon-giay-chay-dau-tien",
    category: "shoes",
    title: {
      vi: "Chọn giày chạy đầu tiên: 5 tiêu chí thực dụng",
      en: "Choosing your first running shoes: five practical criteria",
      "zh-CN": "选择第一双跑鞋：五个实用标准",
      ja: "初めてのランニングシューズ：5つの実用基準",
    },
    excerpt: {
      vi: "Không cần giày đắt nhất. Cần giày vừa chân, phù hợp mục tiêu và không gây chấn thương.",
      en: "You do not need the most expensive shoe. You need one that fits, suits your goal and does not cause injury.",
      "zh-CN": "不需要最贵的鞋，只需要合脚、符合目标且不导致受伤的鞋。",
      ja: "最も高価な靴は必要ありません。足に合い、目的に適し、故障を招かない靴が必要です。",
    },
    verdict: {
      vi: "Hãy thử giày vào buổi chiều khi chân hơi sàn, chừa khoảng một ngón tay ở mũi giày, và ưu tiên cảm giác thoải mái ngay từ lần đầu.",
      en: "Try shoes in the late afternoon when feet are slightly swollen, leave about a thumb's width at the toe, and prioritise comfort from the first step.",
      "zh-CN": "傍晚脚部略微肿胀时试鞋，鞋头留约一指宽，并优先选择第一次穿上就舒适的感觉。",
      ja: "夕方に足が少しむくんだ状態で試し、つま先に指約1本分の余裕を残し、最初から快適なものを選びます。",
    },
    pros: {
      vi: ["Đệm đủ cho cự ly mục tiêu", "Mũi giày rộng vừa bàn chân", "Gót ổn định, không trượt"],
      en: ["Enough cushioning for your target distance", "Toe box wide enough for your foot", "Stable heel without slipping"],
      "zh-CN": ["缓震适合目标距离", "鞋头宽度合适", "后跟稳定不滑动"],
      ja: ["目標距離に合ったクッション", "足に合ったつま先の広さ", "かかとが安定して滑らない"],
    },
    cons: {
      vi: ["Không nên mua theo màu hoặc khuyến mãi", "Tránh đổi sang giày tối giản quá nhanh"],
      en: ["Do not buy by colour or discount alone", "Avoid switching to minimal shoes too quickly"],
      "zh-CN": ["不要只凭颜色或折扣购买", "不要过快换到极简鞋"],
      ja: ["色やセールだけで選ばない", "ミニマルシューズへ急に移行しない"],
    },
    specs: [
      { label: "Độ dốc gót", value: "6–10 mm (người mới)" },
      { label: "Kích cỡ", value: "Chừa 0,5–1 cm ở mũi" },
      { label: "Thời điểm thử", value: "Chiều hoặc sau khi vận động" },
      { label: "Tuổi thọ tham khảo", value: "500–800 km tùy giày và người chạy" },
    ],
    body: {
      vi: `## 1. Vừa chân trước, thông số sau

Đừng bắt đầu bằng bảng thông số. Hãy thử nhiều đôi, đi bộ và chạy thử vài bước. Mũi giày cần đủ rộng để các ngón không bị ép; gót cần ôm chắc nhưng không siết.

## 2. Đệm phù hợp mục tiêu

Nếu bạn chạy 5K–10K vài lần mỗi tuần, giày đệm trung bình thường đủ. Nếu mục tiêu là marathon hoặc bạn chạy nhiều trên đường cứng, đệm dày hơn có thể giúp giảm mệt mỏi. Không có bằng chứng mạnh rằng đệm dày ngăn được mọi chấn thương.

## 3. Đừng chọn theo "kiểu chân" một cách máy móc

Việc phân loại pronation để chọn giày đã được đơn giản hóa quá mức trong nhiều năm. Cảm giác thoải mái và khả năng chịu tải tổng thể quan trọng hơn nhãn "ổn định" hay "trung tính".

## 4. Thay giày khi cần, không theo lịch cứng

Đế mòn không đều, đệm xẹp hoặc xuất hiện đau mới có thể là dấu hiệu nên thay. 500–800 km là khoảng tham khảo, không phải quy tắc tuyệt đối.

## 5. Mua ở nơi cho phép đổi trả

Hãy chạy thử trong nhà vài ngày nếu cửa hàng cho phép đổi trả. Một đôi giày đẹp nhưng gây đau không phải là món hời.`,
      en: `## 1. Fit first, specs second

Do not start with a spec sheet. Try several pairs, walk and jog a few steps. The toe box must be wide enough that toes are not compressed; the heel should hold firmly without pinching.

## 2. Cushioning for your goal

If you run 5K–10K a few times a week, a medium-cushioned shoe is usually enough. For a marathon or lots of hard-surface running, more cushioning may reduce fatigue. Evidence that thick cushioning prevents all injuries is not strong.

## 3. Do not pick mechanically by "foot type"

Pronation-based shoe classification has been oversimplified for years. Comfort and overall load tolerance matter more than a "stability" or "neutral" label.

## 4. Replace when needed, not by a rigid calendar

Uneven outsole wear, compressed cushioning or a new pain can signal it is time. 500–800 km is a reference, not an absolute rule.

## 5. Buy where returns are possible

Run indoors for a few days if the shop allows returns. A beautiful shoe that causes pain is not a bargain.`,
      "zh-CN": `## 1. 合脚优先，参数其次

不要从参数表开始。多试几双，走一走、跑几步。鞋头要足够宽，脚趾不被挤压；后跟要稳固但不夹脚。

## 2. 缓震匹配目标

每周跑几次 5K–10K，中等缓震通常足够。若目标为马拉松或大量硬地训练，更厚的缓震可能减轻疲劳。但厚缓震能预防所有伤病的证据并不充分。

## 3. 不要机械按"足型"选鞋

以足内翻类型选鞋多年来被过度简化。舒适度与整体负荷承受能力，比"稳定"或"中性"标签更重要。

## 4. 按需要更换，而非死守日历

外底磨损不均、缓震塌陷或出现新的疼痛，可能是更换信号。500–800 公里是参考值，不是绝对规则。

## 5. 在可退换的地方购买

若商家允许退换，先在家试跑几天。一双好看却导致疼痛的鞋不是便宜。`,
      ja: `## 1. まずフィット、次にスペック

スペック表から始めないでください。複数試し、歩き、数歩走ります。つま先は圧迫されない広さが必要で、かかとはきつく締めずしっかり固定します。

## 2. 目的に合ったクッション

週数回5K〜10Kなら中等度のクッションで通常十分です。マラソンや硬い路面での走行が多い場合は、厚めのクッションが疲労を軽減する可能性があります。厚いクッションがすべての故障を防ぐという強い証拠はありません。

## 3. 「足型」だけで機械的に選ばない

回内型による靴選びは長年単純化されすぎてきました。快適さと全体的な負荷耐性は、「安定型」「ニュートラル」といったラベルより重要です。

## 4. 暦ではなく必要に応じて交換

アウトソールの偏った摩耗、クッションの沈み、新たな痛みは交換のサインです。500〜800kmは目安であり絶対規則ではありません。

## 5. 返品可能な店で買う

返品可能なら数日間室内で試し履きを。見た目が良くても痛みを生む靴はお買い得ではありません。`,
    },
    publishedAt: "2026-09-20",
    readingMinutes: 6,
  },
  {
    slug: "dong-ho-chay-bo-can-gi",
    category: "watches",
    title: {
      vi: "Đồng hồ chạy bộ: bạn thực sự cần gì?",
      en: "Running watches: what do you actually need?",
      "zh-CN": "跑步手表：你真正需要什么？",
      ja: "ランニングウォッチ：本当に必要な機能は？",
    },
    excerpt: {
      vi: "GPS, nhịp tim quang học, pin và khả năng chống nước — bốn yếu tố quan trọng hơn số lượng tính năng.",
      en: "GPS, optical heart rate, battery and water resistance — four factors that matter more than feature count.",
      "zh-CN": "GPS、光学心率、续航与防水——这四点比功能数量更重要。",
      ja: "GPS、光学心拍、バッテリー、防水——機能数より重要な4点です。",
    },
    verdict: {
      vi: "Một chiếc đồng hồ tầm trung với GPS ổn định và pin đủ cho long run sẽ hữu ích hơn một mẫu cao cấp có nhiều tính năng bạn không dùng.",
      en: "A mid-range watch with reliable GPS and enough battery for your long run is more useful than a premium model full of features you never use.",
      "zh-CN": "一块 GPS 稳定、续航够长距离的中端手表，比功能繁多却用不上的高端款更有用。",
      ja: "安定したGPSとロング走に足りるバッテリーを持つミドルレンジの時計は、使わない機能だらけの高級モデルより有用です。",
    },
    pros: {
      vi: ["GPS ổn định ở khu vực ít nhà cao tầng", "Pin đủ 8–12 giờ hoạt động", "Đọc được dưới nắng"],
      en: ["Reliable GPS away from dense high-rises", "8–12 hours of activity battery", "Readable in sunlight"],
      "zh-CN": ["非高楼密集区 GPS 稳定", "8–12 小时运动续航", "阳光下可读"],
      ja: ["高層ビルの少ない場所で安定したGPS", "8〜12時間の活動バッテリー", "日光下でも見やすい"],
    },
    cons: {
      vi: ["Nhịp tim quang học có thể sai khi trời lạnh", "Tính năng thông minh thường không cần thiết"],
      en: ["Optical heart rate can drift in the cold", "Smart features are often unnecessary"],
      "zh-CN": ["寒冷时光学心率可能漂移", "智能功能通常并非必要"],
      ja: ["寒いと光学心拍がずれることがある", "スマート機能は不要なことが多い"],
    },
    specs: [
      { label: "GPS", value: "Đa hệ (GPS + GLONASS/Galileo)" },
      { label: "Pin", value: "Tối thiểu 8 giờ ở chế độ GPS" },
      { label: "Chống nước", value: "5 ATM trở lên" },
      { label: "Cảm biến", value: "Nhịp tim quang học, barometer (nếu chạy đồi)" },
    ],
    body: {
      vi: `## GPS

Độ chính xác GPS phụ thuộc môi trường nhiều hơn giá tiền. Ở khu vực nhiều nhà cao tầng hoặc tán cây dày, mọi đồng hồ đều có thể sai. Hãy xem xét khả năng bắt sóng nhanh và ghi track ổn định trong khu vực bạn thường chạy.

## Nhịp tim quang học

Tiện cho việc theo dõi xu hướng, nhưng không chính xác như đai ngực, đặc biệt khi trời lạnh, khi đeo lỏng hoặc khi cổ tay nhiều lông. Nếu bạn dùng vùng nhịp tim để điều chỉnh cường độ, đai ngực là khoản đầu tư hợp lý.

## Pin và chống nước

Pin GPS 8 giờ đủ cho hầu hết người chạy. Nếu chạy trail dài hoặc marathon chậm, hãy chọn 12 giờ trở lên. Chống nước 5 ATM đủ cho mưa và rửa tay; bơi lội cần tiêu chuẩn cao hơn.

## Tính năng nên bỏ qua

Âm nhạc offline, thanh toán, ứng dụng bên thứ ba và màn hình AMOLED đẹp có thể hữu ích nhưng không cải thiện việc tập luyện. Đừng trả thêm cho tính năng bạn sẽ không dùng.

## Kết luận

Hãy chọn theo ba câu hỏi: pin có đủ cho buổi dài nhất không, GPS có ổn ở nơi bạn chạy không, và bạn có đeo thoải mái cả ngày không?`,
      en: `## GPS

GPS accuracy depends more on environment than price. Among high-rises or dense tree cover, every watch can drift. Consider how quickly it locks on and how stable the track is in the areas you actually run.

## Optical heart rate

Convenient for trends, but less accurate than a chest strap, especially in the cold, when worn loosely or on a hairy wrist. If you use heart-rate zones to control intensity, a chest strap is a sensible investment.

## Battery and water resistance

Eight hours of GPS is enough for most runners. For long trail runs or a slow marathon, choose 12 hours or more. 5 ATM handles rain and handwashing; swimming needs a higher standard.

## Features to skip

Offline music, payments, third-party apps and a beautiful AMOLED screen can be nice but do not improve training. Do not pay extra for features you will not use.

## Conclusion

Choose by three questions: does the battery cover your longest run, is GPS stable where you run, and can you wear it comfortably all day?`,
      "zh-CN": `## GPS

GPS 精度更多取决于环境而非价格。在高楼或茂密树荫下，任何手表都可能漂移。关注在你常跑区域内的搜星速度与轨迹稳定性。

## 光学心率

便于观察趋势，但不如胸带准确，尤其在寒冷、佩戴松散或手腕毛发较多时。若用心率区间控制强度，胸带是合理投资。

## 续航与防水

8 小时 GPS 续航对多数跑者足够。长距离越野或慢速马拉松请选 12 小时以上。5 ATM 可应对雨水与洗手，游泳需要更高标准。

## 可以跳过的功能

离线音乐、支付、第三方应用和漂亮 AMOLED 屏可能不错，但不会改善训练。不要为用不到的功能多付钱。

## 结论

用三个问题选择：续航能否覆盖你最长的一次跑步？GPS 在你常跑的地方是否稳定？能否全天舒适佩戴？`,
      ja: `## GPS

GPSの精度は価格よりも環境に左右されます。高層ビルや密集した樹冠の下では、どの時計もずれる可能性があります。実際に走るエリアで、測位の速さと軌跡の安定性を確認しましょう。

## 光学心拍

傾向を見るには便利ですが、胸ベルトより不正確で、寒冷時、ゆるい装着時、腕毛が多い場合に特にずれます。心拍ゾーンで強度を管理するなら、胸ベルトは合理的な投資です。

## バッテリーと防水

GPSで8時間あれば多くのランナーに十分です。長いトレイルや遅いマラソンなら12時間以上を選びます。5 ATMは雨や手洗いに十分で、水泳にはより高い規格が必要です。

## 不要な機能

オフライン音楽、決済、サードパーティアプリ、美しいAMOLED画面は便利でもトレーニングを改善しません。使わない機能に追加料金を払わないでください。

## 結論

3つの質問で選びます。バッテリーは最長のランをカバーするか、走る場所でGPSは安定するか、一日中快適に着けられるか。`,
    },
    publishedAt: "2026-10-05",
    readingMinutes: 5,
  },
  {
    slug: "nuoc-va-dai-dung-nuoc",
    category: "hydration",
    title: {
      vi: "Bình nước và đai đựng nước: chọn theo cự ly",
      en: "Bottles and hydration belts: choose by distance",
      "zh-CN": "水壶与补水腰带：按距离选择",
      ja: "ボトルとハイドレーションベルト：距離で選ぶ",
    },
    excerpt: {
      vi: "Không cần mang theo nhiều nước hơn mức cơ thể cần. Cách chọn dung tích và kiểu đeo phù hợp.",
      en: "You do not need to carry more water than your body needs. How to choose capacity and carrying style.",
      "zh-CN": "不必携带超过身体需要的水。如何选择容量与佩戴方式。",
      ja: "身体が必要とする以上の水を運ぶ必要はありません。容量と携行方法の選び方。",
    },
    verdict: {
      vi: "Dưới 60 phút, thường không cần mang nước. Từ 90 phút trở lên, bình 500 ml hoặc đai 2 bình nhỏ là đủ cho hầu hết buổi chạy ở Huế.",
      en: "Under 60 minutes, you usually need no water. From 90 minutes, a 500 ml bottle or a two-flask belt is enough for most runs in Hue.",
      "zh-CN": "60 分钟以内通常无需带水。90 分钟以上，500 毫升水壶或双软瓶腰带对顺化多数跑步足够。",
      ja: "60分未満なら通常水は不要。90分以上なら500mlボトルか2本のフラスク付きベルトで、フエのほとんどのランに対応できます。",
    },
    pros: {
      vi: ["Đai 2 bình nhỏ cân bằng hơn bình lớn", "Bình mềm dễ uống khi đang chạy", "Có thể bổ sung điện giải"],
      en: ["A two-flask belt balances better than one large bottle", "Soft flasks are easy to drink from while running", "Allows electrolyte addition"],
      "zh-CN": ["双软瓶腰带比单大瓶更平衡", "软水壶跑步时易饮用", "可添加电解质"],
      ja: ["2本のフラスクのベルトは大きな1本よりバランスが良い", "ソフトフラスクは走りながら飲みやすい", "電解質を追加できる"],
    },
    cons: {
      vi: ["Đai rung nếu không siết đúng", "Bình cứng có thể gây khó chịu ở hông"],
      en: ["Belts bounce if not adjusted correctly", "Hard bottles can be uncomfortable at the hip"],
      "zh-CN": ["腰带调节不当会晃动", "硬水壶可能在髋部不适"],
      ja: ["調整が悪いとベルトが跳ねる", "硬いボトルは腰に不快感を与えることがある"],
    },
    specs: [
      { label: "Dưới 60 phút", value: "Không cần nước" },
      { label: "60–90 phút", value: "250–500 ml" },
      { label: "90–150 phút", value: "500–750 ml + điện giải" },
      { label: "Trên 2 giờ", value: "Tính theo tốc độ mồ hôi và điểm tiếp nước" },
    ],
    body: {
      vi: `## Nhu cầu nước thay đổi rất lớn

Cùng một người có thể mất 0,8 lít mồ hôi mỗi giờ trong buổi sáng mát và hơn 1,5 lít trong buổi chiều oi bức. Cân trước và sau một buổi long run là cách đơn giản nhất để ước tính nhu cầu cá nhân.

## Chọn dung tích

- **Dưới 60 phút:** nước thường không cần thiết; uống trước khi chạy là đủ.
- **60–90 phút:** 250–500 ml.
- **90–150 phút:** 500–750 ml, có thể thêm điện giải nếu đổ mồ hôi nhiều.
- **Trên 2 giờ:** lên kế hoạch theo điểm tiếp nước thay vì mang quá nặng.

## Kiểu đeo

Đai 2 bình nhỏ phân bố trọng lượng tốt hơn một bình lớn. Bình mềm dễ uống hơn nhưng khó vệ sinh hơn. Áo có túi sau lưng phù hợp cho cự ly ngắn và người không thích đai.

## Vệ sinh

Rửa bình và van sau mỗi buổi chạy, để khô hoàn toàn. Nếu dùng đồ uống có đường, ngâm nước ấm với một chút baking soda định kỳ.

## Lưu ý

Không uống quá nhiều nước không có điện giải trong thời gian dài. Nếu bạn có vấn đề về thận hoặc tim, hãy hỏi bác sĩ về lượng nước phù hợp.`,
      en: `## Fluid needs vary enormously

The same person can lose 0.8 litres of sweat per hour on a cool morning and more than 1.5 litres on a humid afternoon. Weighing before and after a long run is the simplest way to estimate personal needs.

## Choose capacity

- **Under 60 minutes:** water is usually unnecessary; drinking beforehand is enough.
- **60–90 minutes:** 250–500 ml.
- **90–150 minutes:** 500–750 ml, with electrolytes if you sweat heavily.
- **Over 2 hours:** plan around refill points rather than carrying too much weight.

## Carrying style

A two-flask belt distributes weight better than one large bottle. Soft flasks are easier to drink from but harder to clean. A vest with rear pockets suits shorter distances and runners who dislike belts.

## Cleaning

Rinse bottles and valves after every run and dry completely. If you use sugary drinks, occasionally soak in warm water with a little baking soda.

## Note

Do not drink large volumes of plain water over long periods. If you have kidney or heart conditions, ask a doctor about appropriate fluid intake.`,
      "zh-CN": `## 水分需求差异很大

同一个人凉爽早晨每小时可能出汗 0.8 升，潮湿下午则超过 1.5 升。长距离跑前后称体重，是估算个人需求最简单的方法。

## 选择容量

- **60 分钟以内：** 通常无需带水，跑前饮水即可。
- **60–90 分钟：** 250–500 毫升。
- **90–150 分钟：** 500–750 毫升，出汗多可加电解质。
- **超过 2 小时：** 按补给点规划，而非携带过多重量。

## 佩戴方式

双软瓶腰带比单一大瓶更均衡。软水壶易饮用但较难清洗。带后袋的背心适合短距离及不喜欢腰带的人。

## 清洁

每次跑后冲洗水壶与阀门并完全晾干。若装含糖饮料，可定期用温水加少量小苏打浸泡。

## 注意

不要长时间大量饮用不含电解质的白水。若有肾脏或心脏问题，请咨询医生合适的饮水量。`,
      ja: `## 水分需要は大きく異なる

同じ人でも涼しい朝は1時間に0.8L、蒸し暑い午後は1.5L以上汗をかくことがあります。ロング走の前後で体重を測ることが、個人の必要量を推定する最も簡単な方法です。

## 容量の選び方

- **60分未満：** 通常水は不要。走前に飲めば十分。
- **60〜90分：** 250〜500ml。
- **90〜150分：** 500〜750ml。汗が多いなら電解質も。
- **2時間以上：** 重すぎる携行より給水ポイントで計画。

## 携行方法

2本のフラスク付きベルトは大きな1本より重量配分が良いです。ソフトフラスクは飲みやすい一方で洗いにくい。後ろポケット付きベストは短距離やベルトが苦手な人に向きます。

## 清掃

走後はボトルとバルブを洗い、完全に乾燥させます。糖分入り飲料を使う場合は、ぬるま湯に重曹を少し溶かして時々浸けます。

## 注意

電解質なしの水を長時間大量に飲まないでください。腎臓や心臓に問題がある場合は、適切な水分量を医師に相談してください。`,
    },
    publishedAt: "2026-10-22",
    readingMinutes: 5,
  },
];

export function getGearReview(slug: string) {
  return gearReviews.find((review) => review.slug === slug);
}
