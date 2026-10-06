import React, { useState, useEffect } from 'react';
import { Product, StoreSettings } from '../types';
import { formatBDT, generateDirectWhatsAppUrl, openFacebookShare, handleProductShare } from '../utils/helpers';
import {
  ArrowLeft,
  MessageCircle,
  Share2,
  Star,
  Truck,
  ShieldCheck,
  Phone,
  Clock,
  Award,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export interface ProductDetailsModalProps {
  product: Product | null;
  settings?: StoreSettings;
  onClose?: () => void;
  onBack?: () => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsModalProps> = ({
  product,
  settings,
  onClose,
  onBack,
}) => {
  if (!product) return null;

  const handleBack = onBack || onClose || (() => {});

  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.availableSizes ? product.availableSizes[0] : undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.availableColors ? product.availableColors[0] : undefined
  );

  // Sync state if product changes
  useEffect(() => {
    setSelectedImage(product.image);
    setSelectedSize(product.availableSizes ? product.availableSizes[0] : undefined);
    setSelectedColor(product.availableColors ? product.availableColors[0] : undefined);
  }, [product]);

  const images = [product.image, ...(product.additionalImages || [])].filter(
    (v, i, a) => a.indexOf(v) === i
  );

  const handleWhatsAppOrder = () => {
    const url = generateDirectWhatsAppUrl(
      product,
      settings?.whatsappNumber,
      settings?.shopNameBn || settings?.shopName,
      selectedSize,
      selectedColor
    );
    window.open(url, '_blank');
  };

  const handleFacebookShare = () => {
    handleProductShare(product, settings?.shopName);
  };

  const savings = Math.max(0, product.originalPrice - product.offerPrice);
  const hotline = settings?.phoneNumber || '01712-345678';

  return (
    <div className="min-h-screen w-full max-w-full bg-slate-50 text-slate-800 flex flex-col pb-24 sm:pb-12 animate-in fade-in duration-200">
      {/* Top Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          {/* Back Arrow Button */}
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center space-x-1.5 sm:space-x-2 text-slate-700 hover:text-emerald-700 active:text-emerald-800 bg-slate-100 hover:bg-slate-200/90 active:bg-slate-200 px-3 sm:px-4 py-2 rounded-xl transition-all font-bold text-xs sm:text-sm cursor-pointer touch-manipulation min-h-[40px] shadow-xs active:scale-95"
            aria-label="ফিরে যান"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 shrink-0" />
            <span className="bengali-font">ফিরে যান</span>
          </button>

          {/* Center Store Brand / Indicator */}
          <div className="flex items-center space-x-2 truncate">
            <span className="font-extrabold text-sm sm:text-base text-emerald-800 bengali-font truncate">
              {settings?.shopNameBn || settings?.shopName || 'ইসমত বিডি শপ'}
            </span>
            <span className="hidden sm:inline-block text-slate-300">|</span>
            <span className="hidden sm:inline-block text-xs text-slate-500 font-medium bengali-font truncate">
              {product.nameBn}
            </span>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleFacebookShare}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-600 flex items-center justify-center transition-colors cursor-pointer touch-manipulation"
              title="ফেসবুকে শেয়ার করুন"
              aria-label="Share on Facebook"
            >
              <Share2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-600" />
            </button>

            {hotline && (
              <a
                href={`tel:${hotline.replace(/[^0-9]/g, '')}`}
                className="hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors"
                title="হটলাইনে কল করুন"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{hotline}</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4 w-full">
        <nav className="flex items-center space-x-1.5 text-xs text-slate-500 bengali-font truncate">
          <button
            type="button"
            onClick={handleBack}
            className="hover:text-emerald-700 text-slate-600 font-semibold cursor-pointer underline flex items-center space-x-1"
          >
            <span>হোম শপ</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-emerald-700 font-medium truncate max-w-[120px] sm:max-w-none">
            {product.categoryBn}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-400 font-normal truncate max-w-[150px] sm:max-w-xs">
            {product.nameBn}
          </span>
        </nav>
      </div>

      {/* Main Full-Screen Product Details Page Container */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-6 w-full flex-1">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Column: Image Gallery & Badges */}
            <div className="lg:col-span-6 bg-slate-50/70 p-4 sm:p-6 lg:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80">
              <div className="w-full">
                {/* Main Product Image */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xs mb-3 flex items-center justify-center">
                  <img
                    src={selectedImage}
                    alt={product.nameBn}
                    className="w-full h-full object-cover"
                  />
                  {product.discountPercent > 0 && (
                    <span className="absolute top-3 left-3 bg-rose-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                      -{product.discountPercent}% ছাড়
                    </span>
                  )}
                  {product.isHotDeal && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>হট ডিল</span>
                    </span>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1">
                    {images.map((img, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition-all shrink-0 ${
                          selectedImage === img
                            ? 'border-emerald-600 ring-2 ring-emerald-500/30 shadow-xs'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                        aria-label={`View image ${idx + 1}`}
                      >
                        <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Guarantees Under Image */}
              <div className="w-full mt-4 sm:mt-6 bg-emerald-50/80 border border-emerald-100 rounded-2xl p-3.5 text-xs space-y-2 text-emerald-950 bengali-font">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    {product.deliveryInfo || 'সারা দেশে ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে টাকা দিন)'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    {product.guaranteeDetails || '৭ দিনের ফ্রি রিপ্লেসমেন্ট গ্যারান্টি'}
                  </span>
                </div>
                {product.warrantyDetails && (
                  <div className="flex items-center space-x-2 text-amber-900">
                    <Award className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>ওয়ারেন্টি: {product.warrantyDetails}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Product Info & Actions */}
            <div className="lg:col-span-6 p-4 sm:p-6 lg:p-8 flex flex-col justify-between space-y-5">
              <div>
                {/* Category & Rating */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md bengali-font">
                    {product.categoryBn}
                  </span>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold text-slate-800 text-sm ml-1">{product.rating}</span>
                    </div>
                    <span className="text-xs text-slate-400">({product.reviewCount} কাস্টমার রিভিউ)</span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-snug bengali-font">
                  {product.nameBn}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  {product.name}
                </p>

                {/* Price Box */}
                <div className="mt-4 p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500 bengali-font">অফার প্রাইস:</div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                        {formatBDT(product.offerPrice)}
                      </span>
                      {product.originalPrice > product.offerPrice && (
                        <span className="text-sm text-slate-400 line-through">
                          {formatBDT(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    {savings > 0 && (
                      <span className="inline-block bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-lg bengali-font">
                        মোট সাশ্রয়: {formatBDT(savings)}
                      </span>
                    )}
                    <div className="text-[11px] font-semibold mt-1 bengali-font">
                      {product.inStock ? (
                        <span className="text-emerald-600 font-bold">✓ স্টকে আছে</span>
                      ) : (
                        <span className="text-rose-600 font-bold">✕ স্টক শেষ</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Color Selector */}
                {product.availableColors && product.availableColors.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 bengali-font">
                      কালার বেছে নিন (Color):
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.availableColors.map((color) => (
                        <button
                          type="button"
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border touch-manipulation ${
                            selectedColor === color
                              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                {product.availableSizes && product.availableSizes.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 bengali-font">
                      সাইজ বেছে নিন (Size):
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.availableSizes.map((size) => (
                        <button
                          type="button"
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border touch-manipulation ${
                            selectedSize === size
                              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons: Prominent WhatsApp Order & Facebook Share */}
                <div className="mt-5 space-y-2.5">
                  <button
                    type="button"
                    onClick={handleWhatsAppOrder}
                    disabled={!product.inStock}
                    className="w-full py-3.5 sm:py-4 px-4 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1caa51] text-white font-black rounded-2xl shadow-lg shadow-[#25D366]/25 flex items-center justify-center space-x-2 text-base transition-all cursor-pointer active:scale-98 disabled:opacity-50 touch-manipulation group"
                  >
                    <MessageCircle className="w-5 h-5 fill-current text-white shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="bengali-font tracking-wide">WhatsApp অর্ডার</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFacebookShare}
                    className="w-full py-2.5 px-3 rounded-2xl font-bold text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center space-x-2 transition-colors cursor-pointer touch-manipulation"
                  >
                    <Share2 className="w-4 h-4 text-blue-600" />
                    <span className="bengali-font">ফেসবুকে শেয়ার করুন</span>
                  </button>
                </div>

                {/* Description & Specifications */}
                <div className="mt-6 border-t border-slate-200 pt-4 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 bengali-font">
                    পণ্যের বিস্তারিত বিবরণ:
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bengali-font whitespace-pre-line">
                    {product.fullDescBn || product.shortDescBn}
                  </p>

                  {/* Expiry Details */}
                  {product.expiryDetails && (
                    <div className="flex items-center space-x-2 text-xs text-slate-600 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>
                        <strong className="bengali-font">মেয়াদ / সংরক্ষণ তথ্য: </strong>
                        {product.expiryDetails}
                      </span>
                    </div>
                  )}

                  {/* Specs Table */}
                  {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <div className="mt-3 bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200/80">
                      <h5 className="text-xs font-bold text-slate-700 mb-2 bengali-font">
                        স্পেসিফিকেশন (Specifications):
                      </h5>
                      <div className="space-y-1.5 text-xs text-slate-600">
                        {Object.entries(product.specifications).map(([key, val]) => (
                          <div
                            key={key}
                            className="flex justify-between border-b border-slate-200/60 pb-1.5 last:border-b-0 last:pb-0"
                          >
                            <span className="font-medium text-slate-500 bengali-font">{key}:</span>
                            <span className="font-semibold text-slate-800 bengali-font">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Hotline Callout */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span className="bengali-font">কোন প্রশ্ন থাকলে কল করুন:</span>
                <a
                  href={`tel:${hotline.replace(/[^0-9]/g, '')}`}
                  className="font-bold text-emerald-700 flex items-center space-x-1 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{hotline}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom WhatsApp Order Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2.5 flex items-center justify-between gap-3 shadow-lg">
        <div className="shrink-0 min-w-0">
          <div className="text-[10px] text-slate-500 bengali-font">অফার প্রাইস:</div>
          <div className="text-base font-black text-emerald-700 leading-tight">
            {formatBDT(product.offerPrice)}
          </div>
        </div>

        <button
          type="button"
          onClick={handleWhatsAppOrder}
          disabled={!product.inStock}
          className="flex-1 py-2.5 px-3 bg-[#25D366] active:bg-[#1caa51] text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-[#25D366]/30 cursor-pointer touch-manipulation disabled:opacity-50"
        >
          <MessageCircle className="w-4 h-4 fill-current shrink-0" />
          <span className="bengali-font truncate">WhatsApp-এ অর্ডার</span>
        </button>
      </div>
    </div>
  );
};

// Backwards compatibility alias
export const ProductDetailsModal = ProductDetailsPage;
