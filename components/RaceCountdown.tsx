"use client";

import { useEffect, useState } from "react";

interface RaceCountdownProps {
  qualiDateTime: string;
}

export default function RaceCountdown({ qualiDateTime }: RaceCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isLocked: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isLocked: false });

  useEffect(() => {
    const targetDate = new Date(qualiDateTime).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLocked: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isLocked: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [qualiDateTime]);

  if (timeLeft.isLocked) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-zinc-400">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500"></span>
        LOCKED
      </span>
    );
  }

  return (
    <div className="flex gap-2 text-zinc-100">
      <div className="flex flex-col items-center">
        <span className="font-sans text-xl font-bold bg-zinc-900/80 px-2.5 py-1 rounded text-f1-cyan">
          {String(timeLeft.days).padStart(2, "0")}
        </span>
        <span className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Days</span>
      </div>
      <div className="font-sans text-xl font-bold mt-1 text-zinc-500">:</div>
      <div className="flex flex-col items-center">
        <span className="font-sans text-xl font-bold bg-zinc-900/80 px-2.5 py-1 rounded text-f1-cyan">
          {String(timeLeft.hours).padStart(2, "0")}
        </span>
        <span className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Hrs</span>
      </div>
      <div className="font-sans text-xl font-bold mt-1 text-zinc-500">:</div>
      <div className="flex flex-col items-center">
        <span className="font-sans text-xl font-bold bg-zinc-900/80 px-2.5 py-1 rounded text-f1-cyan">
          {String(timeLeft.minutes).padStart(2, "0")}
        </span>
        <span className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Mins</span>
      </div>
      <div className="font-sans text-xl font-bold mt-1 text-zinc-500">:</div>
      <div className="flex flex-col items-center">
        <span className="font-sans text-xl font-bold bg-zinc-900/80 px-2.5 py-1 rounded text-f1-cyan">
          {String(timeLeft.seconds).padStart(2, "0")}
        </span>
        <span className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Secs</span>
      </div>
    </div>
  );
}
