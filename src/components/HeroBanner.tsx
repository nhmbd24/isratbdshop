import React, { useState, useEffect } from 'react';
import { Truck, ShieldCheck, Clock, MessageSquare, ChevronRight, ChevronLeft, Sparkles, ArrowRight } from 'lucide-react';
import { Banner, StoreSettings } from '../types';
import { DEFAULT_BANNERS } from '../firebase/db';

interface HeroBannerProps {
  banners?: Banner[];
  settings: StoreSettings;
  onShopNow: () => void;
  onSelectCategory: (categoryId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  banners,
  settings,
  onShopNow,
  onSelectCategory,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const activeBanners = (banners && banners.length > 0
    ? banners.filter((b) => !b.isHidden)
    : DEFAULT_BANNERS
  );

  const slides = activeBanners.length > 0 ? activeBanners : DEFAULT_BANNERS;

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide % slides.length];
  const whatsapp = settings.whatsappNumber || '+8801712345678';
  const shopName = settings.shopName || 'Israt BD Shop';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-2 w-full max-w-full overflow-hidden">
      {/* Banner Carousel Card */}
      <div
        className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r ${
          slide.bgGradient || 'from-rose-900 via-rose-800 to-amber-900'
        } text-white shadow-xl min-h-[340px] sm:min-h-[400px] flex items-center transition-all duration-700 w-full max-w-full`}
      >
        <div className="absolute inset-0 bg-radial from-white/10 via-transparent to-black/40 pointer-events-none" />

        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 p-4 sm:p-10 lg:p-12 items-center min-w-0">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4 min-w-0">
            {slide.badge && (
              <div className="inline-flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-300 text-xs sm:text-sm font-semibold border border-white/20 max-w-full">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{slide.badge}</span>
              </div>
            )}

            <h1 className="text-xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight bengali-font drop-shadow-xs break-words">
              {slide.title}
            </h1>

            {slide.subtitle && (
              <p className="text-slate-200 text-xs sm:text-base max-w-xl bengali-font font-normal leading-relaxed opacity-95">
                {slide.subtitle}
              </p>
            )}

            <div className="pt-1.5 sm:pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  if (slide.categoryTarget) {
                    onSelectCategory(slide.categoryTarget);
                  }
                  onShopNow();
                }}
                className="inline-flex items-center space-x-1.5 sm:space-x-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-lg shadow-amber-400/25 active:scale-95 transition-all text-xs sm:text-base cursor-pointer shrink-0 touch-manipulation"
              >
                <span>{slide.ctaText || 'অর্ডার করুন'}</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`আসসালামু আলাইকুম! ${shopName} থেকে সরাসরি অর্ডার করতে চাই।`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 sm:space-x-2 bg-emerald-600/90 hover:bg-emerald-600 text-white font-semibold px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-full border border-emerald-400/40 backdrop-blur-sm transition-all text-xs sm:text-base cursor-pointer shrink-0 touch-manipulation"
              >
                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-200 shrink-0" />
                <span className="bengali-font">হোয়াটসঅ্যাপে মেসেজ দিন</span>
              </a>
            </div>
          </div>

          {/* Banner Image with overlay tag */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end w-full min-w-0">
            <div className="relative group max-w-[260px] sm:max-w-[340px] w-full mx-auto">
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl w-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1">
                  {slide.discountBadge && (
                    <span className="bg-amber-400 text-slate-950 font-extrabold text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg shadow-sm truncate shrink-0">
                      {slide.discountBadge}
                    </span>
                  )}
                  <span className="text-[10px] sm:text-[11px] text-white/90 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded truncate">
                    ক্যাশ অন ডেলিভারি
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                  currentSlide % slides.length === idx ? 'w-6 sm:w-8 bg-amber-400' : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Arrow Controls */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </>
        )}
      </div>

      {/* Trust Badges Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mt-3 sm:mt-4 w-full max-w-full">
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-slate-200/80 shadow-xs flex items-center space-x-2 sm:space-x-3 min-w-0 overflow-hidden">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] sm:text-sm font-bold text-slate-900 bengali-font truncate">ক্যাশ অন ডেলিভারি</h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 bengali-font truncate">পণ্য দেখে পেমেন্ট</p>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-slate-200/80 shadow-xs flex items-center space-x-2 sm:space-x-3 min-w-0 overflow-hidden">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] sm:text-sm font-bold text-slate-900 bengali-font truncate">১০০% আসল পণ্য</h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 bengali-font truncate">অথেনটিক নিশ্চয়তা</p>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-slate-200/80 shadow-xs flex items-center space-x-2 sm:space-x-3 min-w-0 overflow-hidden">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] sm:text-sm font-bold text-slate-900 bengali-font truncate">৭ দিনের রিটার্ন</h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 bengali-font truncate">সহজ পরিবর্তন</p>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-slate-200/80 shadow-xs flex items-center space-x-2 sm:space-x-3 min-w-0 overflow-hidden">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] sm:text-sm font-bold text-slate-900 bengali-font truncate">হোয়াটসঅ্যাপ চ্যাট</h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 bengali-font truncate">দ্রুত মেসেজ সাপোর্ট</p>
          </div>
        </div>
      </div>
    </div>
  );
};
