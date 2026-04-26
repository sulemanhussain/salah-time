import { Circle, GoogleMap } from "@react-google-maps/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GetMapLocationInfo } from "../data/Maps";
import type { MapPlace } from "../data/Maps";
import MarkerContainer from "./MarkerContainer";
import BottomSheetContainer from "./BottomSheetContainer";

interface Coordinates {
    lat?: number;
    lng?: number;
}

const MAP_CONTAINER_STYLE = { width: "100vw", height: "95vh" };
const USER_ZOOM = 16;

const CIRCLE_BASE = {
    strokeOpacity: 0.5,
    strokeWeight: 1,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
};
const CIRCLE_INNER = { ...CIRCLE_BASE, zIndex: 3, fillOpacity: 0.15, strokeColor: "#0d9488", fillColor: "#0d9488" };
const CIRCLE_OUTER = { ...CIRCLE_BASE, zIndex: 2, fillOpacity: 0.08, strokeColor: "#0891b2", fillColor: "#0891b2" };

export default function MapContainer({ apiKey, coordinates }: { apiKey: string; coordinates: Coordinates }) {
    const [apiResponse, setApiResponse] = useState<MapPlace[] | null>(null);
    const [existingCenter, setExistingCenter] = useState({ lat: 0, lng: 0 });
    const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
    const [currentRadius, setCurrentRadius] = useState(500);
    const [isLoading, setIsLoading] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => () => abortRef.current?.abort(), []);

    const mapOptions = useMemo(() => ({
        disableDefaultUI: true,
        clickableIcons: false,
        mapId: "4504f8b37365c3d0",
        gestureHandling: "greedy",
        scaleControl: true,
        minZoom: USER_ZOOM - 2,
        maxZoom: USER_ZOOM + 3,
        defaultZoom: USER_ZOOM,
        zoom: USER_ZOOM,
        strictBounds: true,
    }), []);

    const fetchData = useCallback(async (map: google.maps.Map) => {
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        const { signal } = abortRef.current;

        try {
            setMapRef(map);

            if (coordinates?.lat && coordinates?.lng) {
                const userPos = new window.google.maps.LatLng(coordinates.lat, coordinates.lng);
                if (existingCenter.lat !== coordinates.lat || existingCenter.lng !== coordinates.lng) {
                    map.setCenter(userPos);
                    setExistingCenter({ lat: coordinates.lat, lng: coordinates.lng });
                }
                map.setZoom(10);
            }

            const response = await GetMapLocationInfo(apiKey, { lat: coordinates.lat!, lng: coordinates.lng! }, currentRadius);
            if (!signal.aborted) setApiResponse(response.results);
        } catch (error) {
            if (!signal.aborted) console.error("Error fetching nearby places:", error);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLoadMore = async () => {
        try {
            setIsLoading(true);
            const newRadius = currentRadius + 1000;
            const response = await GetMapLocationInfo(apiKey, { lat: coordinates.lat!, lng: coordinates.lng! }, newRadius);
            setApiResponse(prev => {
                const existingIds = new Set(prev?.map(p => p.place_id) ?? []);
                const fresh = response.results.filter(item => !existingIds.has(item.place_id));
                return [...(prev ?? []), ...fresh];
            });
            setCurrentRadius(newRadius);
            setClickCount(c => c + 1);
        } catch (error) {
            console.error("Error loading more places:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const showDetails = useCallback((id: string) => {
        const place = apiResponse?.find(p => p.place_id === id);
        if (place) { setSelectedPlace(place); setIsOpen(true); }
    }, [apiResponse]);

    useEffect(() => {
        if (!mapRef || !coordinates?.lat || !coordinates?.lng) return;

        if (!document.getElementById("salah-pulse-kf")) {
            const style = document.createElement("style");
            style.id = "salah-pulse-kf";
            style.textContent = `@keyframes salah-pulse{0%{box-shadow:0 0 0 0 rgba(13,148,136,0.55),0 2px 8px rgba(0,0,0,0.22)}70%{box-shadow:0 0 0 10px rgba(13,148,136,0),0 2px 8px rgba(0,0,0,0.22)}100%{box-shadow:0 0 0 0 rgba(13,148,136,0),0 2px 8px rgba(0,0,0,0.22)}}`;
            document.head.appendChild(style);
        }

        const dot = document.createElement("div");
        dot.style.cssText = `
            width: 18px; height: 18px;
            background: radial-gradient(circle at 35% 35%, #2dd4bf, #0d9488);
            border: 3px solid #ffffff;
            border-radius: 50%;
            animation: salah-pulse 1.8s ease-out infinite;
        `;

        const userMarker = new google.maps.marker.AdvancedMarkerElement({
            position: { lat: coordinates.lat, lng: coordinates.lng },
            map: mapRef,
            title: "Your location",
            content: dot,
        });

        return () => { userMarker.map = null; };
    }, [mapRef, coordinates?.lat, coordinates?.lng]);

    return (
        <>
            <div className="container relative w-full overflow-hidden">
                <div className="relative flex h-screen w-full flex-col overflow-hidden">
                    <GoogleMap mapContainerStyle={MAP_CONTAINER_STYLE} onLoad={fetchData} options={mapOptions}>

                        {/* user position circles — marker is created imperatively in useEffect */}
                        {coordinates?.lat && coordinates?.lng && (
                            <>
                                <Circle center={{ lat: coordinates.lat, lng: coordinates.lng }} radius={currentRadius} options={CIRCLE_INNER} />
                                <Circle center={{ lat: coordinates.lat, lng: coordinates.lng }} radius={currentRadius * 3} options={CIRCLE_OUTER} />
                            </>
                        )}

                        {/* mosque markers */}
                        {apiResponse && (
                            <MarkerContainer mapRef={mapRef} apiResponse={apiResponse} showDetails={showDetails} />
                        )}
                    </GoogleMap>

                    {/* loading overlay */}
                    {isLoading && (
                        <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center">
                            <div className="flex items-center gap-2 rounded-full border border-teal-200/70 bg-white/95 px-4 py-2 text-sm font-semibold text-teal-700 shadow-lg backdrop-blur">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
                                Searching nearby mosques…
                            </div>
                        </div>
                    )}

                    {/* load more button — top-right */}
                    {clickCount < 1 && !isLoading && (
                        <div className="pointer-events-none absolute right-3 top-4 z-20">
                            <button
                                onClick={handleLoadMore}
                                disabled={isLoading}
                                className="pointer-events-auto inline-flex items-center gap-1.5 rounded-xl border border-teal-200/70 bg-white/95 px-3 py-1.5 text-xs font-semibold text-teal-700 shadow-lg backdrop-blur transition hover:bg-teal-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white text-xs font-bold">
                                    +
                                </span>
                                Expand to {((currentRadius + 1000) / 1000).toFixed(1)}km
                            </button>
                        </div>
                    )}
                </div>

                <BottomSheetContainer isOpen={isOpen} closeSheet={() => setIsOpen(false)} place={selectedPlace} />
            </div>
        </>
    );
}
