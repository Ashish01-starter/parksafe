"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import { ParkingLocationDto, UserCoordinates, VehicleType } from "@/lib/types";
import { getParkingTypeLabel } from "@/lib/utils";

interface MapInnerProps {
  locations: ParkingLocationDto[];
  userLocation: UserCoordinates;
  selectedLocation: ParkingLocationDto | null;
  onSelectLocation: (loc: ParkingLocationDto) => void;
  radiusKm: number;
  userVehicleType: VehicleType;
}

// Controller component to smoothly pan/zoom when userLocation or selectedLocation changes
function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom || map.getZoom(), { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// Custom Leaflet DivIcon generator for parking pins
function createParkingIcon(
  location: ParkingLocationDto,
  isSelected: boolean,
  userVehicleType: VehicleType
) {
  const is2W = userVehicleType === "TWO_WHEELER";
  const available = is2W ? location.availableTwoWheelerSpaces : location.availableCarSpaces;
  const status = is2W ? location.twoWheelerAvailabilityStatus : location.carAvailabilityStatus;

  let badgeColor = "bg-slate-700 border-slate-800 text-slate-100";
  let statusEmoji = "⚪";
  let statusText = is2W ? "2W Map" : "4W Map";

  if (available !== null && available !== undefined && status !== "UNKNOWN" && status !== undefined) {
    if (status === "FULL" || available === 0) {
      badgeColor = "bg-rose-600 border-rose-700 text-white";
      statusEmoji = "🔴";
      statusText = "Full";
    } else if (status === "LIMITED" || available <= 3) {
      badgeColor = "bg-amber-500 border-amber-600 text-white";
      statusEmoji = "🟡";
      statusText = `${available} left`;
    } else {
      badgeColor = "bg-emerald-600 border-emerald-700 text-white";
      statusEmoji = "🟢";
      statusText = `${available} open`;
    }
  }

  const selectedRing = isSelected ? "ring-4 ring-emerald-500 ring-offset-2 scale-110 z-50" : "";

  const html = `
    <div class="custom-parking-marker flex flex-col items-center transition-all ${selectedRing}">
      <div class="px-2 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 shadow-md border ${badgeColor} whitespace-nowrap">
        <span>${statusEmoji}</span>
        <span>${statusText}</span>
      </div>
      <div class="w-2.5 h-2.5 bg-slate-900 rotate-45 -mt-1 shadow-sm"></div>
    </div>
  `;

  return L.divIcon({
    className: "custom-leaflet-marker",
    html,
    iconSize: [80, 36],
    iconAnchor: [40, 36],
    popupAnchor: [0, -36],
  });
}

// User location marker icon
const userIcon = L.divIcon({
  className: "custom-leaflet-marker",
  html: `<div class="user-location-pulse"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// MarkerClusterGroup component managing all locations
function ParkingClusterGroup({
  locations,
  selectedLocation,
  onSelectLocation,
  userVehicleType,
}: {
  locations: ParkingLocationDto[];
  selectedLocation: ParkingLocationDto | null;
  onSelectLocation: (loc: ParkingLocationDto) => void;
  userVehicleType: VehicleType;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Initialize Leaflet Marker Cluster
    const markerClusterGroup = (L as any).markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 45,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        let bg = "bg-emerald-600";
        if (count >= 25) bg = "bg-emerald-800";
        else if (count >= 10) bg = "bg-emerald-700";

        return L.divIcon({
          html: `<div class="w-9 h-9 rounded-full flex items-center justify-center ${bg} text-white border-2 border-white shadow-lg text-xs font-black">${count}</div>`,
          className: "custom-cluster-icon",
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
      },
    });

    locations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id;
      const icon = createParkingIcon(loc, isSelected, userVehicleType);
      const marker = L.marker([loc.latitude, loc.longitude], { icon });

      const is2W = userVehicleType === "TWO_WHEELER";
      const available = is2W ? loc.availableTwoWheelerSpaces : loc.availableCarSpaces;
      const capacity = is2W ? loc.twoWheelerCapacity : loc.carCapacity;
      const isUnknown = available === null;

      const popupContent = document.createElement("div");
      popupContent.className = "p-1 max-w-[200px]";
      popupContent.innerHTML = `
        <div class="font-extrabold text-xs text-slate-900 leading-tight mb-1">
          ${loc.name}
        </div>
        <div class="text-[11px] text-slate-500 mb-2">
          ${getParkingTypeLabel(loc.parkingType)} • ${loc.area}
        </div>
        <div class="flex items-center justify-between text-xs mb-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
          <span class="text-slate-600 font-medium">${is2W ? "2W Spots:" : "4W Spots:"}</span>
          <span class="font-bold text-slate-900">
            ${isUnknown ? "Unverified" : `${available} / ${capacity || "?"}`}
          </span>
        </div>
      `;

      const selectBtn = document.createElement("button");
      selectBtn.className =
        "w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition shadow-xs";
      selectBtn.innerText = "Select & View Spaces";
      selectBtn.onclick = () => onSelectLocation(loc);

      popupContent.appendChild(selectBtn);
      marker.bindPopup(popupContent);

      marker.on("click", () => {
        onSelectLocation(loc);
      });

      markerClusterGroup.addLayer(marker);
    });

    map.addLayer(markerClusterGroup);

    return () => {
      map.removeLayer(markerClusterGroup);
    };
  }, [map, locations, selectedLocation, onSelectLocation, userVehicleType]);

  return null;
}

export default function MapInner({
  locations,
  userLocation,
  selectedLocation,
  onSelectLocation,
  radiusKm,
  userVehicleType,
}: MapInnerProps) {
  const mapCenter: [number, number] = selectedLocation
    ? [selectedLocation.latitude, selectedLocation.longitude]
    : [userLocation.latitude, userLocation.longitude];

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      scrollWheelZoom={true}
      className="w-full h-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController center={mapCenter} />

      {/* Geofence / Search Radius Circle */}
      <Circle
        center={[userLocation.latitude, userLocation.longitude]}
        radius={radiusKm * 1000}
        pathOptions={{
          color: "#10b981",
          fillColor: "#10b981",
          fillOpacity: 0.05,
          weight: 1.5,
          dashArray: "4, 6",
        }}
      />

      {/* User GPS Location Marker */}
      <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
        <Popup>
          <div className="text-xs p-1 font-medium text-slate-800">
            <strong>Your Location</strong>
            <p className="text-[11px] text-slate-500">Searching within {radiusKm} km radius</p>
          </div>
        </Popup>
      </Marker>

      {/* Clustered Parking Markers */}
      <ParkingClusterGroup
        locations={locations}
        selectedLocation={selectedLocation}
        onSelectLocation={onSelectLocation}
        userVehicleType={userVehicleType}
      />
    </MapContainer>
  );
}
