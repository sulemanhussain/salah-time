import { useState, useEffect } from "react";
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
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { SKELETON_THEME } from "../utils/skeleton-theme";
import { getAuthCookie } from "../utils/auth-cookie";
import { isVolunteer, getDisplayName } from "../utils/volunteer";
import NavigationBar from "./NavigationBar";
import { getTimingUpdates, type TimingUpdate, TimingUpdateStatus } from "../data/timing-updates";
import { getTimingReportsByReporterId, type TimingReport, ReportStatus } from "../data/timing-reports";

const PRAYER_NAMES: Record<number, string> = { 0: "Fajr", 1: "Dhuhr", 2: "Asr", 3: "Maghrib", 4: "Isha" };

function relativeTime(dateStr: string | null | undefined): string {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type ActivityItem = {
    icon: React.ElementType;
    color: string;
    title: string;
    detail: string;
    time: string;
    sortKey: number;
};

export default function Home() {
    const authUser = getAuthCookie();
    const displayName = getDisplayName(authUser?.email);
    const joinedDate = authUser?.loggedInAt
        ? new Date(authUser.loggedInAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
        : "Recently";

    const userId = authUser?.userId;

    const [updates, setUpdates] = useState<TimingUpdate[]>([]);
    const [reports, setReports] = useState<TimingReport[]>([]);
    const [updatesThisWeek, setUpdatesThisWeek] = useState(0);
    const [loading, setLoading] = useState(!!userId);

    useEffect(() => {
        if (!userId) return;
        const weekCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        Promise.all([
            getTimingUpdates(),
            getTimingReportsByReporterId(userId),
        ])
            .then(([allUpdates, userReports]) => {
                const userUpdates = allUpdates.filter(u => u.submittedBy === userId);
                setUpdates(userUpdates);
                setReports(userReports);
                setUpdatesThisWeek(userUpdates.filter(u => u.createdDate && new Date(u.createdDate) >= weekCutoff).length);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId]);
    const approvedCount = updates.filter(u => u.status === TimingUpdateStatus.Approved).length;
    const resolvedCount = reports.filter(r => r.status === ReportStatus.Resolved).length;
    const accuracy = updates.length > 0 ? Math.round((approvedCount / updates.length) * 100) : 0;

    const stats = [
        {
            label: "Timings Updated",
            value: loading ? "—" : updates.length,
            trend: loading ? "" : `+${updatesThisWeek} this week`,
            icon: FiEdit3,
            color: "from-teal-500 to-cyan-600",
            bg: "bg-teal-50",
            text: "text-teal-700",
        },
        {
            label: "Reports Submitted",
            value: loading ? "—" : reports.length,
            trend: loading ? "" : `${resolvedCount} resolved`,
            icon: FiAlertTriangle,
            color: "from-rose-500 to-pink-600",
            bg: "bg-rose-50",
            text: "text-rose-700",
        },
        {
            label: "Verified",
            value: loading ? "—" : approvedCount,
            trend: loading ? "" : updates.length > 0 ? `${accuracy}% accuracy` : "None yet",
            icon: FiCheckCircle,
            color: "from-emerald-500 to-green-600",
            bg: "bg-emerald-50",
            text: "text-emerald-700",
        },
    ];

    const updateActivity: ActivityItem[] = updates.map(u => ({
        icon: FiEdit3,
        color: "bg-teal-100 text-teal-600",
        title: `${u.mosqueDetails?.name ?? "Mosque"} — ${PRAYER_NAMES[u.prayer ?? 0] ?? "Prayer"}`,
        detail: u.congregation
            ? `Updated congregation to ${u.congregation}`
            : u.aadhan
            ? `Updated aadhan to ${u.aadhan}`
            : "Timing updated",
        time: relativeTime(u.createdDate),
        sortKey: u.createdDate ? new Date(u.createdDate).getTime() : 0,
    }));

    const reportActivity: ActivityItem[] = reports.map(r => ({
        icon: FiAlertTriangle,
        color: "bg-rose-100 text-rose-600",
        title: `${r.mosqueDetails?.name ?? "Mosque"} — Report`,
        detail: r.details ?? "Timing report submitted",
        time: relativeTime(r.createdDate),
        sortKey: r.createdDate ? new Date(r.createdDate).getTime() : 0,
    }));

    const recentActivity = [...updateActivity, ...reportActivity]
        .sort((a, b) => b.sortKey - a.sortKey)
        .slice(0, 5);

    const suggestions = [
        { icon: FiClock,      title: "Verify Friday Jumu'ah timing",  note: "Multiple users flagged outdated Friday schedules nearby." },
        { icon: FiEdit3,      title: "Confirm Ramadan timetable",     note: "Seasonal times shift significantly — your update would help many." },
        { icon: FiTrendingUp, title: "Review high-traffic mosques",   note: "3 nearby mosques have unverified timings and are frequently visited." },
    ];

    return (
        <SkeletonTheme {...SKELETON_THEME}>
        <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-cyan-50 p-4 pb-24 sm:p-5">
            <div className="mx-auto max-w-2xl space-y-4">

                {/* hero */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 p-5 text-white shadow-[0_20px_45px_-20px_rgba(14,116,144,0.75)] sm:p-6">
                    <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />

                    <div className="relative">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-extrabold leading-tight">
                                    Assalamu Alaikum,<br />
                                    <span className="text-cyan-200">{displayName}</span>
                                </h1>
                                <p className="mt-3 text-sm leading-relaxed text-cyan-100/80">
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

                            {/* avatar */}
                            <div className="shrink-0 flex flex-col items-center gap-1.5">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-2 ring-white/25 text-xl font-extrabold text-white shadow-inner">
                                    {displayName.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-[10px] font-semibold text-cyan-100/70 tracking-wide">
                                    {isVolunteer() ? "Contributor" : "Member"}
                                </span>
                            </div>
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
                                {loading
                                    ? <Skeleton width={36} height={36} borderRadius={12} />
                                    : <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white shadow-sm`}>
                                        <s.icon size={15} />
                                      </span>
                                }
                                {loading ? (
                                    <>
                                        <Skeleton width={32} height={36} borderRadius={6} />
                                        <Skeleton width={56} height={10} borderRadius={4} />
                                        <Skeleton width={64} height={18} borderRadius={999} />
                                    </>
                                ) : (
                                    <>
                                        <p className="mt-1 text-3xl font-extrabold tabular-nums text-slate-800">{s.value}</p>
                                        <p className="text-[10px] font-semibold leading-tight text-slate-500">{s.label}</p>
                                        {s.trend && (
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.bg} ${s.text}`}>
                                                {s.trend}
                                            </span>
                                        )}
                                    </>
                                )}
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
                        {loading ? (
                            <div className="flex flex-col gap-3 px-4 py-4">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Skeleton width={36} height={36} borderRadius={12} />
                                        <div className="flex-1">
                                            <Skeleton width="60%" height={13} borderRadius={4} />
                                            <Skeleton width="40%" height={11} borderRadius={4} style={{ marginTop: 6 }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : recentActivity.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-slate-400">
                                No activity yet — start by updating a mosque's prayer times.
                            </div>
                        ) : (
                            recentActivity.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                                        <item.icon size={15} />
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                                        <p className="mt-0.5 truncate text-xs text-slate-500">{item.detail}</p>
                                    </div>
                                    <span className="shrink-0 text-[11px] text-slate-400">{item.time}</span>
                                </div>
                            ))
                        )}
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
        </SkeletonTheme>
    );
}
