"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { formatTk } from "@/lib/utils";

type Order = {
  id: string;
  created_at: string;
  customer_email: string;
  total: number;
  status: string;
  order_items?: { product_name: string; quantity: number }[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setSignedIn(false);
        setLoading(false);
        return;
      }
      setSignedIn(true);
      const { data } = await supabase
        .from("orders")
        .select("id, created_at, customer_email, total, status, order_items(product_name, quantity)")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });
      setOrders((data || []) as Order[]);
      setLoading(false);
    }
    loadOrders();
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-5xl font-black text-cocoa">My orders</h1>
      <p className="mt-3 text-cocoa/65">Logged-in customers can see their order history here.</p>
      <div className="mt-8">
        {loading ? <p className="font-bold text-cocoa/60">Loading...</p> : !signedIn ? (
          <div className="card p-8 text-center">
            <h2 className="text-2xl font-black text-cocoa">Login required</h2>
            <p className="mt-2 text-cocoa/60">Please login to view your orders.</p>
            <Link href="/auth" className="btn-primary mt-6">Login</Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="card p-8 text-center">
            <h2 className="text-2xl font-black text-cocoa">No orders yet</h2>
            <Link href="/products" className="btn-primary mt-6">Shop toys</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm font-black text-orange-700">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="mt-1 text-xl font-black text-cocoa">{formatTk(order.total)}</p>
                    <p className="text-sm font-semibold text-cocoa/50">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-black text-cocoa">{order.status}</span>
                </div>
                <div className="mt-4 grid gap-1 text-sm font-semibold text-cocoa/65">
                  {order.order_items?.map((item, index) => <p key={index}>{item.product_name} × {item.quantity}</p>)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
