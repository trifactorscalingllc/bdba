// ─── BusinessLogForm — daily business numbers entry ────────────────────────
// Modal form rendered inside the Shop Numbers section of StudentDashboard.
// Lets the student (own slug) or coach (any slug) upsert a row in
// public.business_log keyed by (slug, date). Re-submitting the same date
// overwrites the prior entry.
//
// Validation: numbers must be ≥ 0, integers. Revenue can be a decimal.
// Date defaults to today. Notes are optional. Cuts auto-derives from
// new_clients + returning unless the user overrides it (some students
// might have walk-ins that aren't counted in either bucket).

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  slug: string;
  displayName: string;
  open: boolean;
  onClose: () => void;
}

interface FormState {
  date: string;
  new_clients: string;
  returning: string;
  cuts: string;
  no_shows: string;
  revenue: string;
  notes: string;
}

function todayIso(): string {
  // Local-date YYYY-MM-DD. Don't use toISOString — that's UTC, which can be
  // a day off late at night.
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function emptyForm(): FormState {
  return {
    date: todayIso(),
    new_clients: "0",
    returning: "0",
    cuts: "",
    no_shows: "0",
    revenue: "",
    notes: "",
  };
}

export default function BusinessLogForm({ slug, displayName, open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  // Auto-derive cuts when user hasn't typed it manually. We track this with
  // an empty string — once they edit cuts the field becomes "owned" and we
  // stop auto-deriving.
  const derivedCuts = form.cuts === ""
    ? (parseInt(form.new_clients || "0", 10) || 0) + (parseInt(form.returning || "0", 10) || 0)
    : parseInt(form.cuts, 10) || 0;

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        slug,
        date: form.date,
        new_clients: parseInt(form.new_clients || "0", 10),
        returning: parseInt(form.returning || "0", 10),
        cuts: derivedCuts,
        no_shows: parseInt(form.no_shows || "0", 10),
        revenue: form.revenue === "" ? null : parseFloat(form.revenue),
        notes: form.notes.trim() || null,
      };
      // Upsert by (slug, date). The table has UNIQUE (slug, date) so re-
      // submitting the same date overwrites — this is intentional: it lets a
      // student fix a typo by re-saving the day.
      const { error: upsertErr } = await supabase
        .from("business_log")
        .upsert(payload, { onConflict: "slug,date" });
      if (upsertErr) throw upsertErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cis"] });
      setForm(emptyForm());
      setError(null);
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.date) {
      setError("Pick a date.");
      return;
    }
    mutation.mutate();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="glass-card rounded-2xl p-7 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex justify-between items-start mb-5">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-red mb-1">
                  Log today's numbers
                </div>
                <h2 className="text-xl font-black italic uppercase tracking-tight">
                  {displayName}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-3">
              <Field
                label="Date"
                type="date"
                value={form.date}
                onChange={(v) => setForm({ ...form, date: v })}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="New clients"
                  type="number"
                  min="0"
                  value={form.new_clients}
                  onChange={(v) => setForm({ ...form, new_clients: v })}
                />
                <Field
                  label="Returning"
                  type="number"
                  min="0"
                  value={form.returning}
                  onChange={(v) => setForm({ ...form, returning: v })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label={form.cuts === "" ? `Cuts (auto: ${derivedCuts})` : "Cuts"}
                  type="number"
                  min="0"
                  value={form.cuts}
                  placeholder={String(derivedCuts)}
                  onChange={(v) => setForm({ ...form, cuts: v })}
                />
                <Field
                  label="No-shows"
                  type="number"
                  min="0"
                  value={form.no_shows}
                  onChange={(v) => setForm({ ...form, no_shows: v })}
                />
              </div>
              <Field
                label="Revenue ($)"
                type="number"
                min="0"
                step="0.01"
                value={form.revenue}
                placeholder="0.00"
                onChange={(v) => setForm({ ...form, revenue: v })}
              />
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Walk-in, bachelor party, etc."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:ring-2 focus:ring-brand-red/15 focus:outline-none transition resize-none"
                />
              </div>

              {error && (
                <div className="font-mono text-[11px] text-brand-red bg-red-600/10 border border-red-600/30 rounded-lg px-3 py-2.5">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-white/15 hover:bg-white/5 text-white font-mono text-[11px] uppercase tracking-wider px-4 py-3 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1 bg-brand-red hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black italic uppercase tracking-wide text-xs px-4 py-3 rounded-xl transition active:scale-95"
                >
                  {mutation.isPending ? "Saving…" : "Save"}
                </button>
              </div>

              <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40 text-center pt-1">
                Saving the same date again will overwrite that day's entry.
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface FieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  min?: string;
  step?: string;
}

function Field({ label, type, value, onChange, required, placeholder, min, step }: FieldProps) {
  return (
    <div>
      <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        min={min}
        step={step}
        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:ring-2 focus:ring-brand-red/15 focus:outline-none transition"
      />
    </div>
  );
}
