import React, { useState } from 'react';
import { Tag, Layers, ArrowRight, ShieldCheck, ChevronRight, Check } from 'lucide-react';
import { BrandItem, ProductTypeItem, Product } from '../types';
import { ProductCard } from './ProductCard';

interface BrandAndTypeViewProps {
  brands: BrandItem[];
  productTypes: ProductTypeItem[];
  products: Product[];
  initialMode?: 'brands' | 'types';
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
}

export const BrandAndTypeView: React.FC<BrandAndTypeViewProps> = ({
  brands,
  productTypes,
  products,
  initialMode = 'brands',
  onSelectProduct,
  onAddToCart,
}) => {
  const [activeTab, setActiveTab] = useState<'brands' | 'types'>(initialMode);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const displayedProducts = products.filter((p) => {
    if (activeTab === 'brands' && selectedBrand) {
      return p.brand.toLowerCase() === selectedBrand.toLowerCase();
    }
    if (activeTab === 'types' && selectedType) {
      return p.type.toLowerCase() === selectedType.toLowerCase();
    }
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8" id="brand-type-view-container">
      {/* Header & Tab Toggle */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold text-[#065f46] uppercase tracking-wider bg-[#ecfdf5] px-3 py-1 rounded-full inline-block mb-2">
              Eksplorasi Katalog
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#064e3b] tracking-tight">
              {activeTab === 'brands' ? 'Daftar Merk Terkemuka' : 'Tipe & Varian Produk'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 mt-1">
              {activeTab === 'brands'
                ? 'Jaminan produk original dari produsen terpercaya berstandar SNI & internasional.'
                : 'Temukan produk spesifik berdasarkan tipe teknis dan kebutuhan instalasi rumah.'}
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="inline-flex bg-slate-100 p-1 rounded-2xl shrink-0 self-start sm:self-auto">
            <button
              onClick={() => {
                setActiveTab('brands');
                setSelectedType(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'brands'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Tag className="w-4 h-4" />
              Pilihan Merk
            </button>
            <button
              onClick={() => {
                setActiveTab('types');
                setSelectedBrand(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'types'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              Tipe Produk
            </button>
          </div>
        </div>

        {/* Brands Selector Grid */}
        {activeTab === 'brands' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
            <button
              onClick={() => setSelectedBrand(null)}
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                selectedBrand === null
                  ? 'border-[#065f46] bg-[#f0fdf4] ring-2 ring-[#065f46]/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <span className="text-xs sm:text-sm font-bold text-slate-800 block">Semua Merk</span>
              <span className="text-[10px] text-slate-700">{products.length} Produk</span>
            </button>
            {brands.map((brand) => {
              const count = products.filter(
                (p) => p.brand.toLowerCase() === brand.name.toLowerCase()
              ).length;
              const isSelected = selectedBrand === brand.name;
              return (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(isSelected ? null : brand.name)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#065f46] bg-[#f0fdf4] ring-2 ring-[#065f46]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-extrabold text-[#064e3b] block uppercase">
                    {brand.name}
                  </span>
                  <span className="text-[10px] text-slate-700 block mt-0.5">{count} Produk</span>
                  {brand.description && (
                    <span className="text-[9px] text-slate-700 line-clamp-1 mt-1 block">
                      {brand.description}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* Types Selector Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2">
            <button
              onClick={() => setSelectedType(null)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                selectedType === null
                  ? 'border-[#065f46] bg-[#f0fdf4] ring-2 ring-[#065f46]/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <span className="text-xs font-bold text-slate-800 block">Semua Tipe</span>
              <span className="text-[10px] text-slate-700">{products.length} Produk</span>
            </button>
            {productTypes.map((type) => {
              const count = products.filter(
                (p) => p.type.toLowerCase() === type.name.toLowerCase()
              ).length;
              const isSelected = selectedType === type.name;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(isSelected ? null : type.name)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#065f46] bg-[#f0fdf4] ring-2 ring-[#065f46]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block truncate" title={type.name}>
                    {type.name}
                  </span>
                  <span className="text-[10px] font-semibold text-[#065f46] block mt-0.5">
                    {type.categoryName} ({count})
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Filter Bar */}
      {(selectedBrand || selectedType) && (
        <div className="flex items-center justify-between mb-6 bg-[#ecfdf5] border border-emerald-200 px-4 py-2.5 rounded-2xl">
          <span className="text-xs font-bold text-[#064e3b]">
            Menampilkan hasil untuk:{' '}
            <strong className="underline">
              {activeTab === 'brands' ? `Merk ${selectedBrand}` : `Tipe ${selectedType}`}
            </strong>{' '}
            ({displayedProducts.length} produk)
          </span>
          <button
            onClick={() => {
              setSelectedBrand(null);
              setSelectedType(null);
            }}
            className="text-xs font-bold text-rose-600 hover:text-rose-700"
          >
            Hapus Filter
          </button>
        </div>
      )}

      {/* Product Results */}
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
    </div>
  );
};
