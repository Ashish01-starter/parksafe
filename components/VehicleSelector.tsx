"use client";

import React from "react";
import { VehicleType } from "@/lib/types";
import { Bike, Car, ArrowRight, ShieldCheck } from "lucide-react";

interface VehicleSelectorProps {
  selectedVehicle: VehicleType | null;
  onSelect: (type: VehicleType) => void;
  isOpen: boolean;
  onClose?: () => void;
  isInitial?: boolean;
}

export function VehicleSelector({
  selectedVehicle,
  onSelect,
  isOpen,
  onClose,
  isInitial = false,
}: VehicleSelectorProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-emerald-600 mb-3 border border-emerald-100">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            How are you travelling?
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            parkSafe filters verified public parking spots designed specifically for your vehicle dimensions.
          </p>
        </div>

        {/* Two Big Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Two Wheeler */}
          <button
            onClick={() => onSelect("TWO_WHEELER")}
            className={`group relative p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between h-40 ${
              selectedVehicle === "TWO_WHEELER"
                ? "border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20"
                : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="p-3 rounded-xl bg-white shadow-sm border border-slate-100 text-emerald-600 group-hover:scale-105 transition-transform">
                <Bike className="w-7 h-7" />
              </span>
              <span className="text-2xl">🏍</span>
            </div>
            <div>
              <div className="font-bold text-base text-slate-900">Two Wheeler</div>
              <div className="text-xs text-slate-500 mt-0.5">Motorcycles & Scooters</div>
            </div>
          </button>

          {/* Four Wheeler */}
          <button
            onClick={() => onSelect("FOUR_WHEELER")}
            className={`group relative p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between h-40 ${
              selectedVehicle === "FOUR_WHEELER"
                ? "border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20"
                : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="p-3 rounded-xl bg-white shadow-sm border border-slate-100 text-blue-600 group-hover:scale-105 transition-transform">
                <Car className="w-7 h-7" />
              </span>
              <span className="text-2xl">🚗</span>
            </div>
            <div>
              <div className="font-bold text-base text-slate-900">Four Wheeler</div>
              <div className="text-xs text-slate-500 mt-0.5">Cars, Sedans & SUVs</div>
            </div>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-center text-xs text-slate-600 flex items-center justify-center gap-1">
            <span>No account or sign up required. Instant public access.</span>
          </p>
          {selectedVehicle && (
            <button
              onClick={() => {
                if (onClose) onClose();
              }}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition"
            >
              <span>Continue to Chennai Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
