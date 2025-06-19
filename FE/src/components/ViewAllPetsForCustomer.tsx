import { useEffect, useState } from "react";
import {
  viewAllPets,
  deletePetCustomer,
  updatePetCustomer,
  createPetsCustomer,
} from "../utils/PetsAPI";
import { CheckCircle, AlertTriangle, Edit, Trash2 } from "lucide-react";

interface Pet {
  _id: string;
  petName: string;
  speciesId: {
    _id: string;
    speciesName: string;
  };
  gender: string;
  weight: number;
  age: string;
  medicalHistory: string;
  imageUrl?: string;
}

interface PetForm {
  petName: string;
  species: string;
  gender: string;
  weight: string | number;
  age: string;
  medicalHistory: string;
  imageUrl: string;
}

const ViewAllPetsForCustomer: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successModal, setSuccessModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // petId to delete
  const [successMessage, setSuccessMessage] = useState("");
  const [editPetId, setEditPetId] = useState(null);
  const [editForm, setEditForm] = useState<PetForm>({
    petName: "",
    species: "",
    gender: "",
    weight: "",
    age: "",
    medicalHistory: "",
    imageUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchAllPets = async () => {
    try {
      const res = await viewAllPets();
      if (res.success) {
        setPets(res.data);
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

  const handleEdit = (id: string) => {
    const petToEdit = pets.find((p) => p._id === id);
    if (!petToEdit) return;
    setEditPetId(id);
    setEditForm({
      petName: petToEdit.petName,
      species: petToEdit.speciesId.speciesName,
      gender: petToEdit.gender,
      weight: petToEdit.weight,
      age: formatDateForInput(petToEdit.age),
      medicalHistory: petToEdit.medicalHistory,
      imageUrl: petToEdit.imageUrl || "",
    });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const calculateAge = (birthDate: string | Date): string => {
    const birth = new Date(birthDate);
    const today = new Date();

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    // Điều chỉnh nếu số ngày âm
    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }
    // Điều chỉnh nếu số tháng âm
    if (months < 0) {
      years--;
      months += 12;
    }
    // Logic hiển thị
    if (years > 0) {
      if (months === 0) {
        return `${years} tuổi`;
      } else {
        return `${years} tuổi ${months} tháng`;
      }
    } else if (months > 0) {
      if (days === 0) {
        return `${months} tháng`;
      } else {
        return `${months} tháng ${days} ngày`;
      }
    } else {
      return `${days} ngày`;
    }
  };

  // Hàm format date cho input type="date" (YYYY-MM-DD)
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Hàm format date hiển thị (DD/MM/YYYY)
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const confirmDeletePet = async () => {
    if (!confirmDelete) return;
    const res = await deletePetCustomer(confirmDelete);
    if (res?.success) {
      setPets((prev) => prev.filter((pet) => pet._id !== confirmDelete));
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

  const handleFileChange = (e: React.ChangeEvent) => {
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

  const handleCreate = async () => {
    setShowCreateModal(true);
  };

  const handleUpdatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPetId) return;
    try {
      // Chuẩn bị dữ liệu cập nhật
      const petDetails = {
        petName: editForm.petName,
        species: editForm.species,
        gender: editForm.gender,
        weight: editForm.weight ? parseFloat(editForm.weight.toString()) : 0,
        age: editForm.age,
        medicalHistory: editForm.medicalHistory,
      };
      let dataToSend: any = petDetails;
      // Nếu có ảnh mới, dùng FormData để gửi kèm file
      if (selectedFile) {
        const formData = new FormData();
        formData.append("petDetails", JSON.stringify(petDetails));
        formData.append("image", selectedFile);
        dataToSend = formData;
      }
      const res = await updatePetCustomer(editPetId, dataToSend);
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
        alert(res.message || "Failed to update pet.");
      }
    } catch (err) {
      console.error("Update error", err);
      alert("Failed to update pet.");
    }
  };

  const handleCreatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const petDetails = {
        petName: editForm.petName,
        species: editForm.species,
        gender: editForm.gender,
        weight: editForm.weight ? parseFloat(editForm.weight.toString()) : 0,
        age: editForm.age,
        medicalHistory: editForm.medicalHistory,
      };

      let dataToSend: any = petDetails;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("petDetails", JSON.stringify(petDetails));
        formData.append("image", selectedFile);
        dataToSend = formData;
      }

      const res = await createPetsCustomer(dataToSend); // <-- Gọi API tạo mới

      if (res.success) {
        fetchAllPets();
        setSuccessMessage("Pet created successfully!");
        setSuccessModal(true);
        setTimeout(() => {
          setSuccessModal(false);
          setSuccessMessage("");
        }, 2000);

        setShowCreateModal(false);
        setEditForm({
          petName: "",
          species: "",
          gender: "",
          age: "",
          weight: "",
          medicalHistory: "",
          imageUrl: "",
        });
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setSelectedFile(null);
      } else {
        alert(res.message || "Failed to create pet.");
      }
    } catch (err) {
      console.error("Create error", err);
      alert("Failed to create pet.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen w-[1150px]">
      {/* ✅ Success modal */}
      {successModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
            <CheckCircle className="text-green-500 w-10 h-10 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-800 mb-2">Success</h2>
            <p className="text-sm text-gray-500">{successMessage}</p>
          </div>
        </div>
      )}

      {/* ✅ Edit Pet Modal */}
      {editPetId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleUpdatePet}>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Edit Pet Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="mb-4 text-left">
                  <label className="block text-gray-700 font-medium mb-1">
                    Pet Name:
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editForm.petName}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        petName: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="mb-4 text-left">
                  <label className="block text-gray-700 font-medium mb-1">
                    Species:
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editForm.species}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        species: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">-- Select species --</option>
                    <option value="bird">Chim</option>
                    <option value="mouse">Chuột</option>
                    <option value="dog">Chó</option>
                    <option value="cat">Mèo</option>
                    <option value="rabbit">Thỏ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="mb-4 text-left">
                  <label className="block text-gray-700 font-medium mb-1">
                    Gender:
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editForm.gender}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">-- Select gender --</option>
                    <option value="Đực">Đực</option>
                    <option value="Cái">Cái</option>
                  </select>
                </div>

                <div className="mb-4 text-left">
                  <label className="block text-gray-700 font-medium mb-1">
                    Age:
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editForm.age}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, age: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="mb-4 text-left">
                <label className="block text-gray-700 font-medium mb-1">
                  Weight:
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editForm.weight}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, weight: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="mb-4 text-left">
                <label className="block text-gray-700 font-medium mb-1">
                  Medical History:
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={editForm.medicalHistory}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      medicalHistory: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="mb-4 text-left">
                <label className="block text-gray-700 font-medium mb-1">
                  Image:
                </label>
                <div className="flex items-start space-x-4">
                  {previewUrl || editForm.imageUrl ? (
                    <img
                      src={previewUrl || editForm.imageUrl}
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
                        {editForm.imageUrl || previewUrl
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
                          setEditPetId(null);
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded hover:bg-green-600"
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

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreatePet}>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Create Pet Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="mb-4 text-left">
                  <label className="block text-gray-700 font-medium mb-1">
                    Pet Name:
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editForm.petName}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        petName: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="mb-4 text-left">
                  <label className="block text-gray-700 font-medium mb-1">
                    Species:
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editForm.species}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        species: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">-- Select species --</option>
                    <option value="bird">Chim</option>
                    <option value="mouse">Chuột</option>
                    <option value="dog">Chó</option>
                    <option value="cat">Mèo</option>
                    <option value="rabbit">Thỏ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="mb-4 text-left">
                  <label className="block text-gray-700 font-medium mb-1">
                    Gender:
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editForm.gender}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">-- Select gender --</option>
                    <option value="Đực">Đực</option>
                    <option value="Cái">Cái</option>
                  </select>
                </div>

                <div className="mb-4 text-left">
                  <label className="block text-gray-700 font-medium mb-1">
                    Age:
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editForm.age}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, age: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="mb-4 text-left">
                <label className="block text-gray-700 font-medium mb-1">
                  Weight:
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editForm.weight}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, weight: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="mb-4 text-left">
                <label className="block text-gray-700 font-medium mb-1">
                  Medical History:
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={editForm.medicalHistory}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      medicalHistory: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="mb-4 text-left">
                <label className="block text-gray-700 font-medium mb-1">
                  Image:
                </label>
                <div className="flex items-start space-x-4">
                  {previewUrl || editForm.imageUrl ? (
                    <img
                      src={previewUrl || editForm.imageUrl}
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
                        {editForm.imageUrl || previewUrl
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
                          setShowCreateModal(false); // 👈 đóng modal tạo mới
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded hover:bg-green-600"
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
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
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

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 pl-72">My Pets</h1>
        <button
          onClick={handleCreate}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
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

      {/* Pet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pets.map((pet) => (
          <div
            key={pet._id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
          >
            {/* Pet Image */}
            <div className="relative h-64 bg-gray-100">
              {pet.imageUrl ? (
                <img
                  src={pet.imageUrl}
                  alt={pet.petName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg
                    className="w-12 h-12"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                  </svg>
                </div>
              )}

              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => handleEdit(pet._id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-full shadow-md transition-colors"
                >
                  <Edit className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setConfirmDelete(pet._id)}
                  className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md transition-colors"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Pet Info */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {pet.petName}
                  </h3>
                  <p className="text-sm text-black bg-green-300 border border-green-500 p-1 rounded">
                    {calculateAge(pet.age)}
                  </p>
                </div>
              </div>

              {/* Pet Details Grid */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Species</span>
                  <span className="text-gray-800">
                    {pet.speciesId.speciesName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Weight</span>
                  <span className="text-gray-800">{pet.weight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Gender</span>
                  <span className="text-gray-800">{pet.gender}</span>
                </div>
              </div>

              {/* Medical History */}
              {pet.medicalHistory && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="font-medium text-gray-600 text-sm">
                    Notes
                  </span>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                    {pet.medicalHistory}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {pets.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🐾</div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            No pets yet
          </h3>
          <p className="text-gray-500 mb-4">
            Add your first pet to get started!
          </p>
          <button
            onClick={handleCreate}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
          >
            Add New Pet
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewAllPetsForCustomer;
