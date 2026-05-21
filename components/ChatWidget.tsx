"use client";

import { useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I can help you choose cat toys, delivery options, or order support." }
  ]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: nextMessages.slice(-8) })
      });
      const data = await response.json();
      setMessages((current) => [...current, { role: "assistant", content: data.reply || "Sorry, I could not answer that right now." }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "I am having trouble connecting. Please message us on WhatsApp." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-4 w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-soft">
          <div className="flex items-center justify-between bg-cocoa px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15"><Bot className="h-5 w-5" /></span>
              <div>
                <p className="font-black">OpenPaws AI Helper</p>
                <p className="text-xs text-white/70">Cat toy suggestions & support</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
          </div>
          <div className="h-80 space-y-3 overflow-y-auto bg-cream/60 p-4">
            {messages.map((message, index) => (
              <div key={index} className={message.role === "user" ? "text-right" : "text-left"}>
                <span className={`inline-block max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-cocoa text-white" : "bg-white text-cocoa shadow-sm"}`}>
                  {message.content}
                </span>
              </div>
            ))}
            {loading && <p className="text-xs font-bold text-cocoa/50">AI is typing...</p>}
          </div>
          <div className="flex gap-2 border-t border-orange-100 p-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && sendMessage()}
              placeholder="Ask about cat toys..."
              className="input !py-2"
            />
            <button onClick={sendMessage} className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cocoa text-white">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen((value) => !value)} className="flex items-center gap-2 rounded-full bg-cocoa px-5 py-4 font-black text-white shadow-glow">
        <Sparkles className="h-5 w-5" /> Chat
      </button>
    </div>
  );
}
