"use client";

import React, { useState } from "react";
import { ShieldCheck, X } from "lucide-react";

export function PrivacyNotice() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-[11px] text-slate-600 hover:text-emerald-700 flex items-center gap-1 transition"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Privacy Notice</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="font-extrabold text-base text-slate-900">Privacy &amp; Location Policy</h4>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>parkSafe</strong> uses your location only to find nearby public parking facilities and calculate distance and arrival alerts.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-500">
                <li>No user account or login credentials required.</li>
                <li>Zero continuous background GPS tracking when you leave the browser.</li>
                <li>No persistent storage of personal travel routes or movement history.</li>
              </ul>
              <p className="text-[11px] text-slate-400 italic">
                Built strictly for public transit convenience across Chennai, India.
              </p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="mt-5 w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
