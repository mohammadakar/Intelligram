import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaSearch, FaPlusSquare, FaVideo, FaUser } from 'react-icons/fa';

const Nav = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? "text-blue-600" : "text-gray-600";

    return (
        <nav className="fixed bottom-0 w-full bg-gradient-to-tr from-green-400 to-purple-600 p-0.5 border-t flex justify-around py-3">
            <Link to="/home" className={`text-2xl hover:text-gray-800 ${isActive("/home")}`}>
                <FaHome />
            </Link>
            <Link to="/search" className={`text-2xl hover:text-gray-800 ${isActive("/search")}`}>
                <FaSearch />
            </Link>
            <Link to="/create" className={`text-2xl hover:text-gray-800 ${isActive("/create")}`}>
                <FaPlusSquare />
            </Link>
            <Link to="/reels" className={`text-2xl hover:text-gray-800 ${isActive("/reels")}`}>
                <FaVideo />
            </Link>
            <Link to="/profile" className={`text-2xl hover:text-gray-800 ${isActive("/profile")}`}>
                <FaUser />
            </Link>
        </nav>
    );
};

export default Nav;
