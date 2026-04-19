import { useState } from "react";
import { FiEdit3, FiInfo, FiUser } from "react-icons/fi";
import NavigationBar from "./NavigationBar";

const VOLUNTEER_KEY = "salah_time_volunteer";

export function isVolunteer(): boolean {
    return localStorage.getItem(VOLUNTEER_KEY) === "true";
}

export default function Settings() {
    const [isVolunteerEnabled, setIsVolunteerEnabled] = useState(() => isVolunteer());

    function handleVolunteerToggle() {
        const next = !isVolunteerEnabled;
        setIsVolunteerEnabled(next);
        localStorage.setItem(VOLUNTEER_KEY, String(next));
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-cyan-50 p-4 pb-24 sm:p-6">
            <div className="mx-auto max-w-2xl space-y-4">

                {/* header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 px-5 py-6 text-white shadow-[0_20px_45px_-20px_rgba(14,116,144,0.75)]">
                    <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
                    <div className="relative flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30">
                            <FiUser size={18} />
                        </span>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">App Settings</p>
                            <h1 className="text-xl font-extrabold leading-tight">Preferences</h1>
                        </div>
                    </div>
                </div>

                {/* community section */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-teal-50/50 px-4 py-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-white">
                            <FiEdit3 size={12} />
                        </span>
                        <p className="text-sm font-bold text-slate-800">Community Contributions</p>
                    </div>

                    <div className="p-4">
                        {/* volunteer toggle row */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-800">Volunteer / Contributor</p>
                                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                                    Designate yourself as a community contributor to unlock the ability to submit and update prayer schedules for mosques in your area. Contributions are reviewed to maintain accuracy across the platform.
                                </p>
                            </div>

                            {/* toggle switch */}
                            <button
                                type="button"
                                role="switch"
                                aria-checked={isVolunteerEnabled}
                                onClick={handleVolunteerToggle}
                                className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                                    isVolunteerEnabled
                                        ? "border-teal-500 bg-teal-500"
                                        : "border-slate-200 bg-slate-200"
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                        isVolunteerEnabled ? "translate-x-5" : "translate-x-0.5"
                                    }`}
                                />
                            </button>
                        </div>

                        {/* active state pill */}
                        {isVolunteerEnabled && (
                            <div className="mt-4 flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2.5">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white">
                                    <FiEdit3 size={10} />
                                </span>
                                <p className="text-xs font-medium text-teal-800">
                                    Contributor access enabled — you may now submit and update prayer timings directly from mosque pages.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* info note */}
                <div className="flex gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3.5 shadow-sm">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                        <FiInfo size={14} />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Community Guidelines</p>
                        <p className="mt-1 text-xs leading-relaxed text-amber-700">
                            Please enable this option only if you have direct access to verified timing information from the mosque's official noticeboard or administration. Submitting unverified or inaccurate data may adversely affect the experience for the wider community.
                        </p>
                    </div>
                </div>

                {/* placeholder for future settings */}
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
                    <p className="text-sm font-medium text-slate-500">Additional settings coming soon</p>
                    <p className="mt-1 text-xs text-slate-400">
                        Account management, notification preferences, and accessibility options will be available in a future update.
                    </p>
                </div>
            </div>

            <NavigationBar />
        </div>
    );
}
