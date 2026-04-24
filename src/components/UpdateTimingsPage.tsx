import { useLocation, useNavigate } from "react-router-dom";
import UpdateTimingForm from "./UpdateTimingForm";

type PageState = { mosqueName: string; mosqueId?: string };

export default function UpdateTimingsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { mosqueName = "", mosqueId } = (location.state as PageState | null) ?? {};

    return (
        <UpdateTimingForm
            asPage
            mosqueName={mosqueName}
            mosqueId={mosqueId}
            prayerTimings={null}
            onClose={() => navigate(-1)}
        />
    );
}
