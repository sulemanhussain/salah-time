import { Link } from "react-router-dom";
import { getAuthCookie } from "../utils/auth-cookie";
import NavigationBar from "./NavigationBar";

export default function Home() {
    const authUser = getAuthCookie();
    const displayName = authUser?.email?.split("@")[0] || "User";
    const joinedDate = authUser?.loggedInAt
        ? new Date(authUser.loggedInAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
        : "Recently";

    const contributionStats = [
        { label: "Timings Updated", value: 12, trend: "+3 this week", color: "from-sky-500 to-blue-600" },
        { label: "Reports Submitted", value: 4, trend: "1 resolved", color: "from-rose-500 to-orange-500" },
        { label: "Mosques Verified", value: 9, trend: "90% accuracy", color: "from-emerald-500 to-green-600" },
    ];

    const recentContributions = [
        { title: "Masjid Noor - Fajr Timing", detail: "Updated congregation to 05:45 AM", time: "2 hours ago" },
        { title: "Jamia Masjid - Dhuhr", detail: "Reported mismatch with noticeboard", time: "Yesterday" },
        { title: "Al Rahma Center - Isha", detail: "Verified Aadhan and Jama'ah", time: "3 days ago" },
    ];

    const suggestions = [
        { title: "Verify Friday Jumu'ah timing", note: "Many users requested updated Friday schedule." },
        { title: "Add women prayer hall info", note: "Helpful for family visits and accessibility." },
        { title: "Confirm Ramadan timetable", note: "Seasonal timings can change quickly." },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/40 to-white p-5 pb-28 sm:p-6">
            <section className="relative overflow-hidden rounded-2xl border border-sky-100 bg-white p-6 shadow-[0_20px_40px_-28px_rgba(2,132,199,0.55)]">
                <div className="pointer-events-none absolute -top-12 -right-10 h-28 w-28 rounded-full bg-sky-200/60 blur-2xl"></div>
                <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-cyan-100/60 blur-2xl"></div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sky-700">Community Dashboard</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-800">Hi, {displayName}!</h1>
                <p className="mt-2 text-sm text-slate-600">
                    Thanks for helping keep local mosque prayer data accurate.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">Member since: {joinedDate}</span>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Contributor</span>
                </div>
                <Link
                    to="/app"
                    className="mt-5 inline-flex items-center rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:from-sky-700 hover:to-blue-700"
                >
                    Go to Map
                </Link>
            </section>

            <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {contributionStats.map((item) => (
                    <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className={`inline-flex rounded-lg bg-gradient-to-r px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white ${item.color}`}>
                            {item.label}
                        </div>
                        <p className="mt-3 text-3xl font-bold text-slate-800">{item.value}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.trend}</p>
                    </div>
                ))}
            </section>

            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800">Your Recent Contributions</h2>
                    <span className="text-xs font-semibold text-sky-700">Dummy Activity</span>
                </div>
                <div className="space-y-3">
                    {recentContributions.map((item) => (
                        <div key={item.title} className="rounded-xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-3">
                            <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                            <p className="mt-1 text-xs text-slate-600">{item.detail}</p>
                            <p className="mt-2 text-[11px] font-medium text-slate-400">{item.time}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800">Suggestions For You</h2>
                <p className="mt-1 text-xs text-slate-500">Based on nearby mosque data and pending community requests.</p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {suggestions.map((item) => (
                        <div key={item.title} className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                            <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                            <p className="mt-1 text-xs text-slate-600">{item.note}</p>
                        </div>
                    ))}
                </div>
            </section>

            <NavigationBar />
        </div>

    )
}
