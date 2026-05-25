import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatTk } from "@/lib/utils";
import AddToCartButton from "@/components/AddToCartButton";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group card overflow-hidden">
      <Link href={`/products/${product.slug}`} className="relative block h-64 overflow-hidden bg-orange-50">
        <Image src={product.image} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {product.badges.slice(0, 2).map((badge) => (
            <span key={badge} className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-cocoa shadow-sm">{badge}</span>
          ))}
        </div>
      </Link>
      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-wide text-orange-600">{product.category}</p>
          <p className="flex items-center gap-1 text-sm font-black text-cocoa"><Star className="h-4 w-4 fill-honey text-honey" /> {product.rating}</p>
        </div>
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-lg font-black text-cocoa transition hover:text-orange-700">{product.name}</h3>
        </Link>
        <p className="mt-2 min-h-12 text-sm leading-6 text-cocoa/65">{product.tagline}</p>
        <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xl font-black text-cocoa">
            {formatTk(product.discountActive && product.discountPrice ? product.discountPrice : product.basePrice ?? product.price)}
          </p>

          {product.discountActive && product.basePrice && product.discountPrice && (
            <p className="text-xs font-semibold text-cocoa/45 line-through">
              {formatTk(product.basePrice)}
            </p>
          )}
        </div>
          <AddToCartButton product={product} className="!px-4 !py-2.5" />
        </div>
      </div>
    </article>
  );
}
