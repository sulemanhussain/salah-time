import { useState, useEffect, useRef } from 'react'
import './App.css'
import { LoadScript } from '@react-google-maps/api';
import MapContainer from './comonents/MapContainer';

function App() {
  const [coordinates, setCoordinates] = useState({});
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
          <LoadScript googleMapsApiKey={ import.meta.env.VITE_GOOGLE_MAPS_API_KEY } libraries={ ["places", "marker"] }>
            <MapContainer apiKey={ import.meta.env.VITE_GOOGLE_MAPS_API_KEY } coordinates={coordinates} />
          </LoadScript>
        )
        :
        (
          <>
            <p>No map</p>
            <p>{ messageRef.current }</p>
          </>
        ) 
      }
    </div>
  )
}

export default App
