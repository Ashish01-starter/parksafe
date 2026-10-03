import { UserCoordinates } from "../types";

export interface GeolocationResult {
  coordinates: UserCoordinates;
  isFallback: boolean;
  error?: string;
}

export const CHENNAI_DEFAULT_COORDS: UserCoordinates = {
  latitude: 13.0827,
  longitude: 80.2707,
};

export class LocationService {
  /**
   * Requests single current position from browser Geolocation API
   */
  static async getCurrentPosition(): Promise<GeolocationResult> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return {
        coordinates: CHENNAI_DEFAULT_COORDS,
        isFallback: true,
        error: "Geolocation is not supported by your browser.",
      };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            },
            isFallback: false,
          });
        },
        (error) => {
          let errorMsg = "Unable to retrieve your location.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = "Location permission was denied. Defaulting to Chennai Central.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMsg = "Location request timed out.";
              break;
          }
          resolve({
            coordinates: CHENNAI_DEFAULT_COORDS,
            isFallback: true,
            error: errorMsg,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 15000,
        }
      );
    });
  }

  /**
   * Watches user location for arrival geofence detection while on-screen
   */
  static watchPosition(
    onSuccess: (coords: UserCoordinates) => void,
    onError?: (err: GeolocationPositionError) => void
  ): number | null {
    if (typeof window === 'undefined' || !navigator.geolocation) return null;

    return navigator.geolocation.watchPosition(
      (position) => {
        onSuccess({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      onError,
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 5000,
      }
    );
  }

  static clearWatch(watchId: number | null) {
    if (watchId !== null && typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }
}
