"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface InviteCodeCardProps {
  inviteCode: string;
}

export default function InviteCodeCard({ inviteCode }: InviteCodeCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 flex items-center justify-between gap-4">
      <div>
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Invite Code</span>
        <span className="text-2xl font-black text-f1-red tracking-wider uppercase mt-1 block">
          {inviteCode}
        </span>
      </div>
      <button
        onClick={handleCopy}
        className="h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700/60 hover:bg-zinc-700 hover:text-white transition flex items-center justify-center text-zinc-400 cursor-pointer"
        title="Copy to clipboard"
      >
        {copied ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
