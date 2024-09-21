import React, { useRef, useState, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";


const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: 27.1751,
  lng: 78.0421,
};

function App() {
  const [map, setMap] = useState(null);
  const [directionResponse, setDirectionResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [time, setTime] = useState("");
  const [carPosition, setCarPosition] = useState(center); // Initial car position
  const [path, setPath] = useState([]); // To store the extracted path
  const [stepIndex, setStepIndex] = useState(0); // Track current position along the path

  const startRef = useRef(null);
  const destinationRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_KEY,
    libraries: ["places"],
  });

  const [carIcon, setCarIcon] = useState(null);

  useEffect(() => {
    if (isLoaded) {
      setCarIcon({
        url: require("../src/assets/car.png"),
        scaledSize: new window.google.maps.Size(50, 50),
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(25, 50),
      });
    }
  }, [isLoaded]);

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

  async function calculateRoute() {
    if (startRef.current.value === "" || destinationRef.current.value === "") {
      return alert("Enter values in both fields");
    }

    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: startRef.current.value,
      destination: destinationRef.current.value,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    });

    setDirectionResponse(results);
    setDistance(results.routes[0].legs[0].distance.text);
    setTime(results.routes[0].legs[0].duration.text);

    // Extract the route path from the directions result
    const routePath = results.routes[0].overview_path; // Overview path contains the full route
    setPath(routePath); // Set the path to be followed by the car
    setStepIndex(0); // Reset the step index
    setCarPosition(routePath[0]); // Set the car to the starting position
  }

  function clearRoute() {
    startRef.current.value = "";
    destinationRef.current.value = "";
    setDirectionResponse(null);
    setDistance("");
    setTime("");
    setPath([]);
    setStepIndex(0);
    setCarPosition(center); // Reset car position to the center
  }

  return isLoaded ? (
    <>
      <div className="inputContainer">
        <Autocomplete>
          <input
            className="inputElement"
            type="text"
            placeholder="Start"
            ref={startRef}
          />
        </Autocomplete>
        <Autocomplete>
          <input
            className="inputElement"
            type="text"
            placeholder="Destination"
            ref={destinationRef}
          />
        </Autocomplete>
        <div className="info">
          <p className="distance">Distance: {distance}</p>
          <p className="time">Time: {time}</p>
        </div>
        <div className="buttons">
          <button className="centerBtn" type="submit" onClick={calculateRoute}>
            Search
          </button>
          <button className="centerBtn" onClick={() => map.panTo(center)}>
            Center
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
        onLoad={(map) => setMap(map)}
      >
        {/* Marker that moves along the route */}
        {carIcon && (
          <Marker position={carPosition} icon={carIcon} title="Car location" />
        )}

        {/* Render the directions route */}
        {directionResponse && (
          <DirectionsRenderer directions={directionResponse} />
        )}
      </GoogleMap>
    </>
  ) : (
    <></>
  );
}

export default App;
