export default function Modal({ isOpen, children }) {

    if (!isOpen) return null;

    return (
        <dialog className="fixed inset-4 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(96vw,42rem)] max-h-[90vh] bg-white rounded-lg shadow-2xl p-0 backdrop:bg-black/40 backdrop:backdrop-blur-sm open:flex open:flex-col animate-in fade-in duration-300 overflow-y-auto" open>
            { children }
        </dialog>
    )
}