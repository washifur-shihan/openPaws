"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { ImagePlus, Pencil, Plus, Save, Trash2, X } from "lucide-react";
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
  image: string;
  gallery: string;
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
  image: "",
  gallery: "",
  badges: "",
  features: "",
  isActive: true
};

function lines(value: string) {
  return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
}

function formFromProduct(product: Product): ProductForm {
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
    image: product.image,
    gallery: product.gallery.join("\n"),
    badges: product.badges.join("\n"),
    features: product.features.join("\n"),
    isActive: product.isActive ?? true
  };
}

async function adminHeaders(json = false) {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error("Admin login expired.");
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${data.session.access_token}`
  };
}

export default function AdminProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [migrationNeeded, setMigrationNeeded] = useState(false);

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

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
        image: form.image,
        gallery: lines(form.gallery),
        badges: lines(form.badges),
        features: lines(form.features),
        isActive: form.isActive
      };
      const response = await fetch("/api/admin/products", {
        method: form.id ? "PATCH" : "POST",
        headers: await adminHeaders(true),
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Product save failed.");
      setProducts((current) => form.id
        ? current.map((product) => product.id === data.product.id ? data.product : product)
        : [data.product, ...current]);
      setForm(formFromProduct(data.product));
      toast.success(form.id ? "Product updated" : "Product created");
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Product save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    try {
      const response = await fetch(`/api/admin/products?id=${encodeURIComponent(product.id)}`, {
        method: "DELETE",
        headers: await adminHeaders()
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

  async function uploadImage(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const upload = new FormData();
      upload.set("file", file);
      const response = await fetch("/api/admin/products/upload", {
        method: "POST",
        headers: await adminHeaders(),
        body: upload
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Image upload failed.");
      setForm((current) => ({
        ...current,
        image: data.url,
        gallery: lines(current.gallery).includes(data.url)
          ? current.gallery
          : [data.url, ...lines(current.gallery)].join("\n")
      }));
      toast.success("Image uploaded");
    } catch (uploadError) {
      toast.error(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-orange-100 px-5 py-4">
          <h2 className="text-xl font-black text-cocoa">Products</h2>
          <button onClick={() => setForm(emptyForm)} className="btn-secondary !px-3 !py-2" title="New product">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {loading ? <p className="p-5 font-bold text-cocoa/60">Loading products...</p> : error ? <p className="p-5 text-sm font-bold text-rose-700">{error}</p> : (
          <div className="max-h-[760px] divide-y divide-orange-100 overflow-y-auto">
            {products.map((product) => (
              <div key={product.id} className="flex gap-3 p-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-orange-50">
                  <Image src={product.image} alt="" fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-black text-cocoa">{product.name}</p>
                  <p className="text-xs font-semibold text-cocoa/55">{formatTk(product.price)}{product.discountActive ? " discounted" : ""}</p>
                  <p className="text-xs font-semibold text-cocoa/55">{product.isActive ? "Visible" : "Hidden"} / Stock {product.stock}</p>
                </div>
                <div className="grid content-start gap-2">
                  <button onClick={() => setForm(formFromProduct(product))} className="rounded-xl border border-orange-100 p-2 text-cocoa" title="Edit product"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => deleteProduct(product)} className="rounded-xl border border-orange-100 p-2 text-rose-700" title="Delete product"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
            {products.length === 0 && <p className="p-5 font-bold text-cocoa/60">No products yet.</p>}
          </div>
        )}
      </div>

      <form onSubmit={saveProduct} className="grid gap-4 rounded-3xl border border-orange-100 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-cocoa">{form.id ? "Edit product" : "New product"}</h2>
            <p className="mt-1 text-sm font-semibold text-cocoa/55">Product edits feed the shop, checkout pricing, and AI catalog.</p>
          </div>
          {form.id && <button type="button" onClick={() => setForm(emptyForm)} className="btn-secondary !px-3 !py-2"><X className="h-4 w-4" /></button>}
        </div>
        {migrationNeeded && <p className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-900">Run the updated Supabase schema before saving discounts or uploading product images.</p>}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-black text-cocoa">Name<input required className="input" value={form.name} onChange={(event) => update("name", event.target.value)} /></label>
          <label className="grid gap-2 text-sm font-black text-cocoa">Slug<input required className="input" placeholder="cat-toy-name" value={form.slug} onChange={(event) => update("slug", event.target.value.toLowerCase().replace(/\s+/g, "-"))} /></label>
          <label className="grid gap-2 text-sm font-black text-cocoa">Category<input required className="input" value={form.category} onChange={(event) => update("category", event.target.value)} /></label>
          <label className="grid gap-2 text-sm font-black text-cocoa">Tagline<input className="input" value={form.tagline} onChange={(event) => update("tagline", event.target.value)} /></label>
        </div>

        <label className="grid gap-2 text-sm font-black text-cocoa">Description<textarea required className="input min-h-28" value={form.description} onChange={(event) => update("description", event.target.value)} /></label>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-2 text-sm font-black text-cocoa">Base price<input required min="0" step="0.01" type="number" className="input" value={form.price} onChange={(event) => update("price", event.target.value)} /></label>
          <label className="grid gap-2 text-sm font-black text-cocoa">Discount price<input min="0" step="0.01" type="number" className="input" value={form.discountPrice} onChange={(event) => update("discountPrice", event.target.value)} /></label>
          <label className="grid gap-2 text-sm font-black text-cocoa">Stock<input required min="0" type="number" className="input" value={form.stock} onChange={(event) => update("stock", event.target.value)} /></label>
          <label className="grid gap-2 text-sm font-black text-cocoa">Rating<input required min="0" max="5" step="0.1" type="number" className="input" value={form.rating} onChange={(event) => update("rating", event.target.value)} /></label>
        </div>

        <div className="flex flex-wrap gap-5 rounded-2xl bg-orange-50 p-4 text-sm font-black text-cocoa">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.discountActive} onChange={(event) => update("discountActive", event.target.checked)} /> Discount on</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(event) => update("isActive", event.target.checked)} /> Visible in shop</label>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_220px]">
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-black text-cocoa">Main image URL<input required type="url" className="input" value={form.image} onChange={(event) => update("image", event.target.value)} /></label>
            <label className="grid gap-2 text-sm font-black text-cocoa">Gallery image URLs<textarea className="input min-h-24" value={form.gallery} onChange={(event) => update("gallery", event.target.value)} /></label>
          </div>
          <div className="grid content-start gap-3">
            {form.image ? <div className="relative aspect-square overflow-hidden rounded-2xl bg-orange-50"><Image src={form.image} alt="" fill className="object-cover" /></div> : <div className="grid aspect-square place-items-center rounded-2xl bg-orange-50 text-sm font-bold text-cocoa/50">Image preview</div>}
            <label className="btn-secondary cursor-pointer">
              <ImagePlus className="mr-2 h-4 w-4" /> {uploading ? "Uploading..." : "Upload"}
              <input disabled={uploading} type="file" accept="image/png,image/jpeg,image/webp,image/avif" className="hidden" onChange={(event) => uploadImage(event.target.files?.[0])} />
            </label>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-black text-cocoa">Badges<textarea className="input min-h-24" value={form.badges} onChange={(event) => update("badges", event.target.value)} /></label>
          <label className="grid gap-2 text-sm font-black text-cocoa">Features<textarea className="input min-h-24" value={form.features} onChange={(event) => update("features", event.target.value)} /></label>
        </div>

        <button disabled={saving} className="btn-primary w-fit disabled:cursor-not-allowed disabled:opacity-60">
          <Save className="mr-2 h-4 w-4" /> {saving ? "Saving..." : "Save product"}
        </button>
      </form>
    </section>
  );
}
