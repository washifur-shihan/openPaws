"use client";

import type { Product } from "@/lib/types";
import { useCart } from "@/components/CartProvider";
import { ShoppingBag } from "lucide-react";

export default function AddToCartButton({ product, className = "" }: { product: Product; className?: string }) {
  const { addItem } = useCart();
  return (
    <button onClick={() => addItem(product)} className={`btn-primary ${className}`}>
      <ShoppingBag className="mr-2 h-4 w-4" /> Add to cart
    </button>
  );
}
