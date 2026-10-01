import React, { useState, useRef } from 'react';
import { Banner, Category } from '../../types';
import { saveBanner, deleteBanner, uploadImage } from '../../firebase/db';
import { Plus, Edit3, Trash2, Eye, EyeOff, X, Image as ImageIcon, AlertCircle, Loader2, CheckCircle, Upload } from 'lucide-react';

interface AdminBannersTabProps {
  banners: Banner[];
  categories: Category[];
  onBannerDeleted?: (bannerId: string) => void;
}

export const AdminBannersTab: React.FC<AdminBannersTabProps> = ({
  banners,
  categories,
  onBannerDeleted,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bannerToEdit, setBannerToEdit] = useState<Banner | null>(null);

  // Dedicated Delete Dialog states
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [localDeletedIds, setLocalDeletedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('💥 স্পেশাল মেগা অফার');
  const [ctaText, setCtaText] = useState('কালেকশন দেখুন');
  const [categoryTarget, setCategoryTarget] = useState('fashion');
  const [discountBadge, setDiscountBadge] = useState('৫০% পর্যন্ত ছাড়');
  const [bgGradient, setBgGradient] = useState('from-rose-900 via-rose-800 to-amber-900');
  const [image, setImage] = useState('');
  const [isHidden, setIsHidden] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleBanners = banners.filter((b) => !localDeletedIds.has(b.id));

  const openAddModal = () => {
    setBannerToEdit(null);
    setTitle('');
    setSubtitle('');
    setBadge('💥 স্পেশাল মেগা অফার');
    setCtaText('কালেকশন দেখুন');
    setCategoryTarget(categories[0]?.id || 'fashion');
    setDiscountBadge('৫০% পর্যন্ত ছাড়');
    setBgGradient('from-slate-900 via-teal-950 to-emerald-900');
    setImage('');
    setIsHidden(false);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setBannerToEdit(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle);
    setBadge(banner.badge);
    setCtaText(banner.ctaText);
    setCategoryTarget(banner.categoryTarget);
    setDiscountBadge(banner.discountBadge);
    setBgGradient(banner.bgGradient);
    setImage(banner.image);
    setIsHidden(banner.isHidden || false);
    setError('');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'banners');
      setImage(url);
    } catch (err: any) {
      setError('ছবি আপলোড করতে সমস্যা হয়েছে: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !image) {
      setError('ব্যানারের শিরোনাম ও ছবি দিন।');
      return;
    }

    const id = bannerToEdit?.id || 'banner-' + Date.now();
    const maxOrder = Math.max(0, ...banners.map((b) => b.orderIndex || 0));

    const bannerPayload: Banner = {
      id,
      title: title.trim(),
      subtitle: subtitle.trim(),
      badge: badge.trim(),
      ctaText: ctaText.trim(),
      categoryTarget,
      discountBadge: discountBadge.trim(),
      bgGradient,
      image,
      isHidden,
      orderIndex: bannerToEdit?.orderIndex ?? maxOrder + 1,
    };

    setSaving(true);
    try {
      await saveBanner(bannerPayload);
      setIsModalOpen(false);
    } catch (err: any) {
      setError('ব্যানার সেভ করতে সমস্যা হয়েছে: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteDialog = (banner: Banner) => {
    setBannerToDelete(banner);
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    if (!bannerToDelete || isDeleting) return;
    const targetBanner = bannerToDelete;
    setIsDeleting(true);
    setDeleteError('');

    try {
      // 1. Delete Firestore banner document and cleanup Storage image
      await deleteBanner(targetBanner.id);

      // 2. Immediately remove from local list & parent state so both admin table & storefront update instantly
      setLocalDeletedIds((prev) => new Set(prev).add(targetBanner.id));
      onBannerDeleted?.(targetBanner.id);

      // 3. Show success confirmation toast
      setSuccessToast('ব্যানারটি সফলভাবে মুছে ফেলা হয়েছে');
      setTimeout(() => setSuccessToast(''), 3500);
      setBannerToDelete(null);
    } catch (err: any) {
      console.error('Delete banner failed:', err);
      // Show the REAL Firebase error instead of pretending it was deleted
      let errorMsg = err?.message || 'ব্যানার মুছে ফেলতে সমস্যা হয়েছে।';
      try {
        const parsed = JSON.parse(errorMsg);
        if (parsed?.error) {
          errorMsg = `${parsed.error}${parsed.path ? ` (Path: ${parsed.path})` : ''}`;
        }
      } catch {}
      setDeleteError(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleHide = async (banner: Banner) => {
    try {
      await saveBanner({
        ...banner,
        isHidden: !banner.isHidden,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-800 bengali-font">
            হোমপেজ ব্যানার স্লাইডার (Homepage Banners)
          </h3>
          <p className="text-xs text-slate-500">
            হোমপেজের আকর্ষণীয় অফার ব্যানার যুক্ত ও এডিট করুন।
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-700/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="bengali-font">নতুন ব্যানার যোগ করুন</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleBanners.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div className="relative aspect-16/7 bg-slate-900 overflow-hidden">
              <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end text-white">
                <span className="text-[10px] font-bold text-amber-400">{b.badge}</span>
                <h4 className="font-black text-sm sm:text-base line-clamp-1">{b.title}</h4>
                <p className="text-xs text-slate-200 line-clamp-1">{b.subtitle}</p>
              </div>

              {b.isHidden && (
                <div className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                  লুকানো (Hidden)
                </div>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 flex items-center justify-between text-xs border-t border-slate-100">
              <div className="text-slate-600">
                <span className="font-semibold bengali-font">লিংক ক্যাটাগরি: </span>
                <span className="font-bold text-emerald-800">{b.categoryTarget}</span>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => handleToggleHide(b)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    b.isHidden ? 'text-slate-400' : 'text-emerald-700'
                  }`}
                  title={b.isHidden ? 'লুকানো' : 'লাইভ'}
                >
                  {b.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => openEditModal(b)}
                  className="p-1.5 text-slate-700 hover:text-slate-950 cursor-pointer"
                  title="এডিট"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDeleteDialog(b);
                  }}
                  className="p-2 sm:p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 active:bg-rose-100 rounded-lg transition-colors cursor-pointer touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center"
                  title="ডিলিট"
                  aria-label="ব্যানার মুছুন"
                >
                  <Trash2 className="w-4 h-4 pointer-events-none" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div
            className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm sm:text-base bengali-font">
                {bannerToEdit ? 'ব্যানার এডিট করুন' : 'নতুন ব্যানার তৈরি করুন'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold">
                  {error}
                </div>
              )}

              {/* Banner Image */}
              <div>
                <label className="block font-bold text-slate-800 mb-1 bengali-font">
                  ব্যানার ছবি (Banner Image from Phone / URL) *
                </label>
                {image && (
                  <div className="relative aspect-16/7 rounded-2xl overflow-hidden mb-2 border border-slate-200">
                    <img src={image} alt="Banner" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? 'আপলোড হচ্ছে...' : 'ফোন থেকে ছবি সিলেক্ট করুন'}</span>
                  </button>
                </div>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="অথবা ছবির সরাসরি URL পেস্ট করুন"
                  className="w-full mt-2 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Title & Subtitle */}
              <div>
                <label className="block font-bold text-slate-800 mb-1 bengali-font">
                  ব্যানার শিরোনাম (Title) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: প্রিমিয়াম জামদানি ও উৎসব কালেকশন"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1 bengali-font">
                  সাবটাইটেল / বিবরণ (Subtitle)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="যেমন: হাতে বোনা খাঁটি ঐতিহ্যবাহী শাড়িতে বিশেষ ছাড়..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Badges & Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1 bengali-font">
                    ট্যাগ ব্যাজ (Badge Text)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="💥 স্পেশাল মেগা অফার"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1 bengali-font">
                    ডিসকাউন্ট ব্যাজ (Discount Tag)
                  </label>
                  <input
                    type="text"
                    value={discountBadge}
                    onChange={(e) => setDiscountBadge(e.target.value)}
                    placeholder="Up to ৫০% ছাড়"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Target Category */}
              <div>
                <label className="block font-bold text-slate-800 mb-1 bengali-font">
                  ক্লিক করলে কোন ক্যাটাগরিতে যাবে (Target Category)
                </label>
                <select
                  value={categoryTarget}
                  onChange={(e) => setCategoryTarget(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameBn} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="banner-hidden"
                  checked={isHidden}
                  onChange={(e) => setIsHidden(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <label htmlFor="banner-hidden" className="font-bold text-rose-700 bengali-font cursor-pointer">
                  স্টোরফ্রন্টে ব্যানারটি লুকান (Hide Banner)
                </label>
              </div>

              <div className="pt-2 flex justify-end space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Delete Confirmation Modal */}
      {bannerToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center mb-2 bengali-font">
              আপনি কি নিশ্চিতভাবে এই ব্যানারটি মুছে ফেলতে চান?
            </h3>

            <p className="text-xs text-slate-500 text-center mb-4 bengali-font">
              ব্যানার: <strong className="text-slate-800">{bannerToDelete.title}</strong>
              <br />
              <span className="text-[11px] text-slate-400">আইডি: {bannerToDelete.id}</span>
            </p>

            {deleteError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="break-all">{deleteError}</div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!isDeleting) {
                    setBannerToDelete(null);
                    setDeleteError('');
                  }
                }}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50 bengali-font"
              >
                বাতিল
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5 bengali-font"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>মুছে ফেলা হচ্ছে...</span>
                  </>
                ) : (
                  <span>মুছে ফেলুন</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Toast */}
      {successToast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-800 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-600 flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span className="bengali-font">{successToast}</span>
        </div>
      )}
    </div>
  );
};
