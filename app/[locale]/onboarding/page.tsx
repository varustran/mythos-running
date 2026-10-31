import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return buildMetadata({
    locale,
    path: "onboarding",
    title: "Thiết lập Hồ sơ Thành viên · Myso",
    description: "Chào mừng bạn đến với Myso. Hoàn tất hồ sơ cá nhân để bắt đầu kết nối, chia sẻ và tham gia cộng đồng.",
    noIndex: true,
  });
}

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();

  const locale = rawLocale as Locale;

  return (
    <div className="min-h-screen bg-canvas py-8 sm:py-12">
      <OnboardingFlow locale={locale} />
    </div>
  );
}
