import React, { useEffect, useState } from "react";
import { fetchServices } from "../utils/fetchCard";

interface Service {
  id: string;
  name: string;
  imageUrl: string;
}

const SpecialtyGrid = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchServices();
      console.log("Data from API:", data); // Kiểm tra kỹ cấu trúc
      setServices(Array.isArray(data) ? data : []); // Đảm bảo luôn là mảng
    };
    load();
  }, []);

  return (
    <div className="text-center py-10 bg-white">
      <h2 className="text-2xl font-bold text-blue-600 mb-10 tracking-wide">
        CHUYÊN KHOA CỦA CHÚNG TÔI
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 justify-items-center">
        {services.map((service) => (
          <div
            key={service.id}
            className="flex flex-col items-center hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="w-36 h-36 p-1 bg-gradient-to-tr from-blue-300 to-blue-500 rounded-[40%] overflow-hidden mb-3">
              {service.imageUrl ? (
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="w-full h-full object-cover rounded-[35%]"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-[35%] flex items-center justify-center text-xs text-gray-500">
                  No Image
                </div>
              )}
            </div>
            <p className="text-blue-600 font-semibold text-center">
              {service.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecialtyGrid;
