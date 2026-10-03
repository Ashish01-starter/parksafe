"use client";

import React, { useState } from "react";
import { ParkingLocationDto, ParkingSpaceDto, VehicleType } from "@/lib/types";
import { X, Flag, CheckCircle2, Loader2 } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: ParkingLocationDto | null;
  space?: ParkingSpaceDto | null;
  userVehicleType?: VehicleType;
  onSubmitReport: (
    locationId: string,
    reportType: string,
    details?: string,
    spaceId?: string | null,
    vehicleType?: string
  ) => Promise<void>;
}

const REPORT_OPTIONS = [
  { id: "location_full", label: "Parking is completely full", icon: "🛑" },
  { id: "space_occupied", label: "My target bay is already occupied", icon: "🚗" },
  { id: "space_available", label: "Spots are currently available here", icon: "🟢" },
  { id: "location_closed", label: "Facility is closed / gate locked", icon: "🔒" },
  { id: "wrong_info", label: "Incorrect vehicle restrictions or location", icon: "📍" },
  { id: "other", label: "Other report or note", icon: "📝" },
];

export function ReportModal({
  isOpen,
  onClose,
  location,
  space,
  userVehicleType = "FOUR_WHEELER",
  onSubmitReport,
}: ReportModalProps) {
  const [selectedType, setSelectedType] = useState<string>("location_full");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !location) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitReport(location.id, selectedType, details, space?.id, userVehicleType);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setDetails("");
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900">Report Availability</h3>
              <p className="text-xs text-slate-500 truncate max-w-[240px]">{location.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <div className="font-extrabold text-base text-slate-900">Report Submitted</div>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Thank you! Our confidence system recalibrates availability to keep Chennai drivers informed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                What did you find on-site? ({userVehicleType === "TWO_WHEELER" ? "Two Wheeler" : "Four Wheeler"})
              </label>
              <div className="space-y-1.5">
                {REPORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedType(opt.id)}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-semibold flex items-center gap-3 transition ${
                      selectedType === opt.id
                        ? "border-emerald-600 bg-emerald-50/60 text-emerald-900 ring-1 ring-emerald-500"
                        : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                    }`}
                  >
                    <span className="text-base">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={2}
                maxLength={300}
                placeholder="e.g. Construction ongoing, gate temporarily locked..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none text-slate-800"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Report</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
