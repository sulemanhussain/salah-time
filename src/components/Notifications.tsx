import { useState } from "react";
import {
    FiBell,
    FiCheck,
    FiCheckCircle,
    FiEdit3,
    FiFlag,
    FiInfo,
    FiMapPin,
    FiTrash2,
} from "react-icons/fi";
import NavigationBar from "./NavigationBar";

type NotifType = "update" | "report" | "verified" | "nearby" | "system";

interface Notification {
    id: number;
    type: NotifType;
    title: string;
    body: string;
    time: string;
    read: boolean;
}

const TYPE_META: Record<NotifType, { icon: React.ElementType; iconBg: string; iconColor: string; accent: string }> = {
    update:  { icon: FiEdit3,        iconBg: "bg-teal-100",   iconColor: "text-teal-600",   accent: "border-l-teal-400"   },
    report:  { icon: FiFlag,         iconBg: "bg-rose-100",   iconColor: "text-rose-600",   accent: "border-l-rose-400"   },
    verified:{ icon: FiCheckCircle,  iconBg: "bg-emerald-100",iconColor: "text-emerald-600",accent: "border-l-emerald-400" },
    nearby:  { icon: FiMapPin,       iconBg: "bg-sky-100",    iconColor: "text-sky-600",    accent: "border-l-sky-400"    },
    system:  { icon: FiInfo,         iconBg: "bg-amber-100",  iconColor: "text-amber-600",  accent: "border-l-amber-400"  },
};

const DUMMY: Notification[] = [
    { id: 1,  type: "verified", title: "Timing Verified",          body: "Your update for Masjid Noor — Fajr congregation has been reviewed and approved by a moderator.",          time: "Just now",    read: false },
    { id: 2,  type: "nearby",   title: "New Mosque Added Nearby",  body: "Al-Iman Islamic Centre has been added 0.4 km from your last known location. Tap to view timings.",        time: "12 min ago",  read: false },
    { id: 3,  type: "report",   title: "Report Resolved",          body: "Your timing mismatch report for Jamia Masjid — Dhuhr has been resolved. The schedule is now up to date.", time: "1 hour ago",  read: false },
    { id: 4,  type: "update",   title: "Timing Update Needed",     body: "Masjid Al-Rahman has not had its Isha congregation time verified in over 30 days. Can you help?",          time: "3 hours ago", read: true  },
    { id: 5,  type: "system",   title: "Ramadan Schedule Reminder",body: "Prayer times shift significantly during Ramadan. Please review and update mosque schedules in your area.",  time: "Yesterday",   read: true  },
    { id: 6,  type: "verified", title: "Contribution Milestone",   body: "You have now verified 10 mosques — thank you for your dedication to the community. Keep it up!",            time: "2 days ago",  read: true  },
    { id: 7,  type: "nearby",   title: "Unverified Mosque Nearby", body: "3 mosques within 2 km have unverified timings. Your local knowledge would be invaluable to the community.", time: "3 days ago",  read: true  },
    { id: 8,  type: "report",   title: "New Report on Your Mosque",body: "A user has flagged a potential mismatch at Masjid Noor — Asr timing. Please review when possible.",        time: "4 days ago",  read: true  },
];

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>(DUMMY);

    const unreadCount = notifications.filter((n) => !n.read).length;

    function markAllRead() {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }

    function markRead(id: number) {
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    }

    function dismiss(id: number) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }

    const unread = notifications.filter((n) => !n.read);
    const read   = notifications.filter((n) =>  n.read);

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-cyan-50 p-4 pb-24 sm:p-5">
            <div className="mx-auto max-w-2xl space-y-4">

                {/* header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 px-5 py-6 text-white shadow-[0_20px_45px_-20px_rgba(14,116,144,0.75)]">
                    <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
                    <div className="relative flex items-center justify-between">
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
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-extrabold text-teal-700 shadow-md">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                </div>

                {/* mark all read */}
                {unreadCount > 0 && (
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-500">{unreadCount} unread</p>
                        <button
                            type="button"
                            onClick={markAllRead}
                            className="flex items-center gap-1.5 rounded-xl border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50"
                        >
                            <FiCheck size={12} />
                            Mark all as read
                        </button>
                    </div>
                )}

                {/* unread group */}
                {unread.length > 0 && (
                    <div className="space-y-2">
                        <p className="px-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">New</p>
                        {unread.map((n) => (
                            <NotifCard key={n.id} n={n} onRead={markRead} onDismiss={dismiss} />
                        ))}
                    </div>
                )}

                {/* read group */}
                {read.length > 0 && (
                    <div className="space-y-2">
                        <p className="px-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">Earlier</p>
                        {read.map((n) => (
                            <NotifCard key={n.id} n={n} onRead={markRead} onDismiss={dismiss} />
                        ))}
                    </div>
                )}

                {notifications.length === 0 && (
                    <div className="flex flex-col items-center gap-3 rounded-3xl border border-slate-200 bg-white py-14 text-center shadow-sm">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                            <FiBell size={24} />
                        </span>
                        <p className="text-sm font-semibold text-slate-600">All caught up</p>
                        <p className="text-xs text-slate-400">No notifications at the moment.</p>
                    </div>
                )}
            </div>

            <NavigationBar />
        </div>
    );
}

function NotifCard({ n, onRead, onDismiss }: { n: Notification; onRead: (id: number) => void; onDismiss: (id: number) => void }) {
    const meta = TYPE_META[n.type];

    return (
        <div
            className={`relative flex gap-3 overflow-hidden rounded-2xl border bg-white px-4 py-3.5 shadow-sm transition hover:shadow-md border-l-4 ${meta.accent} ${n.read ? "border-slate-100 opacity-70" : "border-slate-200"}`}
            onClick={() => onRead(n.id)}
        >
            <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.iconBg} ${meta.iconColor}`}>
                <meta.icon size={16} />
            </span>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-bold leading-snug text-slate-800 ${!n.read ? "" : "font-semibold"}`}>
                        {n.title}
                    </p>
                    {!n.read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-500" />
                    )}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{n.body}</p>
                <p className="mt-1.5 text-[10px] font-semibold text-slate-400">{n.time}</p>
            </div>
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
