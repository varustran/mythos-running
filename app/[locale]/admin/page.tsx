import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, CalendarDays, Mail, MessageSquare, Route as RouteIcon, Users } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { articles } from "@/data/articles";
import { events } from "@/data/events";
import { routes } from "@/data/routes";
import { formatDate } from "@/lib/utils";

type MessageRow = { id: string; name: string; email: string; message: string; created_at: string };

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getT(locale, "admin");
  const supabase = await createClient();

  let profiles = 0;
  let messages = 0;
  let subscribers = 0;
  let recent: MessageRow[] = [];
  let dbError = false;

  if (supabase) {
    const [profileCount, messageCount, subscriberCount, recentMessages] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("contact_messages").select("*", { count: "exact", head: true }),
      supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
      supabase.from("contact_messages").select("id, name, email, message, created_at").order("created_at", { ascending: false }).limit(5),
    ]);
    profiles = profileCount.count ?? 0;
    messages = messageCount.count ?? 0;
    subscribers = subscriberCount.count ?? 0;
    recent = (recentMessages.data as MessageRow[] | null) ?? [];
    dbError = Boolean(profileCount.error || messageCount.error || subscriberCount.error || recentMessages.error);
  }

  const upcoming = events.filter((event) => new Date(event.date).getTime() >= Date.now()).length;

  const stats = [
    { icon: BookOpen, label: t("totalArticles"), value: articles.length },
    { icon: CalendarDays, label: t("upcomingEvents"), value: upcoming },
    { icon: RouteIcon, label: t("totalRoutes"), value: routes.length },
    { icon: Users, label: t("registeredUsers"), value: profiles },
    { icon: MessageSquare, label: t("contactMessages"), value: messages },
    { icon: Mail, label: t("subscribers"), value: subscribers },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center justify-between">
                <Icon className="h-4 w-4 text-accent" />
                <span className="font-display text-2xl font-semibold text-ink">{stat.value}</span>
              </div>
              <p className="mt-3 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-subtle">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {dbError ? (
        <p className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-xs text-muted">{t("databaseNotReady")}</p>
      ) : null}

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">{t("messages")}</h2>
          <Link href={localePath(locale, "/admin/messages")} className="text-xs text-accent">
            {t("overview")} →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-subtle">{t("empty")}</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {recent.map((message) => (
              <li key={message.id} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink">{message.name}</p>
                  <span className="font-mono text-[0.6rem] text-subtle">{formatDate(message.created_at, locale)}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{message.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs leading-relaxed text-subtle">{t("seedContentNote")}</p>
    </div>
  );
}
