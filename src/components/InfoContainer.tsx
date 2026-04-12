import { useEffect, useState, useTransition } from "react";
import type { ReactNode } from "react";
import Modal from "./Modal";
import { createPortal } from "react-dom";

export default function InfoContainer({ place }) {
    const [closedPlaceId, setClosedPlaceId] = useState<string | null>(null);
    const [, startTransition] = useTransition();

    useEffect(() => {
        // Handle blur effect
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
                  <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-blue-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left font-semibold text-gray-700"></th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Adhan</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Congregation</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-100 hover:bg-gray-50"><td className="px-4 py-3 text-gray-700 font-bold">Fajr</td><td className="px-4 py-3 text-gray-700">05:10 am</td><td className="px-4 py-3 text-gray-700">05:30 am</td></tr>
                        <tr className="border-b border-gray-100 hover:bg-gray-50"><td className="px-4 py-3 text-gray-700 font-bold">Dhuhr</td><td className="px-4 py-3 text-gray-700">12:45 pm</td><td className="px-4 py-3 text-gray-700">01:10 pm</td></tr>
                        <tr className="border-b border-gray-100 hover:bg-gray-50"><td className="px-4 py-3 text-gray-700 font-bold">Asr</td><td className="px-4 py-3 text-gray-700">04:30 pm</td><td className="px-4 py-3 text-gray-700">04:50 pm</td></tr>
                        <tr className="border-b border-gray-100 hover:bg-gray-50"><td className="px-4 py-3 text-gray-700 font-bold">Maghrib</td><td className="px-4 py-3 text-gray-700">06:30 pm</td><td className="px-4 py-3 text-gray-700">06:30 pm</td></tr>
                        <tr className="border-b border-gray-100 hover:bg-gray-50"><td className="px-4 py-3 text-gray-700 font-bold">Isha</td><td className="px-4 py-3 text-gray-700">07:50 pm</td><td className="px-4 py-3 text-gray-700">08:15 pm</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="border-t border-gray-200"></div>
                <div className='flex gap-3 justify-between'>
                    <button 
                      type='button' 
                      onClick={updateTimings} 
                      className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-200 text-sm'
                    >
                      Update Timings
                    </button>
                    <button 
                      type='button' 
                      onClick={report} 
                      className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 text-sm'
                    >
                      Report Issue
                    </button>
                </div>
                <p className="text-xs text-gray-600 italic mt-3">You can contribute by updating salat timings if there's a mismatch.</p>
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