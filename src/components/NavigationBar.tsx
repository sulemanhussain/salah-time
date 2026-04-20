import { AiOutlineHome, AiFillHome } from 'react-icons/ai';
import { MdOutlineLocationOn, MdLocationOn } from 'react-icons/md';
import { IoSettingsOutline, IoSettings } from 'react-icons/io5';
import { FiBell } from 'react-icons/fi';
import { RiNotification3Fill } from 'react-icons/ri';
import { NavLink } from 'react-router-dom';

const UNREAD_COUNT = 3;

export default function NavigationBar() {
    const items = [
        { to: "/home",          label: "Home",     Icon: AiOutlineHome,       IconActive: AiFillHome,          badge: 0            },
        { to: "/app",           label: "Map",       Icon: MdOutlineLocationOn, IconActive: MdLocationOn,        badge: 0            },
        { to: "/notifications", label: "Alerts",    Icon: FiBell,              IconActive: RiNotification3Fill, badge: UNREAD_COUNT },
        { to: "/settings",      label: "Settings",  Icon: IoSettingsOutline,   IconActive: IoSettings,          badge: 0            },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
            {/* full-width blur curtain */}
            <div className="absolute inset-0 backdrop-blur-xl [mask-image:linear-gradient(to_bottom,transparent_0%,black_40%)]"></div>
            <div className="relative flex justify-center pb-4 px-4">
            <div className="pointer-events-auto w-full max-w-sm">
                <div className="relative flex items-center justify-around rounded-2xl bg-white/80 backdrop-blur-2xl shadow-[0_8px_32px_-4px_rgba(13,148,136,0.18),0_2px_12px_-2px_rgba(0,0,0,0.10)] border border-white/60 px-2 py-2">

                    {items.map(({ to, label, Icon, IconActive, badge }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            className="outline-none flex-1"
                        >
                            {({ isActive }) => (
                                <span className="relative flex flex-col items-center">

                                    {/* active pill */}
                                    <span className={`
                                        absolute inset-x-0 -inset-y-1 rounded-xl
                                        bg-gradient-to-br from-teal-500 to-cyan-500
                                        transition-all duration-300 ease-out
                                        ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-90"}
                                    `} />

                                    {/* icon */}
                                    <span className={`relative transition-all duration-200 ${isActive ? "scale-110" : "active:scale-90"}`}>
                                        {isActive
                                            ? <IconActive size={22} className="text-white drop-shadow-sm" />
                                            : <Icon size={22} className="text-slate-400" />
                                        }

                                        {/* unread badge */}
                                        {badge > 0 && !isActive && (
                                            <span className="absolute -right-1.5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
                                                {badge}
                                            </span>
                                        )}
                                    </span>

                                    {/* label */}
                                    <span className={`relative text-[9px] font-semibold tracking-wide mt-0.5 transition-all duration-200 ${
                                        isActive ? "text-white" : "text-slate-400"
                                    }`}>
                                        {label}
                                    </span>

                                </span>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
        </nav>
    );
}
