import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistance(distanceKm?: number): string {
  if (distanceKm === undefined || distanceKm === null) return "Unknown distance";
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export function formatTimeAgo(isoDateString?: string | null): string {
  if (!isoDateString) return "Never";
  const diffMs = Date.now() - new Date(isoDateString).getTime();
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getParkingTypeLabel(type?: string): string {
  switch (type) {
    case "multi_storey": return "Multi-Level Parking";
    case "underground": return "Underground Parking";
    case "surface": return "Surface Parking Lot";
    case "street": return "Street Parking";
    case "mall": return "Mall Parking";
    case "metro": return "Metro Station Parking";
    case "railway": return "Railway Station Parking";
    case "college_university": return "College / University Parking";
    case "institutional": return "Public Institutional Parking";
    case "parking_lot": return "Public Parking Lot";
    default: return "Public Parking";
  }
}
