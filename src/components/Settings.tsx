import { useState } from "react";
import { FiChevronRight, FiEdit3, FiInfo, FiLogOut, FiUser } from "react-icons/fi";
import NavigationBar from "./NavigationBar";
import ProfileModal from "./ProfileModal";
import { getAuthCookie, clearAuthCookie } from "../utils/auth-cookie";
import { useNavigate } from "react-router-dom";

const VOLUNTEER_KEY = "salah_time_volunteer";

export function isVolunteer(): boolean {
    return localStorage.getItem(VOLUNTEER_KEY) === "true";
}

export default function Settings() {
    const [isVolunteerEnabled, setIsVolunteerEnabled] = useState(() => isVolunteer());
    const [profileOpen, setProfileOpen] = useState(false);
    const navigate = useNavigate();

    const authUser = getAuthCookie();
    const displayName = authUser?.email?.split("@")[0] ?? "User";
    const initials = displayName.slice(0, 2).toUpperCase();

    function handleVolunteerToggle() {
        const next = !isVolunteerEnabled;
        setIsVolunteerEnabled(next);
        localStorage.setItem(VOLUNTEER_KEY, String(next));
    }

    function handleSignOut() {
        clearAuthCookie();
        navigate("/login", { replace: true });
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-cyan-50 p-4 pb-24 sm:p-6">
            <div className="mx-auto max-w-2xl space-y-4">

                {/* personalised header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 px-5 py-6 text-white shadow-[0_20px_45px_-20px_rgba(14,116,144,0.75)]">
                    <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
                    <div className="relative flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-lg font-extrabold ring-2 ring-white/30">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">Settings</p>
                            <p className="truncate text-xl font-extrabold leading-tight">{displayName}</p>
                            <p className="truncate text-xs text-cyan-200/80">{authUser?.email}</p>
                        </div>
                    </div>
                </div>

                {/* account */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-teal-50/50 px-4 py-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-white">
                            <FiUser size={12} />
                        </span>
                        <p className="text-sm font-bold text-slate-800">Account</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setProfileOpen(true)}
                        className="flex w-full items-center gap-4 p-4 transition hover:bg-slate-50 active:bg-slate-100"
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-sm font-extrabold text-white shadow-sm">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-semibold text-slate-800">{displayName}</p>
                            <p className="truncate text-xs text-slate-400">{authUser?.email}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-teal-600">
                            Edit
                            <FiChevronRight size={14} className="text-slate-300" />
                        </div>
                    </button>
                </div>

                {/* community contributions */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-teal-50/50 px-4 py-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-white">
                            <FiEdit3 size={12} />
                        </span>
                        <p className="text-sm font-bold text-slate-800">Community Contributions</p>
                    </div>

                    <div className="p-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800">Volunteer Mode</p>
                                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                                    Unlock the ability to submit and update prayer schedules for mosques in your area.
                                </p>
                            </div>

                            <button
                                type="button"
                                role="switch"
                                aria-checked={isVolunteerEnabled}
                                onClick={handleVolunteerToggle}
                                className={`relative ml-2 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                                    isVolunteerEnabled ? "border-teal-500 bg-teal-500" : "border-slate-200 bg-slate-200"
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                        isVolunteerEnabled ? "translate-x-5" : "translate-x-0.5"
                                    }`}
                                />
                            </button>
                        </div>

                        <div className={`mt-3 overflow-hidden transition-all duration-300 ${isVolunteerEnabled ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}>
                            <div className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2.5">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white">
                                    <FiEdit3 size={10} />
                                </span>
                                <p className="text-xs font-medium text-teal-800">
                                    Contributor access enabled — update timings directly from mosque pages.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* community guidelines */}
                <div className="flex gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3.5 shadow-sm">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                        <FiInfo size={14} />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Community Guidelines</p>
                        <p className="mt-1 text-xs leading-relaxed text-amber-700">
                            Only enable Volunteer Mode if you have direct access to verified timing information from the mosque's official noticeboard or administration.
                        </p>
                    </div>
                </div>

                {/* sign out */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-rose-50 active:bg-rose-100"
                    >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                            <FiLogOut size={16} />
                        </span>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-rose-600">Sign Out</p>
                            <p className="text-xs text-slate-400">You'll need to log in again to access the app</p>
                        </div>
                    </button>
                </div>

            </div>

            <NavigationBar />
            <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
        </div>
    );
}
