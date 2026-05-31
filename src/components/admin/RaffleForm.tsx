"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const schema = z.object({
  title:        z.string().min(3),
  description:  z.string().min(10),
  imageUrl:     z.string().url("Enter a valid URL").or(z.literal("")),
  totalTickets: z.coerce.number().int().min(10).max(100000),
  ticketPrice:  z.coerce.number().min(0.5).max(100),
  drawTime:     z.string().min(1, "Select a draw time"),
  status:       z.enum(["DRAFT", "ACTIVE", "CANCELLED"]),
});
type FormData = z.infer<typeof schema>;

interface Props {
  raffle?: FormData & { id: string };
}

const FIELD = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-gold-500/40";

export function RaffleForm({ raffle }: Props) {
  const router  = useRouter();
  const isEdit  = !!raffle?.id;
  const [loading, setLoading] = useState(false);

  const defaultDrawTime = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(23, 11, 0, 0);
    return d.toISOString().slice(0, 16);
  })();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: raffle ?? {
      title:        "",
      description:  "",
      imageUrl:     "",
      totalTickets: 1000,
      ticketPrice:  1,
      drawTime:     defaultDrawTime,
      status:       "DRAFT",
    },
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const url    = isEdit ? `/api/admin/raffles/${raffle!.id}` : "/api/admin/raffles";
      const method = isEdit ? "PATCH" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      toast.success(isEdit ? "Raffle updated!" : "Raffle created!");
      router.push("/admin/raffles");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!isEdit || !confirm(`Delete "${raffle!.title}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/raffles/${raffle!.id}`, { method: "DELETE" });
      toast.success("Raffle deleted");
      router.push("/admin/raffles");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-white/5 bg-[#111] p-6">
      <h2 className="mb-6 text-lg font-bold text-white">{isEdit ? "Edit Raffle" : "Create New Raffle"}</h2>

      <div className="flex flex-col gap-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/60">Title</label>
          <input {...register("title")} className={FIELD} placeholder='e.g. "Apple MacBook Pro 16"' />
          {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/60">Description</label>
          <textarea {...register("description")} rows={4} className={`${FIELD} resize-none`} placeholder="Describe the prize in detail…" />
          {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/60">Image URL</label>
          <input {...register("imageUrl")} className={FIELD} placeholder="https://images.unsplash.com/…" />
          {errors.imageUrl && <p className="mt-1 text-xs text-red-400">{errors.imageUrl.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/60">Total Tickets</label>
            <input {...register("totalTickets")} type="number" min="10" className={FIELD} />
            {errors.totalTickets && <p className="mt-1 text-xs text-red-400">{errors.totalTickets.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/60">Ticket Price (£)</label>
            <input {...register("ticketPrice")} type="number" min="0.5" step="0.50" className={FIELD} />
            {errors.ticketPrice && <p className="mt-1 text-xs text-red-400">{errors.ticketPrice.message}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/60">Draw Time</label>
            <input {...register("drawTime")} type="datetime-local" className={FIELD} />
            {errors.drawTime && <p className="mt-1 text-xs text-red-400">{errors.drawTime.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/60">Status</label>
            <select {...register("status")} className={`${FIELD} cursor-pointer`}>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-gold-500 py-3 font-bold text-black transition hover:bg-gold-400 disabled:opacity-50"
          >
            {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Raffle"}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/20"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
