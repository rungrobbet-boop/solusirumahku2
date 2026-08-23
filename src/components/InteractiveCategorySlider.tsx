import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { CategoryItem } from '../types';
import { getCategoryIcon } from '../utils/formatters';

interface InteractiveCategorySliderProps {
  categories: CategoryItem[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onViewAllCategories?: () => void;
}

export const InteractiveCategorySlider: React.FC<InteractiveCategorySliderProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onViewAllCategories,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const sortedCategories = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="w-full relative" id="interactive-category-slider-section">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-6 rounded-full bg-[#15803d]" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#064e3b] tracking-tight">
              Kategori Pilihan
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 mt-0.5">
            Geser untuk melihat seluruh kategori perlengkapan listrik & tehnik
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onViewAllCategories && (
            <button
              onClick={onViewAllCategories}
              className="text-xs sm:text-sm font-semibold text-[#065f46] hover:text-[#047857] underline mr-2"
            >
              Lihat Semua
            </button>
          )}
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-[#ecfdf5] hover:text-[#065f46] hover:border-[#065f46]/30 shadow-xs transition-all active:scale-95"
            title="Geser Kiri"
            id="btn-category-scroll-left"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-[#ecfdf5] hover:text-[#065f46] hover:border-[#065f46]/30 shadow-xs transition-all active:scale-95"
            title="Geser Kanan"
            id="btn-category-scroll-right"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* "Semua Produk" pill */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`shrink-0 snap-start flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer min-w-[105px] sm:min-w-[130px] max-w-[130px] text-center ${
            selectedCategoryId === null
              ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-md ring-2 ring-[#064e3b]/30'
              : 'bg-white text-slate-700 border-slate-200 hover:border-[#065f46]/40 hover:bg-[#f0fdf4] shadow-xs'
          }`}
          id="btn-category-all"
        >
          <div
            className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center mb-2 transition-transform duration-200 ${
              selectedCategoryId === null ? 'bg-white/20 text-white' : 'bg-[#ecfdf5] text-[#065f46]'
            }`}
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-xs sm:text-sm font-bold leading-tight line-clamp-2">Semua Produk</span>
          <span
            className={`text-[10px] mt-1 font-medium ${
              selectedCategoryId === null ? 'text-emerald-100' : 'text-slate-700'
            }`}
          >
            Lihat Total
          </span>
        </button>

        {/* Categories items */}
        {sortedCategories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={`group shrink-0 snap-start flex flex-col items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer min-w-[115px] sm:min-w-[140px] max-w-[145px] text-center relative overflow-hidden ${
                isSelected
                  ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-md ring-2 ring-[#064e3b]/30 scale-[1.02]'
                  : 'bg-white text-slate-800 border-slate-200/90 hover:border-[#065f46]/40 hover:bg-[#f0fdf4]/70 shadow-xs hover:shadow-sm'
              }`}
              id={`btn-category-${cat.slug}`}
            >
              {/* Category Logo / Image thumbnail if available */}
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden mb-2 p-0.5 bg-gradient-to-tr from-[#065f46]/20 to-emerald-300/30 flex items-center justify-center">
                {cat.logoUrl ? (
                  <img
                    src={cat.logoUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback to icon if image fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : null}
                <div
                  className={`absolute inset-0 flex items-center justify-center rounded-xl transition-all ${
                    cat.logoUrl
                      ? 'bg-black/30 group-hover:bg-black/10 text-white'
                      : isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-[#ecfdf5] text-[#065f46]'
                  }`}
                >
                  {getCategoryIcon(cat.iconName, 'w-6 h-6')}
                </div>
              </div>

              <span
                className={`text-xs sm:text-[13px] font-bold leading-tight line-clamp-2 px-0.5 ${
                  isSelected ? 'text-white' : 'text-slate-800 group-hover:text-[#065f46]'
                }`}
              >
                {cat.name}
              </span>

              {cat.description && (
                <span
                  className={`text-[9px] sm:text-[10px] mt-1 line-clamp-1 leading-tight ${
                    isSelected ? 'text-emerald-100' : 'text-slate-600'
                  }`}
                  title={cat.description}
                >
                  {cat.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
