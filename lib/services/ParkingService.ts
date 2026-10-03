import { ParkingLocationDto, VehicleType } from "../types";

export class ParkingService {
  /**
   * Fetches nearby compatible parking locations with live availability
   */
  static async getNearbyParking(params: {
    latitude: number;
    longitude: number;
    radiusKm?: number;
    vehicleType?: VehicleType;
  }): Promise<{ success: boolean; data: ParkingLocationDto[]; count: number }> {
    const searchParams = new URLSearchParams();
    searchParams.set("lat", params.latitude.toString());
    searchParams.set("lng", params.longitude.toString());
    if (params.radiusKm) searchParams.set("radiusKm", params.radiusKm.toString());
    if (params.vehicleType) searchParams.set("vehicleType", params.vehicleType);

    const res = await fetch(`/api/parking?${searchParams.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to load parking locations: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Fetches full details for a parking location, including individual space statuses
   */
  static async getParkingDetails(id: string): Promise<ParkingLocationDto> {
    const res = await fetch(`/api/parking/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to load details for parking ${id}`);
    }
    const json = await res.json();
    return json.data;
  }

  /**
   * Marks a space or spot as occupied
   */
  static async occupy(
    parkingLocationId: string,
    vehicleType: VehicleType = "FOUR_WHEELER",
    spaceId?: string | null,
    sessionId?: string
  ) {
    const res = await fetch(`/api/parking/${parkingLocationId}/occupy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleType, spaceId, sessionId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to mark parking space occupied");
    }
    return res.json();
  }

  /**
   * Marks a space or spot as vacated / available
   */
  static async vacate(
    parkingLocationId: string,
    vehicleType: VehicleType = "FOUR_WHEELER",
    spaceId?: string | null,
    sessionId?: string
  ) {
    const res = await fetch(`/api/parking/${parkingLocationId}/vacate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleType, spaceId, sessionId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to vacate parking space");
    }
    return res.json();
  }

  /**
   * Submits crowdsourced availability report
   */
  static async report(
    parkingLocationId: string,
    vehicleType: string = "ALL",
    reportType: string = "other",
    details?: string,
    spaceId?: string | null,
    reportedAvailability?: number | null
  ) {
    const res = await fetch(`/api/parking/${parkingLocationId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleType, reportType, details, spaceId, reportedAvailability }),
    });
    if (!res.ok) {
      throw new Error("Failed to submit report");
    }
    return res.json();
  }
}
