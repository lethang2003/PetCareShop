import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getNearbyClinics } from "@utils/Clinic";

// Icon mặc định (xanh dương)
const clinicIcon = new L.Icon({
  iconUrl: "/clinic-marker.png",
  iconSize: [32, 32],
});

// Icon của phòng khám bạn tạo (cam)
const myClinicIcon = new L.Icon({
  iconUrl: "/my-clinic-marker.png",
  iconSize: [32, 32],
});

interface Clinic {
  _id: string;
  name: string;
  address: string;
  location: {
    coordinates: [number, number]; // [lng, lat]
  };
  managerId: string;
}

const MapWithClinics = ({ currentUserId }: { currentUserId: string }) => {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      setUserPosition([lat, lng]);

      const res = await getNearbyClinics(lat, lng);
      if (res.success) {
        setClinics(res.data);
      }
    });
  }, []);

  if (!userPosition) return <p>Đang lấy vị trí...</p>;

  return (
    <MapContainer
      center={userPosition}
      zoom={14}
      scrollWheelZoom={true}
      className="h-[600px] w-full rounded-xl shadow"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Marker vị trí người dùng */}
      <Marker position={userPosition}>
        <Popup>Vị trí của bạn</Popup>
      </Marker>

      {/* Các phòng khám */}
      {clinics.map((clinic) => (
        <Marker
          key={clinic._id}
          position={[clinic.location.coordinates[1], clinic.location.coordinates[0]]}
          icon={clinic.managerId === currentUserId ? myClinicIcon : clinicIcon}
        >
          <Popup>
            <strong>{clinic.name}</strong>
            <br />
            {clinic.address}
            <br />
            {clinic.managerId === currentUserId && <em>(Phòng khám bạn tạo)</em>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapWithClinics;
