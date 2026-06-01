"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import toast from "react-hot-toast";

interface Announcement {
  id:        string;
  message:   string;
  type:      string;
  createdAt: string;
}

const TYPE_OPTIONS = [
  { value: "GENERAL",       label: "General" },
  { value: "MILESTONE",     label: "Milestone" },
  { value: "NEW_RAFFLE",    label: "New Raffle" },
  { value: "DRAW_STARTING", label: "Draw Starting" },
  { value: "WINNER",        label: "Winner" },
];

const FIELD = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-gold-500/40";

export default function AnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [message,  setMessage]  = useState("");
  const [type,     setType]     = useState("GENERAL");
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);

  async function load() {
    setFetching(true);
    const res  = await fetch("/api/admin/announcements");
    if (res.status === 401) { router.push("/admin/login"); return; }
    const data = await res.json();
    setAnnouncements(Array.isArray(data) ? data : []);
    setFetching(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: message.trim(), type }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Announcement broadcast live!");
      setMessage("");
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this announcement?")) return;
    await fetch("/api/admin/announcements", {
      method:  "DELETE",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id }),
    });
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    toast.success("Deleted");
  }

  return (
    <div className="min-h-screen bg-[#030303]">
      <AdminHeader title="Announcements" backHref="/admin" />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-6">

        {/* Create form */}
        <div className="rounded-2xl border border-white/5 bg-[#111] p-6">
          <h2 className="mb-4 text-lg font-bold text-white">Broadcast Announcement</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/60">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. 🎉 New raffle going live in 10 minutes!"
                rows={3}
                maxLength={300}
                className={`${FIELD} resize-none`}
              />
              <p className="mt-1 text-right text-xs text-white/20">{message.length}/300</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/60">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className={`${FIELD} cursor-pointer`}>
                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <><Send size={16} /> Broadcast Live</>}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="rounded-2xl border border-white/5 bg-[#111]">
          <div className="border-b border-white/5 px-6 py-4">
            <h2 className="font-bold text-white">Recent Announcements</h2>
          </div>

          {fetching ? (
            <div className="py-12 text-center text-sm text-white/30">Loading…</div>
          ) : announcements.length === 0 ? (
            <div className="py-12 text-center text-sm text-white/30">No announcements yet</div>
          ) : (
            <div className="divide-y divide-white/5">
              {announcements.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-4 px-6 py-4">
                  <div className="flex-1">
                    <p className="text-sm text-white/80">{a.message}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/30">
                        {a.type}
                      </span>
                      <span className="text-xs text-white/20">
                        {new Date(a.createdAt).toLocaleString("en-GB")}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="shrink-0 rounded-lg p-1.5 text-white/20 transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
