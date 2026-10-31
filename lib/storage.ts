/**
 * Myso Storage Upload Utility
 * Uploads media files (photos, videos, documents, custom avatars)
 * directly to the Supabase 'media' bucket.
 */
export async function uploadMediaFile(
  file: File,
  folder: "posts" | "avatars" | "chat" | "general" = "posts"
): Promise<{ url: string; name: string; type: string; size: number }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/storage/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Không thể tải tệp lên máy chủ Myso.");
  }

  return {
    url: data.url,
    name: data.name,
    type: data.type,
    size: data.size,
  };
}
