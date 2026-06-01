"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim() }),
      });
      // Always show success (don't reveal if email exists)
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-black">
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Planet</span>
            <span className="text-white"> Raffle</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-white">Forgot your password?</h1>
          <p className="mt-1 text-sm text-white/40">Enter your email and we'll send you a reset link</p>
        </div>

        {sent ? (
          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 text-center">
            <CheckCircle2 size={40} className="mx-auto mb-3 text-green-400" />
            <h2 className="text-lg font-bold text-white">Check your email</h2>
            <p className="mt-2 text-sm text-white/50">
              If an account exists for <strong className="text-white">{email}</strong>, we've sent a password reset link. It expires in 1 hour.
            </p>
            <p className="mt-3 text-xs text-white/30">
              Didn't get it? Check your spam folder or{" "}
              <button onClick={() => setSent(false)} className="text-gold-400 hover:underline">try again</button>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/70">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/20 outline-none transition focus:border-gold-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-white/40">
          <ArrowLeft size={14} />
          <Link href="/login" className="text-gold-400 transition hover:text-gold-300">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
