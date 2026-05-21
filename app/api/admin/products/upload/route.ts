import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request);
    const file = (await request.formData()).get("file");
    if (!(file instanceof File)) throw new Error("Choose an image file.");
    if (!imageTypes.has(file.type)) throw new Error("Use a JPG, PNG, WebP, or AVIF image.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Image must be 5 MB or smaller.");

    const bucket = process.env.SUPABASE_PRODUCT_IMAGES_BUCKET || "product-images";
    const path = `products/${crypto.randomUUID()}-${safeName(file.name)}`;
    const { error } = await supabase.storage.from(bucket).upload(path, await file.arrayBuffer(), {
      contentType: file.type,
      upsert: false
    });
    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl, path });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Image upload failed" }, { status: 400 });
  }
}
