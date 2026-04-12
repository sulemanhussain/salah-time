export default function Modal({ isOpen, children }) {

    if (!isOpen) return null;

    return (
        <dialog className="fixed bottom-8 left-1/2 -translate-x-1/2 w-11/12 max-w-2xl bg-white rounded-lg shadow-2xl p-0 backdrop:bg-black/40 backdrop:backdrop-blur-sm open:flex open:flex-col animate-in fade-in duration-300" open>
            { children }
        </dialog>
    )
}