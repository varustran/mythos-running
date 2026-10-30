"use server";

import { revalidatePath } from "next/cache";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";

export async function updateRole(formData: FormData) {
  const id = String(formData.get("id") || "");
  const role = String(formData.get("role") || "");
  if (!id || !["admin", "editor", "reader"].includes(role)) return;

  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin" || profile.id === id) return;

  const supabase = await createClient();
  if (!supabase) return;

  await supabase.from("profiles").update({ role }).eq("id", id);
  revalidatePath("/", "layout");
}
