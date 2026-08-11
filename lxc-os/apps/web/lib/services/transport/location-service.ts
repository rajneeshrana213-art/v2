
interface Coordinates {
  latitude: number;
  longitude: number;
}

export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  if (!coord1 || !coord2) return 0;
  const R = 6371000;
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

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function isApproachingStop(
  busLocation: Coordinates,
  stopLocation: Coordinates,
  approachThreshold: number = 300
): boolean {
  const distance = calculateDistance(busLocation, stopLocation);
  return distance <= approachThreshold;
}

export function hasArrivedAtStop(
  busLocation: Coordinates,
  stopLocation: Coordinates,
  arrivalThreshold: number = 50
): boolean {
  const distance = calculateDistance(busLocation, stopLocation);
  return distance <= arrivalThreshold;
}

export function getDistanceToStop(busLocation: Coordinates, stopLocation: Coordinates): number {
  return calculateDistance(busLocation, stopLocation);
}
