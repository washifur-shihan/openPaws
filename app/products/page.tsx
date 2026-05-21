import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

export const metadata = { title: "Shop Cat Toys | OpenPaws" };

export default function ProductsPage() {
  const categories = Array.from(new Set(products.map((product) => product.category)));
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-3xl">
        <p className="mb-2 text-sm font-black uppercase tracking-wide text-orange-600">Shop toys</p>
        <h1 className="text-5xl font-black text-cocoa">Cat toys for curious paws</h1>
        <p className="mt-4 text-lg leading-8 text-cocoa/70">
          Start with a focused catalog. Replace these starter products with your real items from Supabase when you are ready.
        </p>
      </div>
      <div className="mb-8 flex gap-3 overflow-x-auto no-scrollbar">
        <span className="rounded-full bg-cocoa px-5 py-2 text-sm font-black text-white">All</span>
        {categories.map((category) => <span key={category} className="rounded-full border border-orange-200 bg-white px-5 py-2 text-sm font-black text-cocoa">{category}</span>)}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
