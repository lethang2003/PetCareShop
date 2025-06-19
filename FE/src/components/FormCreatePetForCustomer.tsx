import { useState, ChangeEvent, FormEvent } from "react";
import { UploadCloud } from "lucide-react";
import { createPetsCustomer } from "../utils/PetsAPI";

interface PetFormData {
  petName: string;
  species: string;
  gender: string;
  age: string | number;
  medicalHistory: string;
  imageFile: File | null;
  weight: string | number;
  imagePreview: string | null;
}

interface SubmitMessage {
  text: string;
  isError: boolean;
}

interface FormCreatePetForCustomerProps {
  onSuccess?: () => void;
}

const FormCreatePetForCustomer: React.FC<FormCreatePetForCustomerProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<PetFormData>({
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
      petFormData.append("petDetails[petName]", formData.petName.toString());
      petFormData.append("petDetails[species]", formData.species);
      petFormData.append("petDetails[gender]", formData.gender);
      petFormData.append("petDetails[age]", formData.age.toString());
      petFormData.append("petDetails[weight]", formData.weight.toString());
      petFormData.append("petDetails[medicalHistory]", formData.medicalHistory);

      if (formData.imageFile) {
        petFormData.append("image", formData.imageFile);
      }

      // Replace with your actual API endpoint
      const response = await createPetsCustomer(petFormData);
      console.log(response);

      if (response.success) {
        setSubmitMessage({ text: "Pet created successfully!", isError: false });
        setFormData({
          petName: "",
          species: "",
          gender: "",
          age: "",
          medicalHistory: "",
          weight: "",
          imageFile: null,
          imagePreview: null,
        });
        if (onSuccess) onSuccess();
      } else {
        setSubmitMessage({
          text: response.message || "Failed to create pet",
          isError: true,
        });
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
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-2xl shadow-2xl border border-gray-200 relative">
      <h2 className="text-2xl font-bold mb-4 text-center text-orange-700">Create New Pet</h2>
      {submitMessage.text && (
        <div
          className={`mb-4 p-3 rounded text-center text-sm font-semibold ${submitMessage.isError
            ? "bg-red-100 text-red-700"
            : "bg-green-100 text-green-700"
            }`}
        >
          {submitMessage.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="petName" className="block text-xs font-medium text-gray-500 mb-1">Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="petName"
              name="petName"
              value={formData.petName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 text-base"
              required
            />
          </div>
          <div>
            <label htmlFor="species" className="block text-xs font-medium text-gray-500 mb-1">Species <span className="text-red-500">*</span></label>
            <select
              id="species"
              name="species"
              value={formData.species}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 text-base"
              required
            >
              <option value="">Select species</option>
              <option value="bird">Bird</option>
              <option value="mouse">Mouse</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="rabbit">Rabbit</option>
            </select>
          </div>
          <div>
            <label htmlFor="gender" className="block text-xs font-medium text-gray-500 mb-1">Gender <span className="text-red-500">*</span></label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 text-base"
              required
            >
              <option value="">Select gender</option>
              <option value="đực">Male</option>
              <option value="cái">Female</option>
            </select>
          </div>
          <div>
            <label htmlFor="weight" className="block text-xs font-medium text-gray-500 mb-1">Weight <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 text-base"
              required
            />
          </div>
          <div>
            <label htmlFor="age" className="block text-xs font-medium text-gray-500 mb-1">Age <span className="text-red-500">*</span></label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 text-base"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="medicalHistory" className="block text-xs font-medium text-gray-500 mb-1">Medical History</label>
          <textarea
            id="medicalHistory"
            name="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 text-base"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Pet Image</label>
          <div className="mt-1 flex flex-col items-center justify-center px-4 pt-3 pb-4 border-2 border-dashed border-gray-300 rounded-md">
            {formData.imagePreview ? (
              <img
                src={formData.imagePreview}
                alt="Preview"
                className="mx-auto h-28 w-28 object-cover rounded-md mb-2"
              />
            ) : (
              <UploadCloud className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            )}
            <label
              htmlFor="image-upload"
              className="relative cursor-pointer bg-orange-100 rounded-md font-medium text-orange-700 hover:text-orange-800 px-3 py-1 text-sm"
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
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-5 py-2 rounded-md bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-md text-white font-semibold bg-orange-500 hover:bg-orange-600 transition-colors ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "Creating..." : "Create Pet"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormCreatePetForCustomer;
