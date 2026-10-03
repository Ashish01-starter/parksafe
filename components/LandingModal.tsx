"use client";

import React from "react";
import { Shield, MapPin, Navigation, Compass, CheckCircle2, ArrowRight } from "lucide-react";

interface LandingModalProps {
  isOpen: boolean;
  onFindParking: () => void;
}

export function LandingModal({ isOpen, onFindParking }: LandingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-10 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-600/30 font-black text-2xl tracking-tighter">
            <span>P</span>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              parkSafe
              <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Chennai MVP
              </span>
            </h1>
            <p className="text-emerald-700 font-semibold text-sm">
              &ldquo;Find parking before parking finds you.&rdquo;
            </p>
          </div>
        </div>

        {/* Core description */}
        <p className="text-slate-600 text-base leading-relaxed mb-6">
          Find nearby public parking for your vehicle, check real-time availability, and navigate directly to your space across Chennai.
        </p>

        {/* Feature Highlights */}
        <div className="space-y-3 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Available for <strong>two-wheelers (🏍)</strong> and <strong>four-wheelers (🚗)</strong></span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Live capacity, visual bay grids, and arrival verification</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>100% Free &amp; Public. No logins, passwords, or app stores.</span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onFindParking}
          className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-lg rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all cursor-pointer"
        >
          <span>Find Parking</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-center text-xs text-slate-600 mt-4">
          Free OpenStreetMap &amp; GPS discovery • Privacy protected
        </p>
      </div>
    </div>
  );
}
