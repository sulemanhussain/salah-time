import { useEffect, useRef } from 'react';
import { Sheet } from 'react-modal-sheet';
import MosqueDetails from './MosqueDetails';
import type { MapPlace } from '../data/Maps';

export default function BottomSheetContainer({ isOpen, closeSheet, place }: { isOpen: boolean; closeSheet: () => void; place: MapPlace | null }) {
    const closeSheetRef = useRef(closeSheet);
    useEffect(() => { closeSheetRef.current = closeSheet; }, [closeSheet]);

    useEffect(() => {
        if (!isOpen) return;

        history.pushState({ bottomSheet: true }, '');

        const handlePopState = () => closeSheetRef.current();
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            if (history.state?.bottomSheet) {
                history.back();
            }
        };
    }, [isOpen]);

    if (!place) return null;

    return (
        <Sheet detent='full' isOpen={isOpen} onClose={closeSheet}>
            <Sheet.Container>
                <Sheet.Header />
                <Sheet.Content>
                    <MosqueDetails place={place} />
                </Sheet.Content>
            </Sheet.Container>
        </Sheet>
    );
}