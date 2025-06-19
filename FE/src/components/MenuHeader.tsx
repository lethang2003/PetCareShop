import { Link, useLocation } from 'react-router-dom';

const MenuHeader = () => {
    const location = useLocation();

    const menuItems = [
        { label: "Home", path: "/" },
        { label: "About Us", path: "/about" },
        { label: "Services", path: "/services" },
        { label: "Clinics", path: "/clinics" },
        { label: "Specialists", path: "/specialist" },
        { label: "Forum", path: "/general" },
        { label: "Contact", path: "/contact" },
    ];

    return (
        <nav className="flex space-x-5 text-xm font-normal items-center">
            {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`px-3 py-2 rounded transition-colors ${isActive ? "text-orange-500 font-semibold" : "text-gray-700 hover:bg-white"
                            }`}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
};

export default MenuHeader;
