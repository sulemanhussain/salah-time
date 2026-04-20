import { useEffect, useState } from "react";

export default function LocationServiceOff() {
    const [status, setStatus] = useState("checking"); // checking | denied | error

    useEffect(() => {
        if (!navigator.permissions) {
            setStatus("error");
            return;
        }

        navigator.permissions.query({ name: "geolocation" }).then((result) => {
            if (result.state === "granted") {
                setStatus("granted");
            } else if (result.state === "denied") {
                setStatus("denied");
            } else {
                setStatus("prompt");
            }
        });
    }, []);

    return (
        <>
            <div className="bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-lg w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">

                    {/* Icon */}
                    <div className="mx-auto mb-6 w-16 h-16 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-3xl">
                        📍
                    </div>

                    {/* Title */}
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">
                        Location access required
                    </h1>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                        To provide accurate, location-based results, we need access to your
                        device’s location. Please enable location services in your browser or
                        system settings.
                    </p>

                    {/* Status Message */}
                    {status === "denied" && (
                        <p className="text-sm text-red-600 mb-4">
                            Location access is currently blocked. Please enable it in your
                            browser settings and try again.
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="flex-1 border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-medium py-2.5 rounded-lg transition"
                        >
                            Retry
                        </button>
                    </div>

                    {/* Help */}
                    <p className="mt-6 text-xs text-gray-400">
                        You can manage location permissions in your browser settings under
                        Privacy & Security.
                    </p>
                </div>
            </div>
        </>

    )
}