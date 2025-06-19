import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UploadCloud, X } from "lucide-react";
import { getClinicById, updateClinic } from "@utils/fetchClinic";
import axios from "axios";
import { baseURL } from "@common/SummarryAPI";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UpdateClinic: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [managers, setManagers] = useState<{ _id: string; fullName: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    description: "",
    licenseNumber: "",
    licenseImage: "Chua co",
    isVerified: true,
    managerId: "",
  });

  // Multi-image update states
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [selectedImageIndexes, setSelectedImageIndexes] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        setLoading(true);
        const data = await getClinicById(id!);
        const {
          name, address, city, phone, email, description,
          licenseNumber, licenseImage, isVerified, managerId, images,
        } = data;
        setForm({
          name, address, city, phone, email, description,
          licenseNumber, licenseImage, isVerified, managerId,
        });
        if (images) {
          const imgs = Array.isArray(images) ? images : [images];
          setCurrentImages(imgs);
          setSelectedImageIndexes([]);
        }
      } catch (error) {
        toast.error("Failed to load clinic data");
      } finally {
        setLoading(false);
      }
    };

    const fetchManagers = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/v1/users/get-all-users`);
        const filtered = response.data.data.filter((user: any) => user.role === "manager");
        setManagers(filtered);
      } catch (error) {
        console.error("Error fetching managers", error);
      }
    };

    fetchClinic();
    fetchManagers();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{9,11}$/;
    const licenseRegex = /^[a-zA-Z0-9\-]+$/;

    if (!form.name.trim()) return "Clinic name is required";
    if (!emailRegex.test(form.email)) return "Invalid email format";
    if (!phoneRegex.test(form.phone)) return "Phone number must be 9-11 digits";
    if (!form.city.trim()) return "City is required";
    if (!form.address.trim()) return "Address is required";
    if (!form.licenseNumber.trim()) return "License number is required";
    if (!licenseRegex.test(form.licenseNumber)) return "License number is invalid";
    if (!form.managerId) return "Please select a manager";

    return null;
  };

  const handleRemoveImage = (idx: number) => {
    setCurrentImages(prev => prev.filter((_, i) => i !== idx));
    setSelectedImageIndexes(prev => prev.filter(i => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errorMessage = validateForm();
    if (errorMessage) {
      toast.warning(errorMessage);
      return;
    }

    setUploading(true);
    try {
      let images = [...currentImages];

      if (imageFiles.length > 0) {
        const uploadForm = new FormData();
        imageFiles.forEach(file => uploadForm.append("image", file));
        const uploadRes = await axios.post(
          `${baseURL}/api/v1/upload/upload-image`,
          uploadForm
        );
        const urls = uploadRes.data?.data?.urls || [];

        if (selectedImageIndexes.length === imageFiles.length && selectedImageIndexes.length > 0) {
          // Thay thế đúng vị trí
          selectedImageIndexes.forEach((idx, i) => {
            if (urls[i]) images[idx] = urls[i];
          });
        } else {
          // Không chọn vị trí, thêm mới vào cuối
          images = images.concat(urls);
        }
      }

      images = images.map(img => img || "");
      await updateClinic(id!, { ...form, images });
      toast.success("Clinic updated successfully!");
      setTimeout(() => {
        navigate("/dashboardmanage/admin/clinic");
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update clinic");
    } finally {
      setUploading(false);
    }
  };

  const handleBack = () => {
    navigate("/dashboardmanage/admin/clinic");
  };

  // UI chọn nhiều ảnh cũ để thay thế
  const handleSelectImage = (idx: number) => {
    setSelectedImageIndexes(prev =>
      prev.includes(idx)
        ? prev.filter(i => i !== idx)
        : [...prev, idx]
    );
  };

  // Hiển thị tên file đã chọn
  const renderSelectedFiles = () => (
    <div className="flex flex-wrap gap-2 mt-2">
      {imageFiles.map((file, i) => (
        <div key={i} className="flex flex-col items-center">
          <span className="text-xs text-yellow-700">{file.name}</span>
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="h-16 w-16 object-cover rounded border border-yellow-300 shadow"
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex justify-center px-4 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg px-6 py-5 my-8">
        <h2 className="text-2xl font-bold text-yellow-700 mb-1">Update Clinic</h2>
        <p className="text-sm text-yellow-600 mb-4">Edit clinic information</p>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-yellow-700 mb-1 block">Clinic Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full border border-yellow-700 px-3 py-1.5 rounded-xl text-sm focus:outline-none hover:bg-yellow-100/40 transition" />
              </div>
              <div>
                <label className="text-sm font-semibold text-yellow-700 mb-1 block">Email</label>
                <input name="email" value={form.email} onChange={handleChange} className="w-full border border-yellow-700 px-3 py-1.5 rounded-xl text-sm focus:outline-none hover:bg-yellow-100/40 transition" />
              </div>
              <div>
                <label className="text-sm font-semibold text-yellow-700 mb-1 block">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="w-full border border-yellow-700 px-3 py-1.5 rounded-xl text-sm focus:outline-none hover:bg-yellow-100/40 transition" />
              </div>
              <div>
                <label className="text-sm font-semibold text-yellow-700 mb-1 block">City</label>
                <select
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full border border-yellow-700 px-3 py-1.5 rounded-xl text-sm focus:outline-none hover:bg-yellow-100/40 transition"
                >
                  <option value="">-- Select City --</option>
                  <option>An Giang</option>
                  <option>Bac Lieu</option>
                  <option>Ben Tre</option>
                  <option>Ca Mau</option>
                  <option>Can Tho</option>
                  <option>Dong Thap</option>
                  <option>Hau Giang</option>
                  <option>Kien Giang</option>
                  <option>Long An</option>
                  <option>Soc Trang</option>
                  <option>Tien Giang</option>
                  <option>Tra Vinh</option>
                  <option>Vinh Long</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-yellow-700 mb-1 block">Address</label>
              <input name="address" value={form.address} onChange={handleChange} className="w-full border border-yellow-700 px-3 py-1.5 rounded-xl text-sm focus:outline-none hover:bg-yellow-100/40 transition" />
            </div>

            <div>
              <label className="text-sm font-semibold text-yellow-700 mb-1 block">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border border-yellow-700 px-3 py-1.5 rounded-xl text-sm focus:outline-none hover:bg-yellow-100/40 transition"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-yellow-700 mb-1 block">License Number</label>
                <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} className="w-full border border-yellow-700 px-3 py-1.5 rounded-xl text-sm focus:outline-none hover:bg-yellow-100/40 transition" />
              </div>
              <div>
                <label className="text-sm font-semibold text-yellow-700 mb-1 block">Manager</label>
                <select name="managerId" value={form.managerId} onChange={handleChange} className="w-full border border-yellow-700 px-3 py-1.5 rounded-xl text-sm focus:outline-none hover:bg-yellow-100/40 transition">
                  <option value="">-- Select Manager --</option>
                  {managers.map((m) => (
                    <option key={m._id} value={m._id}>{m.fullName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-yellow-700 block mb-1">Current Images (multi-select to replace)</label>
              <div className="flex gap-3 mb-2">
                {currentImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative cursor-pointer border-2 rounded-md p-1 ${selectedImageIndexes.includes(idx) ? "border-yellow-700" : "border-gray-200"}`}
                    onClick={() => handleSelectImage(idx)}
                  >
                    <img
                      src={img}
                      alt={`Current ${idx + 1}`}
                      className="h-20 w-20 object-cover rounded"
                    />
                    <div className="text-xs text-center mt-1">{selectedImageIndexes.includes(idx) ? "Selected" : ""}</div>
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      onClick={e => {
                        e.stopPropagation();
                        handleRemoveImage(idx);
                      }}
                      title="Remove"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-yellow-700 block mb-1">Upload New Images (replace selected)</label>
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-yellow-700 border-dashed rounded-xl cursor-pointer hover:bg-yellow-100/40 transition px-4 py-3"
              >
                {imageFiles.length === 0 && (
                  <>
                    <UploadCloud className="h-6 w-6 text-yellow-500 mb-1" />
                    <span className="text-sm text-yellow-600 font-medium">Upload files</span>
                    <span className="text-xs text-yellow-500">PNG, JPG, GIF up to 10MB</span>
                  </>
                )}
                {imageFiles.length > 0 && (
                  <>
                    {renderSelectedFiles()}
                    <button
                      type="button"
                      onClick={() => setImageFiles([])}
                      className="mt-2 text-xs font-semibold text-red-600 underline hover:text-red-800 transition"
                    >
                      Clear selected images
                    </button>
                  </>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex justify-center gap-6 pt-4">
              <button type="button" onClick={handleBack} className="bg-yellow-500 text-white px-5 py-2 rounded-xl hover:bg-yellow-600 text-sm transition">
                Back
              </button>
              <button type="submit" className="bg-yellow-700 text-white px-5 py-2 rounded-xl hover:bg-yellow-800 text-sm transition" disabled={uploading}>
                {uploading ? "Updating..." : "Update Clinic"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateClinic;