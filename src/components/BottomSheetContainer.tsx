import { Sheet } from 'react-modal-sheet';
import MosqueDetails from './MosqueDetails';
import type { MapPlace } from '../data/Maps';

export default function BottomSheetContainer({ isOpen, closeSheet, place }: { isOpen: boolean; closeSheet: () => void; place: MapPlace | null }) {

    if (!place) return null;

    return (
        <>
            <Sheet isOpen={isOpen} onClose={closeSheet}>
                <Sheet.Container>
                    <Sheet.Header />
                    <Sheet.Content>
                       <MosqueDetails place={place} />
                    </Sheet.Content>
                </Sheet.Container>
                 <Sheet.Backdrop />
            </Sheet>
        </>
    )
}