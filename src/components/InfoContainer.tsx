import { useEffect, useState, useTransition } from "react";
import type { ReactNode } from "react";
import Modal from "./Modal";
import { createPortal } from "react-dom";
import { getPrayerTimings, formatPrayerTime, PRAYER_NAMES } from "../data/adaan-timings";
import type { PrayerTime } from "../data/adaan-timings";

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

export default function InfoContainer({ place }) {
    const [closedPlaceId, setClosedPlaceId] = useState<string | null>(null);
    const [, startTransition] = useTransition();
    const [prayerTimings, setPrayerTimings] = useState<PrayerTime | null>(null);
    const [isLoadingTimings, setIsLoadingTimings] = useState(false);

    // Fetch prayer timings when place changes
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

    // Handle blur effect
    useEffect(() => {
        if (place) {
            document.getElementById("root")?.classList.add("blurEffect");
        } else {
            document.getElementById("root")?.classList.remove("blurEffect");
        }
    }, [place]);

    // Reset modal closed state when place changes
    useEffect(() => {
        if (place?.place_id !== closedPlaceId) {
            startTransition(() => {
                setClosedPlaceId(null);
            });
        }
    }, [place?.place_id, closedPlaceId]);

    function updateTimings() {
    }

    function report() {
    }

    function closeModal() {
        if (place?.place_id) {
            setClosedPlaceId(place.place_id);
        }
        document.getElementById("root")?.classList.remove("blurEffect");
    }

    const isModalOpen = place !== undefined && place !== null && place.place_id !== closedPlaceId;

    const renderContent = (): ReactNode => {
        if (!place) return null;

        return (
            <div className='p-6 space-y-4'>
                <button 
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-2xl font-bold text-gray-500 hover:text-gray-700 transition"
                >
                  &times;
                </button>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">{place.name}</h2>
                  <p className="text-gray-600 text-sm mt-1">{place.vicinity}</p>
                </div>
                <div className="border-t border-gray-200"></div>
                <div className="overflow-x-auto">
                  {isLoadingTimings ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="mb-4">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      </div>
                      <p className="text-center text-gray-600 font-medium">Loading prayer times...</p>
                    </div>
                  ) : prayerTimings ? (
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
                  ) : (
                    <p className="text-center py-4 text-gray-600">Unable to load prayer times</p>
                  )}
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-2">
                  <p className="text-xs text-yellow-800">
                    <span className="font-semibold">⚠️ Disclaimer:</span> These prayer timings are calculated and might be slightly different from actual timings. Please verify with your local mosque for accurate schedules.
                  </p>
                </div>
                <div className="border-t border-gray-200"></div>
                <div className='flex gap-3 justify-center'>
                    <button 
                      type='button' 
                      onClick={updateTimings} 
                      className='px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-200 text-sm'
                    >
                      ✓ Update Timings
                    </button>
                    <button 
                      type='button' 
                      onClick={report} 
                      className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 text-sm'
                    >
                      📞 Report Issue
                    </button>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4">
                  <p className="text-xs text-blue-800">
                    <span className="font-semibold">💡 Help improve:</span> If you notice any timing differences, please use the Update Timings button to contribute accurate information for this mosque.
                  </p>
                </div>
            </div>
        );
    };

    if (place === undefined || place === null) return null;

    return (
        <>
            {
                createPortal(
                    <Modal key={place.place_id} isOpen={isModalOpen}>{renderContent()}</Modal>,
                    document.getElementById("content-modal")!
                )
            }
        </>
    )
}