interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface PrayerTime {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Sunset: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
}

interface AladhanData {
    timings: PrayerTime;
    date: {
        readable: string;
        timestamp: string;
        gregorian: {
            date: string;
            format: string;
        };
        hijri: {
            date: string;
            format: string;
        };
    };
}

interface AladhanResponse {
    code: number;
    status: string;
    data: AladhanData;
}

interface PrayerTimings {
    date: string;
    timings: PrayerTime;
    timezone: string;
}

/**
 * Fetch prayer timings from Aladhan API based on coordinates
 * @param coordinates - Object with latitude and longitude
 * @param date - Optional date object (defaults to today)
 * @param method - Optional calculation method (defaults to 2 - ISNA)
 * @returns Promise with prayer timings data
 */
export const getPrayerTimings = async (
    coordinates: Coordinates[],
    date: Date = new Date(),
    method: number = 2
): Promise<PrayerTimings> => {
    try {
        // Validate coordinates
        if (!coordinates || coordinates.length === 0 || !coordinates[0].latitude || !coordinates[0].longitude) {
            throw new Error('Invalid coordinates provided');
        }

        const { latitude, longitude } = coordinates[0];

        // Format date as YYYY-MM-DD for API
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${day}-${month}-${year}`;

        // Build API URL
        const params = new URLSearchParams({
            latitude: String(latitude),
            longitude: String(longitude),
            method: String(method),
            school: '0', // 0 for Shafi'i, 1 for Hanafi
        });

        const apiUrl = `https://api.aladhan.com/v1/timings/${dateString}?${params}`;

        // Make API request
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Aladhan API error: ${response.status} ${response.statusText}`);
        }

        const data: AladhanResponse = await response.json();

        if (data.code !== 200 || data.status !== 'OK') {
            throw new Error(`Aladhan API returned status: ${data.status}`);
        }

        // Transform and return data
        return {
            date: data.data.date.readable,
            timings: data.data.timings,
            timezone: data.data.date.gregorian.format,
        };
    } catch (error) {
        console.error('Error fetching prayer timings:', error);
        throw error;
    }
};

/**
 * Get prayer timings for multiple days
 * @param coordinates - Object with latitude and longitude
 * @param startDate - Start date for the range
 * @param days - Number of days to fetch
 * @param method - Optional calculation method (defaults to 2 - ISNA)
 * @returns Promise with array of prayer timings for each day
 */
export const getPrayerTimingsRange = async (
    coordinates: Coordinates[],
    startDate: Date = new Date(),
    days: number = 7,
    method: number = 2
): Promise<PrayerTimings[]> => {
    try {
        const allTimings: PrayerTimings[] = [];

        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);

            try {
                const timings = await getPrayerTimings(coordinates, date, method);
                allTimings.push(timings);
            } catch (error) {
                console.error(`Failed to fetch timings for day ${i + 1}:`, error);
                // Continue with next day instead of throwing
            }
        }

        return allTimings;
    } catch (error) {
        console.error('Error fetching prayer timings range:', error);
        throw error;
    }
};

/**
 * Supported calculation methods for prayer times
 */
export const PRAYER_CALCULATION_METHODS = {
    JAFARI: 0,
    KARACHI: 1,
    ISNA: 2,
    MWL: 3,
    MAKKAH: 4,
    EGYPT: 5,
    TEHRAN: 7,
    SHAFII: 8,
    HANAFI: 1,
} as const;

/**
 * Prayer time names
 */
export const PRAYER_NAMES = {
    FAJR: 'Fajr',
    SUNRISE: 'Sunrise',
    DHUHR: 'Dhuhr',
    ASR: 'Asr',
    SUNSET: 'Sunset',
    MAGHRIB: 'Maghrib',
    ISHA: 'Isha',
    IMSAK: 'Imsak',
    MIDNIGHT: 'Midnight',
} as const;

/**
 * Format prayer time from 24-hour to 12-hour format
 * @param time - Time string in HH:mm format (24-hour)
 * @returns Formatted time string in HH:mm AM/PM format
 */
export const formatPrayerTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const meridiem = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${meridiem}`;
};

/**
 * Get next prayer time
 * @param timings - Prayer timings for the day
 * @param currentTime - Current time (defaults to now)
 * @returns Object with next prayer name and time, or null if no prayer left today
 */
export const getNextPrayerTime = (
    timings: PrayerTime,
    currentTime: Date = new Date()
): { name: string; time: string } | null => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Sunset', 'Maghrib', 'Isha'];

    for (const prayer of prayerOrder) {
        const [hours, minutes] = timings[prayer as keyof PrayerTime].split(':').map(Number);
        const prayerTime = hours * 60 + minutes;

        if (prayerTime > now) {
            return {
                name: prayer,
                time: timings[prayer as keyof PrayerTime],
            };
        }
    }

    return null;
};
