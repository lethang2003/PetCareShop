import { useEffect, useState } from "react";
import { fetchServiceCarousel, Service } from "../utils/fetchService";
import { ChevronRight } from "lucide-react";

const ServiceList: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServiceCarousel().then((data) => {
      setServices(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-10">Loading services...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-14">
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Our Services
        </h2>
        <p className="text-gray-600 text-base max-w-xl mx-auto">
          We provide comprehensive healthcare services for your pets, from routine check-ups to complex surgeries.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.slice(0, 4).map((service) => (
          <div
            key={service.id}
            className="rounded-xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition flex flex-col"
          >
            <div className="relative h-36 bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
              {service.imageUrl ? (
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                "No Image"
              )}
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-base font-semibold text-gray-800 mb-1">
                {service.name}
              </h3>
              <p className="text-sm text-gray-600 flex-1">
                {service.description}
              </p>
              <div className="flex items-center justify-between pt-4">
                <a
                  href={service.link}
                  className="text-sm text-orange-500 hover:underline font-medium flex items-center"
                >
                  Learn More <span className="ml-1">→</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Services Button */}
      <div className="flex justify-center mt-10">
        <a
          href="/services"
          className="flex items-center gap-2 border border-orange-500 text-orange-500 px-5 py-2 rounded-full hover:bg-orange-50 transition"
        >
          View All Services <ChevronRight className="w-4 h-4"/>
        </a>
      </div>
    </div>
  );
};

export default ServiceList;