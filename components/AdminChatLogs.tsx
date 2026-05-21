"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquareText, RefreshCcw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type ChatLog = {
  id: string;
  user_id: string | null;
  customer_email: string | null;
  message: string;
  reply: string | null;
  created_at: string;
};

async function adminHeaders() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error("Admin login expired.");
  return { Authorization: `Bearer ${data.session.access_token}` };
}

export default function AdminChatLogs() {
  const [chats, setChats] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadChats() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/chats", { headers: await adminHeaders() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load chat logs.");
      setChats(data.chats || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load chat logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadChats();
  }, []);

  const groups = useMemo(() => {
    const grouped = new Map<string, ChatLog[]>();
    for (const chat of chats) {
      const key = chat.customer_email || chat.user_id || "Guest";
      grouped.set(key, [chat, ...(grouped.get(key) || [])]);
    }
    return Array.from(grouped.entries());
  }, [chats]);

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-100 px-6 py-5">
        <div>
          <p className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-orange-600"><MessageSquareText className="h-4 w-4" /> Customer chats</p>
          <h2 className="mt-1 text-2xl font-black text-cocoa">Chat history</h2>
        </div>
        <button onClick={loadChats} className="btn-secondary !px-4 !py-2.5"><RefreshCcw className="mr-2 h-4 w-4" /> Refresh</button>
      </div>

      {loading ? <p className="p-6 font-bold text-cocoa/60">Loading chats...</p> : error ? <p className="p-6 text-sm font-bold text-rose-700">{error}</p> : (
        <div className="grid gap-4 bg-orange-50/40 p-5 lg:grid-cols-2">
          {groups.map(([customer, logs]) => (
            <article key={customer} className="rounded-3xl border border-orange-100 bg-white p-5">
              <div className="mb-4 border-b border-orange-100 pb-4">
                <p className="truncate text-lg font-black text-cocoa">{customer}</p>
                <p className="text-xs font-bold text-cocoa/50">{logs.length} saved messages</p>
              </div>
              <div className="max-h-[440px] space-y-4 overflow-y-auto pr-1">
                {logs.map((chat) => (
                  <div key={chat.id} className="space-y-2 text-sm">
                    <p className="text-xs font-bold text-cocoa/45">{new Date(chat.created_at).toLocaleString()}</p>
                    <p className="rounded-2xl bg-cocoa px-4 py-3 font-semibold text-white">{chat.message}</p>
                    <p className="rounded-2xl bg-orange-50 px-4 py-3 font-semibold leading-6 text-cocoa/75">{chat.reply || "No reply stored."}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
          {groups.length === 0 && <p className="rounded-3xl bg-white p-6 font-bold text-cocoa/60">No chat history yet.</p>}
        </div>
      )}
    </section>
  );
}
