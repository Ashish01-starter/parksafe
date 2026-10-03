"use client";

import React, { useState } from "react";
import { VehicleType, UserCoordinates, ParkingLocationDto } from "@/lib/types";
import {
  SlidersHorizontal,
  Sparkles,
  RefreshCw,
  MapPin,
  Bike,
  Car,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  Cpu
} from "lucide-react";

interface DemoControlsProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleType: VehicleType;
  onVehicleChange: (type: VehicleType) => void;
  onJumpToCoordinates: (coords: UserCoordinates, label: string) => void;
  onTriggerArrival: () => void;
  onResetSeedData: () => Promise<void>;
  nearestLocation?: ParkingLocationDto;
  isResetting: boolean;
}

const DEMO_PRESETS = [
  { name: "T. Nagar (Pondy Bazaar)", lat: 13.0405, lng: 80.2337 },
  { name: "Anna Nagar (2nd Avenue)", lat: 13.0850, lng: 80.2155 },
  { name: "Velachery (Phoenix Mall)", lat: 12.9915, lng: 80.2170 },
  { name: "Adyar (Besant Nagar)", lat: 13.0003, lng: 80.2694 },
  { name: "Guindy (Kathipara)", lat: 13.0076, lng: 80.2036 },
];

export function DemoControls({
  isOpen,
  onClose,
  vehicleType,
  onVehicleChange,
  onJumpToCoordinates,
  onTriggerArrival,
  onResetSeedData,
  nearestLocation,
  isResetting,
}: DemoControlsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-3 sm:right-6 z-40 max-w-sm w-full bg-white rounded-3xl p-5 shadow-2xl border-2 border-emerald-500/40 animate-in slide-in-from-top-4 duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">Demo &amp; Testing Panel</h4>
            <p className="text-[11px] text-slate-500">Live evaluation tools for presentations</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 pt-3 text-xs">
        {/* Step 1: Simulate Arrival */}
        <div>
          <label className="font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
            <span>1. Test Arrival Geofence</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Simulate Driving</span>
          </label>
          <button
            onClick={onTriggerArrival}
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Simulate Arriving at Nearest Lot</span>
          </button>
          <p className="text-[10px] text-slate-400 mt-1">
            Simulates entering the 80m geofence of {nearestLocation?.name || "nearest facility"} to trigger the arrival confirmation prompt.
          </p>
        </div>

        {/* Step 2: Jump location */}
        <div>
          <label className="font-bold text-slate-700 block mb-1.5">
            2. Jump GPS Simulation to Chennai Hotspot
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {DEMO_PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => onJumpToCoordinates({ latitude: p.lat, longitude: p.lng }, p.name)}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-left truncate transition text-[11px] font-medium text-slate-700"
              >
                📍 {p.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Toggle Vehicle */}
        <div>
          <label className="font-bold text-slate-700 block mb-1.5">
            3. Switch Active Vehicle Dimension
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onVehicleChange("TWO_WHEELER")}
              className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition ${
                vehicleType === "TWO_WHEELER"
                  ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>Two Wheeler</span>
            </button>
            <button
              onClick={() => onVehicleChange("FOUR_WHEELER")}
              className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition ${
                vehicleType === "FOUR_WHEELER"
                  ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Four Wheeler</span>
            </button>
          </div>
        </div>

        {/* Step 4: Reset Demo Data */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={onResetSeedData}
            disabled={isResetting}
            className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
            <span>{isResetting ? "Re-seeding..." : "Reset Database to Demo Seed State"}</span>
          </button>
        </div>

        {/* Technical Architecture Badge */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
          <Cpu className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-[10px] text-slate-600 leading-tight">
            <strong>Architecture:</strong> MVP runs <code>ManualParkingDetectionService</code> with optimistic client sync. Modular hooks ready for <code>CameraParkingDetectionService</code>.
          </div>
        </div>
      </div>
    </div>
  );
}
