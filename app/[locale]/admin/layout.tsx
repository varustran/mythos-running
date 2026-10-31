import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Myso Administration & Security Control",
  robots: { index: false, follow: false },
};

const ROOT_ADMIN_EMAIL = "chuitv1907@gmail.com";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  // Root Admin Security Barrier
  // Strict 404 Not Found for anyone except chuitv1907@gmail.com
  const supabase = await createClient();
  if (!supabase) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email?.toLowerCase() !== ROOT_ADMIN_EMAIL) {
    // Completely hide existence of the admin panel
    notFound();
  }

  return <div className="min-h-screen bg-canvas">{children}</div>;
}
