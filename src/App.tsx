import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, Category, Banner, StoreSettings } from './types';
import {
  subscribeToProducts,
  subscribeToCategories,
  subscribeToBanners,
  subscribeToSettings,
  DEFAULT_SETTINGS,
} from './firebase/db';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsPage } from './components/ProductDetailsModal';
import { Footer } from './components/Footer';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { BloggerExportHelperModal } from './components/BloggerExportHelperModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SearchX, Check, Loader2, Sparkles } from 'lucide-react';
import { formatBDT } from './utils/helpers';

function StorefrontApp() {
  const { currentUser, isAdmin, loading: authLoading } = useAuth();

  // Firestore Live States - Firestore is the ONLY source of truth!
  // Initialize with empty arrays so deleted items are NEVER briefly shown on refresh
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  // Firestore Loading States: Ensure clean loading until real Firestore data is ready
  const [isProductsLoaded, setIsProductsLoaded] = useState(false);
  const [isCategoriesLoaded, setIsCategoriesLoaded] = useState(false);
  const [isBannersLoaded, setIsBannersLoaded] = useState(false);

  const isInitialLoading = !isProductsLoaded || !isCategoriesLoaded || !isBannersLoaded;

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

  // Subscribe to live Firestore updates
  useEffect(() => {
    const unsubProducts = subscribeToProducts((liveProducts) => {
      setProducts(liveProducts);
      setIsProductsLoaded(true);
    });

    const unsubCategories = subscribeToCategories((liveCats) => {
      setCategories(liveCats);
      setIsCategoriesLoaded(true);
    });

    const unsubBanners = subscribeToBanners((liveBanners) => {
      setBanners(liveBanners);
      setIsBannersLoaded(true);
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

  const savedScrollPositionRef = useRef<number>(0);

  // Open product details as a full-screen mobile/desktop page with browser history
  const handleOpenProductDetails = (product: Product) => {
    savedScrollPositionRef.current =
      window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

    const url = new URL(window.location.href);
    url.searchParams.set('product', product.id);
    window.history.pushState({ type: 'product_details', productId: product.id }, '', url.toString());

    setSelectedProduct(product);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  // Back navigation from Product Details page
  const handleBackFromProductDetails = () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('product') || window.history.state?.productId) {
      window.history.back();
    } else {
      setSelectedProduct(null);
      const url = new URL(window.location.href);
      url.searchParams.delete('product');
      window.history.replaceState({}, '', url.toString());

      const restorePos = savedScrollPositionRef.current;
      requestAnimationFrame(() => {
        window.scrollTo({ top: restorePos, left: 0, behavior: 'instant' });
        setTimeout(() => {
          window.scrollTo({ top: restorePos, left: 0, behavior: 'instant' });
        }, 50);
      });
    }
  };

  // Handle browser Back / Forward (including Android hardware/gesture back button)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const urlParams = new URLSearchParams(window.location.search);
      const prodId = urlParams.get('product') || (event.state?.productId as string | undefined);

      if (prodId) {
        const found = products.find((p) => p.id === prodId);
        if (found) {
          setSelectedProduct(found);
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          return;
        }
      }

      // No product in URL -> return to previous shop view and restore previous scroll position
      setSelectedProduct(null);
      const restorePos = savedScrollPositionRef.current;
      requestAnimationFrame(() => {
        window.scrollTo({ top: restorePos, left: 0, behavior: 'instant' });
        setTimeout(() => {
          window.scrollTo({ top: restorePos, left: 0, behavior: 'instant' });
        }, 50);
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  // Initial load check for ?product=<id>
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const prodId = urlParams.get('product');
    if (prodId && products.length > 0 && !selectedProduct) {
      const found = products.find((p) => p.id === prodId);
      if (found) {
        setSelectedProduct(found);
      }
    }
  }, [products, selectedProduct]);

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

  // While Firestore data is loading, show loading state and NEVER show old/default products
  if (isInitialLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="max-w-sm w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl flex flex-col items-center text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-inner relative">
            <Sparkles className="w-8 h-8 text-emerald-600 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 bengali-font">
              {settings?.shopNameBn || 'ইসরাত বিডি শপ'}
            </h2>
            <p className="text-xs text-slate-500 font-medium bengali-font">
              দোকানের তথ্য ও পণ্য লোড হচ্ছে...
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200/60">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span className="bengali-font">অনুগ্রহ করে একটু অপেক্ষা করুন</span>
          </div>
        </div>
      </div>
    );
  }

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
    <>
      {/* Full-Screen Product Details Page */}
      {selectedProduct && (
        <ProductDetailsPage
          product={selectedProduct}
          settings={settings}
          onBack={handleBackFromProductDetails}
        />
      )}

      {/* Main Storefront Container (Hidden when Product Details is open to preserve state & exact scroll position) */}
      <div
        className={`min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-slate-50 text-slate-800 relative ${
          selectedProduct ? 'hidden' : ''
        }`}
      >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 sm:top-20 right-3 sm:right-4 z-50 max-w-[calc(100vw-1.5rem)] bg-emerald-800 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-xl border border-emerald-600 flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-300 shrink-0" />
          <span className="bengali-font truncate">{toastMessage}</span>
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
      <main id="products-grid" className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 w-full min-w-0">
        {/* Section Header with title and sorting */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 sm:pb-4 mb-4 border-b border-slate-200/80 gap-3 w-full min-w-0">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight bengali-font">
                {searchQuery ? `"${searchQuery}" এর সার্চ ফলাফল` : 'আমাদের জনপ্রিয় পণ্যসমূহ'}
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                {filteredProducts.length} টি পণ্য
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 bengali-font">
              সারা বাংলাদেশে হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2 self-start sm:self-auto">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 w-full min-w-0">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                settings={settings}
                onViewDetails={handleOpenProductDetails}
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
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StorefrontApp />
    </AuthProvider>
  );
}
