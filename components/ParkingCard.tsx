"use client";

import React from "react";
import { ParkingLocationDto, VehicleType } from "@/lib/types";
import { formatDistance, formatTimeAgo, getParkingTypeLabel } from "@/lib/utils";
import { calculateAvailabilityConfidence } from "@/lib/confidence";
import {
  Bike,
  Car,
  Navigation,
  Clock,
  ChevronRight,
  HelpCircle,
  Database,
} from "lucide-react";

interface ParkingCardProps {
  location: ParkingLocationDto;
  isSelected: boolean;
  onSelect: (loc: ParkingLocationDto) => void;
  onNavigate: (loc: ParkingLocationDto) => void;
  userVehicleType: VehicleType;
}

export function ParkingCard({
  location,
  isSelected,
  onSelect,
  onNavigate,
  userVehicleType,
}: ParkingCardProps) {
  const is2W = userVehicleType === "TWO_WHEELER";
  const available = is2W ? location.availableTwoWheelerSpaces : location.availableCarSpaces;
  const capacity = is2W ? location.twoWheelerCapacity : location.carCapacity;
  const status = is2W ? location.twoWheelerAvailabilityStatus : location.carAvailabilityStatus;

  const isUnknown = available === null || status === "UNKNOWN" || status === undefined;

  const confidence = calculateAvailabilityConfidence(
    location.lastUpdated,
    location.availabilitySource
  );

  // Status badges
  let statusBadge = {
    emoji: "🟢",
    text: "Available",
    bgClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    barColor: "bg-emerald-500",
  };

  if (isUnknown) {
    statusBadge = {
      emoji: "⚪",
      text: "Availability Unknown",
      bgClass: "bg-slate-100 text-slate-700 border-slate-200",
      barColor: "bg-slate-300",
    };
  } else if (status === "FULL" || available === 0) {
    statusBadge = {
      emoji: "🔴",
      text: "Full",
      bgClass: "bg-rose-50 text-rose-800 border-rose-200",
      barColor: "bg-rose-500",
    };
  } else if (status === "LIMITED" || (available !== null && available !== undefined && available <= 3)) {
    statusBadge = {
      emoji: "🟡",
      text: "Limited",
      bgClass: "bg-amber-50 text-amber-800 border-amber-200",
      barColor: "bg-amber-500",
    };
  }

  const supports2W = location.supportedVehicleTypes.includes("TWO_WHEELER");
  const supports4W = location.supportedVehicleTypes.includes("FOUR_WHEELER");

  const occupancyRatio =
    available !== null && available !== undefined && capacity && capacity > 0
      ? Math.min(100, Math.max(5, (available / capacity) * 100))
      : 50;

  return (
    <div
      onClick={() => onSelect(location)}
      className={`group relative p-4 rounded-3xl border-2 transition-all cursor-pointer bg-white text-left ${
        isSelected
          ? "border-emerald-600 shadow-lg shadow-emerald-600/10 ring-2 ring-emerald-500/20"
          : "border-slate-200 hover:border-slate-300 hover:shadow-md"
      }`}
    >
      {/* Top row: Name & Distance */}
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
              {location.name}
            </h3>
            {location.isDemoData ? (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                Demo Sample
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                <Database className="w-2.5 h-2.5" />
                OSM
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            {getParkingTypeLabel(location.parkingType)} • {location.area}
          </div>
        </div>

        {/* Distance & time estimate badge */}
        <div className="text-right shrink-0">
          <div className="font-black text-sm text-slate-900">
            {formatDistance(location.distanceKm)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            ~{location.estimatedMinutes || 4} mins
          </div>
        </div>
      </div>

      {/* Vehicle compatibility badges */}
      <div className="flex items-center gap-2 mb-3 mt-1 text-xs">
        {supports2W && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-medium ${
              is2W
                ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            <Bike className="w-3 h-3" />
            <span>Two Wheeler</span>
          </span>
        )}
        {supports4W && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-medium ${
              !is2W
                ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            <Car className="w-3 h-3" />
            <span>Four Wheeler</span>
          </span>
        )}
      </div>

      {/* Capacity & Availability Section */}
      <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 mb-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-600 font-medium flex items-center gap-1">
            {is2W ? <Bike className="w-3.5 h-3.5 text-slate-500" /> : <Car className="w-3.5 h-3.5 text-slate-500" />}
            <span>{is2W ? "Two-Wheeler Availability" : "Car Availability"}</span>
          </span>

          <div className="flex items-center gap-1 font-black text-slate-900">
            {isUnknown ? (
              <span className="text-xs font-semibold text-slate-500 italic flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                Unverified live
              </span>
            ) : (
              <>
                <span className="text-sm font-extrabold text-slate-900">{available}</span>
                {capacity ? (
                  <span className="text-slate-400 font-normal">/ {capacity}</span>
                ) : (
                  <span className="text-slate-400 font-normal">spots open</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Capacity Bar: Only show progress bar if live data is known; otherwise show neutral indicator */}
        {!isUnknown && capacity ? (
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${statusBadge.barColor}`}
              style={{ width: `${occupancyRatio}%` }}
            />
          </div>
        ) : (
          <div className="text-[11px] text-slate-500 bg-white/80 px-2 py-1 rounded-lg border border-slate-200/60 flex items-center justify-between">
            <span>
              {capacity ? `Facility capacity: ~${capacity} spots` : "Geographic location mapped"}
            </span>
            <span className="text-[10px] text-slate-400">Needs arrival report</span>
          </div>
        )}
      </div>

      {/* Status, Confidence & Time */}
      <div className="flex items-center justify-between gap-2 text-xs border-t border-slate-100 pt-2.5">
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-extrabold flex items-center gap-1 ${statusBadge.bgClass}`}>
            <span>{statusBadge.emoji}</span>
            <span>{statusBadge.text}</span>
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${confidence.colorClass}`}>
            {confidence.label}
          </span>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatTimeAgo(location.lastUpdated)}</span>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(location);
          }}
          className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition ${
            isSelected
              ? "bg-slate-900 text-white"
              : "bg-slate-100 hover:bg-slate-200 text-slate-800"
          }`}
        >
          <span>{location.hasIndividualSpaces ? "View Spot Grid" : "Select Parking"}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(location);
          }}
          className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Navigate</span>
        </button>
      </div>
    </div>
  );
}
