import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminAuth";
import { legacyProductColumns, mapProductRow, productColumns, type ProductRow } from "@/lib/products";

export const runtime = "nodejs";

const optionalList = z.array(z.string().trim().min(1)).max(12).default([]);
const productInputSchema = z.object({
  id: z.string().trim().min(1).optional(),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens."),
  name: z.string().trim().min(2),
  tagline: z.string().trim().max(160).default(""),
  description: z.string().trim().min(10),
  price: z.number().nonnegative(),
  discountPrice: z.number().nonnegative().nullable().optional(),
  discountActive: z.boolean().default(false),
  image: z.string().trim().url(),
  gallery: z.array(z.string().trim().url()).max(8).default([]),
  category: z.string().trim().min(2),
  rating: z.number().min(0).max(5).default(5),
  stock: z.number().int().nonnegative(),
  badges: optionalList,
  features: optionalList,
  isActive: z.boolean().default(true)
});

function validateDiscount(product: z.infer<typeof productInputSchema>, context: z.RefinementCtx) {
  if (product.discountActive && product.discountPrice == null) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["discountPrice"], message: "Discount price is required when discount is on." });
  }
  if (product.discountPrice != null && product.discountPrice >= product.price) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["discountPrice"], message: "Discount price must be lower than base price." });
  }
}

const productSchema = productInputSchema.superRefine(validateDiscount);
const productUpdateSchema = productInputSchema
  .extend({ id: z.string().trim().min(1) })
  .superRefine(validateDiscount);

function databaseValues(payload: z.infer<typeof productSchema>) {
  return {
    slug: payload.slug,
    name: payload.name,
    tagline: payload.tagline,
    description: payload.description,
    price: payload.price,
    discount_price: payload.discountPrice,
    discount_active: payload.discountActive,
    image: payload.image,
    gallery: payload.gallery.length ? payload.gallery : [payload.image],
    category: payload.category,
    rating: payload.rating,
    stock: payload.stock,
    badges: payload.badges,
    features: payload.features,
    is_active: payload.isActive,
    updated_at: new Date().toISOString()
  };
}

function errorResponse(error: unknown, fallback: string, status = 400) {
  const message = error instanceof z.ZodError
    ? error.errors.map((issue) => issue.message).join(", ")
    : error instanceof Error
      ? error.message
      : fallback;
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request);
    const response = await supabase
      .from("products")
      .select(productColumns)
      .order("updated_at", { ascending: false });
    if (!response.error) {
      return NextResponse.json({ products: (response.data || []).map((row) => mapProductRow(row as unknown as ProductRow)) });
    }

    const legacy = await supabase
      .from("products")
      .select(legacyProductColumns)
      .order("updated_at", { ascending: false });
    if (legacy.error) throw response.error;
    return NextResponse.json({
      products: (legacy.data || []).map((row) => mapProductRow(row as unknown as ProductRow)),
      migrationNeeded: true
    });
  } catch (error) {
    return errorResponse(error, "Unable to load products", 401);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request);
    const payload = productSchema.parse(await request.json());
    const id = payload.id || crypto.randomUUID();
    const { data, error } = await supabase
      .from("products")
      .insert({ id, ...databaseValues(payload) })
      .select(productColumns)
      .single();
    if (error) throw error;
    return NextResponse.json({ product: mapProductRow(data as unknown as ProductRow) }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Product create failed");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request);
    const payload = productUpdateSchema.parse(await request.json());
    const { data, error } = await supabase
      .from("products")
      .update(databaseValues(payload))
      .eq("id", payload.id)
      .select(productColumns)
      .single();
    if (error) throw error;
    return NextResponse.json({ product: mapProductRow(data as unknown as ProductRow) });
  } catch (error) {
    return errorResponse(error, "Product update failed");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request);
    const id = z.string().trim().min(1).parse(new URL(request.url).searchParams.get("id"));
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, "Product delete failed");
  }
}
