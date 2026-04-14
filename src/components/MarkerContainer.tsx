import { useEffect, memo, useCallback } from "react";
import type { MapPlace } from "../data/Maps";

interface MarkerContainerProps {
    mapRef: google.maps.Map;
    apiResponse: MapPlace[];
    showDetails: (id: string) => void;
}

function MarkerContainer({ mapRef, apiResponse, showDetails }: MarkerContainerProps) {
    const handleMarkerClick = useCallback((place: MapPlace) => {
        showDetails(place.place_id);
    }, [showDetails]);

    useEffect(() => {
        if (!apiResponse || apiResponse.length === 0 || !mapRef) return;

        const bounds = new google.maps.LatLngBounds();
        const markers: google.maps.marker.AdvancedMarkerElement[] = [];

        apiResponse.forEach((placeItem) => {
            try {
                const latLng = new google.maps.LatLng(
                    placeItem.geometry.location.lat,
                    placeItem.geometry.location.lng
                );

                const marker = new google.maps.marker.AdvancedMarkerElement({
                    position: latLng,
                    map: mapRef,
                    title: placeItem.name
                });

                const nameTag = document.createElement('div');
                nameTag.className = 'name-tag';
                nameTag.textContent = placeItem.name;
                marker.append(nameTag);

                marker.addListener('gmp-click', () => {
                    handleMarkerClick(placeItem);
                });

                bounds.extend(latLng);
                markers.push(marker);
            } catch (error) {
                console.error('Error creating marker:', error);
            }
        });

        const newCenter = mapRef.getCenter();
        if (newCenter) {
            mapRef.fitBounds(bounds);
        }

        return () => {
            markers.forEach(marker => marker.map = null);
        };
    }, [apiResponse, mapRef, handleMarkerClick]);

    
    return null;
}

export default memo(MarkerContainer);