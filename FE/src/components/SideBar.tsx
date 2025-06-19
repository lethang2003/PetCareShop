import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import { fetchServiceCarousel, Service } from "../utils/fetchService"; 


function Sidebar() {
  const [menuItems, setMenuItems] = useState<Service[]>([]);
  const fetchdataService = async () => {
    try {
      const data = await fetchServiceCarousel(); 
      setMenuItems(data);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };
  useEffect(() => {
    fetchdataService(); 
  }, []);


  return (
    <div className="w-64 h-[770px] bg-[#fdf1e6] shadow-lg p-6 overflow-y-auto pt-20">
      <div className="border-b border-gray-200 mb-6"></div>
      <h2 className="text-xl text-gray-800 font-bold mb-6 flex items-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 mr-2 text-orange-500"
        >
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
        Các Dịch Vụ
      </h2>

      <ul className="space-y-3">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className="mb-2 transform transition-transform duration-200 hover:translate-x-1"
          >
            <Link
              to={`/service/view-detail-service/${item.id}`}
              className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:text-orange-500 hover:bg-white transition-colors"
            >   
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-orange-500"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
              <span className="font-medium">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6 border-t border-gray-200 mt-6">
        <p className="text-sm text-gray-600 text-center">
          © 2025 Pet Well
          <br />
          <span className="text-orange-500">Chăm sóc thú cưng tận tâm</span>
        </p>
      </div>
    </div>
  );
}


export default Sidebar;