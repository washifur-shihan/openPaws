import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Cat, HeartHandshake, ShieldCheck, Sparkles, Truck } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { formatTk } from "@/lib/utils";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

const perks = [
  { icon: ShieldCheck, title: "Cat-safe picks", text: "Focused on soft, playful, indoor-friendly toys." },
  { icon: Truck, title: "BD delivery ready", text: "Simple checkout for Dhaka and outside Dhaka orders." },
  { icon: HeartHandshake, title: "Human support", text: "WhatsApp support and AI helper for quick questions." }
];

export default async function HomePage() {
  const products = await getProducts();
  const featured = products.slice(0, 4);
  const startingPrice = products.length ? Math.min(...products.map((product) => product.price)) : 0;
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-black text-cocoa shadow-sm">
              <Sparkles className="h-4 w-4 text-honey" /> Bangladesh's cozy cat toy corner
            </div>
            <h1 className="text-5xl font-black leading-tight tracking-tight text-cocoa sm:text-6xl lg:text-7xl">
              Better playtime for your cat, without the boring pet shop feel.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-cocoa/70">
              Discover our curated selection of cat toys designed for fun, safety, and style.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/products" className="btn-primary text-base">
                Shop cat toys <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/faq" className="btn-secondary text-base">Read FAQ</Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg">
              <div className="card p-4"><p className="text-2xl font-black text-cocoa">{products.length}</p><p className="text-xs font-bold text-cocoa/60">Products</p></div>
              <div className="card p-4"><p className="text-2xl font-black text-cocoa">{formatTk(startingPrice)}</p><p className="text-xs font-bold text-cocoa/60">Starting price</p></div>
              <div className="card p-4"><p className="text-2xl font-black text-cocoa">AI</p><p className="text-xs font-bold text-cocoa/60">Store helper</p></div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 -top-6 hidden rounded-full bg-honey/20 p-16 blur-2xl lg:block" />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-orange-100 bg-white p-4 shadow-soft">
              <div className="relative h-[540px] overflow-hidden rounded-[2rem] bg-orange-50">
                <Image src="https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=1400&auto=format&fit=crop" alt="Cat playing with toy" fill className="object-cover" priority />
              </div>
              <div className="absolute bottom-8 left-8 right-8 rounded-3xl bg-white/90 p-5 shadow-soft backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-black text-cocoa">Best Seller</p>
                    <p className="text-sm text-cocoa/60">Feather Teaser Wand</p>
                  </div>
                  <p className="rounded-2xl bg-orange-100 px-4 py-2 font-black text-cocoa">{formatTk(220)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {perks.map((perk) => (
            <div key={perk.title} className="card p-6">
              <perk.icon className="mb-5 h-9 w-9 text-honey" />
              <h3 className="text-xl font-black text-cocoa">{perk.title}</h3>
              <p className="mt-2 text-sm leading-6 text-cocoa/65">{perk.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-black uppercase tracking-wide text-orange-600"><Cat className="mr-2 inline h-4 w-4" /> Featured collection</p>
            <h2 className="text-4xl font-black text-cocoa">Toys cats actually chase</h2>
          </div>
          <Link href="/products" className="btn-secondary">View all toys</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="card overflow-hidden bg-cocoa text-white">
          <div className="grid items-center gap-8 p-8 lg:grid-cols-2 lg:p-12">
            <div>
              <BadgeCheck className="mb-5 h-10 w-10 text-honey" />
              <h2 className="text-4xl font-black">Built to get orders, not just look pretty.</h2>
              <p className="mt-4 leading-8 text-white/70">
                Every order goes into Supabase and can automatically append into Google Sheets. Admin can review orders and update status from the dashboard.
              </p>
            </div>
            <div className="rounded-3xl bg-white/10 p-6">
              <div className="grid gap-3 text-sm font-semibold text-white/80">
                <p>✓ Checkout form for cash-on-delivery style orders</p>
                <p>✓ Login/signup with Supabase Auth</p>
                <p>✓ Admin dashboard for orders</p>
                <p>✓ FastAPI chatbot endpoint ready for Render</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
