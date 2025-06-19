import { viewAllProductforGuest } from "@utils/Product";
import { useEffect, useState } from "react";
import { Eye, MapPin, Package, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Product {
  _id: string;
  clinicId: {
    _id: string;
    name: string;
  };
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  createdAt: string; // ISO string (date)
  updatedAt: string;
  image: string;
}

const ViewListAllProductFotGuest: React.FC = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllProducts = async (selectedClinic = "") => {
    try {
      const res = await viewAllProductforGuest(selectedClinic);
      if (res.success) {
        const filtered = res.data.filter((product: any) => !product.isDeleted);
        setPets(filtered);
      } else {
        setError(res.message || "Failed to fetch products");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts("PetCare 1"); // Mặc định là PetCare 1
  }, []);

  const handleSelectProduct = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedClinic = e.target.value;
    setLoading(true);
    await fetchAllProducts(selectedClinic);
  };
  // đây là hàm xử lí khi ấn vào detail
  const handleViewDetail = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-blue-600 mb-2 pl-[500px]">
            List Product
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-500" />
          <select
            onChange={handleSelectProduct}
            className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="PetCare 1">-- Select Clinic --</option>
            <option value="PetCare 1">PetCare 1</option>
            <option value="PetCare 2">PetCare 2</option>
            <option value="PetCare 3">PetCare 3</option>
            <option value="PetCare 4">PetCare 4</option>
            <option value="PetCare 5">PetCare 5</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading products...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pets.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden group"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </div>

                  {/* Stock Status */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.stockQuantity > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Price and Stock */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-bold text-lg text-green-600">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Stock: {product.stockQuantity}
                    </div>
                  </div>

                  {/* Clinic Info */}
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 font-medium">
                      {product.clinicId.name}
                    </span>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleViewDetail(product._id)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 group"
                  >
                    <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {pets.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600">
                Try selecting a different clinic or check back later.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ViewListAllProductFotGuest;
