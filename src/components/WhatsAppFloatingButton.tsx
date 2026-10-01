import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { StoreSettings } from '../types';

interface WhatsAppFloatingButtonProps {
  settings?: StoreSettings;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({ settings }) => {
  const [showTooltip, setShowTooltip] = useState(true);

  const phone = settings?.whatsappNumber || '+8801712345678';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const shopName = settings?.shopName || 'Israt BD Shop';

  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `আসসালামু আলাইকুম! আমি ${shopName} থেকে অর্ডার অথবা তথ্য জানতে মেসেজ দিয়েছি।`
  )}`;

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end pointer-events-auto">
      {/* Floating Prompt Bubble */}
      {showTooltip && (
        <div className="mb-2 bg-white text-slate-800 text-xs px-3 py-2 rounded-2xl shadow-xl border border-emerald-100 flex items-center space-x-2 max-w-xs animate-in fade-in slide-in-from-bottom-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span className="bengali-font font-semibold text-slate-800">
            অর্ডার বা সহযোগিতার জন্য হোয়াটসঅ্যাপে লিখুন
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main WhatsApp Button */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/35 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        aria-label="Chat on WhatsApp"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white" />
        <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8" />
      </a>
    </div>
  );
};
