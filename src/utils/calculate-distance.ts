interface Coordinate {
  latitude: number;
  longitude: number;
}

// Use the Haversine formula to calculate the distance between two coordinates
export function calculateDistance(coord1: Coordinate, coord2: Coordinate) {
  // Radius of the earth in kilometers
  const earthRadius = 6371;

  // Convert latitude and longitude from degrees to radians
  const latitudeDifference = degreesToRadians(
    coord2.latitude - coord1.latitude
  );
  const longitudeDifference = degreesToRadians(
    coord2.longitude - coord1.longitude
  );

  // Calculate the distance between the two coordinates
  const a =
    Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2) +
    Math.cos(degreesToRadians(coord1.latitude)) *
      Math.cos(degreesToRadians(coord2.latitude)) *
      Math.sin(longitudeDifference / 2) *
      Math.sin(longitudeDifference / 2);

  // Calculate the central angle
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Calculate the distance in kilometers and round to 0 dp
  const distance = Math.round(earthRadius * c);
  return distance;
}

// Converts degrees to radians
function degreesToRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}
