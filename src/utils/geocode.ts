// Use the tom tom API to get coordinates of item
export const geocodeAddress = async (
  street: string,
  city: string,
  postcode: string
) => {
  // Concatenate the address
  const address = `${street}, ${city}, ${postcode}`;

  // Fetch the data from the API
  const response = await fetch(
    `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(
      address
    )}.json?key=${process.env.TOMTOM_API_KEY}`
  );

  // Check if the response is ok
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  // Parse the data
  const data = await response.json();

  // Check if the data has results
  if (data.results && data.results.length > 0) {
    // Get the position
    const position = data.results[0].position;
    return { latitude: position.lat, longitude: position.lon };
  }

  throw new Error("Unable to geocode address");
};
