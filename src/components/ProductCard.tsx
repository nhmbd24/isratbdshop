import React from 'react';
import { Product, StoreSettings } from '../types';
import { formatBDT, generateDirectWhatsAppUrl, openFacebookShare, handleProductShare } from '../utils/helpers';
import { Eye, MessageCircle, Share2, Star, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  settings?: StoreSettings;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  settings,
  onViewDetails,
}) => {
  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = generateDirectWhatsAppUrl(
      product,
      settings?.whatsappNumber,
      settings?.shopNameBn || settings?.shopName
    );
    window.open(url, '_blank');
  };

  const handleFacebookShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleProductShare(product, settings?.shopName);
  };

  const savings = product.originalPrice - product.offerPrice;

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="group bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden relative cursor-pointer w-full max-w-full min-w-0"
    >
      {/* Top badges */}
      <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 right-1.5 sm:right-2 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-0.5 sm:gap-1">
          {product.discountPercent > 0 && (
            <span className="bg-rose-600 text-white font-black text-[8px] sm:text-[11px] px-1 sm:px-2 py-0.2 sm:py-0.5 rounded shadow-xs tracking-wider">
              -{product.discountPercent}%
            </span>
          )}
          {product.isHotDeal && (
            <span className="bg-amber-500 text-slate-950 font-bold text-[8px] sm:text-[10px] px-1 sm:px-2 py-0.2 sm:py-0.5 rounded shadow-xs flex items-center space-x-0.5 sm:space-x-1">
              <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
              <span>হট ডিল</span>
            </span>
          )}
        </div>

        {/* Facebook Share Button */}
        <button
          type="button"
          onClick={handleFacebookShare}
          className="pointer-events-auto w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-white/95 hover:bg-blue-600 hover:text-white text-slate-600 backdrop-blur-md flex items-center justify-center shadow-md transition-all active:scale-90"
          title="ফেসবুকে শেয়ার করুন"
          aria-label="Share on Facebook"
        >
          <Share2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>

      {/* Product Image Container: clear, same-sized, consistent 1:1 aspect ratio */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        <img
          src={product.image}
          alt={product.nameBn}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Quick View Overlay on Hover for Desktop */}
        <div className="hidden sm:flex absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center p-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="bg-white/95 hover:bg-white text-slate-800 text-xs font-bold px-3.5 py-2 rounded-full shadow-lg flex items-center space-x-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span className="bengali-font">বিস্তারিত দেখুন</span>
          </button>
        </div>

        {/* Stock status tag */}
        <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2">
          {product.inStock ? (
            <span className="text-[7px] sm:text-[10px] font-semibold bg-emerald-900/80 text-emerald-100 backdrop-blur-xs px-1 sm:px-2 py-0.2 sm:py-0.5 rounded flex items-center space-x-0.5 sm:space-x-1">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>COD</span>
            </span>
          ) : (
            <span className="text-[7px] sm:text-[10px] font-semibold bg-rose-900/80 text-rose-100 backdrop-blur-xs px-1 sm:px-2 py-0.2 sm:py-0.5 rounded">
              স্টক শেষ
            </span>
          )}
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-1.5 sm:p-3.5 flex-1 flex flex-col justify-between min-w-0">
        <div className="min-w-0">
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[8px] sm:text-xs mb-1">
            <span className="font-medium text-emerald-700 bg-emerald-50 px-1 sm:px-2 py-0.5 rounded truncate max-w-[65%]">
              {product.categoryBn}
            </span>
            <div className="flex items-center space-x-0.5 sm:space-x-1 text-amber-500 shrink-0">
              <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-current" />
              <span className="font-bold text-slate-800 text-[8px] sm:text-xs">{product.rating}</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-[11px] sm:text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-tight sm:leading-snug bengali-font" title={product.nameBn}>
            {product.nameBn}
          </h3>

          {/* Price Section */}
          <div className="mt-1 sm:mt-2.5 flex flex-wrap items-baseline gap-1 sm:gap-2">
            <span className="text-xs sm:text-lg font-black text-emerald-700 tracking-tight">
              {formatBDT(product.offerPrice)}
            </span>
            {product.originalPrice > product.offerPrice && (
              <span className="text-[9px] sm:text-xs text-slate-400 line-through">
                {formatBDT(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: 1. বিস্তারিত, 2. WhatsApp-এ অর্ডার করুন */}
        <div className="mt-1.5 sm:mt-3 flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-2 pt-1 sm:pt-2 border-t border-slate-100 w-full min-w-0">
          {/* 1. বিস্তারিত দেখুন */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="w-full py-1 sm:py-2.5 px-1 sm:px-2 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 flex items-center justify-center space-x-0.5 sm:space-x-1.5 transition-colors cursor-pointer min-w-0 touch-manipulation"
          >
            <Eye className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-slate-500 shrink-0" />
            <span className="bengali-font truncate">বিস্তারিত</span>
          </button>

          {/* 2. WhatsApp-এ অর্ডার করুন */}
          <button
            type="button"
            onClick={handleWhatsAppOrder}
            className="w-full py-1 sm:py-2.5 px-1 sm:px-2 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1caa51] text-white flex items-center justify-center space-x-0.5 sm:space-x-1.5 transition-all shadow-xs cursor-pointer active:scale-95 min-w-0 touch-manipulation"
            title="WhatsApp-এ অর্ডার করুন"
          >
            <MessageCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-current text-white shrink-0" />
            <span className="bengali-font truncate">WhatsApp অর্ডার</span>
          </button>
        </div>
      </div>
    </div>
  );
};
