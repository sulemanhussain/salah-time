import { useState, useEffect } from 'react'
import type { ReactNode } from 'react';
import './App.css'
import MapContainer from './components/MapContainer';
import NavigationBar from './components/NavigationBar';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import LocationServiceOff from './components/LocationServiceOff';
import Settings from './components/Settings';
import { isAuthenticated } from './utils/auth-cookie';

type Coordinates = { lat?: number; lng?: number };
type GeolocationStatus = 'loading' | 'success' | 'error';

function RootRoute() {
  return <Navigate to={isAuthenticated() ? "/app" : "/login"} replace />;
}

function LoginRoute() {
  return isAuthenticated() ? <Navigate to="/app" replace /> : <Login />;
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const [coordinates, setCoordinates] = useState<Coordinates>({});
  const [geoStatus, setGeoStatus] = useState<GeolocationStatus>(
    "geolocation" in navigator ? 'loading' : 'error'
  );
  const [geoError, setGeoError] = useState<string>(
    "geolocation" in navigator ? '' : 'Geolocation is not supported by this browser.'
  );
  const [permissionStatus, setPermissionStatus] = useState(null);

 useEffect(() => {
  const internval = setInterval(() => {
    // Check if the Permissions API is supported
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionStatus(result.state);

        // Listen for future changes without reload
        result.onchange = () => {
          setPermissionStatus(result.state);
          if (result.state === 'granted') {
             // Logic to fetch location automatically when enabled
             console.log(geoError);
             clearInterval(internval); // Stop checking once permission is granted
          }
        };
      });
    }
  }, 3000);

  return () => clearInterval(internval);
  }, []);
  
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGeoStatus('success');
        setGeoError('');
      },
      (error) => {
        setGeoStatus('error');
        const errorMessages: Record<number, string> = {
          [GeolocationPositionError.PERMISSION_DENIED]: 'Location access denied. Please enable it in your browser settings.',
          [GeolocationPositionError.POSITION_UNAVAILABLE]: 'Location information is unavailable.',
          [GeolocationPositionError.TIMEOUT]: 'Location request timed out. Please try again.',
        };
        setGeoError(errorMessages[error.code] || 'Unable to retrieve location.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [permissionStatus]);

  const hasCoordinates = typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number';

  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="/app" element={
        <ProtectedRoute>
          {geoStatus === 'success' && hasCoordinates ? (
            <>
              <MapContainer apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} coordinates={coordinates} />
              <NavigationBar />
            </>
          ) : (
            <>
              <div className='h-full flex flex-col items-center justify-center text-center text-gray-600'>
                {geoStatus === 'loading' && (
                  <>
                    <p className='text-xl font-semibold mb-2'>Loading location...</p>
                    <p className='text-sm'>Please allow access to your location</p>
                  </>
                )}
                {geoStatus === 'error' && (
                  <>
                    {/* <p className='text-xl font-semibold mb-2 text-red-600'>Location Error</p>
                    <p className='text-sm text-red-500'>{geoError}</p> */}
                    <LocationServiceOff />
                  </>
                )}
              </div>
              <NavigationBar />
            </>
          )}
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App
