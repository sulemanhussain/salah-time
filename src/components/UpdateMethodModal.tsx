import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { SKELETON_THEME } from "../utils/skeleton-theme";
import { FiUploadCloud, FiEdit3, FiX, FiInfo } from "react-icons/fi";
import Modal from "./Modal";

interface Props {
    isOpen: boolean;
    mosqueName: string;
    onManual: () => void;
    onClose: () => void;
}

export default function UpdateMethodModal({ isOpen, mosqueName, onManual, onClose }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isOpening, setIsOpening] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const tOpen  = setTimeout(() => setIsOpening(true), 0);
        const tClose = setTimeout(() => setIsOpening(false), 350);
        return () => { clearTimeout(tOpen); clearTimeout(tClose); };
    }, [isOpen]);

    function handleFile(file: File) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setUploadedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    }

    function removeFile() {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setUploadedFile(null);
        setPreviewUrl(null);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }

    function handleClose() {
        removeFile();
        setIsDragging(false);
        onClose();
    }

    function handleManual() {
        removeFile();
        setIsDragging(false);
        onManual();
    }

    return createPortal(
        <Modal isOpen={isOpen} fullPage>
            <div className="relative min-h-full overflow-x-hidden bg-gradient-to-b from-teal-50 via-white to-cyan-50 shadow-2xl">
                <div className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-cyan-300/40 blur-2xl" />
                <div className="pointer-events-none absolute top-10 -left-14 h-32 w-32 rounded-full bg-teal-200/50 blur-2xl" />

                {/* ── Header ── */}
                <div className="top-0 z-20 border-b border-cyan-900/20 bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 px-5 pb-5 pt-6 text-white shadow-[0_16px_36px_-24px_rgba(14,116,144,0.95)] sm:px-6">
                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Close"
                        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/35 backdrop-blur transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-5 sm:top-5"
                    >
                        <FiX size={18} />
                    </button>
                    <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
                        Community Update
                    </span>
                    <h3 className="mt-3 text-2xl font-extrabold leading-tight">Update Salah Timings</h3>
                    <p className="mt-1 text-sm text-cyan-100">Choose how you'd like to submit the updated prayer schedule.</p>
                    <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-lg">
                            🕌
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-cyan-100">Updating timings for</p>
                            <p className="truncate text-sm font-bold text-white">{mosqueName}</p>
                        </div>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="space-y-4 p-4 sm:p-6">
                {isOpening ? (
                    <SkeletonTheme {...SKELETON_THEME}>
                        <Skeleton height={56} borderRadius={12} />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="mb-3 flex items-center justify-between">
                                    <Skeleton width={90} height={16} borderRadius={6} />
                                    <Skeleton width={100} height={22} borderRadius={999} />
                                </div>
                                <Skeleton height={120} borderRadius={12} />
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="mb-3 flex items-center justify-between">
                                    <Skeleton width={100} height={16} borderRadius={6} />
                                    <Skeleton width={80} height={22} borderRadius={999} />
                                </div>
                                <Skeleton height={120} borderRadius={12} />
                            </div>
                        </div>
                    </SkeletonTheme>
                ) : (<>

                    {/* Info banner */}
                    <div className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-teal-50 px-4 py-3 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Select an Update Method</p>
                        <p className="mt-2 inline-flex items-start gap-1.5 text-xs text-slate-600">
                            <FiInfo size={13} className="mt-0.5 shrink-0 text-cyan-700" />
                            <span>
                                Upload a photo of the mosque noticeboard, or enter each prayer time manually. All submissions go through community review before going live.
                            </span>
                        </p>
                    </div>

                    <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2">

                        {/* ── File upload card ── */}
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:border-violet-300 hover:shadow-[0_16px_30px_-24px_rgba(139,92,246,0.6)]">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm font-bold text-slate-800 sm:text-base">File Upload</p>
                                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-violet-700 ring-1 ring-violet-200">
                                    Recommended
                                </span>
                            </div>

                            {uploadedFile && previewUrl ? (
                                <div className="space-y-2.5">
                                    <div className="relative overflow-hidden rounded-xl border border-slate-200">
                                        <img src={previewUrl} alt="Preview" className="max-h-48 w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
                                        >
                                            <FiX size={13} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                                        <span className="min-w-0 flex-1 truncate text-xs text-slate-600">{uploadedFile.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="shrink-0 text-xs font-semibold text-violet-500 hover:text-violet-700"
                                        >
                                            Change
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-3 py-6 text-center transition ${
                                        isDragging
                                            ? "border-violet-400 bg-violet-50"
                                            : "border-slate-200 bg-slate-50 hover:border-violet-300 hover:bg-violet-50/50"
                                    }`}
                                >
                                    <FiUploadCloud size={24} className={isDragging ? "text-violet-500" : "text-slate-400"} />
                                    <p className="text-xs font-medium text-slate-500">
                                        Drag & drop or <span className="font-semibold text-violet-600">browse</span>
                                    </p>
                                    <p className="text-[10px] text-slate-400">JPG, PNG, WEBP · max 10 MB</p>
                                </button>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
                            />
                        </div>

                        {/* ── OR divider ── */}
                        <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden -translate-x-1/2 flex-col items-center justify-center gap-1.5 sm:flex">
                            <div className="w-px flex-1 bg-slate-200" />
                            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] font-bold text-slate-400 shadow-sm">
                                or
                            </span>
                            <div className="w-px flex-1 bg-slate-200" />
                        </div>
                        {/* mobile horizontal divider */}
                        <div className="flex items-center gap-3 sm:hidden">
                            <div className="h-px flex-1 bg-slate-200" />
                            <span className="text-[11px] font-bold text-slate-400">or</span>
                            <div className="h-px flex-1 bg-slate-200" />
                        </div>

                        {/* ── Manual entry card ── */}
                        <button
                            type="button"
                            onClick={handleManual}
                            className="group flex flex-col rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition hover:border-cyan-300 hover:shadow-[0_16px_30px_-24px_rgba(6,182,212,0.95)] active:scale-[0.99]"
                        >
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm font-bold text-slate-800 sm:text-base">Manual Entry</p>
                                <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-cyan-700 ring-1 ring-cyan-200">
                                    Time Entry
                                </span>
                            </div>
                            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-3 py-6 text-center transition group-hover:border-cyan-300 group-hover:bg-cyan-50/50">
                                <FiEdit3 size={24} className="text-slate-400 transition group-hover:text-cyan-500" />
                                <p className="text-xs font-medium text-slate-500 transition group-hover:text-cyan-700">
                                    Enter Aadhan &amp; congregation times for each prayer
                                </p>
                            </div>
                            <p className="mt-2 text-[11px] text-slate-500">Fill in each prayer's Aadhan and congregation time directly.</p>
                        </button>
                    </div>

                    {/* Sticky footer */}
                    <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
                        <div className="mx-auto flex max-w-5xl flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="h-11 rounded-xl border border-cyan-200 bg-white px-5 text-sm font-semibold text-cyan-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-50 hover:shadow-md active:translate-y-0"
                            >
                                Cancel
                            </button>
                            {uploadedFile && (
                                <button
                                    type="button"
                                    className="h-11 rounded-xl bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 px-5 text-sm font-semibold text-white ring-1 ring-white/20 shadow-[0_16px_30px_-16px_rgba(14,116,144,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:from-teal-800 hover:via-cyan-800 hover:to-sky-800 hover:shadow-[0_20px_34px_-16px_rgba(14,116,144,0.95)] active:translate-y-0"
                                >
                                    Submit Upload
                                </button>
                            )}
                        </div>
                    </div>
                </>)}
                </div>
            </div>
        </Modal>,
        document.getElementById("content-modal")!
    );
}
