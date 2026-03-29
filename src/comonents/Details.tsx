import { useLocation } from "react-router-dom"

export function Details() {
    const location = useLocation();
    const place = location.state || {}; 
    console.log("details page");
    console.log(place);
    return (
        <>
            <div>
                <h2>
                    { place.name }
                </h2>
            </div>
        </>
    )
}