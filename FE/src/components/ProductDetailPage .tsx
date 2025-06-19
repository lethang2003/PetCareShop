import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Star,
  Plus,
  Minus,
  ShoppingCart,
  Heart,
  Share2,
  Shield,
  Truck,
  RotateCcw,
  CheckCircle,
  Clock,
  MapPin,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { viewAllProductbyID } from "@utils/Product";

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
  createdAt: string;
  updatedAt: string;
  image: string;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  features?: string[];
  ingredients?: string;
  usage?: string;
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isWishlisted, setIsWishlisted] = useState(false);
  // Fetch product data when component mounts
  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!id) {
        setError("Product ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Call actual API function
        const response = await viewAllProductbyID(id);

        if (response.success) {
          setProduct(response.data);
        } else {
          setError(response.message || "Failed to fetch product details");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("An error occurred while fetching product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };

  //   const handleQuantityChange = (change: number) => {
  //     if (!product) return;

  //     const newQuantity = quantity + change;
  //     if (newQuantity >= 1 && newQuantity <= product.stockQuantity) {
  //       setQuantity(newQuantity);
  //     }
  //   };

  //   const handleAddToCart = async () => {
  //     if (!product || !id) return;

  //     try {
  //       const response = await addToCart(id, quantity);
  //       if (response.success) {
  //         // Show success message or update UI
  //         alert(`Added ${quantity} ${product.name} to cart!`);
  //         // You can replace alert with a toast notification
  //       } else {
  //         alert(response.message || "Failed to add to cart");
  //       }
  //     } catch (error) {
  //       console.error("Error adding to cart:", error);
  //       alert("An error occurred while adding to cart");
  //     }
  //   };

  //   const handleToggleWishlist = async () => {
  //     if (!id) return;

  //     try {
  //       const response = await toggleWishlist(id);
  //       if (response.success) {
  //         setIsWishlisted(!isWishlisted);
  //         // Show success message
  //       } else {
  //         alert(response.message || "Failed to update wishlist");
  //       }
  //     } catch (error) {
  //       console.error("Error toggling wishlist:", error);
  //       alert("An error occurred while updating wishlist");
  //     }
  //   };

  //   const handleBack = () => {
  //     navigate(-1); // Go back to previous page
  //     // hoặc navigate('/products') để về trang danh sách
  //   };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
        //   onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <span className="ml-3 text-gray-600 text-lg">
              Loading product details...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-800 font-medium text-lg">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Product Content */}
        {!loading && !error && product && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Product Images */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="aspect-square bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Thumbnail Images
                <div className="flex gap-3">
                  {product.image.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? "border-orange-500 ring-2 ring-orange-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div> */}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {/* Brand & New Badge */}
                <div className="flex items-center gap-3">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Mới
                  </span>
                  <span className="text-orange-600 font-semibold text-sm uppercase tracking-wide">
                    {product.brand}
                  </span>
                </div>

                {/* Product Name */}
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating || 0)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900">
                    {product.rating}
                  </span>
                  <span className="text-gray-500">
                    ({product.reviewCount} đánh giá)
                  </span>
                </div>

                {/* Price */}
                <div className="text-4xl font-bold text-orange-600">
                  {formatPrice(product.price)}
                </div>

                {/* Payment Options */}
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-600">Có sẵn trả tiếp</span>
                  <span className="text-blue-600 cursor-pointer hover:underline">
                    Làm sạch răng
                  </span>
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">
                    Còn hàng {product.stockQuantity} sản phẩm
                  </span>
                </div>

                {/* Quantity Selector */}
                <div className="space-y-3">
                  <span className="font-medium text-gray-900">Số lượng:</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        // onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                        {quantity}
                      </span>
                      <button
                        // onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= (product?.stockQuantity || 0)}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    // onClick={handleAddToCart}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Thêm vào giỏ hàng
                  </button>
                  <button
                    // onClick={handleToggleWishlist}
                    className={`p-4 rounded-xl border-2 transition-colors ${
                      isWishlisted
                        ? "border-red-500 bg-red-50 text-red-500"
                        : "border-gray-300 hover:border-gray-400 text-gray-600"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isWishlisted ? "fill-current" : ""
                      }`}
                    />
                  </button>
                  <button className="p-4 rounded-xl border-2 border-gray-300 hover:border-gray-400 text-gray-600 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-orange-600">
                    <Shield className="w-4 h-4" />
                    <span>Miễn phí vận chuyển</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Truck className="w-4 h-4" />
                    <span>Bảo hành chính hãng</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <RotateCcw className="w-4 h-4" />
                    <span>Đổi trả trong 7 ngày</span>
                  </div>
                </div>

                {/* Clinic Info */}
                <div className="bg-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-5 h-5" />
                    <span className="font-medium">
                      Cung cấp bởi: {product.clinicId.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details Tabs */}
            <div className="mt-16">
              <div className="border-b border-gray-200">
                <nav className="flex gap-8">
                  {[
                    { id: "description", label: "Mô tả" },
                    { id: "features", label: "Tính năng" },
                    { id: "usage", label: "Cách sử dụng" },
                    { id: "reviews", label: "Hỏi đáp" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? "border-orange-500 text-orange-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="py-8">
                {activeTab === "description" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Mô tả sản phẩm
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {product.description}
                    </p>

                    <div className="bg-blue-50 rounded-xl p-6">
                      <h4 className="font-semibold text-blue-900 mb-3">
                        Đặc điểm nổi bật:
                      </h4>
                      <ul className="space-y-2">
                        {product.features?.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-3 text-blue-800"
                          >
                            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "features" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Thành phần:
                    </h3>
                    <p className="text-gray-700 text-lg">
                      {product.ingredients}
                    </p>
                  </div>
                )}

                {activeTab === "usage" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Hướng dẫn sử dụng:
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {product.usage}
                    </p>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Phần hỏi đáp
                    </h3>
                    <p className="text-gray-600">
                      Tính năng này sẽ sớm được cập nhật.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
