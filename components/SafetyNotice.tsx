"use client";

import React, { useState } from "react";
import { AlertCircle, X, ShieldAlert } from "lucide-react";

export function SafetyNotice() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-900 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 mx-auto">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span className="font-semibold text-[11px] sm:text-xs">
          Safety First: Please use parkSafe only when safely stopped or have a passenger operate it.
        </span>
      </div>
      <button
        onClick={() => setIsDismissed(true)}
        className="text-amber-700 hover:text-amber-900 shrink-0 p-0.5"
        title="Dismiss notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
