import { AiOutlineHome } from 'react-icons/ai';
import { MdOutlineLocationOn } from 'react-icons/md';
import { IoSettingsOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';

export default function NavigationBar() {
    return (
        <nav className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-inner'>
        <div className='mx-auto flex max-w-md justify-between px-8 py-3'>
          <Link to="/login" className='flex flex-col items-center text-gray-500 hover:text-blue-600'>
            {/* <span className='text-2xl'>🏠</span> */}
            <AiOutlineHome size={28} />
            <span className='text-xs mt-1'>Home</span>
          </Link>
          <Link to="/home" className='flex flex-col items-center text-gray-500 hover:text-blue-600'>
            {/* <span className='text-2xl'>📍</span> */}
            <MdOutlineLocationOn size={28} />
            <span className='text-xs mt-1'>Map</span>
          </Link>
          <button className='flex flex-col items-center text-gray-500 hover:text-blue-600'>
            <IoSettingsOutline size={28}/>
            <span className='text-xs mt-1'>Settings</span>
          </button>
        </div>
      </nav>
    )
}