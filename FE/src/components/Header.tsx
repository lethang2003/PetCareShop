import { Link } from "react-router-dom"
import logo from "../assets/logo.jpg"
import MenuHeader from "./MenuHeader"
import AccountMenu from "./AccountMenu"

const Header = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-20 h-14 shadow-md bg-[rgb(249,248,247)] flex items-center">
            <div className="container mx-auto flex items-center justify-between px-48">
                {/* Logo */}
                <Link to={"/"} className="flex items-center">
                    <img src={logo || "/placeholder.svg"} width={40} height={40} alt="logo" className="rounded-full" />
                </Link>

                {/* Menu */}
                <div className="flex justify-center">
                    <MenuHeader />
                </div>

                {/* Account Section */}
                <div className="flex items-center">
                    <AccountMenu />
                </div>
            </div>
        </header>
    )
}

export default Header
