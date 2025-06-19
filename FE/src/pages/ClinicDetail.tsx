import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClinicById } from "../utils/fetchClinic";
import { fetchServiceCarousel, Service } from "../utils/fetchService";
import { fetchAllUsers } from "@utils/UsersAPI";
import { fetchReviews, Review } from "@utils/fetchReviews";
import SummaryApi from "../common/SummarryAPI";
import Axios from "../utils/Axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Clock,
  Image as ImageIcon,
  Calendar,
  Stethoscope,
  Scissors,
  HeartPulse,
  ShieldCheck,
  Microscope,
  SmilePlus,
} from "lucide-react";

const TABS = [
  { label: "Services & Pricing", key: "services" },
  { label: "Our Doctors", key: "doctors" },
  { label: "Reviews", key: "reviews" },
];

const ClinicDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("services");
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [doctorReviews, setDoctorReviews] = useState<Record<string, Review[]>>(
    {}
  );

  useEffect(() => {
    if (id) {
      getClinicById(id)
        .then((data) => setClinic(data))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === "services") {
      fetchServiceCarousel().then(setServices);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "doctors" && id) {
      Axios(SummaryApi.clinics.getDoctorsByClinic(id))
        .then((res) => {
          const doctorList = res.data.data || [];
          setDoctors(doctorList);
          // Fetch reviews for each doctor
          doctorList.forEach(async (doctor: any) => {
            try {
              const res = await Axios(
                SummaryApi.review.getDoctorReviews(doctor._id)
              );
              console.log("check doctor ", res.data);
              setDoctorReviews((prev) => ({
                ...prev,
                [doctor._id]: res.data || [],
              }));
            } catch {
              setDoctorReviews((prev) => ({ ...prev, [doctor._id]: [] }));
            }
          });
        })
        .catch(() => setDoctors([]));
    }
  }, [activeTab, id]);

  useEffect(() => {
    if (activeTab === "reviews") {
      fetchReviews()
        .then((data) => {
          setReviews(data);
        })
        .catch(() => setReviews([]));
    }
  }, [activeTab]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!clinic) {
    return (
      <>
        <Header />
        <div className="text-center mt-10 text-gray-500">No Clinic Found</div>
        <Footer />
      </>
    );
  }

  // Xử lý ảnh
  const images: string[] =
    clinic.images && clinic.images.length > 0 ? clinic.images : [];
  const mainImage = selectedImage || images[0] || "";
  const subImages = images.filter((img) => img !== mainImage).slice(0, 3);

  // Hàm trả về icon theo category dịch vụ
  const getServiceIcon = (category: string) => {
    switch (category) {
      case "Preventive Care":
        return <Stethoscope className="w-6 h-6 text-blue-500" />;
      case "Emergency Care":
        return <HeartPulse className="w-6 h-6 text-blue-500" />;
      case "Dental Care":
        return <SmilePlus className="w-6 h-6 text-blue-500" />;
      case "Grooming":
        return <Scissors className="w-6 h-6 text-blue-500" />;
      case "Specialized Care":
        return <Microscope className="w-6 h-6 text-blue-500" />;
      case "Surgery":
        return <ShieldCheck className="w-6 h-6 text-blue-500" />;
      default:
        return <Stethoscope className="w-6 h-6 text-blue-500" />;
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto p-8 pt-20">
        {/* Nút Back to Clinics */}
        <button
          className="mb-6 flex items-center gap-2 text-black hover:underline font-medium"
          onClick={() => navigate("/clinics")}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Clinics
        </button>
        <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] h-[1.5px] bg-gray-600 mb-8 shadow" />
        <div className="flex flex-col md:flex-row gap-8">
          {/* Hình ảnh */}
          <div className="flex flex-col gap-4 w-full md:w-1/2">
            {/* Ảnh lớn */}
            <div
              className={`bg-gray-100 rounded-lg flex items-center justify-center aspect-[4/3] overflow-hidden border-1 ${
                clinic.status === "open" ? "border-green-500" : "border-black"
              }`}
            >
              {mainImage ? (
                <img
                  src={mainImage}
                  alt="Clinic"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <ImageIcon className="w-16 h-16 text-gray-300" />
                </div>
              )}
            </div>
            {/* Ảnh nhỏ */}
            <div className="grid grid-cols-3 gap-4">
              {subImages.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className={`bg-gray-100 rounded-lg flex items-center justify-center aspect-[4/3] overflow-hidden border-2 transition-all duration-150
                    ${
                      mainImage === img && img
                        ? clinic.status === "open"
                          ? "border-green-500"
                          : "border-black"
                        : "border-transparent"
                    }
                    hover:border-orange-400`}
                  onClick={() => img && setSelectedImage(img)}
                  tabIndex={0}
                >
                  {img ? (
                    <img
                      src={img}
                      alt={`Clinic sub ${i + 1}`}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
          </div>
          {/* Thông tin */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                  ${
                    clinic.status === "open"
                      ? "bg-green-100 text-green-700"
                      : "bg-black text-white"
                  }
                `}
              >
                {clinic.status === "open" ? "Open" : "Closed"}
              </span>
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold">
                {clinic.rating?.toFixed(1) || "4.9"}
              </span>
              <span className="text-gray-400 text-sm">
                ({clinic.reviewCount || 324} reviews)
              </span>
            </div>
            <h1 className="text-2xl font-bold">{clinic.name}</h1>
            <p className="text-gray-600">{clinic.description}</p>
            <div className="flex flex-col gap-1 text-gray-700 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{clinic.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+84 {clinic.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{clinic.openingHours || "24/7"}</span>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-semibold flex items-center gap-2"
                onClick={() => navigate("/viewproduct")}
              >
                <Calendar className="w-4 h-4" /> View Product
              </button>
              <button
                className="border border-orange-500 text-orange-500 px-6 py-2 rounded font-semibold hover:bg-orange-50 flex items-center gap-2"
                //   onClick={() =>
                //     window.open(
                //       `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`,
                //       "_blank"
                //     )
                //   }
              >
                <MapPin className="w-4 h-4" /> Get Directions
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10">
          <div className="flex border-b border-gray-200 mb-4">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`flex-1 px-6 py-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.key
                      ? "border-b-2 border-orange-500 bg-white text-black"
                      : "bg-gray-50 text-gray-400"
                  }
                  `}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {activeTab === "services" && (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  Services & Pricing
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="border border-gray-200 rounded-lg px-4 py-3 flex flex-col gap-1 hover:shadow transition"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getServiceIcon(service.category)}
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <span className="text-orange-500 text-sm font-semibold">
                        From ${service.price}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {activeTab === "doctors" && (
              <>
                {doctors.length === 0 ? (
                  <div className="text-gray-400 text-center py-10">
                    No doctors in this clinic yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {doctors.map((doctor) => {
                      const reviews = doctorReviews[doctor._id] || [];
                      console.log("check reviews", reviews);

                      const reviewCount = reviews.length;
                      const avgRating =
                        reviewCount > 0
                          ? (
                              reviews.reduce((sum, r) => sum + r.rating, 0) /
                              reviewCount
                            ).toFixed(1)
                          : "0";
                      return (
                        <div
                          key={doctor.id || doctor._id}
                          className="border rounded-lg p-4 flex flex-col items-center"
                        >
                          <div className="w-24 h-24 bg-gray-200 rounded-full mb-3 flex items-center justify-center">
                            {doctor.avatar ? (
                              <img
                                src={doctor.avatar}
                                alt={doctor.fullName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <Stethoscope className="w-12 h-12 text-blue-500" />
                            )}
                          </div>
                          <div className="font-bold text-lg text-center">
                            {doctor.fullName}
                          </div>
                          <div className="text-gray-500 text-center">
                            Veterinarian
                          </div>
                          <div className="text-gray-400 text-center">
                            {doctor.experience
                              ? `${doctor.experience} years experience`
                              : "15 years experience"}
                          </div>
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold">{avgRating}</span>
                            <span className="text-gray-400 text-sm ml-2">
                              ({reviewCount} reviews)
                            </span>
                          </div>
                          {/* Hiển thị review của bác sĩ */}
                          <div className="w-full mt-3">
                            {reviews.length > 0 ? (
                              <div className="divide-y">
                                {reviews.map((review) => (
                                  <div
                                    key={review._id}
                                    className="flex gap-2 py-2 items-start"
                                  >
                                    <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center overflow-hidden">
                                      {review.customerId.avatar ? (
                                        <img
                                          src={review.customerId.avatar}
                                          alt={review.customerId.fullName}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <span className="text-gray-400 text-lg font-bold">
                                          {review.customerId.fullName[0]}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1 mb-0.5">
                                        <span className="font-semibold text-sm">
                                          {review.customerId.fullName}
                                        </span>
                                        <span className="flex items-center">
                                          {[1, 2, 3, 4, 5].map((i) => (
                                            <Star
                                              key={i}
                                              className={`w-3 h-3 ${
                                                i <= review.rating
                                                  ? "text-yellow-500 fill-yellow-500"
                                                  : "text-gray-300"
                                              }`}
                                            />
                                          ))}
                                        </span>
                                      </div>
                                      <div className="text-gray-700 text-xs">
                                        {review.comment}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-gray-400 text-xs text-center">
                                No reviews for this doctor.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
            {activeTab === "reviews" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Reviews About Us</h2>
                {reviews.length === 0 ? (
                  <div className="text-gray-400 text-center py-10">
                    No reviews yet.
                  </div>
                ) : (
                  <div className="divide-y">
                    {reviews.map((review) => (
                      <div
                        key={review._id}
                        className="flex gap-4 py-4 items-start"
                      >
                        <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center overflow-hidden">
                          {review.customerId.avatar ? (
                            <img
                              src={review.customerId.avatar}
                              alt={review.customerId.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-400 text-xl font-bold">
                              {review.customerId.fullName[0]}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">
                              {review.customerId.fullName}
                            </span>
                            <span className="flex items-center">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i <= review.rating
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </span>
                            <span className="text-gray-400 text-xs ml-2">
                              {timeAgo(review.createdAt)}
                            </span>
                          </div>
                          <div className="text-gray-700">{review.comment}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab !== "services" &&
              activeTab !== "doctors" &&
              activeTab !== "reviews" && (
                <div className="text-gray-400 text-center py-10">
                  Coming soon...
                </div>
              )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

function timeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
  return `${Math.floor(diff / 31536000)} years ago`;
}

export default ClinicDetail;
