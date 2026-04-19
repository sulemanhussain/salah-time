import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import { FiClock, FiInfo, FiUsers, FiX } from "react-icons/fi";
import type { PrayerTime } from "../data/adaan-timings";
import Modal from "./Modal";

type EditablePrayer = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";
type TimingField = "adhan" | "congregation";

interface PrayerTimingInput {
    adhan: string;
    congregation: string;
}

const EDITABLE_PRAYERS: EditablePrayer[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

interface UpdateTimingModalProps {
    isOpen: boolean;
    mosqueName: string;
    prayerTimings: PrayerTime | null;
    onClose: () => void;
}

const normalizeTimeValue = (value?: string): string => {
    if (!value) return "";
    return value.slice(0, 5);
};

const addMinutesToTime = (timeString: string, minutes: number): string => {
    if (!timeString) return "";
    const [hours, mins] = timeString.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(mins)) return "";

    let totalMinutes = hours * 60 + mins + minutes;
    while (totalMinutes < 0) totalMinutes += 24 * 60;
    totalMinutes = totalMinutes % (24 * 60);

    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, "0")}:${String(newMins).padStart(2, "0")}`;
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

export default function UpdateTimingModal({ isOpen, mosqueName, prayerTimings, onClose }: UpdateTimingModalProps) {
    const closeButtonClassName =
        "absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/35 backdrop-blur transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-5 sm:top-5";
    const [updatedTimings, setUpdatedTimings] = useState<Record<EditablePrayer, PrayerTimingInput>>({
        Fajr: { adhan: "", congregation: "" },
        Dhuhr: { adhan: "", congregation: "" },
        Asr: { adhan: "", congregation: "" },
        Maghrib: { adhan: "", congregation: "" },
        Isha: { adhan: "", congregation: "" },
    });

    useEffect(() => {
        if (!isOpen) return;

        const fajrAdhan = normalizeTimeValue(prayerTimings?.Fajr);
        const dhuhrAdhan = normalizeTimeValue(prayerTimings?.Dhuhr);
        const asrAdhan = normalizeTimeValue(prayerTimings?.Asr);
        const maghribAdhan = normalizeTimeValue(prayerTimings?.Maghrib);
        const ishaAdhan = normalizeTimeValue(prayerTimings?.Isha);

        setUpdatedTimings({
            Fajr: { adhan: fajrAdhan, congregation: defaultCongregationTime("Fajr", fajrAdhan) },
            Dhuhr: { adhan: dhuhrAdhan, congregation: defaultCongregationTime("Dhuhr", dhuhrAdhan) },
            Asr: { adhan: asrAdhan, congregation: defaultCongregationTime("Asr", asrAdhan) },
            Maghrib: { adhan: maghribAdhan, congregation: defaultCongregationTime("Maghrib", maghribAdhan) },
            Isha: { adhan: ishaAdhan, congregation: defaultCongregationTime("Isha", ishaAdhan) },
        });
    }, [isOpen, prayerTimings]);

    function handleTimeChange(prayer: EditablePrayer, field: TimingField, value: string) {
        setUpdatedTimings((previous) => ({
            ...previous,
            [prayer]: {
                ...previous[prayer],
                [field]: value,
            },
        }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        console.log("Updated prayer timings:", {
            mosqueName,
            timings: updatedTimings,
        });
        onClose();
    }

    return createPortal(
        <Modal isOpen={isOpen} fullPage>
            <div className="relative min-h-full overflow-x-hidden bg-gradient-to-b from-teal-50 via-white to-cyan-50 shadow-2xl">
                <div className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-cyan-300/40 blur-2xl"></div>
                <div className="pointer-events-none absolute top-10 -left-14 h-32 w-32 rounded-full bg-teal-200/50 blur-2xl"></div>

                <div className="sticky top-0 z-20 border-b border-cyan-900/20 bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 px-5 pb-5 pt-6 text-white shadow-[0_16px_36px_-24px_rgba(14,116,144,0.95)] sm:px-6">
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
                    <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur">
                        <p className="text-[11px] uppercase tracking-[0.08em] text-cyan-100">Mosque</p>
                        <p className="mt-1 text-sm font-semibold text-white sm:text-base">{mosqueName}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-4 pb-24 sm:p-6 sm:pb-28">
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

                    <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
                        <div className="mx-auto flex max-w-5xl flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-11 rounded-xl border border-cyan-200 bg-white px-5 text-sm font-semibold text-cyan-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-50 hover:shadow-md active:translate-y-0"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="h-11 rounded-xl bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 px-5 text-sm font-semibold text-white ring-1 ring-white/20 shadow-[0_16px_30px_-16px_rgba(14,116,144,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:from-teal-800 hover:via-cyan-800 hover:to-sky-800 hover:shadow-[0_20px_34px_-16px_rgba(14,116,144,0.95)] active:translate-y-0"
                        >
                            Save Updated Timings
                        </button>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>,
        document.getElementById("content-modal")!
    );
}
