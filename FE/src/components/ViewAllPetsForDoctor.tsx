import { useEffect, useState } from "react";
import {
  deletePetCustomer,
  viewAllPetsDoctor,
  updatePetDoctor,
  createPetsDoctor,
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
  weight: string | number;
  age: string;
  medicalHistory: string;
  imageUrl?: string;
  customerId: {
    fullName: string;
    email: string;
    _id: string;
  };
}

interface PetForm {
  petName: string;
  phone: string;
  species: string;
  gender: string;
  weight: string | number;
  age: string;
  medicalHistory: string;
  imageUrl: string;
  ownerfullName: string;
  ownerEmail: string;
  ownerID: string;
}

const ViewAllPetsForDoctor: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null); // petId to delete
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [editPetId, setEditPetId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PetForm>({
    petName: "",
    species: "",
    gender: "",
    weight: "",
    age: "",
    medicalHistory: "",
    imageUrl: "",
    ownerfullName: "",
    ownerEmail: "",
    phone: "",
    ownerID: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set()); // Track expanded rows
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchAllPets = async () => {
    try {
      const res = await viewAllPetsDoctor();
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
      ownerfullName: petToEdit.customerId.fullName,
      ownerEmail: petToEdit.customerId.email,
      ownerID: petToEdit.customerId._id,
      petName: petToEdit.petName,
      species: petToEdit.speciesId.speciesName,
      gender: petToEdit.gender,
      weight: petToEdit.weight ? String(petToEdit.weight) : "",
      age: formatDateForInput(petToEdit.age),
      medicalHistory: petToEdit.medicalHistory,
      imageUrl: petToEdit.imageUrl || "",
      phone : ""
      
    });
    setSelectedFile(null);
    setPreviewUrl(null);
  };
  const handleCreate = async () => {
    setShowCreateModal(true);
  };
  const confirmDeletePet = async () => {
    if (!confirmDelete) return;
    const res = await deletePetCustomer(confirmDelete);
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
        ownerID: editForm.ownerID,
        ownerfullName: editForm.ownerfullName,
        ownerEmail: editForm.ownerEmail,
        petName: editForm.petName,
        species: editForm.species,
        gender: editForm.gender,
        weight: editForm.weight
          ? parseFloat(editForm.weight.toString())
          : editForm.weight,
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
      const res = await updatePetDoctor(editPetId, dataToSend);
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
        email: editForm.ownerEmail,
        phone: editForm.phone,
        petName: editForm.petName,
        species: editForm.species,
        gender: editForm.gender,
        weight: editForm.weight
          ? parseFloat(editForm.weight.toString())
          : editForm.weight,
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
      const res = await createPetsDoctor(dataToSend);
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
        setShowCreateModal(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        setEditForm({
          petName: "",
          species: "",
          gender: "",
          weight: "",
          age: "",
          medicalHistory: "",
          imageUrl: "",
          ownerfullName: "",
          ownerEmail: "",
          phone: "",
          ownerID: "",
        });
      } else {
        setSuccessMessage("Failed to update pet.");
      }
    } catch (err) {
      console.error("Update error", err);
      alert("Failed to update pet.");
    }
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
  // const formatDateForDisplay = (dateString: string): string => {
  //   if (!dateString) return "";
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString("vi-VN");
  // };

  return (
    <div className="relative w-[1150px] mx-auto p-6 bg-white rounded-lg shadow border border-yellow-400">
      {/* ✅ Success modal */}
      {successModal && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="bg-white border border-green-300 shadow-md p-6 rounded-lg text-center animate-bounce">
            <CheckCircle className="text-green-500 w-12 h-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-800">Success</h3>
            <p className="text-sm text-gray-500">{successMessage}</p>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[110vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">
              Create New Pet Information
            </h2>
            <form onSubmit={handleCreatePet}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-left">
                  <label
                    htmlFor="ownerName"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Owner Phone:
                  </label>
                  <input
                    id="phone"
                    type="text"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="text-left">
                  <label
                    htmlFor="ownerEmail"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Owner Email:
                  </label>
                  <input
                    id="ownerEmail"
                    type="email"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={editForm.ownerEmail}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        ownerEmail: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-left">
                  <label
                    htmlFor="petName"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Pet Name:
                  </label>
                  <input
                    id="petName"
                    type="text"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                <div className="text-left">
                  <label
                    htmlFor="species"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Species:
                  </label>
                  <select
                    id="species"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-left">
                  <label
                    htmlFor="gender"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Gender:
                  </label>
                  <select
                    id="gender"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                <div className="text-left">
                  <label
                    htmlFor="age"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Age:
                  </label>
                  <input
                    id="age"
                    type="date"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={editForm.age}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, age: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="mb-4 text-left">
                <label
                  htmlFor="weight"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Weight:
                </label>
                <input
                  id="weight"
                  type="number"
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={editForm.weight}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, weight: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="mb-4 text-left">
                <label
                  htmlFor="medicalHistory"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Medical History:
                </label>
                <textarea
                  id="medicalHistory"
                  rows={3}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
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
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[110vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">
              Edit Pet Information
            </h2>
            <form onSubmit={handleUpdatePet}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-left">
                  <label
                    htmlFor="ownerName"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Owner Name:
                  </label>
                  <input
                    id="ownerName"
                    type="text"
                    readOnly
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={editForm.ownerfullName}
                    required
                  />
                </div>
                <div className="text-left">
                  <label
                    htmlFor="ownerEmail"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Owner Email:
                  </label>
                  <input
                    id="ownerEmail"
                    type="text"
                    readOnly
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={editForm.ownerEmail}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-left">
                  <label
                    htmlFor="petName"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Pet Name:
                  </label>
                  <input
                    id="petName"
                    type="text"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                <div className="text-left">
                  <label
                    htmlFor="species"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Species:
                  </label>
                  <select
                    id="species"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
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

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-left">
                  <label
                    htmlFor="gender"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Gender:
                  </label>
                  <select
                    id="gender"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                <div className="text-left">
                  <label
                    htmlFor="age"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Age:
                  </label>
                  <input
                    id="age"
                    type="date"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={editForm.age}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, age: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="mb-4 text-left">
                <label
                  htmlFor="weight"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Weight:
                </label>
                <input
                  id="weight"
                  type="number"
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={editForm.weight}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, weight: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="mb-4 text-left">
                <label
                  htmlFor="medicalHistory"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Medical History:
                </label>
                <textarea
                  id="medicalHistory"
                  rows={3}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
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

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 pl-72">
          PROFILE CUSTOMER'S PET
        </h2>
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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Image</th>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Species</th>
              <th className="px-4 py-3 text-left font-semibold">Gender</th>
              <th className="px-4 py-3 text-left font-semibold">Owner Name</th>
              <th className="px-4 py-3 text-left font-semibold">Owner Email</th>
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
                    {pet.imageUrl ? (
                      <img
                        src={pet.imageUrl}
                        alt={pet.petName}
                        className="w-12 h-12 object-cover rounded-full ring-1 ring-gray-300"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 border border-gray-300 rounded-full flex items-center justify-center text-xs text-gray-500">
                        No Image
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {pet.petName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {pet.speciesId.speciesName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{pet.gender}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {pet.customerId.fullName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {pet.customerId.email}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(pet._id);
                      }}
                      className=" hover:bg-blue-600 text-white text-xs mr-2 shadow"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(pet._id);
                      }}
                      className=" hover:bg-red-600 text-white text-xs shadow"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>

                {/* Expanded Row */}
                {expandedRows.has(pet._id) && (
                  <tr className="bg-gray-100 transition-all duration-300">
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-base text-gray-700 w-screen"
                    >
                      <div className="flex flex-col md:flex-row md:justify-around gap-4">
                        <div>
                          <strong className="text-gray-800 ">Age:</strong>{" "}
                          {calculateAge(pet.age)}
                        </div>
                        <div>
                          <strong className="text-gray-800">Weight:</strong>{" "}
                          {pet.weight} kg
                        </div>
                        <div className="sm:col-span-2">
                          <strong className="text-gray-800">
                            Medical History:
                          </strong>{" "}
                          {pet.medicalHistory}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewAllPetsForDoctor;
