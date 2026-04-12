import { Circle, GoogleMap, InfoWindow, Marker } from "@react-google-maps/api";
import { useMemo, useState } from "react";
import { GetMapLocationInfo } from "../data/Maps";
import type { MapPlace } from "../data/Maps";
import MarkerContainer from "./MarkerContainer";

interface Coordinates {
    lat?: number;
    lng?: number;
}

export default function MapContainer({ apiKey, coordinates }: { apiKey: string; coordinates: Coordinates }) {
    const [apiResponse, setApiResponse] = useState<MapPlace[] | null>(null);
    const [existingCenter, setExistingCenter] = useState({ lat: 0, lng: 0 });
    const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
    
    const userZoom = 16;
    const radius = 1000;

    const mapContainerStyle = {
        width: '100vw',
        height: '90vh',
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

            const response = await GetMapLocationInfo(apiKey, { lat: coordinates.lat!, lng: coordinates.lng! }, radius);
            setApiResponse(response);

            google.maps.event.addListener(map, 'zoom_changed', function() {
                const newZoom = map.getZoom();
                console.log(newZoom);
            });

        } catch (error) {
            console.error('Error fetching nearby places:', error);
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

    return (
        <>
            <div className="container">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    onLoad={fetchData}
                    options={options}>
                    {coordinates?.lat && coordinates?.lng && (
                        <>
                            <Marker position={{ lat: coordinates.lat, lng: coordinates.lng }} key={102121}>
                                <InfoWindow>
                                    <label>I'm here</label>
                                </InfoWindow>
                            </Marker>
                            <Circle center={{ lat: coordinates.lat, lng: coordinates.lng }} radius={1000} options={closedOption} />
                            <Circle center={{ lat: coordinates.lat, lng: coordinates.lng }} radius={3000} options={middleOption} />
                        </>
                    )}
                    {apiResponse ? (
                        <MarkerContainer mapRef={mapRef} apiResponse={apiResponse} />
                    ) : (
                        <label>Loading...</label>
                    )}
                </GoogleMap>
            </div>
        </>
    );
}