"use client";

import Link from "next/link";
import { Cat, Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";

const navItems = [
  { href: "/products", label: "Shop" },
  { href: "/faq", label: "FAQ" },
  { href: "/orders", label: "My Orders" },
  { href: "/admin", label: "Admin" }
];

export default function Navbar() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-orange-100 bg-cream/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cocoa text-white shadow-glow">
            <Cat className="h-6 w-6" />
          </span>
          <div>
            <p className="text-base font-black leading-none text-cocoa">OpenPaws</p>
            <p className="text-xs font-semibold text-orange-700">Cat toys</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-bold text-cocoa/75 transition hover:text-cocoa">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/auth" className="btn-secondary !px-4 !py-2.5">
            <UserRound className="mr-2 h-4 w-4" /> Login
          </Link>
          <Link href="/cart" className="btn-primary !px-4 !py-2.5">
            <ShoppingBag className="mr-2 h-4 w-4" /> Cart {count > 0 ? `(${count})` : ""}
          </Link>
        </div>

        <button className="rounded-2xl border border-orange-100 bg-white p-3 md:hidden" onClick={() => setOpen((value) => !value)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-orange-100 bg-cream px-4 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-cocoa">
                {item.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/auth" className="btn-secondary">Login</Link>
              <Link href="/cart" className="btn-primary">Cart {count > 0 ? `(${count})` : ""}</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
