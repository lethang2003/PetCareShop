import { useEffect, useState } from "react";
import { fetchAllClinics } from "../utils/fetchClinic";
import { MapPin, Clock, Phone, Star, List as ListIcon, Map as MapIcon } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

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
  rating?: number;
  reviewCount?: number;
  services?: string[];
  isOpen?: boolean;
}

const ClinicCard: React.FC<{ clinic: Clinic }> = ({ clinic }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-lg border shadow w-full flex flex-col overflow-hidden transition duration-200 ease-in-out hover:shadow-xl">
      <div className="relative h-36 bg-gray-100">
        {clinic.images ? (
          <img
            src={Array.isArray(clinic.images) ? clinic.images[0] : clinic.images}
            alt={clinic.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-gray-400 flex items-center justify-center h-full">
            No Image
          </span>
        )}
        <span className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-0.5 rounded">
          {clinic.isOpen ? "Open" : "Closed"}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-base">{clinic.name}</span>
          <span className="flex items-center gap-1 text-yellow-500 text-sm font-semibold">
            <Star className="w-4 h-4 fill-yellow-500" />
            {clinic.rating ? clinic.rating.toFixed(1) : "0"}
            <span className="text-gray-500 font-normal ml-1">
              ({clinic.reviewCount || 0})
            </span>
          </span>
        </div>
        <div className="flex items-center text-gray-600 text-sm mb-1">
          <MapPin className="w-4 h-4 mr-1" />
          <span>
            {clinic.address}, {clinic.city}
          </span>
        </div>
        <div className="flex items-center text-gray-600 text-sm mb-1">
          <Clock className="w-4 h-4 mr-1" />
          <span>{clinic.openingHours || "8:00 AM – 9:00 PM"}</span>
        </div>
        <div className="flex flex-wrap gap-2 my-2">
          {(clinic.services || []).slice(0, 3).map((s, idx) => (
            <span
              key={idx}
              className="bg-gray-100 text-xs px-2 py-0.5 rounded"
            >
              {s}
            </span>
          ))}
          {clinic.services && clinic.services.length > 3 && (
            <span className="bg-gray-100 text-xs px-2 py-0.5 rounded">
              +{clinic.services.length - 3} more
            </span>
          )}
        </div>
        <div className="flex gap-2 mt-auto flex-wrap">
          <button className="flex-1 border rounded px-2 py-1 text-sm flex items-center justify-center gap-1">
            <Phone className="w-4 h-4" /> Call
          </button>
          <button className="flex-1 border rounded px-2 py-1 text-sm">
            Directions
          </button>
          <button
            className="flex-1 border border-orange-500 text-orange-500 rounded px-2 py-1 text-sm font-semibold hover:bg-orange-50"
            onClick={() => {
              window.scrollTo(0, 0);
              navigate(`/clinic/view-detail-clinic/${clinic._id}`);
            }}
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

const ViewAllClinics = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  useEffect(() => {
    fetchAllClinics().then(setClinics);
  }, []);

  // Lấy danh sách service duy nhất
  const allServices = Array.from(
    new Set(
      clinics.flatMap((c) => c.services || [])
    )
  );

  // Lọc clinic theo tên
  const filteredClinics = clinics.filter((clinic) => {
    const keyword = search.toLowerCase();
    const matchLocation = location
      ? clinic.city.replace(/[\u0300-\u036f]/g, "").toLowerCase() === location.toLowerCase()
      : true;
    const matchService = service
      ? (clinic.services || []).includes(service)
      : true;
    return (
      matchLocation &&
      matchService &&
      (
        clinic.name.toLowerCase().includes(keyword) ||
        clinic.address.toLowerCase().includes(keyword) ||
        clinic.city.toLowerCase().includes(keyword) ||
        clinic.description.toLowerCase().includes(keyword) ||
        (clinic.services && clinic.services.join(" ").toLowerCase().includes(keyword))
      )
    );
  });

  return (
    <>
      <Header />
      <div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-400 py-12 px-4 mt-14">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-4xl font-bold mb-3">
              Find Your Nearest PetWell Clinic
            </h1>
            <p className="text-lg mb-8">
              Quality veterinary care across Vietnam with 12 convenient locations
            </p>
            <div className="flex justify-center gap-12 mb-8">
              <div>
                <div className="text-3xl font-bold">{clinics.length}</div>
                <div className="text-sm">Clinic Locations</div>
              </div>
              <div>
                <div className="text-3xl font-bold">50+</div>
                <div className="text-sm">Expert Veterinarians</div>
              </div>
              <div>
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm">Emergency Care</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex flex-nowrap gap-2 items-center justify-center max-w-3xl mx-auto">
              <input
                type="text"
                placeholder="Search clinics..."
                className="border rounded px-3 py-2 w-48 text-gray-900"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="border rounded px-3 py-2 w-44 text-gray-900"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">All Locations</option>
                <option>Ha Noi</option>
                <option>Hue</option>
                <option>Lai Chau</option>
                <option>Dien Bien</option>
                <option>Son La</option>
                <option>Lang Son</option>
                <option>Quang Ninh</option>
                <option>Thanh Hoa</option>
                <option>Nghe An</option>
                <option>Ha Tinh</option>
                <option>Cao Bang</option>
                <option>Tuyen Quang</option>
                <option>Lao Cai</option>
                <option>Phu Tho</option>
                <option>Bac Ninh</option>
                <option>Hung Yen</option>
                <option>Hai Phong</option>
                <option>Ninh Binh</option>
                <option>Quang Tri</option>
                <option>Da Nang</option>
                <option>Quang Ngai</option>
                <option>Gia Lai</option>
                <option>Khanh Hoa</option>
                <option>Lam Dong</option>
                <option>Dak Lak</option>
                <option>Ho Chi Minh</option>
                <option>Dong Nai</option>
                <option>Tay Ninh</option>
                <option>Can Tho</option>
                <option>Vinh Long</option>
                <option>Dong Thap</option>
                <option>Ca Mau</option>
                <option>An Giang</option>
              </select>
              <select
                className="border rounded px-3 py-2 w-44 text-gray-900"
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                <option value="">All Services</option>
                {allServices.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium border transition
                  ${viewMode === "list"
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-black hover:bg-gray-100"}
                `}
                onClick={() => setViewMode("list")}
              >
                <ListIcon size={20} className={viewMode === "list" ? "text-white" : "text-black"} />
                List
              </button>
              <button
                className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium border transition
                  ${viewMode === "map"
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-black hover:bg-gray-100"}
                `}
                onClick={() => setViewMode("map")}
              >
                <MapIcon size={20} className={viewMode === "map" ? "text-white" : "text-black"} />
                Map
              </button>
            </div>
          </div>
        </div>
        {/* Danh sách clinic nền trắng */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {filteredClinics.length} Clinics Found
            </h2>
            <select className="border rounded px-3 py-2">
              <option>Nearest First</option>
              <option>Highest Rated</option>
              {/* Thêm các option sort khác nếu cần */}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredClinics.map((clinic) => (
              <ClinicCard key={clinic._id} clinic={clinic} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ViewAllClinics;