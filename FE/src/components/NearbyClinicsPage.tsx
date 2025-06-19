import MapWithClinics from "./MapWithClinics";

const NearbyClinicsPage = () => {
  const userId = localStorage.getItem("userId"); // hoặc lấy từ redux

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6">Phòng khám gần bạn</h2>
      <MapWithClinics currentUserId={userId || ""} />
    </div>
  );
};

export default NearbyClinicsPage;
