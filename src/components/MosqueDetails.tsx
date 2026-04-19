import { useEffect, useState } from "react";
import {
    FiAlertTriangle,
    FiClock,
    FiCompass,
    FiEdit3,
    FiExternalLink,
    FiMapPin,
    FiUsers,
} from "react-icons/fi";
import { getPrayerTimings, formatPrayerTime, PRAYER_NAMES } from "../data/adaan-timings";
import type { PrayerTime } from "../data/adaan-timings";
import type { MapPlace } from "../data/Maps";
import UpdateTimingModal from "./UpdateTimingModal";
import ReportTimingModal from "./ReportTimingModal";

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

const parseTimeToMinutes = (timeString: string): number | null => {
    const match = timeString.match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (Number.isNaN(hours) || Number.isNaN(minutes) || hours > 23 || minutes > 59) {
        return null;
    }

    return hours * 60 + minutes;
};

const calculateMinuteGap = (startMinutes: number, endMinutes: number): number => {
    return (endMinutes - startMinutes + 1440) % 1440;
};

const formatTimeUntil = (minutesAway: number): string => {
    if (minutesAway <= 0) return "Now";

    const hours = Math.floor(minutesAway / 60);
    const minutes = minutesAway % 60;

    if (hours === 0) return `in ${minutes}m`;
    if (minutes === 0) return `in ${hours}h`;
    return `in ${hours}h ${minutes}m`;
};

type PrayerRow = {
    key: string;
    prayer: string;
    adhan: string;
    congregation: string;
    adhanMinutes: number | null;
    congregationMinutes: number | null;
};

export default function MosqueDetails({ place }: { place: MapPlace }) {
    const [prayerTimings, setPrayerTimings] = useState<PrayerTime | null>(null);
    const [isLoadingTimings, setIsLoadingTimings] = useState(false);
    const [timingsError, setTimingsError] = useState<string | null>(null);
    const [activeModal, setActiveModal] = useState<"update" | "report" | null>(null);
    const [fetchAttempt, setFetchAttempt] = useState(0);

    // Fetch prayer timings
    useEffect(() => {
        if (place?.geometry?.location) {
            setIsLoadingTimings(true);
            setTimingsError(null);
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
                    setTimingsError("Unable to load timings right now. Please try again.");
                } finally {
                    setIsLoadingTimings(false);
                }
            };
            fetchTimings();
        }
    }, [place, fetchAttempt]);

    useEffect(() => {
        setActiveModal(null);
    }, [place?.place_id]);

    if (!place) {
        return null;
    }

    function updateTimings() {
        setActiveModal("update");
    }

    function report() {
        setActiveModal("report");
    }

    function closeActionModal() {
        setActiveModal(null);
    }

    const location = place.geometry.location;
    const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&destination_place_id=${place.place_id}`;
    const mapsPlaceUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`;
    const prayerRows: PrayerRow[] = prayerTimings
        ? [
              {
                  key: "fajr",
                  prayer: PRAYER_NAMES.FAJR,
                  adhan: formatPrayerTime(prayerTimings.Fajr),
                  congregation: formatPrayerTime(addMinutesToTime(prayerTimings.Fajr, 15)),
                  adhanMinutes: parseTimeToMinutes(prayerTimings.Fajr),
                  congregationMinutes: parseTimeToMinutes(addMinutesToTime(prayerTimings.Fajr, 15)),
              },
              {
                  key: "dhuhr",
                  prayer: PRAYER_NAMES.DHUHR,
                  adhan: formatPrayerTime(prayerTimings.Dhuhr),
                  congregation: formatPrayerTime(addMinutesToTime(prayerTimings.Dhuhr, 15)),
                  adhanMinutes: parseTimeToMinutes(prayerTimings.Dhuhr),
                  congregationMinutes: parseTimeToMinutes(addMinutesToTime(prayerTimings.Dhuhr, 15)),
              },
              {
                  key: "asr",
                  prayer: PRAYER_NAMES.ASR,
                  adhan: formatPrayerTime(prayerTimings.Asr),
                  congregation: formatPrayerTime(addMinutesToTime(prayerTimings.Asr, 15)),
                  adhanMinutes: parseTimeToMinutes(prayerTimings.Asr),
                  congregationMinutes: parseTimeToMinutes(addMinutesToTime(prayerTimings.Asr, 15)),
              },
              {
                  key: "maghrib",
                  prayer: PRAYER_NAMES.MAGHRIB,
                  adhan: formatPrayerTime(prayerTimings.Maghrib),
                  congregation: formatPrayerTime(prayerTimings.Maghrib),
                  adhanMinutes: parseTimeToMinutes(prayerTimings.Maghrib),
                  congregationMinutes: parseTimeToMinutes(prayerTimings.Maghrib),
              },
              {
                  key: "isha",
                  prayer: PRAYER_NAMES.ISHA,
                  adhan: formatPrayerTime(prayerTimings.Isha),
                  congregation: formatPrayerTime(addMinutesToTime(prayerTimings.Isha, 15)),
                  adhanMinutes: parseTimeToMinutes(prayerTimings.Isha),
                  congregationMinutes: parseTimeToMinutes(addMinutesToTime(prayerTimings.Isha, 15)),
              },
          ]
        : [];

    const currentTimeInMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const prayerEvents = prayerRows
        .flatMap((row) => [
            row.adhanMinutes !== null
                ? {
                      prayerKey: row.key,
                      prayerName: row.prayer,
                      type: "Aadhan" as const,
                      displayTime: row.adhan,
                      minutes: row.adhanMinutes,
                  }
                : null,
            row.congregationMinutes !== null
                ? {
                      prayerKey: row.key,
                      prayerName: row.prayer,
                      type: "Congregation" as const,
                      displayTime: row.congregation,
                      minutes: row.congregationMinutes,
                  }
                : null,
        ])
        .filter((event): event is NonNullable<typeof event> => event !== null);

    const nextEvent = (() => {
        if (!prayerEvents.length) return null;

        const upcomingToday = prayerEvents
            .filter((event) => event.minutes >= currentTimeInMinutes)
            .sort((a, b) => a.minutes - b.minutes);

        if (upcomingToday.length) {
            const event = upcomingToday[0];
            return {
                ...event,
                isTomorrow: false,
                minutesAway: event.minutes - currentTimeInMinutes,
            };
        }

        const firstEventTomorrow = [...prayerEvents].sort((a, b) => a.minutes - b.minutes)[0];
        return {
            ...firstEventTomorrow,
            isTomorrow: true,
            minutesAway: (1440 - currentTimeInMinutes) + firstEventTomorrow.minutes,
        };
    })();

    const mosqueType = place.types?.find((type) => type !== "point_of_interest" && type !== "establishment");

    return (
        <>
            <div className='min-h-full bg-gradient-to-b from-teal-50 via-white to-cyan-50 p-4 sm:p-5'>
                <div className='mx-auto max-w-5xl space-y-4 pb-8'>
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 p-5 text-white shadow-[0_20px_45px_-20px_rgba(14,116,144,0.75)] sm:p-6">
                        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/20 blur-2xl"></div>
                        <div className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-white/20 blur-2xl"></div>

                        <div className="relative space-y-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
                                        Mosque Details
                                    </p>
                                    <h1 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">{place.name}</h1>
                                    <p className="mt-2 inline-flex items-start gap-2 text-sm text-cyan-100">
                                        <FiMapPin className="mt-0.5 shrink-0" size={14} />
                                        <span>{place.vicinity || "Address unavailable"}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs font-semibold">
                                {mosqueType && (
                                    <span className="rounded-full bg-white/15 px-3 py-1 text-cyan-50 ring-1 ring-white/30">
                                        {mosqueType.replaceAll("_", " ")}
                                    </span>
                                )}
                                <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-50 ring-1 ring-emerald-200/40">
                                    Prayer timings available
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <a
                                    href={mapsDirectionsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-50"
                                >
                                    <FiCompass size={15} />
                                    Directions
                                </a>
                                <a
                                    href={mapsPlaceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                                >
                                    <FiExternalLink size={15} />
                                    Open in Maps
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm">
                        <p className="text-sm text-amber-900">
                            <span className="font-semibold">Disclaimer:</span> Timings are algorithmically calculated and may differ slightly from local noticeboards. Please verify with the mosque for exact schedules.
                        </p>
                    </div>

                    <div className='overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.55)] backdrop-blur'>
                        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-cyan-50 p-5">
                            <h2 className='text-xl font-bold text-slate-900 sm:text-2xl'>Prayer Times</h2>
                            <p className="mt-1 text-sm text-slate-600">Aadhan and congregation times for {place.name}.</p>
                        </div>

                        <div className='space-y-3 p-4 sm:p-5'>
                            {isLoadingTimings && (
                                <div className="space-y-3 py-2">
                                    {[1, 2, 3].map((placeholder) => (
                                        <div key={placeholder} className="animate-pulse rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                            <div className="h-4 w-24 rounded bg-slate-200"></div>
                                            <div className="mt-3 grid grid-cols-2 gap-2">
                                                <div className="h-12 rounded-lg bg-slate-200"></div>
                                                <div className="h-12 rounded-lg bg-slate-200"></div>
                                            </div>
                                        </div>
                                    ))}
                                    <p className="text-center text-sm font-medium text-slate-500">Loading prayer times...</p>
                                </div>
                            )}

                            {!isLoadingTimings && prayerTimings && (
                                <div className="space-y-3">
                                    {nextEvent && (
                                        <div className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-sky-50 to-teal-50 p-4 shadow-sm">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-cyan-700">Next Event</p>
                                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                                <p className="text-sm font-bold text-slate-900 sm:text-base">
                                                    {nextEvent.prayerName} {nextEvent.type} at {nextEvent.displayTime}
                                                </p>
                                                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-cyan-800 ring-1 ring-cyan-200">
                                                    {formatTimeUntil(nextEvent.minutesAway)}
                                                    {nextEvent.isTomorrow ? " tomorrow" : ""}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {prayerRows.map((row) => {
                                        const isNextPrayer = nextEvent?.prayerKey === row.key;
                                        const highlightAadhan = isNextPrayer && nextEvent?.type === "Aadhan";
                                        const highlightCongregation = isNextPrayer && nextEvent?.type === "Congregation";
                                        const congregationGap =
                                            row.adhanMinutes !== null && row.congregationMinutes !== null
                                                ? calculateMinuteGap(row.adhanMinutes, row.congregationMinutes)
                                                : null;

                                        return (
                                            <div
                                                key={row.key}
                                                className={`rounded-2xl border p-4 transition hover:shadow-sm ${
                                                    isNextPrayer
                                                        ? "border-cyan-300 bg-gradient-to-r from-cyan-50/80 to-sky-50/80 shadow-[0_16px_35px_-25px_rgba(8,145,178,0.85)]"
                                                        : "border-slate-200 bg-gradient-to-r from-white to-slate-50"
                                                }`}
                                            >
                                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                                    <h3 className="text-base font-bold text-slate-800">{row.prayer}</h3>
                                                    <div className="flex items-center gap-2">
                                                        {isNextPrayer && (
                                                            <span className="rounded-full bg-cyan-600 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                                                                Next Up
                                                            </span>
                                                        )}
                                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                                                            Daily
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="relative">
                                                    <div className="pointer-events-none absolute left-7 right-7 top-5 hidden border-t border-dashed border-slate-300 sm:block"></div>
                                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                                                        <div
                                                            className={`rounded-xl border px-3 py-3 transition ${
                                                                highlightAadhan
                                                                    ? "border-sky-300 bg-sky-100 shadow-sm"
                                                                    : "border-sky-100 bg-sky-50"
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <p className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                                                                    <FiClock size={12} />
                                                                    Aadhan
                                                                </p>
                                                                {highlightAadhan && (
                                                                    <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                                                                        Next
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="mt-1 text-base font-bold text-slate-900">{row.adhan}</p>
                                                        </div>

                                                        <div
                                                            className={`rounded-xl border px-3 py-3 transition ${
                                                                highlightCongregation
                                                                    ? "border-emerald-300 bg-emerald-100 shadow-sm"
                                                                    : "border-emerald-100 bg-emerald-50"
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <p className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                                                                    <FiUsers size={12} />
                                                                    Congregation
                                                                </p>
                                                                {highlightCongregation && (
                                                                    <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                                                                        Next
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="mt-1 text-base font-bold text-slate-900">{row.congregation}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {congregationGap !== null && (
                                                    <p className="mt-3 text-[11px] font-medium text-slate-500">
                                                        Congregation starts {congregationGap === 0 ? "at the same time" : `${congregationGap} minutes after Aadhan`}.
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}

                                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                        Visual guide: blue blocks are Aadhan and green blocks are congregation for each prayer.
                                    </div>
                                </div>
                            )}

                            {!isLoadingTimings && timingsError && (
                                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                                    <p>{timingsError}</p>
                                    <button
                                        type="button"
                                        onClick={() => setFetchAttempt((attempt) => attempt + 1)}
                                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
                                    >
                                        Try again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-sky-50 p-4">
                        <p className="text-sm text-cyan-900">
                            <span className="font-semibold">Help improve:</span> If you notice a mismatch, submit an update or report. Community feedback keeps this mosque schedule accurate.
                        </p>
                    </div>

                    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                        <button
                            type='button'
                            onClick={updateTimings}
                            className='group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-4 text-white shadow-lg shadow-emerald-200 transition hover:from-emerald-700 hover:to-green-700'
                        >
                            <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/30'>
                                <FiEdit3 size={16} />
                            </span>
                            <span className="text-sm font-semibold">Update Timings</span>
                        </button>
                        <button
                            type='button'
                            onClick={report}
                            className='group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-4 text-white shadow-lg shadow-rose-200 transition hover:from-rose-600 hover:to-orange-600'
                        >
                            <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/30'>
                                <FiAlertTriangle size={16} />
                            </span>
                            <span className="text-sm font-semibold">Report Timing Issue</span>
                        </button>
                    </div>
                </div>
            </div>

            <UpdateTimingModal
                isOpen={activeModal === "update"}
                mosqueName={place.name}
                prayerTimings={prayerTimings}
                onClose={closeActionModal}
            />
            <ReportTimingModal
                isOpen={activeModal === "report"}
                mosqueName={place.name}
                onClose={closeActionModal}
            />
        </>
    );
}
