import type { ReactNode } from "react";

interface ModalProps {
    isOpen: boolean;
    children: ReactNode;
    fullPage?: boolean;
}

export default function Modal({ isOpen, children, fullPage = false }: ModalProps) {

    if (!isOpen) return null;

    const dialogClassName = fullPage
        ? "fixed inset-0 h-[100dvh] w-screen max-h-[100dvh] max-w-none bg-white p-0 backdrop:bg-black/40 backdrop:backdrop-blur-sm open:flex open:flex-col animate-in fade-in duration-300 overflow-y-auto"
        : "fixed inset-4 left-1/2 top-1/2 w-full max-h-[90vh] -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl p-0 backdrop:bg-black/40 backdrop:backdrop-blur-sm open:flex open:flex-col animate-in fade-in duration-300 overflow-y-auto";

    return (
        <dialog className={dialogClassName} open>
            { children }
        </dialog>
    )
}
