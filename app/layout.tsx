import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/components/CartProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "OpenPaws | Premium Cat Toys",
  description: "Shop playful, safe, and affordable cat toys for kittens and adult cats in Bangladesh.",
  metadataBase: new URL("https://openpaws.vercel.app")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <ChatWidget />
          <Toaster position="top-right" />
        </CartProvider>
      </body>
    </html>
  );
}
