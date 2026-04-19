import { AiOutlineHome, AiFillHome } from 'react-icons/ai';
import { MdOutlineLocationOn, MdLocationOn } from 'react-icons/md';
import { IoSettingsOutline, IoSettings } from 'react-icons/io5';
import { FiBell } from 'react-icons/fi';
import { RiNotification3Fill } from 'react-icons/ri';
import { NavLink } from 'react-router-dom';

const UNREAD_COUNT = 3;

export default function NavigationBar() {
    const items = [
        { to: "/home",          label: "Home",          Icon: AiOutlineHome,       IconActive: AiFillHome,           badge: 0            },
        { to: "/app",           label: "Map",           Icon: MdOutlineLocationOn, IconActive: MdLocationOn,         badge: 0            },
        { to: "/notifications", label: "Alerts",         Icon: FiBell,              IconActive: RiNotification3Fill,  badge: UNREAD_COUNT },
        { to: "/settings",      label: "Settings",      Icon: IoSettingsOutline,   IconActive: IoSettings,           badge: 0            },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40">
            <div className="relative w-full">
                <div className="relative overflow-hidden bg-white/90 shadow-[0_-1px_0_0_rgba(0,0,0,0.06),0_-8px_24px_-4px_rgba(13,148,136,0.1)] backdrop-blur-2xl">

                    {/* top hairline */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-200/70 to-transparent" />

                    <div className="grid grid-cols-4 px-2 py-1">
                        {items.map(({ to, label, Icon, IconActive, badge }) => (
                            <NavLink
                                key={to}
                                to={to}
                                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                className="group flex flex-col items-center gap-0.5 px-2 py-2.5 outline-none"
                            >
                                {({ isActive }) => (
                                    <>
                                        {/* icon container */}
                                        <span className="relative flex flex-col items-center">
                                            {/* active pill background */}
                                            <span
                                                className={`absolute -inset-x-4 -inset-y-1.5 rounded-xl transition-all duration-300 ${
                                                    isActive
                                                        ? "bg-gradient-to-b from-teal-500/10 to-cyan-500/5 opacity-100"
                                                        : "opacity-0"
                                                }`}
                                            />
                                            {/* icon */}
                                            <span className={`relative transition-all duration-200 ${isActive ? "-translate-y-0.5 scale-110" : "group-active:scale-95"}`}>
                                                {isActive
                                                    ? <IconActive size={24} className="text-teal-600" />
                                                    : <Icon size={24} className="text-slate-400 transition group-hover:text-slate-600" />
                                                }
                                                {/* unread badge */}
                                                {badge > 0 && !isActive && (
                                                    <span className="absolute -right-1.5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
                                                        {badge}
                                                    </span>
                                                )}
                                            </span>
                                            {/* active dot */}
                                            <span className={`mt-1 h-1 w-1 rounded-full bg-teal-500 transition-all duration-300 ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"}`} />
                                        </span>

                                        {/* label */}
                                        <span className={`text-[10px] font-semibold tracking-wide transition-all duration-200 ${
                                            isActive ? "text-teal-700" : "text-slate-400 group-hover:text-slate-500"
                                        }`}>
                                            {label}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>
        </nav>

    );
}
