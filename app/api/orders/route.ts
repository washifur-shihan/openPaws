import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getProductByIdFromSupabase } from "@/lib/products";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { appendOrderToGoogleSheet } from "@/lib/googleSheets";

export const runtime = "nodejs";

const itemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).max(20)
});

const requestSchema = z.object({
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(8),
    address: z.string().min(5),
    city: z.string().min(2),
    notes: z.string().optional().default("")
  }),
  items: z.array(itemSchema).min(1)
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const payload = requestSchema.parse(json);
    const supabase = getSupabaseAdmin();

    let userId: string | null = null;
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (token) {
      const { data } = await supabase.auth.getUser(token);
      userId = data.user?.id ?? null;
    }

    const normalizedItems = await Promise.all(payload.items.map(async (item) => {
      const product = await getProductByIdFromSupabase(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      return {
        product,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity
      };
    }));

    const subtotal = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const deliveryFee = Number(process.env.NEXT_PUBLIC_DELIVERY_FEE || 80);
    const total = subtotal + deliveryFee;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        customer_name: payload.customer.name,
        customer_email: payload.customer.email,
        phone: payload.customer.phone,
        address: payload.customer.address,
        city: payload.customer.city,
        notes: payload.customer.notes,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        status: "pending"
      })
      .select("id, created_at")
      .single();

    if (orderError || !order) throw orderError || new Error("Order insert failed");

    const orderItems = normalizedItems.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      line_total: item.lineTotal
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;

    const sheet = await appendOrderToGoogleSheet({
      orderId: order.id,
      createdAt: order.created_at,
      customerName: payload.customer.name,
      email: payload.customer.email,
      phone: payload.customer.phone,
      address: payload.customer.address,
      city: payload.customer.city,
      items: normalizedItems.map((item) => `${item.product.name} x ${item.quantity}`).join(", "),
      subtotal,
      deliveryFee,
      total,
      status: "pending",
      notes: payload.customer.notes
    }).catch((error) => ({ ok: false, reason: error instanceof Error ? error.message : "Sheet sync failed" }));

    if (!sheet.ok) {
      console.error("Google Sheets sync failed", sheet.reason);
    }

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      sheetSynced: sheet.ok,
      sheetError: sheet.ok ? undefined : sheet.reason
    });
  } catch (error) {
    const message = error instanceof z.ZodError
      ? error.errors.map((issue) => issue.message).join(", ")
      : error instanceof Error
        ? error.message
        : "Unable to place order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
