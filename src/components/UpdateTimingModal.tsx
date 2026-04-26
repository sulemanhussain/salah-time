import { useState } from "react";
import { createPortal } from "react-dom";
import type { PrayerTime } from "../data/adaan-timings";
import Modal from "./Modal";
import UpdateTimingForm from "./UpdateTimingForm";
import type { PrayerTimingInput } from "./UpdateTimingForm";

type EditablePrayer = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

interface UpdateTimingModalProps {
    isOpen: boolean;
    mosqueName: string;
    mosqueId?: string;
    prayerTimings: PrayerTime | null;
    initialTimings?: Partial<Record<EditablePrayer, PrayerTimingInput>>;
    onClose: () => void;
    onSaveSuccess?: () => void;
}

export default function UpdateTimingModal({ isOpen, mosqueName, mosqueId, prayerTimings, initialTimings, onClose, onSaveSuccess }: UpdateTimingModalProps) {
    const [formKey, setFormKey] = useState(0);
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen) setFormKey(k => k + 1);
    }

    return createPortal(
        <Modal isOpen={isOpen} fullPage>
            <UpdateTimingForm
                key={formKey}
                mosqueName={mosqueName}
                mosqueId={mosqueId}
                prayerTimings={prayerTimings}
                initialTimings={initialTimings}
                onClose={onClose}
                onSaveSuccess={onSaveSuccess}
            />
        </Modal>,
        document.getElementById("content-modal")!
    );
}
