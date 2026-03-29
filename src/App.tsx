import { useState, useEffect, useRef } from 'react'
import './App.css'
import { LoadScript } from '@react-google-maps/api';
import MapContainer from './comonents/MapContainer';

let isLocationEnabled = true;

function App() {
  const [coordinates, setCoordinates] = useState({});
  const [libraries, setLibraries] = useState(["places", "marker"]);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  const messageRef = useRef("Loading....");

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        setCoordinates(prevCords => ({
          ...prevCords,
          lat: latitude,
          lng: longitude
        }));

      }, (error) => {
        isLocationEnabled = false;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            messageRef.current = "User denied the request for geolocation.";
            break;
          case error.POSITION_UNAVAILABLE:
            messageRef.current = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            messageRef.current = "The request to get user location timed out.";
            break;
        }
      })
    } else {
      alert("Geolocation is not supported by this browser.");
      messageRef.current = "Geolocation is not supported by this browser.";
    }
  })

  return (
    <div className='App'>
      {
        coordinates 
        ?
        (
          <LoadScript googleMapsApiKey={ apiKey } libraries={ libraries }>
            <MapContainer apiKey={apiKey} coordinates={coordinates} />
          </LoadScript>
        )
        :
        (
          <p>No map</p>
        ) 
      }
    </div>
  )
}

export default App
