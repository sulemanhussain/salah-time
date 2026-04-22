import { useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import { FiClock, FiInfo, FiUsers, FiX } from "react-icons/fi";
import type { PrayerTime } from "../data/adaan-timings";
import { createTimingUpdatesBulk, Prayer } from "../data/timing-updates";
import { addMinutesToTime } from "../utils/time";
import Modal from "./Modal";

type EditablePrayer = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";
type TimingField = "adhan" | "congregation";

const PRAYER_NAME_TO_ENUM: Record<EditablePrayer, Prayer> = {
    Fajr: Prayer.Fajr,
    Dhuhr: Prayer.Dhuhr,
    Asr: Prayer.Asr,
    Maghrib: Prayer.Maghrib,
    Isha: Prayer.Isha,
};

interface PrayerTimingInput {
    adhan: string;
    congregation: string;
}

const EDITABLE_PRAYERS: EditablePrayer[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

interface UpdateTimingModalProps {
    isOpen: boolean;
    mosqueName: string;
    mosqueId?: string;
    prayerTimings: PrayerTime | null;
    initialTimings?: Partial<Record<EditablePrayer, PrayerTimingInput>>;
    onClose: () => void;
    onSaveSuccess?: () => void;
}

const normalizeTimeValue = (value?: string): string => {
    if (!value) return "";
    return value.slice(0, 5);
};


const defaultCongregationTime = (prayer: EditablePrayer, adhan: string): string => {
    if (!adhan) return "";
    if (prayer === "Maghrib") return adhan;
    return addMinutesToTime(adhan, 15);
};

const getPrayerHint = (prayer: EditablePrayer): string => {
    if (prayer === "Maghrib") return "Congregation usually starts with Aadhan.";
    return "Congregation defaults to 15 minutes after Aadhan.";
};

export default function UpdateTimingModal({ isOpen, mosqueName, mosqueId, prayerTimings, initialTimings, onClose, onSaveSuccess }: UpdateTimingModalProps) {
    const closeButtonClassName =
        "absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/35 backdrop-blur transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-5 sm:top-5";
    const buildTimings = (pt: PrayerTime | null, overrides?: Partial<Record<EditablePrayer, PrayerTimingInput>>): Record<EditablePrayer, PrayerTimingInput> => {
        const fajr = normalizeTimeValue(pt?.Fajr);
        const dhuhr = normalizeTimeValue(pt?.Dhuhr);
        const asr = normalizeTimeValue(pt?.Asr);
        const maghrib = normalizeTimeValue(pt?.Maghrib);
        const isha = normalizeTimeValue(pt?.Isha);
        const base: Record<EditablePrayer, PrayerTimingInput> = {
            Fajr:    { adhan: fajr,    congregation: defaultCongregationTime("Fajr",    fajr)    },
            Dhuhr:   { adhan: dhuhr,   congregation: defaultCongregationTime("Dhuhr",   dhuhr)   },
            Asr:     { adhan: asr,     congregation: defaultCongregationTime("Asr",     asr)     },
            Maghrib: { adhan: maghrib, congregation: defaultCongregationTime("Maghrib", maghrib) },
            Isha:    { adhan: isha,    congregation: defaultCongregationTime("Isha",    isha)    },
        };
        if (overrides) {
            for (const prayer of EDITABLE_PRAYERS) {
                if (overrides[prayer]) base[prayer] = overrides[prayer]!;
            }
        }
        return base;
    };

    const [updatedTimings, setUpdatedTimings] = useState<Record<EditablePrayer, PrayerTimingInput>>(
        () => buildTimings(prayerTimings, initialTimings)
    );
    const [originalTimings, setOriginalTimings] = useState<Record<EditablePrayer, PrayerTimingInput>>(
        () => buildTimings(prayerTimings, initialTimings)
    );
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    const [prevTimings, setPrevTimings] = useState(prayerTimings);
    const [prevInitial, setPrevInitial] = useState(initialTimings);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    if (!isOpen && prevIsOpen) {
        setPrevIsOpen(false);
        setSaved(false);
    }

    if (isOpen && (prevIsOpen !== isOpen || prevTimings !== prayerTimings || prevInitial !== initialTimings)) {
        setPrevIsOpen(isOpen);
        setPrevTimings(prayerTimings);
        setPrevInitial(initialTimings);
        const fresh = buildTimings(prayerTimings, initialTimings);
        setUpdatedTimings(fresh);
        setOriginalTimings(fresh);
    }

    function handleTimeChange(prayer: EditablePrayer, field: TimingField, value: string) {
        setUpdatedTimings((previous) => ({
            ...previous,
            [prayer]: {
                ...previous[prayer],
                [field]: value,
            },
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitError(null);
        setIsSubmitting(true);
        try {
            const updates = EDITABLE_PRAYERS
                .filter((prayer) => {
                    const orig = originalTimings[prayer];
                    const curr = updatedTimings[prayer];
                    return curr.adhan !== orig.adhan || curr.congregation !== orig.congregation;
                })
                .map((prayer) => ({
                    mosqueId,
                    prayer: PRAYER_NAME_TO_ENUM[prayer],
                    aadhan: updatedTimings[prayer].adhan,
                    congregation: updatedTimings[prayer].congregation,
                }));
            if (updates.length === 0) { setSaved(true); return; }
            await createTimingUpdatesBulk(updates);
            setSaved(true);
        } catch {
            setSubmitError("Failed to save timings. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return createPortal(
        <Modal isOpen={isOpen} fullPage>
            <div className="relative min-h-full overflow-x-hidden bg-gradient-to-b from-teal-50 via-white to-cyan-50 shadow-2xl">
                <div className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-cyan-300/40 blur-2xl"></div>
                <div className="pointer-events-none absolute top-10 -left-14 h-32 w-32 rounded-full bg-teal-200/50 blur-2xl"></div>

                <div className="top-0 z-20 border-b border-cyan-900/20 bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 px-5 pb-5 pt-6 text-white shadow-[0_16px_36px_-24px_rgba(14,116,144,0.95)] sm:px-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className={closeButtonClassName}
                        aria-label="Close"
                    >
                        <FiX size={18} />
                    </button>
                    <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
                        Community Update
                    </span>
                    <h3 className="mt-3 text-2xl font-extrabold leading-tight">Update Salah Timings</h3>
                    <p className="mt-1 text-sm text-cyan-100">Review and submit corrected mosque timings for your local community.</p>
                    <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-lg">
                            🕌
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-cyan-100">Updating timings for</p>
                            <p className="truncate text-sm font-bold text-white">{mosqueName}</p>
                        </div>
                    </div>
                </div>

                {saved && (
                    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl shadow-inner">
                            🕌
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-extrabold text-slate-900">Details Updated Successfully!</h3>
                            <p className="text-sm text-slate-600">Thank you for your contribution. Your update helps keep this mosque schedule accurate for the community.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => { onSaveSuccess?.(); onClose(); }}
                            className="rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                        >
                            Done
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={`space-y-4 p-4 sm:p-6 ${saved ? 'hidden' : ''}`}>
                    <div className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-teal-50 px-4 py-3 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Before You Update</p>
                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div className="rounded-xl border border-sky-100 bg-white/90 px-3 py-2">
                                <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
                                    <FiClock size={12} />
                                    Aadhan
                                </p>
                                <p className="mt-1 text-xs text-slate-600">Set the mosque call-to-prayer time for each Salah.</p>
                            </div>
                            <div className="rounded-xl border border-emerald-100 bg-white/90 px-3 py-2">
                                <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                    <FiUsers size={12} />
                                    Congregation
                                </p>
                                <p className="mt-1 text-xs text-slate-600">Set the Jama'ah start time after Aadhan.</p>
                            </div>
                        </div>
                        <p className="mt-3 inline-flex items-start gap-1.5 text-xs text-slate-600">
                            <FiInfo size={13} className="mt-0.5 shrink-0 text-cyan-700" />
                            <span>
                            Use the local mosque noticeboard values in 24-hour time format.
                            </span>
                        </p>
                    </div>

                    <div className="space-y-3">
                        {EDITABLE_PRAYERS.map((prayer) => (
                            <div
                                key={prayer}
                                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:border-cyan-300 hover:shadow-[0_16px_30px_-24px_rgba(6,182,212,0.95)]"
                            >
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm font-bold text-slate-800 sm:text-base">{prayer}</p>
                                    <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-cyan-700 ring-1 ring-cyan-200">
                                        Time Entry
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                    <div className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2.5">
                                        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
                                            Aadhan
                                            <input
                                                type="time"
                                                value={updatedTimings[prayer].adhan}
                                                onChange={(event) => handleTimeChange(prayer, "adhan", event.target.value)}
                                                className="h-11 rounded-lg border border-sky-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                                                required
                                            />
                                        </label>
                                    </div>
                                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
                                        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                            Congregation
                                            <input
                                                type="time"
                                                value={updatedTimings[prayer].congregation}
                                                onChange={(event) => handleTimeChange(prayer, "congregation", event.target.value)}
                                                className="h-11 rounded-lg border border-emerald-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                                                required
                                            />
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
                        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                            {submitError}
                        </div>
                    )}

                    <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
                        <div className="mx-auto flex max-w-5xl flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="h-11 rounded-xl border border-cyan-200 bg-white px-5 text-sm font-semibold text-cyan-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-50 hover:shadow-md active:translate-y-0 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-11 rounded-xl bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 px-5 text-sm font-semibold text-white ring-1 ring-white/20 shadow-[0_16px_30px_-16px_rgba(14,116,144,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:from-teal-800 hover:via-cyan-800 hover:to-sky-800 hover:shadow-[0_20px_34px_-16px_rgba(14,116,144,0.95)] active:translate-y-0 disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : "Save Updated Timings"}
                        </button>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>,
        document.getElementById("content-modal")!
    );
}
