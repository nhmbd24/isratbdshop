import React, { useState } from 'react';
import { Product, Category } from '../../types';
import { saveProduct, deleteProduct } from '../../firebase/db';
import { ProductFormModal } from './ProductFormModal';
import { Plus, Search, Edit3, Trash2, Eye, EyeOff, Star, Sparkles, Flame, CheckCircle, Package, AlertCircle, Loader2 } from 'lucide-react';
import { formatBDT } from '../../utils/helpers';

interface AdminProductsTabProps {
  products: Product[];
  categories: Category[];
  onProductDeleted?: (productId: string) => void;
}

export const AdminProductsTab: React.FC<AdminProductsTabProps> = ({
  products,
  categories,
  onProductDeleted,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Dedicated Delete Dialog states
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [localDeletedIds, setLocalDeletedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const filtered = products
    .filter((p) => !localDeletedIds.has(p.id))
    .filter((p) => {
      const matchesCat = selectedCat === 'all' || p.category === selectedCat;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.nameBn.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });

  const handleToggleHide = async (product: Product) => {
    setActionLoading(product.id);
    try {
      await saveProduct({
        ...product,
        isHidden: !product.isHidden,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStock = async (product: Product) => {
    setActionLoading(product.id);
    try {
      await saveProduct({
        ...product,
        inStock: !product.inStock,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete || isDeleting) return;
    const targetProduct = productToDelete;
    setIsDeleting(true);
    setDeleteError('');

    try {
      // 1. Delete from Firestore and cleanup storage files
      await deleteProduct(targetProduct.id);

      // 2. Immediately remove from local list & parent state so both admin table & storefront update instantly
      setLocalDeletedIds((prev) => new Set(prev).add(targetProduct.id));
      onProductDeleted?.(targetProduct.id);

      // 3. Show success confirmation toast
      setSuccessToast('পণ্যটি সফলভাবে মুছে ফেলা হয়েছে');
      setTimeout(() => setSuccessToast(''), 3500);
      setProductToDelete(null);
    } catch (err: any) {
      console.error('Delete product failed:', err);
      // Show the REAL Firebase error instead of pretending it was deleted
      let errorMsg = err?.message || 'পণ্য মুছে ফেলতে সমস্যা হয়েছে।';
      try {
        const parsed = JSON.parse(errorMsg);
        if (parsed?.error) {
          errorMsg = `${parsed.error}${parsed.path ? ` (Path: ${parsed.path})` : ''}`;
        }
      } catch {
        // use raw errorMsg
      }
      setDeleteError(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveProduct = async (product: Product) => {
    await saveProduct(product);
  };

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex flex-1 items-center gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="পণ্য বা মডেল সার্চ করুন..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none"
          >
            <option value="all">সকল ক্যাটাগরি</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameBn}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setProductToEdit(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-700/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="bengali-font">নতুন পণ্য যোগ করুন (Add Product)</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3 rounded-2xl border border-slate-200">
          <span className="text-slate-400 block bengali-font">মোট পণ্য</span>
          <span className="text-xl font-black text-slate-800">{products.length}</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200">
          <span className="text-slate-400 block bengali-font">ইন-স্টক পণ্য</span>
          <span className="text-xl font-black text-emerald-700">
            {products.filter((p) => p.inStock).length}
          </span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200">
          <span className="text-slate-400 block bengali-font">ফিচার্ড / হট ডিল</span>
          <span className="text-xl font-black text-amber-600">
            {products.filter((p) => p.isFeatured || p.isHotDeal).length}
          </span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200">
          <span className="text-slate-400 block bengali-font">লুকানো / Hidden</span>
          <span className="text-xl font-black text-rose-600">
            {products.filter((p) => p.isHidden).length}
          </span>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">ছবি</th>
                <th className="py-3 px-4">পণ্যের নাম</th>
                <th className="py-3 px-4">ক্যাটাগরি</th>
                <th className="py-3 px-4">মূল্য (৳)</th>
                <th className="py-3 px-4">স্টক</th>
                <th className="py-3 px-4">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">একশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    কোনো পণ্য পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4">
                      <img
                        src={prod.image}
                        alt={prod.nameBn}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900 max-w-xs">
                      <div className="line-clamp-1 bengali-font">{prod.nameBn}</div>
                      <div className="text-[10px] text-slate-400 font-normal truncate">
                        {prod.name}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {prod.isFeatured && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                            Featured
                          </span>
                        )}
                        {prod.isHotDeal && (
                          <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                            Hot Deal
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-600 bengali-font">
                      {prod.categoryBn}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-extrabold text-emerald-700">
                        {formatBDT(prod.offerPrice)}
                      </div>
                      {prod.originalPrice > prod.offerPrice && (
                        <div className="text-[10px] text-slate-400 line-through">
                          {formatBDT(prod.originalPrice)}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <button
                        onClick={() => handleToggleStock(prod)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                          prod.inStock
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {prod.inStock ? '✓ ইন-স্টক' : '✕ স্টক আউট'}
                      </button>
                    </td>
                    <td className="py-2.5 px-4">
                      <button
                        onClick={() => handleToggleHide(prod)}
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                          prod.isHidden
                            ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                        }`}
                        title="স্টোরফ্রন্টে প্রদর্শন বা লুকান"
                      >
                        {prod.isHidden ? (
                          <>
                            <EyeOff className="w-3 h-3 text-slate-500" />
                            <span>লুকানো (Hidden)</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3 text-teal-600" />
                            <span>লাইভ (Visible)</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => {
                            setProductToEdit(prod);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="এডিট করুন"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteDialog(prod);
                          }}
                          className="p-2 sm:p-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-600 rounded-lg transition-colors cursor-pointer touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center"
                          title="ডিলিট করুন"
                          aria-label="পণ্য মুছুন"
                        >
                          <Trash2 className="w-4 h-4 pointer-events-none" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add / Edit Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
        categories={categories}
        onSave={handleSaveProduct}
      />

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center mb-2 bengali-font">
              আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান?
            </h3>

            <p className="text-xs text-slate-500 text-center mb-4 bengali-font">
              পণ্য: <strong className="text-slate-800">{productToDelete.nameBn || productToDelete.name}</strong>
              <br />
              <span className="text-[11px] text-slate-400">আইডি: {productToDelete.id}</span>
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
                    setProductToDelete(null);
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
