import { Link } from "react-router-dom";
import logo from "../assets/logo.jpg";
import AccountMenu from "./AccountMenu";
import MenuHeaderDoctor from "./MenuHeaderDoctor";


const HeaderDoctor = () => {
    return (
        <header className="h-24 lg:h-20 shadow-md sticky top-0 bg-[#fdf1e6] flex items-center">
            <div className="container mx-auto flex items-center justify-between px-4">
                {/* Logo */}
                <Link to={"/"} className="flex items-center">
                    <img
                        src={logo}
                        width={60}
                        height={60}
                        alt='logo'
                        className='rounded-full'
                    />
                </Link>


                {/* Menu */}
                <div className="flex justify-center w-full">
                    <MenuHeaderDoctor />
                </div>
                {/* account */}
                <div>
                    <AccountMenu />
                </div>
            </div>
        </header>
    );
};


export default HeaderDoctor;