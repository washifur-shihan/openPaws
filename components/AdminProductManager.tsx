"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { ImagePlus, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { Product } from "@/lib/types";
import { formatTk } from "@/lib/utils";

type ProductForm = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  price: string;
  discountPrice: string;
  discountActive: boolean;
  stock: string;
  rating: string;
  gallery: string[]; // ordered list of image URLs
  badges: string;
  features: string;
  isActive: boolean;
};

const emptyForm: ProductForm = {
  id: "",
  name: "",
  slug: "",
  tagline: "",
  description: "",
  category: "Cat Toys",
  price: "",
  discountPrice: "",
  discountActive: false,
  stock: "0",
  rating: "5",
  gallery: [],
  badges: "",
  features: "",
  isActive: true,
};

function lines(value: string) {
  return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
}

function formFromProduct(product: Product): ProductForm {
  const gallery = product.gallery?.length ? product.gallery : product.image ? [product.image] : [];
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    tagline: product.tagline,
    description: product.description,
    category: product.category,
    price: String(product.basePrice ?? product.price),
    discountPrice: product.discountPrice == null ? "" : String(product.discountPrice),
    discountActive: Boolean(product.discountActive),
    stock: String(product.stock),
    rating: String(product.rating),
    gallery,
    badges: product.badges.join("\n"),
    features: product.features.join("\n"),
    isActive: product.isActive ?? true,
  };
}

async function adminHeaders(json = false) {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error("Admin login expired.");
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${data.session.access_token}`,
  };
}

// ─── Gallery Image Tile ──────────────────────────────────────────────────────
function GalleryTile({
  url,
  index,
  isMain,
  onRemove,
  onSetMain,
}: {
  url: string;
  index: number;
  isMain: boolean;
  onRemove: (index: number) => void;
  onSetMain: (index: number) => void;
}) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-orange-100 bg-orange-50 transition hover:border-cocoa">
      <Image src={url} alt={`Gallery image ${index + 1}`} fill className="object-cover" />
      {isMain && (
        <span className="absolute left-1.5 top-1.5 rounded-full bg-cocoa px-2 py-0.5 text-[10px] font-black text-white shadow">
          Main
        </span>
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 opacity-0 transition group-hover:opacity-100">
        {!isMain && (
          <button
            type="button"
            onClick={() => onSetMain(index)}
            className="rounded-full bg-white px-3 py-1 text-xs font-black text-cocoa shadow hover:bg-orange-100"
          >
            Set main
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="rounded-full bg-rose-600 px-3 py-1 text-xs font-black text-white shadow hover:bg-rose-700"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [migrationNeeded, setMigrationNeeded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/products", { headers: await adminHeaders() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load products.");
      setProducts(data.products || []);
      setMigrationNeeded(Boolean(data.migrationNeeded));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function update<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  // ── Gallery helpers ──────────────────────────────────────────────────────
  function removeGalleryImage(index: number) {
    setForm((current) => ({
      ...current,
      gallery: current.gallery.filter((_, i) => i !== index),
    }));
  }

  function setMainImage(index: number) {
    setForm((current) => {
      const next = [...current.gallery];
      const [picked] = next.splice(index, 1);
      return { ...current, gallery: [picked, ...next] };
    });
  }

  // ── Upload one or multiple images ────────────────────────────────────────
  async function uploadImages(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const headers = await adminHeaders();
    const results: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.set("file", file);
        const response = await fetch("/api/admin/products/upload", {
          method: "POST",
          headers,
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Upload failed.");
        results.push(data.url);
      } catch (err) {
        toast.error(`${file.name}: ${err instanceof Error ? err.message : "Upload failed."}`);
      }
    }

    if (results.length > 0) {
      setForm((current) => ({
        ...current,
        gallery: [...current.gallery, ...results],
      }));
      toast.success(`${results.length} image${results.length > 1 ? "s" : ""} uploaded`);
    }

    setUploading(false);
    // Reset the file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Save product ─────────────────────────────────────────────────────────
  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.gallery.length === 0) {
      toast.error("Please upload at least one product image.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...(form.id ? { id: form.id } : {}),
        name: form.name,
        slug: form.slug,
        tagline: form.tagline,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        discountActive: form.discountActive,
        stock: Number(form.stock),
        rating: Number(form.rating),
        image: form.gallery[0],       // first image = main image
        gallery: form.gallery,
        badges: lines(form.badges),
        features: lines(form.features),
        isActive: form.isActive,
      };
      const response = await fetch("/api/admin/products", {
        method: form.id ? "PATCH" : "POST",
        headers: await adminHeaders(true),
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Product save failed.");
      setProducts((current) =>
        form.id
          ? current.map((p) => (p.id === data.product.id ? data.product : p))
          : [data.product, ...current]
      );
      setForm(formFromProduct(data.product));
      toast.success(form.id ? "Product updated ✓" : "Product created ✓");
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Product save failed.");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete product ───────────────────────────────────────────────────────
  async function deleteProduct(product: Product) {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    try {
      const response = await fetch(`/api/admin/products?id=${encodeURIComponent(product.id)}`, {
        method: "DELETE",
        headers: await adminHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Product delete failed.");
      setProducts((current) => current.filter((item) => item.id !== product.id));
      if (form.id === product.id) setForm(emptyForm);
      toast.success("Product deleted");
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : "Product delete failed.");
    }
  }

  const mainImage = form.gallery[0] ?? null;

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
      {/* ── Product List ── */}
      <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-orange-100 px-5 py-4">
          <h2 className="text-xl font-black text-cocoa">Products</h2>
          <button
            onClick={() => setForm(emptyForm)}
            className="btn-secondary !px-3 !py-2"
            title="New product"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {loading ? (
          <p className="p-5 font-bold text-cocoa/60">Loading products...</p>
        ) : error ? (
          <p className="p-5 text-sm font-bold text-rose-700">{error}</p>
        ) : (
          <div className="max-h-[760px] divide-y divide-orange-100 overflow-y-auto">
            {products.map((product) => (
              <div key={product.id} className="flex gap-3 p-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-orange-50">
                  <Image src={product.image} alt="" fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-black text-cocoa">{product.name}</p>
                  <p className="text-xs font-semibold text-cocoa/55">
                    {formatTk(product.price)}{product.discountActive ? " · discounted" : ""}
                  </p>
                  <p className="text-xs font-semibold text-cocoa/55">
                    {product.isActive ? "Visible" : "Hidden"} · Stock {product.stock} · {product.gallery?.length ?? 1} photo{(product.gallery?.length ?? 1) !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="grid content-start gap-2">
                  <button
                    onClick={() => setForm(formFromProduct(product))}
                    className="rounded-xl border border-orange-100 p-2 text-cocoa"
                    title="Edit product"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteProduct(product)}
                    className="rounded-xl border border-orange-100 p-2 text-rose-700"
                    title="Delete product"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <p className="p-5 font-bold text-cocoa/60">No products yet.</p>
            )}
          </div>
        )}
      </div>

      {/* ── Product Form ── */}
      <form
        onSubmit={saveProduct}
        className="grid gap-4 rounded-3xl border border-orange-100 bg-white p-6 shadow-soft"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-cocoa">
              {form.id ? "Edit product" : "New product"}
            </h2>
            <p className="mt-1 text-sm font-semibold text-cocoa/55">
              Product edits feed the shop, checkout pricing, and AI catalog.
            </p>
          </div>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm(emptyForm)}
              className="btn-secondary !px-3 !py-2"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {migrationNeeded && (
          <p className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-900">
            Run the updated Supabase schema before saving discounts or uploading product images.
          </p>
        )}

        {/* Basic fields */}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-black text-cocoa">
            Name
            <input
              required
              className="input"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </label>
          <label className="grid gap-2 text-sm font-black text-cocoa">
            Slug
            <input
              required
              className="input"
              placeholder="cat-toy-name"
              value={form.slug}
              onChange={(e) => update("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
            />
          </label>
          <label className="grid gap-2 text-sm font-black text-cocoa">
            Category
            <input
              required
              className="input"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            />
          </label>
          <label className="grid gap-2 text-sm font-black text-cocoa">
            Tagline
            <input
              className="input"
              value={form.tagline}
              onChange={(e) => update("tagline", e.target.value)}
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-black text-cocoa">
          Description
          <textarea
            required
            className="input min-h-28"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </label>

        {/* Pricing */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-2 text-sm font-black text-cocoa">
            Base price
            <input
              required
              min="0"
              step="0.01"
              type="number"
              className="input"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
            />
          </label>
          <label className="grid gap-2 text-sm font-black text-cocoa">
            Discount price
            <input
              min="0"
              step="0.01"
              type="number"
              className="input"
              value={form.discountPrice}
              onChange={(e) => update("discountPrice", e.target.value)}
            />
          </label>
          <label className="grid gap-2 text-sm font-black text-cocoa">
            Stock
            <input
              required
              min="0"
              type="number"
              className="input"
              value={form.stock}
              onChange={(e) => update("stock", e.target.value)}
            />
          </label>
          <label className="grid gap-2 text-sm font-black text-cocoa">
            Rating
            <input
              required
              min="0"
              max="5"
              step="0.1"
              type="number"
              className="input"
              value={form.rating}
              onChange={(e) => update("rating", e.target.value)}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-5 rounded-2xl bg-orange-50 p-4 text-sm font-black text-cocoa">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.discountActive}
              onChange={(e) => update("discountActive", e.target.checked)}
            />
            Discount on
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => update("isActive", e.target.checked)}
            />
            Visible in shop
          </label>
        </div>

        {/* ── Gallery Manager ── */}
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-cocoa">
              Product images
              <span className="ml-2 font-semibold text-cocoa/50">
                ({form.gallery.length} · first is main)
              </span>
            </p>
            <label className="btn-secondary cursor-pointer !px-4 !py-2 text-sm">
              {uploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ImagePlus className="h-4 w-4" /> Add images
                </span>
              )}
              <input
                ref={fileInputRef}
                disabled={uploading}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                multiple
                className="hidden"
                onChange={(e) => uploadImages(e.target.files)}
              />
            </label>
          </div>

          {form.gallery.length === 0 ? (
            /* Drop zone / empty state — clicking triggers the header input via ref */
            <label
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 p-10 text-center transition hover:border-cocoa hover:bg-orange-100"
              onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
            >
              <ImagePlus className="h-8 w-8 text-cocoa/40" />
              <span className="text-sm font-bold text-cocoa/50">
                Click or drag images here to upload
              </span>
            </label>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {form.gallery.map((url, index) => (
                <GalleryTile
                  key={url}
                  url={url}
                  index={index}
                  isMain={index === 0}
                  onRemove={removeGalleryImage}
                  onSetMain={setMainImage}
                />
              ))}
              {/* Inline upload tile */}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 transition hover:border-cocoa hover:bg-orange-100">
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-cocoa/50" />
                ) : (
                  <>
                    <ImagePlus className="h-5 w-5 text-cocoa/40" />
                    <span className="text-[10px] font-bold text-cocoa/40">Add more</span>
                  </>
                )}
                <input
                  disabled={uploading}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  multiple
                  className="hidden"
                  onChange={(e) => uploadImages(e.target.files)}
                />
              </label>
            </div>
          )}

          {/* Main image preview */}
          {mainImage && (
            <div className="flex items-center gap-3 rounded-2xl bg-orange-50 p-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                <Image src={mainImage} alt="Main product image" fill className="object-cover" />
              </div>
              <div>
                <p className="text-xs font-black text-cocoa">Main image</p>
                <p className="mt-0.5 break-all text-[10px] text-cocoa/50 line-clamp-2">{mainImage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Badges & Features */}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-black text-cocoa">
            Badges
            <textarea
              className="input min-h-24"
              placeholder="One badge per line"
              value={form.badges}
              onChange={(e) => update("badges", e.target.value)}
            />
          </label>
          <label className="grid gap-2 text-sm font-black text-cocoa">
            Features
            <textarea
              className="input min-h-24"
              placeholder="One feature per line"
              value={form.features}
              onChange={(e) => update("features", e.target.value)}
            />
          </label>
        </div>

        <button
          disabled={saving}
          className="btn-primary w-fit disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving…" : "Save product"}
        </button>
      </form>
    </section>
  );
}
