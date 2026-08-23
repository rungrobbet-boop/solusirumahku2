import React, { useState } from 'react';
import {
  X,
  ShoppingCart,
  MessageCircle,
  ShieldCheck,
  Truck,
  CheckCircle,
  HelpCircle,
  Flame,
  ChevronRight,
  Share2,
  Check,
} from 'lucide-react';
import { Product } from '../types';
import { formatRupiah, getStockStatus } from '../utils/formatters';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onDirectOrder: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onDirectOrder,
}) => {
  if (!product) return null;

  const allImages = [
    product.mainImage,
    ...(product.images || []).filter((img) => img !== product.mainImage),
  ].slice(0, 5);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  const stockInfo = getStockStatus(product.stockCount);
  const currentPrice = product.discountPrice || product.price;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={onClose}
      id="product-detail-modal"
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#065f46]">
            <span className="bg-[#ecfdf5] px-2.5 py-1 rounded-lg uppercase tracking-wider">
              {product.category}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-700">{product.brand}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-700 hover:text-slate-800 transition-colors"
              title="Bagikan Tautan Produk"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-700 hover:text-slate-800 transition-colors"
              title="Tutup"
              id="btn-close-detail"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="overflow-y-auto p-5 sm:p-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
            {/* Left Column: Gallery (Up to 5 images) */}
            <div className="md:col-span-6 flex flex-col gap-3">
              {/* Main Active Image Frame */}
              <div className="relative w-full aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center">
                <img
                  src={allImages[activeImageIndex] || product.mainImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-2"
                  referrerPolicy="no-referrer"
                />

                {product.isFavoriteMonthRank && (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-md">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    Favorit Bulan Ini #{product.isFavoriteMonthRank}
                  </span>
                )}
              </div>

              {/* Thumbnails (Up to 5 images) */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        activeImageIndex === idx
                          ? 'border-[#065f46] ring-2 ring-[#065f46]/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Product Info & Order Controls */}
            <div className="md:col-span-6 flex flex-col justify-between">
              <div>
                {/* Brand & Type */}
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1.5">
                  <span className="text-[#065f46] font-bold uppercase">{product.brand}</span>
                  <span>•</span>
                  <span>{product.type}</span>
                </div>

                {/* Product Name */}
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight mb-3">
                  {product.name}
                </h1>

                {/* Status & Stock (User Visible rule: Tersedia vs Tanya Admin) */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${stockInfo.badgeClass}`}
                  >
                    {stockInfo.isAvailable ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    Status Stok: {stockInfo.label}
                  </span>

                  <span className="text-xs text-slate-700">
                    Kategori: <strong className="text-slate-700">{product.category}</strong>
                  </span>
                </div>

                {/* Price Display */}
                <div className="p-4 rounded-2xl bg-[#f0fdf4] border border-[#dcfce7] mb-5">
                  <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
                    Harga Resmi Toko
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-black text-[#064e3b]">
                      {formatRupiah(currentPrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-slate-600 line-through">
                        {formatRupiah(product.price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Deskripsi Produk
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>

                {/* Packing Unit / Grosir Info if provided */}
                {product.packingQuantity && product.packingUnit && (
                  <div className="mb-5 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 font-bold">
                      📦
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-950">
                        Satuan Packing (Partai / Grosir)
                      </h4>
                      <p className="text-xs text-amber-900">
                        Isi <strong>{product.packingQuantity} {product.packingUnit}</strong> per kemasan / pack.
                      </p>
                    </div>
                  </div>
                )}

                {/* Technical Specifications */}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Spesifikasi Teknis
                    </h3>
                    <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                      {Object.entries(product.specifications).map(([key, val], idx) => (
                        <div
                          key={key}
                          className={`flex items-center justify-between p-2.5 ${
                            idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'
                          } border-b last:border-b-0 border-slate-100`}
                        >
                          <span className="font-semibold text-slate-700">{key}</span>
                          <span className="font-medium text-slate-900 text-right">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Bar (Quantity, Keranjang, Pesan Sekarang) */}
              <div className="pt-4 border-t border-slate-200 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700 uppercase">Jumlah:</span>
                  <div className="inline-flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 font-bold active:bg-slate-200 transition-colors"
                      title="Kurangi"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-sm font-bold text-slate-900 min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 font-bold active:bg-slate-200 transition-colors"
                      title="Tambah"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-xs text-slate-700 ml-auto">
                    Subtotal: <strong>{formatRupiah(currentPrice * quantity)}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => onAddToCart(product, quantity)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-bold shadow-sm active:scale-98 transition-all"
                    id="btn-modal-add-cart"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Tambah Keranjang
                  </button>

                  <button
                    onClick={() => onDirectOrder(product, quantity)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white text-sm font-bold shadow-md active:scale-98 transition-all"
                    id="btn-modal-order-now"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Pesan Sekarang
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
