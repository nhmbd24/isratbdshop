import React from 'react';
import { Category } from '../types';
import { Sparkles, Shirt, Smartphone, Leaf, Watch, Home, Heart, ShoppingBag, Gift, Zap } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  productCounts: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  productCounts,
}) => {
  const getIcon = (iconName: string, active: boolean) => {
    const iconProps = { className: `w-4 h-4 ${active ? 'text-white' : 'text-emerald-700'}` };
    switch (iconName) {
      case 'Sparkles': return <Sparkles {...iconProps} />;
      case 'Shirt': return <Shirt {...iconProps} />;
      case 'Smartphone': return <Smartphone {...iconProps} />;
      case 'Leaf': return <Leaf {...iconProps} />;
      case 'Watch': return <Watch {...iconProps} />;
      case 'Home': return <Home {...iconProps} />;
      case 'Heart': return <Heart {...iconProps} />;
      case 'ShoppingBag': return <ShoppingBag {...iconProps} />;
      case 'Gift': return <Gift {...iconProps} />;
      case 'Zap': return <Zap {...iconProps} />;
      default: return <Sparkles {...iconProps} />;
    }
  };

  const visibleCategories = categories.filter((c) => !c.isHidden);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-2.5 sm:mb-3">
        <div>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight bengali-font">
            ক্যাটাগরি সমূহ (Categories)
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 bengali-font">
            আপনার পছন্দের ক্যাটাগরি বেছে নিন এবং সেরা অফার উপভোগ করুন
          </p>
        </div>
      </div>

      {/* Horizontal Scrollable Categories Wrapper */}
      <div className="w-full max-w-full min-w-0 overflow-hidden">
        <div
          className="flex flex-nowrap items-center space-x-2 sm:space-x-2.5 overflow-x-auto pb-2.5 pt-1 no-scrollbar touch-pan-x overscroll-x-contain w-full"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* All Products Tab */}
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`shrink-0 flex items-center space-x-1.5 sm:space-x-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border whitespace-nowrap touch-manipulation ${
              selectedCategory === 'all'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-700/20 scale-[1.02]'
                : 'bg-white text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/50 border-slate-200/90'
            }`}
          >
            <div
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center shrink-0 ${
                selectedCategory === 'all' ? 'bg-white/20' : 'bg-emerald-50'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${selectedCategory === 'all' ? 'text-white' : 'text-emerald-700'}`} />
            </div>
            <span className="bengali-font font-medium">সবগুলো পণ্য</span>
            <span
              className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full ${
                selectedCategory === 'all'
                  ? 'bg-emerald-800 text-emerald-100 font-bold'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {productCounts['all'] ?? 0}
            </span>
          </button>

          {/* Dynamic categories from Firestore */}
          {visibleCategories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const count = productCounts[cat.id] ?? 0;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`shrink-0 flex items-center space-x-1.5 sm:space-x-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border whitespace-nowrap touch-manipulation ${
                  isActive
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-700/20 scale-[1.02]'
                    : 'bg-white text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/50 border-slate-200/90'
                }`}
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.nameBn}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded object-cover shrink-0"
                  />
                ) : (
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-white/20' : 'bg-emerald-50'
                    }`}
                  >
                    {getIcon(cat.icon, isActive)}
                  </div>
                )}
                <span className="bengali-font font-medium">{cat.nameBn}</span>
                <span
                  className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-emerald-800 text-emerald-100 font-bold'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {/* Spacer ensuring last category is fully reachable on swipe */}
          <div className="w-3 shrink-0 sm:hidden" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};
