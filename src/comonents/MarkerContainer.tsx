import { useEffect, useState } from "react";
import { existingCenter } from "./MapContainer";
import InfoContainer from "./InfoContainer";

export default function MarkerContainer({ mapRef, apiResponse }) {
    const [place, setPlace] = useState();
    
    useEffect(() => {
        const bounds = new google.maps.LatLngBounds();

        apiResponse.map((place) => {
            //console.log(place);
            const marker = new google.maps.marker.AdvancedMarkerElement({
                position: place.geometry.location,
                map: mapRef,
                title: place.name
            });

            const nameTag = document.createElement('div');
            nameTag.className = 'name-tag';
            nameTag.textContent = place.name;

            marker.append(nameTag);

            marker.addListener('gmp-click', () => {
                handleMarkerClick(place);
                //handleDetailsView(place);
            });

            bounds.extend(place.geometry.location);
        });

        const newCenter = mapRef.getCenter();   
        
        if (existingCenter.lat !== newCenter.lat() && existingCenter.lng !== newCenter.lng()) {
            mapRef.fitBounds(bounds);
        }
    });

    function handleMarkerClick(place) {

        // console.log(place);
        // const bounds = new window.google.maps.LatLngBounds();
        // const userPos = new window.google.maps
        //             .LatLng(place.geometry.location.lat, place.geometry.location.lng);
        // bounds.extend(userPos);
        // mapRef.setCenter(userPos);
        // mapRef.fitBounds(bounds);
        // console.log(bounds);
        // console.log(userPos);
        setPlace(place);
        

        // const infoWindow = new google.maps.InfoWindow({
        //     content: content,
        //     maxWidth: 400
        // });
        
        // if (currentInfoWindow !== null) {
        //     currentInfoWindow.close();
        // }

        // infoWindow.open(mapRef, marker);
        // currentInfoWindow = infoWindow;
    }

    return (
        <>
            <InfoContainer place={place} />
        </>
    )
}