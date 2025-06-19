import { useEffect, useState } from "react";
import { fetchAllClinics } from "../../utils/fetchClinic";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";

type Clinic = {
  _id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  images: string[];
  isVerified: boolean;
  managerId?: {
    _id: string;
    fullName: string;
    email?: string;
  };
};

const ClinicManagement: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const clinicsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await fetchAllClinics();
        setClinics(data);
      } catch (error) {
        console.error("Error fetching clinics", error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const totalPages = Math.ceil(clinics.length / clinicsPerPage);
  const currentClinics = clinics.slice(
    (currentPage - 1) * clinicsPerPage,
    currentPage * clinicsPerPage
  );

  return (
    <div className="min-h-screen-full mt-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Clinic Management</h2>

        <div className="flex space-x-3">
          <button
            onClick={() => navigate("/dashboardmanage/admin/clinic/create")}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center text-sm"
          >
            <span className="mr-2 text-lg">+</span> Create Clinic
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Image</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Address</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">City</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Manager</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Verified</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentClinics.map((clinic, index) => (
                  <tr key={clinic._id} className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 overflow-hidden rounded-lg border bg-gray-200">
                        {clinic.images?.[0] ? (
                          <img src={clinic.images[0]} alt={clinic.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center text-gray-500 text-xs h-full">No image</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{clinic.name}</td>
                    <td className="py-3 px-4 text-gray-700">{clinic.address}</td>
                    <td className="py-3 px-4 text-gray-700">{clinic.city}</td>
                    <td className="py-3 px-4 text-gray-700">{clinic.phone}</td>
                    <td className="py-3 px-4 text-gray-700">{clinic.email}</td>
                    <td className="py-3 px-4 text-gray-700">{clinic.managerId?.fullName || "—"}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          clinic.isVerified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {clinic.isVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => navigate(`/dashboardmanage/admin/clinic/update/${clinic._id}`)}
                        className="text-yellow-600 hover:text-yellow-800 transition"
                        title="Edit Clinic"
                      >
                        <Pencil className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && clinics.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <button
            className={`flex items-center px-3 py-2 ${
              currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>

          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`w-8 h-8 rounded text-sm ${
                  currentPage === page ? "bg-yellow-600 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className={`flex items-center px-3 py-2 ${
              currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default ClinicManagement;