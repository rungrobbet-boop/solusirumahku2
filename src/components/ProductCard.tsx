import React from 'react';
import { ShoppingCart, Star, Eye, ShieldCheck, Flame } from 'lucide-react';
import { Product } from '../types';
import { formatRupiah, getStockStatus } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCart,
}) => {
  const stockInfo = getStockStatus(product.stockCount);
  const currentPrice = product.discountPrice || product.price;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#065f46]/40 transition-all duration-200 overflow-hidden cursor-pointer h-full"
      id={`product-card-${product.id}`}
    >
      {/* Product Image Box */}
      <div className="relative w-full pt-[85%] bg-slate-50 overflow-hidden">
        <img
          src={product.mainImage || (product.images && product.images[0])}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {/* Favorite Month Rank badge (1-20) */}
          {product.isFavoriteMonthRank && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-xs">
              <Flame className="w-3 h-3 fill-white" />
              Favorit #{product.isFavoriteMonthRank}
            </span>
          )}

          {/* Discount badge */}
          {hasDiscount && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-xs">
              Hemat {discountPercent}%
            </span>
          )}

          {/* Latest Badge */}
          {product.isLatest && !product.isFavoriteMonthRank && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
              Terbaru
            </span>
          )}
        </div>

        {/* Stock Status Badge for User */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${stockInfo.badgeClass}`}
          >
            {stockInfo.label}
          </span>
        </div>

        {/* Quick View overlay hint */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-slate-800 text-xs font-semibold shadow-sm backdrop-blur-xs">
            <Eye className="w-3.5 h-3.5 text-[#065f46]" />
            Lihat Detail
          </span>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Brand & Type */}
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 mb-1">
            <span className="font-semibold text-[#065f46] uppercase tracking-wide bg-[#ecfdf5] px-2 py-0.5 rounded-md">
              {product.brand}
            </span>
            <span className="truncate max-w-[120px]" title={product.type}>
              {product.type}
            </span>
          </div>

          {/* Product Name */}
          <h3
            className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#065f46] transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>

          {product.packingQuantity && product.packingUnit && (
            <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-slate-700 bg-slate-100 font-medium px-2 py-0.5 rounded-md">
              <span>📦 {product.packingQuantity} {product.packingUnit}/pack</span>
            </div>
          )}
        </div>

        {/* Price & Action Section */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-end justify-between gap-2">
            <div>
              {hasDiscount && (
                <span className="text-[11px] text-slate-600 line-through block -mb-0.5">
                  {formatRupiah(product.price)}
                </span>
              )}
              <span className="text-sm sm:text-base font-extrabold text-[#064e3b]">
                {formatRupiah(currentPrice)}
              </span>
            </div>

            {/* Quick Add to Cart Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product, e);
              }}
              className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#065f46] text-white hover:bg-[#047857] active:scale-95 transition-all shadow-xs shrink-0"
              title="Tambah ke Keranjang"
              id={`btn-add-cart-${product.id}`}
            >
              <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
