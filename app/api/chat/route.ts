import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const message = String(body.message || "").trim();
  if (!message) return NextResponse.json({ reply: "Please write a message first." });

  const fastApiUrl = process.env.FASTAPI_CHAT_URL;
  if (fastApiUrl) {
    try {
      const response = await fetch(fastApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store"
      });
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ reply: data.reply || data.message || "I am here to help." });
      }
    } catch {
      // Fall through to local fallback below.
    }
  }

  const lower = message.toLowerCase();
  let reply = "For most cats, start with a feather wand or rolling bell balls. They are affordable, active, and good for indoor play. You can place an order from the product page.";
  if (lower.includes("delivery") || lower.includes("dhaka")) {
    reply = "We support Bangladesh delivery. Dhaka delivery fee is configurable in the website env. After checkout, the order goes to admin dashboard and Google Sheet.";
  } else if (lower.includes("kitten")) {
    reply = "For kittens, choose soft lightweight toys like feather wand, plush mouse, or small rolling balls. Avoid tiny detachable parts during unsupervised play.";
  } else if (lower.includes("price") || lower.includes("cheap")) {
    reply = "The budget-friendly starter choices are Rolling Bell Ball Set and Catnip Mouse Toy. You can see exact prices on the Shop page.";
  }
  return NextResponse.json({ reply });
}
