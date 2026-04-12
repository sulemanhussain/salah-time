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

export interface PaginatedPlacesResponse {
    results: MapPlace[];
    nextPageToken?: string;
    hasNextPage: boolean;
}

export const GetMapLocationInfo = async(
    apiKey: string,
    coordinates: PlaceLocation,
    radius: number
): Promise<PaginatedPlacesResponse> => {
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

        return {
            results: data.results || [],
            nextPageToken: data.next_page_token,
            hasNextPage: !!data.next_page_token,
        };
    } catch (error) {
        console.error('Error fetching nearby places:', error);
        throw error;
    }
};

/**
 * Fetch next page of places using pagination token
 * @param apiKey - Google Maps API key
 * @param pageToken - Token from previous search results
 * @returns Promise with paginated results and next page token
 */
export const GetMapLocationInfoNextPage = async(
    apiKey: string,
    pageToken: string
): Promise<PaginatedPlacesResponse> => {
    if (!apiKey || !pageToken) {
        throw new Error('API key and page token are required');
    }

    // Google Maps API requires a small delay before using next_page_token
    // Wait 2 seconds to ensure token is valid
    await new Promise(resolve => setTimeout(resolve, 2000));

    const params = new URLSearchParams({
        pagetoken: pageToken,
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

        return {
            results: data.results || [],
            nextPageToken: data.next_page_token,
            hasNextPage: !!data.next_page_token,
        };
    } catch (error) {
        console.error('Error fetching next page of places:', error);
        throw error;
    }
};

/**
 * Fetch all available pages of places (up to 60 results max per API)
 * @param apiKey - Google Maps API key
 * @param coordinates - Location coordinates
 * @param radius - Search radius in meters
 * @param maxPages - Maximum number of pages to fetch (default: 3)
 * @returns Promise with all combined results
 */
export const GetMapLocationInfoAll = async(
    apiKey: string,
    coordinates: PlaceLocation,
    radius: number,
    maxPages: number = 3
): Promise<MapPlace[]> => {
    try {
        const allResults: MapPlace[] = [];
        let pageToken: string | undefined;
        let pageCount = 0;

        // Get first page
        const firstPage = await GetMapLocationInfo(apiKey, coordinates, radius);
        allResults.push(...firstPage.results);
        pageToken = firstPage.nextPageToken;

        // Get subsequent pages
        while (pageToken && pageCount < maxPages - 1) {
            const nextPage = await GetMapLocationInfoNextPage(apiKey, pageToken);
            allResults.push(...nextPage.results);
            pageToken = nextPage.nextPageToken;
            pageCount++;
        }

        return allResults;
    } catch (error) {
        console.error('Error fetching all pages:', error);
        throw error;
    }
};