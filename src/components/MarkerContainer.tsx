import { useEffect, useRef, memo, useCallback } from "react";
import type { MapPlace } from "../data/Maps";

interface MarkerContainerProps {
    mapRef: google.maps.Map | null;
    apiResponse: MapPlace[];
    showDetails: (id: string) => void;
}

function createMarkerElement(name: string): HTMLElement {
    const wrap = document.createElement("div");
    wrap.style.cssText = [
        "display:flex;flex-direction:column;align-items:center;",
        "cursor:pointer;",
        "filter:drop-shadow(0 4px 12px rgba(13,148,136,0.38));",
        "transition:filter 0.18s ease,transform 0.18s ease;",
    ].join("");

    const card = document.createElement("div");
    card.style.cssText = [
        "display:flex;align-items:stretch;",
        "background:#ffffff;",
        "border-radius:10px;",
        "overflow:hidden;",
        "border:1.5px solid rgba(13,148,136,0.2);",
    ].join("");

    // Left teal badge
    const badge = document.createElement("div");
    badge.style.cssText = [
        "background:linear-gradient(160deg,#0d9488,#0891b2);",
        "display:flex;align-items:center;justify-content:center;",
        "padding:0 10px;",
        "flex-shrink:0;",
    ].join("");
    const symbol = document.createElement("span");
    symbol.textContent = "🕌";
    symbol.style.cssText = "font-size:13px;line-height:1;";
    badge.append(symbol);

    // Thin separator
    const sep = document.createElement("div");
    sep.style.cssText = "width:1px;background:rgba(13,148,136,0.15);flex-shrink:0;";

    // Right name area
    const nameEl = document.createElement("div");
    nameEl.style.cssText = [
        "padding:7px 11px;",
        "font-size:12px;font-weight:600;",
        "color:#134e4a;",
        "white-space:nowrap;max-width:145px;overflow:hidden;text-overflow:ellipsis;",
        "font-family:system-ui,-apple-system,sans-serif;letter-spacing:0.01em;",
    ].join("");
    nameEl.textContent = name;

    card.append(badge, sep, nameEl);

    const tip = document.createElement("div");
    tip.style.cssText = [
        "width:0;height:0;",
        "border-left:5px solid transparent;",
        "border-right:5px solid transparent;",
        "border-top:6px solid #0d9488;",
        "margin-top:-1px;",
    ].join("");

    wrap.addEventListener("mouseenter", () => {
        wrap.style.filter = "drop-shadow(0 6px 16px rgba(13,148,136,0.55))";
        wrap.style.transform = "translateY(-2px) scale(1.05)";
    });
    wrap.addEventListener("mouseleave", () => {
        wrap.style.filter = "drop-shadow(0 4px 12px rgba(13,148,136,0.38))";
        wrap.style.transform = "";
    });

    wrap.append(card, tip);
    return wrap;
}

function MarkerContainer({ mapRef, apiResponse, showDetails }: MarkerContainerProps) {
    const markersRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());

    const handleMarkerClick = useCallback((place: MapPlace) => {
        showDetails(place.place_id);
    }, [showDetails]);

    // Add only NEW markers — never destroy existing ones between updates
    useEffect(() => {
        if (!apiResponse.length || !mapRef) return;

        const isFirstBatch = markersRef.current.size === 0;
        const bounds = new google.maps.LatLngBounds();

        apiResponse.forEach(place => {
            const latLng = new google.maps.LatLng(
                place.geometry.location.lat,
                place.geometry.location.lng,
            );
            bounds.extend(latLng);

            if (markersRef.current.has(place.place_id)) return;

            try {
                const marker = new google.maps.marker.AdvancedMarkerElement({
                    position: latLng,
                    map: mapRef,
                    title: place.name,
                    content: createMarkerElement(place.name),
                });
                marker.addListener("gmp-click", () => handleMarkerClick(place));
                markersRef.current.set(place.place_id, marker);
            } catch (err) {
                console.error("Error creating marker:", err);
            }
        });

        // Only fit bounds on the very first batch
        if (isFirstBatch) mapRef.fitBounds(bounds);
    }, [apiResponse, mapRef, handleMarkerClick]);

    // Clean up all markers on unmount only
    useEffect(() => {
        const markers = markersRef.current;
        return () => {
            markers.forEach(m => { m.map = null; });
            markers.clear();
        };
    }, []);

    return null;
}

export default memo(MarkerContainer);
