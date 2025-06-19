
import Slider, { Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface Banner {
  id: number;
  image: string;
  alt: string;
}

const BannerCarousel: React.FC = () => {
  const settings: Settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    adaptiveHeight: false,
    pauseOnHover: true,
    customPaging: (i: number) => (
      <div className="w-2 h-2 rounded-full bg-white opacity-50 hover:opacity-100 transition-opacity duration-300" />
    ),
  };

  const banners: Banner[] = [
    {
      id: 1,
      image:
        "https://res.cloudinary.com/dfp3d9ijo/image/upload/v1745550793/pet_app/yqqxt8gtinu1ubllkxqy.jpg",
      alt: "Banner 1",
    },
    {
      id: 2,
      image:
        "https://res.cloudinary.com/dfp3d9ijo/image/upload/v1745550835/pet_app/jaung6pabre9obvtm7a5.jpg",
      alt: "Banner 2",
    },
    {
      id: 3,
      image:
        "https://res.cloudinary.com/dfp3d9ijo/image/upload/v1745550858/pet_app/yterjksfpxghsz6bvnoq.jpg",
      alt: "Banner 3",
    },
  ];

  return (
    <div className="w-full max-h-screen  relative overflow-hidden">
      <Slider {...settings} className="!m-0 !p-0">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="w-full h-[600px]  flex items-center justify-center"
          >
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <img
                src={banner.image}
                alt={banner.alt}
                className="w-full h-full aspect-ratio shadow-md"
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default BannerCarousel;
