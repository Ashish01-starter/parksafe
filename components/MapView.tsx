"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ParkingLocationDto, UserCoordinates, VehicleType } from "@/lib/types";
import { Loader2, Navigation } from "lucide-react";

const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-500 gap-3">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      <span className="text-sm font-medium">Loading Chennai Public Parking Map...</span>
    </div>
  ),
});

interface MapViewProps {
  locations: ParkingLocationDto[];
  userLocation: UserCoordinates;
  selectedLocation: ParkingLocationDto | null;
  onSelectLocation: (loc: ParkingLocationDto) => void;
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  onRecenter: () => void;
  userVehicleType: VehicleType;
}

export function MapView({
  locations,
  userLocation,
  selectedLocation,
  onSelectLocation,
  radiusKm,
  onRadiusChange,
  onRecenter,
  userVehicleType,
}: MapViewProps) {
  return (
    <div className="relative w-full h-full min-h-[350px] sm:min-h-[480px]">
      <MapInner
        locations={locations}
        userLocation={userLocation}
        selectedLocation={selectedLocation}
        onSelectLocation={onSelectLocation}
        radiusKm={radiusKm}
        userVehicleType={userVehicleType}
      />

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Recenter button */}
        <button
          onClick={onRecenter}
          className="p-3 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl shadow-lg border border-slate-200/80 transition-all hover:scale-105 active:scale-95"
          title="Recenter on My Location"
        >
          <Navigation className="w-5 h-5 text-emerald-600" />
        </button>

        {/* Radius selector pill */}
        <div className="bg-white/95 backdrop-blur p-1 rounded-2xl shadow-lg border border-slate-200/80 flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold text-slate-600 pt-1">Radius</span>
          <div className="flex flex-col gap-1 mt-1">
            {[1, 2, 5, 8, 15].map((r) => (
              <button
                key={r}
                onClick={() => onRadiusChange(r)}
                className={`text-[11px] font-bold px-2 py-1 rounded-xl transition ${
                  radiusKm === r
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {r}k
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
