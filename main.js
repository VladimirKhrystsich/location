// Amazon Location Service resource names:
const mapName = "best-map.map";
const placesName = "explore.map.Esri";
const region = "eu-north-1";
const apiKey = "v1.public.eyJqdGkiOiI1MGI4ZjM5My01N2IzLTRlYTEtYWQ2MS0zMDI2NGZjM2MyYmMifT1nsKpKdOpGxB1W8p-XA20vnzJFBiC9JoSDKlQBjPlvsK6M62UQ1upg-bC66KAp3C8z8KyarjohIB9iF891nR9lNSaXGOW1o7nEbs1l-0tOpmc-kyK1OwxPUsdOlSmWRnSkwtJ9cszmnF1YTnw1Dt3yuIEKJXN7Rt_8XCRJxCzzXHBOBuPhZ7Ud7Mysb3cA1ceCOtcrJzGYpvVa6YYelD20YXbwPv4Cdgq5NBsiCARzG5N_JXBloc4klUhC80BAWIMJehqcCDhEv0qv3TqRouM8pCOO3HEJb0U0TIRbhFPrwYl4O7nz6QW24Tgk3qwEOJ5Ox5UMNyBuKbeyqeXUDCg.N2IyNTQ2ODQtOWE1YS00MmI2LTkyOTItMGJlNGMxODU1Mzc2";

// Initialize a map
async function initializeMap() {
  // Initialize the map
  const mlglMap = new maplibregl.Map({
    container: "map", // HTML element ID of map element
    center: [-77.03674, 38.891602], // Initial map centerpoint
    zoom: 16, // Initial map zoom
    style: `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor?key=${apiKey}`, // Defines the appearance of the map and authenticates using an API key
  });

  // Add navigation control to the top left of the map
  mlglMap.addControl(new maplibregl.NavigationControl(), "top-left");

  return mlglMap;
}

async function main() {
  // Create an authentication helper instance using an API key
  const authHelper = await amazonLocationAuthHelper.withAPIKey(apiKey);

  // Initialize map and Amazon Location SDK client
  const map = await initializeMap();
  const client = new amazonLocationClient.LocationClient({
    region,
    ...authHelper.getLocationClientConfig(), // Provides configuration required to make requests to Amazon Location
  });

  // Variable to hold marker that will be rendered on click
  let marker;

  // On mouse click, display marker and get results:
  map.on("click", async function (e) {
    // Remove any existing marker
    if (marker) {
      marker.remove();
    }

    // Render a marker on clicked point
    marker = new maplibregl.Marker().setLngLat([e.lngLat.lng, e.lngLat.lat]).addTo(map);

    // Set up parameters for search call
    let params = {
      IndexName: placesName,
      Position: [e.lngLat.lng, e.lngLat.lat],
      Language: "en",
      MaxResults: "5",
    };

    // Set up command to search for results around clicked point
    const searchCommand = new amazonLocationClient.SearchPlaceIndexForPositionCommand(params);

    try {
      // Make request to search for results around clicked point
      const data = await client.send(searchCommand);

      // Write JSON response data to HTML
      document.querySelector("#response").textContent = JSON.stringify(data, undefined, 2);

      // Display place label in an alert box
      alert(data.Results[0].Place.Label);
    } catch (error) {
      // Write JSON response error to HTML
      document.querySelector("#response").textContent = JSON.stringify(error, undefined, 2);

      // Display error in an alert box
      alert("There was an error searching.");
    }
  });
}

main();
}

main();
