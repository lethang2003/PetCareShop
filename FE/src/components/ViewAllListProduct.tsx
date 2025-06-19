import { useEffect, useState } from "react";
import { deletePetCustomer } from "../utils/PetsAPI";
import { createProduct, deleteProduct, updateProduct, viewAllProduct } from "../utils/Product";
import { CheckCircle, AlertTriangle, Edit, Trash2 } from "lucide-react";

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
interface ProductForm {
  clinicName: string; // ID của phòng khám được chọn
  name: string;
  description: string;
  price: number | string; // thường nhập bằng ô text nên có thể là string
  stockQuantity: number | string;
  category: string;
  image: string; // URL hoặc file base64, tùy cách bạn xử lý
}

const ViewAllListProduct: React.FC = () => {
  const [pets, setPets] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null); // petId to delete
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [editPetId, setEditPetId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ProductForm>({
    clinicName: "", // ID của phòng khám được chọn
    name: "",
    description: "",
    price: 0,
    stockQuantity: 0,
    category: "",
    image: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set()); // Track expanded rows
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchAllPets = async () => {
    try {
      const res = await viewAllProduct();
      if (res.success) {
        const filteredPets = res.data.filter((pet: any) => !pet.isDeleted);
        setPets(filteredPets);
      } else {
        setError(res.message || "Failed to fetch pets");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching pets.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAllPets();
  }, []);
  const toggleRow = (petId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(petId)) {
      newExpanded.delete(petId);
    } else {
      newExpanded.add(petId);
    }
    setExpandedRows(newExpanded);
  };
  const handleEdit = (id: string) => {
    const petToEdit = pets.find((p) => p._id === id);
    if (!petToEdit) return;
    setEditPetId(id);
    setEditForm({
      name: petToEdit.name,
      description: petToEdit.description,
      category: petToEdit.category,
      price: petToEdit.price,
      stockQuantity: petToEdit.stockQuantity,
      clinicName: petToEdit.clinicId.name,
      image: petToEdit.image || "",
    });
    setSelectedFile(null);
    setPreviewUrl(null);
  };
  // Thêm function để reset form
  const resetForm = () => {
    setEditForm({
      clinicName: "",
      name: "",
      description: "",
      price: "",
      stockQuantity: "",
      category: "",
      image: "",
    });
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };
  const handleCreate = async () => {
    resetForm();
    setShowCreateModal(true);
  };
  const confirmDeletePet = async () => {
    if (!confirmDelete) return;
    const res = await deleteProduct(confirmDelete);
    if (res?.success) {
      fetchAllPets();
      setSuccessMessage("Pet deleted successfully!");
      setSuccessModal(true);
      setTimeout(() => {
        setSuccessModal(false);
        setSuccessMessage("");
      }, 2000);
    } else {
      alert("Failed to delete pet.");
    }
    setConfirmDelete(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Nếu đã có URL xem trước cũ thì hủy bỏ để giải phóng bộ nhớ
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      // Tạo URL xem trước cho ảnh mới
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPetId) return;
    try {
      // Chuẩn bị dữ liệu cập nhật
      const petDetails = {
        name: editForm.name,
        description: editForm.description,
        price: editForm.price,
        stockQuantity: editForm.stockQuantity,
        category: editForm.category,
        clinicName: editForm.clinicName,
      };
      let dataToSend: any = petDetails;
      // Nếu có ảnh mới, dùng FormData để gửi kèm file
      if (selectedFile) {
        const formData = new FormData();
        formData.append("productData", JSON.stringify(petDetails));
        formData.append("image", selectedFile);
        dataToSend = formData;
      }
      const res = await updateProduct(editPetId, dataToSend);
      if (res.success) {
        // Cập nhật lại pet trong danh sách state
        fetchAllPets();
        // Hiển thị thông báo thành công
        setSuccessMessage("Pet updated successfully!");
        setSuccessModal(true);
        setTimeout(() => {
          setSuccessModal(false);
          setSuccessMessage("");
        }, 2000);
        // Đóng modal chỉnh sửa
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setEditPetId(null);
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        setSuccessMessage("Failed to update pet.");
      }
    } catch (err) {
      console.error("Update error", err);
      alert("Failed to update pet.");
    }
  };

  const handleCreatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Chuẩn bị dữ liệu cập nhật
      const petDetails = {
        name: editForm.name,
        description: editForm.description,
        price: editForm.price,
        stockQuantity: editForm.stockQuantity,
        category: editForm.category,
        clinicName: editForm.clinicName,
      };
      let dataToSend: any = petDetails;
      // Nếu có ảnh mới, dùng FormData để gửi kèm file
      if (selectedFile) {
        const formData = new FormData();
        formData.append("productData", JSON.stringify(petDetails));
        formData.append("image", selectedFile);
        dataToSend = formData;
      }
      const res = await createProduct(dataToSend);
      if (res.success) {
        // Cập nhật lại pet trong danh sách state
        fetchAllPets();
        // Hiển thị thông báo thành công
        setSuccessMessage("Pet updated successfully!");
        setSuccessModal(true);
        setTimeout(() => {
          setSuccessModal(false);
          setSuccessMessage("");
        }, 2000);
        // Đóng modal chỉnh sửa
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        resetForm();
        setShowCreateModal(false);
      } else {
        alert("Failed to update pet.");
      }
    } catch (err) {
      console.error("Update error", err);
      alert("Failed to update pet.");
    }
  };

  return (
    <div className="relative w-[1380px] mx-auto p-6 bg-white rounded-lg shadow border ">
      {/* ✅ Success modal */}
      {successModal && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="bg-white border border-green-300 shadow-md p-6 rounded-lg text-center animate-bounce">
            <CheckCircle className="text-green-500 w-12 h-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-800">Success</h3>
            <p className="text-sm text-gray-500">{successMessage}</p>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[150vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">
              Create New PRoduct Information
            </h2>
            <form onSubmit={handleCreatePet}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-left">
                  <label
                    htmlFor="name"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="text-left">
                  <label
                    htmlFor="description"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Description
                  </label>
                  <input
                    id="description"
                    type="text"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-left">
                  <label
                    htmlFor="price"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Price
                  </label>
                  <input
                    id="price"
                    type="number"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="text-left">
                  <label
                    htmlFor="clinicName"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    ClinicName
                  </label>
                  <select
                    id="clinicName"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={editForm.clinicName}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        clinicName: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">-- Select species --</option>
                    <option value="PetCare 1">PetCare 1</option>
                    <option value="PetCare 2">PetCare 2</option>
                    <option value="PetCare 3">PetCare 3</option>
                    <option value="PetCare 4">PetCare 4</option>
                    <option value="PetCare 5">PetCare 5</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-left">
                  <label
                    htmlFor="stockQuantity"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    StockQuantity
                  </label>
                  <input
                    id="stockQuantity"
                    type="number"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={editForm.stockQuantity}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        stockQuantity: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="text-left">
                  <label
                    htmlFor="category"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Category
                  </label>
                  <input
                    id="category"
                    type="text"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="mb-4 text-left">
                <label className="block text-gray-700 font-medium mb-1">
                  Image:
                </label>
                <div className="flex items-start space-x-4">
                  {previewUrl || editForm.image ? (
                    <img
                      src={previewUrl || editForm.image}
                      alt="Pet"
                      className="h-24 w-24 object-cover rounded"
                    />
                  ) : (
                    <div className="h-24 w-24 bg-gray-100 text-gray-500 flex items-center justify-center rounded">
                      No Image
                    </div>
                  )}

                  <div className="flex mt-14 justify-between w-full">
                    <div className="flex items-center">
                      <label
                        htmlFor="fileInput"
                        className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded cursor-pointer mr-2"
                      >
                        {editForm.image || previewUrl
                          ? "Change Image"
                          : "Upload Image"}
                      </label>
                      {selectedFile && (
                        <span className="text-gray-700 text-sm">
                          {selectedFile.name}
                        </span>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        onClick={() => {
                          if (previewUrl) URL.revokeObjectURL(previewUrl);
                          resetForm(); // Reset form khi đóng create modal
                          setShowCreateModal(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>

                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Edit Pet Modal */}
      {editPetId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[110vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">
              Edit Product Information
            </h2>
            <form onSubmit={handleUpdatePet}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-left">
                  <label
                    htmlFor="name"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Name:
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="text-left">
                  <label
                    htmlFor="description"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Description
                  </label>
                  <input
                    id="description"
                    type="text"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-left">
                  <label
                    htmlFor="stockQuantity"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    StockQuantity
                  </label>
                  <input
                    id="stockQuantity"
                    type="text"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={editForm.stockQuantity}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        stockQuantity: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="text-left">
                  <label
                    htmlFor="species"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    ClinicName
                  </label>
                  <select
                    id="species"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={editForm.clinicName}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        clinicName: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">-- Select species --</option>
                    <option value="PetCare 1">PetCare 1</option>
                    <option value="PetCare 2">PetCare 2</option>
                    <option value="PetCare 3">PetCare 3</option>
                    <option value="PetCare 4">PetCare 4</option>
                    <option value="PetCare 5">PetCare 5</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-left">
                  <label
                    htmlFor="price"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Price
                  </label>
                  <input
                    id="price"
                    type="number"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="text-left">
                  <label
                    htmlFor="category"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Category
                  </label>
                  <input
                    id="category"
                    type="text"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="mb-4 text-left">
                <label className="block text-gray-700 font-medium mb-1">
                  Image:
                </label>
                <div className="flex items-start space-x-4">
                  {previewUrl || editForm.image ? (
                    <img
                      src={previewUrl || editForm.image}
                      alt="Pet"
                      className="h-24 w-24 object-cover rounded"
                    />
                  ) : (
                    <div className="h-24 w-24 bg-gray-100 text-gray-500 flex items-center justify-center rounded">
                      No Image
                    </div>
                  )}

                  <div className="flex mt-14 justify-between w-full">
                    <div className="flex items-center">
                      <label
                        htmlFor="fileInput"
                        className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded cursor-pointer mr-2"
                      >
                        {editForm.image || previewUrl
                          ? "Change Image"
                          : "Upload Image"}
                      </label>
                      {selectedFile && (
                        <span className="text-gray-700 text-sm">
                          {selectedFile.name}
                        </span>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        onClick={() => {
                          if (previewUrl) URL.revokeObjectURL(previewUrl);
                          resetForm(); // Reset form khi đóng edit modal
                          setEditPetId(null);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>

                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
            <AlertTriangle className="text-yellow-500 w-10 h-10 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Are you sure?
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              This action will delete the pet profile.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={confirmDeletePet}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Manager Product </h2>
        <button
          onClick={handleCreate}
          className="bg-green-500  text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2 ml-[810px]"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Export
        </button>
        <button
          onClick={handleCreate}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add New Pet
        </button>
      </div>
      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && (
        <div className="text-red-600 text-center font-medium mb-4">{error}</div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Image</th>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Description</th>
              <th className="px-4 py-3 text-left font-semibold">Price</th>
              <th className="px-4 py-3 text-left font-semibold">
                StockQuantity
              </th>
              <th className="px-4 py-3 text-left font-semibold">Category</th>
              <th className="px-4 py-3 text-left font-semibold">ClinicName</th>
              <th className="px-4 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pets.map((pet) => (
              <>
                <tr
                  className="hover:bg-gray-100 transition cursor-pointer"
                  onClick={() => toggleRow(pet._id)}
                >
                  <td className="px-4 py-3">
                    {pet.image ? (
                      <img
                        src={pet.image}
                        alt={pet.name}
                        className="w-12 h-12 object-cover rounded-full ring-1 ring-gray-300"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 border border-gray-300 rounded-full flex items-center justify-center text-xs text-gray-500">
                        No Image
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {pet.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{pet.description}</td>
                  <td className="px-4 py-3 text-gray-600">{pet.price}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {pet.stockQuantity}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{pet.category}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {pet.clinicId.name}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(pet._id);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs mr-2 shadow"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(pet._id);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs shadow"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewAllListProduct;
