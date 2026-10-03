"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Navigation, X, Loader2, Compass } from "lucide-react";
import { UserCoordinates } from "@/lib/types";

interface LocationSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCoordinates: (coords: UserCoordinates, label: string) => void;
  onRequestCurrentLocation: () => void;
  isLocating: boolean;
  currentLabel?: string;
}

const CHENNAI_QUICK_AREAS = [
  { name: "T. Nagar (Pondy Bazaar)", lat: 13.0405, lng: 80.2337 },
  { name: "Anna Nagar (Roundtana)", lat: 13.0850, lng: 80.2155 },
  { name: "Adyar (Besant Nagar Beach)", lat: 13.0003, lng: 80.2694 },
  { name: "Velachery (Phoenix Mall)", lat: 12.9915, lng: 80.2170 },
  { name: "Guindy (Kathipara Square)", lat: 13.0076, lng: 80.2036 },
  { name: "Central Chennai (Marina)", lat: 13.0544, lng: 80.2831 },
  { name: "OMR (Tidel Park)", lat: 12.9897, lng: 80.2476 },
  { name: "Tambaram Railway Station", lat: 12.9254, lng: 80.1174 },
];

export function LocationSearch({
  isOpen,
  onClose,
  onSelectCoordinates,
  onRequestCurrentLocation,
  isLocating,
  currentLabel,
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ lat: number; lng: number; displayName: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.success && json.results) {
          setResults(json.results);
        }
      } catch (e) {
        console.error("Geocoding failed", e);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full mt-4 sm:mt-12 overflow-hidden shadow-2xl border border-slate-200">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Chennai area, landmark, or mall..."
            className="flex-1 text-slate-800 text-base placeholder:text-slate-400 outline-none bg-transparent"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />}
          {query && !isLoading && (
            <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Use My Location Option */}
        <div className="p-3 border-b border-slate-100 bg-emerald-50/40">
          <button
            onClick={() => {
              onRequestCurrentLocation();
              onClose();
            }}
            disabled={isLocating}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-100/60 transition text-left text-emerald-800 font-semibold text-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            </div>
            <div className="flex-1">
              <div>Use My Current GPS Location</div>
              <div className="text-[11px] text-emerald-600 font-normal">
                Center map and discover public parking nearest to you
              </div>
            </div>
          </button>
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="max-h-60 overflow-y-auto p-2 border-b border-slate-100 divide-y divide-slate-100">
            {results.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectCoordinates({ latitude: item.lat, longitude: item.lng }, item.displayName);
                  onClose();
                }}
                className="w-full text-left p-3 hover:bg-slate-50 rounded-xl flex items-start gap-3 transition"
              >
                <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-800 font-medium leading-snug">{item.displayName}</span>
              </button>
            ))}
          </div>
        )}

        {/* Quick Chennai Neighborhood Presets */}
        <div className="p-4 bg-slate-50/70">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Popular Chennai Areas</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CHENNAI_QUICK_AREAS.map((area) => (
              <button
                key={area.name}
                onClick={() => {
                  onSelectCoordinates({ latitude: area.lat, longitude: area.lng }, area.name);
                  onClose();
                }}
                className="text-left px-3 py-2 rounded-xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:text-emerald-700 text-xs font-medium text-slate-700 transition truncate shadow-xs"
              >
                {area.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
