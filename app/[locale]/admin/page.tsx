import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { createClient } from "@/lib/supabase/server";
import { AdminManagerClient } from "@/components/admin/AdminManagerClient";

const ROOT_ADMIN_EMAIL = "chuitv1907@gmail.com";

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const supabase = await createClient();
  if (!supabase) notFound();

  // Strict check on page level as well
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email?.toLowerCase() !== ROOT_ADMIN_EMAIL) {
    notFound();
  }

  let users: any[] = [];
  let reports: any[] = [];
  let usersCount = 0;
  let postsCount = 0;
  let commentsCount = 0;
  let reportsCount = 0;

  const [profilesRes, postsRes, commentsRes, reportsRes] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("social_posts").select("id", { count: "exact", head: true }),
    supabase.from("social_comments").select("id", { count: "exact", head: true }),
    supabase.from("post_reports").select("*").order("created_at", { ascending: false }).limit(50),
  ]);

  users = profilesRes.data || [];
  reports = reportsRes.data || [];
  usersCount = users.length;
  postsCount = postsRes.count ?? 0;
  commentsCount = commentsRes.count ?? 0;
  reportsCount = reportsRes.count ?? reports.length;

  return (
    <div className="container-page py-10 max-w-6xl">
      <AdminManagerClient
        initialUsers={users}
        initialReports={reports}
        stats={{
          usersCount,
          postsCount,
          commentsCount,
          reportsCount,
        }}
        locale={locale}
      />
    </div>
  );
}
