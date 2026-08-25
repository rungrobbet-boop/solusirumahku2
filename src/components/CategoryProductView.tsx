import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Tag,
  Check,
  X,
  Package,
  Layers,
} from 'lucide-react';
import { Product, CategoryItem, BrandItem } from '../types';
import { ProductCard } from './ProductCard';
import { getCategoryIcon } from '../utils/formatters';

interface CategoryProductViewProps {
  products: Product[];
  categories: CategoryItem[];
  brands: BrandItem[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
  initialSearchQuery?: string;
  hasMoreProducts?: boolean;
  isLoadingMore?: boolean;
  onLoadMoreProducts?: () => void;
}

export const CategoryProductView: React.FC<CategoryProductViewProps> = ({
  products,
  categories,
  brands,
  selectedCategoryId,
  onSelectCategory,
  onSelectProduct,
  onAddToCart,
  initialSearchQuery = '',
  hasMoreProducts = false,
  isLoadingMore = false,
  onLoadMoreProducts,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'askAdmin'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'priceAsc' | 'priceDesc' | 'favRank'>('default');
  const [showAllProducts, setShowAllProducts] = useState(false);

  // Active category: if null, default to first category
  const activeCategoryId = selectedCategoryId || (categories.length > 0 ? categories[0].id : null);
  const selectedCategoryObj = categories.find((c) => c.id === activeCategoryId) || categories[0];

  const filteredProducts = useMemo(() => {
    let result = products.filter((prod) => {
      // Category match
      if (selectedCategoryObj) {
        if (prod.category.toLowerCase() !== selectedCategoryObj.name.toLowerCase()) {
          return false;
        }
      }

      // Brand match
      if (selectedBrand) {
        if (prod.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }
      }

      // Availability match
      if (availabilityFilter === 'available') {
        if (typeof prod.stockCount !== 'number' || prod.stockCount <= 0) return false;
      } else if (availabilityFilter === 'askAdmin') {
        if (typeof prod.stockCount === 'number' && prod.stockCount > 0) return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inName = prod.name.toLowerCase().includes(query);
        const inBrand = prod.brand.toLowerCase().includes(query);
        const inCategory = prod.category.toLowerCase().includes(query);
        const inType = prod.type.toLowerCase().includes(query);
        const inDesc = prod.description.toLowerCase().includes(query);
        return inName || inBrand || inCategory || inType || inDesc;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'priceAsc') {
      result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortBy === 'priceDesc') {
      result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sortBy === 'favRank') {
      result.sort((a, b) => (a.isFavoriteMonthRank || 999) - (b.isFavoriteMonthRank || 999));
    }

    return result;
  }, [products, selectedCategoryObj, selectedBrand, availabilityFilter, searchQuery, sortBy]);

  const displayedProducts = showAllProducts ? filteredProducts : filteredProducts.slice(0, 10);

  const handleSelectCategory = (catId: string) => {
    setShowAllProducts(false);
    onSelectCategory(catId);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8" id="category-product-view">
      {/* Category Header with Dedicated Search */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#ecfdf5] text-[#065f46] flex items-center justify-center shrink-0 shadow-2xs">
              {selectedCategoryObj
                ? getCategoryIcon(selectedCategoryObj.iconName, 'w-6 h-6')
                : <Layers className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#064e3b] tracking-tight">
                {selectedCategoryObj ? selectedCategoryObj.name : 'Daftar Kategori Produk'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-700 mt-0.5">
                {selectedCategoryObj?.description ||
                  `Menampilkan ${filteredProducts.length} barang peralatan listrik & teknik`}
              </p>
            </div>
          </div>

          {/* Search Box on Category Page */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowAllProducts(false);
              }}
              placeholder="Cari dalam kategori ini..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#065f46] focus:bg-white transition-all"
              id="input-search-category-page"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-600 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Categories Tab Selector (No 'Semua' button as requested) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-t border-slate-100 pt-4">
          {categories.map((cat) => {
            const count = products.filter(
              (p) => p.category.toLowerCase() === cat.name.toLowerCase()
            ).length;
            const isSelected = selectedCategoryObj?.id === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#064e3b] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-[#ecfdf5] hover:text-[#065f46]'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Bar (Brand, Availability, Sort) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#065f46]" />
            Filter:
          </span>

          {/* Brand select */}
          <select
            value={selectedBrand || ''}
            onChange={(e) => {
              setSelectedBrand(e.target.value || null);
              setShowAllProducts(false);
            }}
            className="text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#065f46]"
          >
            <option value="">Semua Merk</option>
            {brands.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Availability filter */}
          <select
            value={availabilityFilter}
            onChange={(e) => {
              setAvailabilityFilter(e.target.value as any);
              setShowAllProducts(false);
            }}
            className="text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#065f46]"
          >
            <option value="all">Semua Status Stok</option>
            <option value="available">Hanya Tersedia</option>
            <option value="askAdmin">Tanya Admin</option>
          </select>

          {(selectedBrand || availabilityFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedBrand(null);
                setAvailabilityFilter('all');
                setSearchQuery('');
                setShowAllProducts(false);
              }}
              className="text-xs font-semibold text-rose-600 hover:underline px-2"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-slate-700 flex items-center gap-1 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Urutkan:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#065f46]"
          >
            <option value="default">Paling Sesuai</option>
            <option value="priceAsc">Harga Terendah</option>
            <option value="priceDesc">Harga Tertinggi</option>
            <option value="favRank">Produk Favorit</option>
          </select>
        </div>
      </div>

      {/* Showing count indicator */}
      <div className="flex items-center justify-between text-xs text-slate-700 mb-4 px-1">
        <span>
          Menampilkan {displayedProducts.length} dari total {filteredProducts.length} produk dalam kategori <strong>{selectedCategoryObj?.name}</strong>
        </span>
      </div>

      {/* Product Results Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">Produk Tidak Ditemukan</h3>
          <p className="text-xs text-slate-700 max-w-sm mx-auto mb-5">
            Tidak ada produk yang sesuai dengan pencarian atau filter yang dipilih. Silakan sesuaikan filter atau kata kunci Anda.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedBrand(null);
              setAvailabilityFilter('all');
            }}
            className="px-5 py-2.5 rounded-xl bg-[#065f46] text-white text-xs font-bold shadow-xs hover:bg-[#047857] transition-all"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>

          {/* Lihat Semua Button (Limit 10 by default for local items) */}
          {filteredProducts.length > 10 && (
            <div className="flex items-center justify-center pt-2">
              <button
                onClick={() => setShowAllProducts(!showAllProducts)}
                className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-[#065f46] border-2 border-[#065f46] text-xs sm:text-sm font-extrabold shadow-sm active:scale-98 transition-all flex items-center gap-2"
                id="btn-category-view-all"
              >
                {showAllProducts ? (
                  <span>Tampilkan 10 Produk Saja</span>
                ) : (
                  <span>Lihat Semua ({filteredProducts.length} Produk Lokal) &rarr;</span>
                )}
              </button>
            </div>
          )}

          {/* Load More Next Page from Cloud (Cursor-Based Pagination) */}
          {hasMoreProducts && onLoadMoreProducts && (
            <div className="flex items-center justify-center pt-4">
              <button
                onClick={onLoadMoreProducts}
                disabled={isLoadingMore}
                className="px-8 py-3.5 rounded-2xl bg-[#064e3b] hover:bg-[#065f46] disabled:opacity-50 text-white text-xs sm:text-sm font-extrabold shadow-md active:scale-98 transition-all flex items-center gap-2"
                id="btn-load-more-cloud"
              >
                {isLoadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memuat 20 Produk Berikutnya...</span>
                  </>
                ) : (
                  <span>Muat 20 Produk Berikutnya (Appwrite) &rarr;</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
