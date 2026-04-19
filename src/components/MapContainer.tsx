import { Circle, GoogleMap, InfoWindow, Marker } from "@react-google-maps/api";
import { useCallback, useMemo, useState } from "react";
import { GetMapLocationInfo } from "../data/Maps";
import type { MapPlace } from "../data/Maps";
import MarkerContainer from "./MarkerContainer";
import BottomSheetContainer from "./BottomSheetContainer";

interface Coordinates {
    lat?: number;
    lng?: number;
}

export default function MapContainer({ apiKey, coordinates }: { apiKey: string; coordinates: Coordinates }) {
    const [apiResponse, setApiResponse] = useState<MapPlace[] | null>(null);
    const [existingCenter, setExistingCenter] = useState({ lat: 0, lng: 0 });
    const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
    const [currentRadius, setCurrentRadius] = useState(500);
    const [isLoading, setIsLoading] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null);

    const userZoom = 16;

    const mapContainerStyle = {
        width: '100vw',
        height: '95vh',
    };

    const options = useMemo(() => ({
        disableDefaultUI: true,
        clickableIcons: false,
        mapId: "4504f8b37365c3d0",
        stylers: [{ visibility: "off" }],
        gestureHandling: "greedy",
        scaleControl: true,
        minZoom: userZoom - 2,
        maxZoom: userZoom + 3,
        defaultZoom: userZoom,
        zoom: userZoom,
        strictBounds: true
    }), [userZoom]);


    const fetchData = async (map) => {
        try {
            setMapRef(map);

            if (map && coordinates?.lat && coordinates?.lng) {
                const bounds = new window.google.maps.LatLngBounds();
                const userPos = new window.google.maps.LatLng(coordinates.lat, coordinates.lng);
                bounds.extend(userPos);

                if (existingCenter.lat !== coordinates.lat && existingCenter.lng !== coordinates.lng) {
                    map.setCenter(userPos);
                    map.fitBounds(bounds);
                    setExistingCenter({ lat: coordinates.lat, lng: coordinates.lng });
                }
                map.setZoom(10);
            }

            const response = await GetMapLocationInfo(apiKey, { lat: coordinates.lat!, lng: coordinates.lng! }, currentRadius);
            // console.log(response);
            setApiResponse(response.results);

        } catch (error) {
            console.error('Error fetching nearby places:', error);
        }
    };

    const handleLoadMore = async () => {
        try {
            setIsLoading(true);
            const newRadius = currentRadius + 1000; // Increase radius by 1km

            const response = await GetMapLocationInfo(apiKey, { lat: coordinates.lat!, lng: coordinates.lng! }, newRadius);
            console.log('Loaded more with radius:', newRadius, response);

            // Merge new results with existing ones
            setApiResponse(prevResults => {
                const existingIds = new Set(prevResults?.map(p => p.place_id) || []);
                const newItems = response.results.filter(item => !existingIds.has(item.place_id));
                return [...(prevResults || []), ...newItems];
            });

            setCurrentRadius(newRadius);
            setClickCount(prevCount => prevCount + 1);
        } catch (error) {
            console.error('Error loading more places:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const defaultOptions = {
        strokeOpacity: 0.5,
        strokeWeight: 1,
        clickable: false,
        draggable: false,
        editable: false,
        visible: true
    };

    const closedOption = {
        ...defaultOptions,
        zIndex: 3,
        fillOpacity: 0.15,
        strokeColor: "#8bc34a",
        fillColor: "#8bc34a"
    };

    const middleOption = {
        ...defaultOptions,
        zIndex: 2,
        fillOpacity: 0.15,
        strokeColor: "#fbc02d",
        fillColor: "#fbc02d"
    };

    const showDetails = useCallback(function showDetails(id: string) {
        const place = apiResponse.find(p => p.place_id === id);
        if (place) {
            setSelectedPlace(place);
            setIsOpen(true);
        }
    }, [apiResponse]);

    function onUserPointer(marker) {
        if (marker) {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => marker.setAnimation(null), 3000);
        }   
    }

    return (
        <>
            <div className="container relative w-full">
                <div className="flex flex-col relative w-full h-screen">
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        onLoad={fetchData}
                        options={options}>
                        {coordinates?.lat && coordinates?.lng && (
                            <>
                                <Marker onLoad={onUserPointer}  position={{ lat: coordinates.lat, lng: coordinates.lng }} key={102121}>
                                    <InfoWindow>
                                        <label>I'm here</label>
                                    </InfoWindow>
                                </Marker>
                                <Circle center={{ lat: coordinates.lat, lng: coordinates.lng }} radius={currentRadius} options={closedOption} />
                                <Circle center={{ lat: coordinates.lat, lng: coordinates.lng }} radius={currentRadius * 3} options={middleOption} />
                            </>
                        )}
                        {apiResponse ? (
                            <MarkerContainer mapRef={mapRef} apiResponse={apiResponse} showDetails={showDetails}/>
                        ) : (
                            <label>Loading...</label>
                        )}
                    </GoogleMap>

                    {clickCount < 1 && (
                        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-20 flex justify-center px-4">
                            <button
                                onClick={handleLoadMore}
                                disabled={isLoading}
                                className="pointer-events-auto inline-flex items-center gap-3 rounded-2xl border border-sky-200/70 bg-white/95 px-4 py-3 text-sm font-semibold text-sky-700 shadow-[0_16px_35px_-18px_rgba(2,132,199,0.7)] backdrop-blur transition duration-200 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white">
                                    +
                                </span>
                                <span>{isLoading ? "Loading nearby mosques..." : `Load More (${currentRadius + 1000}m)`}</span>
                            </button>
                        </div>
                    )}
                </div>
                <BottomSheetContainer isOpen={isOpen} closeSheet={() => setIsOpen(false)} place={selectedPlace} />
            </div>
        </>
    );
}
