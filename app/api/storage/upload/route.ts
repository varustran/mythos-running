import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy tệp tin để tải lên" }, { status: 400 });
    }

    // Limit size (max 50MB for media/video, 10MB for avatar)
    const maxSizeBytes = folder === "avatars" ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: `Tệp quá lớn. Giới hạn tối đa là ${folder === "avatars" ? "10MB" : "50MB"}.` },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Chưa cấu hình Supabase Storage" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Sanitize extension
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const cleanName = `${folder}/${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage.from("media").upload(cleanName, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

    if (error) {
      return NextResponse.json({ error: `Lỗi tải tệp: ${error.message}` }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("media").getPublicUrl(cleanName);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      name: file.name,
      path: data.path,
      type: file.type,
      size: file.size,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Đã xảy ra lỗi trong quá trình tải tệp lên máy chủ." },
      { status: 500 }
    );
  }
}
