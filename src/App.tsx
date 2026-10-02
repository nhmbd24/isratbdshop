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
import { SearchX, Check } from 'lucide-react';
import { formatBDT } from './utils/helpers';

function StorefrontApp() {
  const { currentUser, isAdmin, loading: authLoading } = useAuth();

  // Firestore Live States - Firestore is the ONLY source of truth!
  // Initialize with empty arrays so deleted items are NEVER briefly shown on refresh
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  // Firestore background synchronization states - loads silently in background
  const [isProductsLoaded, setIsProductsLoaded] = useState(false);
  const [isCategoriesLoaded, setIsCategoriesLoaded] = useState(false);
  const [isBannersLoaded, setIsBannersLoaded] = useState(false);

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
  const selectedProductRef = useRef<Product | null>(null);

  useEffect(() => {
    selectedProductRef.current = selectedProduct;
  }, [selectedProduct]);

  // Open direct product if shared link hash is present (#product-PRODUCT_ID or ?product=PRODUCT_ID)
  useEffect(() => {
    if (!products || products.length === 0) return;
    const checkTargetProduct = () => {
      try {
        let targetId: string | null = null;
        // 1. Check window.location.hash
        const hash = window.location.hash;
        if (hash) {
          const match = hash.match(/#(?:product[-=]|p[-=])([^&]+)/i);
          if (match) targetId = decodeURIComponent(match[1]);
        }
        // 2. Check query param (?product=ID)
        if (!targetId && window.location.search) {
          const params = new URLSearchParams(window.location.search);
          const p = params.get('product') || params.get('p') || params.get('id');
          if (p) targetId = p;
        }
        // 3. Check parent frame hash if accessible (same origin or cross-origin safe check)
        if (!targetId) {
          try {
            if (window.parent && window.parent !== window && window.parent.location.hash) {
              const pMatch = window.parent.location.hash.match(/#(?:product[-=]|p[-=])([^&]+)/i);
              if (pMatch) targetId = decodeURIComponent(pMatch[1]);
            }
          } catch {}
        }
        if (targetId) {
          const found = products.find((p) => p.id === targetId);
          if (found && (!selectedProductRef.current || selectedProductRef.current.id !== found.id)) {
            setSelectedProduct(found);
          }
        }
      } catch {}
    };

    checkTargetProduct();
    window.addEventListener('hashchange', checkTargetProduct);
    return () => window.removeEventListener('hashchange', checkTargetProduct);
  }, [products]);

  // Open product details as a full-screen view inside the React app (never alters Blogger parent URL)
  const handleOpenProductDetails = (product: Product) => {
    savedScrollPositionRef.current =
      window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

    // Push internal state with NO URL change so Android/browser Back returns to previous shop screen
    try {
      window.history.pushState({ isProductView: true }, '');
    } catch {
      // Ignore if iframe/sandbox blocks history manipulation
    }

    setSelectedProduct(product);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  // Back navigation from Product Details page
  const handleBackFromProductDetails = () => {
    if (window.history.state?.isProductView) {
      window.history.back();
    } else {
      setSelectedProduct(null);
      const restorePos = savedScrollPositionRef.current;
      requestAnimationFrame(() => {
        window.scrollTo({ top: restorePos, left: 0, behavior: 'instant' });
      });
    }
  };

  // Handle Android / browser Back button (returns from Product Details to previous shop screen)
  useEffect(() => {
    const handlePopState = () => {
      if (selectedProductRef.current) {
        setSelectedProduct(null);
        const restorePos = savedScrollPositionRef.current;
        requestAnimationFrame(() => {
          window.scrollTo({ top: restorePos, left: 0, behavior: 'instant' });
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
        ) : !isProductsLoaded ? (
          /* Silent background load: light placeholder skeleton */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 w-full min-w-0">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 space-y-3 animate-pulse"
              >
                <div className="aspect-square w-full bg-slate-100 rounded-xl" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-9 bg-slate-100 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : (
          /* Empty Search / Filter State (only when loaded and truly empty) */
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
