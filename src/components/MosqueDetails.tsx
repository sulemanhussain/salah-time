import { useEffect, useState } from "react";
import { getPrayerTimings, formatPrayerTime, PRAYER_NAMES } from "../data/adaan-timings";
import type { PrayerTime } from "../data/adaan-timings";
import type { MapPlace } from "../data/Maps";

// Helper function to add minutes to a time string
const addMinutesToTime = (timeString: string, minutes: number): string => {
    const [hours, mins] = timeString.split(':').map(Number);
    let newMins = mins + minutes;
    let newHours = hours;

    if (newMins >= 60) {
        newHours += Math.floor(newMins / 60);
        newMins = newMins % 60;
        if (newHours >= 24) {
            newHours = newHours % 24;
        }
    }

    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
};

export default function MosqueDetails({ place }: { place: MapPlace }) {
    const [prayerTimings, setPrayerTimings] = useState<PrayerTime | null>(null);
    const [isLoadingTimings, setIsLoadingTimings] = useState(false);

    // Fetch prayer timings
    useEffect(() => {
        if (place?.geometry?.location) {
            setIsLoadingTimings(true);
            const fetchTimings = async () => {
                try {
                    const coordinates = [
                        {
                            latitude: place.geometry.location.lat,
                            longitude: place.geometry.location.lng,
                        },
                    ];
                    const timings = await getPrayerTimings(coordinates);
                    setPrayerTimings(timings.timings);
                } catch (error) {
                    console.error('Error fetching prayer timings:', error);
                } finally {
                    setIsLoadingTimings(false);
                }
            };
            fetchTimings();
        }
    }, [place]);

    if (!place) {
        return null;
    }

    function updateTimings() {
    }

    function report() {
    }

    return (
        <div className='min-h-screen bg-gradient-to-b from-blue-50 to-white'>
            {/* Header */}
            <div className='bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 sticky top-0 z-10 shadow-lg'>
                <div className='flex items-center gap-4 max-w-6xl mx-auto'>
                    <div className='flex-1'>
                        <h1 className="text-3xl font-bold">{place.name}</h1>
                        <p className="text-blue-100 text-sm mt-1">{place.vicinity}</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className='max-w-6xl mx-auto p-6 space-y-6'>

                {/* Disclaimer */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                    <p className="text-sm text-yellow-800">
                        <span className="font-semibold">⚠️ Disclaimer:</span> These prayer timings are calculated and might be slightly different from actual timings. Please verify with your local mosque for accurate schedules.
                    </p>
                </div>

                {/* Prayer Timings Section */}
                <div className='bg-white rounded-lg shadow-md overflow-hidden'>
                    <div className='p-6'>
                        <h2 className='text-2xl font-bold text-gray-800 mb-6'>Prayer Times</h2>

                        {isLoadingTimings ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="mb-4">
                                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                </div>
                                <p className="text-center text-gray-600 font-medium">Loading prayer times...</p>
                            </div>
                        ) : prayerTimings ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-blue-50 border-b border-gray-200">
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Prayer</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Adhan</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Congregation</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-700 font-bold">{PRAYER_NAMES.FAJR}</td>
                                            <td className="px-4 py-3 text-gray-700">{formatPrayerTime(prayerTimings.Fajr)}</td>
                                            <td className="px-4 py-3 text-gray-700">{formatPrayerTime(addMinutesToTime(prayerTimings.Fajr, 15))}</td>
                                        </tr>
                                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-700 font-bold">{PRAYER_NAMES.DHUHR}</td>
                                            <td className="px-4 py-3 text-gray-700">{formatPrayerTime(prayerTimings.Dhuhr)}</td>
                                            <td className="px-4 py-3 text-gray-700">{formatPrayerTime(addMinutesToTime(prayerTimings.Dhuhr, 15))}</td>
                                        </tr>
                                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-700 font-bold">{PRAYER_NAMES.ASR}</td>
                                            <td className="px-4 py-3 text-gray-700">{formatPrayerTime(prayerTimings.Asr)}</td>
                                            <td className="px-4 py-3 text-gray-700">{formatPrayerTime(addMinutesToTime(prayerTimings.Asr, 15))}</td>
                                        </tr>
                                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-700 font-bold">{PRAYER_NAMES.MAGHRIB}</td>
                                            <td className="px-4 py-3 text-gray-700">{formatPrayerTime(prayerTimings.Maghrib)}</td>
                                            <td className="px-4 py-3 text-gray-700">{formatPrayerTime(prayerTimings.Maghrib)}</td>
                                        </tr>
                                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-700 font-bold">{PRAYER_NAMES.ISHA}</td>
                                            <td className="px-4 py-3 text-gray-700">{formatPrayerTime(prayerTimings.Isha)}</td>
                                            <td className="px-4 py-3 text-gray-700">{formatPrayerTime(addMinutesToTime(prayerTimings.Isha, 15))}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center py-8 text-gray-600">Unable to load prayer times</p>
                        )}
                    </div>
                </div>

                {/* Help Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        <span className="font-semibold">💡 Help improve:</span> If you notice any timing differences, please use the Update Timings button to contribute accurate information for this mosque.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className='flex gap-3 justify-center flex-wrap'>
                    <button
                        type='button'
                        onClick={updateTimings}
                        className='px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-200'
                    >
                        ✓ Update Timings
                    </button>
                    <button
                        type='button'
                        onClick={report}
                        className='px-8 py-3 bg-red-400 hover:bg-red-500 text-white font-medium rounded-lg transition duration-200'
                    >
                        📞 Report Issue
                    </button>
                </div>
            </div>
        </div>
    );
}
