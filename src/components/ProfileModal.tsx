import { useState } from "react";
import { createPortal } from "react-dom";
import { updateUserProfile } from "../data/users";
import type { UserProfile } from "../data/users";
import {
    FiCamera,
    FiCheckCircle,
    FiMail,
    FiMapPin,
    FiPhone,
    FiSave,
    FiUser,
    FiX,
} from "react-icons/fi";
import Modal from "./Modal";
import { getAuthCookie } from "../utils/auth-cookie";

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

function MuslimManIcon({ size = 36 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor">
            {/* taqiyah / kufi cap — dome */}
            <path d="M10 12.5 C10 7.5 12.5 6 16 6 C19.5 6 22 7.5 22 12.5 Z" />
            {/* cap brim band */}
            <rect x="9.5" y="11.5" width="13" height="1.8" rx="0.9" />
            {/* head */}
            <circle cx="16" cy="15.5" r="4.5" />
            {/* beard — full rounded beard below chin */}
            <path d="M11.5 18.5 C10 22.5 11.5 26 16 26.5 C20.5 26 22 22.5 20.5 18.5 C18.5 20.5 13.5 20.5 11.5 18.5 Z" />
            {/* thobe body */}
            <path d="M6 32 C6 25.5 10 23 16 23 C22 23 26 25.5 26 32 Z" />
        </svg>
    );
}

function MuslimWomanIcon({ size = 36 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor">
            {/* hijab outer shape — wraps head and flows to shoulders */}
            <path d="M16 5C10 5 7 9 7 13.5C7 16.5 9 18.5 12 19L16 19.5L20 19C23 18.5 25 16.5 25 13.5C25 9 22 5 16 5Z" />
            {/* face window inside hijab */}
            <ellipse cx="16" cy="13.5" rx="3.5" ry="4" fill="white" fillOpacity="0.22" />
            {/* abaya / body */}
            <path d="M8 29C8 23 11 20.5 16 20.5C21 20.5 24 23 24 29H8Z" />
        </svg>
    );
}

function NeutralPersonIcon({ size = 36 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor">
            {/* head */}
            <circle cx="16" cy="12" r="5" />
            {/* body */}
            <path d="M7 29C7 23 10.5 20 16 20C21.5 20 25 23 25 29H7Z" />
        </svg>
    );
}

const GENDER_OPTIONS: { value: Exclude<Gender, "">; label: string; Icon: ({ size }: { size?: number }) => React.ReactElement }[] = [
    { value: "male",              label: "Male",              Icon: MuslimManIcon    },
    { value: "female",            label: "Female",            Icon: MuslimWomanIcon  },
    { value: "prefer_not_to_say", label: "Prefer not to say", Icon: NeutralPersonIcon },
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

interface Props {
    isOpen: boolean;
    onClose: () => void;
    userProfile?: UserProfile | null;
    isLoading?: boolean;
}

const FIELD_CLASS =
    "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100";

export default function ProfileModal({ isOpen, onClose, userProfile, isLoading }: Props) {
    const authUser = getAuthCookie();
    const authEmail = authUser?.email ?? "";
    const initials = (authEmail.split("@")[0] ?? "U").slice(0, 2).toUpperCase();

    const [form, setForm] = useState<Profile>(() => loadProfile(authEmail, userProfile));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState(false);

    function handleChange(field: keyof Profile, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function handleClose() {
        setSuccessMsg(false);
        onClose();
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
            setSuccessMsg(true);
            setTimeout(() => setSuccessMsg(false), 3500);
        } finally {
            setIsSubmitting(false);
        }
    }

    return createPortal(
        <Modal isOpen={isOpen} fullPage>
            <div className="relative flex flex-col flex-1 overflow-x-hidden bg-gradient-to-b from-teal-50 via-white to-cyan-50">

                {/* form */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 overflow-y-auto">

                        {/* header — sticky so close button stays visible */}
                        <div className="top-0 z-20 relative overflow-hidden bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 px-5 pb-6 pt-6 text-white shadow-[0_16px_40px_-20px_rgba(14,116,144,0.6)] sm:px-6">
                            <button
                                type="button"
                                onClick={handleClose}
                                aria-label="Close"
                                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/35 backdrop-blur transition hover:bg-white/30 sm:right-5 sm:top-5"
                            >
                                <FiX size={17} />
                            </button>
                            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                            <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-teal-600/30 blur-2xl" />
                            <div className="relative">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ring-1 ring-white/25">
                                    <FiUser size={10} />
                                    Account
                                </span>
                                <h3 className="mt-2.5 text-2xl font-extrabold leading-tight tracking-tight">
                                    Your Profile
                                </h3>
                                <p className="mt-1 text-sm text-cyan-100">
                                    Keep your personal details accurate and up to date.
                                </p>
                                <div className="mt-4 flex items-center gap-4">
                                    <div className="relative">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-extrabold ring-2 ring-white/30">
                                            {initials}
                                        </div>
                                        <button
                                            type="button"
                                            className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-teal-700 shadow-md transition hover:bg-teal-50"
                                            aria-label="Change photo"
                                        >
                                            <FiCamera size={11} />
                                        </button>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-white">
                                            {form.fullName || authEmail.split("@")[0]}
                                        </p>
                                        <p className="text-xs text-cyan-200">{authEmail}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isLoading && (
                            <div className="flex flex-col items-center justify-center gap-3 py-16">
                                <div className="h-9 w-9 animate-spin rounded-full border-4 border-teal-100 border-t-teal-500" />
                                <p className="text-xs font-medium text-slate-400">Loading profile…</p>
                            </div>
                        )}
                        <div className={`p-4 sm:p-6 ${isLoading ? "hidden" : ""}`}>
                        <div className="mx-auto max-w-3xl space-y-4">

                            {/* full name */}
                            <Field label="Full Name" icon={FiUser}>
                                <input
                                    type="text"
                                    value={form.fullName}
                                    onChange={(e) => handleChange("fullName", e.target.value)}
                                    placeholder="e.g. Abdullah Hassan"
                                    className={FIELD_CLASS}
                                />
                            </Field>

                            {/* gender */}
                            <Field label="Gender" icon={FiUser}>
                                <div className="grid grid-cols-3 gap-2">
                                    {GENDER_OPTIONS.map((opt) => {
                                        const active = form.gender === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => handleChange("gender", active ? "" : opt.value)}
                                                className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition-all duration-150 ${
                                                    active
                                                        ? "border-teal-400 bg-teal-50 text-teal-800 ring-1 ring-teal-300 shadow-sm"
                                                        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-teal-200 hover:bg-teal-50/40"
                                                }`}
                                            >
                                                <opt.Icon size={28} />
                                                <span className="text-center leading-tight">{opt.label}</span>
                                                <span className={`h-1.5 w-1.5 rounded-full transition-all ${active ? "bg-teal-500 opacity-100" : "opacity-0"}`} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </Field>
                            
                            {/* email */}
                            <Field label="Email Address" icon={FiMail}>
                                <input
                                    type="email"
                                    value={form.email}
                                    readOnly
                                    className={`${FIELD_CLASS} cursor-not-allowed bg-slate-100 text-slate-500 select-all`}
                                />
                            </Field>

                            {/* phone */}
                            <Field label="Phone Number" icon={FiPhone}>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    placeholder="e.g. +44 7700 900000"
                                    className={FIELD_CLASS}
                                />
                            </Field>

                            {/* city */}
                            <Field label="City / Area" icon={FiMapPin}>
                                <input
                                    type="text"
                                    value={form.city}
                                    onChange={(e) => handleChange("city", e.target.value)}
                                    placeholder="e.g. Birmingham, UK"
                                    className={FIELD_CLASS}
                                />
                            </Field>

                            {/* bio */}
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
                        <div className="mx-auto max-w-3xl space-y-2">
                            <div className={`overflow-hidden transition-all duration-300 ${successMsg ? "max-h-16 opacity-100" : "max-h-0 opacity-0"}`}>
                                <div className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-2.5">
                                    <FiCheckCircle size={14} className="shrink-0 text-teal-600" />
                                    <p className="text-xs font-medium text-teal-800">Profile details updated successfully.</p>
                                </div>
                            </div>
                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md active:translate-y-0"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 px-6 text-sm font-bold text-white shadow-[0_8px_24px_-8px_rgba(13,148,136,0.5)] ring-1 ring-white/20 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(13,148,136,0.6)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {isSubmitting
                                        ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        : <FiSave size={14} />}
                                    {isSubmitting ? "Saving…" : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>,
        document.getElementById("content-modal")!
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
