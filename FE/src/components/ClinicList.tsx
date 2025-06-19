import { useEffect, useState } from "react";
import { fetchAllClinics } from "../utils/fetchClinic";
import { MapPin, Phone, Clock, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Clinic {
  _id: string;
  name: string;
  address: string;
  city: string;
  phone: number;
  email: string;
  description: string;
  images: string[];
  openingHours?: string;
}

const ClinicList = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [visibleCount] = useState(4);

  useEffect(() => {
    const load = async () => {
      const data = await fetchAllClinics();
      setClinics(data);
    };
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-14">
      {/* Tiêu đề */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          PetWell Clinic Locations
        </h2>
        <p className="text-gray-600 text-base max-w-xl mx-auto">
          With our network of clinics across the city, we're always ready to
          serve you and your pets at the most convenient location
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {clinics.slice(0, visibleCount).map((clinic) => (
          <div
            key={clinic._id}
            className="rounded-xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition"
          >
            <div className="relative h-36 bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
              {clinic.images?.[0] ? (
                <img
                  src={Array.isArray(clinic.images) ? clinic.images[0] : clinic.images}
                  alt={clinic.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                "No Image"
              )}
            </div>

            <div className="p-4 space-y-2">
              <h3 className="text-base font-semibold text-gray-800">
                {clinic.name}
              </h3>

              <div className="flex items-start text-sm text-gray-600">
                <MapPin className="w-4 h-4 mt-1 mr-2 text-orange-500" />
                <span>
                  {clinic.address}, {clinic.city}
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-orange-500" />
                <span>{clinic.phone}</span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2 text-orange-500" />
                <span>{clinic.openingHours || "8:00 AM – 9:00 PM"}</span>
              </div>

              <div className="flex items-center justify-between pt-4 gap-2">
                <button className="bg-orange-500 text-white px-4 py-1.5 text-sm rounded shadow hover:bg-orange-600">
                  Book Now
                </button>
                <button className="text-sm text-gray-700 hover:underline">
                  Directions
                </button>
                <Link
                  to={`/clinic/view-detail-clinic/${clinic._id}`}
                  className="text-sm text-orange-500 border border-orange-500 px-3 py-1 rounded hover:bg-orange-50 transition"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nút View More */}
      {visibleCount < clinics.length && (
        <div className="flex justify-center mt-10">
          <Link
            to="/clinics"
            className="flex items-center gap-2 border border-orange-500 text-orange-500 px-5 py-2 rounded-full hover:bg-orange-50 transition"
          >
            View All Locations <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default ClinicList;