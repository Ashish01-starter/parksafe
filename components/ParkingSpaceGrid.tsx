"use client";

import React from "react";
import { ParkingSpaceDto, VehicleType } from "@/lib/types";
import { Check, X, ShieldAlert, Bike, Car } from "lucide-react";

interface ParkingSpaceGridProps {
  spaces: ParkingSpaceDto[];
  selectedSpaceId: string | null;
  onSelectSpace: (space: ParkingSpaceDto) => void;
  userVehicleType: VehicleType;
}

export function ParkingSpaceGrid({
  spaces,
  selectedSpaceId,
  onSelectSpace,
  userVehicleType,
}: ParkingSpaceGridProps) {
  if (!spaces || spaces.length === 0) {
    return (
      <div className="p-4 bg-slate-50 rounded-2xl text-center border border-slate-100">
        <p className="text-xs text-slate-500">
          This facility provides overall capacity tracking rather than individual bay sensors.
        </p>
      </div>
    );
  }

  // Filter or prioritize spaces matching user vehicle type
  const compatibleSpaces = spaces.filter(
    (s) => s.vehicleType === userVehicleType || s.vehicleType === "BOTH"
  );

  const displaySpaces = compatibleSpaces.length > 0 ? compatibleSpaces : spaces;

  // Group by section
  const sections = displaySpaces.reduce((acc, space) => {
    const sec = space.section || "General Area";
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(space);
    return acc;
  }, {} as Record<string, ParkingSpaceDto[]>);

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-semibold text-emerald-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Available</span>
          </span>
          <span className="flex items-center gap-1 font-semibold text-rose-800">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Occupied</span>
          </span>
        </div>
        <span className="text-[11px] text-slate-400">Click open bay to select</span>
      </div>

      {/* Grid by Sections */}
      {Object.entries(sections).map(([sectionName, sectionSpaces]) => (
        <div key={sectionName} className="space-y-2">
          <div className="text-xs font-bold text-slate-700 flex items-center justify-between px-1">
            <span>{sectionName}</span>
            <span className="text-[11px] text-slate-400 font-normal">
              {sectionSpaces.filter(s => s.status === 'available').length} of {sectionSpaces.length} open
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {sectionSpaces.map((space) => {
              const isAvailable = space.status === "available";
              const isSelected = selectedSpaceId === space.id;

              return (
                <button
                  key={space.id}
                  disabled={!isAvailable}
                  onClick={() => onSelectSpace(space)}
                  className={`relative p-2.5 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400"
                      : isAvailable
                      ? "border-emerald-200 bg-emerald-50/70 text-emerald-900 hover:border-emerald-400 hover:bg-emerald-100/60"
                      : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"
                  }`}
                >
                  <div className="font-mono font-black text-sm">{space.spaceIdentifier}</div>
                  <div className="text-[10px] mt-0.5 font-bold flex items-center gap-0.5">
                    {isAvailable ? (
                      <span className={isSelected ? "text-white" : "text-emerald-700"}>
                        🟢 Open
                      </span>
                    ) : (
                      <span className="text-rose-500">🔴 Taken</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
