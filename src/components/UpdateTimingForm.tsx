import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { SKELETON_THEME } from "../utils/skeleton-theme";
import { FiArrowLeft, FiCheckCircle, FiClock, FiInfo, FiUsers, FiX } from "react-icons/fi";
import type { PrayerTime } from "../data/adaan-timings";
import { createTimingUpdatesBulk, getTimingUpdatesByMosqueId, Prayer } from "../data/timing-updates";
import type { TimingUpdate } from "../data/timing-updates";
import { addMinutesToTime } from "../utils/time";

type EditablePrayer = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";
type TimingField = "adhan" | "congregation";

const PRAYER_NAME_TO_ENUM: Record<EditablePrayer, Prayer> = {
    Fajr: Prayer.Fajr, Dhuhr: Prayer.Dhuhr, Asr: Prayer.Asr,
    Maghrib: Prayer.Maghrib, Isha: Prayer.Isha,
};

const PRAYER_ENUM_TO_NAME: Record<Prayer, EditablePrayer> = {
    [Prayer.Fajr]: "Fajr", [Prayer.Dhuhr]: "Dhuhr", [Prayer.Asr]: "Asr",
    [Prayer.Maghrib]: "Maghrib", [Prayer.Isha]: "Isha",
};

function dbUpdatesToTimings(updates: TimingUpdate[]): Partial<Record<EditablePrayer, PrayerTimingInput>> {
    const result: Partial<Record<EditablePrayer, PrayerTimingInput>> = {};
    for (const u of updates) {
        if (u.prayer == null || !u.aadhan) continue;
        const name = PRAYER_ENUM_TO_NAME[u.prayer];
        if (!name) continue;
        result[name] = {
            adhan: u.aadhan.slice(0, 5),
            congregation: u.congregation ? u.congregation.slice(0, 5) : u.aadhan.slice(0, 5),
        };
    }
    return result;
}

export interface PrayerTimingInput {
    adhan: string;
    congregation: string;
}

const EDITABLE_PRAYERS: EditablePrayer[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

function defaultCongregation(prayer: EditablePrayer, adhan: string): string {
    if (!adhan) return "";
    if (prayer === "Maghrib") return adhan;
    return addMinutesToTime(adhan, 15);
}

function getPrayerHint(prayer: EditablePrayer): string {
    if (prayer === "Maghrib") return "Congregation usually starts with Aadhan.";
    return "Congregation defaults to 15 minutes after Aadhan.";
}

function buildTimings(pt: PrayerTime | null, overrides?: Partial<Record<EditablePrayer, PrayerTimingInput>>): Record<EditablePrayer, PrayerTimingInput> {
    const v = (s?: string) => (s ?? "").slice(0, 5);
    const base: Record<EditablePrayer, PrayerTimingInput> = {
        Fajr:    { adhan: v(pt?.Fajr),    congregation: defaultCongregation("Fajr",    v(pt?.Fajr))    },
        Dhuhr:   { adhan: v(pt?.Dhuhr),   congregation: defaultCongregation("Dhuhr",   v(pt?.Dhuhr))   },
        Asr:     { adhan: v(pt?.Asr),     congregation: defaultCongregation("Asr",     v(pt?.Asr))     },
        Maghrib: { adhan: v(pt?.Maghrib), congregation: defaultCongregation("Maghrib", v(pt?.Maghrib)) },
        Isha:    { adhan: v(pt?.Isha),    congregation: defaultCongregation("Isha",    v(pt?.Isha))    },
    };
    if (overrides) {
        for (const p of EDITABLE_PRAYERS) {
            if (overrides[p]) base[p] = overrides[p]!;
        }
    }
    return base;
}

interface Props {
    mosqueName: string;
    mosqueId?: string;
    prayerTimings: PrayerTime | null;
    initialTimings?: Partial<Record<EditablePrayer, PrayerTimingInput>>;
    onClose: () => void;
    onSaveSuccess?: () => void;
    asPage?: boolean;
}

export default function UpdateTimingForm({ mosqueName, mosqueId, prayerTimings, initialTimings, onClose, onSaveSuccess, asPage = false }: Props) {
    const [timings, setTimings] = useState(() => buildTimings(prayerTimings, initialTimings));
    const [originalTimings, setOriginalTimings] = useState(() => buildTimings(prayerTimings, initialTimings));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        if (prayerTimings != null || !mosqueId) return;
        setIsFetching(true);
        getTimingUpdatesByMosqueId(mosqueId)
            .then(updates => {
                const prefilled = buildTimings(null, dbUpdatesToTimings(updates));
                setTimings(prefilled);
                setOriginalTimings(prefilled);
            })
            .catch(() => {})
            .finally(() => setIsFetching(false));
    }, [mosqueId, prayerTimings]);

    function handleTimeChange(prayer: EditablePrayer, field: TimingField, value: string) {
        setTimings(prev => ({ ...prev, [prayer]: { ...prev[prayer], [field]: value } }));
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitError(null);
        setIsSubmitting(true);
        try {
            const updates = EDITABLE_PRAYERS
                .filter(p => timings[p].adhan !== originalTimings[p].adhan || timings[p].congregation !== originalTimings[p].congregation)
                .map(p => ({ mosqueId, prayer: PRAYER_NAME_TO_ENUM[p], aadhan: timings[p].adhan, congregation: timings[p].congregation }));
            await Promise.all([
                updates.length > 0 ? createTimingUpdatesBulk(updates) : Promise.resolve(),
                new Promise(r => setTimeout(r, 1200)),
            ]);
            setSaved(true);
            onSaveSuccess?.();
            setTimeout(() => setSaved(false), 3500);
        } catch {
            setSubmitError("Failed to save timings. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const closeButtonClass = "absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/35 backdrop-blur transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-5 sm:top-5";

    const header = (
        <div className="relative overflow-hidden bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 px-5 pb-6 pt-5 text-white shadow-[0_16px_36px_-24px_rgba(14,116,144,0.95)] sm:px-6">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-teal-600/20 blur-2xl" />
            <div className="relative">
                {asPage ? (
                    <>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={onClose} aria-label="Back"
                                className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/20 transition hover:bg-white/25 active:scale-90">
                                <FiArrowLeft size={18} />
                            </button>
                            <div>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ring-1 ring-white/25">
                                    Community Update
                                </span>
                                <h3 className="mt-1.5 text-2xl font-extrabold leading-tight tracking-tight">
                                    Update Salah Timings
                                </h3>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-cyan-100">Review and submit corrected timings for your local community.</p>
                    </>
                ) : (
                    <>
                        <button type="button" onClick={onClose} className={closeButtonClass} aria-label="Close">
                            <FiX size={18} />
                        </button>
                        <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">Community Update</span>
                        <h3 className="mt-3 text-2xl font-extrabold leading-tight">Update Salah Timings</h3>
                        <p className="mt-1 text-sm text-cyan-100">Review and submit corrected mosque timings for your local community.</p>
                    </>
                )}
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-lg">🕌</div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-cyan-100">Updating timings for</p>
                        <p className="truncate text-sm font-bold text-white">{mosqueName}</p>
                    </div>
                </div>
            </div>
        </div>
    );


    const formBody = isFetching ? (
        <SkeletonTheme {...SKELETON_THEME}>
            <div className="space-y-3 p-4 sm:p-6">
                {EDITABLE_PRAYERS.map(prayer => (
                    <div key={prayer} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <Skeleton width={64} height={16} borderRadius={6} />
                            <Skeleton width={72} height={22} borderRadius={999} />
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                            <Skeleton height={52} borderRadius={12} />
                            <Skeleton height={52} borderRadius={12} />
                        </div>
                    </div>
                ))}
            </div>
        </SkeletonTheme>
    ) : (
        <div className="space-y-4 p-4 sm:p-6">
            <div className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-teal-50 px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Before You Update</p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-sky-100 bg-white/90 px-3 py-2">
                        <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-sky-700"><FiClock size={12} />Aadhan</p>
                        <p className="mt-1 text-xs text-slate-600">Set the mosque call-to-prayer time for each Salah.</p>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-white/90 px-3 py-2">
                        <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-emerald-700"><FiUsers size={12} />Congregation</p>
                        <p className="mt-1 text-xs text-slate-600">Set the Jama'ah start time after Aadhan.</p>
                    </div>
                </div>
                <p className="mt-3 inline-flex items-start gap-1.5 text-xs text-slate-600">
                    <FiInfo size={13} className="mt-0.5 shrink-0 text-cyan-700" />
                    Use the local mosque noticeboard values in 24-hour time format.
                </p>
            </div>

            <div className="space-y-3">
                {EDITABLE_PRAYERS.map(prayer => (
                    <div key={prayer} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:border-cyan-300 hover:shadow-[0_16px_30px_-24px_rgba(6,182,212,0.95)]">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-bold text-slate-800">{prayer}</p>
                            <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-cyan-700 ring-1 ring-cyan-200">Time Entry</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                            <div className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2.5">
                                <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
                                    Aadhan
                                    <input type="time" value={timings[prayer].adhan}
                                        onChange={e => handleTimeChange(prayer, "adhan", e.target.value)}
                                        className="h-11 rounded-lg border border-sky-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                                        required />
                                </label>
                            </div>
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
                                <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                    Congregation
                                    <input type="time" value={timings[prayer].congregation}
                                        onChange={e => handleTimeChange(prayer, "congregation", e.target.value)}
                                        className="h-11 rounded-lg border border-emerald-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                                        required />
                                </label>
                            </div>
                        </div>
                        <p className="mt-2 text-[11px] text-slate-500">{getPrayerHint(prayer)}</p>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Tip: Congregation defaults to 15 minutes after Aadhan (except Maghrib).
            </div>

            {submitError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{submitError}</div>
            )}
        </div>
    );

    const footer = (
        <div className={`z-10 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 ${asPage ? "" : "sticky bottom-0"}`}>
            <div className="mx-auto flex max-w-5xl flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                {!asPage && (
                    <button type="button" onClick={onClose} disabled={isSubmitting}
                        className="h-11 rounded-xl border border-cyan-200 bg-white px-5 text-sm font-semibold text-cyan-900 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-cyan-50 hover:shadow-md active:translate-y-0 disabled:opacity-50">
                        Cancel
                    </button>
                )}
                <button type="submit" disabled={isSubmitting || saved}
                    className={`inline-flex items-center justify-center gap-2 h-11 rounded-xl px-5 text-sm font-bold text-white ring-1 ring-white/20 transition-all duration-300 disabled:cursor-not-allowed ${asPage ? "w-full" : ""} ${
                        saved
                            ? "bg-emerald-500 shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)]"
                            : "bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 shadow-[0_16px_30px_-16px_rgba(14,116,144,0.9)] hover:-translate-y-0.5 hover:shadow-[0_20px_34px_-16px_rgba(14,116,144,0.95)] active:translate-y-0 disabled:opacity-50"
                    }`}>
                    {isSubmitting
                        ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        : saved
                            ? <FiCheckCircle size={15} />
                            : null}
                    {isSubmitting ? "Saving…" : saved ? "Saved!" : "Save Updated Timings"}
                </button>
            </div>
        </div>
    );

    if (asPage) {
        return (
            <div className="h-screen bg-gradient-to-b from-teal-50 via-white to-cyan-50 flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 overflow-y-auto">
                        {header}
                        {formBody}
                    </div>
                    {!isFetching && footer}
                </form>
            </div>
        );
    }

    return (
        <div className="relative min-h-full overflow-x-hidden bg-gradient-to-b from-teal-50 via-white to-cyan-50 shadow-2xl">
            <div className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-cyan-300/40 blur-2xl" />
            <div className="pointer-events-none absolute top-10 -left-14 h-32 w-32 rounded-full bg-teal-200/50 blur-2xl" />
            {header}
            <form onSubmit={handleSubmit}>
                {formBody}
                {!isFetching && footer}
            </form>
        </div>
    );
}
