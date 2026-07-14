"use client";

import { useState } from "react";
import { Sparkles, Flame, BarChart3, AlertCircle, RefreshCw } from "lucide-react";

interface SeasonRecapViewProps {
  history: Array<{
    raceName: string;
    points: number;
    breakdown: {
      p1Points: number;
      p2Points: number;
      p3Points: number;
      fastestLapPoints: number;
      dnfPoints: number;
      jokerMultiplierApplied: boolean;
    };
  }>;
}

export default function SeasonRecapView({ history }: SeasonRecapViewProps) {
  const [mode, setMode] = useState<"analyzer" | "roaster">("analyzer");
  const [loading, setLoading] = useState(false);
  const [recap, setRecap] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setRecap(null);
    setError(null);

    try {
      const response = await fetch("/api/ai/season-recap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history,
          mode,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRecap(data.recap);
      } else {
        throw new Error(data.error || "Failed to generate season recap.");
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || "The AI coach was unable to analyze your season. Please try again in a few seconds."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode selection card */}
      <div className="glass-card p-5 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white uppercase">Select AI Recap Mode</h3>
          <p className="text-xs text-zinc-500 font-medium max-w-sm">
            Choose whether to get a detailed performance analysis or a savage, lighthearted roast.
          </p>
        </div>

        <div className="flex bg-zinc-900 p-1 rounded-lg">
          <button
            onClick={() => setMode("analyzer")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-extrabold uppercase tracking-wider transition cursor-pointer ${
              mode === "analyzer"
                ? "bg-zinc-800 text-f1-cyan shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analyzer
          </button>
          <button
            onClick={() => setMode("roaster")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-extrabold uppercase tracking-wider transition cursor-pointer ${
              mode === "roaster"
                ? "bg-zinc-800 text-f1-cyan shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Roaster
          </button>
        </div>
      </div>

      {/* Action button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition font-extrabold uppercase tracking-wider text-xs bg-cyan-950/20 text-f1-cyan hover:bg-cyan-900/20"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Analyzing telemetry data...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {recap ? "Regenerate Season Recap" : "Generate Season Recap"}
          </>
        )}
      </button>

      {/* Error display */}
      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded bg-red-950/40 text-red-400 text-sm font-semibold">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Recap report content */}
      {recap && (
        <div className="glass-card p-6 rounded-xl relative overflow-hidden leading-relaxed shadow-lg">
          {/* Top colored indicator bar */}
          <div className="absolute top-0 left-0 h-1 w-full bg-f1-cyan" />

          <h3 className="text-base font-extrabold uppercase mb-4 flex items-center gap-1.5 text-f1-cyan">
            {mode === "analyzer" ? (
              <>
                <BarChart3 className="w-4 h-4" /> Season Telemetry Analysis
              </>
            ) : (
              <>
                <Flame className="w-4 h-4" /> Season Roast Report
              </>
            )}
          </h3>

          <div
            className="text-sm text-zinc-300 font-medium space-y-4 whitespace-pre-wrap leading-relaxed select-text"
            style={{ fontFamily: "inherit" }}
          >
            {/* Split paragraphs and format bullets cleanly */}
            {recap.split("\n").map((line, idx) => {
              if (line.startsWith("- ") || line.startsWith("* ")) {
                return (
                  <li key={idx} className="ml-4 list-disc pl-1 text-zinc-300">
                    {line.slice(2)}
                  </li>
                );
              }
              if (line.match(/^\d+\.\s/)) {
                const match = line.match(/^\d+\.\s/);
                const prefix = match ? match[0] : "";
                return (
                  <div key={idx} className="pl-1 font-semibold text-white mt-4">
                    {line}
                  </div>
                );
              }
              if (line.startsWith("**") && line.endsWith("**")) {
                return (
                  <h4 key={idx} className="text-white font-bold uppercase tracking-wider text-xs mt-4">
                    {line.replaceAll("**", "")}
                  </h4>
                );
              }
              return <p key={idx}>{line}</p>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
