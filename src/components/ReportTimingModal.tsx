import { useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import { FiAlertTriangle, FiInfo, FiMessageSquare, FiX } from "react-icons/fi";
import Modal from "./Modal";

interface ReportTimingModalProps {
    isOpen: boolean;
    mosqueName: string;
    onClose: () => void;
}

const REPORT_REASONS = [
    "Incorrect Aadhan time",
    "Incorrect Congregation time",
    "Missing prayer timing",
    "Outdated mosque schedule",
    "Mosque details mismatch",
    "Other",
] as const;

export default function ReportTimingModal({ isOpen, mosqueName, onClose }: ReportTimingModalProps) {
    const closeButtonClassName =
        "absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/75 text-slate-600 ring-1 ring-slate-200 backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 sm:right-5 sm:top-5";
    const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);
    const [details, setDetails] = useState("");
    const MIN_DETAILS_LENGTH = 15;
    const detailsLength = details.trim().length;
    const remainingCharacters = 500 - details.length;
    const completionPercent = Math.min(100, Math.round((details.length / 500) * 100));
    const isSubmitDisabled = detailsLength < MIN_DETAILS_LENGTH;

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        console.log("Timing report submitted:", {
            mosqueName,
            reason: selectedReason,
            details,
        });
        onClose();
    }

    return createPortal(
        <Modal isOpen={isOpen} fullPage>
            <div className="relative min-h-full overflow-x-hidden bg-gradient-to-b from-rose-50/80 via-white to-rose-50/60 shadow-2xl">
                <div className="pointer-events-none absolute -top-20 -right-12 h-44 w-44 rounded-full bg-rose-200/35 blur-2xl"></div>
                <div className="pointer-events-none absolute top-12 -left-16 h-36 w-36 rounded-full bg-rose-100/45 blur-2xl"></div>

                <div className="sticky top-0 z-20 border-b border-rose-300 bg-rose-200/95 px-5 pb-5 pt-6 text-slate-900 backdrop-blur shadow-[0_16px_36px_-24px_rgba(225,29,72,0.3)] sm:px-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className={closeButtonClassName}
                        aria-label="Close"
                    >
                        <FiX size={18} />
                    </button>
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700 ring-1 ring-slate-200">
                        Issue Report
                    </span>
                    <h3 className="mt-3 text-2xl font-extrabold leading-tight">Report Timing Issue</h3>
                    <p className="mt-1 text-sm text-slate-600">Flag inaccurate timings so the community can review and correct them quickly.</p>
                    <div className="mt-4 rounded-2xl border border-rose-300 bg-white/85 px-3 py-2 backdrop-blur">
                        <p className="text-[11px] uppercase tracking-[0.08em] text-slate-500">Mosque</p>
                        <p className="mt-1 break-words text-sm font-semibold text-slate-900 sm:text-base">{mosqueName}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-4 pb-24 sm:p-6 sm:pb-28">
                    <div className="mx-auto max-w-3xl space-y-4">
                        <div className="rounded-2xl border border-rose-200 bg-white px-4 py-3 shadow-sm">
                            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700">
                                <FiAlertTriangle size={13} className="text-rose-400" />
                                Report Guidance
                            </p>
                            <p className="mt-2 text-xs text-slate-600">
                                Keep your report specific with clear timing details so updates can be verified faster.
                            </p>
                            <p className="mt-2 inline-flex items-start gap-1.5 text-xs text-slate-600">
                                <FiInfo size={13} className="mt-0.5 shrink-0 text-slate-500" />
                                <span>Mention both expected and currently shown times when possible.</span>
                            </p>
                        </div>

                        <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center gap-2">
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-[11px] font-semibold text-rose-700">1</span>
                                <p className="text-sm font-semibold text-slate-800">Select reason</p>
                            </div>
                            <label className="flex flex-col gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reason</span>
                                <select
                                    value={selectedReason}
                                    onChange={(event) => setSelectedReason(event.target.value)}
                                    className="h-11 rounded-xl border border-rose-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                                    required
                                >
                                    {REPORT_REASONS.map((reason) => (
                                        <option key={reason} value={reason}>
                                            {reason}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center gap-2">
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-[11px] font-semibold text-rose-700">2</span>
                                <p className="text-sm font-semibold text-slate-800">Add details</p>
                            </div>
                            <label className="flex flex-col gap-2">
                                <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <FiMessageSquare size={12} />
                                    Details
                                </span>
                                <textarea
                                    value={details}
                                    onChange={(event) => setDetails(event.target.value)}
                                    rows={6}
                                    maxLength={500}
                                    placeholder="Explain what looks incorrect and include the expected timing if known."
                                    className="min-h-36 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                                    required
                                />
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-rose-300 transition-all duration-300"
                                        style={{ width: `${completionPercent}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] text-slate-400">
                                        {details.length}/500 characters
                                    </span>
                                    <span className={`text-[11px] font-medium ${remainingCharacters < 80 ? "text-amber-600" : "text-slate-500"}`}>
                                        {remainingCharacters} left
                                    </span>
                                </div>
                                <p className={`text-[11px] ${isSubmitDisabled ? "text-slate-500" : "text-emerald-600"}`}>
                                    {isSubmitDisabled
                                        ? `Add at least ${MIN_DETAILS_LENGTH} characters to submit a meaningful report.`
                                        : "Looks good. Your report is clear enough to submit."}
                                </p>
                            </label>
                        </div>
                    </div>

                    <div className="bottom-0 z-10 -mx-4 border-t border-rose-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
                        <div className="mx-auto flex max-w-3xl flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitDisabled}
                                className="h-11 rounded-xl bg-rose-400 px-5 text-sm font-semibold text-rose-950 shadow-lg shadow-rose-200 transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-rose-100 disabled:text-rose-400 disabled:shadow-none"
                            >
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
