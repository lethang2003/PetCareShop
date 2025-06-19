import { useState, useEffect } from "react";
import { Clock, Image as ImageIcon, ChevronRight } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchServiceById,
  fetchServiceCarousel,
  Service,
} from "../utils/fetchService";
import SummaryApi from "../common/SummarryAPI";
import { FaStar } from "react-icons/fa";
import Axios from "../utils/Axios";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [relatedServices, setRelatedServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewLoading, setReviewLoading] = useState(true);

  const tabContents = [
    {
      label: "Overview",
      content: (
        <>
          <h2 className="text-2xl font-semibold mb-4">Service Overview</h2>
          <p className="mb-2">
            Our comprehensive General Check-up is designed to assess your pet's
            overall health and detect any potential issues before they become
            serious problems. Regular check-ups are essential for maintaining
            your pet's health and ensuring they live a long, happy life.
          </p>
          <p className="mb-2">
            During a general check-up, our experienced veterinarians will
            conduct a thorough examination of your pet, checking everything from
            their eyes and ears to their heart and lungs. We'll also discuss any
            concerns you may have about your pet's health or behavior.
          </p>
          <p>
            We recommend bringing your pet in for a general check-up at least
            once a year for adult pets, and twice a year for senior pets or
            those with chronic conditions.
          </p>
        </>
      ),
    },
    {
      label: "What to Expect",
      content: (
        <>
          <h2 className="text-2xl font-semibold mb-4">What to Expect</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Comprehensive physical examination</li>
            <li>Discussion of your pet's medical history</li>
            <li>Basic diagnostic tests if needed</li>
            <li>Personalized care recommendations</li>
          </ul>
        </>
      ),
    },
    {
      label: "Benefits",
      content: (
        <>
          <h2 className="text-2xl font-semibold mb-4">Benefits</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Early detection of health issues</li>
            <li>Improved quality of life for your pet</li>
            <li>Peace of mind for pet owners</li>
            <li>Personalized health advice</li>
          </ul>
        </>
      ),
    },
    {
      label: "Reviews",
      content: (
        <>
          <h2 className="text-2xl font-semibold mb-4">Service Reviews</h2>
          {reviewLoading ? (
            <div>Loading reviews...</div>
          ) : reviews?.length === 0 ? (
            <div className="text-gray-500">
              No reviews for this service yet.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xl font-semibold text-orange-500">
                  {(
                    reviews.reduce((sum, r) => sum + r.rating, 0) /
                    reviews.length
                  ).toFixed(1)}
                </span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar
                      key={i}
                      className={
                        i <
                        Math.round(
                          reviews.reduce((sum, r) => sum + r.rating, 0) /
                            reviews.length
                        )
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  ({reviews.length} reviews)
                </span>
              </div>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="border rounded-lg p-4 flex gap-4 items-start bg-gray-50"
                  >
                    <img
                      src={review.customerId?.avatar || "/default-avatar.png"}
                      alt={review.customerId?.fullName || "avatar"}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-base">
                          {review.customerId?.fullName || "Anonymous"}
                        </span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FaStar
                              key={i}
                              className={
                                i < review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-gray-700 mb-1">{review.comment}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString("en-US")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ),
    },
  ];

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      try {
        const data = await fetchServiceById(id as string);
        setService(data);
      } catch {
        setService(null);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  // Fetch related services
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const all = await fetchServiceCarousel();
        // Lọc ra các dịch vụ khác dịch vụ hiện tại
        setRelatedServices(all.filter((s: Service) => s.id !== id).slice(0, 3));
      } catch {
        setRelatedServices([]);
      }
    };
    fetchRelated();
  }, [id]);

  // Fetch service reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      setReviewLoading(true);
      try {
        const res = await Axios(SummaryApi.review.getServiceReviews(id));
        setReviews(res.data || []);
      } catch {
        setReviews([]);
      } finally {
        setReviewLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#fafbfc] mt-10">
      <Header />
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-20">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-8 space-x-2">
          <span
            className="cursor-pointer hover:underline"
            onClick={() => navigate("/")}
          >
            Home
          </span>
          <ChevronRight className="w-4 h-4" />
          <span
            className="cursor-pointer hover:underline"
            onClick={() => navigate("/services")}
          >
            Services
          </span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-700 font-medium">
            {service?.name || "Service"}
          </span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left: Service Info */}
          <div>
            {service && (
              <>
                {/* Category badge */}
                <span className="inline-block bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  {service.category || "Pet Healthcare"}
                </span>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {service.name}
                </h1>
                <p className="text-gray-600 text-lg mb-6">
                  {service.description}
                </p>
                {/* Time & Recommendation */}
                <div className="flex items-center gap-4 mb-8">
                  <span className="flex items-center text-gray-700 text-base">
                    <Clock className="w-5 h-5 mr-2 text-orange-500" />
                    30-60 minutes
                  </span>
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                    Recommended every 6-12 months
                  </span>
                </div>
                {/* Buttons */}
                <div className="flex items-center gap-16">
                  <button
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
                    onClick={() => navigate("/viewproduct")} // Thay '/product-details' bằng route bạn muốn
                  >
                    View Product
                  </button>
                  <div className="flex flex-col items-start">
                    <span className="text-2xl font-bold text-orange-500">
                      {/* Hiển thị giá, ví dụ lấy từ service.price nếu có */}
                      {service?.price ? `$${service.price}` : "$50"}
                      <span className="text-base font-normal text-gray-500 ml-1">
                        /visit
                      </span>
                    </span>
                  </div>
                </div>
              </>
            )}
            {!service && !loading && (
              <div className="text-red-500">Service not found.</div>
            )}
          </div>
          {/* Right: Image */}
          <div className="flex items-center justify-center min-h-[320px]rounded-xl p-3">
            {service?.imageUrl ? (
              <img
                src={service.imageUrl}
                alt={service.name}
                className="object-contain max-h-80 w-full rounded-xl"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl w-full h-full min-h-[320px]">
                <ImageIcon className="w-16 h-16 mb-2" />
                <span className="text-base">No Image</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        {service && (
          <div className="mt-12 bg-white rounded-xl shadow p-8">
            <div className="flex border-b mb-8 bg-[#fafbfc] rounded-lg overflow-hidden">
              {tabContents.map((tab, idx) => (
                <button
                  key={tab.label}
                  className={`flex-1 px-6 py-2 font-medium transition text-center
                    ${
                      activeTab === idx
                        ? "bg-white border-b-2 border-orange-500 text-black rounded-t-lg shadow-sm"
                        : "bg-[#fafbfc] text-gray-500 hover:text-orange-500"
                    }
                  `}
                  style={{
                    borderBottom:
                      activeTab === idx
                        ? "2px solid #f97316"
                        : "2px solid transparent",
                  }}
                  onClick={() => setActiveTab(idx)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div>{tabContents[activeTab].content}</div>
          </div>
        )}

        {/* Related Services Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-2">
            Related Services
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-2xl mx-auto">
            Explore other services that complement our general check-ups
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedServices.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow p-0 border border-gray-200 flex flex-col overflow-hidden"
              >
                <div className="flex items-center justify-center bg-gray-50 h-40">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="object-contain h-full w-full"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-gray-300" />
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="font-semibold text-lg mb-1">{item.name}</div>
                  <div className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {item.description}
                  </div>
                  <button
                    className="text-orange-600 text-sm font-semibold flex items-center gap-1 mt-auto hover:underline"
                    onClick={() =>
                      (window.location.href = `/service/view-detail-service/${item.id}`)
                    }
                  >
                    Learn More <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ServiceDetail;
