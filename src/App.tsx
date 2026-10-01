import React, { useState, useMemo, useEffect } from 'react';
import { Product, Category, Banner, StoreSettings } from './types';
import {
  subscribeToProducts,
  subscribeToCategories,
  subscribeToBanners,
  subscribeToSettings,
  seedInitialDataIfEmpty,
  DEFAULT_SETTINGS,
  DEFAULT_CATEGORIES,
  DEFAULT_BANNERS,
} from './firebase/db';
import { DEMO_PRODUCTS } from './data/products';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { Footer } from './components/Footer';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { BloggerExportHelperModal } from './components/BloggerExportHelperModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SearchX, Check } from 'lucide-react';
import { formatBDT } from './utils/helpers';

function StorefrontApp() {
  const { currentUser, isAdmin, loading: authLoading } = useAuth();

  // Firestore Live States with fallback defaults
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  // View mode
  const [viewMode, setViewMode] = useState<'storefront' | 'admin'>('storefront');
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Storefront Filtering & Search States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isBloggerModalOpen, setIsBloggerModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Seed Firestore if empty & subscribe to live updates
  useEffect(() => {
    seedInitialDataIfEmpty();

    let initialLoad = true;
    const unsubProducts = subscribeToProducts((liveProducts) => {
      if (liveProducts.length > 0 || !initialLoad) {
        setProducts(liveProducts);
      }
      initialLoad = false;
    });

    let initialCategoriesLoad = true;
    const unsubCategories = subscribeToCategories((liveCats) => {
      if (liveCats.length > 0 || !initialCategoriesLoad) {
        setCategories(liveCats);
      }
      initialCategoriesLoad = false;
    });

    let initialBannersLoad = true;
    const unsubBanners = subscribeToBanners((liveBanners) => {
      if (liveBanners.length > 0 || !initialBannersLoad) {
        setBanners(liveBanners);
      }
      initialBannersLoad = false;
    });

    const unsubSettings = subscribeToSettings((liveSettings) => {
      setSettings(liveSettings);
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubBanners();
      unsubSettings();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Public customers see only non-hidden products
  const publicProducts = useMemo(() => {
    return products.filter((p) => !p.isHidden);
  }, [products]);

  // Product counts for public categories
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: publicProducts.length };
    publicProducts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [publicProducts]);

  // Filtered and sorted products for storefront display
  const filteredProducts = useMemo(() => {
    return publicProducts
      .filter((p) => {
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const query = searchQuery.trim().toLowerCase();
        if (!query) return matchesCategory;

        const matchesSearch =
          p.name.toLowerCase().includes(query) ||
          p.nameBn.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.categoryBn.toLowerCase().includes(query) ||
          p.shortDesc?.toLowerCase().includes(query) ||
          p.shortDescBn?.toLowerCase().includes(query);

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.offerPrice - b.offerPrice;
        if (sortBy === 'price-high') return b.offerPrice - a.offerPrice;
        if (sortBy === 'rating') return b.rating - a.rating;
        // Default: featured first
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      });
  }, [publicProducts, selectedCategory, searchQuery, sortBy]);

  // Admin access handler
  const handleOpenAdmin = () => {
    if (isAdmin) {
      setViewMode('admin');
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleProductDeleted = (deletedId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  const handleCategoryDeleted = (deletedId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== deletedId));
  };

  const handleBannerDeleted = (deletedId: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== deletedId));
  };

  // If Admin View is active and user is admin
  if (viewMode === 'admin' && isAdmin) {
    return (
      <AdminDashboard
        products={products}
        categories={categories}
        banners={banners}
        settings={settings}
        onExitAdmin={() => setViewMode('storefront')}
        onProductDeleted={handleProductDeleted}
        onCategoryDeleted={handleCategoryDeleted}
        onBannerDeleted={handleBannerDeleted}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-800 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-600 flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-300" />
          <span className="bengali-font">{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectCategory={(catId) => setSelectedCategory(catId)}
        activeCategory={selectedCategory}
        settings={settings}
        onOpenAdmin={handleOpenAdmin}
        isAdmin={isAdmin}
      />

      {/* Hero Banner with Live Firestore Carousel & Trust Badges */}
      {!searchQuery && (
        <HeroBanner
          banners={banners}
          settings={settings}
          onShopNow={() => {
            const el = document.getElementById('products-grid');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            const el = document.getElementById('products-grid');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {/* Category Section Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => setSelectedCategory(catId)}
        productCounts={categoryCounts}
      />

      {/* Main Product Showcase Section */}
      <main id="products-grid" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Section Header with title and sorting */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-slate-200/80 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight bengali-font">
                {searchQuery ? `"${searchQuery}" এর সার্চ ফলাফল` : 'আমাদের জনপ্রিয় পণ্যসমূহ'}
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {filteredProducts.length} টি পণ্য
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 bengali-font">
              সারা বাংলাদেশে হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <span className="text-xs text-slate-500 font-medium bengali-font hidden sm:inline">
              সাজান:
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-semibold bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition-all"
              >
                <option value="featured">জনপ্রিয় ও ফিচার্ড</option>
                <option value="price-low">দাম: কম থেকে বেশি</option>
                <option value="price-high">দাম: বেশি থেকে কম</option>
                <option value="rating">রেটিং অনুযায়ী</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                settings={settings}
                onViewDetails={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        ) : (
          /* Empty Search / Filter State */
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-md mx-auto my-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 bengali-font">
              কোনো পণ্য খুঁজে পাওয়া যায়নি!
            </h3>
            <p className="text-xs text-slate-500 bengali-font">
              অন্য কোনো নামে সার্চ করুন অথবা সব ক্যাটাগরি ব্রাউজ করুন।
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer bengali-font"
            >
              সব পণ্য দেখুন
            </button>
          </div>
        )}
      </main>

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        settings={settings}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoginOpen(false);
          setViewMode('admin');
        }}
      />

      {/* Blogger and Custom Domain Guide Modal */}
      <BloggerExportHelperModal
        isOpen={isBloggerModalOpen}
        onClose={() => setIsBloggerModalOpen(false)}
      />

      {/* Floating Interactive WhatsApp Button */}
      <WhatsAppFloatingButton settings={settings} />

      {/* Footer with Admin Login Entry */}
      <Footer
        settings={settings}
        onOpenBloggerModal={() => setIsBloggerModalOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        isAdmin={isAdmin}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StorefrontApp />
    </AuthProvider>
  );
}
