"use client";

import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface BottomSheetProps {
  children: React.ReactNode;
  headerTitle: string;
  badgeCount?: number;
}

export function BottomSheet({ children, headerTitle, badgeCount }: BottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`sm:hidden fixed inset-x-0 bottom-0 z-30 bg-white rounded-t-3xl shadow-sheet border-t border-slate-200 transition-all duration-300 ease-in-out flex flex-col ${
        isExpanded ? "h-[85vh]" : "h-64"
      }`}
    >
      {/* Drag handle & toggle header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2.5 px-4 flex flex-col items-center justify-center border-b border-slate-100 cursor-pointer active:bg-slate-50 transition"
      >
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mb-1.5" />
        <div className="flex items-center justify-between w-full px-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-slate-900">{headerTitle}</span>
            {badgeCount !== undefined && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {badgeCount}
              </span>
            )}
          </div>
          <div className="text-slate-400">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Sheet Content */}
      <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
    </div>
  );
}
