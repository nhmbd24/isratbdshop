import React from 'react';
import { ShoppingBag, Phone, MessageCircle, Lock } from 'lucide-react';
import { StoreSettings } from '../types';

interface HeaderProps {
  onSelectCategory: (categoryId: string) => void;
  settings: StoreSettings;
  onOpenAdmin: () => void;
  isAdmin: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectCategory,
  settings,
  onOpenAdmin,
  isAdmin,
}) => {
  const hotline = settings.phoneNumber || '01712-345678';
  const whatsapp = settings.whatsappNumber || '+8801712345678';
  const shopTitle = settings.shopName || 'Israt BD Shop';
  const shopTitleBn = settings.shopNameBn || 'ইসরাত বিডি শপ';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200 w-full max-w-full overflow-hidden">
      {/* Top Notice Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white text-xs sm:text-sm py-1.5 px-3 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 font-medium overflow-hidden whitespace-nowrap min-w-0 flex-1">
            <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider shrink-0">
              অফার
            </span>
            <span className="truncate text-[11px] sm:text-xs">
              ✨ সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (COD) সুবিধা!
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 text-emerald-100 text-xs shrink-0">
            <a
              href={`tel:${hotline.replace(/[^0-9]/g, '')}`}
              className="hidden sm:flex items-center space-x-1 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              <span>হটলাইন: <strong className="text-white">{hotline}</strong></span>
            </a>

            <span className="hidden sm:inline opacity-40">|</span>

            {/* Admin entry trigger */}
            <button
              onClick={onOpenAdmin}
              className={`flex items-center space-x-1 text-[11px] font-semibold py-0.5 px-2 rounded-md transition-all cursor-pointer shrink-0 ${
                isAdmin
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="এডমিন প্যানেল"
            >
              <Lock className="w-3 h-3 text-amber-300" />
              <span className="bengali-font">{isAdmin ? 'এডমিন' : 'লগইন'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header with Logo and Shop Name */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 w-full max-w-full">
        <div className="flex items-center justify-between gap-2 sm:gap-6 min-w-0">
          {/* Logo / Brand */}
          <div
            onClick={() => {
              onSelectCategory('all');
            }}
            className="cursor-pointer group flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 sm:flex-initial"
          >
            {settings.logo ? (
              <img
                src={settings.logo}
                alt={shopTitle}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform shrink-0"
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-lg sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent truncate">
                  {shopTitle}
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded shrink-0">
                  Official
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-wide bengali-font -mt-0.5 truncate">
                {shopTitleBn} | বিশ্বস্ত অনলাইন শপ
              </p>
            </div>
          </div>

          {/* Right Action Button: WhatsApp Customer Care */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            <a
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`আসসালামু আলাইকুম! ${shopTitle} থেকে অর্ডার ও তথ্য জানতে চাই।`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold rounded-full bg-[#25D366] text-white hover:bg-[#20ba59] shadow-md shadow-[#25D366]/20 transition-all cursor-pointer whitespace-nowrap shrink-0 touch-manipulation"
              title="WhatsApp Customer Care"
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-white shrink-0" />
              <span className="bengali-font font-bold">
                <span className="hidden xs:inline">WhatsApp </span>অর্ডার
              </span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
