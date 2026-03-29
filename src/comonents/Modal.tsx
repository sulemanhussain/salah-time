export default function Modal({ isOpen, content }) {

    if (!isOpen) return null;

    return (
        <dialog className="modal-dialog">
             <div dangerouslySetInnerHTML={{ __html: content }} />
            {/* { content } */}
        </dialog>
    )
}