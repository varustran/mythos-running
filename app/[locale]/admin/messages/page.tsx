import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { deleteMessage } from "./actions";

type MessageRow = { id: string; name: string; email: string; message: string; locale: string | null; created_at: string };

export default async function AdminMessagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getT(locale, "admin");
  const supabase = await createClient();

  let rows: MessageRow[] = [];
  let dbError = false;
  if (supabase) {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("id, name, email, message, locale, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    rows = (data as MessageRow[] | null) ?? [];
    dbError = Boolean(error);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-ink">{t("messages")}</h1>
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-subtle">{rows.length}</span>
      </div>

      {dbError ? (
        <p className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-xs text-muted">{t("databaseNotReady")}</p>
      ) : null}

      {rows.length === 0 ? (
        <p className="card p-6 text-sm text-subtle">{t("empty")}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink">{row.name}</p>
                  <a href={`mailto:${row.email}`} className="mt-0.5 block text-xs text-accent">
                    {row.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[0.6rem] text-subtle">{formatDate(row.created_at, locale)}</span>
                  <form action={deleteMessage}>
                    <input type="hidden" name="id" value={row.id} />
                    <button
                      type="submit"
                      aria-label={t("delete")}
                      className="grid h-8 w-8 place-items-center rounded-full border border-line text-subtle transition hover:border-red-500/50 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">{row.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
