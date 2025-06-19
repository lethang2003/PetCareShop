import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud } from "lucide-react";
import { createClinic } from "@utils/fetchClinic";
import axios from "axios";
import { baseURL } from "@common/SummarryAPI";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React from "react";

const CreateClinic: React.FC = () => {
  const navigate = useNavigate();
  const [managers, setManagers] = useState<{ _id: string; fullName: string }[]>([]);

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
    managerId: ""
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/v1/users/get-all-users`);
        const filtered = response.data.data.filter((user: any) => user.role === "manager");
        setManagers(filtered);
      } catch (error) {
        console.error("Error fetching managers", error);
      }
    };
    fetchManagers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{9,10}$/; // chỉ số, từ 9–10  chữ số
    const licenseRegex = /^[a-zA-Z0-9\-]+$/;

    if (!form.name.trim()) return "Clinic name is required";
    if (!emailRegex.test(form.email)) return "Invalid email format";
    if (!phoneRegex.test(form.phone)) return "Phone number must be 9-11 digits";
    if (!form.city.trim()) return "City is required";
    if (!form.address.trim()) return "Address is required";
    if (!form.licenseNumber.trim()) return "License number is required";
    if (!licenseRegex.test(form.licenseNumber)) return "License number is invalid";
    if (!form.managerId) return "Please select a manager";

    return null; // hợp lệ
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      toast.warning(validationError);
      return;
    }
    setUploading(true);
    try {
      await createClinic(form, imageFiles.length > 0 ? imageFiles : undefined);
      toast.success("Clinic created successfully!");
      setTimeout(() => {
        navigate("/dashboardmanage/admin/clinic");
      }, 2000);
    } catch (err) {
      console.error("Error creating clinic", err);
      toast.error("Failed to create clinic.");
    } finally {
      setUploading(false);
    }
  };

  const handleBack = () => {
    navigate("/dashboardmanage/admin/clinic");
  };

  return (
    <div className="h-screen flex justify-center items-center px-4 overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg px-6 py-5">
        <h2 className="text-2xl font-bold text-yellow-700 mb-1">Create Clinic</h2>
        <p className="text-sm text-yellow-600 mb-4">Enter new clinic information</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-yellow-700 mb-1 block">Clinic Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Enter name" className="w-full border border-yellow-700 px-3 py-1.5 rounded-xl text-sm focus:outline-none hover:bg-yellow-100/40 transition" />
            </div>
            <div>
              <label className="text-sm font-semibold text-yellow-700 mb-1 block">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" className="w-full border border-yellow-700 px-3 py-1.5 rounded-xl text-sm focus:outline-none hover:bg-yellow-100/40 transition" />
            </div>
            <div>
              <label className="text-sm font-semibold text-yellow-700 mb-1 block">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="0909xxxxxx" className="w-full border border-yellow-700 px-3 py-1.5 rounded-xl text-sm focus:outline-none hover:bg-yellow-100/40 transition" />
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
            <input name="address" value={form.address} onChange={handleChange} placeholder="Full address" className="w-full border border-yellow-700 px-3 py-1.5 rounded-xl text-sm focus:outline-none hover:bg-yellow-100/40 transition" />
          </div>

          <div>
            <label className="text-sm font-semibold text-yellow-700 mb-1 block">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Clinic description" className="w-full border border-yellow-700 px-3 py-1.5 rounded-xl text-sm focus:outline-none hover:bg-yellow-100/40 transition" rows={3}></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-yellow-700 mb-1 block">License Number</label>
              <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} placeholder="123456" className="w-full border border-yellow-700 px-3 py-1.5 rounded-xl text-sm focus:outline-none hover:bg-yellow-100/40 transition" />
            </div>
            <div>
              <label className="text-sm font-semibold text-yellow-700 mb-1 block">Manager</label>
              <select name="managerId" value={form.managerId} onChange={handleChange} className="w-full border border-yellow-700 px-3 py-1.5 rounded-xl text-sm focus:outline-none hover:bg-yellow-100/40 transition">
                <option value="">-- Select Manager --</option>
                {managers.map((manager) => (
                  <option key={manager._id} value={manager._id}>{manager.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-yellow-700 block">Upload Images</label>
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-yellow-700 border-dashed rounded-xl cursor-pointer hover:bg-yellow-100/40 transition"
            >
              {imageFiles.length === 0 && (
                <>
                  <UploadCloud className="h-6 w-6 text-yellow-500 mb-1" />
                  <span className="text-sm text-yellow-600 font-medium">Upload files</span>
                  <span className="text-xs text-yellow-500">PNG, JPG, GIF up to 10MB</span>
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

              {imageFiles.length > 0 && (
                <>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {imageFiles.map((file, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <span className="text-xs text-yellow-700">{file.name}</span>
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="h-16 w-16 object-cover rounded border border-yellow-300 shadow"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageFiles([])}
                    className="mt-2 text-xs font-semibold text-red-600 underline hover:text-red-800 transition"
                  >
                    Clear selected images
                  </button>
                </>
              )}
            </label>
          </div>

          <div className="flex justify-center gap-6 pt-4">
            <button type="button" onClick={handleBack} className="bg-yellow-500 border text-white border-yellow-300 px-5 py-2 rounded-xl hover:bg-yellow-600 text-sm transition">
              Back
            </button>
            <button type="submit" className="bg-yellow-700 text-white px-5 py-2 rounded-xl hover:bg-yellow-800 text-sm transition" disabled={uploading}>
              {uploading ? "Uploading..." : "Create Clinic"}
            </button>  
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClinic;