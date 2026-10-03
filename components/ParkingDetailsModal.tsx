"use client";

import React from "react";
import { ParkingLocationDto, ParkingSpaceDto, VehicleType } from "@/lib/types";
import { ParkingSpaceGrid } from "./ParkingSpaceGrid";
import { NavigationService } from "@/lib/services/NavigationService";
import { calculateAvailabilityConfidence } from "@/lib/confidence";
import { formatDistance, formatTimeAgo, getParkingTypeLabel } from "@/lib/utils";
import {
  X,
  Navigation,
  MapPin,
  ShieldCheck,
  Flag,
  Bike,
  Car,
  CheckCircle2,
  Sparkles,
  Info,
  Database,
  HelpCircle,
} from "lucide-react";

interface ParkingDetailsModalProps {
  location: ParkingLocationDto | null;
  onClose: () => void;
  userVehicleType: VehicleType;
  selectedSpace: ParkingSpaceDto | null;
  onSelectSpace: (space: ParkingSpaceDto) => void;
  onOpenReport: (location: ParkingLocationDto, space?: ParkingSpaceDto | null) => void;
  onSimulateArrival: (location: ParkingLocationDto, space?: ParkingSpaceDto | null) => void;
}

export function ParkingDetailsModal({
  location,
  onClose,
  userVehicleType,
  selectedSpace,
  onSelectSpace,
  onOpenReport,
  onSimulateArrival,
}: ParkingDetailsModalProps) {
  if (!location) return null;

  const is2W = userVehicleType === "TWO_WHEELER";
  const available = is2W ? location.availableTwoWheelerSpaces : location.availableCarSpaces;
  const capacity = is2W ? location.twoWheelerCapacity : location.carCapacity;
  const isUnknown = available === null || available === undefined;

  const confidence = calculateAvailabilityConfidence(
    location.lastUpdated,
    location.availabilitySource
  );

  const handleNavigate = () => {
    NavigationService.openNavigation(
      location.latitude,
      location.longitude,
      location.name
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                {getParkingTypeLabel(location.parkingType)}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${confidence.colorClass}`}>
                {confidence.label}
              </span>
              {location.isDemoData ? (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  Demo Data
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" />
                  OpenStreetMap
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1 tracking-tight">
              {location.name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{location.address || `${location.area}, Chennai`}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <div className="text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1">
                {is2W ? <Bike className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}
                <span>{is2W ? "2W Available" : "4W Available"}</span>
              </div>
              <div className="text-xl font-black text-emerald-900 mt-0.5">
                {isUnknown ? (
                  <span className="text-sm font-semibold text-slate-500 italic">Unknown</span>
                ) : (
                  available
                )}
              </div>
              <div className="text-[10px] text-emerald-600">
                {capacity ? `of ${capacity} spots` : "Capacity unlisted"}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-500 font-semibold">Distance</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">
                {formatDistance(location.distanceKm)}
              </div>
              <div className="text-[10px] text-slate-400">from your location</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-500 font-semibold">Est. Time</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">
                ~{location.estimatedMinutes || 4}m
              </div>
              <div className="text-[10px] text-slate-400">urban traffic</div>
            </div>
          </div>

          {/* Stale or Unknown Availability Banner */}
          {isUnknown && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-slate-500" />
                <span>Live Availability Currently Unknown</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                This facility is physically mapped from OpenStreetMap, but has no live occupancy sensors or recent driver reports. You can still navigate here, and report current availability to help fellow drivers!
              </p>
            </div>
          )}

          {/* Selected Space Announcement / Target Bay (only when real space data exists) */}
          {selectedSpace ? (
            <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 flex items-center justify-between">
              <div>
                <div className="text-xs text-emerald-100 uppercase tracking-wider font-semibold">
                  Selected Target Bay
                </div>
                <div className="text-2xl font-black font-mono">
                  Space {selectedSpace.spaceIdentifier}
                </div>
                <div className="text-xs text-emerald-100">
                  {selectedSpace.section || "General Area"} • Ready for navigation
                </div>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-200" />
            </div>
          ) : location.hasIndividualSpaces ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Select an available bay below to target your spot before navigating.</span>
            </div>
          ) : null}

          {/* Individual Space Grid (ONLY when actual space-level data exists) */}
          {location.hasIndividualSpaces && location.spaces && location.spaces.length > 0 && (
            <div>
              <div className="text-sm font-extrabold text-slate-900 mb-2">
                Bay Occupancy Map
              </div>
              <ParkingSpaceGrid
                spaces={location.spaces}
                selectedSpaceId={selectedSpace?.id || null}
                onSelectSpace={onSelectSpace}
                userVehicleType={userVehicleType}
              />
            </div>
          )}

          {/* Confidence Note */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Confidence: {confidence.label}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              {confidence.description} Last updated {formatTimeAgo(location.lastUpdated)}.
            </p>
          </div>

          {/* Future detection architecture notice */}
          <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Availability Architecture:</strong> Uses hybrid driver arrival confirmations, departure updates, and crowdsourced reporting. Designed to plug into computer vision / IoT sensors when deployed.
            </span>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 bg-white border-t border-slate-100 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {/* External Navigation Button */}
            <button
              onClick={handleNavigate}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition"
            >
              <Navigation className="w-4 h-4" />
              <span>Navigate</span>
            </button>

            {/* Presentation/Testing Simulator button */}
            <button
              onClick={() => onSimulateArrival(location, selectedSpace)}
              className="py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition"
              title="Test the arrival confirmation flow immediately"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Arrival</span>
            </button>
          </div>

          {/* Report discrepancy button */}
          <button
            onClick={() => onOpenReport(location, selectedSpace)}
            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <Flag className="w-3.5 h-3.5 text-slate-400" />
            <span>Report incorrect availability or issue</span>
          </button>
        </div>
      </div>
    </div>
  );
}
