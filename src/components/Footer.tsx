import React from 'react';
import { ShoppingBag, Phone, Mail, MapPin, MessageCircle, ShieldCheck, Truck, RefreshCw, Facebook, Lock } from 'lucide-react';
import { openFacebookShare } from '../utils/helpers';
import { StoreSettings } from '../types';

interface FooterProps {
  settings?: StoreSettings;
  onOpenBloggerModal?: () => void;
  onOpenAdmin?: () => void;
  isAdmin?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenBloggerModal,
  onOpenAdmin,
  isAdmin,
}) => {
  const shopName = settings?.shopName || 'Israt BD Shop';
  const hotline = settings?.phoneNumber || '01712-345678';
  const whatsapp = settings?.whatsappNumber || '+8801712345678';
  const address = settings?.address || 'মিরপুর ১০, ঢাকা - ১২১৬, বাংলাদেশ';
  const facebookUrl = settings?.facebookPage || 'https://facebook.com/isratbdshop';

  return (
    <footer className="bg-slate-900 text-slate-300 pt-10 sm:pt-12 pb-8 border-t border-slate-800 mt-12 sm:mt-16 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full min-w-0">
        {/* Top Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-10 border-b border-slate-800 text-center sm:text-left">
          <div className="flex items-center space-x-3 justify-center sm:justify-start">
            <div className="w-11 h-11 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm bengali-font">ক্যাশ অন ডেলিভারি</h5>
              <p className="text-xs text-slate-400 bengali-font">সারা বাংলাদেশে পণ্য দেখে টাকা</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 justify-center sm:justify-start">
            <div className="w-11 h-11 rounded-2xl bg-teal-950/80 text-teal-400 border border-teal-800/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm bengali-font">১০০% আসল পণ্য</h5>
              <p className="text-xs text-slate-400 bengali-font">মানসম্মত ও পরীক্ষিত প্রোডাক্ট</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 justify-center sm:justify-start">
            <div className="w-11 h-11 rounded-2xl bg-amber-950/80 text-amber-400 border border-amber-800/40 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm bengali-font">৭ দিনের রিপ্লেসমেন্ট</h5>
              <p className="text-xs text-slate-400 bengali-font">কোনো ত্রুটি থাকলে ফ্রি পরিবর্তন</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 justify-center sm:justify-start">
            <div className="w-11 h-11 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm bengali-font">হোয়াটসঅ্যাপ অর্ডার</h5>
              <p className="text-xs text-slate-400 bengali-font">যেকোনো সময় সরাসরি চ্যাট</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-10">
          {/* Shop Intro */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              {settings?.logo ? (
                <img
                  src={settings.logo}
                  alt={shopName}
                  className="w-9 h-9 rounded-xl object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              )}
              <span className="text-xl font-extrabold text-white tracking-tight">
                {shopName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed bengali-font">
              {shopName} বাংলাদেশের একটি নির্ভরযোগ্য অনলাইন শপিং প্ল্যাটফর্ম। আমরা সারা বাংলাদেশে আসল পণ্য, দ্রুত ডেলিভারি ও আন্তরিক কাস্টমার সার্ভিসের সাথে কেনাকাটার নিশ্চয়তা দেই।
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="ফেসবুক পেজ"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="হোয়াটসঅ্যাপ"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider bengali-font">
              প্রয়োজনীয় লিংক
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li className="bengali-font">• নতুন প্রোডাক্ট কালেকশন</li>
              <li className="bengali-font">• হট ডিল ও ডিসকাউন্ট অফার</li>
              <li className="bengali-font">• ঢাকাই জামদানি শাড়ি</li>
              <li className="bengali-font">• স্মার্ট গ্যাজেট ও ইলেকট্রনিক্স</li>
              <li className="bengali-font">• সুন্দরবনের খাঁটি মধু</li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider bengali-font">
              কাস্টমার কেয়ার ও শর্তাবলী
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li className="bengali-font">• ক্যাশ অন ডেলিভারি (Cash on Delivery)</li>
              <li className="bengali-font">• ঢাকা সিটিতে ২৪-৪৮ ঘন্টায় ডেলিভারি</li>
              <li className="bengali-font">• ঢাকার বাইরে ৩-৪ দিনে ডেলিভারি</li>
              <li className="bengali-font">• ৭ দিনের সহজ রিটার্ন পলিসি</li>
              <li className="bengali-font">• প্রাইভেসী ও টার্মস পলিসি</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider bengali-font">
              যোগাযোগ ও হেল্পলাইন
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  হটলাইন: <strong className="text-white">{hotline}</strong>
                </span>
              </div>
              <div className="flex items-center space-x-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  WhatsApp: <strong className="text-white">{whatsapp}</strong>
                </span>
              </div>
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="bengali-font">{address}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@isratbdshop.com</span>
              </div>
            </div>

            {/* Blogger & Domain Integration Guide Trigger */}
            {onOpenBloggerModal && (
              <div className="pt-2">
                <button
                  onClick={onOpenBloggerModal}
                  className="w-full text-left py-2 px-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl text-xs text-amber-300 font-semibold border border-amber-400/20 transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="bengali-font">🌐 ব্লগার ও .com ডোমেন গাইড</span>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                    Info
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar with Admin Login button */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="bengali-font font-medium">নিরাপদ পেমেন্ট মেথড:</span>
            <div className="flex flex-wrap gap-1.5">
              <span className="bg-slate-800 text-pink-400 font-bold px-2 py-0.5 rounded text-[11px] border border-slate-700">
                bKash
              </span>
              <span className="bg-slate-800 text-orange-400 font-bold px-2 py-0.5 rounded text-[11px] border border-slate-700">
                Nagad
              </span>
              <span className="bg-slate-800 text-purple-400 font-bold px-2 py-0.5 rounded text-[11px] border border-slate-700">
                Rocket
              </span>
              <span className="bg-emerald-900/60 text-emerald-300 font-bold px-2 py-0.5 rounded text-[11px] border border-emerald-700/60">
                Cash on Delivery
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Admin entry point in footer */}
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center space-x-1.5 text-slate-400 hover:text-amber-400 font-medium transition-colors cursor-pointer text-xs"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="bengali-font">{isAdmin ? 'এডমিন ড্যাশবোর্ড' : 'এডমিন লগইন'}</span>
              </button>
            )}

            <div className="text-slate-500 text-xs">
              © {new Date().getFullYear()} {shopName}. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
