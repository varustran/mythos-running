import type { Locale } from "@/lib/i18n/settings";

export type LegalDocKey = "privacy" | "terms" | "editorial-policy" | "disclaimer";

type LegalDoc = {
  updatedAt: string;
  body: Record<Locale, string>;
};

export const legalDocs: Record<LegalDocKey, LegalDoc> = {
  privacy: {
    updatedAt: "2026-10-30",
    body: {
      vi: `## Dữ liệu chúng tôi thu thập

Mythos Running chỉ thu thập dữ liệu bạn tự nguyện cung cấp: email khi đăng ký bản tin hoặc đăng nhập, thông tin hồ sơ chạy bộ và nội dung bạn gửi qua biểu mẫu liên hệ. Chúng tôi không bán dữ liệu cá nhân.

## Cách dữ liệu được sử dụng

Dữ liệu được dùng để vận hành tài khoản, hiển thị hồ sơ theo lựa chọn công khai của bạn, gửi bản tin bạn đã đăng ký và cải thiện nội dung. Số liệu tổng hợp có thể được dùng cho Mythos Labs nhưng không định danh cá nhân.

## Lưu trữ và bảo mật

Dữ liệu được lưu trên hạ tầng Supabase. Chúng tôi áp dụng kiểm soát truy cập và không lưu mật khẩu dưới dạng văn bản. Không có hệ thống nào an toàn tuyệt đối; hãy dùng mật khẩu riêng cho Mythos.

## Quyền của bạn

Bạn có thể yêu cầu truy cập, chỉnh sửa hoặc xóa dữ liệu qua biểu mẫu liên hệ. Yêu cầu xóa tài khoản sẽ xóa hồ sơ và dữ liệu liên quan, trừ dữ liệu phải giữ theo quy định pháp luật.`,
      en: `## What we collect

Mythos Running only collects data you voluntarily provide: your email when you subscribe or sign in, running profile details and messages you send through the contact form. We do not sell personal data.

## How data is used

Data is used to operate your account, display your profile according to your public visibility settings, send newsletters you requested and improve content. Aggregated, non-identifying data may be used for Mythos Labs.

## Storage and security

Data is stored on Supabase infrastructure. We apply access controls and never store passwords in plain text. No system is perfectly secure; please use a unique password for Mythos.

## Your rights

You may request access, correction or deletion through the contact form. Deleting your account removes your profile and related data, except records we must retain by law.`,
      "zh-CN": `## 我们收集的数据

Mythos Running 仅收集你主动提供的数据：订阅或登录时的邮箱、跑步档案信息，以及通过联系表单发送的内容。我们不会出售个人数据。

## 数据用途

数据用于运营账户、按你的公开设置展示档案、发送你订阅的简报并改进内容。经过汇总且无法识别个人的数据可能用于 Mythos Labs。

## 存储与安全

数据存储在 Supabase 基础设施上。我们实施访问控制，绝不以明文保存密码。没有任何系统绝对安全，请为 Mythos 使用独立密码。

## 你的权利

你可以通过联系表单请求访问、更正或删除数据。删除账户将移除档案及相关数据，但法律要求保留的记录除外。`,
      ja: `## 収集するデータ

Mythos Running は、ニュースレター登録やサインイン時のメールアドレス、ランニングプロフィール、お問い合わせフォームで送信された内容など、ご自身が提供したデータのみを収集します。個人データを販売することはありません。

## データの利用目的

アカウントの運営、公開設定に応じたプロフィール表示、登録済みニュースレターの配信、コンテンツ改善に使用します。個人を特定しない集計データは Mythos Labs で利用する場合があります。

## 保存とセキュリティ

データは Supabase のインフラに保存されます。アクセス制御を実施し、パスワードを平文で保存することはありません。完全に安全なシステムは存在しないため、Mythos 専用のパスワードをご利用ください。

## あなたの権利

お問い合わせフォームから、データの開示・訂正・削除を請求できます。アカウント削除によりプロフィールと関連データは削除されますが、法令上保持が必要な記録は除きます。`,
    },
  },
  terms: {
    updatedAt: "2026-10-30",
    body: {
      vi: `## Chấp nhận điều khoản

Khi sử dụng Mythos Running, bạn đồng ý với các điều khoản này. Nếu không đồng ý, vui lòng không sử dụng dịch vụ.

## Nội dung và công cụ

Các công cụ tính toán được cung cấp để tham khảo và mang tính giáo dục. Kết quả không phải lời khuyên y tế, chẩn đoán hay chương trình huấn luyện cá nhân. Bạn tự chịu trách nhiệm về quyết định tập luyện của mình.

## Tài khoản và cộng đồng

Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động dưới tài khoản của mình. Không đăng nội dung xúc phạm, spam, xâm phạm quyền riêng tư hoặc vi phạm pháp luật. Chúng tôi có thể gỡ nội dung hoặc khóa tài khoản vi phạm.

## Giới hạn trách nhiệm

Nội dung được cung cấp "nguyên trạng". Trong phạm vi pháp luật cho phép, Mythos Running không chịu trách nhiệm cho thiệt hại phát sinh từ việc sử dụng nội dung hoặc công cụ. Chúng tôi có thể cập nhật điều khoản và sẽ ghi ngày cập nhật mới.`,
      en: `## Acceptance

By using Mythos Running you agree to these terms. If you do not agree, please do not use the service.

## Content and tools

Calculators are provided for reference and education. Results are not medical advice, diagnosis or a personalised training programme. You are responsible for your own training decisions.

## Accounts and community

You are responsible for keeping your credentials secure and for all activity under your account. Do not post abusive, spammy, privacy-invasive or unlawful content. We may remove content or suspend accounts that violate these terms.

## Liability and changes

Content is provided "as is". To the extent permitted by law, Mythos Running is not liable for damages arising from use of the content or tools. We may update these terms and will publish the new update date.`,
      "zh-CN": `## 接受条款

使用 Mythos Running 即表示你同意本条款。如不同意，请勿使用本服务。

## 内容与工具

计算器仅供参考和教育用途。结果不构成医疗建议、诊断或个性化训练计划。你需对自己的训练决定负责。

## 账户与社区

你负责保护登录凭证，并对账户下的所有活动负责。不得发布辱骂、垃圾信息、侵犯隐私或违法内容。我们可删除违规内容或暂停账户。

## 责任与变更

内容按“现状”提供。在法律允许范围内，Mythos Running 不对使用内容或工具产生的损害承担责任。我们可能更新条款，并公布新的更新日期。`,
      ja: `## 規約への同意

Mythos Running を利用することで、本規約に同意したものとみなします。同意できない場合はご利用をお控えください。

## コンテンツとツール

計算ツールは参考および教育目的で提供されます。結果は医療上の助言、診断、個別のトレーニングプログラムではありません。トレーニングの判断はご自身の責任で行ってください。

## アカウントとコミュニティ

ログイン情報の管理と、アカウント上のすべての活動に責任を負います。侮辱的、スパム的、プライバシーを侵害する内容、違法な内容を投稿しないでください。違反内容の削除やアカウント停止を行う場合があります。

## 責任と変更

コンテンツは現状のまま提供されます。法律で認められる範囲で、Mythos Running はコンテンツやツールの利用により生じた損害に責任を負いません。規約は更新される場合があり、新しい更新日を掲載します。`,
    },
  },
  "editorial-policy": {
    updatedAt: "2026-10-30",
    body: {
      vi: `## Nguyên tắc biên tập

Mythos Running ưu tiên sự rõ ràng, trung thực và khả năng kiểm chứng. Chúng tôi không trình bày giả thuyết như kết luận và không tạo số liệu, giải chạy hay đánh giá sản phẩm không có thật.

## Nguồn và kiểm chứng

Bài viết dựa trên tài liệu huấn luyện, sinh lý học thể thao và hướng dẫn y tế có thể tra cứu. Khi bằng chứng còn yếu hoặc mâu thuẫn, chúng tôi nói rõ. Các công cụ hiển thị công thức để bạn tự kiểm tra.

## Quy trình

Nội dung được biên soạn, rà soát và cập nhật bởi nhóm biên tập Mythos. Bài viết y tế hoặc dinh dưỡng nhạy cảm cần được đọc như thông tin tham khảo, không thay thế chuyên gia.

## Sửa lỗi và độc lập

Khi phát hiện lỗi, chúng tôi sửa và ghi ngày cập nhật. Nội dung thương mại, nếu có, được công bố rõ. Liên kết tiếp thị không quyết định kết luận đánh giá.`,
      en: `## Editorial principles

Mythos Running prioritises clarity, honesty and verifiability. We do not present hypotheses as conclusions, and we do not invent statistics, races or product reviews.

## Sources and verification

Articles draw on coaching literature, sports physiology and traceable medical guidance. Where evidence is weak or conflicting, we say so. Tools expose their formulas so you can check the maths.

## Process

Content is written, reviewed and updated by the Mythos editorial team. Sensitive medical or nutrition material should be read as reference information, not a substitute for a professional.

## Corrections and independence

When we find an error, we correct it and publish the update date. Commercial relationships, if any, are disclosed. Affiliate links never determine review conclusions.`,
      "zh-CN": `## 编辑原则

Mythos Running 重视清晰、诚实与可验证性。我们不会把假设当作结论，也不会编造统计数据、赛事或产品评测。

## 来源与验证

文章参考教练文献、运动生理学与可追溯的医疗指南。当证据薄弱或存在冲突时，我们会明确说明。工具公开计算公式，便于你自行核对。

## 流程

内容由 Mythos 编辑团队撰写、审核和更新。敏感的医疗或营养内容应作为参考资料阅读，不能替代专业人士。

## 更正与独立性

发现错误时，我们会更正并公布更新日期。如有商业关系，将予以披露。联盟链接不会决定评测结论。`,
      ja: `## 編集方針

Mythos Running は明瞭さ、誠実さ、検証可能性を重視します。仮説を結論として提示せず、統計、大会、製品レビューを捏造しません。

## 情報源と検証

記事はコーチング文献、スポーツ生理学、追跡可能な医療ガイドラインに基づきます。証拠が弱い、または矛盾する場合は明記します。ツールは計算式を公開し、ご自身で確認できるようにしています。

## プロセス

コンテンツは Mythos 編集チームが執筆、レビュー、更新します。医療や栄養に関する敏感な内容は参考情報としてお読みください。

## 訂正と独立性

誤りを発見した場合は訂正し、更新日を掲載します。商業的な関係がある場合は開示します。アフィリエイトリンクがレビューの結論を左右することはありません。`,
    },
  },
  disclaimer: {
    updatedAt: "2026-10-30",
    body: {
      vi: `## Nội dung giáo dục

Thông tin trên Mythos Running nhằm hỗ trợ học tập và ra quyết định có hiểu biết. Đây không phải dịch vụ y tế, chẩn đoán hoặc điều trị.

## Sức khỏe của bạn

Trước khi bắt đầu hoặc thay đổi chương trình tập luyện, hãy tham khảo ý kiến chuyên gia y tế, đặc biệt nếu bạn có bệnh nền, chấn thương hoặc đang mang thai. Dừng tập và tìm trợ giúp nếu có đau ngực, chóng mặt hoặc khó thở bất thường.

## Ước tính và dữ liệu

Các công cụ dùng công thức đơn giản hóa. Kết quả có thể khác với thiết bị, phòng thí nghiệm hoặc điều kiện thực tế. Không dùng kết quả để tự chẩn đoán.

## Liên kết bên ngoài

Chúng tôi có thể liên kết đến trang của bên thứ ba. Mythos Running không kiểm soát và không chịu trách nhiệm về nội dung hoặc chính sách của các trang đó.`,
      en: `## Educational content

Information on Mythos Running supports learning and informed decisions. It is not a medical service, diagnosis or treatment.

## Your health

Consult a healthcare professional before starting or changing a training programme, especially if you have a medical condition, injury or are pregnant. Stop and seek help if you experience chest pain, dizziness or unusual shortness of breath.

## Estimates and data

Tools use simplified formulas. Results may differ from devices, laboratory testing or real-world conditions. Do not use results to self-diagnose.

## External links

We may link to third-party sites. Mythos Running does not control and is not responsible for their content or policies.`,
      "zh-CN": `## 教育内容

Mythos Running 上的信息用于支持学习与知情决策，不构成医疗服务、诊断或治疗。

## 你的健康

在开始或改变训练计划前，请咨询医疗专业人士，尤其是如果你有疾病、受伤或怀孕。如出现胸痛、头晕或异常气短，请停止运动并寻求帮助。

## 估算与数据

工具使用简化公式。结果可能与设备、实验室测试或实际情况不同。请勿用结果进行自我诊断。

## 外部链接

我们可能链接到第三方网站。Mythos Running 不控制也不对其内容或政策负责。`,
      ja: `## 教育コンテンツ

Mythos Running の情報は学習と合理的な判断を支援するものです。医療サービス、診断、治療ではありません。

## 健康について

トレーニングを開始・変更する前に、特に疾患、怪我、妊娠がある場合は医療専門家に相談してください。胸痛、めまい、異常な息切れがある場合は運動を中止し、助けを求めてください。

## 推定値とデータ

ツールは簡略化された式を使用します。結果は機器、検査、実際の条件と異なる場合があります。自己診断に使用しないでください。

## 外部リンク

第三者サイトへのリンクを含む場合があります。Mythos Running はそれらの内容や方針を管理せず、責任を負いません。`,
    },
  },
};
