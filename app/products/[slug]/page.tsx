import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, Star } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import { getProductBySlugFromSupabase, getProducts } from "@/lib/products";
import { formatTk, getDeliveryFee, getDeliveryFeeOutside } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlugFromSupabase(slug);
  return { title: product ? `${product.name} | OpenPaws` : "Product" };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, products] = await Promise.all([
    getProductBySlugFromSupabase(slug),
    getProducts()
  ]);

  if (!product) notFound();

  const related = products.filter((item) => item.id !== product.id).slice(0, 3);
  const deliveryFee = getDeliveryFee();
  const deliveryFeeOutside = getDeliveryFeeOutside();

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2">
        <ProductGallery images={product.gallery} name={product.name} />

        <div>
          <Link href="/products" className="text-sm font-black text-orange-700">
            ← Back to products
          </Link>

          <div className="mt-5 flex flex-wrap gap-2">
            {product.badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-cocoa"
              >
                {badge}
              </span>
            ))}
          </div>

          <h1 className="mt-5 text-5xl font-black leading-tight text-cocoa">
            {product.name}
          </h1>

          <p className="mt-4 text-lg leading-8 text-cocoa/70">
            {product.description}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <p className="text-4xl font-black text-cocoa">
              {formatTk(product.discountActive && product.discountPrice ? product.discountPrice : product.basePrice ?? product.price)}
            </p>

            {product.discountActive && product.basePrice && product.discountPrice && (
              <p className="text-lg font-bold text-cocoa/40 line-through">
                {formatTk(product.basePrice)}
              </p>
            )}

            <p className="ml-auto flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-black text-cocoa shadow-sm">
              <Star className="h-4 w-4 fill-honey text-honey" /> {product.rating}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <AddToCartButton product={product} className="text-base" />
            <Link href="/checkout" className="btn-secondary text-base">
              Go to checkout
            </Link>
          </div>

          <div className="mt-8 grid gap-3 rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
            <p className="font-black text-cocoa">Why cats like it</p>

            {product.features.map((feature) => (
              <p
                key={feature}
                className="flex items-center gap-3 text-sm font-semibold text-cocoa/70"
              >
                <Check className="h-5 w-5 text-honey" /> {feature}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <details className="group rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xl font-black text-cocoa [&::-webkit-details-marker]:hidden">
              Delivery details
              <span className="text-2xl leading-none transition group-open:rotate-180">
                ⌄
              </span>
            </summary>

            <div className="mt-4 space-y-3 text-sm font-semibold leading-7 text-cocoa/70">
              <p>
                Orders are confirmed by phone or WhatsApp before dispatch.
              </p>
              <p>
                Please provide an active phone number and a complete delivery address during checkout.
              </p>
              <p>
                Delivery is available inside Bangladesh. Courier timing may vary depending on your area.
              </p>
            </div>
          </details>

          <details className="group rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xl font-black text-cocoa [&::-webkit-details-marker]:hidden">
              Delivery charges
              <span className="text-2xl leading-none transition group-open:rotate-180">
                ⌄
              </span>
            </summary>

            <div className="mt-4 space-y-3 text-sm font-semibold leading-7 text-cocoa/70">
              <p>
                Current delivery charge inside Dhaka:{" "}
                <span className="font-black text-cocoa">
                  {formatTk(deliveryFee)}
                </span>
              </p>
              <p>
                Current delivery charge outside Dhaka:{" "}
                <span className="font-black text-cocoa">
                  {formatTk(deliveryFeeOutside)}
                </span>
              </p>
              <p>
                The delivery fee is added once per order during cart and checkout.
              </p>
            </div>
          </details>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-cocoa">Description</h2>

            <p className="mt-4 text-sm font-semibold leading-7 text-cocoa/70">
              {product.description || "No product description has been added yet."}
            </p>

            {product.features.length > 0 && (
              <div className="mt-5 grid gap-3">
                {product.features.map((feature) => (
                  <p
                    key={feature}
                    className="flex items-center gap-3 text-sm font-semibold text-cocoa/70"
                  >
                    <Check className="h-5 w-5 text-honey" /> {feature}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-cocoa">Review</h2>

            <div className="mt-4 flex items-center gap-2">
              <Star className="h-5 w-5 fill-honey text-honey" />
              <span className="text-lg font-black text-cocoa">
                {product.rating}/5
              </span>
            </div>

            <p className="mt-3 text-sm font-semibold leading-7 text-cocoa/70">
              No written reviews yet. Be the first to review this product after ordering.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <h2 className="mb-8 text-3xl font-black text-cocoa">
          More toys to explore
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </section>
  );
}