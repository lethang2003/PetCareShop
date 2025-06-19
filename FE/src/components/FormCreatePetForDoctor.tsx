import { useState, ChangeEvent, FormEvent } from "react";
import { UploadCloud } from "lucide-react";
import { createPetsDoctor } from "../utils/PetsAPI";
import toast, { Toaster } from "react-hot-toast";

interface PetFormData {
  email: string;
  phone: string;
  petName: string;
  species: string;
  gender: string;
  age: string | number;
  weight: string | number;
  medicalHistory: string;
  imageFile: File | null;
  imagePreview: string | null;
}

interface SubmitMessage {
  text: string;
  isError: boolean;
}

const FormCreatePetForDoctor: React.FC = () => {
  const [formData, setFormData] = useState<PetFormData>({
    email: "",
    phone: "",
    petName: "",
    species: "",
    gender: "",
    age: "",
    medicalHistory: "",
    weight: "",
    imageFile: null,
    imagePreview: null,
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<SubmitMessage>({
    text: "",
    isError: false,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "age" ? (value === "" ? "" : parseInt(value)) : value,
    });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setFormData({
        ...formData,
        imageFile: files[0],
        imagePreview: URL.createObjectURL(files[0]),
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage({ text: "", isError: false });

    try {
      // Create FormData object to send to the API
      const petFormData = new FormData();
      petFormData.append("petDetails[email]", formData.email.toString());
      petFormData.append("petDetails[phone]", formData.phone.toString());
      petFormData.append("petDetails[petName]", formData.petName.toString());
      petFormData.append("petDetails[species]", formData.species);
      petFormData.append("petDetails[gender]", formData.gender);
      petFormData.append("petDetails[weight]", formData.weight.toString());
      petFormData.append("petDetails[age]", formData.age.toString());
      petFormData.append("petDetails[medicalHistory]", formData.medicalHistory);

      if (formData.imageFile) {
        petFormData.append("image", formData.imageFile);
      }

      // Replace with your actual API endpoint
      const response = await createPetsDoctor(petFormData);
      console.log(response);

      if (response.success) {
        toast.success("Pet created successfully!");
        // Reset form after successful submission
        setFormData({
          email: "",
          phone: "",
          petName: "",
          species: "",
          gender: "",
          weight: "",
          age: "",
          medicalHistory: "",
          imageFile: null,
          imagePreview: null,
        });
      } else {
        toast.error("Failed to create pet. Please try again.");
      }
    } catch (error) {
      console.error("Error creating pet:", error);
      setSubmitMessage({
        text: "An error occurred while creating the pet",
        isError: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-yellow-400">
      <Toaster position="top-center" reverseOrder={false} />
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 border-b-2 border-yellow-400 pb-2">
        Create New Pet Profile
      </h2>

      {submitMessage.text && (
        <div
          className={`mb-4 p-3 rounded ${
            submitMessage.isError
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {submitMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pet Name */}
          <div>
            <label
              htmlFor="petName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Customer <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="petName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Customer <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="petName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Pet Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="petName"
              name="petName"
              value={formData.petName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          {/* Species */}
          <div>
            <label
              htmlFor="species"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Species <span className="text-red-500">*</span>
            </label>
            <select
              id="species"
              name="species"
              value={formData.species}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            >
              <option value="">-- Select species --</option>
              <option value="chim">Chim</option>
              <option value="chuột">Chuột</option>
              <option value="chó">Chó</option>
              <option value="mèo">Mèo</option>
              <option value="thỏ">Thỏ</option>
            </select>
          </div>

          {/* Breed */}
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            >
              <option value="">-- Select species --</option>
              <option value="đực">Đực</option>
              <option value="cái">Cái</option>
            </select>
          </div>

          {/* Age */}
          <div>
            <label
              htmlFor="age"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
        </div>

          <div>
            <label
              htmlFor="weight"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Weight (kg) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

        {/* Medical History */}
        <div>
          <label
            htmlFor="medicalHistory"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Medical History
          </label>
          <textarea
            id="medicalHistory"
            name="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pet Image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-yellow-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {formData.imagePreview ? (
                <div className="mb-3">
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="mx-auto h-40 w-auto object-cover rounded-md"
                  />
                </div>
              ) : (
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="image-upload"
                  className="relative cursor-pointer bg-yellow-100 rounded-md font-medium text-yellow-700 hover:text-yellow-800 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500 px-3 py-1"
                >
                  <span>Upload a file</span>
                  <input
                    id="image-upload"
                    name="image-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
                <p className="pl-1 pt-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Creating..." : "Create Pet"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormCreatePetForDoctor;
