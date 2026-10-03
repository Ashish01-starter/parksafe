"use client";

import React from "react";
import Link from "next/link";
import { VehicleType } from "@/lib/types";
import { Bike, Car, RefreshCw, Shield, MapPin, SlidersHorizontal } from "lucide-react";

interface HeaderProps {
  vehicleType: VehicleType;
  onVehicleChange: (type: VehicleType) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenSearch: () => void;
  activeLocationLabel?: string;
  onToggleDemoPanel: () => void;
  showDemoPanel: boolean;
}

export function Header({
  vehicleType,
  onVehicleChange,
  onRefresh,
  isRefreshing,
  onOpenSearch,
  activeLocationLabel,
  onToggleDemoPanel,
  showDemoPanel,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-3 sm:px-6 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 font-black text-lg tracking-tighter">
            <span className="flex items-center">
              P<Shield className="w-3.5 h-3.5 -ml-1 text-emerald-200" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">parkSafe</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                Chennai
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Public Parking Discovery</p>
          </div>
        </div>

        {/* Center: Active search location trigger */}
        <button
          onClick={onOpenSearch}
          className="flex-1 max-w-md hidden md:flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-sm text-slate-700 transition"
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">{activeLocationLabel || "Search Chennai location..."}</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Search</span>
        </button>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Vehicle Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => onVehicleChange("TWO_WHEELER")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                vehicleType === "TWO_WHEELER"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Filter for Two Wheeler parking"
            >
              <Bike className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">2W</span>
            </button>
            <button
              onClick={() => onVehicleChange("FOUR_WHEELER")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                vehicleType === "FOUR_WHEELER"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Filter for Four Wheeler parking"
            >
              <Car className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">4W</span>
            </button>
          </div>

          {/* Refresh Availability */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition disabled:opacity-50"
            title="Refresh live availability"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
          </button>

          {/* Demo Controls Toggle */}
          <button
            onClick={onToggleDemoPanel}
            className={`p-2 rounded-xl border transition ${
              showDemoPanel
                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
            title="Toggle Demo & Simulator Controls"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Admin link */}
          <Link
            href="/admin"
            className="text-xs font-medium text-slate-500 hover:text-emerald-700 px-2 py-1 rounded hover:bg-slate-100 transition hidden lg:inline-block"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
