"use client";

import { useEffect, useState } from "react";
import { Trophy, Search, CheckCircle2, X } from "lucide-react";
import toast from "react-hot-toast";

interface Participant {
  userId:  string;
  name:    string;
  email:   string;
  tickets: number[];
}

interface Props {
  raffleId: string;
}

export function WinnerPicker({ raffleId }: Props) {
  const [participants,        setParticipants]        = useState<Participant[]>([]);
  const [preselectedUserId,   setPreselectedUserId]   = useState<string | null>(null);
  const [preselectedTicketId, setPreselectedTicketId] = useState<string | null>(null);
  const [search,              setSearch]              = useState("");
  const [loading,             setLoading]             = useState(false);
  const [saving,              setSaving]              = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/raffles/${raffleId}/preselect`)
      .then((r) => r.json())
      .then((data) => {
        setParticipants(data.participants ?? []);
        setPreselectedUserId(data.preselectedUserId ?? null);
        setPreselectedTicketId(data.preselectedTicketId ?? null);
      })
      .finally(() => setLoading(false));
  }, [raffleId]);

  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  async function selectWinner(participant: Participant) {
    // Use their first ticket
    const ticketNumber = participant.tickets[0];
    setSaving(true);
    try {
      // We need the ticket ID — fetch it
      const res  = await fetch(`/api/admin/raffles/${raffleId}/preselect`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId: participant.userId, ticketNumber }),
      });
      if (!res.ok) throw new Error("Failed");
      setPreselectedUserId(participant.userId);
      toast.success(`✅ ${participant.name} set as winner`);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function clearWinner() {
    setSaving(true);
    await fetch(`/api/admin/raffles/${raffleId}/preselect`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ userId: null, ticketNumber: null }),
    });
    setPreselectedUserId(null);
    setPreselectedTicketId(null);
    setSaving(false);
    toast.success("Winner cleared — draw will be random");
  }

  const selectedParticipant = participants.find((p) => p.userId === preselectedUserId);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-gold-400" />
          <h3 className="font-bold text-white">Pre-select Winner</h3>
        </div>
        {preselectedUserId && (
          <button onClick={clearWinner} className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Selected winner banner */}
      {selectedParticipant && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-gold-500/30 bg-gold-500/10 px-4 py-3">
          <CheckCircle2 size={18} className="text-gold-400" />
          <div>
            <p className="text-sm font-bold text-gold-400">{selectedParticipant.name}</p>
            <p className="text-xs text-white/40">
              Ticket #{selectedParticipant.tickets[0]} · Will win the draw
            </p>
          </div>
        </div>
      )}

      {participants.length === 0 && !loading && (
        <p className="py-4 text-center text-sm text-white/30">
          No tickets sold yet — participants will appear here once people buy tickets
        </p>
      )}

      {participants.length > 0 && (
        <>
          <p className="mb-3 text-xs text-white/40">
            Select who wins. The slot machine animation will always land on this person.
          </p>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/20 outline-none focus:border-gold-500/40"
            />
          </div>

          {/* Participant list */}
          <div className="max-h-64 overflow-y-auto rounded-xl border border-white/5">
            {filtered.map((p, i) => {
              const isSelected = p.userId === preselectedUserId;
              return (
                <button
                  key={p.userId}
                  onClick={() => selectWinner(p)}
                  disabled={saving}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-white/5 ${
                    i < filtered.length - 1 ? "border-b border-white/5" : ""
                  } ${isSelected ? "bg-gold-500/5" : ""}`}
                >
                  <div>
                    <p className="text-sm font-medium text-white">{p.name}</p>
                    <p className="text-xs text-white/30">
                      {p.tickets.length} ticket{p.tickets.length > 1 ? "s" : ""} · #{p.tickets.slice(0, 3).join(", #")}
                      {p.tickets.length > 3 ? "…" : ""}
                    </p>
                  </div>
                  {isSelected && <CheckCircle2 size={16} className="text-gold-400" />}
                </button>
              );
            })}
          </div>
        </>
      )}

      {loading && (
        <div className="py-8 text-center text-sm text-white/30">Loading participants…</div>
      )}
    </div>
  );
}
