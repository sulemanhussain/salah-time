import { useEffect, useRef, useState } from "react";
import { existingCenter } from "./MapContainer";
import { useNavigate } from "react-router-dom";
import InfoContainer from "./InfoContainer";

let currentInfoWindow: any = null;
export default function MarkerContainer({ mapRef, apiResponse }) {
    const navigate = useNavigate();
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
                handleMarkerClick(mapRef, marker, place);
                //handleDetailsView(place);
            });

            bounds.extend(place.geometry.location);
        });

        const newCenter = mapRef.getCenter();   
        
        if (existingCenter.lat !== newCenter.lat() && existingCenter.lng !== newCenter.lng()) {
            mapRef.fitBounds(bounds);
        }
    });

    function handleDetailsView(place) {
        // navigate('/Details', {
        //     state: place
        // });
    }

    function handleMarkerClick(mapRef, marker, place) {

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