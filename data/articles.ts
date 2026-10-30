import type { Article } from "./types";

export const articles: Article[] = [
  {
    slug: "8-tuan-dau-tien-chay-5k",
    category: "beginner",
    tags: ["5K", "người mới", "giáo án"],
    publishedAt: "2026-09-12",
    updatedAt: "2026-10-02",
    featured: true,
    readingMinutes: 7,
    author: "Mythos Editorial",
    title: {
      vi: "8 tuần đầu tiên: từ đi bộ đến 5K",
      en: "Your first 8 weeks: from walking to 5K",
      "zh-CN": "最初的 8 周：从走到跑完 5K",
      ja: "最初の8週間：ウォーキングから5Kへ",
    },
    excerpt: {
      vi: "Một khung 8 tuần dành cho người chưa từng chạy, tập trung vào tính kiên trì, khối lượng vừa phải và phòng tránh chấn thương.",
      en: "An eight-week framework for first-time runners, built around consistency, modest volume and injury prevention.",
      "zh-CN": "为初跑者设计的八周框架，重点是坚持、适量跑量与预防受伤。",
      ja: "未経験者向けの8週間フレームワーク。継続、適度な走行量、故障予防を重視します。",
    },
    body: {
      vi: `## Vì sao là 8 tuần?

Cơ thể cần thời gian để thích nghi với tải trọng lặp lại của việc chạy. Gân, dây chằng và xương thích nghi chậm hơn cơ bắp, nên cảm giác "khỏe" trong hai tuần đầu không có nghĩa là bạn đã sẵn sàng tăng tốc. Khung 8 tuần dưới đây ưu tiên sự đều đặn hơn là tốc độ.

## Ba nguyên tắc

1. **Đi bộ là một phần của buổi chạy.** Xen kẽ chạy và đi bộ không phải là thất bại; đó là cách chuẩn bị hệ vận động.
2. **Tăng khối lượng từ từ.** Giữ tổng thời gian vận động tăng khoảng 10% mỗi tuần và giảm tải ở tuần thứ tư.
3. **Đau nhức cơ sau buổi tập là bình thường; đau nhói ở xương, gân hoặc khớp thì không.** Dừng lại và tìm tư vấn y tế nếu cơn đau tăng dần.

## Tuần 1–4: xây nền

- Ba buổi mỗi tuần, cách ngày.
- Mỗi buổi 20–30 phút: chạy 1 phút, đi bộ 2 phút, lặp lại.
- Hai ngày còn lại có thể đi bộ nhẹ hoặc nghỉ hoàn toàn.
- Cuối tuần thứ tư, giảm một buổi để cơ thể hấp thụ tải.

Đừng cố đạt một quãng đường cụ thể. Mục tiêu của giai đoạn này là làm quen với nhịp thở, tư thế và cảm giác chân tiếp đất.

## Tuần 5–8: tăng thời gian chạy

- Chuyển dần sang chạy 3 phút, đi bộ 1 phút.
- Đến tuần 7, thử chạy liên tục 15–20 phút ở tốc độ có thể nói chuyện.
- Tuần 8: một buổi chạy liên tục 25–30 phút, không quan tâm pace.
- Nếu hoàn thành 5K trong khoảng 35–45 phút, bạn đã đạt mục tiêu của khung này.

## Cách chọn giày và địa điểm

Chọn giày vừa chân, còn đệm và không gây trượt gót. Đường bằng phẳng, ít xe, có thể đi bộ dự phòng là lựa chọn tốt. Buổi tối nên mặc trang phục sáng màu hoặc có phản quang.

## Khi nào nên dừng

- Đau ở mặt trước xương chày kéo dài hơn vài ngày.
- Đau gót hoặc lòng bàn chân khi thức dậy.
- Chóng mặt, đau ngực hoặc khó thở bất thường.

Những dấu hiệu này cần được đánh giá bởi chuyên gia, không phải bằng cách "chạy cho quen".

## Điều quan trọng nhất

Bạn không cần trở thành vận động viên trong 8 tuần. Bạn chỉ cần xây một thói quen đủ bền để tiếp tục ở tuần thứ chín.`,
      en: `## Why eight weeks?

Your body needs time to adapt to the repetitive load of running. Tendons, ligaments and bone adapt more slowly than muscle, so feeling "fit" after two weeks does not mean you are ready to push the pace. This eight-week framework prioritises consistency over speed.

## Three principles

1. **Walking is part of the session.** Run-walk intervals are not a failure; they are how you prepare the musculoskeletal system.
2. **Increase gradually.** Grow total active time by roughly 10% per week and take a lighter fourth week.
3. **Muscle soreness after training is normal; sharp bone, tendon or joint pain is not.** Stop and seek medical advice if pain keeps worsening.

## Weeks 1–4: build the base

- Three sessions per week, on alternate days.
- 20–30 minutes each: run 1 minute, walk 2 minutes, repeat.
- On other days, walk gently or rest completely.
- At the end of week four, drop one session so the body can absorb the load.

Do not chase a specific distance. The goal of this phase is to become familiar with breathing, posture and the feeling of foot contact.

## Weeks 5–8: extend the running

- Progress towards 3 minutes running, 1 minute walking.
- By week seven, try 15–20 minutes continuous at a conversational effort.
- Week eight: one continuous 25–30 minute run, ignoring pace.
- If you complete 5K in roughly 35–45 minutes, you have met the goal of this framework.

## Shoes and location

Choose shoes that fit, still have cushioning and do not slip at the heel. A flat, low-traffic route with a walking shortcut is a good choice. In the evening, wear bright or reflective clothing.

## When to stop

- Shin pain that lasts more than a few days.
- Heel or sole pain on waking.
- Dizziness, chest pain or unusual breathlessness.

These signs deserve professional assessment, not a "run it off" approach.

## The most important part

You do not need to become an athlete in eight weeks. You only need to build a habit durable enough to continue in week nine.`,
      "zh-CN": `## 为什么是八周？

身体需要时间适应跑步的重复负荷。肌腱、韧带和骨骼的适应速度慢于肌肉，因此前两周感觉"状态不错"并不代表可以加速。这个八周框架把规律性放在速度之前。

## 三个原则

1. **走路是训练的一部分。** 跑走交替不是失败，而是让运动系统逐步适应的方法。
2. **循序渐进。** 每周总活动时间增加约 10%，第四周减量。
3. **训练后的肌肉酸痛正常；骨骼、肌腱或关节的刺痛不正常。** 若疼痛持续加重，应停止并寻求医疗建议。

## 第 1–4 周：打基础

- 每周三次，隔天进行。
- 每次 20–30 分钟：跑 1 分钟，走 2 分钟，循环。
- 其余日子轻松步行或完全休息。
- 第四周末减少一次训练，让身体吸收负荷。

不要执着于距离。这一阶段的目标是熟悉呼吸、姿势与脚掌落地感。

## 第 5–8 周：延长跑步时间

- 逐步过渡到跑 3 分钟、走 1 分钟。
- 第七周尝试以可对话的强度连续跑 15–20 分钟。
- 第八周：一次连续 25–30 分钟，不看配速。
- 若能在 35–45 分钟内完成 5K，即达到本框架目标。

## 跑鞋与路线

选择合脚、仍有缓震、后跟不滑动的跑鞋。平坦、车少、可随时步行返回的路线最合适。夜间请穿亮色或反光服装。

## 何时应停止

- 胫骨前侧疼痛持续数天。
- 起床时脚跟或脚底疼痛。
- 头晕、胸痛或异常呼吸困难。

这些信号需要专业评估，而不是"跑一跑就习惯"。

## 最重要的事

你不需要在八周内成为运动员，只需要建立一个能支撑你走到第九周的习惯。`,
      ja: `## なぜ8週間なのか

身体がランニングの反復負荷に適応するには時間が必要です。腱・靭帯・骨は筋肉より適応が遅いため、2週間で「調子が良い」と感じてもペースを上げる準備ができたわけではありません。この8週間はスピードより継続を優先します。

## 3つの原則

1. **歩くことも練習の一部。** ラン＆ウォークは失敗ではなく、運動器系を準備する方法です。
2. **少しずつ増やす。** 総活動時間を週約10%増やし、4週目は減量します。
3. **筋肉痛は正常、骨・腱・関節の鋭い痛みは異常。** 痛みが悪化する場合は中止し、医療機関に相談してください。

## 1〜4週目：土台づくり

- 週3回、隔日で行う。
- 各20〜30分：1分走って2分歩くを繰り返す。
- 他の日は軽い散歩か完全休養。
- 4週目の終わりに1回減らし、負荷を吸収させる。

距離を追わないでください。この段階の目的は呼吸、姿勢、足の接地感に慣れることです。

## 5〜8週目：走る時間を延ばす

- 3分走って1分歩くへ段階的に移行。
- 7週目に会話できる強度で15〜20分連続走に挑戦。
- 8週目：ペースを気にせず25〜30分連続走。
- 35〜45分で5Kを完走できれば、このプログラムの目標達成です。

## シューズと場所

足に合い、クッションが残り、かかとが滑らないシューズを選びます。平坦で交通量が少なく、いつでも歩いて戻れるコースが適しています。夜間は明るい色や反射材を着用してください。

## 中止すべきサイン

- すねの前側の痛みが数日続く。
- 起床時のかかとや足裏の痛み。
- めまい、胸痛、異常な息切れ。

これらは「走って慣れる」ものではなく、専門家の評価が必要です。

## 最も大切なこと

8週間でアスリートになる必要はありません。9週目も続けられる習慣をつくることだけが目標です。`,
    },
    sources: [
      "American College of Sports Medicine — Guidelines for Exercise Testing and Prescription",
      "World Health Organization — Guidelines on physical activity and sedentary behaviour",
    ],
  },
  {
    slug: "easy-run-nguyen-tac-80-20",
    category: "training",
    tags: ["easy run", "80/20", "huấn luyện"],
    publishedAt: "2026-09-28",
    featured: true,
    readingMinutes: 8,
    author: "Mythos Editorial",
    title: {
      vi: "Easy run không hề dễ: nguyên tắc 80/20",
      en: "Easy running is not easy: the 80/20 principle",
      "zh-CN": "轻松跑并不轻松：80/20 原则",
      ja: "イージーランは簡単ではない：80/20の原則",
    },
    excerpt: {
      vi: "Phần lớn người chạy tập quá nhanh ở các buổi dễ và quá chậm ở các buổi khó. Nguyên tắc 80/20 sửa lại sự phân bổ đó.",
      en: "Most runners go too fast on easy days and too slow on hard days. The 80/20 principle corrects that distribution.",
      "zh-CN": "多数跑者轻松日跑得太快、强度日跑得太慢。80/20 原则用于纠正这种分配。",
      ja: "多くのランナーは楽な日に速すぎ、きつい日に遅すぎます。80/20の原則はその配分を修正します。",
    },
    body: {
      vi: `## Vấn đề của "chạy vừa vừa"

Nhiều người chạy ở vùng "hơi mệt" gần như mọi buổi. Cường độ này đủ nhanh để tạo mệt mỏi nhưng không đủ nhanh để kích thích thích nghi mạnh, và cũng không đủ chậm để phục hồi. Kết quả là tuần nào cũng mệt, nhưng tiến bộ chậm.

Nguyên tắc 80/20, được phổ biến qua nghiên cứu của Stephen Seiler trong các môn sức bền, cho rằng khoảng 80% tổng thời gian tập nên ở cường độ thấp và 20% ở cường độ cao. Tỉ lệ chính xác không phải điều thiêng liêng, nhưng sự phân cực rõ ràng mới là điểm cốt lõi.

## Easy run thực sự là gì?

Easy run là buổi chạy mà bạn có thể:

- Nói chuyện thành câu hoàn chỉnh.
- Thở bằng mũi nếu muốn.
- Kết thúc buổi tập với cảm giác "còn có thể chạy thêm 10 phút".

Với nhiều người, pace easy chậm hơn pace 5K từ 60 đến 90 giây mỗi km, thậm chí hơn. Không có con số chung cho mọi người. Nhiệt độ, độ ẩm và giấc ngủ đều thay đổi pace easy trong ngày.

## Cách áp dụng trong một tuần

Ví dụ với người chạy 5 buổi mỗi tuần:

- Thứ Ba: easy 40 phút.
- Thứ Tư: interval ngắn (20–25 phút tổng, gồm khởi động).
- Thứ Năm: easy 35 phút.
- Thứ Bảy: long run chậm.
- Chủ Nhật: easy 30 phút hoặc nghỉ.

Hai buổi chất lượng chiếm khoảng 20% thời gian. Phần còn lại là chạy nhẹ và phục hồi.

## Đừng biến easy thành tempo

Ba lỗi thường gặp:

1. **Đua với người khác trong buổi easy.** Hãy để buổi easy là của riêng bạn.
2. **Nhìn pace thay vì nhìn cảm giác.** Nếu trời nóng, pace chậm hơn vẫn có thể là đúng cường độ.
3. **Thêm "một chút nhanh" ở cuối.** Điều này làm hỏng mục đích của buổi dễ.

## Cảnh báo

80/20 là khung định hướng, không phải công thức tuyệt đối. Người mới nên có giai đoạn gần như 100% dễ trước khi thêm cường độ. Nếu bạn đang điều trị chấn thương hoặc có bệnh lý tim mạch, hãy tham khảo chuyên gia trước khi thay đổi giáo án.`,
      en: `## The problem with "somewhat hard"

Many runners spend nearly every session in the "somewhat hard" zone. That intensity is fast enough to create fatigue but not fast enough to drive strong adaptation, and not slow enough to recover. The result: every week feels tiring, yet progress is slow.

The 80/20 principle, popularised through Stephen Seiler's research in endurance sports, suggests that roughly 80% of training time should be low intensity and 20% high intensity. The exact ratio is not sacred; clear polarisation is the point.

## What easy running really means

An easy run is one where you can:

- Speak in complete sentences.
- Breathe through your nose if you choose.
- Finish feeling you could run another ten minutes.

For many runners, easy pace is 60–90 seconds per kilometre slower than 5K pace, sometimes more. There is no universal number. Heat, humidity and sleep all shift easy pace on a given day.

## Applying it to a week

For a runner training five days:

- Tuesday: 40 minutes easy.
- Wednesday: short intervals (20–25 minutes total including warm-up).
- Thursday: 35 minutes easy.
- Saturday: slow long run.
- Sunday: 30 minutes easy or rest.

The two quality sessions account for about 20% of time. Everything else is gentle running and recovery.

## Do not turn easy into tempo

Three common mistakes:

1. **Racing others on an easy day.** Let the easy day be yours.
2. **Watching pace instead of feel.** In the heat, a slower pace can still be the right intensity.
3. **Adding "a little fast" at the end.** This defeats the purpose of the session.

## Caveat

80/20 is a guiding framework, not an absolute formula. Beginners should spend a phase at nearly 100% easy before adding intensity. If you are managing an injury or a cardiovascular condition, consult a professional before changing your plan.`,
      "zh-CN": `## "中等偏累"的问题

许多跑者几乎每次训练都停留在"有点累"的区间。这个强度足以产生疲劳，却不足以带来明显适应，也不够慢以促进恢复。结果是每周都很累，进步却很慢。

80/20 原则由 Stephen Seiler 在耐力运动研究中推广：约 80% 的训练时间应为低强度，20% 为高强度。具体比例并非神圣，关键是清晰的极化分布。

## 轻松跑到底是什么

轻松跑时你可以：

- 用完整句子交谈。
- 如果愿意，可以用鼻子呼吸。
- 结束时感觉还能再跑十分钟。

对许多人来说，轻松配速比 5K 配速每公里慢 60–90 秒，甚至更多。没有统一数字。高温、湿度与睡眠都会改变当天的轻松配速。

## 如何安排一周

以每周训练五次的跑者为例：

- 周二：轻松跑 40 分钟。
- 周三：短间歇（含热身共 20–25 分钟）。
- 周四：轻松跑 35 分钟。
- 周六：慢速长距离。
- 周日：轻松跑 30 分钟或休息。

两次质量课约占 20% 的时间，其余都是轻松跑与恢复。

## 不要把轻松跑变成节奏跑

三个常见错误：

1. **在轻松日与他人竞速。** 让轻松日属于你自己。
2. **只看配速不看感觉。** 天气炎热时，更慢的配速仍可能是正确强度。
3. **最后加"一点点快"。** 这会破坏轻松课的目的。

## 提醒

80/20 是指导框架，不是绝对公式。新手应先经历几乎 100% 轻松跑的阶段，再加入强度。如正在处理伤病或心血管疾病，改变计划前请咨询专业人士。`,
      ja: `## 「ややきつい」の問題

多くのランナーはほぼ毎回の練習を「ややきつい」ゾーンで行います。この強度は疲労を生むには十分ですが、強い適応を促すには速すぎず、回復するには遅すぎません。結果として毎週疲れているのに進歩が遅くなります。

80/20の原則は、Stephen Seiler の持久力研究で広まった考え方で、トレーニング時間の約80%を低強度、20%を高強度に置くものです。正確な比率は絶対ではなく、明確な二極化が本質です。

## イージーランとは

イージーランでは：

- 文章で会話できる。
- 必要なら鼻呼吸もできる。
- 終わった後「あと10分走れる」と感じる。

多くの人にとって、イージーペースは5Kペースより1kmあたり60〜90秒遅く、それ以上の場合もあります。普遍的な数値はありません。気温、湿度、睡眠でその日のペースは変わります。

## 1週間への応用

週5回走る場合：

- 火曜：イージー40分。
- 水曜：短いインターバル（ウォームアップ込み20〜25分）。
- 木曜：イージー35分。
- 土曜：ゆっくりロング走。
- 日曜：イージー30分または休養。

質の高い2回が全体の約20%を占め、残りは軽いランニングと回復です。

## イージーをテンポにしない

よくある3つの誤り：

1. **イージー日に他人と競う。** その日は自分のために。
2. **感覚ではなくペースを見る。** 暑い日は遅いペースでも適切な強度のことがあります。
3. **最後に「少しだけ速く」。** これではイージーの意味が失われます。

## 注意

80/20は指針であり絶対的な公式ではありません。初心者は強度を加える前に、ほぼ100%イージーの期間を設けるべきです。怪我や心血管疾患がある場合は、計画変更前に専門家へ相談してください。`,
    },
    sources: [
      "Seiler S. — What is best practice for training intensity and duration distribution in endurance athletes?",
      "American College of Sports Medicine — ACSM's Guidelines for Exercise Testing and Prescription",
    ],
  },
  {
    slug: "vung-nhip-tim-hieu-dung",
    category: "physiology",
    tags: ["nhịp tim", "vùng tập", "sinh lý"],
    publishedAt: "2026-10-08",
    readingMinutes: 7,
    author: "Mythos Editorial",
    title: {
      vi: "Vùng nhịp tim: hiểu đúng để tập đúng",
      en: "Heart-rate zones: understanding before using",
      "zh-CN": "心率区间：先理解，再使用",
      ja: "心拍ゾーン：理解してから使う",
    },
    excerpt: {
      vi: "Vùng nhịp tim là công cụ hữu ích, nhưng chỉ khi bạn biết nó được tính từ đâu và sai số nằm ở đâu.",
      en: "Heart-rate zones are useful tools, but only when you know what they are derived from and where the error lies.",
      "zh-CN": "心率区间很有用，但前提是了解它的来源与误差。",
      ja: "心拍ゾーンは有用ですが、何から算出され、どこに誤差があるかを知る必要があります。",
    },
    body: {
      vi: `## Nhịp tim tối đa không phải một hằng số

Công thức phổ biến "220 trừ tuổi" có sai số lớn ở cấp độ cá nhân. Một công thức được nghiên cứu rộng hơn là của Tanaka và cộng sự: nhịp tim tối đa xấp xỉ 208 − 0,7 × tuổi. Ngay cả công thức này vẫn chỉ là ước tính.

Cách chính xác nhất là đo trong điều kiện kiểm soát, ví dụ bài test leo dốc hoặc chạy nước rút có giám sát. Với người mới hoặc người có bệnh lý tim mạch, không nên tự thực hiện test tối đa.

## Hai cách tính vùng

**Theo phần trăm nhịp tim tối đa:** vùng 1 là 50–60%, vùng 2 là 60–70%, vùng 3 là 70–80%, vùng 4 là 80–90%, vùng 5 là 90–100%.

**Theo nhịp tim dự trữ (Karvonen):** nhịp tim mục tiêu = nhịp tim nghỉ + % × (nhịp tim tối đa − nhịp tim nghỉ). Cách này tính đến nhịp tim nghỉ, thường phản ánh thể lực tốt hơn.

## Vùng nào dùng khi nào

- **Vùng 1–2:** chạy easy, long run, hồi phục. Phần lớn khối lượng nên ở đây.
- **Vùng 3:** tempo nhẹ hoặc chạy đua cự ly ngắn. Dùng tiết chế.
- **Vùng 4:** interval, tempo dài, chạy đua 5K–10K.
- **Vùng 5:** nước rút ngắn, không nên duy trì lâu.

## Những yếu tố làm nhịp tim lệch

Nhịp tim chịu ảnh hưởng của nhiệt độ, độ ẩm, mất nước, caffeine, giấc ngủ, căng thẳng và thuốc. Vì vậy, cùng một pace có thể cho nhịp tim rất khác giữa buổi sáng mát và buổi chiều oi bức.

Hãy dùng nhịp tim như một tín hiệu bổ sung, không phải mệnh lệnh tuyệt đối. Nếu nhịp tim cao bất thường kèm chóng mặt hoặc khó thở, hãy dừng lại.

## Kết luận thực dụng

Đừng cố tối ưu vùng nhịp tim đến từng nhịp. Hãy xác định nhịp tim nghỉ, ước tính nhịp tim tối đa một cách thận trọng, và quan sát xu hướng trong nhiều tuần. Công cụ chỉ có giá trị khi dữ liệu đủ tốt và cách diễn giải đủ khiêm tốn.`,
      en: `## Max heart rate is not a constant

The popular "220 minus age" formula has a large individual error. A more researched estimate from Tanaka and colleagues is approximately 208 − 0.7 × age. Even this remains an estimate.

The most accurate approach is a controlled test, such as a supervised hill or sprint protocol. Beginners and people with cardiovascular conditions should not perform maximal tests unsupervised.

## Two ways to define zones

**Percentage of maximum:** zone 1 is 50–60%, zone 2 is 60–70%, zone 3 is 70–80%, zone 4 is 80–90%, zone 5 is 90–100%.

**Heart-rate reserve (Karvonen):** target = resting HR + % × (max HR − resting HR). This accounts for resting heart rate and often reflects fitness better.

## Which zone for what

- **Zones 1–2:** easy runs, long runs, recovery. Most volume belongs here.
- **Zone 3:** light tempo or shorter races. Use sparingly.
- **Zone 4:** intervals, longer tempo, 5K–10K racing.
- **Zone 5:** short sprints, not sustainable for long.

## What shifts heart rate

Heart rate is affected by heat, humidity, dehydration, caffeine, sleep, stress and medication. The same pace can produce very different heart rates on a cool morning and a humid afternoon.

Treat heart rate as an additional signal, not an absolute command. If heart rate is unusually high with dizziness or breathlessness, stop.

## Practical conclusion

Do not optimise zones beat by beat. Establish resting heart rate, estimate maximum cautiously, and observe trends over weeks. A tool is only as good as its data and the humility of its interpretation.`,
      "zh-CN": `## 最大心率不是常数

常见的"220 减年龄"公式个体误差很大。Tanaka 等人提出的估算约为 208 − 0.7 × 年龄。即使如此，它仍只是估算。

最准确的方法是在受控条件下测试，例如有监督的爬坡或冲刺测试。新手或心血管疾病患者不应自行进行极限测试。

## 两种区间算法

**最大心率百分比：** 1 区 50–60%，2 区 60–70%，3 区 70–80%，4 区 80–90%，5 区 90–100%。

**储备心率（Karvonen）：** 目标心率 = 静息心率 + 百分比 ×（最大心率 − 静息心率）。这种方法考虑静息心率，通常更能反映体能。

## 各区的用途

- **1–2 区：** 轻松跑、长距离、恢复。大部分跑量应在此。
- **3 区：** 轻度节奏跑或短距离比赛，谨慎使用。
- **4 区：** 间歇、较长节奏跑、5K–10K 比赛。
- **5 区：** 短冲刺，无法长时间维持。

## 影响心率的因素

高温、湿度、脱水、咖啡因、睡眠、压力和药物都会影响心率。同样的配速，在凉爽的早晨和潮湿的下午可能产生完全不同的心率。

把心率当作补充信号，而不是绝对命令。若心率异常升高并伴有头晕或呼吸困难，应停止运动。

## 实用结论

不要逐拍优化区间。先确定静息心率，谨慎估算最大心率，并观察数周趋势。工具的价值取决于数据质量与解读的谦逊。`,
      ja: `## 最大心拍数は定数ではない

一般的な「220 − 年齢」式は個人差が大きいです。Tanaka らの推定式は約 208 − 0.7 × 年齢です。これも推定にすぎません。

最も正確なのは管理されたテスト（監督下の坂道走やスプリント）です。初心者や心血管疾患のある人は、最大テストを自己実施すべきではありません。

## ゾーンの2つの決め方

**最大心拍数の割合：** ゾーン1は50〜60%、2は60〜70%、3は70〜80%、4は80〜90%、5は90〜100%。

**予備心拍数（Karvonen）：** 目標心拍数 = 安静時心拍数 + % ×（最大心拍数 − 安静時心拍数）。安静時心拍数を考慮するため、体力をより反映しやすい方法です。

## ゾーンの使い分け

- **1〜2：** イージーラン、ロング走、回復。大部分の走行量はここ。
- **3：** 軽いテンポや短いレース。控えめに。
- **4：** インターバル、長めのテンポ、5K〜10Kレース。
- **5：** 短いスプリント。長時間は維持できません。

## 心拍数を左右する要因

気温、湿度、脱水、カフェイン、睡眠、ストレス、薬の影響を受けます。同じペースでも涼しい朝と蒸し暑い午後では心拍数が大きく変わります。

心拍数は補助的な信号であり、絶対的な命令ではありません。異常に高い心拍数にめまいや息切れを伴う場合は中止してください。

## 実用的な結論

1拍ごとにゾーンを最適化しようとしないでください。安静時心拍数を把握し、最大心拍数を慎重に推定し、数週間の傾向を見ます。ツールの価値はデータの質と解釈の謙虚さにかかっています。`,
    },
    sources: [
      "Tanaka H. et al. — Age-predicted maximal heart rate revisited (J Am Coll Cardiol, 2001)",
      "Karvonen M. et al. — The effects of training on heart rate (1957)",
    ],
  },
  {
    slug: "dinh-duong-ngay-dua",
    category: "nutrition",
    tags: ["dinh dưỡng", "ngày đua", "carbohydrate"],
    publishedAt: "2026-10-18",
    readingMinutes: 8,
    author: "Mythos Editorial",
    title: {
      vi: "Dinh dưỡng ngày đua: ăn gì, khi nào",
      en: "Race-day nutrition: what to eat and when",
      "zh-CN": "比赛日营养：吃什么，什么时候吃",
      ja: "レース当日の栄養：何を、いつ食べるか",
    },
    excerpt: {
      vi: "Chiến lược carbohydrate, nước và điện giải cho cự ly từ 10K đến marathon, kèm những điều cần thử trước ngày đua.",
      en: "Carbohydrate, fluid and electrolyte strategies from 10K to marathon, plus what to rehearse before race day.",
      "zh-CN": "从 10K 到马拉松的碳水、水分与电解质策略，以及赛前必须演练的事项。",
      ja: "10Kからマラソンまでの炭水化物・水分・電解質戦略と、本番前に試すべきこと。",
    },
    body: {
      vi: `## Nguyên tắc đầu tiên: không thử điều mới

Ngày đua không phải lúc để thử gel mới, giày mới hay bữa sáng lạ. Mọi thứ nên được tập trong các buổi long run ít nhất 2–3 lần trước đó.

## Trước ngày đua

Với cự ly từ bán marathon trở lên, tăng carbohydrate trong 24–36 giờ trước đua có thể giúp dự trữ glycogen. Không cần "nạp" quá mức; ưu tiên cơm, mì, khoai, chuối và thực phẩm quen thuộc. Tránh thực phẩm nhiều chất xơ hoặc cay nếu đường tiêu hóa nhạy cảm.

## Bữa sáng ngày đua

Ăn 2–3 giờ trước giờ xuất phát, khoảng 1–2 g carbohydrate mỗi kg cân nặng. Ví dụ người 60 kg có thể dùng 60–120 g carbohydrate từ cơm, bánh mì hoặc cháo. Nếu không ăn được sớm, dùng bữa nhẹ dễ tiêu hơn.

## Trong lúc đua

- **Dưới 60 phút:** nước là đủ với hầu hết người chạy.
- **60–120 phút:** có thể cần 30–60 g carbohydrate mỗi giờ.
- **Trên 2 giờ:** mục tiêu 60–90 g carbohydrate mỗi giờ, chia nhỏ và tập từ trước.

Dạ dày chỉ hấp thu được lượng carbohydrate nó đã được huấn luyện. Tăng đột ngột lên 90 g/giờ trong ngày đua thường dẫn đến đau bụng.

## Nước và điện giải

Mất nước làm tăng nhịp tim và giảm hiệu suất. Uống theo khát là khởi điểm hợp lý, nhưng trong thời tiết nóng ẩm của Việt Nam, nhiều người cần chủ động hơn. Cân trước và sau một buổi long run để ước tính lượng mồ hôi mất đi.

Đồ uống thể thao có thể cung cấp cả carbohydrate và natri. Không uống quá nhiều nước không có điện giải trong thời gian dài vì nguy cơ hạ natri máu.

## Sau đua

Trong 1–2 giờ đầu, kết hợp carbohydrate và protein (ví dụ sữa, cơm với trứng, chuối với sữa chua). Mục tiêu không phải "bù lại tất cả" mà là tạo điều kiện phục hồi.

## Lưu ý y tế

Người có bệnh tiểu đường, bệnh thận hoặc đang dùng thuốc nên tham khảo bác sĩ hoặc chuyên gia dinh dưỡng trước khi thay đổi chế độ ăn cho thi đấu.`,
      en: `## First rule: nothing new

Race day is not the time for a new gel, new shoes or an unfamiliar breakfast. Everything should be rehearsed on long runs at least two or three times beforehand.

## The day before

For half marathon and beyond, increasing carbohydrate intake 24–36 hours before the race can support glycogen stores. There is no need to overeat; prioritise rice, noodles, potatoes, bananas and familiar foods. Avoid high-fibre or spicy foods if your gut is sensitive.

## Race morning

Eat 2–3 hours before the start, roughly 1–2 g of carbohydrate per kilogram of body weight. A 60 kg runner might take 60–120 g from rice, bread or porridge. If you cannot eat that early, choose a smaller, easily digested meal.

## During the race

- **Under 60 minutes:** water is enough for most runners.
- **60–120 minutes:** 30–60 g of carbohydrate per hour may help.
- **Over 2 hours:** aim for 60–90 g per hour, split into small doses and practised in advance.

The gut absorbs what it has been trained to absorb. Jumping to 90 g/hour on race day often causes stomach upset.

## Fluid and electrolytes

Dehydration raises heart rate and reduces performance. Drinking to thirst is a reasonable starting point, but in Vietnam's hot, humid conditions many runners need to be more proactive. Weigh yourself before and after a long run to estimate sweat losses.

Sports drinks can supply both carbohydrate and sodium. Do not drink large volumes of plain water over many hours without electrolytes because of the risk of hyponatraemia.

## After the race

In the first one to two hours, combine carbohydrate and protein (milk, rice with eggs, banana with yoghurt). The goal is not to "replace everything" but to support recovery.

## Medical note

People with diabetes, kidney disease or on medication should consult a doctor or dietitian before changing race nutrition.`,
      "zh-CN": `## 第一条原则：不要尝试新东西

比赛日不是试用新能量胶、新鞋或陌生早餐的时候。所有补给都应在长距离训练中至少演练两到三次。

## 赛前一天

半程马拉松及以上，赛前 24–36 小时增加碳水摄入有助于糖原储备。不必暴食；优先米饭、面条、土豆、香蕉等熟悉食物。肠胃敏感者避免高纤维或辛辣食物。

## 比赛日早餐

赛前 2–3 小时进食，约每公斤体重 1–2 克碳水。60 公斤跑者可摄入 60–120 克碳水，来自米饭、面包或粥。若无法提前进食，选择更小、更易消化的餐食。

## 比赛中

- **60 分钟以内：** 多数人喝水即可。
- **60–120 分钟：** 每小时可能需要 30–60 克碳水。
- **超过 2 小时：** 目标每小时 60–90 克，分次摄入并提前练习。

肠胃只能吸收它被训练过的量。比赛日突然提高到每小时 90 克，常导致胃部不适。

## 水分与电解质

脱水会升高心率并降低表现。口渴时饮水是合理起点，但在越南湿热环境中，许多人需要更主动。长距离跑前后称体重，可估算出汗量。

运动饮料可同时提供碳水与钠。不要长时间大量饮用不含电解质的白水，以免低钠血症风险。

## 赛后

赛后 1–2 小时内，将碳水与蛋白质结合（牛奶、米饭配鸡蛋、香蕉配酸奶）。目标不是"全部补回来"，而是支持恢复。

## 医疗提示

糖尿病、肾病或正在服药者，在改变比赛营养前应咨询医生或营养师。`,
      ja: `## 最初のルール：新しいものを試さない

レース当日は新しいジェル、新しいシューズ、慣れない朝食を試す日ではありません。すべてをロング走で2〜3回以上練習しておきます。

## 前日

ハーフマラソン以上では、レース24〜36時間前の炭水化物増加がグリコーゲン貯蔵を助けます。過食は不要で、ご飯、麺、じゃがいも、バナナなど慣れた食品を優先します。胃が敏感な場合は高繊維や辛い食品を避けます。

## レース当日の朝食

スタート2〜3時間前に、体重1kgあたり約1〜2gの炭水化物を摂ります。60kgならご飯、パン、お粥から60〜120g。早く食べられない場合は、少量で消化の良い食事にします。

## レース中

- **60分未満：** 多くの人には水で十分。
- **60〜120分：** 1時間あたり30〜60gの炭水化物が必要な場合があります。
- **2時間以上：** 1時間あたり60〜90gを目標に、少量ずつ分割し事前に練習します。

胃は慣れた量しか吸収できません。当日いきなり90g/時に増やすと胃腸トラブルの原因になります。

## 水分と電解質

脱水は心拍数を上げ、パフォーマンスを低下させます。喉の渇きに従うのは良い出発点ですが、ベトナムの高温多湿ではより積極的な補水が必要な人もいます。ロング走の前後で体重を測り、発汗量を推定しましょう。

スポーツドリンクは炭水化物とナトリウムを同時に補給できます。電解質なしの水を長時間大量に飲むと低ナトリウム血症の危険があるため注意してください。

## レース後

1〜2時間以内に炭水化物とタンパク質を組み合わせます（牛乳、ご飯と卵、バナナとヨーグルト）。「すべてを取り戻す」のではなく、回復を支えることが目的です。

## 医療上の注意

糖尿病、腎臓病、服薬中の方は、レース栄養を変える前に医師や管理栄養士に相談してください。`,
    },
    sources: [
      "Thomas D.T., Erdman K.A., Burke L.M. — Position of the Academy of Nutrition and Dietetics, Dietitians of Canada, and ACSM: Nutrition and Athletic Performance (2016)",
      "Jeukendrup A. — A step towards personalized sports nutrition: carbohydrate intake during exercise (2014)",
    ],
  },
  {
    slug: "phuc-hoi-la-mot-phan-giao-an",
    category: "recovery",
    tags: ["phục hồi", "giấc ngủ", "quá tải"],
    publishedAt: "2026-10-24",
    readingMinutes: 6,
    author: "Mythos Editorial",
    title: {
      vi: "Phục hồi là một phần của giáo án",
      en: "Recovery is part of the plan",
      "zh-CN": "恢复也是训练计划的一部分",
      ja: "リカバリーは計画の一部",
    },
    excerpt: {
      vi: "Ngủ, ăn và giảm tải không phải là thời gian nghỉ khỏi tập luyện — đó là lúc cơ thể thích nghi.",
      en: "Sleep, food and deloading are not time off from training — they are when adaptation happens.",
      "zh-CN": "睡眠、饮食与减量不是离开训练，而是身体发生适应的时候。",
      ja: "睡眠、食事、減量はトレーニングから離れる時間ではなく、適応が起きる時間です。",
    },
    body: {
      vi: `## Thích nghi xảy ra khi nghỉ

Buổi tập tạo ra tín hiệu; cơ thể thích nghi trong những giờ sau đó. Nếu tín hiệu liên tục đến mà không có thời gian phục hồi, hiệu suất giảm và nguy cơ chấn thương tăng.

## Ba trụ cột

**Giấc ngủ.** Hầu hết người trưởng thành cần 7–9 giờ mỗi đêm. Thiếu ngủ làm giảm khả năng phối hợp, tăng cảm giác nỗ lực và ảnh hưởng đến quyết định ăn uống.

**Dinh dưỡng.** Đủ năng lượng và protein trong ngày quan trọng hơn một ly sinh tố ngay sau buổi chạy. Mục tiêu protein tham khảo cho người tập sức bền là khoảng 1,2–1,6 g/kg/ngày, chia đều các bữa.

**Giảm tải.** Cứ 3–4 tuần, giảm khối lượng khoảng 20–30% trong một tuần. Đây không phải là "tuần lười"; đây là tuần để các thích nghi được củng cố.

## Dấu hiệu cần phục hồi nhiều hơn

- Nhịp tim nghỉ cao hơn bình thường vài nhịp trong nhiều ngày.
- Cùng pace nhưng cảm giác nỗ lực tăng rõ rệt.
- Ngủ kém, dễ cáu, ăn uống thất thường.
- Đau nhức kéo dài hơn 48 giờ sau buổi tập nặng.

Một vài dấu hiệu đơn lẻ chưa nói lên nhiều. Xu hướng trong nhiều ngày mới đáng tin.

## Chủ động phục hồi

Đi bộ nhẹ, chạy rất chậm, giãn cơ nhẹ nhàng và ngủ đủ thường hiệu quả hơn các thiết bị phục hồi đắt tiền. Nếu dùng bồn nước đá hoặc massage, hãy xem chúng là công cụ bổ sung, không phải giải pháp thay thế cho tải hợp lý.

## Khi nào cần chuyên gia

Đau kéo dài, sụt cân không rõ nguyên nhân, mất kinh nguyệt, hoặc cảm giác kiệt sức kéo dài cần được đánh giá y tế. Hội chứng quá tải không phải là "yếu đuối"; đó là tín hiệu sinh lý.`,
      en: `## Adaptation happens at rest

Training creates a signal; the body adapts in the hours afterwards. If signals keep arriving without time to recover, performance falls and injury risk rises.

## Three pillars

**Sleep.** Most adults need 7–9 hours per night. Sleep loss reduces coordination, raises perceived effort and affects eating decisions.

**Nutrition.** Sufficient daily energy and protein matter more than a shake immediately after a run. A reference protein target for endurance athletes is roughly 1.2–1.6 g/kg/day, spread across meals.

**Deloading.** Every three to four weeks, reduce volume by around 20–30% for one week. This is not a "lazy week"; it is when adaptations consolidate.

## Signs you need more recovery

- Resting heart rate a few beats above normal for several days.
- The same pace feels markedly harder.
- Poor sleep, irritability, erratic eating.
- Soreness lasting more than 48 hours after a hard session.

A single sign means little. Trends over several days are more reliable.

## Active recovery

Gentle walking, very slow running, light stretching and sufficient sleep usually outperform expensive recovery gadgets. If you use ice baths or massage, treat them as supplements, not substitutes for sensible load.

## When to seek help

Persistent pain, unexplained weight loss, loss of menstruation, or prolonged exhaustion deserve medical assessment. Overtraining syndrome is not weakness; it is a physiological signal.`,
      "zh-CN": `## 适应发生在休息时

训练产生信号，身体在之后的数小时里适应。如果信号不断到来却没有恢复时间，表现会下降，受伤风险会上升。

## 三大支柱

**睡眠。** 多数成年人每晚需要 7–9 小时。睡眠不足会降低协调性、提高主观用力感，并影响饮食决策。

**营养。** 全天的能量与蛋白质比跑后一杯奶昔更重要。耐力训练者的蛋白质参考目标约为每天每公斤体重 1.2–1.6 克，分配到各餐。

**减量。** 每 3–4 周将一周跑量减少约 20–30%。这不是"偷懒周"，而是巩固适应的周。

## 需要更多恢复的信号

- 静息心率连续数天高于平常几拍。
- 同样配速明显更吃力。
- 睡眠差、易怒、饮食紊乱。
- 高强度训练后酸痛超过 48 小时。

单一信号意义不大，连续多天的趋势更可靠。

## 主动恢复

轻松步行、非常慢的慢跑、轻度拉伸和充足睡眠，通常比昂贵的恢复设备更有效。冰浴或按摩应视为补充手段，而非合理负荷的替代品。

## 何时寻求帮助

持续疼痛、不明原因体重下降、月经消失或长期疲惫，都需要医学评估。过度训练综合征不是软弱，而是生理信号。`,
      ja: `## 適応は休息中に起こる

トレーニングは信号をつくり、身体はその後の時間に適応します。回復時間なしに信号が続くと、パフォーマンスは低下し、故障リスクが高まります。

## 3つの柱

**睡眠。** 多くの成人は毎晩7〜9時間必要です。睡眠不足は協調性を下げ、主観的運動強度を高め、食行動にも影響します。

**栄養。** 走後すぐのプロテインより、1日全体のエネルギーとタンパク質が重要です。持久系アスリートの参考値は体重1kgあたり1日約1.2〜1.6gを各食に分けて摂ることです。

**減量。** 3〜4週間ごとに1週間の走行量を約20〜30%減らします。「怠けた週」ではなく、適応を定着させる週です。

## より多くの回復が必要なサイン

- 安静時心拍数が数日間、普段より数拍高い。
- 同じペースが明らかにきつい。
- 睡眠不足、イライラ、食事の乱れ。
- 高強度練習後の痛みが48時間以上続く。

単独のサインはあまり意味がなく、数日間の傾向が信頼できます。

## アクティブレカバリー

軽い散歩、非常にゆっくりしたジョグ、軽いストレッチ、十分な睡眠は、高価な回復機器より有効なことが多いです。アイスバスやマッサージは補助であり、適切な負荷の代わりにはなりません。

## 専門家に相談すべきとき

持続する痛み、原因不明の体重減少、無月経、長引く疲労は医学的評価が必要です。オーバートレーニング症候群は弱さではなく、生理的な信号です。`,
    },
    sources: [
      "Meeusen R. et al. — Prevention, diagnosis and treatment of the overtraining syndrome (ECSS/ACSM consensus, 2013)",
      "Halson S.L. — Sleep and the elite athlete (Sports Medicine, 2014)",
    ],
  },
];

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getFeaturedArticles(limit = 3) {
  return articles.filter((article) => article.featured).slice(0, limit);
}

export function getRelatedArticles(article: Article, limit = 3) {
  return articles
    .filter((item) => item.slug !== article.slug)
    .sort((a, b) => {
      const aScore = a.category === article.category ? 1 : 0;
      const bScore = b.category === article.category ? 1 : 0;
      return bScore - aScore;
    })
    .slice(0, limit);
}
