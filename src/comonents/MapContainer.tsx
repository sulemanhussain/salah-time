import { Circle, GoogleMap, InfoWindow, Marker } from "@react-google-maps/api";
import { useMemo, useState } from "react";
import { GetMapLocationInfo } from "../data/Maps";
import MarkerContainer from "./MarkerContainer";



    let existingCenter = { lat: 0, lng: 0 };
export default function MapContainer({ apiKey, coordinates }) {
    const [apiResponse, setApiResponse] = useState<any>(null);
    const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
    
    const userZoom = 16;
    const radius = 1000;

    const mapContainerStyle = {
        width: '100vw',
        height: '90vh',
    };

    if (mapRef) {
        const newCenter = (mapRef as google.maps.Map).getCenter();
        if (newCenter) {
            existingCenter = { lat: newCenter.lat(), lng: newCenter.lng() };
        }
    }
    
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
    }), []);


    const fetchData = async (map) => {
        try {
            setMapRef(map);
            
            if (map && coordinates) {
            // create a bound object with the user location and three nearest corners
                const bounds = new window.google.maps.LatLngBounds();
                const userPos = new window.google.maps
                    .LatLng(coordinates.lat, coordinates.lng);

            // add user location and thre nearest stores in bounds
                bounds.extend(userPos);
            // take(corners, 3).forEach(({ lat, lng }) => {
            //   const cornerPos = new window.google.maps.LatLng(lat, lng);
            //   return bounds.extend(cornerPos);
            // });  
                console.log(coordinates);
                if (existingCenter.lat !== coordinates.lat && existingCenter.lng !== coordinates.lng) {
                    map.setCenter(userPos);
                    map.fitBounds(bounds);
                    existingCenter = coordinates;
                }
                map.setZoom(10);
            }

            const response = await GetMapLocationInfo(apiKey, coordinates, radius);
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
  }

  const middleOption = {
    ...defaultOptions,
    zIndex: 2,
    fillOpacity: 0.15,
    strokeColor: "#fbc02d",
    fillColor: "#fbc02d"
  }

  return (
    <>
    {
        <div className="container">
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            onLoad={fetchData}
            options={options} >
                <Marker position={coordinates} key={102121}>
                    <InfoWindow>
                        <label>I'm here</label>
                    </InfoWindow>
                </Marker>
                <Circle center={coordinates} radius={1000} options={closedOption} />
                <Circle center={coordinates} radius={3000} options={middleOption} />
                {
                    !apiResponse ? 
                    (<label>loading....</label>) : 
                    (
                        <MarkerContainer mapRef={mapRef} apiResponse={apiResponse} />
                    )
                }
        </GoogleMap>
        </div>
    }

    {/* <div className="stack-view">
        <h2>Location</h2>
        <p>testestse</p>
        <p>tesasdfasd</p>
        <p>3423dfsd</p>
        <p>fdsg  ddfgsdfgd</p>
    </div> */}
    </>
  )

}

export { existingCenter }