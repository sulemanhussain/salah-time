import { AiOutlineHome } from 'react-icons/ai';
import { MdOutlineLocationOn } from 'react-icons/md';
import { IoSettingsOutline } from 'react-icons/io5';
import { NavLink } from 'react-router-dom';

export default function NavigationBar() {
    const navItemBaseClass = "group relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition duration-200";

    return (
        <nav className='fixed bottom-4 left-0 right-0 z-40 px-3'>
            <div className='mx-auto w-full max-w-md'>
                <div className='relative overflow-hidden rounded-2xl border border-white/60 bg-white/85 p-2 shadow-[0_20px_45px_-22px_rgba(2,132,199,0.45)] backdrop-blur-xl'>
                    <div className='pointer-events-none absolute -left-10 top-0 h-16 w-24 rounded-full bg-sky-100/70 blur-xl'></div>
                    <div className='pointer-events-none absolute -right-8 bottom-0 h-14 w-24 rounded-full bg-cyan-100/70 blur-xl'></div>

                    <div className='relative grid grid-cols-3 gap-1'>
                        <NavLink
                            to="/home"
                            className={({ isActive }) =>
                                `${navItemBaseClass} ${isActive ? "bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-200" : "text-slate-500 hover:bg-slate-100/70 hover:text-sky-600"}`
                            }
                        >
                            <AiOutlineHome size={22} />
                            <span>Home</span>
                        </NavLink>

                        <NavLink
                            to="/app"
                            className={({ isActive }) =>
                                `${navItemBaseClass} ${isActive ? "bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-200" : "text-slate-500 hover:bg-slate-100/70 hover:text-sky-600"}`
                            }
                        >
                            <MdOutlineLocationOn size={22} />
                            <span>Map</span>
                        </NavLink>

                        <NavLink
                            to="/settings"
                            className={({ isActive }) =>
                                `${navItemBaseClass} ${isActive ? "bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-200" : "text-slate-500 hover:bg-slate-100/70 hover:text-sky-600"}`
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
