"use client";

import React, { useState, useEffect } from "react";
import { DRIVERS, Driver } from "@/lib/drivers";
import { submitPrediction } from "@/app/actions/predictions";
import { Sparkles, Save, AlertCircle, Info, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";

interface PredictionFormProps {
  raceId: string;
  raceName: string;
  initialPrediction: {
    predictedP1: string;
    predictedP2: string;
    predictedP3: string;
    predictedFastestLap: string;
    predictedDNF: string | null;
    isJoker: boolean;
  } | null;
  jokerUsedOnOtherRace: boolean;
}

export default function PredictionForm({
  raceId,
  raceName,
  initialPrediction,
  jokerUsedOnOtherRace,
}: PredictionFormProps) {
  const [p1, setP1] = useState(initialPrediction?.predictedP1 || "");
  const [p2, setP2] = useState(initialPrediction?.predictedP2 || "");
  const [p3, setP3] = useState(initialPrediction?.predictedP3 || "");
  const [fastestLap, setFastestLap] = useState(initialPrediction?.predictedFastestLap || "");
  const [dnf, setDnf] = useState(initialPrediction?.predictedDNF || "");
  const [isJoker, setIsJoker] = useState(initialPrediction?.isJoker || false);

  const [commentary, setCommentary] = useState<string | null>(null);
  const [loadingCommentary, setLoadingCommentary] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Validate duplicate podium picks
  const duplicatePodium =
    !!(p1 && p2 && p3 && (p1 === p2 || p1 === p3 || p2 === p3));

  // Get AI commentary
  const fetchCommentary = async () => {
    if (!p1 || !p2 || !p3 || !fastestLap) {
      setStatus({
        type: "error",
        message: "Please select P1, P2, P3, and Fastest Lap before asking the AI coach.",
      });
      return;
    }

    setLoadingCommentary(true);
    setCommentary(null);
    setStatus(null);

    try {
      const response = await fetch("/api/ai/commentary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raceName,
          p1,
          p2,
          p3,
          fastestLap,
          dnf: dnf || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCommentary(data.commentary);
      } else {
        throw new Error(data.error || "Failed to generate commentary");
      }
    } catch (err) {
      console.error(err);
      // Degrade gracefully: hide commentary box silently
      setStatus({
        type: "error",
        message: "AI coach was unable to respond. You can still submit your predictions!",
      });
    } finally {
      setLoadingCommentary(false);
    }
  };

  // Submit prediction
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!p1 || !p2 || !p3 || !fastestLap) {
      setStatus({ type: "error", message: "Please fill out all mandatory predictions." });
      return;
    }

    if (duplicatePodium) {
      setStatus({ type: "error", message: "Podium picks (P1, P2, P3) must be unique drivers." });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const res = await submitPrediction({
        raceId,
        predictedP1: p1,
        predictedP2: p2,
        predictedP3: p3,
        predictedFastestLap: fastestLap,
        predictedDNF: dnf || null,
        isJoker,
      });

      if (res.success) {
        setStatus({ type: "success", message: "Predictions saved successfully!" });
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#e10600", "#ffffff", "#10b981"],
        });
      } else {
        setStatus({ type: "error", message: res.error || "Failed to submit." });
      }
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "An unexpected error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status && (
        <div
          className={`flex items-start gap-2.5 p-4 rounded border text-sm font-medium ${
            status.type === "success"
              ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/20"
              : "bg-red-950/40 text-red-400 border-red-500/20"
          }`}
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{status.message}</span>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-3">
        {/* P1 Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-black text-[10px]">1</span>
            Winner (P1)
          </label>
          <select
            value={p1}
            onChange={(e) => setP1(e.target.value)}
            required
            className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-f1-red transition"
          >
            <option value="">Select Driver...</option>
            {DRIVERS.map((d) => (
              <option key={d.id} value={d.id} disabled={d.id === p2 || d.id === p3}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        {/* P2 Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-zinc-300 text-zinc-950 flex items-center justify-center font-black text-[10px]">2</span>
            2nd Place (P2)
          </label>
          <select
            value={p2}
            onChange={(e) => setP2(e.target.value)}
            required
            className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-f1-red transition"
          >
            <option value="">Select Driver...</option>
            {DRIVERS.map((d) => (
              <option key={d.id} value={d.id} disabled={d.id === p1 || d.id === p3}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        {/* P3 Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-700 text-zinc-950 flex items-center justify-center font-black text-[10px]">3</span>
            3rd Place (P3)
          </label>
          <select
            value={p3}
            onChange={(e) => setP3(e.target.value)}
            required
            className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-f1-red transition"
          >
            <option value="">Select Driver...</option>
            {DRIVERS.map((d) => (
              <option key={d.id} value={d.id} disabled={d.id === p1 || d.id === p2}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Fastest Lap */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Fastest Lap Driver
          </label>
          <select
            value={fastestLap}
            onChange={(e) => setFastestLap(e.target.value)}
            required
            className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-f1-red transition"
          >
            <option value="">Select Driver...</option>
            {DRIVERS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        {/* DNF Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            DNF Prediction <span className="text-[10px] text-zinc-500 font-semibold">(Optional)</span>
          </label>
          <select
            value={dnf}
            onChange={(e) => setDnf(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-f1-red transition"
          >
            <option value="">No DNF Pick</option>
            {DRIVERS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Joker selection card */}
      <div className="glass-card p-4 rounded-xl border border-zinc-800 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <label className="font-extrabold text-white text-sm uppercase italic flex items-center gap-1.5">
            🃏 Play Joker Card
          </label>
          <p className="text-xs text-zinc-500 max-w-md font-medium">
            Doubles your points for this race. You can only use ONE Joker card per season. Use it wisely!
          </p>
        </div>
        <div>
          {jokerUsedOnOtherRace && !initialPrediction?.isJoker ? (
            <span className="text-xs text-zinc-600 bg-zinc-900 border border-zinc-800 font-bold px-3 py-1.5 rounded cursor-not-allowed inline-block">
              Joker Already Used
            </span>
          ) : (
            <input
              type="checkbox"
              checked={isJoker}
              onChange={(e) => setIsJoker(e.target.checked)}
              className="w-5 h-5 rounded accent-f1-red cursor-pointer"
            />
          )}
        </div>
      </div>

      {/* AI coach box */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={fetchCommentary}
            disabled={loadingCommentary || duplicatePodium}
            className="flex items-center gap-2 text-xs font-extrabold text-neon-cyan hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {loadingCommentary ? "AI Coach is analyzing..." : "Ask F1 AI Coach for Commentary"}
          </button>
        </div>

        {commentary && (
          <div className="p-4 rounded bg-cyan-950/20 text-cyan-400 border border-cyan-500/20 text-sm italic font-medium leading-relaxed shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 bg-neon-cyan h-full"></div>
            "{commentary}"
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-zinc-800/40">
        <button
          type="submit"
          disabled={submitting || duplicatePodium}
          className="w-full btn-f1 py-3 rounded flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {submitting ? "Saving..." : "Lock in Predictions"}
        </button>
      </div>
    </form>
  );
}
