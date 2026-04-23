import { useState, useEffect } from 'react'
import type { ReactNode } from 'react';
import './App.css'
import MapContainer from './components/MapContainer';
import NavigationBar from './components/NavigationBar';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Home from './components/Home';
import LocationServiceOff from './components/LocationServiceOff';
import Notifications from './components/Notifications';
import Settings from './components/Settings';
import { isAuthenticated } from './utils/auth-cookie';
import ErrorBoundary from './components/ErrorBoundary';
import { FiCompass, FiMapPin } from 'react-icons/fi';

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
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);

  useEffect(() => {
    if (!navigator.permissions) return;

    let permissionResult: PermissionStatus | null = null;

    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      permissionResult = result;
      setPermissionStatus(result.state);
      result.onchange = () => setPermissionStatus(result.state);
    });

    return () => {
      if (permissionResult) permissionResult.onchange = null;
    };
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
      },
      () => {
        setGeoStatus('error');
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
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/signup" element={isAuthenticated() ? <Navigate to="/app" replace /> : <SignUp />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
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
                <div className='min-h-screen bg-gradient-to-b from-teal-50 via-white to-cyan-50 flex flex-col items-center justify-center px-4 pb-24'>
                  {geoStatus === 'loading' && (
                    <div className='relative w-full max-w-md overflow-hidden rounded-3xl border border-cyan-100 bg-white/90 p-6 text-center shadow-[0_24px_50px_-24px_rgba(8,145,178,0.55)] backdrop-blur-xl'>
                      <div className='pointer-events-none absolute -left-10 top-0 h-24 w-24 rounded-full bg-cyan-100/70 blur-2xl'></div>
                      <div className='pointer-events-none absolute -right-10 bottom-0 h-24 w-24 rounded-full bg-teal-100/70 blur-2xl'></div>

                      <div className='relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 via-cyan-600 to-sky-600 text-white shadow-lg shadow-cyan-200'>
                        <FiMapPin size={22} />
                        <span className='absolute inline-flex h-full w-full animate-ping rounded-full border border-cyan-300/60'></span>
                      </div>

                      <p className='text-xl font-bold text-slate-800'>Locating your position...</p>
                      <p className='mt-2 text-sm text-slate-600'>
                        Please allow location access so we can show nearby mosques accurately.
                      </p>

                      <div className='mt-5 rounded-xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-teal-50 px-3 py-2 text-left'>
                        <p className='inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-cyan-700'>
                          <FiCompass size={12} />
                          In Progress
                        </p>
                        <p className='mt-1 text-xs text-slate-600'>
                          Reading GPS signal and preparing your map view.
                        </p>
                      </div>
                    </div>
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
    </ErrorBoundary>
  )
}

export default App
