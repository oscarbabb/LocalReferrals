/**
 * Calculate the great-circle distance between two points on Earth
 * using the Haversine formula
 * 
 * @param lat1 Latitude of first point (in degrees)
 * @param lon1 Longitude of first point (in degrees)
 * @param lat2 Latitude of second point (in degrees)
 * @param lon2 Longitude of second point (in degrees)
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  
  // Convert degrees to radians
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const deltaLatRad = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLonRad = ((lon2 - lon1) * Math.PI) / 180;
  
  // Haversine formula
  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLonRad / 2) *
      Math.sin(deltaLonRad / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  const distance = R * c; // Distance in kilometers
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Check if coordinates are valid
 */
export function areCoordinatesValid(lat?: number | null, lon?: number | null): boolean {
  if (lat === null || lat === undefined || lon === null || lon === undefined) {
    return false;
  }
  
  // Check if values are finite numbers (not NaN, Infinity, etc.)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return false;
  }
  
  // Check if latitude is between -90 and 90
  if (lat < -90 || lat > 90) {
    return false;
  }
  
  // Check if longitude is between -180 and 180
  if (lon < -180 || lon > 180) {
    return false;
  }
  
  return true;
}
