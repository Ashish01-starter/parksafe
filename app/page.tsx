"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ParkingLocationDto,
  ParkingSpaceDto,
  VehicleType,
  UserCoordinates,
  ActiveParkingSession,
} from "@/lib/types";
import { Header } from "@/components/Header";
import { LandingModal } from "@/components/LandingModal";
import { VehicleSelector } from "@/components/VehicleSelector";
import { LocationSearch } from "@/components/LocationSearch";
import { MapView } from "@/components/MapView";
import { NearbyParking } from "@/components/NearbyParking";
import { ParkingDetailsModal } from "@/components/ParkingDetailsModal";
import { ArrivalConfirmation } from "@/components/ArrivalConfirmation";
import { ActiveParkingBanner } from "@/components/ActiveParkingBanner";
import { ReportModal } from "@/components/ReportModal";
import { DemoControls } from "@/components/DemoControls";
import { SafetyNotice } from "@/components/SafetyNotice";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { BottomSheet } from "@/components/BottomSheet";
import { ParkingService } from "@/lib/services/ParkingService";
import { LocationService, CHENNAI_DEFAULT_COORDS } from "@/lib/services/LocationService";
import { isWithinGeofence } from "@/lib/distance";
import { NavigationService } from "@/lib/services/NavigationService";
import { MapPin } from "lucide-react";

export default function ParkSafeApp() {
  // --- State ---
  const [vehicleType, setVehicleType] = useState<VehicleType>("FOUR_WHEELER");
  const [userLocation, setUserLocation] = useState<UserCoordinates>(CHENNAI_DEFAULT_COORDS);
  const [locationLabel, setLocationLabel] = useState<string>("Chennai Central");
  const [radiusKm, setRadiusKm] = useState<number>(2.0); // Default 2km radius per specification
  const [locations, setLocations] = useState<ParkingLocationDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Selected Location & Space
  const [selectedLocation, setSelectedLocation] = useState<ParkingLocationDto | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpaceDto | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  // Active Session (when parked)
  const [activeSession, setActiveSession] = useState<ActiveParkingSession | null>(null);
  const [isVacating, setIsVacating] = useState<boolean>(false);

  // Modals & Panels
  const [showLanding, setShowLanding] = useState<boolean>(false);
  const [showVehicleSelector, setShowVehicleSelector] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showDemoPanel, setShowDemoPanel] = useState<boolean>(false);
  const [showArrivalModal, setShowArrivalModal] = useState<boolean>(false);
  const [arrivalCandidate, setArrivalCandidate] = useState<{
    location: ParkingLocationDto;
    space: ParkingSpaceDto | null;
  } | null>(null);
  const [isSubmittingArrival, setIsSubmittingArrival] = useState<boolean>(false);
  const [isResettingSeed, setIsResettingSeed] = useState<boolean>(false);

  // Anonymous Session ID for tracking active parking transactions
  const [sessionId, setSessionId] = useState<string>("anon-user");

  // Geofence threshold in meters
  const geofenceThreshold =
    typeof window !== "undefined" && process.env.NEXT_PUBLIC_GEOFENCE_RADIUS_METERS
      ? parseInt(process.env.NEXT_PUBLIC_GEOFENCE_RADIUS_METERS, 10)
      : 80;

  // --- Initial Setup & LocalStorage Hydration ---
  useEffect(() => {
    // 1. Session ID
    let currentSessionId = localStorage.getItem("parksafe_session_id");
    if (!currentSessionId) {
      currentSessionId = "anon-" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("parksafe_session_id", currentSessionId);
    }
    setSessionId(currentSessionId);

    // 2. Stored vehicle preference
    const savedVehicle = localStorage.getItem("parksafe_vehicle") as VehicleType | null;
    const hasVisited = localStorage.getItem("parksafe_visited");

    if (savedVehicle) {
      setVehicleType(savedVehicle);
    }

    if (!hasVisited) {
      setShowLanding(true);
    }

    // 3. Active parked session
    const savedActiveSession = localStorage.getItem("parksafe_active_session");
    if (savedActiveSession) {
      try {
        setActiveSession(JSON.parse(savedActiveSession));
      } catch (e) {
        console.error("Failed to parse saved active session", e);
      }
    }
  }, []);

  // --- Fetch Parking Data ---
  const fetchParking = useCallback(
    async (showSpinner = false) => {
      if (showSpinner) setIsRefreshing(true);
      try {
        const response = await ParkingService.getNearbyParking({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radiusKm,
          vehicleType,
        });

        if (response.success && response.data) {
          setLocations(response.data);

          // If a location is currently selected, refresh its details silently
          if (selectedLocation) {
            const updatedSelected = response.data.find((l) => l.id === selectedLocation.id);
            if (updatedSelected) {
              setSelectedLocation(updatedSelected);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching parking locations:", err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [userLocation, radiusKm, vehicleType, selectedLocation]
  );

  // Initial fetch and on dependencies change
  useEffect(() => {
    fetchParking();
  }, [userLocation, radiusKm, vehicleType]);

  // Periodic automatic availability refresh from our backend every 60 seconds
  // (Pauses when document tab is hidden, resumes and refreshes when visible)
  useEffect(() => {
    const REFRESH_INTERVAL_MS = 60000;
    let lastRefreshTime = Date.now();

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return; // Don't refresh when tab is in background
      }
      lastRefreshTime = Date.now();
      fetchParking(false);
    }, REFRESH_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // If more than 60s has elapsed while tab was hidden, refresh immediately
        if (Date.now() - lastRefreshTime >= REFRESH_INTERVAL_MS) {
          lastRefreshTime = Date.now();
          fetchParking(false);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchParking]);

  // --- Real Geolocation Tracking & Arrival Geofence ---
  useEffect(() => {
    // If user has a selected location they are navigating to, watch position
    if (!selectedLocation || activeSession) return;

    const watchId = LocationService.watchPosition((coords) => {
      // Check if within geofence of target
      const arrived = isWithinGeofence(
        coords.latitude,
        coords.longitude,
        selectedLocation.latitude,
        selectedLocation.longitude,
        geofenceThreshold
      );

      if (arrived && !showArrivalModal) {
        setArrivalCandidate({ location: selectedLocation, space: selectedSpace });
        setShowArrivalModal(true);
      }
    });

    return () => {
      LocationService.clearWatch(watchId);
    };
  }, [selectedLocation, selectedSpace, activeSession, geofenceThreshold, showArrivalModal]);

  // --- Handlers ---

  const handleVehicleSelect = (type: VehicleType) => {
    setVehicleType(type);
    localStorage.setItem("parksafe_vehicle", type);
    setShowVehicleSelector(false);
  };

  const handleLandingDismiss = () => {
    setShowLanding(false);
    localStorage.setItem("parksafe_visited", "true");
    // Show vehicle selector immediately after landing
    setShowVehicleSelector(true);
  };

  const handleRequestCurrentLocation = async () => {
    setIsLocating(true);
    const result = await LocationService.getCurrentPosition();
    setIsLocating(false);

    setUserLocation(result.coordinates);
    setLocationLabel(result.isFallback ? "Chennai Central (Default)" : "My Current Location");
  };

  const handleSelectLocationCoordinates = (coords: UserCoordinates, label: string) => {
    setUserLocation(coords);
    setLocationLabel(label);
  };

  const handleSelectLocation = (location: ParkingLocationDto) => {
    setSelectedLocation(location);
    // Find first available space if individual spaces are supported
    if (location.hasIndividualSpaces && location.spaces) {
      const firstOpen = location.spaces.find(
        (s) =>
          s.status === "available" &&
          (s.vehicleType === vehicleType || s.vehicleType === "BOTH")
      );
      setSelectedSpace(firstOpen || null);
    } else {
      setSelectedSpace(null);
    }
    setIsDetailsOpen(true);
  };

  const handleNavigate = (location: ParkingLocationDto) => {
    setSelectedLocation(location);
    NavigationService.openNavigation(location.latitude, location.longitude, location.name);
  };

  // Arrival Confirmation ("Yes, I parked here")
  const handleConfirmParked = async () => {
    if (!arrivalCandidate) return;
    setIsSubmittingArrival(true);

    try {
      const { location, space } = arrivalCandidate;
      // Pass vehicleType to occupy endpoint for strict 2W/4W separation
      await ParkingService.occupy(location.id, vehicleType, space?.id, sessionId);

      // Save active session
      const newActiveSession: ActiveParkingSession = {
        parkingLocationId: location.id,
        parkingName: location.name,
        spaceId: space?.id || null,
        spaceIdentifier: space?.spaceIdentifier || null,
        vehicleType,
        parkedAt: new Date().toISOString(),
        latitude: location.latitude,
        longitude: location.longitude,
      };

      setActiveSession(newActiveSession);
      localStorage.setItem("parksafe_active_session", JSON.stringify(newActiveSession));

      setShowArrivalModal(false);
      setIsDetailsOpen(false);
      // Immediately refresh map data from our backend
      await fetchParking(true);
    } catch (err: any) {
      alert(err.message || "Failed to confirm parking");
    } finally {
      setIsSubmittingArrival(false);
    }
  };

  // Departure ("Mark Available & Leave")
  const handleVacateSpot = async () => {
    if (!activeSession) return;
    setIsVacating(true);

    try {
      // Pass active session vehicleType to release spot for that specific vehicle
      await ParkingService.vacate(
        activeSession.parkingLocationId,
        activeSession.vehicleType,
        activeSession.spaceId,
        sessionId
      );

      setActiveSession(null);
      localStorage.removeItem("parksafe_active_session");
      await fetchParking(true);
    } catch (err: any) {
      alert(err.message || "Failed to vacate parking spot");
    } finally {
      setIsVacating(false);
    }
  };

  // Submit User Report
  const handleSubmitReport = async (
    locationId: string,
    reportType: string,
    details?: string,
    spaceId?: string | null,
    reportVehicleType?: string
  ) => {
    await ParkingService.report(
      locationId,
      reportVehicleType || vehicleType,
      reportType,
      details,
      spaceId
    );
    await fetchParking(false);
  };

  // Demo / Simulation: Instant Arrival Trigger
  const handleSimulateArrival = (
    loc?: ParkingLocationDto | null,
    sp?: ParkingSpaceDto | null
  ) => {
    const targetLoc = loc || selectedLocation || locations[0];
    if (!targetLoc) {
      alert("No parking location available to simulate arrival.");
      return;
    }

    setArrivalCandidate({
      location: targetLoc,
      space: sp || selectedSpace || (targetLoc.spaces ? targetLoc.spaces[0] : null),
    });
    setShowArrivalModal(true);
  };

  // Demo: Reset seed data
  const handleResetSeedData = async () => {
    setIsResettingSeed(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_seed" }),
      });
      if (res.ok) {
        localStorage.removeItem("parksafe_active_session");
        setActiveSession(null);
        await fetchParking(true);
      }
    } catch (e) {
      console.error("Reset failed", e);
    } finally {
      setIsResettingSeed(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100">
      {/* Driver Safety Banner */}
      <SafetyNotice />

      {/* Top Header */}
      <Header
        vehicleType={vehicleType}
        onVehicleChange={handleVehicleSelect}
        onRefresh={() => fetchParking(true)}
        isRefreshing={isRefreshing}
        onOpenSearch={() => setShowSearchModal(true)}
        activeLocationLabel={locationLabel}
        onToggleDemoPanel={() => setShowDemoPanel(!showDemoPanel)}
        showDemoPanel={showDemoPanel}
      />

      {/* Main Content Area: Split View for Desktop, Full Map + Bottom Sheet for Mobile */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Desktop Sidebar: Nearby Parking Panel (Width ~420px) */}
        <aside className="hidden sm:flex flex-col w-[380px] lg:w-[440px] h-full bg-white border-r border-slate-200 z-10 shadow-lg">
          {/* Quick search input trigger inside sidebar */}
          <div className="p-3 border-b border-slate-100">
            <button
              onClick={() => setShowSearchModal(true)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 transition"
            >
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{locationLabel}</span>
              </div>
              <span className="font-bold text-[10px] text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Change Area
              </span>
            </button>
          </div>

          <NearbyParking
            locations={locations}
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
            onNavigate={handleNavigate}
            userVehicleType={vehicleType}
            radiusKm={radiusKm}
            onExpandRadius={() => setRadiusKm(15)}
            isLoading={isLoading}
            onOpenSearch={() => setShowSearchModal(true)}
          />

          {/* Footer note in sidebar */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Chennai Public Parking • OSM Data</span>
            <PrivacyNotice />
          </div>
        </aside>

        {/* Map Area */}
        <main className="flex-1 relative h-full">
          <MapView
            locations={locations}
            userLocation={userLocation}
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
            radiusKm={radiusKm}
            onRadiusChange={(r) => setRadiusKm(r)}
            onRecenter={handleRequestCurrentLocation}
            userVehicleType={vehicleType}
          />

          {/* Mobile Search Overlay Bar */}
          <div className="sm:hidden absolute top-3 inset-x-3 z-20">
            <button
              onClick={() => setShowSearchModal(true)}
              className="w-full bg-white/95 backdrop-blur p-3 rounded-2xl shadow-float border border-slate-200 flex items-center justify-between text-xs text-slate-700 font-semibold"
            >
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">{locationLabel}</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Search
              </span>
            </button>
          </div>
        </main>

        {/* Mobile Bottom Sheet for Nearby Parking */}
        <BottomSheet headerTitle="Nearby Parking" badgeCount={locations.length}>
          <NearbyParking
            locations={locations}
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
            onNavigate={handleNavigate}
            userVehicleType={vehicleType}
            radiusKm={radiusKm}
            onExpandRadius={() => setRadiusKm(15)}
            isLoading={isLoading}
            onOpenSearch={() => setShowSearchModal(true)}
          />
        </BottomSheet>
      </div>

      {/* Active Parked Banner (when driver is parked) */}
      <ActiveParkingBanner
        session={activeSession}
        onVacate={handleVacateSpot}
        isVacating={isVacating}
      />

      {/* Parking Details Modal */}
      {isDetailsOpen && (
        <ParkingDetailsModal
          location={selectedLocation}
          onClose={() => setIsDetailsOpen(false)}
          userVehicleType={vehicleType}
          selectedSpace={selectedSpace}
          onSelectSpace={(space) => setSelectedSpace(space)}
          onOpenReport={(loc, sp) => {
            setShowReportModal(true);
          }}
          onSimulateArrival={(loc, sp) => {
            handleSimulateArrival(loc, sp);
          }}
        />
      )}

      {/* Arrival Confirmation Geofence Modal */}
      <ArrivalConfirmation
        isOpen={showArrivalModal}
        location={arrivalCandidate?.location || null}
        space={arrivalCandidate?.space || null}
        onConfirmParked={handleConfirmParked}
        onDismiss={() => {
          setShowArrivalModal(false);
          setArrivalCandidate(null);
        }}
        isSubmitting={isSubmittingArrival}
      />

      {/* Location Search Modal */}
      <LocationSearch
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectCoordinates={handleSelectLocationCoordinates}
        onRequestCurrentLocation={handleRequestCurrentLocation}
        isLocating={isLocating}
        currentLabel={locationLabel}
      />

      {/* Vehicle Selection Modal */}
      <VehicleSelector
        isOpen={showVehicleSelector}
        selectedVehicle={vehicleType}
        onSelect={handleVehicleSelect}
        onClose={() => setShowVehicleSelector(false)}
      />

      {/* Landing Page Welcome Modal */}
      <LandingModal
        isOpen={showLanding}
        onFindParking={handleLandingDismiss}
      />

      {/* Crowdsourced Report Discrepancy Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        location={selectedLocation}
        space={selectedSpace}
        userVehicleType={vehicleType}
        onSubmitReport={handleSubmitReport}
      />

      {/* Demo Controls / Presentation Panel */}
      <DemoControls
        isOpen={showDemoPanel}
        onClose={() => setShowDemoPanel(false)}
        vehicleType={vehicleType}
        onVehicleChange={handleVehicleSelect}
        onJumpToCoordinates={handleSelectLocationCoordinates}
        onTriggerArrival={() => handleSimulateArrival(locations[0], null)}
        onResetSeedData={handleResetSeedData}
        nearestLocation={locations[0]}
        isResetting={isResettingSeed}
      />
    </div>
  );
}
