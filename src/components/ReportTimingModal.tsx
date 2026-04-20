import { useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import { useRef } from "react";
import {
    FiCheckCircle,
    FiFile,
    FiFlag,
    FiImage,
    FiInfo,
    FiMessageSquare,
    FiSend,
    FiX,
} from "react-icons/fi";
import Modal from "./Modal";

interface ReportTimingModalProps {
    isOpen: boolean;
    mosqueName: string;
    onClose: () => void;
}

const REPORT_REASONS = [
    { id: "incorrect-adhan",        label: "Incorrect Aadhan time",      icon: "🕌" },
    { id: "incorrect-congregation", label: "Incorrect Congregation time", icon: "🕋" },
    { id: "missing-timing",         label: "Missing prayer timing",       icon: "⏰" },
    { id: "outdated-schedule",      label: "Outdated mosque schedule",    icon: "📅" },
    { id: "details-mismatch",       label: "Mosque details mismatch",     icon: "📍" },
    { id: "other",                  label: "Other",                       icon: "💬" },
] as const;

type ReasonId = typeof REPORT_REASONS[number]["id"];

export default function ReportTimingModal({ isOpen, mosqueName, onClose }: ReportTimingModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedReason, setSelectedReason] = useState<ReasonId>(REPORT_REASONS[0].id);
    const [details, setDetails] = useState("");
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    function handlePhoto(file: File) {
        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
    }

    function removePhoto() {
        if (photoPreview) URL.revokeObjectURL(photoPreview);
        setPhoto(null);
        setPhotoPreview(null);
    }

    const MIN_DETAILS_LENGTH = 15;
    const detailsLength = details.trim().length;
    const remainingCharacters = 500 - details.length;
    const completionPercent = Math.min(100, Math.round((details.length / 500) * 100));
    const isSubmitDisabled = detailsLength < MIN_DETAILS_LENGTH;

    const progressColor =
        completionPercent >= 80 ? "bg-amber-400" :
        completionPercent >= 30 ? "bg-rose-400" :
        "bg-rose-300";

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        console.log("Timing report submitted:", { mosqueName, reason: selectedReason, details, photo: photo?.name ?? null });
        onhandleClose();
    }

    function onhandleClose() {
        setSelectedReason(REPORT_REASONS[0].id);
        setDetails("");
        removePhoto();
        onClose();
    }

    return createPortal(
        <Modal isOpen={isOpen} fullPage>
            <div className="relative min-h-full overflow-x-hidden bg-gradient-to-b from-rose-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

                <div className="pointer-events-none absolute -top-16 -right-10 h-52 w-52 rounded-full bg-rose-300/20 blur-3xl" />
                <div className="pointer-events-none absolute top-32 -left-16 h-40 w-40 rounded-full bg-pink-200/25 blur-3xl" />

                {/* header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-rose-700 via-rose-600 to-pink-600 px-5 pb-6 pt-6 text-white shadow-[0_16px_40px_-20px_rgba(190,18,60,0.55)] sm:px-6">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                    <button
                        type="button"
                        onClick={onhandleClose}
                        aria-label="Close"
                        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/35 sm:right-5 sm:top-5"
                    >
                        <FiX size={17} />
                    </button>
                    <div className="relative">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 shadow-lg">
                            <FiFlag size={22} className="text-white" />
                        </div>
                        <h3 className="mt-2.5 text-2xl font-extrabold leading-tight tracking-tight">Report an Issue</h3>
                        <p className="mt-1 text-sm text-white/75">Help the community by flagging inaccurate timings for review.</p>
                        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 ring-1 ring-white/20 backdrop-blur">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-lg">🕌</div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/75">Reporting for</p>
                                <p className="truncate text-sm font-bold text-white">{mosqueName}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* form */}
                <form onSubmit={handleSubmit} className="space-y-4 p-4 pb-40 sm:p-6">
                    <div className="mx-auto max-w-3xl space-y-4">

                        {/* guidance */}
                        <div className="flex gap-3 rounded-2xl border border-amber-200 dark:border-amber-700/40 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 px-4 py-3.5 shadow-sm">
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                                <FiInfo size={14} />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">Before you submit</p>
                                <p className="mt-1 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                                    Be specific — include both the expected and displayed times. Accurate reports get resolved faster.
                                </p>
                            </div>
                        </div>

                        {/* step 1 — reason */}
                        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-700/50 bg-gradient-to-r from-slate-50 to-rose-50/50 dark:from-slate-800 dark:to-slate-800 px-4 py-3">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white shadow-sm shadow-rose-200">1</span>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">What's the issue?</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 p-4">
                                {REPORT_REASONS.map((reason) => {
                                    const active = selectedReason === reason.id;
                                    return (
                                        <button
                                            key={reason.id}
                                            type="button"
                                            onClick={() => setSelectedReason(reason.id)}
                                            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-all duration-200 ${
                                                active
                                                    ? "border-rose-400 bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 shadow-sm shadow-rose-100 ring-1 ring-rose-300"
                                                    : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-rose-200 hover:bg-rose-50/50 dark:hover:bg-rose-900/20"
                                            }`}
                                        >
                                            <span className="text-base leading-none">{reason.icon}</span>
                                            <span className="leading-snug">{reason.label}</span>
                                            <FiCheckCircle size={13} className={`ml-auto shrink-0 transition-opacity duration-150 ${active ? "text-rose-500 opacity-100" : "opacity-0"}`} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* step 2 — details */}
                        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-700/50 bg-gradient-to-r from-slate-50 to-rose-50/50 dark:from-slate-800 dark:to-slate-800 px-4 py-3">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white shadow-sm shadow-rose-200">2</span>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Describe the issue</p>
                            </div>
                            <div className="p-4">
                                <label className="flex flex-col gap-2">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                        <FiMessageSquare size={12} /> Details
                                    </span>
                                    <textarea
                                        value={details}
                                        onChange={(event) => setDetails(event.target.value)}
                                        rows={5}
                                        maxLength={500}
                                        placeholder="Explain what looks incorrect. Include both the expected and currently shown time if possible."
                                        className="min-h-32 resize-none rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3.5 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-rose-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/30"
                                        required
                                    />
                                    <div className="space-y-1.5">
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                                            <div className={`h-full rounded-full transition-all duration-300 ${progressColor}`} style={{ width: `${completionPercent}%` }} />
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`text-[11px] font-medium ${isSubmitDisabled ? "text-slate-400 dark:text-slate-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                                                {isSubmitDisabled ? `${MIN_DETAILS_LENGTH - detailsLength} more characters needed` : "✓ Ready to submit"}
                                            </p>
                                            <span className={`text-[11px] font-medium tabular-nums ${remainingCharacters < 80 ? "text-amber-600 dark:text-amber-400" : "text-slate-400 dark:text-slate-500"}`}>
                                                {details.length} / 500
                                            </span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* step 3 — photo */}
                        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-700/50 bg-gradient-to-r from-slate-50 to-rose-50/50 dark:from-slate-800 dark:to-slate-800 px-4 py-3">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white shadow-sm shadow-rose-200">3</span>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                    Attach a photo <span className="text-xs font-normal text-slate-400 dark:text-slate-500">(optional)</span>
                                </p>
                            </div>
                            <div className="p-4">
                                {photoPreview ? (
                                    <div className="space-y-3">
                                        <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                                            <img src={photoPreview} alt="Attached" className="max-h-52 w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={removePhoto}
                                                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
                                            >
                                                <FiX size={13} />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2">
                                            <FiFile size={13} className="shrink-0 text-slate-400 dark:text-slate-500" />
                                            <span className="min-w-0 flex-1 truncate text-xs text-slate-600 dark:text-slate-400">{photo?.name}</span>
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="shrink-0 text-xs font-semibold text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300">
                                                Change
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handlePhoto(f); }}
                                        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-6 text-center transition hover:border-rose-300 dark:hover:border-rose-600 hover:bg-rose-50/40 dark:hover:bg-rose-900/10"
                                    >
                                        <FiImage size={22} className="text-slate-400 dark:text-slate-500" />
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            Drag & drop or <span className="font-semibold text-rose-500 dark:text-rose-400">browse</span>
                                        </p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500">JPG, PNG · max 10 MB</p>
                                    </button>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhoto(f); e.target.value = ""; }}
                                />
                            </div>
                        </div>

                    </div>

                    {/* footer */}
                    <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
                        <div className="mx-auto flex max-w-3xl flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={onhandleClose}
                                className="h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-all hover:-translate-y-0.5 hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-md active:translate-y-0"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitDisabled}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 text-sm font-bold text-white shadow-[0_8px_24px_-8px_rgba(244,63,94,0.6)] ring-1 ring-white/20 transition-all hover:-translate-y-0.5 hover:from-rose-600 hover:to-pink-600 hover:shadow-[0_12px_28px_-8px_rgba(244,63,94,0.7)] active:translate-y-0 disabled:cursor-not-allowed disabled:from-rose-200 disabled:to-pink-200 disabled:text-rose-400 disabled:shadow-none disabled:ring-0 dark:disabled:from-rose-900/40 dark:disabled:to-pink-900/40 dark:disabled:text-rose-600"
                            >
                                <FiSend size={14} />
                                Submit Report
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>,
        document.getElementById("content-modal")!
    );
}
