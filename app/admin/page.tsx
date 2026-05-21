"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Lock, PackageCheck, RefreshCcw, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { formatTk } from "@/lib/utils";
import AdminProductManager from "@/components/AdminProductManager";

type AdminOrder = {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  phone: string;
  address: string;
  city: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  notes?: string;
  order_items?: { product_name: string; quantity: number; unit_price: number; line_total: number }[];
};

const statuses = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"];

export default function AdminPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadOrders() {
    setLoading(true);
    setError(null);
    const { data: sessionData } = await supabase.auth.getSession();
    setEmail(sessionData.session?.user.email || null);
    if (!sessionData.session) {
      setError("Please login first. Admin access is allowed only for ADMIN_EMAILS.");
      setLoading(false);
      return;
    }
    const response = await fetch("/api/admin/orders", {
      headers: { Authorization: `Bearer ${sessionData.session.access_token}` }
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to load admin orders");
      setLoading(false);
      return;
    }
    setOrders(data.orders || []);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(id: string, status: string) {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return;
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionData.session.access_token}`
      },
      body: JSON.stringify({ id, status })
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error || "Status update failed");
      return;
    }
    setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order));
    toast.success("Order status updated");
  }

  const stats = useMemo(() => {
    const totalSales = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const customers = new Set(orders.map((order) => order.customer_email)).size;
    return { totalSales, customers, totalOrders: orders.length };
  }, [orders]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-orange-600"><Lock className="h-4 w-4" /> Admin dashboard</p>
          <h1 className="text-5xl font-black text-cocoa">Orders overview</h1>
          {email && <p className="mt-3 text-sm font-semibold text-cocoa/60">Logged in as {email}</p>}
        </div>
        <button onClick={loadOrders} className="btn-secondary"><RefreshCcw className="mr-2 h-4 w-4" /> Refresh</button>
      </div>

      {loading ? <p className="font-bold text-cocoa/60">Loading...</p> : error ? (
        <div className="card p-8 text-center">
          <h2 className="text-2xl font-black text-cocoa">Admin access needed</h2>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-cocoa/65">{error}</p>
          <Link href="/auth" className="btn-primary mt-6">Login</Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card p-6"><PackageCheck className="mb-4 h-8 w-8 text-honey" /><p className="text-sm font-black text-cocoa/50">Total orders</p><p className="text-3xl font-black text-cocoa">{stats.totalOrders}</p></div>
            <div className="card p-6"><TrendingUp className="mb-4 h-8 w-8 text-honey" /><p className="text-sm font-black text-cocoa/50">Revenue</p><p className="text-3xl font-black text-cocoa">{formatTk(stats.totalSales)}</p></div>
            <div className="card p-6"><Users className="mb-4 h-8 w-8 text-honey" /><p className="text-sm font-black text-cocoa/50">Customers</p><p className="text-3xl font-black text-cocoa">{stats.customers}</p></div>
          </div>

          <AdminProductManager />

          <div className="mt-8 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-soft">
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-left text-sm">
                <thead className="bg-orange-50 text-cocoa">
                  <tr>
                    <th className="px-5 py-4 font-black">Order</th>
                    <th className="px-5 py-4 font-black">Customer</th>
                    <th className="px-5 py-4 font-black">Items</th>
                    <th className="px-5 py-4 font-black">Address</th>
                    <th className="px-5 py-4 font-black">Total</th>
                    <th className="px-5 py-4 font-black">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="align-top">
                      <td className="px-5 py-4">
                        <p className="font-black text-cocoa">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="mt-1 text-xs font-semibold text-cocoa/50">{new Date(order.created_at).toLocaleString()}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-black text-cocoa">{order.customer_name}</p>
                        <p className="text-cocoa/60">{order.customer_email}</p>
                        <p className="text-cocoa/60">{order.phone}</p>
                      </td>
                      <td className="px-5 py-4">
                        {order.order_items?.map((item, index) => <p key={index} className="font-semibold text-cocoa/70">{item.product_name} × {item.quantity}</p>)}
                      </td>
                      <td className="max-w-xs px-5 py-4 font-semibold text-cocoa/65">{order.address}, {order.city}</td>
                      <td className="px-5 py-4 font-black text-cocoa">{formatTk(order.total)}</td>
                      <td className="px-5 py-4">
                        <select value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)} className="rounded-2xl border border-orange-100 bg-orange-50 px-3 py-2 font-black text-cocoa outline-none">
                          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center font-bold text-cocoa/60">No orders yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
