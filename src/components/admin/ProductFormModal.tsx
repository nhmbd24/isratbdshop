import React, { useState, useRef } from 'react';
import { Product, Category } from '../../types';
import { uploadProductImage } from '../../firebase/db';
import { X, Upload, Trash2, Plus, Sparkles, Image as ImageIcon, Check, Loader2, AlertCircle } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  categories: Category[];
  onSave: (product: Product) => Promise<void>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  categories,
  onSave,
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(productToEdit);

  // Form states
  const [name, setName] = useState(productToEdit?.name || '');
  const [nameBn, setNameBn] = useState(productToEdit?.nameBn || '');
  const [category, setCategory] = useState(
    productToEdit?.category || (categories[0]?.id || 'fashion')
  );
  const [originalPrice, setOriginalPrice] = useState(productToEdit?.originalPrice?.toString() || '0');
  const [offerPrice, setOfferPrice] = useState(productToEdit?.offerPrice?.toString() || '0');
  const [mainImage, setMainImage] = useState(productToEdit?.image || '');
  const [additionalImages, setAdditionalImages] = useState<string[]>(
    productToEdit?.additionalImages || []
  );
  const [inStock, setInStock] = useState(productToEdit ? productToEdit.inStock : true);
  const [stockCount, setStockCount] = useState(productToEdit?.stockCount?.toString() || '50');
  const [isFeatured, setIsFeatured] = useState(productToEdit?.isFeatured || false);
  const [isPopular, setIsPopular] = useState(productToEdit?.isPopular || false);
  const [isHotDeal, setIsHotDeal] = useState(productToEdit?.isHotDeal || false);
  const [isHidden, setIsHidden] = useState(productToEdit?.isHidden || false);

  const [shortDesc, setShortDesc] = useState(productToEdit?.shortDesc || '');
  const [shortDescBn, setShortDescBn] = useState(productToEdit?.shortDescBn || '');
  const [fullDescBn, setFullDescBn] = useState(productToEdit?.fullDescBn || '');

  // Specs, sizes, colors
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(() => {
    if (productToEdit?.specifications) {
      return Object.entries(productToEdit.specifications).map(([key, value]) => ({ key, value }));
    }
    return [
      { key: 'ম্যাটেরিয়াল / ফেব্রিক', value: '' },
      { key: 'ওয়ারেন্টি', value: '' },
    ];
  });

  const [sizesInput, setSizesInput] = useState(
    productToEdit?.availableSizes?.join(', ') || ''
  );
  const [colorsInput, setColorsInput] = useState(
    productToEdit?.availableColors?.join(', ') || ''
  );

  const [warrantyDetails, setWarrantyDetails] = useState(productToEdit?.warrantyDetails || '');
  const [guaranteeDetails, setGuaranteeDetails] = useState(productToEdit?.guaranteeDetails || '');
  const [expiryDetails, setExpiryDetails] = useState(productToEdit?.expiryDetails || '');
  const [deliveryInfo, setDeliveryInfo] = useState(productToEdit?.deliveryInfo || '');

  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadProgressMain, setUploadProgressMain] = useState(0);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);
  const [uploadProgressAdditional, setUploadProgressAdditional] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);

  // Accepted image types: JPG, JPEG, PNG, WebP
  const ACCEPTED_IMAGE_TYPES = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

  // Handle Main image file pick
  const handleMainFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input to allow selecting same file again if desired
    e.target.value = '';

    setUploadingMain(true);
    setUploadProgressMain(10);
    setError('');

    try {
      const url = await uploadProductImage(file, 'products', (percent) => {
        setUploadProgressMain(percent);
      });
      setMainImage(url);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setError(err?.message || 'ছবি আপলোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setUploadingMain(false);
      setUploadProgressMain(0);
    }
  };

  // Handle Additional images file pick
  const handleAdditionalFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Reset input
    e.target.value = '';

    setUploadingAdditional(true);
    setUploadProgressAdditional(10);
    setError('');

    try {
      const newUrls: string[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const url = await uploadProductImage(file, 'products', (percent) => {
          const stepPercent = Math.round(((i + percent / 100) / totalFiles) * 100);
          setUploadProgressAdditional(stepPercent);
        });
        newUrls.push(url);
      }
      setAdditionalImages((prev) => [...prev, ...newUrls]);
    } catch (err: any) {
      console.error('Additional images upload failed:', err);
      setError(err?.message || 'গ্যালারি ছবি আপলোড করতে সমস্যা হয়েছে।');
    } finally {
      setUploadingAdditional(false);
      setUploadProgressAdditional(0);
    }
  };

  // Specifications helpers
  const handleAddSpec = () => {
    setSpecs((prev) => [...prev, { key: '', value: '' }]);
  };
  const handleUpdateSpec = (idx: number, field: 'key' | 'value', val: string) => {
    setSpecs((prev) => {
      const updated = [...prev];
      updated[idx][field] = val;
      return updated;
    });
  };
  const handleRemoveSpec = (idx: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== idx));
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim()) {
      setError('পণ্যের বাংলা নাম দিন।');
      return;
    }
    if (!mainImage || !mainImage.trim()) {
      setError('পণ্যের মূল ছবি আবশ্যক (Main product image is required)। অনুগ্রহ করে ফোন/গ্যালারি থেকে ছবি আপলোড করুন অথবা সরাসরি ছবির লিংক দিন।');
      return;
    }

    const regPrice = parseFloat(originalPrice) || 0;
    const offPrice = parseFloat(offerPrice) || 0;
    const discount =
      regPrice > offPrice && regPrice > 0
        ? Math.round(((regPrice - offPrice) / regPrice) * 100)
        : 0;

    const matchedCategory = categories.find((c) => c.id === category);

    // Convert specs to map
    const specsMap: { [key: string]: string } = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specsMap[s.key.trim()] = s.value.trim();
      }
    });

    const sizes = sizesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const colors = colorsInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const productPayload: Product = {
      id: productToEdit?.id || 'prod-' + Date.now(),
      name: name.trim() || nameBn.trim(),
      nameBn: nameBn.trim(),
      category,
      categoryBn: matchedCategory?.nameBn || 'অন্যান্য',
      originalPrice: regPrice,
      offerPrice: offPrice,
      discountPercent: discount,
      rating: productToEdit?.rating || 5.0,
      reviewCount: productToEdit?.reviewCount || 1,
      image: mainImage.trim(),
      additionalImages: Array.isArray(additionalImages) ? additionalImages : [],
      inStock,
      stockCount: parseInt(stockCount, 10) || 50,
      isFeatured,
      isPopular,
      isHotDeal,
      isHidden,
      shortDesc: shortDesc.trim(),
      shortDescBn: shortDescBn.trim() || nameBn.trim(),
      fullDescBn: fullDescBn.trim(),
      specifications: specsMap,
      availableSizes: sizes.length > 0 ? sizes : [],
      availableColors: colors.length > 0 ? colors : [],
      warrantyDetails: warrantyDetails.trim() || '',
      guaranteeDetails: guaranteeDetails.trim() || '',
      expiryDetails: expiryDetails.trim() || '',
      deliveryInfo: deliveryInfo.trim() || '',
    };

    if (productToEdit?.createdAt) {
      productPayload.createdAt = productToEdit.createdAt;
    }
    if (productToEdit?.createdByUid) {
      productPayload.createdByUid = productToEdit.createdByUid;
    }
    if (productToEdit?.createdByEmail) {
      productPayload.createdByEmail = productToEdit.createdByEmail;
    }

    setSaving(true);
    setError('');
    try {
      await onSave(productPayload);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('পণ্য সেভ করতে সমস্যা হয়েছে: ' + (err?.message || String(err)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
              +
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg bengali-font">
                {isEditing ? 'পণ্য এডিট করুন (Edit Product)' : 'নতুন পণ্য যুক্ত করুন (Add New Product)'}
              </h3>
              <p className="text-xs text-slate-400">
                সকল তথ্য পূরণ করে সেভ করুন। স্টোরফ্রন্টে সাথে সাথে আপডেট হবে।
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Scrollable */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. IMAGES SECTION */}
          <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 flex items-center space-x-2 bengali-font">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>পণ্যের ছবি আপলোড (JPG, JPEG, PNG, WebP)</span>
              </h4>
              <span className="text-[11px] font-bold text-rose-600 bengali-font">* মূল ছবি আবশ্যক</span>
            </div>

            {/* Main Image */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-4">
                <div className="relative aspect-square w-full max-w-[170px] rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 overflow-hidden bg-white flex flex-col items-center justify-center group mx-auto sm:mx-0 p-2 shadow-xs">
                  {uploadingMain ? (
                    <div className="text-center p-3 text-emerald-700 space-y-2 w-full">
                      <Loader2 className="w-7 h-7 animate-spin text-emerald-600 mx-auto" />
                      <div className="text-[11px] font-bold">
                        আপলোড হচ্ছে... {uploadProgressMain}%
                      </div>
                      <div className="w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgressMain}%` }}
                        />
                      </div>
                    </div>
                  ) : mainImage ? (
                    <>
                      <img
                        src={mainImage}
                        alt="Main Preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setMainImage('')}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow-sm cursor-pointer"
                        title="ছবি মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-2 left-2 right-2 bg-emerald-900/80 backdrop-blur-xs text-white text-[10px] text-center font-bold py-0.5 rounded-md">
                        ✓ ছবি যুক্ত হয়েছে
                      </div>
                    </>
                  ) : (
                    <div
                      onClick={() => mainFileInputRef.current?.click()}
                      className="text-center p-3 text-slate-400 cursor-pointer hover:text-emerald-700 transition-colors"
                    >
                      <Upload className="w-7 h-7 mx-auto mb-1 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      <span className="text-[11px] font-bold block bengali-font">
                        ফোন / গ্যালারি থেকে মূল ছবি দিন
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        JPG, PNG, WebP
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:col-span-8 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 bengali-font">
                    মূল ছবি নির্বাচন (Main Product Image) *
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={mainFileInputRef}
                      onChange={handleMainFileChange}
                      accept={ACCEPTED_IMAGE_TYPES}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => mainFileInputRef.current?.click()}
                      disabled={uploadingMain}
                      className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-sm disabled:opacity-50 active:scale-95 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span className="bengali-font">
                        {uploadingMain ? `আপলোড হচ্ছে (${uploadProgressMain}%)` : 'ফোন/গ্যালারি থেকে ছবি সিলেক্ট করুন'}
                      </span>
                    </button>
                    {mainImage && (
                      <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1">
                        <Check className="w-4 h-4" />
                        <span>প্রিভিউ সক্রিয়</span>
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                    অথবা ছবির সরাসরি URL লিংক পেস্ট করুন (Alternative Option):
                  </label>
                  <input
                    type="url"
                    value={mainImage}
                    onChange={(e) => setMainImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Additional Images (Gallery) */}
            <div className="pt-3 border-t border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <label className="text-xs font-bold text-slate-800 bengali-font block">
                    অতিরিক্ত ছবিসমূহ (Multiple Gallery Images):
                  </label>
                  <span className="text-[11px] text-slate-500">
                    একাধিক ছবি একসাথে সিলেক্ট করে গ্যালারিতে যোগ করুন।
                  </span>
                </div>

                <div>
                  <input
                    type="file"
                    ref={additionalFileInputRef}
                    onChange={handleAdditionalFilesChange}
                    accept={ACCEPTED_IMAGE_TYPES}
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => additionalFileInputRef.current?.click()}
                    disabled={uploadingAdditional}
                    className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>
                      {uploadingAdditional ? `আপলোড হচ্ছে (${uploadProgressAdditional}%)` : 'গ্যালারি ছবি যোগ করুন'}
                    </span>
                  </button>
                </div>
              </div>

              {uploadingAdditional && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 mb-2">
                  <div className="flex justify-between font-bold mb-1">
                    <span>গ্যালারি ছবি আপলোড হচ্ছে...</span>
                    <span>{uploadProgressAdditional}%</span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgressAdditional}%` }}
                    />
                  </div>
                </div>
              )}

              {additionalImages.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {additionalImages.map((img, idx) => (
                    <div key={idx} className="relative w-18 h-18 rounded-xl overflow-hidden border border-slate-200 shadow-xs group bg-white">
                      <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setAdditionalImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="মুছুন"
                      >
                        <Trash2 className="w-4 h-4 text-rose-300" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic pt-1">
                  এখনো কোনো অতিরিক্ত ছবি যোগ করা হয়নি।
                </p>
              )}
            </div>
          </div>

          {/* 2. BASIC PRODUCT INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 bengali-font">
                পণ্যের নাম (বাংলা) *
              </label>
              <input
                type="text"
                required
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="যেমন: হাতে বোনা ঢাকাই জামদানি শাড়ি"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Product Name (English)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Exclusive Dhakai Jamdani Saree"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 3. CATEGORY & PRICING */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 bengali-font">
                ক্যাটাগরি (Category) *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameBn} ({cat.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 bengali-font">
                পূর্বমূল্য / Regular Price (৳)
              </label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 bengali-font">
                অফার প্রাইস / Offer Price (৳) *
              </label>
              <input
                type="number"
                required
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-emerald-400 font-bold text-emerald-800 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 4. STOCK & HIGHLIGHT TOGGLES */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span className="font-bold bengali-font">স্টকে আছে (In Stock)</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span className="font-bold bengali-font">ফিচার্ড (Featured)</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span className="font-bold bengali-font">জনপ্রিয় (Popular)</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isHotDeal}
                onChange={(e) => setIsHotDeal(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span className="font-bold bengali-font">হট ডিল (Hot Deal)</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer text-rose-600">
              <input
                type="checkbox"
                checked={isHidden}
                onChange={(e) => setIsHidden(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
              />
              <span className="font-bold bengali-font">হাইড করুন (Hide)</span>
            </label>
          </div>

          {/* 5. SIZES & COLORS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 bengali-font">
                সাইজ সমূহ (Sizes, কমা দিয়ে লিখুন)
              </label>
              <input
                type="text"
                value={sizesInput}
                onChange={(e) => setSizesInput(e.target.value)}
                placeholder="যেমন: M, L, XL, XXL অথবা 12 হাত"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 bengali-font">
                কালার সমূহ (Colors, কমা দিয়ে লিখুন)
              </label>
              <input
                type="text"
                value={colorsInput}
                onChange={(e) => setColorsInput(e.target.value)}
                placeholder="যেমন: লাল, কালো, সাদা, নেভি"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 6. DESCRIPTIONS */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 bengali-font">
                সংক্ষিপ্ত বিবরণ (বাংলা)
              </label>
              <input
                type="text"
                value={shortDescBn}
                onChange={(e) => setShortDescBn(e.target.value)}
                placeholder="যেমন: ১০০% পিওর সুতা দিয়ে নিখুঁত হাতে বোনা ঢাকাই জামদানি..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 bengali-font">
                পূর্ণাঙ্গ বিবরণ (Full Description in Bangla)
              </label>
              <textarea
                rows={3}
                value={fullDescBn}
                onChange={(e) => setFullDescBn(e.target.value)}
                placeholder="পণ্য সম্পর্কে বিস্তারিত বর্ণনা..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 7. SPECIFICATIONS (Key-Value) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 bengali-font">
                স্পেসিফিকেশন ও ফিচার তালিকা (Specifications):
              </label>
              <button
                type="button"
                onClick={handleAddSpec}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>রো যোগ করুন</span>
              </button>
            </div>

            <div className="space-y-2">
              {specs.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={item.key}
                    onChange={(e) => handleUpdateSpec(idx, 'key', e.target.value)}
                    placeholder="বৈশিষ্ট্য (যেমন: উপাদান)"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => handleUpdateSpec(idx, 'value', e.target.value)}
                    placeholder="মান (যেমন: ১০০% পিওর কটন)"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 8. WARRANTY, GUARANTEE, EXPIRY, DELIVERY DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 bengali-font">
                ওয়ারেন্টি বিবরণ (Warranty Details)
              </label>
              <input
                type="text"
                value={warrantyDetails}
                onChange={(e) => setWarrantyDetails(e.target.value)}
                placeholder="যেমন: ১ বছর ব্র্যান্ড সার্ভিস ওয়ারেন্টি"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 bengali-font">
                গ্যারান্টি বিবরণ (Guarantee Details)
              </label>
              <input
                type="text"
                value={guaranteeDetails}
                onChange={(e) => setGuaranteeDetails(e.target.value)}
                placeholder="যেমন: ৭ দিনের ফ্রি রিপ্লেসমেন্ট গ্যারান্টি"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 bengali-font">
                মেয়াদ / এক্সপায়রি বিবরণ (Expiry Date / Details)
              </label>
              <input
                type="text"
                value={expiryDetails}
                onChange={(e) => setExpiryDetails(e.target.value)}
                placeholder="যেমন: উৎপাদন তারিখ থেকে ৩ বছর সংরক্ষণযোগ্য"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 bengali-font">
                ডেলিভারি তথ্য (Delivery Info)
              </label>
              <input
                type="text"
                value={deliveryInfo}
                onChange={(e) => setDeliveryInfo(e.target.value)}
                placeholder="যেমন: ঢাকা সিটিতে ২৪-৪৮ ঘন্টা, ঢাকার বাইরে ৩-৪ দিন"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={saving || uploadingMain || uploadingAdditional}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>সেভ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span className="bengali-font">
                    {isEditing ? 'আপডেট করুন' : 'পণ্য প্রকাশ করুন'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
