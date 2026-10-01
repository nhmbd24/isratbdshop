import React, { useState, useRef, useMemo } from 'react';
import { Category, Product } from '../../types';
import { saveCategory, deleteCategory, uploadImage } from '../../firebase/db';
import {
  Plus,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Sparkles,
  Upload,
  Loader2,
  X,
  Check,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';

interface AdminCategoriesTabProps {
  categories: Category[];
  products?: Product[];
  onCategoryDeleted?: (categoryId: string) => void;
}

const AVAILABLE_ICONS = [
  'Sparkles',
  'Shirt',
  'Smartphone',
  'Leaf',
  'Watch',
  'Home',
  'Heart',
  'ShoppingBag',
  'Gift',
  'Zap',
];

export const AdminCategoriesTab: React.FC<AdminCategoriesTabProps> = ({
  categories,
  products = [],
  onCategoryDeleted,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [icon, setIcon] = useState('Sparkles');
  const [image, setImage] = useState('');
  const [isHidden, setIsHidden] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Delete states
  const [localDeletedIds, setLocalDeletedIds] = useState<Set<string>>(new Set());
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryBlockedWarning, setCategoryBlockedWarning] = useState<{
    category: Category;
    count: number;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleCategories = useMemo(() => {
    return categories.filter((c) => !localDeletedIds.has(c.id));
  }, [categories, localDeletedIds]);

  const openAddModal = () => {
    setCategoryToEdit(null);
    setName('');
    setNameBn('');
    setIcon('Sparkles');
    setImage('');
    setIsHidden(false);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setCategoryToEdit(cat);
    setName(cat.name);
    setNameBn(cat.nameBn);
    setIcon(cat.icon || 'Sparkles');
    setImage(cat.image || '');
    setIsHidden(cat.isHidden || false);
    setError('');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'categories');
      setImage(url);
    } catch (err: any) {
      setError('ছবি আপলোড করতে সমস্যা হয়েছে: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim()) {
      setError('ক্যাটাগরির বাংলা নাম দিন।');
      return;
    }

    const id =
      categoryToEdit?.id ||
      name.toLowerCase().replace(/[^a-z0-9]/g, '-') ||
      'cat-' + Date.now();

    const maxOrder = Math.max(0, ...categories.map((c) => c.orderIndex || 0));

    const categoryPayload: Category = {
      id,
      name: name.trim() || nameBn.trim(),
      nameBn: nameBn.trim(),
      icon,
      image,
      isHidden,
      orderIndex: categoryToEdit?.orderIndex ?? maxOrder + 1,
    };

    setSaving(true);
    try {
      await saveCategory(categoryPayload);
      setIsModalOpen(false);
    } catch (err: any) {
      setError('ক্যাটাগরি সেভ করতে সমস্যা হয়েছে: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteDialog = (category: Category) => {
    // Check whether products are using this category
    const productsUsingCategory = products.filter(
      (p) =>
        p.category === category.id ||
        p.category === category.name ||
        p.category === category.nameBn ||
        p.categoryBn === category.nameBn
    );

    if (productsUsingCategory.length > 0) {
      setCategoryBlockedWarning({
        category,
        count: productsUsingCategory.length,
      });
      setCategoryToDelete(null);
      return;
    }

    setCategoryBlockedWarning(null);
    setCategoryToDelete(category);
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete || isDeleting) return;
    const targetCat = categoryToDelete;
    setIsDeleting(true);
    setDeleteError('');

    try {
      // 1. Delete from Firestore and cleanup storage files
      await deleteCategory(targetCat.id);

      // 2. Immediately remove from local list & parent state so both admin table & storefront update instantly
      setLocalDeletedIds((prev) => new Set(prev).add(targetCat.id));
      onCategoryDeleted?.(targetCat.id);

      // 3. Show success confirmation toast
      setSuccessToast('ক্যাটাগরিটি সফলভাবে মুছে ফেলা হয়েছে');
      setTimeout(() => setSuccessToast(''), 3500);
      setCategoryToDelete(null);
    } catch (err: any) {
      console.error('Delete category failed:', err);
      // Show the REAL Firebase error instead of pretending it was deleted
      let errorMsg = err?.message || 'ক্যাটাগরি মুছে ফেলতে সমস্যা হয়েছে।';
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

  const handleToggleHide = async (cat: Category) => {
    try {
      await saveCategory({
        ...cat,
        isHidden: !cat.isHidden,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const currentCat = categories[index];
    const targetCat = categories[targetIndex];

    const currentOrder = currentCat.orderIndex || index + 1;
    const targetOrder = targetCat.orderIndex || targetIndex + 1;

    try {
      await Promise.all([
        saveCategory({ ...currentCat, orderIndex: targetOrder }),
        saveCategory({ ...targetCat, orderIndex: currentOrder }),
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top action */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-800 bengali-font">
            ক্যাটাগরি সমূহ (Category Management)
          </h3>
          <p className="text-xs text-slate-500">
            স্টোরফ্রন্টের সকল ক্যাটাগরি সাজান ও নিয়ন্ত্রণ করুন।
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-700/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="bengali-font">নতুন ক্যাটাগরি</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {visibleCategories.map((cat, idx) => (
          <div
            key={cat.id}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center space-x-3 min-w-0">
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.nameBn}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {cat.icon || '🏷️'}
                </div>
              )}
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-slate-900 truncate bengali-font">
                  {cat.nameBn}
                </h4>
                <p className="text-xs text-slate-400 truncate">{cat.name}</p>
                {cat.isHidden && (
                  <span className="inline-block mt-0.5 text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded font-bold">
                    লুকানো (Hidden)
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 shrink-0">
              <button
                type="button"
                onClick={() => handleMoveOrder(idx, 'up')}
                disabled={idx === 0}
                className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                title="উপরে নিন"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleMoveOrder(idx, 'down')}
                disabled={idx === categories.length - 1}
                className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                title="নিচে নিন"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleToggleHide(cat)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  cat.isHidden ? 'text-slate-400 hover:text-slate-600' : 'text-emerald-700'
                }`}
                title={cat.isHidden ? 'লুকানো' : 'লাইভ'}
              >
                {cat.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => openEditModal(cat)}
                className="p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                title="এডিট"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDeleteDialog(cat);
                }}
                className="p-2 sm:p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="ডিলিট"
                aria-label="ক্যাটাগরি মুছুন"
              >
                <Trash2 className="w-4 h-4 pointer-events-none" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal (Add / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div
            className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base bengali-font">
                {categoryToEdit ? 'ক্যাটাগরি এডিট করুন' : 'নতুন ক্যাটাগরি তৈরি করুন'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1 bengali-font">
                  ক্যাটাগরির বাংলা নাম *
                </label>
                <input
                  type="text"
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  placeholder="যেমন: শাড়ি ও ফ্যাশন"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 bengali-font">
                  ইংরেজি নাম / স্লাগ
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: Fashion & Sarees"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 bengali-font">
                  আইকন সিলেক্ট করুন
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_ICONS.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIcon(i)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        icon === i
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 bengali-font">
                  ক্যাটাগরি ছবি (ঐচ্ছিক)
                </label>
                <div className="flex items-center space-x-3">
                  {image ? (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200">
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="absolute top-0.5 right-0.5 bg-black/60 text-white p-0.5 rounded-full"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                      <Upload className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1">
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
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploading ? 'আপলোড হচ্ছে...' : 'ছবি সিলেক্ট করুন'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="cat-hidden"
                  checked={isHidden}
                  onChange={(e) => setIsHidden(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <label htmlFor="cat-hidden" className="font-bold text-rose-700 bengali-font cursor-pointer">
                  স্টোরফ্রন্ট থেকে ক্যাটাগরি লুকান (Hide Category)
                </label>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
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

      {/* Blocked Warning Modal (When Category Has Products) */}
      {categoryBlockedWarning && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-200 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 text-center mb-2 bengali-font">
              ক্যাটাগরি মোছা সম্ভব নয়
            </h3>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs sm:text-sm text-amber-900 text-center font-bold mb-3 bengali-font leading-relaxed">
              এই ক্যাটাগরিতে পণ্য রয়েছে। আগে পণ্যগুলো অন্য ক্যাটাগরিতে সরান।
            </div>

            <p className="text-xs text-slate-500 text-center mb-5 bengali-font">
              ক্যাটাগরি: <strong className="text-slate-800">{categoryBlockedWarning.category.nameBn}</strong>
              <br />
              <span className="text-[11px] text-slate-400">
                এই ক্যাটাগরিতে {categoryBlockedWarning.count}টি পণ্য যুক্ত আছে।
              </span>
            </p>

            <div className="flex">
              <button
                type="button"
                onClick={() => setCategoryBlockedWarning(null)}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer bengali-font"
              >
                ঠিক আছে, বুঝেছি
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Delete Confirmation Modal (When Category Has No Products) */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center mb-2 bengali-font">
              আপনি কি নিশ্চিতভাবে এই ক্যাটাগরি মুছে ফেলতে চান?
            </h3>

            <p className="text-xs text-slate-500 text-center mb-4 bengali-font">
              ক্যাটাগরি: <strong className="text-slate-800">{categoryToDelete.nameBn || categoryToDelete.name}</strong>
              <br />
              <span className="text-[11px] text-slate-400">আইডি: {categoryToDelete.id}</span>
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
                    setCategoryToDelete(null);
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
          <Check className="w-4 h-4 text-emerald-300" />
          <span className="bengali-font">{successToast}</span>
        </div>
      )}
    </div>
  );
};
