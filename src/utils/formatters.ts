import React from 'react';
import {
  Lightbulb,
  SunMedium,
  ToggleRight,
  Tv,
  Zap,
  Wrench,
  BatteryCharging,
  Home,
  Utensils,
  Droplets,
  Sparkles,
  Package,
  Headphones,
  ShieldCheck,
  Truck,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { CartItem, Product } from '../types';

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (!num && num !== 0) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
}

// User-facing Stock Badge Rule:
// If admin sets a number > 0 -> "Tersedia" (Green badge)
// If admin leaves empty/null/blank -> "Tanya Admin" (Amber/Blue badge)
export function getStockStatus(stockCount?: number | null): {
  label: 'Tersedia' | 'Tanya Admin';
  badgeClass: string;
  isAvailable: boolean;
  rawStock: number | null;
} {
  if (typeof stockCount === 'number' && stockCount > 0) {
    return {
      label: 'Tersedia',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20',
      isAvailable: true,
      rawStock: stockCount,
    };
  }
  return {
    label: 'Tanya Admin',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-500/20',
    isAvailable: false,
    rawStock: null,
  };
}

export function getCategoryIcon(iconName: string, className = 'w-6 h-6'): React.ReactElement {
  switch (iconName) {
    case 'Lightbulb':
      return React.createElement(Lightbulb, { className });
    case 'SunMedium':
      return React.createElement(SunMedium, { className });
    case 'ToggleRight':
      return React.createElement(ToggleRight, { className });
    case 'Tv':
      return React.createElement(Tv, { className });
    case 'Zap':
      return React.createElement(Zap, { className });
    case 'Wrench':
      return React.createElement(Wrench, { className });
    case 'BatteryCharging':
      return React.createElement(BatteryCharging, { className });
    case 'Home':
      return React.createElement(Home, { className });
    case 'Utensils':
      return React.createElement(Utensils, { className });
    case 'Droplets':
      return React.createElement(Droplets, { className });
    case 'Sparkles':
      return React.createElement(Sparkles, { className });
    case 'Headphones':
      return React.createElement(Headphones, { className });
    case 'ShieldCheck':
      return React.createElement(ShieldCheck, { className });
    case 'Truck':
      return React.createElement(Truck, { className });
    case 'Package':
    default:
      return React.createElement(Package, { className });
  }
}

export function cleanPhoneNumber(phone: string): string {
  let cleaned = (phone || '6281234567890').replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export function generateWhatsAppOrderMessage(
  phone: string,
  cartItems: CartItem[],
  buyerData: {
    name: string;
    phone: string;
    address: string;
    notes?: string;
  },
  storeName = 'Solusi Rumahku'
): string {
  const cleanPhone = cleanPhoneNumber(phone);
  const totalEstimation = cartItems.reduce((acc, item) => {
    const itemPrice = item.product.discountPrice || item.product.price;
    return acc + itemPrice * item.quantity;
  }, 0);

  let message = `*HALO ${storeName.toUpperCase()}*, SAYA INGIN MEMESAN PRODUK BERIKUT:\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━\n`;

  cartItems.forEach((item, index) => {
    const itemPrice = item.product.discountPrice || item.product.price;
    const subtotal = itemPrice * item.quantity;
    const stockInfo = getStockStatus(item.product.stockCount).label;

    message += `*${index + 1}. ${item.product.name}*\n`;
    message += `   • Merk / Tipe: ${item.product.brand} | ${item.product.type}\n`;
    message += `   • Status: ${stockInfo}\n`;
    message += `   • Jumlah: ${item.quantity} x ${formatRupiah(itemPrice)} = *${formatRupiah(subtotal)}*\n`;
    if (item.notes) {
      message += `   • Catatan Item: _${item.notes}_\n`;
    }
    message += `\n`;
  });

  message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `*ESTIMASI TOTAL: ${formatRupiah(totalEstimation)}*\n\n`;

  message += `*DATA PEMESAN:*\n`;
  message += `• Nama: ${buyerData.name || '-'}\n`;
  message += `• No. HP/WA: ${buyerData.phone || '-'}\n`;
  message += `• Alamat Kirim / Lokasi: ${buyerData.address || '-'}\n`;
  if (buyerData.notes) {
    message += `• Catatan Tambahan: ${buyerData.notes}\n`;
  }

  message += `\n_Mohon konfirmasi ketersediaan stok aktual, ongkos kirim, dan metode pembayarannya. Terima kasih!_`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function generateWhatsAppSingleProductMessage(
  phone: string,
  product: Product,
  quantity: number = 1,
  notes?: string,
  storeName = 'Solusi Rumahku'
): string {
  const cleanPhone = cleanPhoneNumber(phone);
  const price = product.discountPrice || product.price;
  const subtotal = price * quantity;
  const stockInfo = getStockStatus(product.stockCount).label;

  let message = `*HALO ${storeName.toUpperCase()}*, SAYA INGIN MEMESAN LANGSUNG PRODUK BERIKUT:\n\n`;
  message += `*• Nama Produk:* ${product.name}\n`;
  message += `*• Merk / Tipe:* ${product.brand} | ${product.type}\n`;
  message += `*• Kategori:* ${product.category}\n`;
  message += `*• Status Stok:* ${stockInfo}\n`;
  message += `*• Harga Satuan:* ${formatRupiah(price)}\n`;
  message += `*• Jumlah Pesanan:* ${quantity} unit\n`;
  message += `*• Estimasi Total:* ${formatRupiah(subtotal)}\n`;
  if (notes) {
    message += `*• Catatan Khusus:* ${notes}\n`;
  }
  message += `\n_Mohon info ketersediaan stok aktual dan instruksi pembayarannya. Terima kasih!_`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

