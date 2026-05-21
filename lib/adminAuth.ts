import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function allowedAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireAdmin(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) throw new Error("Missing auth token");

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) throw new Error("Invalid session");

  const isAllowed = allowedAdminEmails().includes(data.user.email.toLowerCase());
  if (!isAllowed) throw new Error("You are not allowed to access admin dashboard");

  return { supabase, user: data.user };
}
