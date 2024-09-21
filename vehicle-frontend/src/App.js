import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  DirectionsRenderer,
} from "@react-google-maps/api";
import "./App.css"

const containerStyle = {
  width: "100%",
  height: "100vh",
};

function App() {
  const center = {
    lat: 19.94817,
    lng: 73.84167000000001,
  };
  // const [map, setMap] = useState(null);
  const [directionResponse, setDirectionResponse] = useState(null);
  const [carPosition, setCarPosition] = useState(center); // Initial car position
  const [path, setPath] = useState([]); // To store the extracted path
  const [stepIndex, setStepIndex] = useState(0); // Track current position along the path

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_KEY,
    libraries: ["places"],
  });

  const [carIcon, setCarIcon] = useState(null);

//custom icon put on the map as soon as map loaded on screen
  useEffect(() => {
    if (isLoaded) {
      setCarIcon({
        url: require("../src/assets/car.png"),
        scaledSize: new window.google.maps.Size(40, 40),
        origin: new window.google.maps.Point(0,0),
        // anchor: new window.google.maps.Point(25, 50),
      });
    }
  }, [isLoaded]);

  const [coordinates, setCoordinates] = useState(null);

  // Fetching route coordinates
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("https://vehicle-movement-iota.vercel.app/route-coordinates");
        const result = await response.json();
        setCoordinates(result);
      } catch (err) {
        console.error("Error fetching coordinates:", err);
      }
    }
    fetchData();
  }, []);


  async function calculateRoute() {
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: coordinates[0],
      destination: coordinates[coordinates.length - 1],
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    });

    setDirectionResponse(results);

    // Extract the route path from the directions result
    const routePath = results.routes[0].overview_path; // Overview path contains the full route
    setPath(routePath); // Set the path to be followed by the car
    setStepIndex(0); // Reset the step index
    setCarPosition(routePath[0]); // Set the car to the starting position
  }

   // Move the car along the path every 2 seconds
   useEffect(() => {
    if (path.length > 0 && stepIndex < path.length) {
      const interval = setInterval(() => {
        setCarPosition(path[stepIndex]);
        setStepIndex((prevIndex) => prevIndex + 1);
      }, 2000);

      return () => clearInterval(interval); // Clear the interval when unmounting or when the path changes
    }
  }, [path, stepIndex]);

  function clearRoute() {
    setDirectionResponse(null);
    setPath([]);
    setStepIndex(0);
    setCarPosition(center); // Reset car position to the center
  }

  return isLoaded ? (
    <>
      <div className="inputContainer">
        <div className="buttons">
          <button className="centerBtn" type="submit" onClick={calculateRoute}>
            Start
          </button>
          <button className="centerBtn" onClick={clearRoute}>
            Reset
          </button>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={carPosition} // Center the map on the car's current position
        zoom={13}
        // onLoad={(map) => setMap(map)}
      >
        {/* Marker that moves along the route */}
        {carIcon && (
          <Marker position={carPosition} icon={carIcon} title="Car location" />
        )}

        {/* Render the directions route */}
        {directionResponse && (
          <DirectionsRenderer directions={directionResponse}/>
        )}
      </GoogleMap>
    </>
  ) : (
    <></>
  );
}

export default App;
