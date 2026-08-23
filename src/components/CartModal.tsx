import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  User,
} from 'lucide-react';
import { CartItem } from '../types';
import { formatRupiah, getStockStatus } from '../utils/formatters';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateCart: (newCart: CartItem[]) => void;
  onCheckout: (
    items: CartItem[],
    customerInfo: { name: string; phone: string; address: string; notes?: string }
  ) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateCart,
  onCheckout,
}) => {
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [buyerNotes, setBuyerNotes] = useState('');

  if (!isOpen) return null;

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => {
    const itemPrice = item.product.discountPrice || item.product.price;
    return acc + itemPrice * item.quantity;
  }, 0);

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const newCart = cartItems
      .map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];
    onUpdateCart(newCart);
  };

  const handleRemoveItem = (productId: string) => {
    const newCart = cartItems.filter((item) => item.product.id !== productId);
    onUpdateCart(newCart);
  };

  const handleClearCart = () => {
    onUpdateCart([]);
  };

  const handleProceedToWhatsApp = () => {
    onCheckout(cartItems, {
      name: buyerName,
      phone: buyerPhone,
      address: buyerAddress,
      notes: buyerNotes,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={onClose}
      id="cart-modal-container"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#f0fdf4] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#065f46] text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#064e3b] leading-tight">Keranjang Belanja</h2>
              <p className="text-xs text-slate-700">
                {totalItemsCount} item produk siap dipesan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
              >
                Kosongkan
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-700 transition-colors"
              title="Tutup Keranjang"
              id="btn-close-cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 sm:p-6 flex-1">
          {cartItems.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">Keranjang Belanja Kosong</h3>
              <p className="text-xs text-slate-700 max-w-xs mb-5">
                Anda belum menambahkan peralatan listrik atau perkakas teknik ke keranjang.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-xs"
              >
                Mulai Belanja Sekarang
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* List of Cart Items */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                {cartItems.map((item) => {
                  const itemPrice = item.product.discountPrice || item.product.price;
                  const stockInfo = getStockStatus(item.product.stockCount);

                  return (
                    <div
                      key={item.product.id}
                      className="p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4 hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Thumbnail */}
                      <img
                        src={item.product.mainImage || item.product.images[0]}
                        alt={item.product.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                        referrerPolicy="no-referrer"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold text-[#065f46] bg-[#ecfdf5] px-1.5 py-0.5 rounded">
                            {item.product.brand}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${stockInfo.badgeClass}`}
                          >
                            {stockInfo.label}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={item.product.name}>
                          {item.product.name}
                        </h4>

                        <p className="text-xs font-bold text-[#064e3b] mt-0.5">
                          {formatRupiah(itemPrice)}{' '}
                          <span className="text-[11px] font-normal text-slate-700">/ unit</span>
                        </p>
                      </div>

                      {/* Quantity adjuster */}
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, -1)}
                            className="p-1 sm:p-1.5 text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                            title="Kurangi"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-slate-900 min-w-[28px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, 1)}
                            className="p-1 sm:p-1.5 text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                            title="Tambah"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="p-1.5 text-slate-600 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors ml-1"
                          title="Hapus Barang"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Buyer Form */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#065f46]" />
                  Informasi Pembeli (Opsional)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="Contoh: Pak Budi"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#065f46]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      No. WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#065f46]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Alamat Kirim / Lokasi Proyek
                  </label>
                  <textarea
                    rows={2}
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    placeholder="Alamat lengkap tujuan pengiriman barang..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#065f46] resize-none"
                  />
                </div>
              </div>

              {/* Price Total Summary */}
              <div className="p-4 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0]">
                <div className="flex items-center justify-between text-xs text-emerald-900 mb-1">
                  <span>Total Kuantitas</span>
                  <span className="font-semibold">{totalItemsCount} Barang</span>
                </div>
                <div className="flex items-center justify-between text-sm sm:text-base font-extrabold text-[#064e3b] pt-1 border-t border-emerald-200">
                  <span>Estimasi Total Belanja</span>
                  <span className="text-lg sm:text-xl">{formatRupiah(totalPrice)}</span>
                </div>
                <p className="text-[10px] text-emerald-800 mt-1">
                  *Belum termasuk ongkos kirim (dikonfirmasi langsung via WhatsApp).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Checkout Button */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-col gap-2 shrink-0">
            <button
              onClick={handleProceedToWhatsApp}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#15803d] hover:bg-[#166534] text-white text-sm sm:text-base font-extrabold shadow-lg shadow-emerald-900/10 active:scale-98 transition-all flex items-center justify-center gap-2.5"
              id="btn-cart-checkout-whatsapp"
            >
              <MessageCircle className="w-5 h-5 fill-white text-[#15803d]" />
              Kirim Pesanan ke WhatsApp Toko
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <span className="text-[11px] text-center text-slate-700">
              Pemberitahuan & verifikasi stok akan ditampilkan sebelum dialihkan ke WhatsApp.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
