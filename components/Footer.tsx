import Link from "next/link";
import { Cat, Facebook, Instagram, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-orange-100 bg-white/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cocoa text-white"><Cat /></span>
            <div>
              <p className="font-black text-cocoa">OpenPaws</p>
              <p className="text-sm text-cocoa/60">Playful toys for happy indoor cats.</p>
            </div>
          </div>
          <p className="max-w-md text-sm leading-7 text-cocoa/70">
            A small Bangladesh-based pet store focused only on cat toys. We help cat parents choose safe, affordable, and fun toys for daily play.
          </p>
        </div>
        <div>
          <p className="mb-4 font-black text-cocoa">Shop</p>
          <div className="grid gap-2 text-sm font-semibold text-cocoa/70">
            <Link href="/products">All Toys</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/checkout">Checkout</Link>
            <Link href="/orders">My Orders</Link>
          </div>
        </div>
        <div>
          <p className="mb-4 font-black text-cocoa">Support</p>
          <div className="grid gap-2 text-sm font-semibold text-cocoa/70">
            <Link href="/faq">FAQ</Link>
            <Link href="/policies">Delivery & Return</Link>
            <a className="flex items-center gap-2" href="https://wa.me/8801700000000" target="_blank"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
            <span className="flex gap-3 pt-2"><Facebook className="h-5 w-5" /><Instagram className="h-5 w-5" /></span>
          </div>
        </div>
      </div>
      <div className="border-t border-orange-100 py-5 text-center text-xs font-semibold text-cocoa/60">
        © {new Date().getFullYear()} OpenPaws. Built for Vercel + Supabase.
      </div>
    </footer>
  );
}
