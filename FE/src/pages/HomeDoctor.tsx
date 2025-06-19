import BannerCarousel from "../components/BannerCarousel";
import HeaderDoctor from "../components/HeaderDoctor";
import SpecialtyGrid from "../components/SpecialtyGrid";
import { Outlet, useLocation } from "react-router-dom";

const HomeDoctor = () => {
  const location = useLocation();
  const isHomeDoctor = location.pathname === "/doctor";

  return (
    <div>
      <div className="banner">
        <HeaderDoctor />
      </div>
      <Outlet />
      {isHomeDoctor && (
        <>
          <div className="banner">
            <BannerCarousel />
          </div>
          <div className="card">
            <SpecialtyGrid />
          </div>
        </>
      )}
    </div>
  );
};

export default HomeDoctor;