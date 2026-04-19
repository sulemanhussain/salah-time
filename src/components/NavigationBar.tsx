import { AiOutlineHome } from 'react-icons/ai';
import { MdOutlineLocationOn } from 'react-icons/md';
import { IoSettingsOutline } from 'react-icons/io5';
import { NavLink } from 'react-router-dom';

export default function NavigationBar() {
    const navItemBaseClass = "group relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition duration-200";
    const navItemActiveClass = "bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 text-white shadow-[0_12px_26px_-14px_rgba(14,116,144,0.9)]";
    const navItemInactiveClass = "text-slate-500 hover:bg-cyan-50/80 hover:text-cyan-700";

    return (
        <nav className='fixed bottom-4 left-0 right-0 z-40 px-3'>
            <div className='mx-auto w-full max-w-md'>
                <div className='relative overflow-hidden rounded-2xl border border-cyan-100/90 bg-white/90 p-2 shadow-[0_20px_45px_-22px_rgba(14,116,144,0.5)] backdrop-blur-xl'>
                    <div className='pointer-events-none absolute -left-10 top-0 h-16 w-24 rounded-full bg-teal-100/80 blur-xl'></div>
                    <div className='pointer-events-none absolute -right-8 bottom-0 h-14 w-24 rounded-full bg-cyan-100/80 blur-xl'></div>

                    <div className='relative grid grid-cols-3 gap-1'>
                        <NavLink
                            to="/home"
                            className={({ isActive }) =>
                                `${navItemBaseClass} ${isActive ? navItemActiveClass : navItemInactiveClass}`
                            }
                        >
                            <AiOutlineHome size={22} />
                            <span>Home</span>
                        </NavLink>

                        <NavLink
                            to="/app"
                            className={({ isActive }) =>
                                `${navItemBaseClass} ${isActive ? navItemActiveClass : navItemInactiveClass}`
                            }
                        >
                            <MdOutlineLocationOn size={22} />
                            <span>Map</span>
                        </NavLink>

                        <NavLink
                            to="/settings"
                            className={({ isActive }) =>
                                `${navItemBaseClass} ${isActive ? navItemActiveClass : navItemInactiveClass}`
                            }
                        >
                            <IoSettingsOutline size={22} />
                            <span>Settings</span>
                        </NavLink>
                    </div>
                </div>
            </div>
        </nav>
    )
}
