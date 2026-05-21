import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request);
    const { data, error } = await supabase
      .from("chat_logs")
      .select("id, user_id, customer_email, message, reply, created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw error;
    return NextResponse.json({ chats: data || [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load chats" }, { status: 401 });
  }
}
