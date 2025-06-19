import BannerCarousel from "../components/BannerCarousel";
import HeaderDoctor from "../components/HeaderDoctor";
import SpecialtyGrid from "../components/SpecialtyGrid";


const HomeStaff = () => {
  return (
    <div>
      <div className="banner">
        <HeaderDoctor />
      </div>
      <div className="banner">
        <BannerCarousel />
      </div>
      <div className="card">
        <SpecialtyGrid />
      </div>
    </div>
  );
};


export default HomeStaff;