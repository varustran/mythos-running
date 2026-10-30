"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ locale }: { locale: string }) {
  const router = useRouter();
  const { t } = useTranslation("auth");
  const [pending, setPending] = useState(false);

  async function signOut() {
    const supabase = createClient();
    if (!supabase) return;
    setPending(true);
    await supabase.auth.signOut();
    router.push(`/${locale}`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted transition hover:border-accent/60 hover:text-ink disabled:opacity-60"
    >
      <LogOut className="h-3.5 w-3.5" /> {t("signOut")}
    </button>
  );
}
