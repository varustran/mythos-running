import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { updateRole } from "./actions";

type ProfileRow = { id: string; email: string | null; full_name: string | null; role: string; created_at: string };

export default async function AdminUsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getT(locale, "admin");
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  let rows: ProfileRow[] = [];
  let dbError = false;
  if (supabase) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, created_at")
      .order("created_at", { ascending: true });
    rows = (data as ProfileRow[] | null) ?? [];
    dbError = Boolean(error);
  }

  const isAdminUser = profile?.role === "admin";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-ink">{t("users")}</h1>
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-subtle">{rows.length}</span>
      </div>

      {dbError ? (
        <p className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-xs text-muted">{t("databaseNotReady")}</p>
      ) : null}

      {rows.length === 0 ? (
        <p className="card p-6 text-sm text-subtle">{t("empty")}</p>
      ) : (
        <div className="card overflow-x-auto p-2">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead>
              <tr className="border-b border-line">
                {[t("email"), t("role"), t("status"), ""].map((head, index) => (
                  <th key={index} className="px-3 py-2 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-subtle">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-line/70 last:border-0">
                  <td className="px-3 py-3">
                    <p className="text-ink">{row.full_name || "—"}</p>
                    <p className="mt-0.5 text-subtle">{row.email}</p>
                  </td>
                  <td className="px-3 py-3">
                    {isAdminUser && row.id !== profile?.id ? (
                      <form action={updateRole} className="flex items-center gap-1.5">
                        <input type="hidden" name="id" value={row.id} />
                        <select
                          name="role"
                          defaultValue={row.role}
                          className="rounded-md border border-line bg-canvas px-2 py-1 text-xs text-ink"
                        >
                          <option value="admin">{t("roleAdmin")}</option>
                          <option value="editor">{t("roleEditor")}</option>
                          <option value="reader">{t("roleReader")}</option>
                        </select>
                        <button type="submit" className="rounded-md border border-line px-2 py-1 text-[0.65rem] text-muted transition hover:text-accent">
                          {t("save")}
                        </button>
                      </form>
                    ) : (
                      <span className="font-mono text-[0.65rem] text-muted">{t(`role${row.role.charAt(0).toUpperCase()}${row.role.slice(1)}`)}</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-teal">{t("active")}</td>
                  <td className="px-3 py-3 text-right text-subtle">{row.id.slice(0, 8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
