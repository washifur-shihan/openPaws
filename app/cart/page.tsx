"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatTk, getDeliveryFee } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const deliveryFee = items.length > 0 ? getDeliveryFee() : 0;
  const total = subtotal + deliveryFee;

  return (
    <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-5xl font-black text-cocoa">Your cart</h1>
        <p className="mt-3 text-cocoa/65">Review toys before checkout.</p>
      </div>

      {items.length === 0 ? (
        <div className="card p-10 text-center">
          <h2 className="text-2xl font-black text-cocoa">Your cart is empty</h2>
          <p className="mt-2 text-cocoa/60">Add some cat toys first.</p>
          <Link href="/products" className="btn-primary mt-6">Shop toys</Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="card flex gap-4 p-4">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-orange-50">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <Link href={`/products/${item.slug}`} className="text-lg font-black text-cocoa hover:text-orange-700">{item.name}</Link>
                    <p className="mt-1 font-bold text-cocoa/60">{formatTk(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="grid h-10 w-10 place-items-center rounded-full bg-orange-50"><Minus className="h-4 w-4" /></button>
                    <span className="w-6 text-center font-black text-cocoa">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="grid h-10 w-10 place-items-center rounded-full bg-orange-50"><Plus className="h-4 w-4" /></button>
                    <button onClick={() => removeItem(item.productId)} className="grid h-10 w-10 place-items-center rounded-full bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="card h-fit p-6">
            <h2 className="text-2xl font-black text-cocoa">Order summary</h2>
            <div className="mt-6 space-y-3 text-sm font-semibold text-cocoa/70">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatTk(subtotal)}</span></div>
              <div className="flex justify-between"><span>Delivery fee</span><span>{formatTk(deliveryFee)}</span></div>
              <div className="border-t border-orange-100 pt-3 text-lg font-black text-cocoa flex justify-between"><span>Total</span><span>{formatTk(total)}</span></div>
            </div>
            <Link href="/checkout" className="btn-primary mt-6 w-full">Checkout</Link>
          </aside>
        </div>
      )}
    </section>
  );
}
