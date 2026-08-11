/**
 * Location Service
 * Handles Haversine distance calculations and stop detection logic
 */

interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in meters
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) *
      Math.cos(toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if bus is approaching a stop (within approachThreshold)
 * @param busLocation Current bus location
 * @param stopLocation Stop location
 * @param approachThreshold Distance threshold in meters (default: 300m)
 * @returns true if within approach threshold
 */
export function isApproachingStop(
  busLocation: Coordinates,
  stopLocation: Coordinates,
  approachThreshold: number = 300
): boolean {
  const distance = calculateDistance(busLocation, stopLocation);
  return distance <= approachThreshold;
}

/**
 * Check if bus has arrived at a stop (within arrivalThreshold)
 * @param busLocation Current bus location
 * @param stopLocation Stop location
 * @param arrivalThreshold Distance threshold in meters (default: 50m)
 * @returns true if within arrival threshold
 */
export function hasArrivedAtStop(
  busLocation: Coordinates,
  stopLocation: Coordinates,
  arrivalThreshold: number = 50
): boolean {
  const distance = calculateDistance(busLocation, stopLocation);
  return distance <= arrivalThreshold;
}

/**
 * Get distance to stop in meters
 * @param busLocation Current bus location
 * @param stopLocation Stop location
 * @returns Distance in meters
 */
export function getDistanceToStop(busLocation: Coordinates, stopLocation: Coordinates): number {
  return calculateDistance(busLocation, stopLocation);
}
