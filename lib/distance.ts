/**
 * Distance, Geofencing, and Travel Time estimation utilities
 */

/**
 * Calculates Great-Circle distance using Haversine formula between two lat/lng pairs in kilometers
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates distance in meters
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  return calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) * 1000;
}

/**
 * Checks whether user coordinates are within the arrival geofence (e.g. 50-100m)
 */
export function isWithinGeofence(
  userLat: number,
  userLon: number,
  targetLat: number,
  targetLon: number,
  thresholdMeters: number = 80
): boolean {
  const distance = calculateDistanceMeters(userLat, userLon, targetLat, targetLon);
  return distance <= thresholdMeters;
}

/**
 * Estimates travel time in minutes based on urban driving conditions (Chennai average ~22-26 km/h)
 */
export function estimateTravelTimeMinutes(
  distanceKm: number,
  vehicleType: 'TWO_WHEELER' | 'FOUR_WHEELER' = 'FOUR_WHEELER'
): number {
  // Two wheelers navigate Chennai traffic slightly faster (approx 28 km/h vs 22 km/h)
  const avgSpeedKmH = vehicleType === 'TWO_WHEELER' ? 28 : 22;
  const timeHours = distanceKm / avgSpeedKmH;
  const timeMinutes = Math.round(timeHours * 60) + 1; // 1 min buffer
  return Math.max(1, timeMinutes);
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
