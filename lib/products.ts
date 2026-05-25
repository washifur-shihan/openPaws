import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { Product } from "@/lib/types";

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  price: number | string;
  compare_at_price: number | string | null;
  discount_price?: number | string | null;
  discount_active?: boolean | null;
  image: string | null;
  gallery?: string[] | null;
  category: string | null;
  rating: number | string | null;
  stock: number | null;
  badges: string[] | null;
  features: string[] | null;
  is_active?: boolean | null;
};

export const productColumns = [
  "id",
  "slug",
  "name",
  "tagline",
  "description",
  "price",
  "compare_at_price",
  "discount_price",
  "discount_active",
  "image",
  "gallery",
  "category",
  "rating",
  "stock",
  "badges",
  "features",
  "is_active"
].join(",");

export const legacyProductColumns = [
  "id",
  "slug",
  "name",
  "tagline",
  "description",
  "price",
  "compare_at_price",
  "image",
  "category",
  "rating",
  "stock",
  "badges",
  "features",
  "is_active"
].join(",");

function numberValue(value: number | string | null | undefined, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function mapProductRow(row: ProductRow): Product {
  const basePrice = numberValue(row.price);
  const rawDiscountPrice =
    row.discount_price == null ? undefined : numberValue(row.discount_price);

  const hasValidDiscount =
    rawDiscountPrice != null &&
    rawDiscountPrice > 0 &&
    rawDiscountPrice < basePrice;

  const discountActive = hasValidDiscount;
  const sellingPrice = hasValidDiscount ? rawDiscountPrice : basePrice;

  const legacyComparePrice =
    row.compare_at_price == null ? undefined : numberValue(row.compare_at_price);

  const image = row.image || "/placeholder-product.jpg";

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline || "",
    description: row.description || "",

    // final price used for cart, checkout, product card
    price: sellingPrice,

    // crossed-out price shown only when discount exists
    compareAtPrice: hasValidDiscount ? basePrice : legacyComparePrice,

    image,
    gallery: row.gallery?.length ? row.gallery : [image],
    category: row.category || "Cat Toys",
    rating: numberValue(row.rating, 5),
    stock: row.stock || 0,
    badges: row.badges || [],
    features: row.features || [],

    // raw database prices
    basePrice,
    discountPrice: hasValidDiscount ? rawDiscountPrice : undefined,
    discountActive,
    isActive: row.is_active ?? true
  };
}

export async function getProducts(options: { includeInactive?: boolean } = {}) {
  const supabase = getSupabaseAdmin();
  let query = supabase.from("products").select(productColumns).order("created_at", { ascending: false });

  if (!options.includeInactive) {
    query = query.eq("is_active", true);
  }

  const response = await query;
  if (!response.error) {
    return (response.data || []).map((row) => mapProductRow(row as unknown as ProductRow));
  }

  let legacyQuery = supabase.from("products").select(legacyProductColumns).order("created_at", { ascending: false });
  if (!options.includeInactive) {
    legacyQuery = legacyQuery.eq("is_active", true);
  }
  const legacy = await legacyQuery;
  if (legacy.error) throw response.error;
  return (legacy.data || []).map((row) => mapProductRow(row as unknown as ProductRow));
}

export async function getProductByIdFromSupabase(id: string) {
  const supabase = getSupabaseAdmin();
  const response = await supabase
    .from("products")
    .select(productColumns)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (!response.error) {
    return response.data ? mapProductRow(response.data as unknown as ProductRow) : null;
  }

  const legacy = await supabase
    .from("products")
    .select(legacyProductColumns)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();
  if (legacy.error) throw response.error;
  return legacy.data ? mapProductRow(legacy.data as unknown as ProductRow) : null;
}

export async function getProductBySlugFromSupabase(slug: string) {
  const supabase = getSupabaseAdmin();
  const response = await supabase
    .from("products")
    .select(productColumns)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!response.error) {
    return response.data ? mapProductRow(response.data as unknown as ProductRow) : null;
  }

  const legacy = await supabase
    .from("products")
    .select(legacyProductColumns)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (legacy.error) throw response.error;
  return legacy.data ? mapProductRow(legacy.data as unknown as ProductRow) : null;
}
