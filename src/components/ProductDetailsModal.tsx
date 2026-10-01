import React, { useState } from 'react';
import { Product, StoreSettings } from '../types';
import { formatBDT, generateDirectWhatsAppUrl, openFacebookShare } from '../utils/helpers';
import { X, MessageCircle, Share2, Star, Truck, ShieldCheck, Phone, Clock, Award } from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product | null;
  settings?: StoreSettings;
  onClose: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  settings,
  onClose,
}) => {
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.availableSizes ? product.availableSizes[0] : undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.availableColors ? product.availableColors[0] : undefined
  );

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
    openFacebookShare(product, undefined, settings?.shopName);
  };

  const savings = Math.max(0, product.originalPrice - product.offerPrice);
  const hotline = settings?.phoneNumber || '01712-345678';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      {/* Modal Card */}
      <div
        className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-100 my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto">
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-5 bg-slate-50 p-4 sm:p-6 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-slate-100">
            <div className="w-full">
              {/* Main Image */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xs mb-3">
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
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        selectedImage === img
                          ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Guarantees Under Image */}
            <div className="w-full mt-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 text-xs space-y-2 text-emerald-950 bengali-font">
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
          <div className="md:col-span-7 p-5 sm:p-8 flex flex-col justify-between space-y-5">
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
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug bengali-font">
                {product.nameBn}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                {product.name}
              </p>

              {/* Price Row */}
              <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 bengali-font">অফার প্রাইস:</div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-700">
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
                  <div className="text-[11px] font-semibold mt-0.5 bengali-font">
                    {product.inStock ? (
                      <span className="text-emerald-600">✓ স্টকে আছে</span>
                    ) : (
                      <span className="text-rose-600">✕ স্টক আউট</span>
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
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
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
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
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
                  onClick={handleWhatsAppOrder}
                  disabled={!product.inStock}
                  className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1caa51] text-white font-extrabold rounded-2xl shadow-lg shadow-[#25D366]/25 flex items-center justify-center space-x-2 text-base transition-all cursor-pointer active:scale-98 disabled:opacity-50 group"
                >
                  <MessageCircle className="w-5 h-5 fill-current text-white shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="bengali-font tracking-wide">WhatsApp-এ অর্ডার করুন</span>
                </button>

                <button
                  onClick={handleFacebookShare}
                  className="w-full py-2.5 px-3 rounded-2xl font-bold text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
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
                  <div className="flex items-center space-x-2 text-xs text-slate-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      <strong className="bengali-font">মেয়াদ / সংরক্ষণ তথ্য: </strong>
                      {product.expiryDetails}
                    </span>
                  </div>
                )}

                {/* Specs Table */}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <h5 className="text-xs font-bold text-slate-700 mb-2 bengali-font">
                      স্পেসিফিকেশন (Specifications):
                    </h5>
                    <div className="space-y-1.5 text-xs text-slate-600">
                      {Object.entries(product.specifications).map(([key, val]) => (
                        <div key={key} className="flex justify-between border-b border-slate-200/60 pb-1 last:border-b-0">
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
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
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
    </div>
  );
};
