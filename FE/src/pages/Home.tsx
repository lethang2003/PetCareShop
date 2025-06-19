import BannerCarousel from "@components/BannerCarousel";
import ClinicList from "@components/ClinicList";
import { useState } from "react";
import AppointmentForm from "@components/AppointmentForm";
import ServiceList from "@components/ServiceList";

const Home = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white pt-24 relative">
      {/* Bong bóng đặt lịch */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl transition-all duration-200"
        title="Đặt lịch hẹn mới"
        onClick={() => setOpen(true)}
      >
        🗓️
      </button>
      <AppointmentForm open={open} onClose={() => setOpen(false)} />
      <div className="banner">
        <BannerCarousel />
      </div>
      <div className="clinic">
        <ClinicList />
      </div>
      <div className="service">
        <ServiceList />
      </div>
    </div>
  );
};

export default Home;
