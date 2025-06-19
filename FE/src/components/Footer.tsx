import { Link } from "react-router-dom"
import logo from "../assets/logo.jpg"
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-white mt-10">
            <div className="container mx-auto pt-14 px-48">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                <img src={logo || "/placeholder.svg"} alt="PetWell" className="w-8 h-8 rounded-full object-cover" />
                            </div>
                            <h2 className="text-xl font-bold">PetWell</h2>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Comprehensive healthcare for your pets with experienced veterinarians and modern equipment.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-blue-500 transition-colors"
                            >
                                <FacebookIcon />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-pink-500 transition-colors"
                            >
                                <InstagramIcon />
                            </a>

                        </div>
                    </div>

                    {/* Services */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Services</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/services/general-checkup" className="text-gray-300 hover:text-orange-400 transition-colors">
                                    General Check-up
                                </Link>
                            </li>
                            <li>
                                <Link to="/services/vaccinations" className="text-gray-300 hover:text-orange-400 transition-colors">
                                    Vaccinations
                                </Link>
                            </li>
                            <li>
                                <Link to="/services/surgery" className="text-gray-300 hover:text-orange-400 transition-colors">
                                    Surgery
                                </Link>
                            </li>
                            <li>
                                <Link to="/services/dental-care" className="text-gray-300 hover:text-orange-400 transition-colors">
                                    Dental Care
                                </Link>
                            </li>
                            <li>
                                <Link to="/services/spa-grooming" className="text-gray-300 hover:text-orange-400 transition-colors">
                                    Spa & Grooming
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/" className="text-gray-300 hover:text-orange-400 transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-gray-300 hover:text-orange-400 transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/services" className="text-gray-300 hover:text-orange-400 transition-colors">
                                    Services
                                </Link>
                            </li>
                            <li>
                                <Link to="/doctors" className="text-gray-300 hover:text-orange-400 transition-colors">
                                    Our Doctors
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-gray-300 hover:text-orange-400 transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Contact Info</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-2">
                                <LocationOnIcon />
                                <span className="text-gray-300">
                                    600 Nguyen Van Cu Extension, An Binh Ward, Binh Thuy District, Can Tho City
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <LocalPhoneIcon />
                                <a href="tel:+15551234567" className="text-gray-300 hover:text-orange-400 transition-colors">
                                    +1 (555) 123-4567
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <MailOutlineIcon />
                                <a href="mailto:info@petwell.com" className="text-gray-300 hover:text-orange-400 transition-colors">
                                    info@petwell.com
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <AccessTimeIcon />
                                <span className="text-gray-300">Mon - Sun: 8:00 AM - 8:00 PM</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-700 mt-8 pt-6 text-center">
                    <p className="text-sm text-gray-400">© 2025 PetWell. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
