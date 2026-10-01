import React, { useState } from 'react';
import { Product, Category, Banner, StoreSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { AdminProductsTab } from './AdminProductsTab';
import { AdminCategoriesTab } from './AdminCategoriesTab';
import { AdminBannersTab } from './AdminBannersTab';
import { AdminSettingsTab } from './AdminSettingsTab';
import { Package, Layers, Image as ImageIcon, Settings, LogOut, ExternalLink, ShieldCheck, ShoppingBag } from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  settings: StoreSettings;
  onExitAdmin: () => void;
  onProductDeleted?: (productId: string) => void;
  onCategoryDeleted?: (categoryId: string) => void;
  onBannerDeleted?: (bannerId: string) => void;
}

type TabType = 'products' | 'categories' | 'banners' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  categories,
  banners,
  settings,
  onExitAdmin,
  onProductDeleted,
  onCategoryDeleted,
  onBannerDeleted,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Admin Top Navbar */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight">
                    {settings.shopName || 'Israt BD Shop'}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Admin Console
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 bengali-font -mt-0.5">
                  সুপার এডমিন কন্ট্রোল প্যানেল
                </p>
              </div>
            </div>

            {/* Right Admin Profile & Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={onExitAdmin}
                className="px-3 sm:px-4 py-2 bg-emerald-700/80 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="গ্রাহক স্টোরফ্রন্টে ফিরে যান"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="bengali-font hidden sm:inline">স্টোরফ্রন্ট দেখুন</span>
                <span className="bengali-font sm:hidden">শপ দেখুন</span>
              </button>

              <div className="hidden md:flex items-center space-x-2 text-xs text-slate-300 pl-2 border-l border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="max-w-[140px] truncate">{currentUser?.email}</span>
              </div>

              <button
                onClick={async () => {
                  await logout();
                  onExitAdmin();
                }}
                className="p-2 sm:px-3 sm:py-2 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                title="লগআউট"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline bengali-font">লগআউট</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto py-2.5 border-t border-slate-800 scrollbar-none">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Package className="w-4 h-4" />
              <span className="bengali-font">পণ্যসমূহ (Products - {products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="bengali-font">ক্যাটাগরি (Categories - {categories.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('banners')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'banners'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span className="bengali-font">ব্যানার (Banners - {banners.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="bengali-font">দোকান সেটিংস (Settings)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {activeTab === 'products' && (
          <AdminProductsTab
            products={products}
            categories={categories}
            onProductDeleted={onProductDeleted}
          />
        )}
        {activeTab === 'categories' && (
          <AdminCategoriesTab
            categories={categories}
            products={products}
            onCategoryDeleted={onCategoryDeleted}
          />
        )}
        {activeTab === 'banners' && (
          <AdminBannersTab
            banners={banners}
            categories={categories}
            onBannerDeleted={onBannerDeleted}
          />
        )}
        {activeTab === 'settings' && (
          <AdminSettingsTab settings={settings} />
        )}
      </main>
    </div>
  );
};
