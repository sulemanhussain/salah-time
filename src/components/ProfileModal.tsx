import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { SKELETON_THEME, SKELETON_THEME_DARK } from "../utils/skeleton-theme";
import "react-loading-skeleton/dist/skeleton.css";
import { updateUserProfile, getUserById } from "../data/users";
import type { UserProfile } from "../data/users";
import {
    FiArrowLeft,
    FiCamera,
    FiCheckCircle,
    FiMapPin,
    FiPhone,
    FiSave,
    FiUser,
} from "react-icons/fi";
import { getAuthCookie } from "../utils/auth-cookie";
import { setDisplayName } from "../utils/volunteer";

const PROFILE_KEY = "salah_time_profile";

type Gender = "male" | "female" | "prefer_not_to_say" | "";

interface Profile {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    gender: Gender;
    bio: string;
}

const GENDER_OPTIONS = [
    { value: "male"   as const, label: "Male",   emoji: "🧔🏽", activeText: "text-sky-700"  },
    { value: "female" as const, label: "Female", emoji: "🧕🏽", activeText: "text-pink-700" },
];

function genderEnumToLocal(gender: number | null | undefined): Gender {
    if (gender === 0) return "male";
    if (gender === 1) return "female";
    if (gender === 2) return "prefer_not_to_say";
    return "";
}

function genderLocalToEnum(gender: Gender): 0 | 1 | 2 | undefined {
    if (gender === "male") return 0;
    if (gender === "female") return 1;
    if (gender === "prefer_not_to_say") return 2;
    return undefined;
}

function loadProfile(email: string, userProfile?: UserProfile | null): Profile {
    if (userProfile) {
        return {
            fullName: userProfile.fullName ?? "",
            email,
            phone: userProfile.phone ?? "",
            city: userProfile.city ?? "",
            gender: genderEnumToLocal(userProfile.gender),
            bio: userProfile.bio ?? "",
        };
    }
    try {
        const stored = localStorage.getItem(PROFILE_KEY);
        if (stored) return { gender: "", ...JSON.parse(stored) };
    } catch { /* ignore */ }
    return { fullName: "", email, phone: "", city: "", gender: "", bio: "" };
}

function saveProfile(profile: Profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

const FIELD_CLASS =
    "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100";

export default function ProfilePage() {
    const navigate = useNavigate();
    const authUser = getAuthCookie();
    const authEmail = authUser?.email ?? "";
    const initials = (authEmail.split("@")[0] ?? "U").slice(0, 2).toUpperCase();

    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [form, setForm] = useState<Profile>(() => loadProfile(authEmail));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState(false);

    useEffect(() => {
        const userId = authUser?.userId;
        if (!userId) { setIsLoading(false); return; }
        getUserById(userId).then(profile => {
            setUserProfile(profile);
            setForm(loadProfile(authEmail, profile));
        }).catch(() => {}).finally(() => setIsLoading(false));
    }, [authUser?.userId, authEmail]);

    function handleChange(field: keyof Profile, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e: { preventDefault(): void }) {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await Promise.all([
                updateUserProfile({
                    userId: authUser?.userId,
                    fullName: form.fullName || null,
                    phone: form.phone || null,
                    city: form.city || null,
                    gender: genderLocalToEnum(form.gender) ?? null,
                    bio: form.bio || null,
                }),
                new Promise((r) => setTimeout(r, 1000)),
            ]);
            saveProfile(form);
            if (form.fullName) setDisplayName(form.fullName);
            setUserProfile(prev => prev ? { ...prev, fullName: form.fullName } : prev);
            setSuccessMsg(true);
            setTimeout(() => setSuccessMsg(false), 3500);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-cyan-50 flex flex-col">
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto">

                    {/* header */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 px-5 pb-7 pt-5 sm:px-6">
                        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                        <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-teal-600/20 blur-2xl" />

                        <div className="relative flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                aria-label="Back"
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/20 transition hover:bg-white/25 active:scale-90"
                            >
                                <FiArrowLeft size={18} />
                            </button>
                            <p className="text-sm font-semibold text-white/80">Your Profile</p>
                            <div className="h-9 w-9" />
                        </div>

                        <div className="relative mt-5 flex flex-col items-center gap-2">
                            {isLoading ? (
                                <SkeletonTheme baseColor={SKELETON_THEME_DARK.baseColor} highlightColor={SKELETON_THEME_DARK.highlightColor}>
                                    <Skeleton width={80} height={80} borderRadius={999} />
                                    <div className="flex flex-col items-center gap-1.5 mt-1">
                                        <Skeleton width={120} height={16} borderRadius={6} />
                                        <Skeleton width={160} height={12} borderRadius={6} />
                                    </div>
                                </SkeletonTheme>
                            ) : (
                                <>
                                    <div className="relative">
                                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-2xl font-extrabold text-white ring-2 ring-white/30 shadow-[0_0_0_5px_rgba(255,255,255,0.1)]">
                                            {initials}
                                        </div>
                                        <button
                                            type="button"
                                            className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-teal-600 shadow-md transition hover:bg-teal-50"
                                            aria-label="Change photo"
                                        >
                                            <FiCamera size={13} />
                                        </button>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-base font-bold text-white">
                                            {form.fullName || userProfile?.fullName || authEmail.split("@")[0]}
                                        </p>
                                        <p className="text-xs text-cyan-200">{authEmail}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {isLoading && (
                        <SkeletonTheme {...SKELETON_THEME}>
                            <div className="p-4 sm:p-6 space-y-4">
                                {/* gender toggle */}
                                {[0, 1, 2, 3, 4].map(i => (
                                    <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                        <div className="flex items-center gap-2.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-teal-50/50 px-4 py-2.5">
                                            <Skeleton width={20} height={20} borderRadius={999} />
                                            <Skeleton width={80} height={12} borderRadius={4} />
                                        </div>
                                        <div className="p-3">
                                            <Skeleton height={44} borderRadius={12} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SkeletonTheme>
                    )}

                    <div className={`p-4 sm:p-6 ${isLoading ? "hidden" : ""}`}>
                        <div className="mx-auto max-w-3xl space-y-4">

                            <Field label="Full Name" icon={FiUser}>
                                <input
                                    type="text"
                                    value={form.fullName}
                                    onChange={(e) => handleChange("fullName", e.target.value)}
                                    placeholder="e.g. Abdullah Hassan"
                                    className={FIELD_CLASS}
                                />
                            </Field>

                            <Field label="Gender" icon={FiUser}>
                                <div className="flex rounded-2xl bg-slate-100 p-1 gap-1">
                                    {GENDER_OPTIONS.map((opt) => {
                                        const active = form.gender === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => handleChange("gender", active ? "" : opt.value)}
                                                className={`flex flex-1 items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${
                                                    active
                                                        ? "bg-white shadow-sm text-slate-800"
                                                        : "text-slate-400 hover:text-slate-600"
                                                }`}
                                            >
                                                <span className="text-xl leading-none">{opt.emoji}</span>
                                                <span>{opt.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </Field>

                            <Field label="Phone Number" icon={FiPhone}>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    placeholder="e.g. +44 7700 900000"
                                    className={FIELD_CLASS}
                                />
                            </Field>

                            <Field label="City / Area" icon={FiMapPin}>
                                <input
                                    type="text"
                                    value={form.city}
                                    onChange={(e) => handleChange("city", e.target.value)}
                                    placeholder="e.g. Birmingham, UK"
                                    className={FIELD_CLASS}
                                />
                            </Field>

                            <Field label="About / Bio" icon={FiUser}>
                                <textarea
                                    value={form.bio}
                                    onChange={(e) => handleChange("bio", e.target.value)}
                                    placeholder="Tell the community a little about yourself…"
                                    rows={4}
                                    maxLength={300}
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
                                />
                                <p className="mt-1 text-right text-[11px] text-slate-400">{form.bio.length} / 300</p>
                            </Field>

                        </div>
                    </div>
                </div>

                {/* footer */}
                <div className="border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
                    <div className="mx-auto max-w-3xl">
                        <button
                            type="submit"
                            disabled={isSubmitting || successMsg}
                            className={`inline-flex w-full h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold text-white ring-1 ring-white/20 transition-all duration-300 disabled:cursor-not-allowed ${
                                successMsg
                                    ? "bg-emerald-500 shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)]"
                                    : "bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 shadow-[0_8px_24px_-8px_rgba(13,148,136,0.5)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(13,148,136,0.6)] active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0"
                            }`}
                        >
                            {isSubmitting
                                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                : successMsg
                                    ? <FiCheckCircle size={15} />
                                    : <FiSave size={14} />}
                            {isSubmitting ? "Saving…" : successMsg ? "Saved!" : "Save Changes"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

function Field({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-teal-50/50 px-4 py-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-white">
                    <Icon size={10} />
                </span>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-600">{label}</p>
            </div>
            <div className="p-3">
                {children}
            </div>
        </div>
    );
}
