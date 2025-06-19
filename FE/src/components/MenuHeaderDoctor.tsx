import { Link } from 'react-router-dom';


const MenuHeaderDoctor = () => {
    return (
        <nav className="flex space-x-5 text-gray-700 font-medium items-center">
            <Link className='hover:bg-white px-3 py-2 rounded' to="/doctor/workSchedulesDoctor">Doctor Schedule</Link>
        </nav>
    );
};


export default MenuHeaderDoctor;