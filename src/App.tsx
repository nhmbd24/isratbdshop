import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, Category, StoreSettings } from './types';
import {
  subscribeToProducts,
  subscribeToCategories,
  subscribeToSettings,
  DEFAULT_SETTINGS,
} from './firebase/db';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsPage } from './components/ProductDetailsModal';
import { Footer } from './components/Footer';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { BloggerExportHelperModal } from './components/BloggerExportHelperModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Search, X, SearchX, Check } from 'lucide-react';
import { formatBDT } from './utils/helpers';

function StorefrontApp() {
  const { currentUser, isAdmin, loading: authLoading } = useAuth();

  // Firestore Live States - Firestore is the ONLY source of truth!
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  // Firestore background synchronization states - loads silently in background
  const [isProductsLoaded, setIsProductsLoaded] = useState(false);
  const [isCategoriesLoaded, setIsCategoriesLoaded] = useState(false);

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

    const unsubSettings = subscribeToSettings((liveSettings) => {
      setSettings(liveSettings);
    });

    return () => {
      unsubProducts();
      unsubCategories();
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
        // 1. Check window.location.search (?product=ID)
        if (window.location.search) {
          const params = new URLSearchParams(window.location.search);
          const p = params.get('product') || params.get('p') || params.get('id');
          if (p) targetId = p;
        }
        // 2. Check window.location.hash (#product-ID or #ID)
        if (!targetId && window.location.hash) {
          const rawHash = window.location.hash.replace(/^#/, '');
          const match = rawHash.match(/(?:product[-=]|p[-=])?([^&]+)/i);
          if (match && match[1]) targetId = decodeURIComponent(match[1]);
        }
        // 3. Check document.referrer (when loaded inside Blogger iframe)
        if (!targetId && typeof document !== 'undefined' && document.referrer) {
          try {
            const refUrl = new URL(document.referrer);
            const refParam = refUrl.searchParams.get('product') || refUrl.searchParams.get('p') || refUrl.searchParams.get('id');
            if (refParam) {
              targetId = refParam;
            } else if (refUrl.hash) {
              const rHash = refUrl.hash.replace(/^#/, '');
              const rMatch = rHash.match(/(?:product[-=]|p[-=])?([^&]+)/i);
              if (rMatch && rMatch[1]) targetId = decodeURIComponent(rMatch[1]);
            }
          } catch {}
        }
        // 4. Check parent frame if accessible (same-origin check)
        if (!targetId && typeof window !== 'undefined' && window.parent && window.parent !== window) {
          try {
            if (window.parent.location.search) {
              const pParams = new URLSearchParams(window.parent.location.search);
              const p = pParams.get('product') || pParams.get('p') || pParams.get('id');
              if (p) targetId = p;
            }
          } catch {}
          try {
            if (!targetId && window.parent.location.hash) {
              const pHash = window.parent.location.hash.replace(/^#/, '');
              const pMatch = pHash.match(/(?:product[-=]|p[-=])?([^&]+)/i);
              if (pMatch && pMatch[1]) targetId = decodeURIComponent(pMatch[1]);
            }
          } catch {}
        }
        if (targetId) {
          const cleanId = targetId.replace(/^(?:product[-=]|p[-=])/, '').trim();
          const found = products.find(
            (p) =>
              p.id === targetId ||
              p.id === cleanId ||
              String(p.id).toLowerCase() === targetId!.toLowerCase() ||
              String(p.id).toLowerCase() === cleanId.toLowerCase()
          );
          if (found && (!selectedProductRef.current || selectedProductRef.current.id !== found.id)) {
            setSelectedProduct(found);
          }
        }
      } catch {}
    };

    checkTargetProduct();
    window.addEventListener('hashchange', checkTargetProduct);
    window.addEventListener('popstate', checkTargetProduct);

    // Also support window message if parent frame posts target product
    const handleMessage = (event: MessageEvent) => {
      try {
        if (event.data && typeof event.data === 'object') {
          const pid = event.data.productId || event.data.product;
          if (pid && typeof pid === 'string') {
            const cleanId = pid.replace(/^(?:product[-=]|p[-=])/, '').trim();
            const found = products.find(
              (p) =>
                p.id === pid ||
                p.id === cleanId ||
                String(p.id).toLowerCase() === pid.toLowerCase() ||
                String(p.id).toLowerCase() === cleanId.toLowerCase()
            );
            if (found && (!selectedProductRef.current || selectedProductRef.current.id !== found.id)) {
              setSelectedProduct(found);
            }
          }
        }
      } catch {}
    };
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('hashchange', checkTargetProduct);
      window.removeEventListener('popstate', checkTargetProduct);
      window.removeEventListener('message', handleMessage);
    };
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

  // If Admin View is active and user is admin
  if (viewMode === 'admin' && isAdmin) {
    return (
      <AdminDashboard
        products={products}
        categories={categories}
        settings={settings}
        onExitAdmin={() => setViewMode('storefront')}
        onProductDeleted={handleProductDeleted}
        onCategoryDeleted={handleCategoryDeleted}
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

      {/* 1. Header with logo and shop name */}
      <Header
        onSelectCategory={(catId) => setSelectedCategory(catId)}
        settings={settings}
        onOpenAdmin={handleOpenAdmin}
        isAdmin={isAdmin}
      />

      {/* 2. Search bar (immediately below header) */}
      <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 pt-3 pb-1">
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="পণ্য বা মডেল সার্চ করুন (যেমন: শাড়ি, জামদানি, থ্রি-পিস, ওয়াচ, মধু...)"
            className="w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 bg-white text-xs sm:text-sm rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 sm:pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Categories (immediately below search) */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => setSelectedCategory(catId)}
        productCounts={categoryCounts}
      />

      {/* 4. Products grid (immediately below categories) */}
      <main id="products-grid" className="flex-1 max-w-7xl mx-auto px-1.5 xs:px-2 sm:px-6 lg:px-8 py-3 sm:py-6 w-full min-w-0 max-w-full">
        {/* Section Header with title and sorting */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2.5 sm:pb-4 mb-3 sm:mb-4 border-b border-slate-200/80 gap-2 sm:gap-3 w-full min-w-0">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight bengali-font">
                {searchQuery ? `"${searchQuery}" এর সার্চ ফলাফল` : 'আমাদের জনপ্রিয় পণ্যসমূহ'}
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                {filteredProducts.length} টি পণ্য
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 bengali-font">
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
                className="text-xs font-semibold bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition-all"
              >
                <option value="featured">জনপ্রিয় ও ফিচার্ড</option>
                <option value="price-low">দাম: কম থেকে বেশি</option>
                <option value="price-high">দাম: বেশি থেকে কম</option>
                <option value="rating">রেটিং অনুযায়ী</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid: Mobile EXACTLY 3 cards per row via repeat(3, minmax(0, 1fr)) */}
        {filteredProducts.length > 0 ? (
          <div
            className="grid mobile-3-cols-grid [grid-template-columns:repeat(3,minmax(0,1fr))] sm:[grid-template-columns:repeat(2,minmax(0,1fr))] md:[grid-template-columns:repeat(3,minmax(0,1fr))] lg:[grid-template-columns:repeat(4,minmax(0,1fr))] gap-1.5 xs:gap-2 sm:gap-4 lg:gap-6 w-full min-w-0 max-w-full overflow-hidden"
          >
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
          <div
            className="grid mobile-3-cols-grid [grid-template-columns:repeat(3,minmax(0,1fr))] sm:[grid-template-columns:repeat(2,minmax(0,1fr))] md:[grid-template-columns:repeat(3,minmax(0,1fr))] lg:[grid-template-columns:repeat(4,minmax(0,1fr))] gap-1.5 xs:gap-2 sm:gap-4 lg:gap-6 w-full min-w-0 max-w-full overflow-hidden"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-2 sm:p-4 space-y-2 sm:space-y-3 animate-pulse"
              >
                <div className="aspect-square w-full bg-slate-100 rounded-lg sm:rounded-xl" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-6 sm:h-9 bg-slate-100 rounded-lg sm:rounded-xl w-full" />
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
