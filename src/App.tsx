import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Sparkles,
  Smartphone,
  Lock,
  MessageCircle,
  Flame,
  Clock,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Tag,
  Layers,
  ArrowRight,
  Phone,
  CheckCircle2,
  X,
  Menu,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Product,
  CategoryItem,
  BrandItem,
  ProductTypeItem,
  InfoTrendItem,
  GalleryMediaItem,
  CustomManualFeature,
  StoreSettings,
  CartItem,
} from './types';
import { storage } from './services/storageService';
import { Logo } from './components/Logo';
import { InteractiveCategorySlider } from './components/InteractiveCategorySlider';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartModal } from './components/CartModal';
import { WhatsAppConfirmModal } from './components/WhatsAppConfirmModal';
import { CategoryProductView } from './components/CategoryProductView';
import { BrandAndTypeView } from './components/BrandAndTypeView';
import { InfoTrendView } from './components/InfoTrendView';
import { InfoTrendDetailModal } from './components/InfoTrendDetailModal';
import { AboutContactView } from './components/AboutContactView';
import { AdminModal } from './components/admin/AdminModal';
import { AndroidPreviewModal } from './components/AndroidPreviewModal';
import { Footer } from './components/Footer';
import {
  generateWhatsAppOrderMessage,
  generateWhatsAppSingleProductMessage,
  cleanPhoneNumber,
} from './utils/formatters';

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'home' | 'categories' | 'brands' | 'infoTrend' | 'about'
  >('home');

  // Datasets from storage
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [productTypes, setProductTypes] = useState<ProductTypeItem[]>([]);
  const [infoTrends, setInfoTrends] = useState<InfoTrendItem[]>([]);
  const [galleryMedia, setGalleryMedia] = useState<GalleryMediaItem[]>([]);
  const [customFeatures, setCustomFeatures] = useState<CustomManualFeature[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(storage.getSettings());

  // Search state on header
  const [headerSearch, setHeaderSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Selected Category ID for category tab or home filter
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(storage.getCart());
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Selected Product for detail modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Selected Info & Trend article for detail modal
  const [selectedArticle, setSelectedArticle] = useState<InfoTrendItem | null>(null);

  // Modals state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAndroidPreviewOpen, setIsAndroidPreviewOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // WhatsApp confirmation dialog state
  const [whatsAppModalConfig, setWhatsAppModalConfig] = useState<{
    isOpen: boolean;
    targetUrl: string;
    productName?: string;
  }>({
    isOpen: false,
    targetUrl: '',
    productName: '',
  });

  // Load all initial & reactive data
  const refreshAppData = () => {
    setProducts(storage.getProducts());
    setCategories(storage.getCategories());
    setBrands(storage.getBrands());
    setProductTypes(storage.getProductTypes());
    setInfoTrends(storage.getInfoTrends());
    setGalleryMedia(storage.getGalleryMedia());
    setCustomFeatures(storage.getCustomFeatures());
    setSettings(storage.getSettings());
    setCart(storage.getCart());
  };

  useEffect(() => {
    refreshAppData();
  }, []);

  // Update cart in storage
  const handleUpdateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    storage.saveCart(newCart);
  };

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    let newCart: CartItem[];
    if (existingIndex > -1) {
      newCart = cart.map((item, index) =>
        index === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { product, quantity: 1 }];
    }
    handleUpdateCart(newCart);
    setIsCartOpen(true);
  };

  // Trigger WhatsApp redirection via mandatory disclaimer modal
  const openWhatsAppWithConfirmation = (url: string, productName?: string) => {
    setWhatsAppModalConfig({
      isOpen: true,
      targetUrl: url,
      productName: productName || 'Konsultasi Produk',
    });
  };

  // Direct chat hotline
  const handleGeneralWhatsAppChat = () => {
    const phone = cleanPhoneNumber(settings.phoneWhatsApp || '6281234567890');
    const msg = encodeURIComponent(
      `Halo CS ${settings.storeName}, saya ingin berkonsultasi mengenai produk listrik & teknik.`
    );
    const url = `https://wa.me/${phone}?text=${msg}`;
    openWhatsAppWithConfirmation(url, 'Konsultasi Toko');
  };

  // Direct order single product via WhatsApp
  const handleOrderSingleProductWA = (product: Product, quantity: number, notes?: string) => {
    const url = generateWhatsAppSingleProductMessage(
      settings.phoneWhatsApp,
      product,
      quantity,
      notes
    );
    openWhatsAppWithConfirmation(url, product.name);
  };

  // Direct checkout cart via WhatsApp
  const handleCheckoutCartWA = (
    cartItems: CartItem[],
    customerInfo: { name: string; phone: string; address: string; notes?: string }
  ) => {
    const url = generateWhatsAppOrderMessage(
      settings.phoneWhatsApp,
      cartItems,
      customerInfo
    );
    openWhatsAppWithConfirmation(url, `Pesanan Keranjang (${cartItems.length} barang)`);
  };

  // Total cart items count
  const cartTotalItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // Top 20 Favorite Products of the Month (sorted by isFavoriteMonthRank 1 to 20)
  const favoriteProducts = useMemo(() => {
    return products
      .filter((p) => typeof p.isFavoriteMonthRank === 'number' && p.isFavoriteMonthRank > 0)
      .sort((a, b) => (a.isFavoriteMonthRank || 99) - (b.isFavoriteMonthRank || 99))
      .slice(0, 20);
  }, [products]);

  // 3 Latest Products
  const latestProducts = useMemo(() => {
    return products
      .filter((p) => p.isLatest)
      .slice(0, 3);
  }, [products]);

  // Real-time Global Search results
  const searchResults = useMemo(() => {
    if (!headerSearch.trim()) return [];
    const query = headerSearch.toLowerCase().trim();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.type.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [products, headerSearch]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Top Announcement Bar */}
      <div className="bg-[#064e3b] text-white text-[11px] sm:text-xs py-2 px-4 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
              Resmi &amp; Terpercaya
            </span>
            <span className="truncate">
              {settings.storeName} • Pusat Peralatan Listrik, Kerja Teknik &amp; Rumah Tangga SNI
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={handleGeneralWhatsAppChat}
              className="flex items-center gap-1.5 text-emerald-200 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp: +{cleanPhoneNumber(settings.phoneWhatsApp)}</span>
            </button>
            <button
              onClick={() => setIsAndroidPreviewOpen(true)}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2.5 py-0.5 rounded-md font-semibold transition-colors"
              title="Buka tampilan simulasi Android App"
            >
              <Smartphone className="w-3 h-3 text-emerald-300" />
              <span className="hidden sm:inline">Android View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div
              onClick={() => {
                setActiveTab('home');
                setSelectedCategoryId(null);
              }}
              className="cursor-pointer shrink-0"
            >
              <Logo size="md" />
            </div>

            {/* Global Search Bar with Autocomplete Dropdown */}
            <div className="relative flex-1 max-w-xl hidden md:block">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-600 absolute left-3.5" />
                <input
                  type="text"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Cari alat listrik, kabel, lampu LED, bor, saklar..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-slate-100/80 text-xs sm:text-sm text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#065f46] focus:bg-white transition-all shadow-inner"
                  id="input-global-search-header"
                />
                {headerSearch && (
                  <button
                    onClick={() => setHeaderSearch('')}
                    className="absolute right-3 p-1 text-slate-600 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete Results Dropdown */}
              {isSearchOpen && headerSearch && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="p-3 border-b border-slate-100 flex items-center justify-between text-xs text-slate-700 font-semibold bg-slate-50">
                    <span>Hasil Pencarian ({searchResults.length})</span>
                    <button
                      onClick={() => {
                        setActiveTab('categories');
                        setIsSearchOpen(false);
                      }}
                      className="text-[#065f46] font-bold hover:underline"
                    >
                      Buka di Halaman Kategori &rarr;
                    </button>
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-700">
                      Tidak ditemukan produk dengan kata kunci &ldquo;{headerSearch}&rdquo;.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                      {searchResults.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => {
                            setSelectedProduct(prod);
                            setIsSearchOpen(false);
                            setHeaderSearch('');
                          }}
                          className="p-3 hover:bg-emerald-50/60 flex items-center gap-3 cursor-pointer transition-colors"
                        >
                          <img
                            src={prod.mainImage}
                            alt={prod.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {prod.name}
                            </h4>
                            <span className="text-[10px] text-emerald-700 font-semibold">
                              {prod.brand} • {prod.category}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-[#065f46]">
                            {prod.discountPrice
                              ? `Rp ${prod.discountPrice.toLocaleString('id-ID')}`
                              : `Rp ${prod.price.toLocaleString('id-ID')}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons (Cart, Admin, Mobile Toggle) */}
            <div className="flex items-center gap-2.5">
              {/* Shopping Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#065f46] border border-emerald-200 transition-all font-bold text-xs sm:text-sm active:scale-95"
                id="btn-open-cart-header"
                title="Keranjang Belanja"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Keranjang</span>
                {cartTotalItems > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#065f46] text-white text-[11px] font-black flex items-center justify-center -ml-0.5">
                    {cartTotalItems}
                  </span>
                )}
              </button>

              {/* Admin Access Button */}
              <button
                onClick={() => setIsAdminOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                id="btn-open-admin-header"
                title="Akses Admin Toko"
              >
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Admin</span>
              </button>

              {/* Mobile Hamburger Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 md:hidden"
                title="Menu Navigasi"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Bar Tabs */}
          <nav className="hidden md:flex items-center gap-1 mt-3 pt-2 border-t border-slate-100 text-xs font-bold">
            <button
              onClick={() => {
                setActiveTab('home');
                setSelectedCategoryId(null);
              }}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'home'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-slate-700 hover:text-[#065f46] hover:bg-slate-100'
              }`}
            >
              Halaman Utama
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'categories'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-slate-700 hover:text-[#065f46] hover:bg-slate-100'
              }`}
            >
              Daftar Kategori Produk
            </button>

            <button
              onClick={() => setActiveTab('brands')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'brands'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-slate-700 hover:text-[#065f46] hover:bg-slate-100'
              }`}
            >
              Pilihan Merk &amp; Tipe
            </button>

            <button
              onClick={() => setActiveTab('infoTrend')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'infoTrend'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-slate-700 hover:text-[#065f46] hover:bg-slate-100'
              }`}
            >
              Info &amp; Trend Edukasi
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'about'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-slate-700 hover:text-[#065f46] hover:bg-slate-100'
              }`}
            >
              Tentang Kami &amp; Hubungi
            </button>
          </nav>

          {/* Mobile Collapsible Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden pt-3 pb-2 space-y-1.5 border-t border-slate-100 animate-fade-in text-xs font-bold">
              {/* Mobile Search input */}
              <div className="relative mb-2">
                <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  placeholder="Cari produk listrik & teknik..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                />
              </div>

              <button
                onClick={() => {
                  setActiveTab('home');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 rounded-xl ${
                  activeTab === 'home' ? 'bg-[#064e3b] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Halaman Utama
              </button>

              <button
                onClick={() => {
                  setActiveTab('categories');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 rounded-xl ${
                  activeTab === 'categories' ? 'bg-[#064e3b] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Daftar Kategori Produk
              </button>

              <button
                onClick={() => {
                  setActiveTab('brands');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 rounded-xl ${
                  activeTab === 'brands' ? 'bg-[#064e3b] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Pilihan Merk &amp; Tipe
              </button>

              <button
                onClick={() => {
                  setActiveTab('infoTrend');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 rounded-xl ${
                  activeTab === 'infoTrend' ? 'bg-[#064e3b] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Info &amp; Trend Edukasi
              </button>

              <button
                onClick={() => {
                  setActiveTab('about');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 rounded-xl ${
                  activeTab === 'about' ? 'bg-[#064e3b] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Tentang Kami &amp; Hubungi
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Dynamic Router */}
      <main className="flex-1">
        {/* ================= 1. TAB: HALAMAN UTAMA (HOME) ================= */}
        {activeTab === 'home' && (
          <div>
            {/* Hero Banner with Highlights */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
              <div className="rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#065f46] text-white p-6 sm:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-xl z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-bold uppercase tracking-wider backdrop-blur-xs mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    Distributor Resmi &amp; Garansi SNI
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
                    Solusi Terlengkap Alat Listrik, Perkakas Teknik &amp; Rumah Tangga
                  </h1>

                  <p className="text-xs sm:text-base text-emerald-100/90 leading-relaxed mb-6">
                    Pilihan terbaik lampu LED hemat energi, saklar, fitting, mesin bor, kabel berkualitas, hingga perlengkapan dapur &amp; kamar mandi siap kirim ke seluruh Indonesia.
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setActiveTab('categories')}
                      className="px-5 py-3 rounded-2xl bg-white text-[#064e3b] hover:bg-emerald-50 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-98 flex items-center gap-2"
                    >
                      <span>Lihat Semua Kategori</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleGeneralWhatsAppChat}
                      className="px-5 py-3 rounded-2xl bg-[#15803d] hover:bg-[#166534] text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-98 flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4 fill-white text-[#15803d]" />
                      <span>Chat WhatsApp CS</span>
                    </button>
                  </div>
                </div>

                {/* Hero Feature Badges */}
                <div className="grid grid-cols-2 gap-3 z-10 shrink-0 w-full md:w-auto">
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-300 mb-1" />
                    <strong className="text-xs text-white block">100% Original</strong>
                    <span className="text-[10px] text-emerald-100">Philips, Bosch, dsb</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-300 mb-1" />
                    <strong className="text-xs text-white block">Standar SNI</strong>
                    <span className="text-[10px] text-emerald-100">Instalasi Aman</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
                    <Clock className="w-5 h-5 text-emerald-300 mb-1" />
                    <strong className="text-xs text-white block">Proses Cepat</strong>
                    <span className="text-[10px] text-emerald-100">Langsung Kirim</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
                    <Sparkles className="w-5 h-5 text-emerald-300 mb-1" />
                    <strong className="text-xs text-white block">Harga Terbaik</strong>
                    <span className="text-[10px] text-emerald-100">Grosir &amp; Retail</span>
                  </div>
                </div>

                {/* Ambient glow */}
                <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-80 h-80 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
              </div>
            </div>

            {/* 12 Interactive Category Slider */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
              <InteractiveCategorySlider
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={(catId) => {
                  setSelectedCategoryId(catId);
                  setActiveTab('categories');
                }}
              />
            </div>

            {/* SECTION 1: 3 PRODUK TERBARU (HIGHLIGHTS) */}
            {latestProducts.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8" id="section-latest-products">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#065f46] uppercase tracking-wider bg-[#ecfdf5] px-2.5 py-1 rounded-md mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      Koleksi Baru
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      3 Produk Terbaru
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('categories')}
                    className="text-xs font-bold text-[#065f46] hover:text-[#047857] flex items-center gap-1"
                  >
                    <span>Lihat Semua Produk</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {latestProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onSelectProduct={(p) => setSelectedProduct(p)}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 2: 20 PRODUK TERFAVORIT BULAN INI (RANKED 1 - 20) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8" id="section-favorite-products">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-md mb-1 border border-amber-200">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    Paling Banyak Dicari &amp; Terlaris
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    20 Produk Favorit Bulan Ini
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
                  {favoriteProducts.length} Produk Favorit Terdaftar
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {favoriteProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </section>

            {/* SECTION 3: CUSTOM FEATURES / LAYANAN UNGGULAN TOKO */}
            {customFeatures.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6" id="section-custom-features">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {customFeatures.map((feat) => (
                    <div
                      key={feat.id}
                      className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between gap-3"
                    >
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#065f46] bg-[#ecfdf5] px-2 py-0.5 rounded-md inline-block mb-2">
                          {feat.badgeText}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 mb-1">{feat.title}</h3>
                        <p className="text-xs text-slate-700 leading-relaxed">{feat.description}</p>
                      </div>
                      <button
                        onClick={handleGeneralWhatsAppChat}
                        className="text-xs font-bold text-[#065f46] hover:text-[#047857] flex items-center gap-1 pt-2 border-t border-slate-100"
                      >
                        <span>Konsultasikan via WhatsApp</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 4: HIGHLIGHT INFO & TREND EDUKASI */}
            {infoTrends.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8" id="section-info-trend-preview">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#065f46] uppercase tracking-wider bg-[#ecfdf5] px-2.5 py-1 rounded-md mb-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Edukasi &amp; Panduan Teknik
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Info &amp; Trend Terkini
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('infoTrend')}
                    className="text-xs font-bold text-[#065f46] hover:text-[#047857] flex items-center gap-1"
                  >
                    <span>Semua Artikel</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {infoTrends.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedArticle(item)}
                      className="group bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-[#065f46]/40 transition-all cursor-pointer flex flex-col sm:flex-row gap-4"
                    >
                      <div className="w-full sm:w-44 aspect-video sm:aspect-square rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={item.imageUrl || 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500'}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-[#065f46] uppercase tracking-wider">
                            {item.category}
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#065f46] transition-colors leading-snug line-clamp-2 mt-0.5">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-700 line-clamp-2 mt-1">
                            {item.summary}
                          </p>
                        </div>
                        <div className="text-xs font-bold text-[#065f46] flex items-center gap-1 pt-2">
                          <span>Baca Panduan</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ================= 2. TAB: DAFTAR KATEGORI & PRODUK ================= */}
        {activeTab === 'categories' && (
          <CategoryProductView
            products={products}
            categories={categories}
            brands={brands}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) => setSelectedCategoryId(id)}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onAddToCart={handleAddToCart}
            initialSearchQuery={headerSearch}
          />
        )}

        {/* ================= 3. TAB: PILIHAN MERK & TIPE PRODUK ================= */}
        {activeTab === 'brands' && (
          <BrandAndTypeView
            brands={brands}
            productTypes={productTypes}
            products={products}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* ================= 4. TAB: INFO & TREND ================= */}
        {activeTab === 'infoTrend' && (
          <InfoTrendView
            articles={infoTrends}
            onSelectArticle={(art) => setSelectedArticle(art)}
          />
        )}

        {/* ================= 5. TAB: TENTANG KAMI & KONTAK ================= */}
        {activeTab === 'about' && (
          <AboutContactView
            settings={settings}
            galleryMedia={galleryMedia}
            onOpenWhatsApp={handleGeneralWhatsAppChat}
          />
        )}
      </main>

      {/* Product Detail Modal (Up to 5 images, specs, order button) */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onOrderNow={(prod, qty, notes) => {
          setSelectedProduct(null);
          handleOrderSingleProductWA(prod, qty, notes);
        }}
      />

      {/* Info & Trend Article Detail Modal */}
      <InfoTrendDetailModal
        item={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      {/* Cart Drawer / Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateCart={handleUpdateCart}
        onCheckout={(items, info) => {
          setIsCartOpen(false);
          handleCheckoutCartWA(items, info);
        }}
      />

      {/* MANDATORY WhatsApp Confirmation Modal with Statutory Stock & Discount Disclaimer */}
      <WhatsAppConfirmModal
        isOpen={whatsAppModalConfig.isOpen}
        onClose={() =>
          setWhatsAppModalConfig({ isOpen: false, targetUrl: '', productName: '' })
        }
        targetUrl={whatsAppModalConfig.targetUrl}
        productName={whatsAppModalConfig.productName}
      />

      {/* Full Admin Management Panel Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onDataUpdated={refreshAppData}
      />

      {/* Android Mobile App Simulation View Modal */}
      <AndroidPreviewModal
        isOpen={isAndroidPreviewOpen}
        onClose={() => setIsAndroidPreviewOpen(false)}
      />

      {/* Footer */}
      <Footer
        settings={settings}
        categories={categories}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectCategory={(id) => {
          setSelectedCategoryId(id);
          setActiveTab('categories');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenWhatsApp={handleGeneralWhatsAppChat}
      />
    </div>
  );
}
