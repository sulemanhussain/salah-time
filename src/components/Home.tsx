import { Link } from "react-router-dom";
import {
    FiActivity,
    FiAlertTriangle,
    FiAward,
    FiCheckCircle,
    FiChevronRight,
    FiClock,
    FiEdit3,
    FiMapPin,
    FiTrendingUp,
} from "react-icons/fi";
import { getAuthCookie } from "../utils/auth-cookie";
import { isVolunteer } from "./Settings";
import NavigationBar from "./NavigationBar";

export default function Home() {
    const authUser = getAuthCookie();
    const displayName = authUser?.email?.split("@")[0] || "User";
    const initials = displayName.slice(0, 2).toUpperCase();
    const joinedDate = authUser?.loggedInAt
        ? new Date(authUser.loggedInAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
        : "Recently";

    const stats = [
        { label: "Timings Updated",   value: 12, trend: "+3 this week",  icon: FiEdit3,       color: "from-teal-500 to-cyan-600",     bg: "bg-teal-50",    text: "text-teal-700"    },
        { label: "Reports Submitted", value: 4,  trend: "1 resolved",    icon: FiAlertTriangle, color: "from-rose-500 to-pink-600",   bg: "bg-rose-50",    text: "text-rose-700"    },
        { label: "Verified",          value: 9,  trend: "90% accuracy",  icon: FiCheckCircle,  color: "from-emerald-500 to-green-600", bg: "bg-emerald-50", text: "text-emerald-700" },
    ];

    const recentActivity = [
        { icon: FiEdit3,        color: "bg-teal-100 text-teal-600",     title: "Masjid Noor — Fajr",   detail: "Updated congregation to 05:45 AM",  time: "2h ago"    },
        { icon: FiAlertTriangle,color: "bg-rose-100 text-rose-600",     title: "Jamia Masjid — Dhuhr", detail: "Reported mismatch with noticeboard", time: "Yesterday" },
        { icon: FiCheckCircle,  color: "bg-emerald-100 text-emerald-600", title: "Al Rahma — Isha",    detail: "Verified Aadhan and Jama'ah times",  time: "3 days ago" },
    ];

    const suggestions = [
        { icon: FiClock,       title: "Verify Friday Jumu'ah timing",  note: "Multiple users flagged outdated Friday schedules nearby." },
        { icon: FiEdit3,       title: "Confirm Ramadan timetable",     note: "Seasonal times shift significantly — your update would help many." },
        { icon: FiTrendingUp,  title: "Review high-traffic mosques",   note: "3 nearby mosques have unverified timings and are frequently visited." },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-cyan-50 p-4 pb-24 sm:p-5">
            <div className="mx-auto max-w-2xl space-y-4">

                {/* hero */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 p-5 text-white shadow-[0_20px_45px_-20px_rgba(14,116,144,0.75)] sm:p-6">
                    <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />

                    <div className="relative flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <h1 className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">
                                Assalamu Alaikum, <span className="text-cyan-200">{displayName}</span>
                            </h1>
                            <p className="mt-1.5 text-sm text-cyan-100/90">
                                {isVolunteer()
                                    ? "JazakAllahu Khayran — your contributions help Muslims find accurate prayer times."
                                    : "Join our contributors and help keep local mosque prayer times accurate for everyone."}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                                <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
                                    <FiClock size={10} />
                                    Since {joinedDate}
                                </span>
                                {isVolunteer() && (
                                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/25 px-3 py-1 font-semibold text-emerald-100 ring-1 ring-emerald-300/30">
                                        <FiAward size={10} />
                                        Contributor
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-lg font-extrabold ring-2 ring-white/30">
                            {initials}
                        </div>
                    </div>

                    <Link
                        to="/app"
                        className="mt-5 flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-teal-800 shadow-lg transition hover:bg-teal-50 active:scale-95"
                    >
                        <FiMapPin size={15} />
                        Find Mosques Near Me
                        <FiChevronRight size={14} className="ml-auto opacity-50" />
                    </Link>
                </div>

                {/* contribution stats */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-teal-50/50 px-4 py-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-white">
                            <FiTrendingUp size={12} />
                        </span>
                        <p className="text-sm font-bold text-slate-800">Your Contributions</p>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-slate-100">
                        {stats.map((s) => (
                            <div key={s.label} className="flex flex-col items-center gap-1 px-2 py-4 text-center">
                                <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white shadow-sm`}>
                                    <s.icon size={15} />
                                </span>
                                <p className="mt-1 text-3xl font-extrabold tabular-nums text-slate-800">{s.value}</p>
                                <p className="text-[10px] font-semibold leading-tight text-slate-500">{s.label}</p>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.bg} ${s.text}`}>
                                    {s.trend}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* recent activity */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-cyan-50/50 px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-white">
                                <FiActivity size={12} />
                            </span>
                            <p className="text-sm font-bold text-slate-800">Recent Activity</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-500">
                            Last 7 days
                        </span>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {recentActivity.map((item) => (
                            <div key={item.title} className="flex items-center gap-3 px-4 py-3.5">
                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                                    <item.icon size={15} />
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                                    <p className="mt-0.5 truncate text-xs text-slate-500">{item.detail}</p>
                                </div>
                                <span className="shrink-0 text-[11px] text-slate-400">{item.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* suggestions */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-amber-50/60 px-4 py-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-white">
                            <FiAward size={12} />
                        </span>
                        <p className="text-sm font-bold text-slate-800">Suggested Actions</p>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {suggestions.map((item) => (
                            <button key={item.title} type="button" className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-amber-50/40 active:bg-amber-50">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                    <item.icon size={15} />
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.note}</p>
                                </div>
                                <FiChevronRight size={15} className="shrink-0 text-slate-300" />
                            </button>
                        ))}
                    </div>
                </div>

            </div>
            <NavigationBar />
        </div>
    );
}
