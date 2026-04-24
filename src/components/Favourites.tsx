import { useState, useEffect } from "react";
import { FiHeart, FiCompass, FiExternalLink, FiSun, FiChevronRight, FiEdit3 } from "react-icons/fi";
import { FaHeart, FaMosque } from "react-icons/fa";
import NavigationBar from "./NavigationBar";
import { getUserFavourites, addOrRemoveFavourite } from "../data/users";
import type { UserFavourite } from "../data/users";
import { getAuthCookie } from "../utils/auth-cookie";
import { useNavigate } from "react-router-dom";
import { isVolunteer } from "../utils/volunteer";

export default function Favourites() {
    const [favourites, setFavourites] = useState<UserFavourite[]>([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState<string | null>(null);

    const authUser = getAuthCookie();
    const navigate = useNavigate();
    const volunteerMode = isVolunteer();

    useEffect(() => {
        const userId = authUser?.userId;
        if (!userId) { setLoading(false); return; }
        async function load() {
            try {
                const favs = await getUserFavourites(userId!);
                setFavourites(favs);
            } catch { /* silently ignore */ }
            finally { setLoading(false); }
        }
        load();
    }, [authUser?.userId]);

    async function handleRemove(fav: UserFavourite) {
        if (!authUser?.userId || !fav.mosqueId) return;
        setRemovingId(fav.id ?? fav.mosqueId);
        try {
            await addOrRemoveFavourite(authUser.userId, fav.mosqueId, false);
            setFavourites(prev => prev.filter(f => f.id !== fav.id));
        } catch { /* silently ignore */ }
        finally { setRemovingId(null); }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-cyan-50 p-4 pb-24 sm:p-5">
            <div className="mx-auto max-w-2xl space-y-4">

                {/* header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 px-5 py-6 text-white shadow-[0_20px_45px_-20px_rgba(14,116,144,0.75)]">
                    <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
                    <FaHeart size={96} className="pointer-events-none absolute -right-4 -bottom-4 opacity-[0.07]" />
                    <div className="relative flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-2 ring-white/30">
                            <FiHeart size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold leading-tight">Favourites</h1>
                            <p className="mt-0.5 text-sm text-cyan-100/75">Your saved mosques</p>
                        </div>
                    </div>
                </div>

                {/* loading skeletons */}
                {loading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-slate-200" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-40 rounded bg-slate-200" />
                                        <div className="h-3 w-56 rounded bg-slate-100" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* empty state */}
                {!loading && favourites.length === 0 && (
                    <div className="flex flex-col items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-300">
                            <FiHeart size={32} />
                        </span>
                        <p className="text-base font-bold text-slate-700">No saved mosques yet</p>
                        <p className="text-sm text-slate-400">Tap the heart on any mosque to save it here for quick access.</p>
                    </div>
                )}

                {/* mosque tiles */}
                {!loading && favourites.length > 0 && (
                    <div className="space-y-3">
                        {favourites.map(fav => {
                            const mosque = fav.mosqueDetails;
                            const name = mosque?.name ?? "Unknown Mosque";
                            const vicinity = mosque?.vicinity ?? null;
                            const placeId = mosque?.googlePlaceId;
                            const isRemoving = removingId === (fav.id ?? fav.mosqueId);

                            const lat = mosque?.latitude != null ? Number(mosque.latitude) : null;
                            const lng = mosque?.longitude != null ? Number(mosque.longitude) : null;
                            const hasCoords = lat !== null && !isNaN(lat) && lng !== null && !isNaN(lng);

                            const mapsUrl = placeId
                                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${placeId}`
                                : null;
                            const directionsUrl = placeId && hasCoords
                                ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${placeId}`
                                : placeId
                                    ? `https://www.google.com/maps/dir/?api=1&destination_place_id=${placeId}`
                                    : null;

                            return (
                                <div
                                    key={fav.id ?? fav.mosqueId}
                                    className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                                >
                                    {/* left accent bar */}
                                    <div className="w-1.5 shrink-0 bg-gradient-to-b from-teal-500 to-cyan-500" />

                                    {/* card body */}
                                    <div className="flex flex-1 flex-col min-w-0">

                                        {/* mosque info row */}
                                        <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-sm shadow-teal-200">
                                                <FaMosque size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <p className="truncate text-sm font-bold text-slate-800">{name}</p>
                                                {vicinity && (
                                                    <p className="mt-0.5 truncate text-xs text-slate-500">{vicinity}</p>
                                                )}
                                            </div>
                                            <div
                                                role="button"
                                                tabIndex={0}
                                                onClick={e => { e.stopPropagation(); handleRemove(fav); }}
                                                onKeyDown={e => { if (e.key === "Enter") { e.stopPropagation(); handleRemove(fav); } }}
                                                className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-400 transition hover:bg-rose-100 hover:text-rose-500 active:scale-90 ${isRemoving ? "opacity-40 pointer-events-none" : ""}`}
                                                aria-label="Remove from favourites"
                                            >
                                                <FaHeart size={14} />
                                            </div>
                                        </div>

                                        {/* prayer times CTA */}
                                        {hasCoords && (
                                            <div className="px-4 pb-3">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/mosque-prayer-times', { state: { mosqueName: name, vicinity, mosqueDbId: fav.mosqueId, lat, lng } })}
                                                    className="flex w-full items-center gap-2 rounded-xl bg-teal-50 px-3 py-2.5 text-left transition hover:bg-teal-100 active:scale-[0.98]"
                                                >
                                                    <FiSun size={14} className="shrink-0 text-teal-600" />
                                                    <span className="text-xs font-semibold text-teal-700">View today's prayer times</span>
                                                    <FiChevronRight size={13} className="ml-auto shrink-0 text-teal-400" />
                                                </button>
                                            </div>
                                        )}

                                        {/* action row */}
                                        {(directionsUrl || mapsUrl || (volunteerMode && fav.mosqueId)) && (
                                            <div className="flex divide-x divide-slate-100 border-t border-slate-100">
                                                {volunteerMode && fav.mosqueId && (
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate('/update-timings', { state: { mosqueName: name, mosqueId: fav.mosqueId } })}
                                                        className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-violet-600 transition hover:bg-violet-50"
                                                    >
                                                        <FiEdit3 size={13} />
                                                        Update Timings
                                                    </button>
                                                )}
                                                {directionsUrl && (
                                                    <a
                                                        href={directionsUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-teal-700 transition hover:bg-teal-50"
                                                    >
                                                        <FiCompass size={13} />
                                                        Directions
                                                    </a>
                                                )}
                                                {mapsUrl && (
                                                    <a
                                                        href={mapsUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
                                                    >
                                                        <FiExternalLink size={13} />
                                                        Open in Maps
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <NavigationBar />
        </div>
    );
}
