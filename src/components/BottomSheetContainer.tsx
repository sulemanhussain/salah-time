import { useEffect, useRef } from 'react';
import { Sheet } from 'react-modal-sheet';
import MosqueDetails from './MosqueDetails';
import type { MapPlace } from '../data/Maps';

export default function BottomSheetContainer({ isOpen, closeSheet, place }: { isOpen: boolean; closeSheet: () => void; place: MapPlace | null }) {
    const hasHistoryEntryRef = useRef(false);
    const closingFromPopStateRef = useRef(false);

    useEffect(() => {
        if (!isOpen || !place) return;

        closingFromPopStateRef.current = false;
        if (!hasHistoryEntryRef.current) {
            window.history.pushState(
                {
                    ...window.history.state,
                    __bottomSheetOpen: true,
                    placeId: place.place_id,
                },
                ''
            );
            hasHistoryEntryRef.current = true;
        }
    }, [isOpen, place?.place_id]);

    useEffect(() => {
        const handlePopState = () => {
            if (!isOpen) return;
            closingFromPopStateRef.current = true;
            hasHistoryEntryRef.current = false;
            closeSheet();
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isOpen, closeSheet]);

    if (!place) return null;

    function handleSheetClose() {
        if (hasHistoryEntryRef.current && !closingFromPopStateRef.current) {
            window.history.back();
            return;
        }

        hasHistoryEntryRef.current = false;
        closingFromPopStateRef.current = false;
        closeSheet();
    }

    return (
        <>
            <Sheet detent='full' isOpen={isOpen} onClose={handleSheetClose}>
                <Sheet.Container>
                    <Sheet.Header />
                    <Sheet.Content>
                       <MosqueDetails place={place} />
                    </Sheet.Content>
                </Sheet.Container>
            </Sheet>
        </>
    )
}
