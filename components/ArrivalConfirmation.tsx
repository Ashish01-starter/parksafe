"use client";

import React from "react";
import { ParkingLocationDto, ParkingSpaceDto } from "@/lib/types";
import { MapPin, Check, X, ShieldAlert, Sparkles, Navigation } from "lucide-react";

interface ArrivalConfirmationProps {
  isOpen: boolean;
  location: ParkingLocationDto | null;
  space: ParkingSpaceDto | null;
  onConfirmParked: () => void;
  onDismiss: () => void;
  isSubmitting: boolean;
}

export function ArrivalConfirmation({
  isOpen,
  location,
  space,
  onConfirmParked,
  onDismiss,
  isSubmitting,
}: ArrivalConfirmationProps) {
  if (!isOpen || !location) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 text-center">
        {/* Animated Icon */}
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 border-2 border-emerald-200 shadow-inner">
          <MapPin className="w-8 h-8 animate-bounce" />
        </div>

        <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          Geofence Arrival Detected
        </span>

        <h2 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
          You&apos;ve arrived at your parking location
        </h2>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 my-4 text-left">
          <div className="text-xs text-slate-500 font-medium">Facility</div>
          <div className="font-extrabold text-base text-slate-900">{location.name}</div>
          {space && (
            <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-xs text-slate-600">Designated Bay:</span>
              <span className="font-mono font-black text-sm bg-white px-2 py-0.5 rounded border border-slate-200 text-emerald-700">
                Space {space.spaceIdentifier}
              </span>
            </div>
          )}
        </div>

        <p className="text-sm font-bold text-slate-800 mb-6">
          Did you park here?
        </p>

        {/* Binary Confirmation Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onDismiss}
            disabled={isSubmitting}
            className="py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>No</span>
          </button>

          <button
            onClick={onConfirmParked}
            disabled={isSubmitting}
            className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Updating...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Yes, I parked</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mt-4 leading-normal">
          GPS indicates arrival within ~80m. Confirming updates live public availability for other Chennai drivers.
        </p>
      </div>
    </div>
  );
}
