import { useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
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
    const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);
    const [details, setDetails] = useState("");

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
            <div className="relative h-full overflow-hidden border border-rose-100 bg-white shadow-2xl">
                <div className="pointer-events-none absolute -top-20 -right-12 h-44 w-44 rounded-full bg-rose-200/55 blur-2xl"></div>
                <div className="pointer-events-none absolute top-12 -left-16 h-36 w-36 rounded-full bg-orange-100/70 blur-2xl"></div>

                <div className="relative border-b border-rose-100 bg-gradient-to-r from-rose-600 via-red-600 to-orange-500 px-5 pb-5 pt-5 text-white sm:px-6">
                    <div className="flex items-start justify-between gap-3">
                        <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
                            Issue Report
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-xl text-white ring-1 ring-white/35 transition hover:bg-white/30"
                            aria-label="Close"
                        >
                            &times;
                        </button>
                    </div>
                    <h3 className="mt-3 text-2xl font-bold leading-tight">Report Timing Issue</h3>
                    <p className="mt-1 text-sm text-rose-100">Help us verify and fix mosque timing data quickly.</p>
                    <p className="mt-4 break-words text-base font-semibold text-white">{mosqueName}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
                    <div className="rounded-lg border border-rose-100 bg-rose-50/70 px-3 py-2">
                        <p className="text-xs text-rose-800">
                            Your report improves accuracy for everyone in this area.
                        </p>
                    </div>

                    <label className="flex flex-col gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reason</span>
                        <select
                            value={selectedReason}
                            onChange={(event) => setSelectedReason(event.target.value)}
                            className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                            required
                        >
                            {REPORT_REASONS.map((reason) => (
                                <option key={reason} value={reason}>
                                    {reason}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Details</span>
                        <textarea
                            value={details}
                            onChange={(event) => setDetails(event.target.value)}
                            rows={5}
                            maxLength={500}
                            placeholder="Share what seems incorrect and, if possible, mention the expected timing."
                            className="min-h-32 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                            required
                        />
                        <span className="text-[11px] text-slate-400">
                            {details.length}/500 characters
                        </span>
                    </label>

                    <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-11 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="h-11 rounded-lg bg-gradient-to-r from-rose-600 to-orange-500 px-5 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:from-rose-700 hover:to-orange-600"
                        >
                            Submit Report
                        </button>
                    </div>
                </form>
            </div>
        </Modal>,
        document.getElementById("content-modal")!
    );
}
