import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Shield, FileText, Scale, AlertTriangle, CheckCircle2, Lock, ArrowLeft, Download } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({
    locale,
    path: "legal/standards",
    title: "Tiêu Chuẩn Cộng Đồng & Chính Sách Tuân Thủ Pháp Luật — Myso",
    description: "Tiêu chuẩn cộng đồng, bảo vệ quyền riêng tư cá nhân và cam kết phối hợp với cơ quan chức năng khi phát hiện vi phạm pháp luật.",
  });
}

export default async function LegalStandardsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return (
    <article className="container-page py-12 sm:py-16 max-w-4xl">
      <Link
        href={localePath(locale, "/")}
        className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-ink transition mb-8"
      >
        <ArrowLeft className="h-4 w-4 text-accent" />
        <span>Về trang chủ Myso</span>
      </Link>

      {/* Header */}
      <div className="border-b border-line pb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="rounded-full bg-accent/10 px-3 py-1 font-mono text-xs text-accent font-semibold flex items-center gap-1.5">
            <Scale className="h-3.5 w-3.5" />
            TIÊU CHUẨN PHÁP LÝ & AN TOÀN NỀN TẢNG
          </span>
          <span className="rounded-full border border-teal/40 bg-teal/10 px-3 py-0.5 font-mono text-xs text-teal font-medium">
            PHIÊN BẢN CHÍNH THỨC 2026
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-ink leading-tight">
          Tiêu Chuẩn Cộng Đồng & Cam Kết Tuân Thủ Pháp Luật
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">
          Văn bản quy định trách nhiệm của thành viên, nguyên tắc bảo vệ quyền riêng tư cá nhân và chính sách phối hợp xử lý với Cơ quan Chức năng có thẩm quyền.
        </p>
      </div>

      {/* Formal PDF Style Document Box */}
      <div className="my-8 rounded-3xl border border-line bg-surface p-6 sm:p-10 shadow-xl space-y-8">
        {/* Section 1 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-accent font-display text-lg font-bold">
            <Shield className="h-5 w-5" />
            <h3>Điều 1. Mục đích và Phạm vi Áp dụng</h3>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            Myso được xây dựng như một mạng lưới công nghệ mở kết nối sáng tạo nội dung, tri thức bách khoa, công cụ trực tuyến và giao tiếp bảo mật. Toàn bộ người dùng khi truy cập, đăng ký tài khoản hoặc sử dụng dịch vụ trên nền tảng Myso đều mặc nhiên đồng ý tuân thủ toàn bộ các quy định trong văn bản này và các quy định pháp luật sở tại.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-rose-500 font-display text-lg font-bold">
            <AlertTriangle className="h-5 w-5" />
            <h3>Điều 2. Các Hành Vi Nghiêm Cấm Tuyệt Đối</h3>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            Hệ thống áp dụng chính sách <strong>Không Khoan Nhượng (Zero-Tolerance Policy)</strong> đối với các hành vi sau:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-muted list-disc list-inside">
            <li>Lợi dụng nền tảng, tính năng ghi chú, diễn đàn hoặc tin nhắn mã hóa để thực hiện hành vi lừa đảo, chiếm đoạt tài sản, rửa tiền, hoặc đánh bạc trái phép.</li>
            <li>Phát tán nội dung chống phá nhà nước, kích động bạo lực, khủng bố, phân biệt chủng tộc, tôn giáo, hoặc xâm phạm an ninh quốc gia.</li>
            <li>Phát tán mã độc, virus, phần mềm độc hại, tấn công từ chối dịch vụ (DDoS) hoặc spam máy chủ.</li>
            <li>Xâm phạm danh dự, nhân phẩm cá nhân, vu khống, đe dọa, tống tiền hoặc phát tán thông tin đời tư khi chưa có sự đồng thuận.</li>
            <li>Tuyên truyền, buôn bán hàng cấm, vũ khí, chất kích thích hoặc tài liệu đồi trụy.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-teal font-display text-lg font-bold">
            <Lock className="h-5 w-5" />
            <h3>Điều 3. Chính Sách Bảo Mật Quyền Riêng Tư & Mã Hóa</h3>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            Myso tôn trọng và bảo vệ tối đa quyền riêng tư hợp pháp của người dùng thông qua công nghệ mã hóa đầu cuối (E2EE) và các giao thức bảo mật tiên tiến. Nền tảng không tự ý thương mại hóa hay bán dữ liệu cá nhân cho bên thứ ba.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <div className="flex items-center gap-2.5 text-amber-500 font-display text-lg font-bold">
            <Scale className="h-5 w-5" />
            <h3>Điều 4. Cam Kết Phối Hợp Với Cơ Quan Chức Năng Có Thẩm Quyền</h3>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            Nền tảng Myso kiên quyết không trở thành nơi ẩn náu hay công cụ phục vụ cho các hoạt động vi phạm pháp luật. 
            Trong trường hợp phát hiện dấu hiệu tội phạm hoặc khi nhận được văn bản yêu cầu chính thức từ <strong>Cơ quan Chức năng có thẩm quyền (CQCN)</strong> theo đúng trình tự và quy định của pháp luật, Myso sẽ chủ động và tích cực phối hợp:
          </p>
          <ul className="space-y-1.5 text-xs text-muted list-disc list-inside">
            <li>Cung cấp nhật ký truy cập (IP logs), dữ liệu kỹ thuật và thông tin liên quan theo khuôn khổ pháp luật.</li>
            <li>Đình chỉ vĩnh viễn quyền truy cập, khóa tài khoản và xóa bỏ toàn bộ nội dung vi phạm mà không cần thông báo trước.</li>
            <li>Chuyển hồ sơ và bằng chứng kỹ thuật đến cơ quan thực thi pháp luật để tiến hành điều tra xử lý theo quy định.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-ink font-display text-lg font-bold">
            <FileText className="h-5 w-5" />
            <h3>Điều 5. Cơ Chế Báo Cáo & Xử Lý Vi Phạm</h3>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            Mọi thành viên trên Myso đều có quyền và trách nhiệm bấm nút <strong>Báo cáo (Report)</strong> trên từng bài đăng hoặc bình luận. Đội ngũ kiểm duyệt viên Myso sẽ tiến hành thẩm định và xử lý trong vòng tối đa 24 giờ kể từ khi nhận được khiếu nại.
          </p>
        </section>
      </div>
    </article>
  );
}
