import { useEffect, useMemo, useState } from "react";
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
import type { PrayerTime, HijriDate } from "../data/adaan-timings";
import type { MapPlace } from "../data/Maps";
import { getMosqueByPlaceId } from "../data/mosque-details";
import { getTimingUpdatesByMosqueId, Prayer } from "../data/timing-updates";

const PRAYER_ENUM_TO_KEY: Record<Prayer, { key: string; name: string }> = {
    [Prayer.Fajr]:   { key: 'fajr',    name: PRAYER_NAMES.FAJR },
    [Prayer.Dhuhr]:  { key: 'dhuhr',   name: PRAYER_NAMES.DHUHR },
    [Prayer.Asr]:    { key: 'asr',     name: PRAYER_NAMES.ASR },
    [Prayer.Maghrib]:{ key: 'maghrib', name: PRAYER_NAMES.MAGHRIB },
    [Prayer.Isha]:   { key: 'isha',    name: PRAYER_NAMES.ISHA },
};

function buildModalInitialTimings(updates: TimingUpdate[]): Partial<Record<string, { adhan: string; congregation: string }>> {
    const result: Partial<Record<string, { adhan: string; congregation: string }>> = {};
    for (const u of updates) {
        if (u.prayer == null || !u.aadhan) continue;
        const meta = PRAYER_ENUM_TO_KEY[u.prayer];
        if (!meta) continue;
        result[meta.name] = {
            adhan: u.aadhan.slice(0, 5),
            congregation: u.congregation ? u.congregation.slice(0, 5) : u.aadhan.slice(0, 5),
        };
    }
    return result;
}
import type { TimingUpdate } from "../data/timing-updates";
import UpdateTimingModal from "./UpdateTimingModal";
import UpdateMethodModal from "./UpdateMethodModal";
import ReportTimingModal from "./ReportTimingModal";
import { FLAGS } from "../flags";
import { isVolunteer } from "./Settings";
import { addMinutesToTime, parseTimeToMinutes, calculateMinuteGap, formatTimeUntil } from "../utils/time";

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
    const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
    const [dbTimingUpdates, setDbTimingUpdates] = useState<TimingUpdate[] | null>(null);
    const [mosqueDbId, setMosqueDbId] = useState<string | undefined>(undefined);
    const [isMosqueInactive, setIsMosqueInactive] = useState(false);
    const [isLoadingTimings, setIsLoadingTimings] = useState(false);
    const [timingsError, setTimingsError] = useState<string | null>(null);
    const [activeModal, setActiveModal] = useState<"method" | "update" | "report" | null>(null);
    const [fetchAttempt, setFetchAttempt] = useState(0);
    const [nowMinutes, setNowMinutes] = useState(() => new Date().getHours() * 60 + new Date().getMinutes());

    useEffect(() => {
        const interval = setInterval(() => {
            setNowMinutes(new Date().getHours() * 60 + new Date().getMinutes());
        }, 60_000);
        return () => clearInterval(interval);
    }, []);

    // Fetch prayer timings
    useEffect(() => {
        if (place?.geometry?.location) {
            setIsLoadingTimings(true);
            setTimingsError(null);
            setPrayerTimings(null);
            setDbTimingUpdates(null);
            setMosqueDbId(undefined);
            setIsMosqueInactive(false);
            const fetchTimings = async () => {
                try {
                    const coordinates = [{ latitude: place.geometry.location.lat, longitude: place.geometry.location.lng }];
                    const [mosque, externalTimings] = await Promise.all([
                        getMosqueByPlaceId(place.place_id),
                        getPrayerTimings(coordinates),
                    ]);

                    setPrayerTimings(externalTimings.timings);
                    setHijriDate(externalTimings.hijriDate);

                    if (mosque?.id) {
                        setMosqueDbId(mosque.id);
                        setIsMosqueInactive(mosque.isActive === false);
                        const updates = await getTimingUpdatesByMosqueId(mosque.id);
                        const sortedList = updates.sort((a, b) => a.prayer - b.prayer);
                        if (sortedList.length > 0) {
                            setDbTimingUpdates(sortedList);
                        }
                    }
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

    const prayerRows = useMemo<PrayerRow[]>(() => {
        if (!prayerTimings) return [];

        const dbByPrayer = new Map(
            (dbTimingUpdates ?? [])
                .filter((u) => u.prayer != null && u.aadhan)
                .map((u) => [u.prayer as Prayer, u])
        );

        const CALCULATED_DEFAULTS: Record<Prayer, { adhan: string; congregation: string }> = {
            [Prayer.Fajr]:    { adhan: prayerTimings.Fajr,    congregation: addMinutesToTime(prayerTimings.Fajr, 15) },
            [Prayer.Dhuhr]:   { adhan: prayerTimings.Dhuhr,   congregation: addMinutesToTime(prayerTimings.Dhuhr, 15) },
            [Prayer.Asr]:     { adhan: prayerTimings.Asr,     congregation: addMinutesToTime(prayerTimings.Asr, 15) },
            [Prayer.Maghrib]: { adhan: prayerTimings.Maghrib, congregation: prayerTimings.Maghrib },
            [Prayer.Isha]:    { adhan: prayerTimings.Isha,    congregation: addMinutesToTime(prayerTimings.Isha, 15) },
        };

        return Object.entries(PRAYER_ENUM_TO_KEY).map(([prayerEnumStr, meta]) => {
            const prayerEnum = Number(prayerEnumStr) as Prayer;
            const db = dbByPrayer.get(prayerEnum);
            const adhan = db ? db.aadhan! : CALCULATED_DEFAULTS[prayerEnum].adhan;
            const congregation = db
                ? (db.congregation ?? db.aadhan!)
                : CALCULATED_DEFAULTS[prayerEnum].congregation;
            return {
                key: meta.key,
                prayer: meta.name,
                adhan: formatPrayerTime(adhan),
                congregation: formatPrayerTime(congregation),
                adhanMinutes: parseTimeToMinutes(adhan),
                congregationMinutes: parseTimeToMinutes(congregation),
            };
        });
    }, [prayerTimings, dbTimingUpdates]);

    const nextEvent = useMemo(() => {
        const events = prayerRows.flatMap((row) => [
            row.adhanMinutes !== null ? { prayerKey: row.key, prayerName: row.prayer, type: "Aadhan" as const, displayTime: row.adhan, minutes: row.adhanMinutes } : null,
            row.congregationMinutes !== null ? { prayerKey: row.key, prayerName: row.prayer, type: "Congregation" as const, displayTime: row.congregation, minutes: row.congregationMinutes } : null,
        ]).filter((e): e is NonNullable<typeof e> => e !== null);

        if (!events.length) return null;

        const upcoming = events.filter((e) => e.minutes >= nowMinutes).sort((a, b) => a.minutes - b.minutes);
        if (upcoming.length) {
            return { ...upcoming[0], isTomorrow: false, minutesAway: upcoming[0].minutes - nowMinutes };
        }

        const first = [...events].sort((a, b) => a.minutes - b.minutes)[0];
        return { ...first, isTomorrow: true, minutesAway: (1440 - nowMinutes) + first.minutes };
    }, [prayerRows, nowMinutes]);

    if (!place) return null;

    function updateTimings() { setActiveModal(FLAGS.UPDATE_METHOD_PICKER ? "method" : "update"); }
    function report() { setActiveModal("report"); }
    function closeActionModal() { setActiveModal(null); }

    const location = place.geometry.location;
    const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&destination_place_id=${place.place_id}`;
    const mapsPlaceUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`;
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

                    {isMosqueInactive && (
                        <div className="rounded-2xl border border-rose-300 bg-gradient-to-r from-rose-50 to-pink-50 p-4 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                                    <FiAlertTriangle size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-rose-900">Mosque details under review</p>
                                    <p className="mt-1 text-sm text-rose-700">
                                        This mosque's information is currently being verified and may be inaccurate. Prayer times are temporarily hidden. Contact the mosque directly to confirm schedules.
                                    </p>
                                    <ul className="mt-2 space-y-0.5 text-xs text-rose-600">
                                        <li>· Prayer times are unavailable until verification is complete</li>
                                        <li>· Address or location details may not be up to date</li>
                                        <li>· If you have accurate information, use the Report button to help resolve this</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isMosqueInactive && (
                    <div className='overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.55)] backdrop-blur'>
                        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-cyan-50 p-5">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                    <h2 className='text-xl font-bold text-slate-900 sm:text-2xl'>Prayer Times</h2>
                                    <p className="mt-1 text-sm text-slate-600">Aadhan and congregation times for {place.name}.</p>
                                </div>
                                {hijriDate && (
                                    <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-semibold text-cyan-700 shadow-sm">
                                        <FiClock size={11} className="shrink-0" />
                                        {hijriDate.day} {hijriDate.month.en} {hijriDate.year} AH
                                    </span>
                                )}
                            </div>
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

                            {!isLoadingTimings && prayerRows.length > 0 && (
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
                    )}

                    {!isMosqueInactive && (
                        <div className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-sky-50 p-4">
                            <p className="text-sm text-cyan-900">
                                <span className="font-semibold">Help improve:</span> If you notice a mismatch, submit an update or report. Community feedback keeps this mosque schedule accurate.
                            </p>
                        </div>
                    )}

                    <div className={`grid gap-3 ${isVolunteer() && !isMosqueInactive ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                        {isVolunteer() && !isMosqueInactive && (
                            <button
                                type='button'
                                onClick={updateTimings}
                                className='inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0'
                            >
                                <FiEdit3 size={15} />
                                Update Timings
                            </button>
                        )}
                        <button
                            type='button'
                            onClick={report}
                            className='inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-rose-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-rose-50 hover:border-rose-300 active:translate-y-0'
                        >
                            <FiAlertTriangle size={15} />
                            Report Issue
                        </button>
                    </div>
                </div>
            </div>

            <UpdateMethodModal
                isOpen={activeModal === "method"}
                mosqueName={place.name}
                onManual={() => setActiveModal("update")}
                onClose={closeActionModal}
            />
            <UpdateTimingModal
                isOpen={activeModal === "update"}
                mosqueName={place.name}
                mosqueId={mosqueDbId}
                prayerTimings={prayerTimings}
                initialTimings={dbTimingUpdates ? buildModalInitialTimings(dbTimingUpdates) : undefined}
                onClose={closeActionModal}
                onSaveSuccess={() => setFetchAttempt((a) => a + 1)}
            />
            <ReportTimingModal
                isOpen={activeModal === "report"}
                mosqueName={place.name}
                onClose={closeActionModal}
            />
        </>
    );
}
