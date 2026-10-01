import React from 'react';
import { ShoppingBag, Search, Phone, MessageCircle, X, ShieldCheck, Lock } from 'lucide-react';
import { formatBDT } from '../utils/helpers';
import { StoreSettings } from '../types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectCategory: (categoryId: string) => void;
  activeCategory: string;
  settings: StoreSettings;
  onOpenAdmin: () => void;
  isAdmin: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200">
      {/* Top Notice Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white text-xs sm:text-sm py-1.5 px-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 font-medium overflow-hidden whitespace-nowrap">
            <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
              অফার
            </span>
            <span className="truncate">
              ✨ সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (COD) সুবিধা! অর্ডার করতে কল বা হোয়াটসঅ্যাপ করুন।
            </span>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4 text-emerald-100 text-xs">
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
              className={`flex items-center space-x-1 text-[11px] font-semibold py-0.5 px-2 rounded-md transition-all cursor-pointer ${
                isAdmin
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="এডমিন প্যানেল"
            >
              <Lock className="w-3 h-3 text-amber-300" />
              <span className="bengali-font">{isAdmin ? 'এডমিন ড্যাশবোর্ড' : 'এডমিন লগইন'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo / Brand */}
          <div
            onClick={() => {
              onSelectCategory('all');
              setSearchQuery('');
            }}
            className="cursor-pointer group flex items-center space-x-2.5 shrink-0"
          >
            {settings.logo ? (
              <img
                src={settings.logo}
                alt={shopTitle}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            )}

            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent">
                  {shopTitle}
                </span>
                <span className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded">
                  Official
                </span>
              </div>
              <p className="text-xs sm:text-xs font-semibold text-slate-500 tracking-wide bengali-font -mt-0.5">
                {shopTitleBn} | বিশ্বস্ত কেনাকাটা
              </p>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="পণ্য বা মডেল সার্চ করুন (যেমন: জামদানি, স্মার্ট ওয়াচ, মধু...)"
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm rounded-full border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Direct WhatsApp Callout Button */}
            <a
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`আসসালামু আলাইকুম! ${shopTitle} থেকে অর্ডার ও তথ্য জানতে চাই।`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold rounded-full bg-[#25D366] text-white hover:bg-[#20ba59] shadow-md shadow-[#25D366]/20 transition-all cursor-pointer"
              title="WhatsApp Customer Care"
            >
              <MessageCircle className="w-4 h-4 fill-current text-white shrink-0" />
              <span className="bengali-font font-bold">WhatsApp অর্ডার</span>
            </a>
          </div>
        </div>

        {/* Mobile Search Input Bar */}
        <div className="mt-2.5 md:hidden">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পণ্য সার্চ করুন (জামদানি, স্মার্টওয়াচ, মধু...)"
              className="w-full pl-9 pr-8 py-2 bg-slate-100 text-sm rounded-xl border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
