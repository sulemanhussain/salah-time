import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
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

export default function UpdateTimingModal({ isOpen, mosqueName, prayerTimings, onClose }: UpdateTimingModalProps) {
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
            <div className="relative h-full overflow-x-hidden border border-sky-100 bg-white shadow-2xl">
                <div className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-sky-200/50 blur-2xl"></div>
                <div className="pointer-events-none absolute top-10 -left-14 h-32 w-32 rounded-full bg-blue-100/70 blur-2xl"></div>

                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-xl text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-700"
                    aria-label="Close"
                >
                    &times;
                </button>

                <div className="relative border-b border-sky-100 bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 px-6 pb-5 pt-6 text-white">
                    <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
                        Community Update
                    </span>
                    <h3 className="mt-3 text-2xl font-bold leading-tight">Update Salah Timings</h3>
                    <p className="mt-1 text-sm text-sky-100">Review and submit corrected mosque timings.</p>
                    <p className="mt-4 text-base font-semibold text-white">{mosqueName}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
                    <div className="rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 px-4 py-3 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Before You Update</p>
                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div className="rounded-lg border border-sky-100 bg-white/90 px-3 py-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Aadhan</p>
                                <p className="mt-1 text-xs text-slate-600">Set the mosque call-to-prayer time for each Salah.</p>
                            </div>
                            <div className="rounded-lg border border-emerald-100 bg-white/90 px-3 py-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Congregation</p>
                                <p className="mt-1 text-xs text-slate-600">Set the Jama'ah start time after Aadhan.</p>
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-slate-600">
                            Use the local mosque noticeboard values in 24-hour time format.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {EDITABLE_PRAYERS.map((prayer) => (
                            <div
                                key={prayer}
                                className="rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-4 py-3 shadow-sm"
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <p className="text-sm font-bold text-slate-800">{prayer}</p>
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                        Time Entry
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Aadhan
                                        <input
                                            type="time"
                                            value={updatedTimings[prayer].adhan}
                                            onChange={(event) => handleTimeChange(prayer, "adhan", event.target.value)}
                                            className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                                            required
                                        />
                                    </label>
                                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Congregation
                                        <input
                                            type="time"
                                            value={updatedTimings[prayer].congregation}
                                            onChange={(event) => handleTimeChange(prayer, "congregation", event.target.value)}
                                            className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                                            required
                                        />
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        Tip: By default, congregation is set to 15 minutes after Aadhan (except Maghrib).
                    </div>

                    <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-11 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="h-11 rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:from-sky-700 hover:to-blue-700"
                        >
                            Save Updated Timings
                        </button>
                    </div>
                </form>
            </div>
        </Modal>,
        document.getElementById("content-modal")!
    );
}
