import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Lock,
  UserCheck,
  LayoutDashboard,
  Package,
  Layers,
  Tag,
  FileText,
  Palette,
  KeyRound,
  PlusCircle,
  AlertTriangle,
  Database,
  Trash2,
  Edit,
  Save,
  Plus,
  Image as ImageIcon,
  Video,
  Eye,
  CheckCircle,
  Flame,
  ArrowRight,
  LogOut,
  Sliders,
  Sparkles,
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
  AdminUser,
} from '../../types';
import {
  storage,
  MANAGER_ACCESS_CODE,
  validateAdminPassword,
} from '../../services/storageService';
import { appwriteService } from '../../services/appwriteService';
import { formatRupiah, getStockStatus } from '../../utils/formatters';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataUpdated: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  onDataUpdated,
}) => {
  // Auth state
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(storage.getCurrentAdmin());
  const [authMode, setAuthMode] = useState<'choose' | 'login' | 'register'>('choose');

  // Login form
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('Admin2026');
  const [loginError, setLoginError] = useState('');

  // Register form
  const [regAccessCode, setRegAccessCode] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [isAccessCodeVerified, setIsAccessCodeVerified] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'products'
    | 'categories'
    | 'brands'
    | 'types'
    | 'infoTrend'
    | 'appearance'
    | 'customFeatures'
    | 'changePassword'
    | 'appwrite'
  >('dashboard');

  // Loaded Datasets
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [productTypes, setProductTypes] = useState<ProductTypeItem[]>([]);
  const [infoTrends, setInfoTrends] = useState<InfoTrendItem[]>([]);
  const [galleryMedia, setGalleryMedia] = useState<GalleryMediaItem[]>([]);
  const [customFeatures, setCustomFeatures] = useState<CustomManualFeature[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(storage.getSettings());

  // Editing state for products
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // Editing state for category
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Editing state for Info & Trend
  const [editingInfo, setEditingInfo] = useState<InfoTrendItem | null>(null);
  const [isCreatingInfo, setIsCreatingInfo] = useState(false);

  // Editing state for Gallery Media
  const [editingGallery, setEditingGallery] = useState<GalleryMediaItem | null>(null);
  const [isCreatingGallery, setIsCreatingGallery] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');

  // Appwrite test state
  const [appwriteTestResult, setAppwriteTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [appwriteTesting, setAppwriteTesting] = useState(false);

  // Feedback banner
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  const loadAllData = () => {
    setProducts(storage.getProducts());
    setCategories(storage.getCategories());
    setBrands(storage.getBrands());
    setProductTypes(storage.getProductTypes());
    setInfoTrends(storage.getInfoTrends());
    setGalleryMedia(storage.getGalleryMedia());
    setCustomFeatures(storage.getCustomFeatures());
    setSettings(storage.getSettings());
    setCurrentAdmin(storage.getCurrentAdmin());
  };

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen]);

  const showSuccessFeedback = (msg: string) => {
    setActionSuccessMessage(msg);
    onDataUpdated();
    setTimeout(() => setActionSuccessMessage(''), 3500);
  };

  // --- Auth Handlers ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = storage.loginAdmin(loginUsername, loginPassword);
    if (res.success && res.admin) {
      setCurrentAdmin(res.admin);
      loadAllData();
      showSuccessFeedback(`Selamat datang, ${res.admin.fullName}!`);
    } else {
      setLoginError(res.error || 'Gagal login.');
    }
  };

  const handleVerifyAccessCode = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (regAccessCode.trim() !== MANAGER_ACCESS_CODE) {
      setRegError(`Kode akses salah! Masukkan kode akses manajer ("${MANAGER_ACCESS_CODE}").`);
      return;
    }
    setIsAccessCodeVerified(true);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    const res = storage.registerManagerAdmin(
      regAccessCode,
      regUsername,
      regFullName,
      regPassword
    );
    if (res.success && res.admin) {
      setCurrentAdmin(res.admin);
      loadAllData();
      showSuccessFeedback(`Registrasi manajer berhasil! Selamat datang, ${res.admin.fullName}.`);
    } else {
      setRegError(res.error || 'Gagal registrasi.');
    }
  };

  const handleLogout = () => {
    storage.logoutAdmin();
    setCurrentAdmin(null);
    setAuthMode('choose');
  };

  // --- Stock Alert Stats ---
  const stockNotifications = useMemo(() => {
    return storage.getStockNotifications();
  }, [products, settings.lowStockThreshold]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={onClose}
      id="admin-modal-container"
    >
      <div
        className="relative w-full max-w-6xl bg-slate-900 text-slate-100 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col border border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/80 text-white flex items-center justify-center shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                  Akses Admin • Solusi Rumahku
                </h2>
                {currentAdmin && (
                  <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    {currentAdmin.role === 'manager' ? 'Akses Manager' : 'Admin'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {currentAdmin
                  ? `Login sebagai: ${currentAdmin.fullName} (@${currentAdmin.username})`
                  : 'Otorisasi & Manajemen Toko Khusus Website'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentAdmin && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 text-xs font-semibold border border-slate-700 transition-colors"
                title="Keluar Akun Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Tutup Panel Admin"
              id="btn-close-admin-panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Action Success Banner */}
        {actionSuccessMessage && (
          <div className="bg-emerald-600/90 text-white px-6 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {actionSuccessMessage}
          </div>
        )}

        {/* Main Content Area */}
        {!currentAdmin ? (
          /* ================= AUTH GATE (MASUK / DAFTAR AKSES MANAGER) ================= */
          <div className="p-6 sm:p-12 overflow-y-auto max-w-lg mx-auto w-full flex-1 flex flex-col justify-center">
            {authMode === 'choose' && (
              <div className="bg-slate-800/80 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-xl text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#065f46] text-white flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Portal Akses Pengelola Toko</h3>
                <p className="text-xs sm:text-sm text-slate-300 mb-8 leading-relaxed">
                  Silakan pilih Masuk dengan akun terdaftar atau Daftarkan akun baru khusus manajer dengan kode otorisasi.
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setLoginError('');
                    }}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#065f46] hover:bg-[#047857] text-white text-sm font-bold shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                    id="btn-admin-choose-login"
                  >
                    <KeyRound className="w-4 h-4" />
                    Masuk (Login Admin)
                  </button>

                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setRegError('');
                      setIsAccessCodeVerified(false);
                    }}
                    className="w-full py-3.5 px-6 rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-100 text-sm font-bold border border-slate-600 transition-all active:scale-98 flex flex-col items-center justify-center py-3"
                    id="btn-admin-choose-register"
                  >
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      Daftar Akun Baru
                    </span>
                    <span className="text-[10px] text-amber-300 font-semibold mt-0.5">
                      (Akses Manager Only - Wajib Kode Akses)
                    </span>
                  </button>
                </div>
              </div>
            )}

            {authMode === 'login' && (
              <form
                onSubmit={handleLogin}
                className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-emerald-400" />
                    Masuk Akun Admin
                  </h3>
                  <button
                    type="button"
                    onClick={() => setAuthMode('choose')}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    Kembali
                  </button>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs mb-4">
                    {loginError}
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Username admin"
                      className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Password kombinasi huruf & angka"
                      className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-2xl bg-[#065f46] hover:bg-[#047857] text-white text-sm font-bold shadow-md transition-all active:scale-98"
                >
                  Masuk ke Dashboard Admin
                </button>
              </form>
            )}

            {authMode === 'register' && !isAccessCodeVerified && (
              /* Step 1 Register: Validate Manager Code "dear2226" */
              <form
                onSubmit={handleVerifyAccessCode}
                className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-amber-400" />
                    Verifikasi Kode Akses Manager
                  </h3>
                  <button
                    type="button"
                    onClick={() => setAuthMode('choose')}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    Kembali
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs mb-5 leading-relaxed">
                  Pendaftaran akun admin dibatasi khusus untuk Manager Store. Silakan masukkan kode otorisasi resmi:
                  <strong className="block text-white font-mono mt-1">&ldquo;{MANAGER_ACCESS_CODE}&rdquo;</strong>
                </div>

                {regError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs mb-4">
                    {regError}
                  </div>
                )}

                <div className="mb-6">
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Kode Akses Khusus Manager
                  </label>
                  <input
                    type="text"
                    required
                    value={regAccessCode}
                    onChange={(e) => setRegAccessCode(e.target.value)}
                    placeholder="Masukkan kode akses (cth: dear2226)"
                    className="w-full text-sm font-mono tracking-wider px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center uppercase"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold shadow-md transition-all active:scale-98"
                >
                  Verifikasi Kode Akses
                </button>
              </form>
            )}

            {authMode === 'register' && isAccessCodeVerified && (
              /* Step 2 Register: Full form with Password Rules */
              <form
                onSubmit={handleRegister}
                className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                    Pendaftaran Akun Manager
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAccessCodeVerified(false)}
                    className="text-xs text-slate-400 hover:underline"
                  >
                    Kembali
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] mb-4">
                  Kode akses terverifikasi. Password wajib kombinasi huruf dan angka minimal 8 digit dan wajib minimal satu huruf kapital.
                </div>

                {regError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs mb-4">
                    {regError}
                  </div>
                )}

                <div className="space-y-3.5 mb-6">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Nama Lengkap Manajer
                    </label>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Username Baru
                    </label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="Contoh: manager22"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Password (Min. 8 karakter, Kombinasi Huruf & Angka, 1 Huruf Kapital)
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Contoh: Manager2026"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-md transition-all active:scale-98"
                >
                  Selesaikan Pendaftaran & Masuk
                </button>
              </form>
            )}
          </div>
        ) : (
          /* ================= AUTHENTICATED ADMIN DASHBOARD ================= */
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-3 sm:p-4 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto shrink-0 scrollbar-none">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'bg-[#065f46] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard & Stok</span>
                {stockNotifications.totalAlerts > 0 && (
                  <span className="ml-auto text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                    {stockNotifications.totalAlerts}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'bg-[#065f46] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Produk Detail ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'categories'
                    ? 'bg-[#065f46] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Kategori ({categories.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('brands')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'brands'
                    ? 'bg-[#065f46] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Merk ({brands.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('types')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'types'
                    ? 'bg-[#065f46] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Type Produk ({productTypes.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('infoTrend')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'infoTrend'
                    ? 'bg-[#065f46] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Info & Trend ({infoTrends.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('appearance')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'appearance'
                    ? 'bg-[#065f46] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>Tampilan & Galeri</span>
              </button>

              <button
                onClick={() => setActiveTab('customFeatures')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'customFeatures'
                    ? 'bg-[#065f46] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Fitur Baru Manual</span>
              </button>

              <button
                onClick={() => setActiveTab('changePassword')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'changePassword'
                    ? 'bg-[#065f46] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Ubah Password</span>
              </button>

              <button
                onClick={() => setActiveTab('appwrite')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'appwrite'
                    ? 'bg-[#065f46] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Backend Appwrite</span>
              </button>
            </div>

            {/* Tab Workspace View */}
            <div className="flex-1 p-4 sm:p-8 overflow-y-auto bg-slate-900">
              {/* 1. DASHBOARD & AUTOMATIC STOCK NOTIFICATIONS */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        Dashboard & Notifikasi Stok Otomatis
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Ringkasan operasional toko, status ketersediaan barang, dan peringatan restock barang otomatis.
                      </p>
                    </div>
                  </div>

                  {/* Quick Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700">
                      <span className="text-xs text-slate-400">Total Katalog Produk</span>
                      <p className="text-2xl font-black text-white mt-1">{products.length}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700">
                      <span className="text-xs text-slate-400">Produk Favorit Terdaftar</span>
                      <p className="text-2xl font-black text-amber-400 mt-1">
                        {products.filter((p) => p.isFavoriteMonthRank).length} / 20
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700">
                      <span className="text-xs text-slate-400">Stok Menipis (&le; {settings.lowStockThreshold || 5})</span>
                      <p className="text-2xl font-black text-amber-500 mt-1">
                        {stockNotifications.lowStockProducts.length}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700">
                      <span className="text-xs text-slate-400">Status &ldquo;Tanya Admin&rdquo;</span>
                      <p className="text-2xl font-black text-sky-400 mt-1">
                        {stockNotifications.unspecifiedStockProducts.length}
                      </p>
                    </div>
                  </div>

                  {/* Automatic Stock Alerts Section */}
                  <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700">
                    <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      Peringatan Stok Otomatis Toko
                    </h3>

                    {stockNotifications.totalAlerts === 0 ? (
                      <p className="text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                        Seluruh stok barang dalam kondisi aman dan terisi.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {stockNotifications.lowStockProducts.map((p) => (
                          <div
                            key={p.id}
                            className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <strong className="text-white block">{p.name}</strong>
                              <span className="text-amber-300">
                                Sisa Stok: <strong>{p.stockCount} unit</strong> (Batas Minimum: {settings.lowStockThreshold})
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setActiveTab('products');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold shrink-0"
                            >
                              Update Stok
                            </button>
                          </div>
                        ))}

                        {stockNotifications.unspecifiedStockProducts.map((p) => (
                          <div
                            key={p.id}
                            className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <strong className="text-white block">{p.name}</strong>
                              <span className="text-sky-300">
                                Stok Kosong / Belum Diisi &bull; Terlihat user sebagai: <strong>&ldquo;Tanya Admin&rdquo;</strong>
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setActiveTab('products');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-600 text-white font-bold shrink-0"
                            >
                              Isi Jumlah Stok
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. KELOLA PRODUK DETAIL */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">Kelola Produk Detail</h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Tambah, edit, upload hingga 5 gambar, atur 1 gambar utama, set favorit 1-20, dan isi jumlah stok.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingProduct({
                          id: `prod-${Date.now()}`,
                          name: '',
                          brand: brands[0]?.name || 'Philips',
                          category: categories[0]?.name || 'PHILIPS LED',
                          type: productTypes[0]?.name || 'Bohlam LED',
                          price: 50000,
                          discountPrice: undefined,
                          stockCount: 10,
                          mainImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600',
                          images: ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600'],
                          description: '',
                          specifications: { 'Garansi': 'Resmi Toko', 'Standar': 'SNI' },
                          isFavoriteMonthRank: null,
                          isLatest: false,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        });
                        setIsCreatingProduct(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Produk Baru
                    </button>
                  </div>

                  {/* Product Form Modal / Editor */}
                  {editingProduct && (
                    <div className="p-6 rounded-3xl bg-slate-800 border-2 border-emerald-500/50 shadow-xl">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Package className="w-5 h-5 text-emerald-400" />
                          {isCreatingProduct ? 'Tambah Produk Baru' : `Edit Produk: ${editingProduct.name}`}
                        </h3>
                        <button
                          onClick={() => {
                            setEditingProduct(null);
                            setIsCreatingProduct(false);
                          }}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          Batal
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="md:col-span-2">
                          <label className="font-semibold text-slate-300 block mb-1">Nama Produk</label>
                          <input
                            type="text"
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500"
                            placeholder="Nama produk lengkap..."
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">Merk (Brand)</label>
                          <select
                            value={editingProduct.brand}
                            onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                          >
                            {brands.map((b) => (
                              <option key={b.id} value={b.name}>{b.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">Kategori</label>
                          <select
                            value={editingProduct.category}
                            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">Harga Normal (Rp)</label>
                          <input
                            type="number"
                            value={editingProduct.price}
                            onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">Harga Diskon (Opsional Rp)</label>
                          <input
                            type="number"
                            value={editingProduct.discountPrice || ''}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                discountPrice: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                            placeholder="Biarkan kosong jika tidak ada diskon"
                          />
                        </div>

                        {/* Stok Konfigurasi (Tersedia vs Tanya Admin) */}
                        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 md:col-span-2">
                          <label className="font-bold text-amber-300 block mb-1">
                            Jumlah Stok Barang (Ketentuan User: Angka = &ldquo;Tersedia&rdquo; | Kosong = &ldquo;Tanya Admin&rdquo;)
                          </label>
                          <input
                            type="number"
                            value={typeof editingProduct.stockCount === 'number' ? editingProduct.stockCount : ''}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                stockCount: e.target.value === '' ? null : Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-600 text-white font-mono"
                            placeholder="Kosongkan jika ingin terlihat sebagai 'Tanya Admin'"
                          />
                          <span className="text-[11px] text-slate-400 mt-1 block">
                            Status saat ini untuk user:{' '}
                            <strong className="text-white">
                              {getStockStatus(editingProduct.stockCount).label}
                            </strong>
                          </span>
                        </div>

                        {/* Favorit Bulan ini (1-20) */}
                        <div>
                          <label className="font-semibold text-amber-300 block mb-1">
                            Rank &ldquo;Produk Favorit Bulan Ini&rdquo; (Pilihan 1 s/d 20)
                          </label>
                          <select
                            value={editingProduct.isFavoriteMonthRank || ''}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                isFavoriteMonthRank: e.target.value ? Number(e.target.value) : null,
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-bold"
                          >
                            <option value="">Bukan Favorit Bulan Ini</option>
                            {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                              <option key={num} value={num}>Favorit #{num}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">Tipe Produk</label>
                          <input
                            type="text"
                            value={editingProduct.type}
                            onChange={(e) => setEditingProduct({ ...editingProduct, type: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                          />
                        </div>

                        {/* Up to 5 Images (File upload + URLs) */}
                        <div className="md:col-span-2 p-4 rounded-2xl bg-slate-900 border border-slate-700">
                          <label className="font-bold text-white block mb-2">
                            Galeri Foto Produk (Hingga 5 Gambar - File Upload & URL)
                          </label>

                          <div className="space-y-3 mb-4">
                            {(editingProduct.images || []).map((img, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 w-16">Foto #{idx + 1}</span>
                                <input
                                  type="text"
                                  value={img}
                                  onChange={(e) => {
                                    const nextImages = [...(editingProduct.images || [])];
                                    nextImages[idx] = e.target.value;
                                    setEditingProduct({
                                      ...editingProduct,
                                      images: nextImages,
                                      mainImage: idx === 0 ? e.target.value : editingProduct.mainImage,
                                    });
                                  }}
                                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                                  placeholder="URL gambar..."
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingProduct({
                                      ...editingProduct,
                                      mainImage: img,
                                    });
                                  }}
                                  className={`px-2 py-1 rounded text-[10px] font-bold ${
                                    editingProduct.mainImage === img
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {editingProduct.mainImage === img ? 'Gambar Utama' : 'Jadikan Utama'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextImages = editingProduct.images.filter((_, i) => i !== idx);
                                    setEditingProduct({
                                      ...editingProduct,
                                      images: nextImages,
                                      mainImage: nextImages[0] || '',
                                    });
                                  }}
                                  className="p-1 text-rose-400 hover:text-rose-300"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Add Image URL / File input */}
                          {(editingProduct.images?.length || 0) < 5 && (
                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      const base64 = reader.result as string;
                                      const next = [...(editingProduct.images || []), base64];
                                      setEditingProduct({
                                        ...editingProduct,
                                        images: next,
                                        mainImage: editingProduct.mainImage || base64,
                                      });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="text-[11px] text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white hover:file:bg-emerald-600 cursor-pointer"
                              />
                            </div>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="font-semibold text-slate-300 block mb-1">Deskripsi Produk</label>
                          <textarea
                            rows={3}
                            value={editingProduct.description}
                            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-700">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 text-xs font-semibold"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!editingProduct.name) return;
                            const updated = storage.saveProduct(editingProduct);
                            setProducts(updated);
                            setEditingProduct(null);
                            setIsCreatingProduct(false);
                            showSuccessFeedback('Produk berhasil disimpan!');
                          }}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                        >
                          <Save className="w-4 h-4" />
                          Simpan Produk
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List of Products Table */}
                  <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/70">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-800/80 text-slate-200 uppercase text-[10px] font-bold">
                          <tr>
                            <th className="p-3">Foto</th>
                            <th className="p-3">Nama & Merk</th>
                            <th className="p-3">Kategori</th>
                            <th className="p-3">Harga</th>
                            <th className="p-3">Status Stok</th>
                            <th className="p-3">Favorit #</th>
                            <th className="p-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {products.map((p) => {
                            const status = getStockStatus(p.stockCount);
                            return (
                              <tr key={p.id} className="hover:bg-slate-800/40">
                                <td className="p-3">
                                  <img
                                    src={p.mainImage}
                                    alt={p.name}
                                    className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-700"
                                  />
                                </td>
                                <td className="p-3 font-semibold text-white max-w-xs truncate" title={p.name}>
                                  <div>{p.name}</div>
                                  <span className="text-[10px] text-emerald-400 font-normal">{p.brand} &bull; {p.type}</span>
                                </td>
                                <td className="p-3">{p.category}</td>
                                <td className="p-3 font-bold text-white">{formatRupiah(p.discountPrice || p.price)}</td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      status.isAvailable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                                    }`}
                                  >
                                    {status.label} {typeof p.stockCount === 'number' && `(${p.stockCount})`}
                                  </span>
                                </td>
                                <td className="p-3">
                                  {p.isFavoriteMonthRank ? (
                                    <span className="text-amber-400 font-bold">#{p.isFavoriteMonthRank}</span>
                                  ) : (
                                    '-'
                                  )}
                                </td>
                                <td className="p-3 text-right">
                                  <div className="inline-flex items-center gap-1.5">
                                    <button
                                      onClick={() => {
                                        setEditingProduct(p);
                                        setIsCreatingProduct(false);
                                      }}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                                      title="Edit"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm(`Hapus produk "${p.name}"?`)) {
                                          const updated = storage.deleteProduct(p.id);
                                          setProducts(updated);
                                          showSuccessFeedback('Produk dihapus.');
                                        }
                                      }}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-rose-400"
                                      title="Hapus"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. KELOLA KATEGORI */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">Kelola Kategori Produk</h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Kelola 12 kategori utama, ubah logo gambar URL/file dan deskripsi kategori.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingCategory({
                          id: `cat-${Date.now()}`,
                          name: '',
                          slug: '',
                          iconName: 'Package',
                          logoUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200',
                          description: '',
                          displayOrder: categories.length + 1,
                        });
                        setIsCreatingCategory(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Kategori
                    </button>
                  </div>

                  {editingCategory && (
                    <div className="p-6 rounded-3xl bg-slate-800 border-2 border-emerald-500/50 shadow-xl space-y-4 text-xs">
                      <h3 className="text-sm font-bold text-white">Edit / Tambah Kategori</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">Nama Kategori</label>
                          <input
                            type="text"
                            value={editingCategory.name}
                            onChange={(e) =>
                              setEditingCategory({
                                ...editingCategory,
                                name: e.target.value,
                                slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">Logo / Gambar Kategori (URL)</label>
                          <input
                            type="text"
                            value={editingCategory.logoUrl || ''}
                            onChange={(e) => setEditingCategory({ ...editingCategory, logoUrl: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="font-semibold text-slate-300 block mb-1">Deskripsi Singkat</label>
                          <input
                            type="text"
                            value={editingCategory.description || ''}
                            onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingCategory(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!editingCategory.name) return;
                            const updated = storage.saveCategory(editingCategory);
                            setCategories(updated);
                            setEditingCategory(null);
                            showSuccessFeedback('Kategori berhasil disimpan!');
                          }}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categories.map((c) => (
                      <div
                        key={c.id}
                        className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={c.logoUrl || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200'}
                            alt={c.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-600"
                          />
                          <div>
                            <strong className="text-white text-xs block">{c.name}</strong>
                            <span className="text-[10px] text-slate-400 line-clamp-1">{c.description}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setEditingCategory(c)}
                          className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. KELOLA MERK & TYPE PRODUK */}
              {activeTab === 'brands' && (
                <div className="space-y-6">
                  <h2 className="text-xl sm:text-2xl font-black text-white">Kelola Merk Dagang</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {brands.map((b) => (
                      <div key={b.id} className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                        <div>
                          <strong className="text-white text-sm block">{b.name}</strong>
                          <span className="text-xs text-slate-400">{b.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'types' && (
                <div className="space-y-6">
                  <h2 className="text-xl sm:text-2xl font-black text-white">Kelola Type Produk</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {productTypes.map((t) => (
                      <div key={t.id} className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                        <strong className="text-white text-xs block">{t.name}</strong>
                        <span className="text-[10px] text-emerald-400">{t.categoryName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. KELOLA INFO & TREND */}
              {activeTab === 'infoTrend' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">Kelola Info & Trend</h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Tambah / edit artikel edukasi dan tren terbaru dengan gambar & video URL/file.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingInfo({
                          id: `info-${Date.now()}`,
                          title: '',
                          slug: '',
                          category: 'Tips Kelistrikan',
                          summary: '',
                          content: '',
                          imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800',
                          videoUrl: '',
                          author: currentAdmin.fullName,
                          date: new Date().toISOString().split('T')[0],
                          tags: ['Listrik', 'Tips Rumah'],
                          views: 10,
                        });
                        setIsCreatingInfo(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Artikel Info & Trend
                    </button>
                  </div>

                  {editingInfo && (
                    <div className="p-6 rounded-3xl bg-slate-800 border-2 border-emerald-500/50 shadow-xl space-y-4 text-xs">
                      <h3 className="text-sm font-bold text-white">Edit / Tambah Artikel</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">Judul Artikel</label>
                          <input
                            type="text"
                            value={editingInfo.title}
                            onChange={(e) => setEditingInfo({ ...editingInfo, title: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-semibold text-slate-300 block mb-1">Gambar Cover (URL / File)</label>
                            <input
                              type="text"
                              value={editingInfo.imageUrl || ''}
                              onChange={(e) => setEditingInfo({ ...editingInfo, imageUrl: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                              placeholder="URL Gambar..."
                            />
                          </div>
                          <div>
                            <label className="font-semibold text-slate-300 block mb-1">Video (URL YouTube / MP4)</label>
                            <input
                              type="text"
                              value={editingInfo.videoUrl || ''}
                              onChange={(e) => setEditingInfo({ ...editingInfo, videoUrl: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                              placeholder="https://www.youtube.com/embed/..."
                            />
                          </div>
                        </div>
                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">Ringkasan (Summary)</label>
                          <textarea
                            rows={2}
                            value={editingInfo.summary}
                            onChange={(e) => setEditingInfo({ ...editingInfo, summary: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">Isi Artikel Lengkap</label>
                          <textarea
                            rows={5}
                            value={editingInfo.content}
                            onChange={(e) => setEditingInfo({ ...editingInfo, content: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingInfo(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!editingInfo.title) return;
                            const updated = storage.saveInfoTrend(editingInfo);
                            setInfoTrends(updated);
                            setEditingInfo(null);
                            showSuccessFeedback('Artikel Info & Trend berhasil disimpan!');
                          }}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold"
                        >
                          Simpan Artikel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {infoTrends.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                            <span className="text-emerald-400 font-bold">{item.category}</span>
                            <span>{item.date}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white line-clamp-2">{item.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1">{item.summary}</p>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700/60">
                          <button
                            onClick={() => setEditingInfo(item)}
                            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Hapus artikel ini?')) {
                                const updated = storage.deleteInfoTrend(item.id);
                                setInfoTrends(updated);
                                showSuccessFeedback('Artikel dihapus.');
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-700 hover:bg-rose-900/50 text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. KELOLA TAMPILAN, PROFIL & GALERI (HINGGA 10 MEDIA) */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">Kelola Tampilan, Profil & Galeri</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Atur penjelasan konteks (&ldquo;Untuk siapa dan apa tujuannya&rdquo;), kontak toko, dan 10 media galeri.
                    </p>
                  </div>

                  {/* Context & Purpose Editor */}
                  <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 space-y-4 text-xs">
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Konteks: Jelaskan Untuk Siapa Aplikasi Ini & Apa Tujuannya
                    </h3>
                    <textarea
                      rows={3}
                      value={settings.contextAbout}
                      onChange={(e) => setSettings({ ...settings, contextAbout: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                      placeholder="Jelaskan sasaran pengguna (pemilik rumah, teknisi, kontraktor) dan tujuan toko..."
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">Nomor WhatsApp Toko</label>
                        <input
                          type="text"
                          value={settings.phoneWhatsApp}
                          onChange={(e) => setSettings({ ...settings, phoneWhatsApp: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                          placeholder="628123456789"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">Batas Peringatan Stok Minimum</label>
                        <input
                          type="number"
                          value={settings.lowStockThreshold}
                          onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        storage.saveSettings(settings);
                        showSuccessFeedback('Pengaturan toko & konteks berhasil disimpan!');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    >
                      Simpan Konteks & Kontak
                    </button>
                  </div>

                  {/* Gallery Editor (Up to 10 items) */}
                  <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-emerald-400" />
                        Galeri Media Profil Toko ({galleryMedia.length} / 10 Item)
                      </h3>
                      {galleryMedia.length < 10 && (
                        <button
                          onClick={() => {
                            const newMedia: GalleryMediaItem = {
                              id: `gal-${Date.now()}`,
                              title: `Media Baru #${galleryMedia.length + 1}`,
                              type: 'image',
                              mediaUrl: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=800',
                              backgroundUrl: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=1600',
                              caption: 'Koleksi display perlengkapan listrik & teknik original.',
                              category: 'Showroom',
                              isFeatured: true,
                            };
                            const updated = storage.saveGalleryItem(newMedia);
                            setGalleryMedia(updated);
                            showSuccessFeedback('Item galeri baru ditambahkan.');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold"
                        >
                          + Tambah Media
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {galleryMedia.map((g, idx) => (
                        <div key={g.id} className="p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                            <span>Media #{idx + 1} ({g.type.toUpperCase()})</span>
                            <button
                              onClick={() => {
                                const updated = storage.deleteGalleryItem(g.id);
                                setGalleryMedia(updated);
                                showSuccessFeedback('Item galeri dihapus.');
                              }}
                              className="text-rose-400 hover:text-rose-300"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={g.title}
                            onChange={(e) => {
                              const updated = storage.saveGalleryItem({ ...g, title: e.target.value });
                              setGalleryMedia(updated);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                            placeholder="Judul media..."
                          />
                          <input
                            type="text"
                            value={g.mediaUrl}
                            onChange={(e) => {
                              const updated = storage.saveGalleryItem({ ...g, mediaUrl: e.target.value });
                              setGalleryMedia(updated);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                            placeholder="URL Gambar atau Embed Video..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 7. FITUR BARU SECARA MANUAL */}
              {activeTab === 'customFeatures' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">Penambahan Fitur Baru Secara Manual</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tambahkan modul fitur khusus, banner layanan proyek, atau promo kustom langsung dari dashboard.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {customFeatures.map((f) => (
                      <div key={f.id} className="p-4 rounded-2xl bg-slate-800 border border-slate-700 flex items-start justify-between gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="font-bold text-emerald-400 uppercase text-[10px]">{f.badgeText}</span>
                          <h4 className="text-sm font-bold text-white">{f.title}</h4>
                          <p className="text-slate-300">{f.description}</p>
                        </div>
                        <button
                          onClick={() => {
                            const updated = storage.deleteCustomFeature(f.id);
                            setCustomFeatures(updated);
                            showSuccessFeedback('Fitur dihapus.');
                          }}
                          className="p-1.5 rounded-lg bg-slate-700 hover:bg-rose-900/50 text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        const newFeat: CustomManualFeature = {
                          id: `feat-${Date.now()}`,
                          title: 'Layanan Pengadaan Proyek Gedung',
                          description: 'Penawaran harga khusus (RAB) untuk kontraktor dan proyek renovasi skala besar.',
                          iconName: 'ShieldCheck',
                          badgeText: 'B2B Proyek',
                          isActive: true,
                        };
                        const updated = storage.saveCustomFeature(newFeat);
                        setCustomFeatures(updated);
                        showSuccessFeedback('Fitur manual baru berhasil ditambahkan!');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Kartu Fitur Baru
                    </button>
                  </div>
                </div>
              )}

              {/* 8. UBAH PASSWORD ADMIN */}
              {activeTab === 'changePassword' && (
                <div className="max-w-md mx-auto space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Ubah Password Admin</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Wajib kombinasi huruf dan angka minimal 8 karakter dengan minimal satu huruf kapital.
                    </p>
                  </div>

                  {passwordChangeSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs">
                      {passwordChangeSuccess}
                    </div>
                  )}

                  {passwordChangeError && (
                    <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                      {passwordChangeError}
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setPasswordChangeError('');
                      setPasswordChangeSuccess('');

                      if (newPassword !== confirmPassword) {
                        setPasswordChangeError('Konfirmasi password baru tidak cocok.');
                        return;
                      }

                      const res = storage.changeAdminPassword(
                        currentAdmin.username,
                        oldPassword,
                        newPassword
                      );

                      if (res.success) {
                        setPasswordChangeSuccess('Password admin berhasil diubah!');
                        setOldPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      } else {
                        setPasswordChangeError(res.error || 'Gagal mengubah password.');
                      }
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Password Lama</label>
                      <input
                        type="password"
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">
                        Password Baru (Min 8 karakter, 1 Huruf Kapital)
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                        placeholder="Contoh: SolusiRumahku2026"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Ulangi Password Baru</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white font-bold shadow-md"
                    >
                      Perbarui Password Admin
                    </button>
                  </form>
                </div>
              )}

              {/* 9. APPWRITE BACKEND CONFIGURATION */}
              {activeTab === 'appwrite' && (
                <div className="space-y-6 text-xs">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Database className="w-5 h-5 text-rose-400" />
                      Konfigurasi Backend Appwrite
                    </h2>
                    <p className="text-slate-400 mt-1">
                      Hubungkan database Appwrite untuk sinkronisasi cloud atau gunakan durabilitas penyimpanan lokal secara otomatis.
                    </p>
                  </div>

                  {appwriteTestResult && (
                    <div
                      className={`p-3.5 rounded-2xl border text-xs font-semibold ${
                        appwriteTestResult.success
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      {appwriteTestResult.message}
                    </div>
                  )}

                  <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">Appwrite Endpoint</label>
                        <input
                          type="text"
                          value={settings.appwriteConfig.endpoint}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              appwriteConfig: { ...settings.appwriteConfig, endpoint: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                          placeholder="https://cloud.appwrite.io/v1"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">Project ID</label>
                        <input
                          type="text"
                          value={settings.appwriteConfig.projectId}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              appwriteConfig: { ...settings.appwriteConfig, projectId: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                          placeholder="solusi-rumahku-app"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">Database ID</label>
                        <input
                          type="text"
                          value={settings.appwriteConfig.databaseId}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              appwriteConfig: { ...settings.appwriteConfig, databaseId: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">Products Collection ID</label>
                        <input
                          type="text"
                          value={settings.appwriteConfig.productsCollectionId}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              appwriteConfig: { ...settings.appwriteConfig, productsCollectionId: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-700">
                      <button
                        type="button"
                        disabled={appwriteTesting}
                        onClick={async () => {
                          setAppwriteTesting(true);
                          setAppwriteTestResult(null);
                          const res = await appwriteService.testConnection(settings.appwriteConfig);
                          setAppwriteTestResult(res);
                          setAppwriteTesting(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center gap-1.5"
                      >
                        <Database className="w-3.5 h-3.5" />
                        {appwriteTesting ? 'Menguji Koneksi...' : 'Uji Koneksi Appwrite'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          storage.saveSettings(settings);
                          appwriteService.updateConfig(settings.appwriteConfig);
                          showSuccessFeedback('Konfigurasi Appwrite berhasil disimpan!');
                        }}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                      >
                        Simpan Konfigurasi
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
