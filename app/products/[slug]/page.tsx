import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, Star } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import { getProductBySlugFromSupabase, getProducts } from "@/lib/products";
import { formatTk } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlugFromSupabase(slug);
  return { title: product ? `${product.name} | OpenPaws` : "Product" };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, products] = await Promise.all([getProductBySlugFromSupabase(slug), getProducts()]);
  if (!product) notFound();
  const related = products.filter((item) => item.id !== product.id).slice(0, 3);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2">
        <ProductGallery images={product.gallery} name={product.name} />
        <div>
          <Link href="/products" className="text-sm font-black text-orange-700">← Back to products</Link>
          <div className="mt-5 flex flex-wrap gap-2">
            {product.badges.map((badge) => <span key={badge} className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-cocoa">{badge}</span>)}
          </div>
          <h1 className="mt-5 text-5xl font-black leading-tight text-cocoa">{product.name}</h1>
          <p className="mt-4 text-lg leading-8 text-cocoa/70">{product.description}</p>
          <div className="mt-6 flex items-center gap-4">
            <p className="text-4xl font-black text-cocoa">{formatTk(product.price)}</p>
            {product.compareAtPrice && <p className="text-lg font-bold text-cocoa/40 line-through">{formatTk(product.compareAtPrice)}</p>}
            <p className="ml-auto flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-black text-cocoa shadow-sm"><Star className="h-4 w-4 fill-honey text-honey" /> {product.rating}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <AddToCartButton product={product} className="text-base" />
            <Link href="/checkout" className="btn-secondary text-base">Go to checkout</Link>
          </div>
          <div className="mt-8 grid gap-3 rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
            <p className="font-black text-cocoa">Why cats like it</p>
            {product.features.map((feature) => (
              <p key={feature} className="flex items-center gap-3 text-sm font-semibold text-cocoa/70"><Check className="h-5 w-5 text-honey" /> {feature}</p>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-20">
        <h2 className="mb-8 text-3xl font-black text-cocoa">More toys to explore</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item) => <ProductCard key={item.id} product={item} />)}
        </div>
      </div>
    </section>
  );
}
