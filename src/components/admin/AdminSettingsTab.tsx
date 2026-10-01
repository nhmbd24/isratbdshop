import React, { useState, useRef } from 'react';
import { StoreSettings } from '../../types';
import { saveSettings, uploadImage } from '../../firebase/db';
import { Save, Upload, Check, Phone, MessageCircle, MapPin, Facebook, Truck, Store } from 'lucide-react';

interface AdminSettingsTabProps {
  settings: StoreSettings;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({ settings }) => {
  const [shopName, setShopName] = useState(settings.shopName || 'Israt BD Shop');
  const [shopNameBn, setShopNameBn] = useState(settings.shopNameBn || 'ইসরাত বিডি শপ');
  const [logo, setLogo] = useState(settings.logo || '');
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || '+8801712345678');
  const [phoneNumber, setPhoneNumber] = useState(settings.phoneNumber || '01712-345678');
  const [facebookPage, setFacebookPage] = useState(settings.facebookPage || 'https://facebook.com/isratbdshop');
  const [address, setAddress] = useState(settings.address || 'মিরপুর ১০, ঢাকা - ১২১৬, বাংলাদেশ');
  const [insideDhaka, setInsideDhaka] = useState(settings.insideDhakaDeliveryCharge?.toString() || '60');
  const [outsideDhaka, setOutsideDhaka] = useState(settings.outsideDhakaDeliveryCharge?.toString() || '120');
  const [freeDeliveryMin, setFreeDeliveryMin] = useState(settings.freeDeliveryMinAmount?.toString() || '3000');

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadImage(file, 'settings');
      setLogo(url);
    } catch (err: any) {
      setError('লোগো আপলোড করতে সমস্যা হয়েছে: ' + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const updated: StoreSettings = {
      shopName: shopName.trim(),
      shopNameBn: shopNameBn.trim(),
      logo,
      whatsappNumber: whatsappNumber.trim(),
      phoneNumber: phoneNumber.trim(),
      facebookPage: facebookPage.trim(),
      address: address.trim(),
      insideDhakaDeliveryCharge: parseFloat(insideDhaka) || 60,
      outsideDhakaDeliveryCharge: parseFloat(outsideDhaka) || 120,
      freeDeliveryMinAmount: parseFloat(freeDeliveryMin) || 3000,
    };

    try {
      await saveSettings(updated);
      setSuccess('দোকানের সকল সেটিংস সফলভাবে সেভ হয়েছে! স্টোরফ্রন্টে আপডেট করা হয়েছে।');
    } catch (err: any) {
      setError('সেভ করতে সমস্যা হয়েছে: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 bengali-font">
              দোকান সেটিংস ও তথ্য (Store Settings)
            </h3>
            <p className="text-xs text-slate-500 bengali-font">
              নাম, লোগো, ফোন নম্বর, হোয়াটসঅ্যাপ ও ডেলিভারি চার্জ নির্ধারণ করুন।
            </p>
          </div>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center space-x-2 bengali-font">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>✓ {success}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs sm:text-sm">
          {/* Shop Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1 bengali-font">
                দোকানের নাম (বাংলা)
              </label>
              <input
                type="text"
                required
                value={shopNameBn}
                onChange={(e) => setShopNameBn(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Shop Name (English)
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Logo */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <label className="block font-bold text-slate-800 bengali-font">
              দোকানের লোগো (Shop Logo)
            </label>
            <div className="flex items-center space-x-4">
              {logo ? (
                <img
                  src={logo}
                  alt="Shop Logo"
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 bg-white"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold">
                  No Logo
                </div>
              )}

              <div className="space-y-1.5 flex-1">
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingLogo ? 'আপলোড হচ্ছে...' : 'লোগো ছবি আপলোড করুন'}</span>
                </button>
                <input
                  type="url"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="অথবা লোগোর সরাসরি URL লিংক দিন"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Contact Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center space-x-1 bengali-font">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>হোয়াটসঅ্যাপ নম্বর (WhatsApp Number) *</span>
              </label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+8801712345678"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                গ্রাহক হোয়াটসঅ্যাপে অর্ডার পাঠালে এই নম্বরে মেসেজ যাবে।
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center space-x-1 bengali-font">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>হটলাইন মোবাইল নম্বর (Phone Number)</span>
              </label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="01712-345678"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Facebook & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center space-x-1 bengali-font">
                <Facebook className="w-3.5 h-3.5 text-blue-600" />
                <span>ফেসবুক পেজ লিংক (Facebook Page URL)</span>
              </label>
              <input
                type="url"
                value={facebookPage}
                onChange={(e) => setFacebookPage(e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center space-x-1 bengali-font">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>দোকানের ঠিকানা (Shop Address)</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="মিরপুর ১০, ঢাকা - ১২১৬, বাংলাদেশ"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Delivery Charges */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center space-x-1.5 bengali-font">
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>ডেলিভারি চার্জ ও ফ্রি ডেলিভারি নীতি</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 bengali-font">
                  ঢাকার ভেতরে চার্জ (৳)
                </label>
                <input
                  type="number"
                  required
                  value={insideDhaka}
                  onChange={(e) => setInsideDhaka(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 bengali-font">
                  ঢাকার বাইরে চার্জ (৳)
                </label>
                <input
                  type="number"
                  required
                  value={outsideDhaka}
                  onChange={(e) => setOutsideDhaka(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 bengali-font">
                  ফ্রি ডেলিভারি ন্যূনতম কেনাকাটা (৳)
                </label>
                <input
                  type="number"
                  required
                  value={freeDeliveryMin}
                  onChange={(e) => setFreeDeliveryMin(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-700/25 flex items-center space-x-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span className="bengali-font">
                {saving ? 'সেভ হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন (Save Settings)'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
