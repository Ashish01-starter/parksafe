"use client";

import React from "react";
import { ParkingLocationDto, VehicleType } from "@/lib/types";
import { ParkingCard } from "./ParkingCard";
import { SlidersHorizontal, MapPinOff, ArrowUpRight, Search } from "lucide-react";

interface NearbyParkingProps {
  locations: ParkingLocationDto[];
  selectedLocation: ParkingLocationDto | null;
  onSelectLocation: (loc: ParkingLocationDto) => void;
  onNavigate: (loc: ParkingLocationDto) => void;
  userVehicleType: VehicleType;
  radiusKm: number;
  onExpandRadius: () => void;
  isLoading: boolean;
  onOpenSearch: () => void;
}

export function NearbyParking({
  locations,
  selectedLocation,
  onSelectLocation,
  onNavigate,
  userVehicleType,
  radiusKm,
  onExpandRadius,
  isLoading,
  onOpenSearch,
}: NearbyParkingProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
        <div>
          <h2 className="font-extrabold text-base text-slate-900 tracking-tight">
            Nearby Compatible Parking
          </h2>
          <p className="text-xs text-slate-500">
            Sorted transparently by distance &amp; verified capacity
          </p>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          {locations.length} found ({radiusKm}km)
        </span>
      </div>

      {/* List content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 custom-scrollbar">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-slate-100 rounded-3xl" />
            ))}
          </div>
        ) : locations.length === 0 ? (
          /* Empty state / Error state */
          <div className="text-center py-10 px-4 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <MapPinOff className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-800 mb-1">
              No parking spaces found within {radiusKm} km
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
              We couldn&apos;t find compatible public parking facilities within your current search perimeter.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={onExpandRadius}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
              >
                Expand Search to 15 km
              </button>
              <button
                onClick={onOpenSearch}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Another Chennai Area</span>
              </button>
            </div>
          </div>
        ) : (
          locations.map((loc) => (
            <ParkingCard
              key={loc.id}
              location={loc}
              isSelected={selectedLocation?.id === loc.id}
              onSelect={onSelectLocation}
              onNavigate={onNavigate}
              userVehicleType={userVehicleType}
            />
          ))
        )}
      </div>
    </div>
  );
}
