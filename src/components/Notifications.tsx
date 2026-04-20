import { useMemo, useState } from "react";
import {
    FiBell,
    FiCheck,
    FiCheckCircle,
    FiEdit3,
    FiFlag,
    FiInfo,
    FiMapPin,
    FiTrash2,
    FiX,
} from "react-icons/fi";
import NavigationBar from "./NavigationBar";

type NotifType  = "update" | "report" | "verified" | "nearby" | "system";
type NotifGroup = "Today" | "Yesterday" | "Earlier";
type FilterTab  = "all" | "unread";

interface Notification {
    id:    number;
    type:  NotifType;
    group: NotifGroup;
    title: string;
    body:  string;
    time:  string;
    read:  boolean;
}

const TYPE_META: Record<NotifType, {
    icon:       React.ElementType;
    iconBg:     string;
    iconColor:  string;
    accent:     string;
    label:      string;
    labelBg:    string;
    labelText:  string;
}> = {
    update:   { icon: FiEdit3,       iconBg: "bg-teal-100",    iconColor: "text-teal-600",    accent: "bg-teal-400",    label: "Update",   labelBg: "bg-teal-50",    labelText: "text-teal-700"    },
    report:   { icon: FiFlag,        iconBg: "bg-rose-100",    iconColor: "text-rose-600",    accent: "bg-rose-400",    label: "Report",   labelBg: "bg-rose-50",    labelText: "text-rose-700"    },
    verified: { icon: FiCheckCircle, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", accent: "bg-emerald-400", label: "Verified", labelBg: "bg-emerald-50", labelText: "text-emerald-700" },
    nearby:   { icon: FiMapPin,      iconBg: "bg-sky-100",     iconColor: "text-sky-600",     accent: "bg-sky-400",     label: "Nearby",   labelBg: "bg-sky-50",     labelText: "text-sky-700"     },
    system:   { icon: FiInfo,        iconBg: "bg-amber-100",   iconColor: "text-amber-600",   accent: "bg-amber-400",   label: "System",   labelBg: "bg-amber-50",   labelText: "text-amber-700"   },
};

const DUMMY: Notification[] = [
    { id: 1, type: "verified", group: "Today",     title: "Timing Verified",           body: "Your update for Masjid Noor — Fajr congregation has been reviewed and approved by a moderator.",           time: "Just now",    read: false },
    { id: 2, type: "nearby",   group: "Today",     title: "New Mosque Added Nearby",   body: "Al-Iman Islamic Centre has been added 0.4 km from your last known location. Tap to view timings.",         time: "12 min ago",  read: false },
    { id: 3, type: "report",   group: "Today",     title: "Report Resolved",           body: "Your timing mismatch report for Jamia Masjid — Dhuhr has been resolved. The schedule is now up to date.",  time: "1 hour ago",  read: false },
    { id: 4, type: "update",   group: "Today",     title: "Timing Update Needed",      body: "Masjid Al-Rahman has not had its Isha congregation time verified in over 30 days. Can you help?",           time: "3 hours ago", read: true  },
    { id: 5, type: "system",   group: "Yesterday", title: "Ramadan Schedule Reminder", body: "Prayer times shift significantly during Ramadan. Please review and update mosque schedules in your area.",   time: "Yesterday",   read: true  },
    { id: 6, type: "verified", group: "Yesterday", title: "Contribution Milestone",    body: "You've now verified 10 mosques — thank you for your dedication to the community. Keep it up!",               time: "Yesterday",   read: true  },
    { id: 7, type: "nearby",   group: "Earlier",   title: "Unverified Mosque Nearby",  body: "3 mosques within 2 km have unverified timings. Your local knowledge would be invaluable to the community.", time: "3 days ago",  read: true  },
    { id: 8, type: "report",   group: "Earlier",   title: "New Report on Your Mosque", body: "A user has flagged a potential mismatch at Masjid Noor — Asr timing. Please review when possible.",         time: "4 days ago",  read: true  },
];

const GROUPS: NotifGroup[] = ["Today", "Yesterday", "Earlier"];

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>(DUMMY);
    const [activeTab, setActiveTab] = useState<FilterTab>("all");

    const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

    const filtered = useMemo(
        () => activeTab === "unread" ? notifications.filter((n) => !n.read) : notifications,
        [notifications, activeTab]
    );

    function markAllRead() {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }

    function markRead(id: number) {
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    }

    function dismiss(id: number) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }

    function clearRead() {
        setNotifications((prev) => prev.filter((n) => !n.read));
    }

    const hasRead = notifications.some((n) => n.read);

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-cyan-50 p-4 pb-24 sm:p-5">
            <div className="mx-auto max-w-2xl space-y-4">

                {/* ── header ── */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 px-5 py-6 text-white shadow-[0_20px_45px_-20px_rgba(14,116,144,0.75)]">
                    <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />

                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30">
                                    <FiBell size={18} />
                                </span>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">Activity</p>
                                    <h1 className="text-xl font-extrabold leading-tight">Notifications</h1>
                                </div>
                            </div>
                            {unreadCount > 0 && (
                                <span className="flex h-7 min-w-[28px] items-center justify-center rounded-full bg-white px-2 text-xs font-extrabold text-teal-700 shadow-md">
                                    {unreadCount}
                                </span>
                            )}
                        </div>

                        {/* filter tabs */}
                        <div className="mt-4 flex items-center gap-1 rounded-xl bg-white/15 p-1 ring-1 ring-white/20">
                            {(["all", "unread"] as FilterTab[]).map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 rounded-lg py-1.5 text-xs font-bold capitalize transition-all duration-200 ${
                                        activeTab === tab
                                            ? "bg-white text-teal-700 shadow-sm"
                                            : "text-white/75 hover:text-white"
                                    }`}
                                >
                                    {tab === "unread"
                                        ? `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`
                                        : "All"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── actions bar ── */}
                {(unreadCount > 0 || hasRead) && (
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-slate-400">
                            {filtered.length} {activeTab === "unread" ? "unread" : "notification" + (filtered.length !== 1 ? "s" : "")}
                        </p>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={markAllRead}
                                    className="flex items-center gap-1.5 rounded-xl border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50"
                                >
                                    <FiCheck size={12} />
                                    Mark all read
                                </button>
                            )}
                            {hasRead && (
                                <button
                                    type="button"
                                    onClick={clearRead}
                                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm transition hover:bg-slate-50"
                                >
                                    <FiX size={12} />
                                    Clear read
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ── grouped list ── */}
                {filtered.length > 0 ? (
                    <div className="space-y-5">
                        {GROUPS.map((group) => {
                            const items = filtered.filter((n) => n.group === group);
                            if (items.length === 0) return null;
                            return (
                                <div key={group} className="space-y-2">
                                    <p className="px-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                        {group}
                                    </p>
                                    {items.map((n) => (
                                        <NotifCard key={n.id} n={n} onRead={markRead} onDismiss={dismiss} />
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ── empty state ── */
                    <div className="flex flex-col items-center gap-3 rounded-3xl border border-slate-200 bg-white py-14 text-center shadow-sm">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-400">
                            <FiBell size={24} />
                        </span>
                        <p className="text-sm font-semibold text-slate-700">
                            {activeTab === "unread" ? "No unread notifications" : "All caught up"}
                        </p>
                        <p className="max-w-[220px] text-xs leading-relaxed text-slate-400">
                            {activeTab === "unread"
                                ? "You've read everything. Switch to All to see past activity."
                                : "You'll be notified about timing updates and reports here."}
                        </p>
                        {activeTab === "unread" && (
                            <button
                                type="button"
                                onClick={() => setActiveTab("all")}
                                className="mt-1 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-100"
                            >
                                View all
                            </button>
                        )}
                    </div>
                )}
            </div>

            <NavigationBar />
        </div>
    );
}

function NotifCard({ n, onRead, onDismiss }: {
    n:         Notification;
    onRead:    (id: number) => void;
    onDismiss: (id: number) => void;
}) {
    const meta = TYPE_META[n.type];

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onRead(n.id)}
            onKeyDown={(e) => e.key === "Enter" && onRead(n.id)}
            className={`relative flex cursor-pointer gap-3 overflow-hidden rounded-2xl border bg-white px-4 py-3.5 shadow-sm transition-all duration-200 ${
                n.read
                    ? "border-slate-100 opacity-60 hover:opacity-80 hover:shadow-md"
                    : "border-slate-200 hover:-translate-y-0.5 hover:shadow-md"
            }`}
        >
            {/* left accent bar */}
            <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${meta.accent}`} />

            {/* icon */}
            <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.iconBg} ${meta.iconColor}`}>
                <meta.icon size={16} />
            </span>

            {/* content */}
            <div className="flex-1 min-w-0 pl-1 pr-5">
                <div className="flex items-center gap-2">
                    <p className={`truncate text-sm leading-snug text-slate-800 ${n.read ? "font-semibold" : "font-bold"}`}>
                        {n.title}
                    </p>
                    {/* pulsing unread dot — opacity toggle avoids reflow */}
                    <span className={`relative flex h-2 w-2 shrink-0 transition-opacity duration-200 ${n.read ? "opacity-0" : "opacity-100"}`}>
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
                    </span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500 line-clamp-2">{n.body}</p>
                <div className="mt-1.5 flex items-center gap-2">
                    <p className="text-[10px] font-semibold text-slate-400">{n.time}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.labelBg} ${meta.labelText}`}>
                        {meta.label}
                    </span>
                </div>
            </div>

            {/* dismiss */}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDismiss(n.id); }}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
                aria-label="Dismiss"
            >
                <FiTrash2 size={12} />
            </button>
        </div>
    );
}
