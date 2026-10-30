"use server";

import { revalidatePath } from "next/cache";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";

export async function deleteMessage(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const profile = await getCurrentProfile();
  if (!profile || !["admin", "editor"].includes(profile.role)) return;
  const supabase = await createClient();
  if (!supabase) return;
  await supabase.from("contact_messages").delete().eq("id", id);
  revalidatePath("/", "layout");
}
