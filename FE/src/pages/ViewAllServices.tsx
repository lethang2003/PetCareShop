import { useEffect, useState } from "react";
import { fetchServiceCarousel, Service } from "../utils/fetchService";
import Header from "@components/Header";
import Footer from "@components/Footer";
import { Filter } from "lucide-react";
import { Star } from "lucide-react";
import { CheckCircle, Zap, Clock, Heart } from "lucide-react";

const categories = [
  "All Services",
  "Preventive Care",
  "Emergency Care",
  "Surgery",
  "Dental Care",
  "Grooming",
  "Specialized Care",
];

const categoryColors: Record<string, string> = {
  "Preventive Care": "bg-[#19cd5b]",
  "Emergency Care": "bg-[#ff5252]",
  "Surgery": "bg-[#3b82f6]",
  "Dental Care": "bg-[#f59e42]",
  "Grooming": "bg-[#a855f7]",
  "Specialized Care": "bg-[#06b6d4]",
  "All Services": "bg-gray-400",
  Other: "bg-gray-400",
};

const ViewAllServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Services");

  useEffect(() => {
    fetchServiceCarousel().then(setServices);
  }, []);

  const filteredServices = services.filter((service) => {
    const matchCategory =
      selectedCategory === "All Services" ||
      service.category === selectedCategory;
    const matchSearch =
      service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <>
        <div className="min-h-screen pb-20">
        <Header />
        <div className="bg-gradient-to-b from-orange-100 to-orange-50 py-12 mb-0 mt-14">
            <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Our Services</h1>
            <p className="text-gray-700 max-w-2xl mx-auto mb-8">
                Comprehensive veterinary care for your beloved pets. From routine check-ups to specialized treatments, we're here to keep your furry friends healthy and happy.
            </p>
            <div className="flex justify-center gap-2 mb-8">
                <input
                type="text"
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded px-4 py-2 w-64"
                />
                <button className="border px-4 py-2 rounded bg-white text-gray-700 font-medium hover:bg-orange-100 flex items-center gap-2">
                <Filter className="w-5 h-5" /> Filter
                </button>
            </div>
            </div>
        </div>
        {/* Category Tabs */}
        <div className="bg-white border-b-2 border-gray-600">
        <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-8 py-5">
            {categories.map((cat) => (
                <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-lg font-medium transition
                    ${
                    selectedCategory === cat
                        ? "bg-orange-500 text-white shadow"
                        : "bg-white text-black"
                    }
                `}
                >
                {cat}
                </button>
            ))}
            </div>
        </div>
        </div>
        {/* Service Cards */}
        <div className="max-w-7xl mx-auto px-4 mt-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredServices.length === 0 && (
                <div className="col-span-4 text-center text-gray-500 py-10">
                No services found.
                </div>
            )}
            {filteredServices.map((service) => (
                <div
                    key={service.id}
                    className="rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden flex flex-col transition hover:shadow-lg"
                >
                    <div className="relative h-36 bg-gray-50 flex items-center justify-center">
                    {service.imageUrl ? (
                        <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-gray-400 text-sm">No Image</span>
                    )}
                    {/* Category badge (luôn hiển thị) */}
                    <span
                    className={`absolute top-3 left-3 text-white text-xs px-3 py-1 rounded-full font-medium shadow ${
                        categoryColors[service.category as string] || categoryColors.Other
                    }`}
                    >
                    {service.category || "Other"}
                    </span>
                    {/* Popular badge với icon lucide-react */}
                    <span className="absolute top-3 right-3 bg-orange-400 text-white text-xs px-3 py-1 rounded-full shadow flex items-center gap-1 font-medium">
                        <Star className="w-3.5 h-3.5 fill-white text-white" strokeWidth={2} />
                        Popular
                    </span>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 flex-1">{service.description}</p>
                    <div className="flex items-center text-gray-500 text-xs mb-4 gap-4">
                        {/* Thời gian (set cứng) */}
                        <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        30-60 min
                        </span>
                        {/* Giá */}
                        {service.price !== undefined && (
                        <span className="flex items-center gap-1">
                            <span className="text-orange-500 font-medium">
                            {service.price > 0 ? `$${service.price}` : "Free"}
                            </span>
                            <span className="text-gray-400">starting</span>
                        </span>
                        )}
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                        <a
                        href={service.link}
                        className="text-sm text-gray-800 font-medium hover:underline"
                        >
                        Learn More
                        </a>
                        <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow transition">
                        Book Now
                        </button>
                    </div>
                    </div>
                </div>
                ))}
            </div>
        </div>

        {/* Why Choose PetWell Section */}
        <div className="bg-[#fafbfc] py-16 mt-16">
            <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Why Choose PetWell?</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                We're committed to providing the highest quality veterinary care with compassion and expertise.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                {/* Experienced Team */}
                <div className="flex flex-col items-center text-center">
                <span className="bg-orange-100 rounded-full p-4 mb-4">
                    <CheckCircle className="text-orange-400 w-8 h-8" />
                </span>
                <h3 className="font-semibold text-lg mb-2">Experienced Team</h3>
                <p className="text-gray-500 text-sm">
                    Our veterinarians have years of experience in pet healthcare.
                </p>
                </div>
                {/* Modern Equipment */}
                <div className="flex flex-col items-center text-center">
                <span className="bg-orange-100 rounded-full p-4 mb-4">
                    <Zap className="text-orange-400 w-8 h-8" />
                </span>
                <h3 className="font-semibold text-lg mb-2">Modern Equipment</h3>
                <p className="text-gray-500 text-sm">
                    State-of-the-art medical equipment for accurate diagnosis.
                </p>
                </div>
                {/* 24/7 Emergency */}
                <div className="flex flex-col items-center text-center">
                <span className="bg-orange-100 rounded-full p-4 mb-4">
                    <Clock className="text-orange-400 w-8 h-8" />
                </span>
                <h3 className="font-semibold text-lg mb-2">24/7 Emergency</h3>
                <p className="text-gray-500 text-sm">
                    Quick emergency care when your pet needs it most.
                </p>
                </div>
                {/* Compassionate Care */}
                <div className="flex flex-col items-center text-center">
                <span className="bg-orange-100 rounded-full p-4 mb-4">
                    <Heart className="text-orange-400 w-8 h-8" />
                </span>
                <h3 className="font-semibold text-lg mb-2">Compassionate Care</h3>
                <p className="text-gray-500 text-sm">
                    We treat every pet with love and care as if they were our own.
                </p>
                </div>
            </div>
            </div>
        </div>
        </div>
        <Footer />
    </>
  );
};

export default ViewAllServices;