import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const BUCKET = process.env.SUPABASE_PRODUCT_IMAGES_BUCKET || "product-images";

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
}

/** Ensure the storage bucket exists; create it (public) if it doesn't. */
async function ensureBucket(supabase: ReturnType<typeof getSupabaseAdmin>) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("[upload] Could not list buckets:", listError.message);
    // Continue anyway — maybe the bucket already exists
    return;
  }
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5 MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    });
    if (createError) {
      console.error("[upload] Could not create bucket:", createError.message);
      throw new Error(`Bucket "${BUCKET}" does not exist and could not be created: ${createError.message}`);
    }
    console.log(`[upload] Created bucket "${BUCKET}"`);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const supabase = getSupabaseAdmin();

    const file = (await request.formData()).get("file");
    if (!(file instanceof File)) throw new Error("Choose an image file.");
    if (!imageTypes.has(file.type)) throw new Error("Use a JPG, PNG, WebP, or AVIF image.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Image must be 5 MB or smaller.");

    // Create the bucket automatically if it doesn't exist
    await ensureBucket(supabase);

    const path = `products/${crypto.randomUUID()}-${safeName(file.name)}`;
    const bytes = await file.arrayBuffer();

    const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      console.error("[upload] Supabase storage error:", error);
      throw new Error(error.message || "Storage upload failed.");
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl, path });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image upload failed";
    console.error("[upload] Error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/** DELETE: remove an image from storage by its storage path */
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);
    const supabase = getSupabaseAdmin();
    const { path } = await request.json();
    if (!path || typeof path !== "string") throw new Error("Missing image path.");

    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image delete failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/** GET: returns bucket info (useful for admin diagnostics) */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const supabase = getSupabaseAdmin();
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    const bucket = buckets?.find((b) => b.name === BUCKET);
    return NextResponse.json({
      bucket: BUCKET,
      exists: Boolean(bucket),
      buckets: buckets?.map((b) => b.name) ?? [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not check bucket";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
