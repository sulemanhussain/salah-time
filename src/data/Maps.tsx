interface PlaceLocation {
    lat: number;
    lng: number;
}

interface PlaceGeometry {
    location: PlaceLocation;
    viewport?: {
        northeast: PlaceLocation;
        southwest: PlaceLocation;
    };
}

export interface MapPlace {
    place_id: string;
    name: string;
    geometry: PlaceGeometry;
    vicinity?: string;
    rating?: number;
    types?: string[];
}

interface NearbySearchResponse {
    results: MapPlace[];
    next_page_token?: string;
    status: string;
}

export const GetMapLocationInfo = async(
    apiKey: string,
    coordinates: PlaceLocation,
    radius: number
): Promise<MapPlace[]> => {
    if (!apiKey || !coordinates?.lat || !coordinates?.lng || radius <= 0) {
        throw new Error('Invalid parameters: apiKey, coordinates, and radius are required');
    }

    const params = new URLSearchParams({
        keyword: 'masjid',
        location: `${coordinates.lat},${coordinates.lng}`,
        radius: String(radius),
        type: 'mosque',
        key: apiKey,
    });

    const url = `/maps/api/place/nearbysearch/json?${params}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: NearbySearchResponse = await response.json();

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            throw new Error(`Google Maps API error: ${data.status}`);
        }

        return data.results || [];
    } catch (error) {
        console.error('Error fetching nearby places:', error);
        throw error;
    }
};