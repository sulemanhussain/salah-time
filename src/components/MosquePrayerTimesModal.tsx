import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiAlertCircle, FiMapPin, FiUsers } from "react-icons/fi";
import { FaMosque, FaSun, FaMoon } from "react-icons/fa";
import { getPrayerTimings, formatPrayerTime } from "../data/adaan-timings";
import type { PrayerTime, HijriDate } from "../data/adaan-timings";
import { getTimingUpdatesByMosqueId, Prayer } from "../data/timing-updates";
import type { TimingUpdate } from "../data/timing-updates";

const PRAYERS = [
    { key: "Fajr",    label: "Fajr",    arabic: "الفجر",  period: "Pre-dawn",  color: "from-indigo-500 to-violet-500",  light: "bg-indigo-50",  border: "border-indigo-200",  text: "text-indigo-600",  celestial: "sunrise" as const },
    { key: "Dhuhr",   label: "Dhuhr",   arabic: "الظهر",  period: "Midday",    color: "from-amber-400 to-yellow-500",   light: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-600",   celestial: "sun"     as const },
    { key: "Asr",     label: "Asr",     arabic: "العصر",  period: "Afternoon", color: "from-orange-400 to-red-400",     light: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-600",  celestial: "sun"     as const },
    { key: "Maghrib", label: "Maghrib", arabic: "المغرب", period: "Sunset",    color: "from-rose-500 to-pink-500",      light: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-600",    celestial: "sunset"  as const },
    { key: "Isha",    label: "Isha",    arabic: "العشاء",  period: "Night",     color: "from-slate-500 to-slate-700",    light: "bg-slate-100",  border: "border-slate-200",   text: "text-slate-600",   celestial: "moon"    as const },
] as const;

type PrayerKey = typeof PRAYERS[number]["key"];

const PRAYER_KEY_TO_ENUM: Record<PrayerKey, Prayer> = {
    Fajr: Prayer.Fajr, Dhuhr: Prayer.Dhuhr, Asr: Prayer.Asr,
    Maghrib: Prayer.Maghrib, Isha: Prayer.Isha,
};

type MosquePrayerState = {
    mosqueName: string;
    vicinity?: string | null;
    mosqueDbId?: string | null;
    lat: number;
    lng: number;
};

function toMins(time: string) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}

function nowMins() {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
}

function getCountdown(time: string): string {
    const now = new Date();
    const [h, m] = time.split(":").map(Number);
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
    const diff = Math.max(0, target.getTime() - now.getTime());
    const secs = Math.floor(diff / 1000);
    const hh = Math.floor(secs / 3600);
    const mm = Math.floor((secs % 3600) / 60);
    const ss = secs % 60;
    if (hh > 0) return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
    return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export default function MosquePrayerTimesModal() {
    const location = useLocation();
    const navigate = useNavigate();
    const mosque = (location.state as MosquePrayerState | null) ?? null;

    const mosqueName = mosque?.mosqueName ?? "";
    const vicinity   = mosque?.vicinity ?? null;
    const mosqueDbId = mosque?.mosqueDbId ?? null;
    const lat        = mosque?.lat ?? 0;
    const lng        = mosque?.lng ?? 0;

    const [aladhanTimings, setAladhanTimings] = useState<PrayerTime | null>(null);
    const [dbUpdates, setDbUpdates] = useState<TimingUpdate[]>([]);
    const [hijri, setHijri] = useState<HijriDate | null>(null);
    const [dateLabel, setDateLabel] = useState("");
    const [hasDbData, setHasDbData] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [, setTick] = useState(0);

    const fetchTimings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [aladhanResult, dbResult] = await Promise.allSettled([
                getPrayerTimings([{ latitude: lat, longitude: lng }]),
                mosqueDbId
                    ? getTimingUpdatesByMosqueId(mosqueDbId)
                    : Promise.resolve<TimingUpdate[]>([]),
            ]);

            if (aladhanResult.status === "fulfilled") {
                setAladhanTimings(aladhanResult.value.timings);
                setHijri(aladhanResult.value.hijriDate);
                setDateLabel(aladhanResult.value.date);
            }

            const dbRows = dbResult.status === "fulfilled"
                ? dbResult.value.filter(u => u.aadhan != null)
                : [];
            setDbUpdates(dbRows);
            setHasDbData(dbRows.length > 0);

            if (aladhanResult.status === "rejected" && dbRows.length === 0) {
                throw new Error("Unable to fetch prayer times. Please try again.");
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unable to fetch prayer times. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [lat, lng, mosqueDbId]);

    useEffect(() => { fetchTimings(); }, [fetchTimings]);

    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") navigate(-1); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [navigate]);

    const dbMap = new Map(
        dbUpdates
            .filter(u => u.prayer != null)
            .map(u => [u.prayer as Prayer, u])
    );

    function getAdhan(key: PrayerKey): string | null {
        const db = dbMap.get(PRAYER_KEY_TO_ENUM[key]);
        if (db?.aadhan) return db.aadhan.slice(0, 5);
        return aladhanTimings ? aladhanTimings[key as keyof PrayerTime] : null;
    }

    const nextIdx = (() => {
        const now = nowMins();
        const idx = PRAYERS.findIndex(p => {
            const t = getAdhan(p.key);
            return t ? toMins(t) > now : false;
        });
        return idx === -1 ? 0 : idx;
    })();

    const nextPrayer = PRAYERS[nextIdx];
    const nextAdhan = getAdhan(nextPrayer.key);
    const hasTimings = aladhanTimings || hasDbData;

    const currentIdx = PRAYERS.findIndex(p => {
        const adhan = getAdhan(p.key);
        const db = dbMap.get(PRAYER_KEY_TO_ENUM[p.key]);
        const cong = db?.congregation ? db.congregation.slice(0, 5) : null;
        return adhan && toMins(adhan) <= nowMins() && cong !== null && toMins(cong) > nowMins();
    });
    const currentPrayer = currentIdx !== -1 ? PRAYERS[currentIdx] : null;
    const currentCongregation = currentPrayer
        ? (dbMap.get(PRAYER_KEY_TO_ENUM[currentPrayer.key])?.congregation?.slice(0, 5) ?? null)
        : null;

    function CelestialBg({ celestial }: { celestial: "sunrise" | "sun" | "sunset" | "moon" }) {
        if (celestial === "moon") return (
            <FaMoon size={110} className="pointer-events-none absolute -right-4 -top-4 text-white opacity-[0.13] rotate-[-20deg]" />
        );
        if (celestial === "sunrise") return (
            <FaSun size={110} className="pointer-events-none absolute -right-4 bottom-[-20px] text-white opacity-[0.12] rotate-[-15deg]" />
        );
        if (celestial === "sunset") return (
            <FaSun size={110} className="pointer-events-none absolute -right-4 bottom-[-24px] text-white opacity-[0.12] rotate-[10deg]" />
        );
        return (
            <FaSun size={110} className="pointer-events-none absolute -right-4 -top-5 text-white opacity-[0.12] rotate-12" />
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col animate-[fadeSlideUp_0.25s_ease-out]">

            {/* ── HEADER ─────────────────────────────────────────── */}
            <div className="relative overflow-hidden bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 px-5 py-7 shrink-0 shadow-[0_8px_32px_-8px_rgba(14,116,144,0.6)]">
                <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
                <FaMosque size={120} className="pointer-events-none absolute -right-3 -bottom-1 text-white/[0.07]" />

                <div className="relative">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 text-white transition hover:bg-white/25 active:scale-90"
                            aria-label="Back"
                        >
                            <FiArrowLeft size={18} />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-xl font-black leading-tight text-white truncate">{mosqueName}</h1>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                        {hijri && (
                            <span className="rounded-full bg-white/20 px-3 py-1 font-semibold text-white ring-1 ring-white/25">
                                {hijri.day} {hijri.month.en} {hijri.year} AH
                            </span>
                        )}
                        {dateLabel && (
                            <span className="rounded-full bg-white/15 px-3 py-1 text-white/80 ring-1 ring-white/20">{dateLabel}</span>
                        )}
                        {hasDbData && (
                            <span className="rounded-full bg-emerald-400/25 px-3 py-1 font-semibold text-emerald-100 ring-1 ring-emerald-300/30">
                                ✓ Mosque timings
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── BODY ───────────────────────────────────────────── */}
            <div className="flex-1 p-4 sm:p-5 pb-8">
                <div className="mx-auto max-w-2xl space-y-4">

                    {loading && (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white py-16 shadow-sm">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-teal-500" />
                            <p className="text-sm font-medium text-slate-400">Fetching prayer times…</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="flex flex-col items-center gap-3 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-center shadow-sm">
                            <FiAlertCircle size={32} className="text-rose-400" />
                            <p className="text-sm font-semibold text-rose-700">{error}</p>
                            <button type="button" onClick={fetchTimings} className="mt-1 rounded-xl bg-rose-500 px-5 py-2 text-xs font-bold text-white transition hover:bg-rose-600">
                                Try Again
                            </button>
                        </div>
                    )}

                    {!loading && !error && hasTimings && nextAdhan && (
                        <>
                            {vicinity && (
                                <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm">
                                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-500">
                                        <FiMapPin size={13} />
                                    </span>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Address</p>
                                        <p className="mt-0.5 text-sm font-medium leading-snug text-slate-700">{vicinity}</p>
                                    </div>
                                </div>
                            )}

                            {/* ── HERO ──────────────────────────────────── */}
                            {currentPrayer && currentCongregation ? (
                                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${currentPrayer.color} p-4 shadow-lg`}>
                                    <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/15 blur-3xl" />
                                    <div className="pointer-events-none absolute -left-3 -bottom-4 h-20 w-20 rounded-full bg-black/10 blur-2xl" />
                                    <CelestialBg celestial={currentPrayer.celestial} />
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Jamaat Starting</p>
                                    <div className="mt-1.5 flex items-end justify-between gap-3">
                                        <div>
                                            <p className="text-3xl font-black leading-none text-white">{currentPrayer.label}</p>
                                            <p className="mt-1 text-sm font-semibold text-white/60">{currentPrayer.arabic} · {currentPrayer.period}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black tabular-nums leading-none text-white">{getCountdown(currentCongregation)}</p>
                                            <p className="mt-1 text-xs font-semibold text-white/60">at {formatPrayerTime(currentCongregation)}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${nextPrayer.color} p-4 shadow-lg`}>
                                    <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/15 blur-3xl" />
                                    <div className="pointer-events-none absolute -left-3 -bottom-4 h-20 w-20 rounded-full bg-black/10 blur-2xl" />
                                    <CelestialBg celestial={nextPrayer.celestial} />
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Next Prayer</p>
                                    <div className="mt-1.5 flex items-end justify-between gap-3">
                                        <div>
                                            <p className="text-3xl font-black leading-none text-white">{nextPrayer.label}</p>
                                            <p className="mt-1 text-sm font-semibold text-white/60">{nextPrayer.arabic} · {nextPrayer.period}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black tabular-nums leading-none text-white">{getCountdown(nextAdhan!)}</p>
                                            <p className="mt-1 text-xs font-semibold text-white/60">at {formatPrayerTime(nextAdhan!)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── PRAYER LIST ───────────────────────────── */}
                            <div className="space-y-2.5">
                                {PRAYERS.map((prayer, i) => {
                                    const adhan = getAdhan(prayer.key);
                                    if (!adhan) return null;
                                    const db = dbMap.get(PRAYER_KEY_TO_ENUM[prayer.key]);
                                    const congregation = db?.congregation ? db.congregation.slice(0, 5) : null;
                                    const fromDb = !!db?.aadhan;
                                    const isPast = toMins(adhan) < nowMins();
                                    const isNext = i === nextIdx && !currentPrayer;
                                    const isCurrent = isPast && congregation !== null && toMins(congregation) >= nowMins();
                                    const isDone = isPast && !isCurrent;

                                    if (isNext) return (
                                        <div key={prayer.key} className={`overflow-hidden rounded-xl bg-gradient-to-r ${prayer.color} shadow-md`}>
                                            <div className="flex items-center gap-3 px-4 py-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-2 ring-white/30">
                                                    <span className="text-xs font-black text-white">{prayer.label.slice(0, 2)}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-white leading-tight">{prayer.label}</p>
                                                    <p className="text-xs font-semibold text-white/60">{prayer.arabic} · {prayer.period}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xl font-black tabular-nums text-white leading-none">{formatPrayerTime(adhan)}</p>
                                                    <span className="mt-0.5 inline-block rounded-full bg-white/25 px-2 py-0.5 text-[9px] font-black text-white">NEXT</span>
                                                </div>
                                            </div>
                                            {congregation && (
                                                <div className="mx-2.5 mb-2.5 flex items-center justify-between rounded-lg bg-black/15 px-3 py-2">
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white/70"><FiUsers size={11} />Jamaat</span>
                                                    <span className="text-sm font-black tabular-nums text-white">{formatPrayerTime(congregation)}</span>
                                                    <span className="text-[9px] font-semibold text-white/50">{fromDb ? "Verified" : ""}</span>
                                                </div>
                                            )}
                                        </div>
                                    );

                                    if (isCurrent) return (
                                        <div key={prayer.key} className="overflow-hidden rounded-xl bg-white shadow-sm ring-2 ring-emerald-400/50">
                                            <div className="flex items-center gap-3 px-4 py-3">
                                                <div className={`h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br ${prayer.color} flex items-center justify-center shadow-sm`}>
                                                    <span className="text-xs font-black text-white">{prayer.label.slice(0, 2)}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-slate-800 leading-tight">{prayer.label}</p>
                                                    <p className="text-xs font-medium text-slate-400">{prayer.arabic} · {prayer.period}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xl font-black tabular-nums text-slate-800 leading-none">{formatPrayerTime(adhan)}</p>
                                                    <span className="mt-0.5 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-700 ring-1 ring-emerald-200">NOW</span>
                                                </div>
                                            </div>
                                            <div className="mx-2.5 mb-2.5 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 ring-1 ring-emerald-200">
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700"><FiUsers size={11} />Jamaat</span>
                                                <span className="text-sm font-black tabular-nums text-emerald-800">{formatPrayerTime(congregation!)}</span>
                                                <span className="text-[9px] font-semibold text-emerald-500">In progress</span>
                                            </div>
                                        </div>
                                    );

                                    return (
                                        <div key={prayer.key} className={`overflow-hidden rounded-xl shadow-sm ${isDone ? "bg-white/70" : "bg-white"}`}>
                                            <div className="flex items-center gap-3 px-4 py-3">
                                                <div className={`h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br ${prayer.color} flex items-center justify-center shadow-sm ${isDone ? "opacity-25" : ""}`}>
                                                    <span className="text-xs font-black text-white">{prayer.label.slice(0, 2)}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-black leading-tight ${isDone ? "text-slate-300" : "text-slate-800"}`}>{prayer.label}</p>
                                                    <p className={`text-xs font-medium ${isDone ? "text-slate-300" : "text-slate-400"}`}>{prayer.arabic} · {prayer.period}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className={`text-xl font-black tabular-nums leading-none ${isDone ? "text-slate-300" : "text-slate-700"}`}>{formatPrayerTime(adhan)}</p>
                                                    <div className="mt-0.5 flex items-center justify-end gap-1">
                                                        {fromDb && !isDone && <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 ring-1 ring-emerald-100">Mosque</span>}
                                                        {isDone && <span className="text-[9px] font-semibold text-slate-300">Done</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            {congregation && !isDone && (
                                                <div className="mx-2.5 mb-2.5 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 ring-1 ring-emerald-100">
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700"><FiUsers size={11} />Jamaat</span>
                                                    <span className="text-sm font-black tabular-nums text-emerald-800">{formatPrayerTime(congregation)}</span>
                                                    <span className="text-[9px] font-semibold text-emerald-400">Verified</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ── SUNRISE / SUNSET ──────────────────────── */}
                            {aladhanTimings && (
                                <div className="grid grid-cols-2 gap-3">
                                    {([
                                        { label: "Sunrise", key: "Sunrise", bg: "from-orange-50 to-amber-50/60", border: "border-orange-100", iconColor: "text-orange-200" },
                                        { label: "Sunset",  key: "Sunset",  bg: "from-rose-50 to-red-50/60",     border: "border-rose-100",   iconColor: "text-rose-200"   },
                                    ] as const).map(({ label, key, bg, border, iconColor }) => (
                                        <div key={key} className={`relative overflow-hidden rounded-xl border ${border} bg-gradient-to-br ${bg} px-4 py-3.5 shadow-sm`}>
                                            <FaSun size={52} className={`pointer-events-none absolute -right-3 -bottom-3 ${iconColor}`} />
                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
                                            <p className="text-base font-bold tabular-nums text-slate-800">{formatPrayerTime(aladhanTimings[key as keyof PrayerTime])}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

        </div>
    );
}
