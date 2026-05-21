"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/components/CartProvider";
import { formatTk, getDeliveryFee } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "Dhaka", notes: "" });
  const deliveryFee = items.length > 0 ? getDeliveryFee() : 0;
  const total = useMemo(() => subtotal + deliveryFee, [subtotal, deliveryFee]);

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ customer: form, items })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Order failed");
      clearCart();
      if (result.sheetSynced === false) {
        toast.error(`Order saved, but Google Sheets did not update: ${result.sheetError || "sync failed"}`);
      } else {
        toast.success("Order placed successfully!");
      }
      router.push(`/orders?created=${result.orderId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-5xl font-black text-cocoa">Checkout</h1>
        <p className="mt-3 text-cocoa/65">Cash-on-delivery style order form. Order will save to Supabase and Google Sheets.</p>
      </div>
      {items.length === 0 ? (
        <div className="card p-10 text-center">
          <h2 className="text-2xl font-black text-cocoa">No products selected</h2>
          <Link href="/products" className="btn-primary mt-6">Shop now</Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <form onSubmit={submitOrder} className="card grid gap-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-black text-cocoa">Full name<input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <label className="grid gap-2 text-sm font-black text-cocoa">Email<input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-black text-cocoa">Phone<input required className="input" placeholder="01XXXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
              <label className="grid gap-2 text-sm font-black text-cocoa">City<input required className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
            </div>
            <label className="grid gap-2 text-sm font-black text-cocoa">Full delivery address<textarea required className="input min-h-28" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
            <label className="grid gap-2 text-sm font-black text-cocoa">Order notes<textarea className="input min-h-24" placeholder="Optional" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
            <button disabled={loading} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Placing order..." : `Place order ${formatTk(total)}`}</button>
          </form>

          <aside className="card h-fit p-6">
            <h2 className="text-2xl font-black text-cocoa">Your order</h2>
            <div className="mt-5 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between gap-4 text-sm">
                  <span className="font-bold text-cocoa/70">{item.name} × {item.quantity}</span>
                  <span className="font-black text-cocoa">{formatTk(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3 border-t border-orange-100 pt-4 text-sm font-semibold text-cocoa/70">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatTk(subtotal)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{formatTk(deliveryFee)}</span></div>
              <div className="flex justify-between text-lg font-black text-cocoa"><span>Total</span><span>{formatTk(total)}</span></div>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
