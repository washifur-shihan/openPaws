import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function allowedAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function requireAdmin(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) throw new Error("Missing auth token");

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) throw new Error("Invalid session");

  const isAllowed = allowedAdminEmails().includes(data.user.email.toLowerCase());
  if (!isAllowed) throw new Error("You are not allowed to access admin dashboard");

  return { supabase, user: data.user };
}

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request);
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(product_name, quantity, unit_price, line_total)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ orders: data || [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"])
});

export async function PATCH(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request);
    const payload = updateSchema.parse(await request.json());
    const { data, error } = await supabase
      .from("orders")
      .update({ status: payload.status, updated_at: new Date().toISOString() })
      .eq("id", payload.id)
      .select("id, status")
      .single();
    if (error) throw error;
    return NextResponse.json({ order: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Update failed" }, { status: 400 });
  }
}
