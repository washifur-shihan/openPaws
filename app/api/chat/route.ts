import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/products";

export const runtime = "nodejs";

type ChatMessage = {
  role?: unknown;
  content?: unknown;
};

type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
  error?: {
    message?: string;
  };
};

function buildGeminiContents(message: string, history: unknown) {
  const recentHistory = Array.isArray(history) ? history.slice(-8) as ChatMessage[] : [];
  const contents = recentHistory
    .filter((entry) =>
      (entry.role === "user" || entry.role === "assistant") &&
      typeof entry.content === "string" &&
      entry.content.trim()
    )
    .map((entry) => ({
      role: entry.role === "assistant" ? "model" : "user",
      parts: [{ text: String(entry.content).trim().slice(0, 1200) }]
    }));

  const lastEntry = contents.at(-1);
  if (lastEntry?.role !== "user" || lastEntry.parts[0]?.text !== message) {
    contents.push({ role: "user", parts: [{ text: message }] });
  }

  return contents;
}

async function getGeminiReply(message: string, history: unknown) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const catalogContext = (await getProducts()).map((product) => ({
    name: product.name,
    category: product.category,
    priceBdt: product.price,
    compareAtPriceBdt: product.compareAtPrice,
    stock: product.stock,
    description: product.description,
    features: product.features,
    productPath: `/products/${product.slug}`
  }));
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{
            text: [
              "You are the OpenPaws shopping assistant for cat toys.",
              "Answer customers using only the OpenPaws catalog and the store facts in this instruction.",
              "Be friendly, concise, and practical. Recommend specific catalog products when useful.",
              "Never invent products, prices, stock, policies, discounts, delivery times, or order status.",
              "If the catalog does not answer a product question, say you do not have that detail yet and suggest contacting OpenPaws support.",
              "For checkout questions, say customers can add items to cart and place an order from checkout.",
              "For delivery questions, say OpenPaws supports Bangladesh delivery and order confirmation can happen by phone or WhatsApp.",
              "Catalog data:",
              JSON.stringify(catalogContext)
            ].join("\n")
          }]
        },
        contents: buildGeminiContents(message, history),
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 350
        }
      }),
      cache: "no-store"
    }
  );

  const data = await response.json() as GeminiResponse;
  if (!response.ok) {
    throw new Error(data.error?.message || "Gemini response failed");
  }

  const reply = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  return reply || null;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const message = String(body.message || "").trim();
  if (!message) return NextResponse.json({ reply: "Please write a message first." });

  try {
    const geminiReply = await getGeminiReply(message, body.history);
    if (geminiReply) {
      return NextResponse.json({ reply: geminiReply });
    }
  } catch (error) {
    console.error("Gemini chat failed", error);
  }

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
