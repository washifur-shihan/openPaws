"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const result = mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
      if (result.error) throw result.error;
      toast.success(mode === "login" ? "Logged in successfully" : "Signup successful. Check email if confirmation is enabled.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    toast.success("Logged out");
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="card p-8">
        <h1 className="text-4xl font-black text-cocoa">Customer account</h1>
        <p className="mt-3 leading-7 text-cocoa/65">Login to see orders. Admin dashboard access is controlled by your email in ADMIN_EMAILS.</p>

        {user ? (
          <div className="mt-8 rounded-3xl bg-orange-50 p-6">
            <p className="text-sm font-bold text-cocoa/60">Signed in as</p>
            <p className="mt-1 text-xl font-black text-cocoa">{user.email}</p>
            <button onClick={logout} className="btn-primary mt-6">Logout</button>
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 rounded-2xl bg-orange-50 p-1">
              <button onClick={() => setMode("login")} className={`rounded-xl py-3 text-sm font-black ${mode === "login" ? "bg-white text-cocoa shadow-sm" : "text-cocoa/50"}`}>Login</button>
              <button onClick={() => setMode("signup")} className={`rounded-xl py-3 text-sm font-black ${mode === "signup" ? "bg-white text-cocoa shadow-sm" : "text-cocoa/50"}`}>Signup</button>
            </div>
            <form onSubmit={submit} className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-black text-cocoa">Email<input className="input" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
              <label className="grid gap-2 text-sm font-black text-cocoa">Password<input className="input" type="password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
              <button disabled={loading} className="btn-primary disabled:opacity-60">{loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}</button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
