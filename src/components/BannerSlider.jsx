import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';

export default function BannerSlider({ onBannerClick }) {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const fetchBanners = async () => {
    try {
      const data = await api.banners.list();
      setBanners(data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPrev = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % banners.length);
  };

  const handleBannerClick = () => {
    const banner = banners[currentIndex];
    if (banner && banner.product_id && onBannerClick) {
      const product = {
        id: banner.product_real_id || banner.product_id,
        name: banner.product_name,
        image: banner.product_image,
        price: banner.product_price,
        discount_price: banner.product_discount_price,
        availability: banner.product_availability,
        brand: banner.product_brand,
        generic_name: banner.product_generic_name,
        description: banner.product_description,
        category_id: banner.product_category_id,
        category_name: banner.category_name,
      };
      if (product.id && product.name) {
        onBannerClick(product);
      }
    } else if (banner?.link) {
      window.location.href = banner.link;
    }
  };

  if (loading || banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden mb-8">
      <button
        onClick={handleBannerClick}
        className="block w-full h-full cursor-pointer"
      >
        <img
          src={currentBanner.image}
          alt={currentBanner.title || 'Banner'}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        {(currentBanner.title || currentBanner.subtitle) && (
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            {currentBanner.title && (
              <h2 className="text-xl sm:text-2xl font-medium mb-1">{currentBanner.title}</h2>
            )}
            {currentBanner.subtitle && (
              <p className="text-sm sm:text-base opacity-90">{currentBanner.subtitle}</p>
            )}
          </div>
        )}
      </button>

      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}