"use client";

import React, { useState, useEffect } from "react";
import { ActiveParkingSession } from "@/lib/types";
import { CheckCircle2, LogOut, Clock, ShieldCheck, MapPin } from "lucide-react";

interface ActiveParkingBannerProps {
  session: ActiveParkingSession | null;
  onVacate: () => void;
  isVacating: boolean;
}

export function ActiveParkingBanner({
  session,
  onVacate,
  isVacating,
}: ActiveParkingBannerProps) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    if (!session) return;
    const calcElapsed = () => {
      const start = new Date(session.parkedAt).getTime();
      const diff = Math.floor((Date.now() - start) / 60000);
      setElapsedMinutes(Math.max(0, diff));
    };

    calcElapsed();
    const interval = setInterval(calcElapsed, 30000);
    return () => clearInterval(interval);
  }, [session]);

  if (!session) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-2xl border border-slate-700/80 backdrop-blur-md">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400">
                Active Parking Session
              </div>
              <div className="font-bold text-sm text-white truncate max-w-[180px]">
                {session.parkingName}
              </div>
            </div>
          </div>

          <div className="text-right">
            {session.spaceIdentifier ? (
              <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-300">
                Bay {session.spaceIdentifier}
              </span>
            ) : (
              <span className="text-xs text-slate-400">General</span>
            )}
            <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1 mt-1">
              <Clock className="w-3 h-3" />
              <span>{elapsedMinutes}m parked</span>
            </div>
          </div>
        </div>

        {/* Departure Prompt */}
        <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 mb-3 flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium">Leaving this parking space?</span>
          <span className="text-emerald-400 font-semibold">Free it up for others</span>
        </div>

        {/* Vacate Button */}
        <button
          onClick={onVacate}
          disabled={isVacating}
          className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          <span>{isVacating ? "Updating availability..." : "Mark Available & Leave"}</span>
        </button>
      </div>
    </div>
  );
}
