"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center animate-fade-in">
      <div className="h-16 w-16 rounded-full bg-red-950/30 flex items-center justify-center mb-6">
        <span className="text-2xl font-black text-red-500">!</span>
      </div>
      <h2 className="text-2xl font-black uppercase text-white mb-2">Something Went Wrong</h2>
      <p className="text-sm text-zinc-500 font-medium max-w-sm mb-8">
        An unexpected error occurred. This could be a temporary issue.
      </p>
      <button
        onClick={() => reset()}
        className="btn-f1 px-6 py-2.5 rounded-lg text-sm font-bold cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );
}
