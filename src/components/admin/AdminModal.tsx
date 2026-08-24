import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Search,
  Download,
  Upload,
  ArrowUp,
  ArrowDown,
  FileSpreadsheet,
  Users,
  UserPlus,
  Home,
  Shield,
  Globe,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  Unlock,
  ShieldCheck,
  Check,
  Star,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Layout,
  RefreshCw,
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
  AdminRole,
  AdminPermissions,
} from '../../types';
import {
  storage,
  MANAGER_ACCESS_CODE,
  validateAdminPassword,
} from '../../services/storageService';
import { appwriteService } from '../../services/appwriteService';
import { formatRupiah, getStockStatus } from '../../utils/formatters';
import { exportProductsToCSV, parseProductsCSV } from '../../utils/csvHelper';
import { Logo } from '../Logo';

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

  // Login form - initialized empty for security on shared devices
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form - initialized empty for security on shared devices
  const [regAccessCode, setRegAccessCode] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [isAccessCodeVerified, setIsAccessCodeVerified] = useState(false);

  // Helper to completely clear sensitive auth inputs
  const clearAuthInputs = () => {
    setLoginUsername('');
    setLoginPassword('');
    setLoginError('');
    setRegAccessCode('');
    setRegUsername('');
    setRegFullName('');
    setRegPassword('');
    setRegError('');
    setIsAccessCodeVerified(false);
  };

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'homeEditor'
    | 'products'
    | 'categories'
    | 'brands'
    | 'types'
    | 'infoTrend'
    | 'appearance'
    | 'adminUsers'
    | 'customFeatures'
    | 'changePassword'
    | 'appwrite'
  >('dashboard');

  // Loaded Datasets
  const [products, setProducts] = useState<Product[]>(() => storage.getProducts());
  const [categories, setCategories] = useState<CategoryItem[]>(() => storage.getCategories());
  const [brands, setBrands] = useState<BrandItem[]>(() => storage.getBrands());
  const [productTypes, setProductTypes] = useState<ProductTypeItem[]>(() => storage.getProductTypes());
  const [infoTrends, setInfoTrends] = useState<InfoTrendItem[]>(() => storage.getInfoTrends());
  const [galleryMedia, setGalleryMedia] = useState<GalleryMediaItem[]>(() => storage.getGalleryMedia());
  const [customFeatures, setCustomFeatures] = useState<CustomManualFeature[]>(() => storage.getCustomFeatures());
  const [settings, setSettings] = useState<StoreSettings>(() => storage.getSettings());
  const [adminUsersList, setAdminUsersList] = useState<AdminUser[]>(() => storage.getAdminUsers());
  const [productStockFilter, setProductStockFilter] = useState<'all' | 'low' | 'unspecified' | 'available' | 'favorite'>('all');

  // User Management State (Manager Only)
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminFullName, setNewAdminFullName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>('admin_full');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminPermissions, setNewAdminPermissions] = useState<AdminPermissions>({
    canEditName: false,
    canEditBrand: false,
    canEditCategory: false,
    canEditType: false,
    canEditImages: false,
    canEditDescription: false,
    canEditFavoriteRank: false,
    canCreateProduct: false,
    canDeleteProduct: false,
    canImportCsv: false,
  });
  const [adminUserError, setAdminUserError] = useState('');
  const [adminUserSuccess, setAdminUserSuccess] = useState('');
  const [editingAdminUser, setEditingAdminUser] = useState<AdminUser | null>(null);
  const [editAdminRole, setEditAdminRole] = useState<AdminRole>('admin_full');
  const [editAdminPassword, setEditAdminPassword] = useState('');
  const [editAdminPermissions, setEditAdminPermissions] = useState<AdminPermissions>({
    canEditName: false,
    canEditBrand: false,
    canEditCategory: false,
    canEditType: false,
    canEditImages: false,
    canEditDescription: false,
    canEditFavoriteRank: false,
    canCreateProduct: false,
    canDeleteProduct: false,
    canImportCsv: false,
  });

  // Logo file upload ref for Home Editor
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const heroMediaFileInputRef = useRef<HTMLInputElement>(null);
  const bgImageFileInputRef = useRef<HTMLInputElement>(null);

  // Editing state for products
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // CSV Import Modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editing state for category
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Editing state for Brands
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);

  // Editing state for Product Types
  const [editingProductType, setEditingProductType] = useState<ProductTypeItem | null>(null);
  const [isCreatingProductType, setIsCreatingProductType] = useState(false);

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

  // Appwrite test & sync state
  const [appwriteTestResult, setAppwriteTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [appwriteTesting, setAppwriteTesting] = useState(false);
  const [appwritePushing, setAppwritePushing] = useState(false);
  const [appwritePushProgress, setAppwritePushProgress] = useState<string>('');
  const [appwritePulling, setAppwritePulling] = useState(false);

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
    setAdminUsersList(storage.getAdminUsers());
    setCurrentAdmin(storage.getCurrentAdmin());
  };

  useEffect(() => {
    if (isOpen) {
      loadAllData();
      clearAuthInputs();
    } else {
      clearAuthInputs();
    }
  }, [isOpen]);

  // Clear sensitive fields when switching admin tabs
  useEffect(() => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordChangeSuccess('');
    setPasswordChangeError('');
    setNewAdminUsername('');
    setNewAdminFullName('');
    setNewAdminPassword('');
    setAdminUserError('');
    setAdminUserSuccess('');
    setEditAdminPassword('');
  }, [activeTab]);

  const showSuccessFeedback = (msg: string) => {
    setActionSuccessMessage(msg);
    onDataUpdated();
    setTimeout(() => setActionSuccessMessage(''), 3500);
  };

  // --- Role & Permissions Checks ---
  const isManager = currentAdmin?.role === 'manager';
  const isAdminFull = currentAdmin?.role === 'admin_full' || isManager;
  const isAdminPartial = currentAdmin?.role === 'admin_partial';

  // Granular check function for partial admin vs full/manager
  const canEditField = (field: keyof AdminPermissions): boolean => {
    if (!currentAdmin) return false;
    if (isAdminFull) return true;
    if (isAdminPartial) {
      return Boolean(currentAdmin.permissions?.[field]);
    }
    return false;
  };

  // --- Auth Handlers ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = storage.loginAdmin(loginUsername, loginPassword);
    if (res.success && res.admin) {
      clearAuthInputs();
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
      clearAuthInputs();
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
    clearAuthInputs();
    setAuthMode('choose');
  };

  // --- Admin User Management Handlers (Manager Only) ---
  const handleCreateAdminUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin) return;
    setAdminUserError('');
    setAdminUserSuccess('');
    const res = storage.createAdminUserByManager(currentAdmin, {
      username: newAdminUsername,
      fullName: newAdminFullName,
      role: newAdminRole,
      password: newAdminPassword,
      permissions: newAdminRole === 'admin_partial' ? newAdminPermissions : undefined,
    });
    if (res.success && res.admin) {
      setAdminUsersList(storage.getAdminUsers());
      setNewAdminUsername('');
      setNewAdminFullName('');
      setNewAdminPassword('');
      setNewAdminRole('admin_full');
      setNewAdminPermissions({
        canEditName: false,
        canEditBrand: false,
        canEditCategory: false,
        canEditType: false,
        canEditImages: false,
        canEditDescription: false,
        canEditFavoriteRank: false,
        canCreateProduct: false,
        canDeleteProduct: false,
        canImportCsv: false,
      });
      setAdminUserSuccess(`Akun admin "${res.admin.fullName}" (${res.admin.role}) berhasil didaftarkan!`);
      showSuccessFeedback(`Admin @${res.admin.username} berhasil dibuat.`);
    } else {
      setAdminUserError(res.error || 'Gagal mendaftarkan admin.');
    }
  };

  const handleUpdateAdminUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin || !editingAdminUser) return;
    setAdminUserError('');
    const updatedTarget: AdminUser = {
      ...editingAdminUser,
      role: editAdminRole,
      permissions: editAdminRole === 'admin_partial' ? editAdminPermissions : undefined,
    };
    const res = storage.updateAdminUserByManager(
      currentAdmin,
      updatedTarget,
      editAdminPassword || undefined
    );
    if (res.success) {
      setAdminUsersList(storage.getAdminUsers());
      setEditingAdminUser(null);
      setEditAdminPassword('');
      showSuccessFeedback('Hak akses user admin berhasil diperbarui.');
    } else {
      setAdminUserError(res.error || 'Gagal memperbarui admin.');
    }
  };

  const handleDeleteAdminUser = (id: string, name: string) => {
    if (!currentAdmin) return;
    if (confirm(`Apakah Anda yakin ingin menghapus akun admin "${name}"?`)) {
      const res = storage.deleteAdminUserByManager(currentAdmin, id);
      if (res.success) {
        setAdminUsersList(storage.getAdminUsers());
        showSuccessFeedback(`Akun admin "${name}" telah dihapus.`);
      } else {
        alert(res.error || 'Gagal menghapus admin.');
      }
    }
  };

  // --- File Upload Handlers for Custom Home Settings ---
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSettings((prev) => ({ ...prev, customLogoUrl: result }));
        showSuccessFeedback('File logo berhasil dimuat. Klik "Simpan Pengaturan Halaman Utama" untuk menerapkan.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleHeroMediaFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSettings((prev) => ({ ...prev, heroMediaUrl: result, heroMediaType: 'image' }));
        showSuccessFeedback('File banner berhasil dimuat. Klik "Simpan Pengaturan Halaman Utama" untuk menerapkan.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBgImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSettings((prev) => ({
          ...prev,
          pageBackgroundImageUrl: result,
          pageBackgroundPattern: 'custom_image',
        }));
        showSuccessFeedback('File background berhasil dimuat.');
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Stock Alert Stats ---
  const stockNotifications = useMemo(() => {
    return storage.getStockNotifications(products, settings.lowStockThreshold);
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
                      clearAuthInputs();
                      setAuthMode('login');
                    }}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#065f46] hover:bg-[#047857] text-white text-sm font-bold shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                    id="btn-admin-choose-login"
                  >
                    <KeyRound className="w-4 h-4" />
                    Masuk (Login Admin)
                  </button>

                  <button
                    onClick={() => {
                      clearAuthInputs();
                      setAuthMode('register');
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
                autoComplete="off"
                className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-emerald-400" />
                    Masuk Akun Admin
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      clearAuthInputs();
                      setAuthMode('choose');
                    }}
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
                      autoComplete="off"
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
                      autoComplete="new-password"
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
                autoComplete="off"
                className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-amber-400" />
                    Verifikasi Kode Akses Manager
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      clearAuthInputs();
                      setAuthMode('choose');
                    }}
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
                    autoComplete="off"
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
                autoComplete="off"
                className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                    Pendaftaran Akun Manager
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setRegError('');
                      setIsAccessCodeVerified(false);
                    }}
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
                      autoComplete="off"
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
                      autoComplete="off"
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
                      autoComplete="new-password"
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

              {/* FITUR BARU: EDIT HALAMAN UTAMA */}
              <button
                onClick={() => setActiveTab('homeEditor')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'homeEditor'
                    ? 'bg-[#065f46] text-white shadow-sm ring-1 ring-emerald-400/50'
                    : 'text-emerald-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Home className="w-4 h-4 text-emerald-400" />
                <span>Halaman Utama</span>
                <span className="ml-auto text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                  Editor
                </span>
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
                {isAdminPartial && (
                  <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded">
                    Terbatas
                  </span>
                )}
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

              {/* FITUR BARU: DAFTAR & KELOLA USER ADMIN (MANAGER ONLY) */}
              {isManager && (
                <button
                  onClick={() => setActiveTab('adminUsers')}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === 'adminUsers'
                      ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                      : 'text-amber-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Kelola User Admin ({adminUsersList.length})</span>
                  <span className="ml-auto text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-bold uppercase">
                    Manager
                  </span>
                </button>
              )}

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
                    <div
                      onClick={() => {
                        setProductStockFilter('all');
                        setProductSearchQuery('');
                        setActiveTab('products');
                      }}
                      className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 group-hover:text-slate-300">Total Katalog Produk</span>
                        <Package className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <p className="text-2xl font-black text-white mt-1">{products.length}</p>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                        Lihat semua &rarr;
                      </span>
                    </div>

                    <div
                      onClick={() => {
                        setProductStockFilter('favorite');
                        setProductSearchQuery('');
                        setActiveTab('products');
                      }}
                      className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-800 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 group-hover:text-slate-300">Produk Favorit</span>
                        <Star className="w-4 h-4 text-amber-500/60 group-hover:text-amber-400 transition-colors" />
                      </div>
                      <p className="text-2xl font-black text-amber-400 mt-1">
                        {products.filter((p) => p.isFavoriteMonthRank).length} <span className="text-xs text-slate-500 font-normal">/ 20</span>
                      </p>
                      <span className="text-[10px] text-amber-400 flex items-center gap-1 mt-1 font-medium">
                        Kelola ranking &rarr;
                      </span>
                    </div>

                    <div
                      onClick={() => {
                        setProductStockFilter('low');
                        setProductSearchQuery('');
                        setActiveTab('products');
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                        stockNotifications.lowStockProducts.length > 0
                          ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400 hover:bg-amber-950/30'
                          : 'bg-slate-800/90 border-slate-700 hover:border-amber-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-amber-300 font-semibold">
                          Stok Menipis (&le; {settings.lowStockThreshold || 20})
                        </span>
                        <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                      </div>
                      <p className="text-2xl font-black text-amber-400 mt-1">
                        {stockNotifications.lowStockProducts.length}
                      </p>
                      <span className="text-[10px] text-amber-300 flex items-center gap-1 mt-1 font-medium">
                        {stockNotifications.lowStockProducts.length > 0 ? 'Perlu Restock \u2192' : 'Stok Aman \u2192'}
                      </span>
                    </div>

                    <div
                      onClick={() => {
                        setProductStockFilter('unspecified');
                        setProductSearchQuery('');
                        setActiveTab('products');
                      }}
                      className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 hover:border-sky-500/50 hover:bg-slate-800 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-sky-300 font-semibold">Tanya Admin (Kosong)</span>
                        <HelpCircle className="w-4 h-4 text-sky-400" />
                      </div>
                      <p className="text-2xl font-black text-sky-400 mt-1">
                        {stockNotifications.unspecifiedStockProducts.length}
                      </p>
                      <span className="text-[10px] text-sky-300 flex items-center gap-1 mt-1 font-medium">
                        Isi Stok &rarr;
                      </span>
                    </div>
                  </div>

                  {/* Automatic Stock Alerts Section */}
                  <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700">
                    <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      Peringatan Stok Otomatis Toko (Batas Minimum: {settings.lowStockThreshold || 20})
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
                                Sisa Stok: <strong>{p.stockCount} unit</strong> (Batas Minimum: {settings.lowStockThreshold || 20})
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

              {/* ================= FITUR BARU: HALAMAN UTAMA EDITOR ================= */}
              {activeTab === 'homeEditor' && (
                <div className="space-y-6 text-xs text-slate-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                        <Home className="w-6 h-6 text-emerald-400" />
                        Edit & Pengaturan Halaman Utama Toko
                      </h2>
                      <p className="text-slate-400 mt-1">
                        Kustomisasi logo aplikasi, teks dan gambar/video banner utama, background, nama toko, hingga tombol navigasi beranda.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        storage.saveSettings(settings);
                        showSuccessFeedback('Pengaturan Halaman Utama berhasil disimpan dan diterapkan!');
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-2 shrink-0 active:scale-98 transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan Halaman Utama</span>
                    </button>
                  </div>

                  {/* 1. Identitas Toko & Logo Aplikasi */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-slate-800/90 border border-slate-700 space-y-4">
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      1. Identitas Toko & Logo Aplikasi
                    </h3>

                    {/* Logo Live Preview */}
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Pratinjau Langsung Logo Aplikasi (Live Preview):
                        </span>
                        <div className="p-3 rounded-xl bg-white/95 inline-block shadow-inner">
                          <Logo
                            size="md"
                            customLogoUrl={settings.customLogoUrl}
                            textPrefix={settings.logoTextPrefix || 'SOLUSI'}
                            textSuffix={settings.logoTextSuffix || 'RUMAHKU'}
                            storeName={settings.storeName}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="file"
                          ref={logoFileInputRef}
                          onChange={handleLogoFileUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => logoFileInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Upload Logo Gambar
                        </button>
                        {settings.customLogoUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setSettings({ ...settings, customLogoUrl: undefined });
                              showSuccessFeedback('Logo dikembalikan ke format vektor default.');
                            }}
                            className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold"
                          >
                            Reset ke Logo Bawaan
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">
                          Nama Toko (Store Name)
                        </label>
                        <input
                          type="text"
                          value={settings.storeName}
                          onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold"
                          placeholder="Solusi Rumahku"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">
                          Slogan / Tagline Toko
                        </label>
                        <input
                          type="text"
                          value={settings.tagline}
                          onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                          placeholder="Pusat Alat Listrik, Teknik & Rumah Tangga SNI"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">
                          Teks Logo Awalan (Prefix)
                        </label>
                        <input
                          type="text"
                          value={settings.logoTextPrefix || ''}
                          onChange={(e) => setSettings({ ...settings, logoTextPrefix: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                          placeholder="SOLUSI"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">
                          Teks Logo Akhiran (Suffix / Hijau)
                        </label>
                        <input
                          type="text"
                          value={settings.logoTextSuffix || ''}
                          onChange={(e) => setSettings({ ...settings, logoTextSuffix: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-bold"
                          placeholder="RUMAHKU"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-semibold text-slate-300 block mb-1">
                          URL Gambar Logo Kustom (Opsional jika upload file atau link eksternal)
                        </label>
                        <input
                          type="text"
                          value={settings.customLogoUrl || ''}
                          onChange={(e) => setSettings({ ...settings, customLogoUrl: e.target.value || undefined })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                          placeholder="https://domain.com/logo.png atau upload file di atas"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Pengumuman Bar Paling Atas */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-slate-800/90 border border-slate-700 space-y-4">
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      2. Bar Pengumuman Teratas (Top Announcement Bar)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">
                          Badge Label Pengumuman
                        </label>
                        <input
                          type="text"
                          value={settings.topAnnouncementBadge || ''}
                          onChange={(e) => setSettings({ ...settings, topAnnouncementBadge: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-300 font-bold uppercase text-xs"
                          placeholder="Resmi & Terpercaya"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="font-semibold text-slate-300 block mb-1">
                          Teks Berjalan / Pengumuman Toko
                        </label>
                        <input
                          type="text"
                          value={settings.topAnnouncementText || ''}
                          onChange={(e) => setSettings({ ...settings, topAnnouncementText: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                          placeholder="Solusi Rumahku • Pusat Peralatan Listrik, Kerja Teknik & Rumah Tangga SNI"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Hero Banner Utama (Teks, Gambar/Video/URL Banner & Nuansa Warna) */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-slate-800/90 border border-slate-700 space-y-4">
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      3. Banner Utama Beranda (Hero Banner & Media Video / Gambar)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="font-semibold text-slate-300 block mb-1">
                          Badge Label Hero (Kecil di Atas Judul)
                        </label>
                        <input
                          type="text"
                          value={settings.heroBadge || ''}
                          onChange={(e) => setSettings({ ...settings, heroBadge: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-300 font-bold"
                          placeholder="Distributor Resmi & Garansi SNI"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-semibold text-slate-300 block mb-1">
                          Judul Utama Banner Hero (Headline Besar)
                        </label>
                        <input
                          type="text"
                          value={settings.heroTitle || ''}
                          onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm"
                          placeholder="Solusi Terlengkap Alat Listrik, Perkakas Teknik & Rumah Tangga"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-semibold text-slate-300 block mb-1">
                          Subjudul / Deskripsi Lengkap Banner
                        </label>
                        <textarea
                          rows={2}
                          value={settings.heroSubtitle || ''}
                          onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                          placeholder="Pilihan terbaik lampu LED hemat energi, saklar, fitting, mesin bor..."
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">
                          Tema Gradien Warna Banner
                        </label>
                        <select
                          value={settings.heroThemeGradient || 'emerald'}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              heroThemeGradient: e.target.value as any,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold"
                        >
                          <option value="emerald">Emerald Green (Hijau Zamrud - Standar Toko)</option>
                          <option value="dark">Dark Charcoal (Modern Elegan Gelap)</option>
                          <option value="navy">Deep Navy Blue (Biru Industri)</option>
                          <option value="amber">Warm Amber Gold (Emas Premium)</option>
                          <option value="slate">Slate Steel Gray (Teknik Minimalis)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">
                          Tipe Media Sisi Kanan Banner
                        </label>
                        <select
                          value={settings.heroMediaType || 'gradient'}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              heroMediaType: e.target.value as any,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold"
                        >
                          <option value="gradient">4 Kartu Fitur Keunggulan (Original, SNI, Cepat, dsb)</option>
                          <option value="image">Gambar Banner Utama (Upload / URL)</option>
                          <option value="video">Video Banner (Embed YouTube / File MP4)</option>
                        </select>
                      </div>

                      {settings.heroMediaType !== 'gradient' && (
                        <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-900/90 border border-slate-700 space-y-3">
                          <label className="font-bold text-amber-300 block">
                            URL Gambar / Video Banner Hero
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={settings.heroMediaUrl || ''}
                              onChange={(e) => setSettings({ ...settings, heroMediaUrl: e.target.value })}
                              placeholder={
                                settings.heroMediaType === 'video'
                                  ? 'Contoh: https://www.youtube.com/watch?v=VIDEO_ID atau URL .mp4'
                                  : 'https://images.unsplash.com/... atau upload file'
                              }
                              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                            />
                            {settings.heroMediaType === 'image' && (
                              <>
                                <input
                                  type="file"
                                  ref={heroMediaFileInputRef}
                                  onChange={handleHeroMediaFileUpload}
                                  accept="image/*"
                                  className="hidden"
                                />
                                <button
                                  type="button"
                                  onClick={() => heroMediaFileInputRef.current?.click()}
                                  className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold shrink-0 flex items-center gap-1"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  Upload
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="sm:col-span-2">
                        <label className="font-semibold text-slate-300 block mb-1">
                          URL Gambar Latar Belakang (Background Overlay) Banner Hero (Opsional)
                        </label>
                        <input
                          type="text"
                          value={settings.heroBackgroundUrl || ''}
                          onChange={(e) => setSettings({ ...settings, heroBackgroundUrl: e.target.value || undefined })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                          placeholder="https://images.unsplash.com/photo-...?w=1600 (Opsional)"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">
                          Teks Tombol Aksi 1 (CTA 1)
                        </label>
                        <input
                          type="text"
                          value={settings.heroCta1Text || ''}
                          onChange={(e) => setSettings({ ...settings, heroCta1Text: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                          placeholder="Lihat Semua Kategori"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">
                          Teks Tombol Aksi 2 (CTA 2 WhatsApp)
                        </label>
                        <input
                          type="text"
                          value={settings.heroCta2Text || ''}
                          onChange={(e) => setSettings({ ...settings, heroCta2Text: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                          placeholder="Chat WhatsApp CS"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Gambar Background & Pola Latar Halaman */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-slate-800/90 border border-slate-700 space-y-4">
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      4. Latar Belakang & Pola Tampilan Seluruh Halaman (Page Background)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">
                          Pilihan Pola Latar Belakang (Background Pattern)
                        </label>
                        <select
                          value={settings.pageBackgroundPattern || 'default'}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              pageBackgroundPattern: e.target.value as any,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold"
                        >
                          <option value="default">Polos / Standar Bersih (Light Off-White)</option>
                          <option value="grid">Pola Kotak Arsitektur (Architectural Grid 24px)</option>
                          <option value="dots">Pola Titik Modern (Subtle Dot Matrix 16px)</option>
                          <option value="custom_image">Gambar Latar Kustom (Custom Image Wallpaper)</option>
                        </select>
                      </div>

                      {settings.pageBackgroundPattern === 'custom_image' && (
                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">
                            URL Gambar Latar Belakang / Upload File
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={settings.pageBackgroundImageUrl || ''}
                              onChange={(e) => setSettings({ ...settings, pageBackgroundImageUrl: e.target.value })}
                              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                              placeholder="URL gambar latar..."
                            />
                            <input
                              type="file"
                              ref={bgImageFileInputRef}
                              onChange={handleBgImageFileUpload}
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => bgImageFileInputRef.current?.click()}
                              className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold"
                            >
                              Upload
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 5. Informasi Kontak, Jam Kerja & Batas Stok */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-slate-800/90 border border-slate-700 space-y-4">
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      5. Informasi Kontak & Jam Operasional Toko
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">
                          Nomor WhatsApp Utama Toko
                        </label>
                        <input
                          type="text"
                          value={settings.phoneWhatsApp}
                          onChange={(e) => setSettings({ ...settings, phoneWhatsApp: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                          placeholder="628123456789"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">
                          Batas Peringatan Stok Menipis (&le; Jumlah Unit)
                        </label>
                        <input
                          type="number"
                          value={settings.lowStockThreshold || 20}
                          onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) || 20 })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-bold"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Sistem akan otomatis memberi notifikasi jika stok produk &le; batas ini (Standar: 20 unit).
                        </span>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-semibold text-slate-300 block mb-1">
                          Jam & Hari Kerja Operasional
                        </label>
                        <input
                          type="text"
                          value={settings.businessHours}
                          onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                          placeholder="Senin - Sabtu (Kecuali Hari Libur): 08:00 - 17:00 WIB"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-semibold text-slate-300 block mb-1">
                          Alamat Fisik / Workshop Toko
                        </label>
                        <input
                          type="text"
                          value={settings.address}
                          onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                          placeholder="Jl. Raya Utama No. 88, Pusat Perlengkapan Bangunan"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 6. Pengaturan Tampilan Bagian Bawah Halaman Beranda (Footer, Logo & Tata Letak) */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-slate-800/90 border border-slate-700 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                        <Layout className="w-4 h-4" />
                        6. Tampilan Bagian Bawah Halaman Beranda (Footer, Logo & Tata Letak)
                      </h3>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                        Sinkron Logo Atas & Bawah
                      </span>
                    </div>

                    {/* Footer Logo & Text Live Preview */}
                    <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          Pratinjau Langsung Bagian Bawah (Footer Live Preview):
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Ukuran: {settings.footerCustomLogoPx ? `${settings.footerCustomLogoPx}px` : (settings.footerLogoSize || 'md').toUpperCase()} &bull; Rata: {settings.footerLayoutAlign || 'left'}
                        </span>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200">
                        <div
                          className={`flex flex-col ${
                            settings.footerLayoutAlign === 'center'
                              ? 'items-center text-center'
                              : settings.footerLayoutAlign === 'right'
                              ? 'items-end text-right'
                              : 'items-start text-left'
                          }`}
                        >
                          <div className="bg-white/95 p-3 rounded-2xl shadow-sm inline-block">
                            <Logo
                              size={settings.footerLogoSize || 'md'}
                              customPixelSize={settings.footerCustomLogoPx}
                              customLogoUrl={settings.customLogoUrl}
                              textPrefix={settings.logoTextPrefix || 'SOLUSI'}
                              textSuffix={settings.logoTextSuffix || 'RUMAHKU'}
                              storeName={settings.storeName}
                              showText={settings.footerShowLogoText !== false}
                              showTagline={settings.footerShowTagline !== false}
                              customTagline={settings.footerTaglineText || settings.tagline}
                              layout={settings.footerTextLayout || 'stacked'}
                              align={settings.footerLayoutAlign || 'left'}
                            />
                          </div>

                          <p className="mt-3 text-xs text-slate-400 max-w-lg leading-relaxed">
                            {settings.footerAboutText ||
                              'Distributor & supplier terpercaya penyedia alat listrik rumah tangga, lampu LED, perkakas teknik mekanik, dan kabel instalasi berstandar SNI.'}
                          </p>

                          <div className="mt-4 pt-3 border-t border-slate-800 w-full text-[11px] text-slate-500">
                            {settings.footerCopyrightText
                              ? settings.footerCopyrightText.replace('{year}', new Date().getFullYear().toString()).replace('{store}', settings.storeName)
                              : `© ${new Date().getFullYear()} ${settings.storeName}. Hak Cipta Dilindungi.`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Logo Size Presets */}
                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">
                          Ukuran Logo Bagian Bawah (Footer Logo Size)
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setSettings({ ...settings, footerLogoSize: sz, footerCustomLogoPx: undefined })}
                              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                                (settings.footerLogoSize || 'md') === sz && !settings.footerCustomLogoPx
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              {sz === 'sm' && 'Kecil (40px)'}
                              {sz === 'md' && 'Sedang (56px)'}
                              {sz === 'lg' && 'Besar (72px)'}
                              {sz === 'xl' && 'Ekstra (96px)'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Pixel Slider */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-semibold text-slate-300 block">
                            Atau Kustom Ukuran Logo (Slider Pixel)
                          </label>
                          <span className="text-emerald-400 font-mono font-bold text-xs">
                            {settings.footerCustomLogoPx || (settings.footerLogoSize === 'sm' ? 40 : settings.footerLogoSize === 'lg' ? 72 : settings.footerLogoSize === 'xl' ? 96 : 56)} px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="32"
                          max="140"
                          step="4"
                          value={
                            settings.footerCustomLogoPx ||
                            (settings.footerLogoSize === 'sm' ? 40 : settings.footerLogoSize === 'lg' ? 72 : settings.footerLogoSize === 'xl' ? 96 : 56)
                          }
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              footerCustomLogoPx: Number(e.target.value),
                            })
                          }
                          className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                          <span>32px</span>
                          <span>Default (56px)</span>
                          <span>140px</span>
                        </div>
                      </div>

                      {/* Alignment */}
                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">
                          Tata Letak Rata Posisi Footer
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, footerLayoutAlign: 'left' })}
                            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                              (settings.footerLayoutAlign || 'left') === 'left'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            <AlignLeft className="w-3.5 h-3.5" />
                            Rata Kiri
                          </button>
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, footerLayoutAlign: 'center' })}
                            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                              settings.footerLayoutAlign === 'center'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            <AlignCenter className="w-3.5 h-3.5" />
                            Rata Tengah
                          </button>
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, footerLayoutAlign: 'right' })}
                            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                              settings.footerLayoutAlign === 'right'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            <AlignRight className="w-3.5 h-3.5" />
                            Rata Kanan
                          </button>
                        </div>
                      </div>

                      {/* Text Layout Direction */}
                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">
                          Orientasi Teks Brand pada Logo
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, footerTextLayout: 'stacked' })}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                              (settings.footerTextLayout || 'stacked') === 'stacked'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            Bertumpuk (Vertikal)
                          </button>
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, footerTextLayout: 'horizontal' })}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                              settings.footerTextLayout === 'horizontal'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            Berdampingan (Horizontal)
                          </button>
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="sm:col-span-2 flex flex-wrap items-center gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-200">
                          <input
                            type="checkbox"
                            checked={settings.footerShowLogoText !== false}
                            onChange={(e) => setSettings({ ...settings, footerShowLogoText: e.target.checked })}
                            className="rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900 border-slate-700"
                          />
                          Tampilkan Teks Nama Toko di Logo Footer
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-200">
                          <input
                            type="checkbox"
                            checked={settings.footerShowTagline !== false}
                            onChange={(e) => setSettings({ ...settings, footerShowTagline: e.target.checked })}
                            className="rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900 border-slate-700"
                          />
                          Tampilkan Tagline / Slogan di Logo Footer
                        </label>
                      </div>

                      {/* Custom Tagline Footer */}
                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">
                          Teks Tagline / Slogan Khusus Footer (Opsional)
                        </label>
                        <input
                          type="text"
                          value={settings.footerTaglineText || ''}
                          onChange={(e) => setSettings({ ...settings, footerTaglineText: e.target.value })}
                          placeholder={settings.tagline || 'Pusat Alat Listrik, Teknik & Rumah Tangga SNI'}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                        />
                      </div>

                      {/* Custom Copyright */}
                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">
                          Teks Hak Cipta (Copyright Footer)
                        </label>
                        <input
                          type="text"
                          value={settings.footerCopyrightText || ''}
                          onChange={(e) => setSettings({ ...settings, footerCopyrightText: e.target.value })}
                          placeholder="© {year} {store}. Hak Cipta Dilindungi."
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Gunakan <code>{'{year}'}</code> untuk tahun berjalan dan <code>{'{store}'}</code> untuk nama toko.
                        </span>
                      </div>

                      {/* Custom About Text */}
                      <div className="sm:col-span-2">
                        <label className="font-semibold text-slate-300 block mb-1">
                          Teks Deskripsi &ldquo;Tentang Toko&rdquo; di Footer
                        </label>
                        <textarea
                          rows={2}
                          value={settings.footerAboutText || ''}
                          onChange={(e) => setSettings({ ...settings, footerAboutText: e.target.value })}
                          placeholder="Distributor & supplier terpercaya penyedia alat listrik rumah tangga, lampu LED, perkakas teknik mekanik, dan kabel instalasi berstandar SNI."
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-700 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          storage.saveSettings(settings);
                          showSuccessFeedback('Pengaturan Halaman Utama & Tampilan Footer berhasil disimpan!');
                        }}
                        className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-2 active:scale-98 transition-all"
                      >
                        <Save className="w-4 h-4" />
                        Simpan Semua Pengaturan Halaman Utama & Footer
                      </button>
                    </div>
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
                        Tambah, edit, cari, upload gambar, satuan packing, serta export/import massal Google Sheets / CSV.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => exportProductsToCSV(products)}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
                        title="Export semua produk ke file CSV (Kompatibel dengan Google Sheets / Excel)"
                      >
                        <Download className="w-4 h-4 text-emerald-400" />
                        Export CSV
                      </button>

                      {(isAdminFull || canEditField('canImportCsv')) && (
                        <button
                          onClick={() => {
                            setImportCsvText('');
                            setImportError('');
                            setIsImportModalOpen(true);
                          }}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
                          title="Import produk massal dari file CSV / Google Sheets"
                        >
                          <Upload className="w-4 h-4 text-sky-400" />
                          Import CSV
                        </button>
                      )}

                      {(isAdminFull || canEditField('canCreateProduct')) ? (
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
                              packingQuantity: undefined,
                              packingUnit: 'Pcs',
                              mainImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600',
                              images: ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600'],
                              description: '',
                              specifications: { Garansi: 'Resmi Toko', Standar: 'SNI' },
                              isFavoriteMonthRank: null,
                              isLatest: false,
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString(),
                            });
                            setIsCreatingProduct(true);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          Tambah Produk Baru
                        </button>
                      ) : (
                        <span className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl font-medium flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Izin Tambah Produk Dikunci</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* RBAC Notice Banner for Partial Admin */}
                  {isAdminPartial && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1.5 w-full">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <strong className="text-white block">Status Hak Akses Admin Terbatas (Dikonfigurasi Superadmin)</strong>
                          <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full text-amber-200 border border-amber-500/30 font-semibold">
                            Role: Admin Terbatas
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px]">
                          Anda dapat mengubah <strong>Harga Normal</strong>, <strong>Harga Diskon</strong>, <strong>Jumlah Stok Barang</strong>, dan <strong>Satuan Packing Grosir</strong>. Izin pengubahan data inti dan aksi lainnya dikontrol secara fleksibel oleh Superadmin.
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                            ✓ Harga, Diskon & Stok (Aktif)
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${canEditField('canEditName') ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400 line-through'}`}>
                            {canEditField('canEditName') ? '✓' : '✕'} Nama Produk
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${canEditField('canEditBrand') ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400 line-through'}`}>
                            {canEditField('canEditBrand') ? '✓' : '✕'} Merk
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${canEditField('canEditCategory') ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400 line-through'}`}>
                            {canEditField('canEditCategory') ? '✓' : '✕'} Kategori
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${canEditField('canEditType') ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400 line-through'}`}>
                            {canEditField('canEditType') ? '✓' : '✕'} Tipe
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${canEditField('canEditImages') ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400 line-through'}`}>
                            {canEditField('canEditImages') ? '✓' : '✕'} Foto Produk
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${canEditField('canEditDescription') ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400 line-through'}`}>
                            {canEditField('canEditDescription') ? '✓' : '✕'} Deskripsi
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${canEditField('canEditFavoriteRank') ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400 line-through'}`}>
                            {canEditField('canEditFavoriteRank') ? '✓' : '✕'} Favorit
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${canEditField('canCreateProduct') ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400 line-through'}`}>
                            {canEditField('canCreateProduct') ? '✓' : '✕'} Tambah Produk
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${canEditField('canDeleteProduct') ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400 line-through'}`}>
                            {canEditField('canDeleteProduct') ? '✓' : '✕'} Hapus Produk
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${canEditField('canImportCsv') ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400 line-through'}`}>
                            {canEditField('canImportCsv') ? '✓' : '✕'} Import CSV
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Search Bar & Stock Filter Chips for Products in Admin */}
                  <div className="space-y-2.5">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        placeholder="Cari produk berdasarkan nama, merk, kategori, atau tipe..."
                        className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      {productSearchQuery && (
                        <button
                          onClick={() => setProductSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Filter Tabs / Quick Chips */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                      <span className="text-[11px] text-slate-400 font-semibold shrink-0">Filter Status:</span>
                      <button
                        type="button"
                        onClick={() => setProductStockFilter('all')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                          productStockFilter === 'all'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Semua ({products.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductStockFilter('low')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                          productStockFilter === 'low'
                            ? 'bg-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-400'
                            : 'bg-amber-950/40 text-amber-300 border border-amber-500/40 hover:bg-amber-950/60'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Stok Menipis &le; {settings.lowStockThreshold || 20} ({stockNotifications.lowStockProducts.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductStockFilter('unspecified')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                          productStockFilter === 'unspecified'
                            ? 'bg-sky-500 text-slate-950 shadow-xs ring-2 ring-sky-400'
                            : 'bg-sky-950/40 text-sky-300 border border-sky-500/40 hover:bg-sky-950/60'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Tanya Admin ({stockNotifications.unspecifiedStockProducts.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductStockFilter('available')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                          productStockFilter === 'available'
                            ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-400'
                            : 'bg-slate-800/80 text-emerald-400 hover:bg-slate-700'
                        }`}
                      >
                        Stok Aman ({products.length - stockNotifications.lowStockProducts.length - stockNotifications.unspecifiedStockProducts.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductStockFilter('favorite')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1 ${
                          productStockFilter === 'favorite'
                            ? 'bg-amber-400 text-slate-950 shadow-xs'
                            : 'bg-slate-800/80 text-amber-400 hover:bg-slate-700'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        Favorit ({products.filter((p) => p.isFavoriteMonthRank).length})
                      </button>
                    </div>
                  </div>

                  {/* Product Form Modal / Editor */}
                  {editingProduct && (
                    <div className="p-6 rounded-3xl bg-slate-800 border-2 border-emerald-500/50 shadow-xl">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-emerald-400" />
                          <h3 className="text-base font-bold text-white">
                            {isCreatingProduct ? 'Tambah Produk Baru' : `Edit Produk: ${editingProduct.name}`}
                          </h3>
                          {isAdminPartial && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold">
                              Edit Sebagian
                            </span>
                          )}
                        </div>
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
                          <label className="font-semibold text-slate-300 block mb-1">
                            Nama Produk {!canEditField('canEditName') && <span className="text-amber-400 text-[10px] font-normal">(Terkunci Superadmin)</span>}
                          </label>
                          <input
                            type="text"
                            disabled={!canEditField('canEditName')}
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            className={`w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500 ${
                              !canEditField('canEditName') ? 'opacity-60 cursor-not-allowed bg-slate-950' : ''
                            }`}
                            placeholder="Nama produk lengkap..."
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">
                            Merk (Brand) {!canEditField('canEditBrand') && <span className="text-amber-400 text-[10px] font-normal">(Terkunci Superadmin)</span>}
                          </label>
                          <select
                            disabled={!canEditField('canEditBrand')}
                            value={editingProduct.brand}
                            onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                            className={`w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white ${
                              !canEditField('canEditBrand') ? 'opacity-60 cursor-not-allowed bg-slate-950' : ''
                            }`}
                          >
                            {brands.map((b) => (
                              <option key={b.id} value={b.name}>{b.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">
                            Kategori {!canEditField('canEditCategory') && <span className="text-amber-400 text-[10px] font-normal">(Terkunci Superadmin)</span>}
                          </label>
                          <select
                            disabled={!canEditField('canEditCategory')}
                            value={editingProduct.category}
                            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                            className={`w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white ${
                              !canEditField('canEditCategory') ? 'opacity-60 cursor-not-allowed bg-slate-950' : ''
                            }`}
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40">
                          <label className="font-bold text-emerald-300 block mb-1">
                            Harga Normal (Rp) &bull; Dapat Diubah
                          </label>
                          <input
                            type="number"
                            value={editingProduct.price}
                            onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-emerald-600 text-white font-bold"
                          />
                        </div>

                        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40">
                          <label className="font-bold text-emerald-300 block mb-1">
                            Harga Diskon (Opsional Rp) &bull; Dapat Diubah
                          </label>
                          <input
                            type="number"
                            value={editingProduct.discountPrice || ''}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                discountPrice: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-emerald-600 text-white"
                            placeholder="Biarkan kosong jika tidak diskon"
                          />
                        </div>

                        {/* Satuan Packing (Grosir / Per Kemasan) */}
                        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-emerald-300 block mb-1">
                              Jumlah Satuan per Packing (Kemasan / Grosir) &bull; Dapat Diubah
                            </label>
                            <input
                              type="number"
                              value={editingProduct.packingQuantity || ''}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  packingQuantity: e.target.value ? Number(e.target.value) : undefined,
                                })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-600 text-white font-mono"
                              placeholder="Contoh: 10, 50, 100 (kosongkan jika eceran)"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-emerald-300 block mb-1">
                              Satuan Packing &bull; Dapat Diubah
                            </label>
                            <input
                              type="text"
                              value={editingProduct.packingUnit || ''}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  packingUnit: e.target.value || undefined,
                                })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-600 text-white"
                              placeholder="Contoh: Pieces (Pcs), Slop, Roll, Pack, Dus, Meter, Lusin"
                            />
                          </div>
                        </div>

                        {/* Stok Konfigurasi (Tersedia vs Tanya Admin) */}
                        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/50 md:col-span-2">
                          <label className="font-bold text-amber-300 block mb-1">
                            Jumlah Stok Barang (Ketentuan User: Angka = &ldquo;Tersedia&rdquo; | Kosong = &ldquo;Tanya Admin&rdquo;) &bull; Dapat Diubah
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
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-600 text-white font-mono text-sm"
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
                            Rank &ldquo;Produk Favorit Bulan Ini&rdquo; (Pilihan 1 s/d 20) {!canEditField('canEditFavoriteRank') && <span className="text-slate-400 text-[10px] font-normal">(Terkunci Superadmin)</span>}
                          </label>
                          <select
                            disabled={!canEditField('canEditFavoriteRank')}
                            value={editingProduct.isFavoriteMonthRank || ''}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                isFavoriteMonthRank: e.target.value ? Number(e.target.value) : null,
                              })
                            }
                            className={`w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-bold ${
                              !canEditField('canEditFavoriteRank') ? 'opacity-60 cursor-not-allowed bg-slate-950' : ''
                            }`}
                          >
                            <option value="">Bukan Favorit Bulan Ini</option>
                            {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                              <option key={num} value={num}>Favorit #{num}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">
                            Tipe Produk {!canEditField('canEditType') && <span className="text-slate-400 text-[10px] font-normal">(Terkunci Superadmin)</span>}
                          </label>
                          <input
                            type="text"
                            disabled={!canEditField('canEditType')}
                            value={editingProduct.type}
                            onChange={(e) => setEditingProduct({ ...editingProduct, type: e.target.value })}
                            className={`w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white ${
                              !canEditField('canEditType') ? 'opacity-60 cursor-not-allowed bg-slate-950' : ''
                            }`}
                          />
                        </div>

                        {/* Up to 5 Images */}
                        <div className="md:col-span-2 p-4 rounded-2xl bg-slate-900 border border-slate-700">
                          <label className="font-bold text-white block mb-2">
                            Galeri Foto Produk (Hingga 5 Gambar) {!canEditField('canEditImages') && <span className="text-amber-400 text-[10px] font-normal">(Terkunci Superadmin)</span>}
                          </label>

                          <div className="space-y-3 mb-4">
                            {(editingProduct.images || []).map((img, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 w-16">Foto #{idx + 1}</span>
                                <input
                                  type="text"
                                  disabled={!canEditField('canEditImages')}
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
                                  className={`flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs ${
                                    !canEditField('canEditImages') ? 'opacity-60 cursor-not-allowed' : ''
                                  }`}
                                  placeholder="URL gambar..."
                                />
                                {canEditField('canEditImages') && (
                                  <>
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
                                  </>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Add Image URL / File input */}
                          {canEditField('canEditImages') && (editingProduct.images?.length || 0) < 5 && (
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
                          <label className="font-semibold text-slate-300 block mb-1">
                            Deskripsi Produk {!canEditField('canEditDescription') && <span className="text-amber-400 text-[10px] font-normal">(Terkunci Superadmin)</span>}
                          </label>
                          <textarea
                            rows={3}
                            disabled={!canEditField('canEditDescription')}
                            value={editingProduct.description}
                            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                            className={`w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white ${
                              !canEditField('canEditDescription') ? 'opacity-60 cursor-not-allowed bg-slate-950' : ''
                            }`}
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
                            if (appwriteService.isConfigured(settings.appwriteConfig)) {
                              appwriteService.saveProduct(settings.appwriteConfig, editingProduct).catch(() => {});
                            }
                            setEditingProduct(null);
                            setIsCreatingProduct(false);
                            showSuccessFeedback('Produk berhasil disimpan!');
                          }}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                        >
                          <Save className="w-4 h-4" />
                          Simpan Perubahan Produk
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
                            <th className="p-3">Packing</th>
                            <th className="p-3">Status Stok</th>
                            <th className="p-3">Favorit #</th>
                            <th className="p-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {products
                            .filter((p) => {
                              // Filter based on selected stock filter
                              if (productStockFilter === 'low') {
                                const num = typeof p.stockCount === 'number' ? p.stockCount : Number(p.stockCount);
                                if (p.stockCount === null || p.stockCount === undefined || (p.stockCount as unknown) === '') return false;
                                const threshold = settings.lowStockThreshold || 20;
                                if (isNaN(num) || num <= 0 || num > threshold) return false;
                              } else if (productStockFilter === 'unspecified') {
                                if (p.stockCount !== null && p.stockCount !== undefined && (p.stockCount as unknown) !== '') {
                                  const num = typeof p.stockCount === 'number' ? p.stockCount : Number(p.stockCount);
                                  if (!isNaN(num) && num > 0) return false;
                                }
                              } else if (productStockFilter === 'available') {
                                if (p.stockCount === null || p.stockCount === undefined || (p.stockCount as unknown) === '') return false;
                                const num = typeof p.stockCount === 'number' ? p.stockCount : Number(p.stockCount);
                                const threshold = settings.lowStockThreshold || 20;
                                if (isNaN(num) || num <= threshold) return false;
                              } else if (productStockFilter === 'favorite') {
                                if (!p.isFavoriteMonthRank) return false;
                              }

                              // Search query filter
                              if (!productSearchQuery.trim()) return true;
                              const q = productSearchQuery.toLowerCase().trim();
                              return (
                                p.name.toLowerCase().includes(q) ||
                                p.brand.toLowerCase().includes(q) ||
                                p.category.toLowerCase().includes(q) ||
                                p.type.toLowerCase().includes(q)
                              );
                            })
                            .map((p) => {
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
                                    {p.packingQuantity && p.packingUnit ? (
                                      <span className="text-[11px] font-semibold text-amber-300">
                                        {p.packingQuantity} {p.packingUnit}
                                      </span>
                                    ) : (
                                      <span className="text-slate-500">-</span>
                                    )}
                                  </td>
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
                                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 text-[11px]"
                                        title={isAdminPartial ? 'Edit Stok & Harga' : 'Edit Produk Lengkap'}
                                      >
                                        <Edit className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>{isAdminPartial ? 'Edit Stok' : 'Edit'}</span>
                                      </button>
                                      {(isAdminFull || canEditField('canDeleteProduct')) && (
                                        <button
                                          onClick={() => {
                                            if (confirm(`Hapus produk "${p.name}"?`)) {
                                              const updated = storage.deleteProduct(p.id);
                                              setProducts(updated);
                                              if (appwriteService.isConfigured(settings.appwriteConfig)) {
                                                appwriteService.deleteProduct(settings.appwriteConfig, p.id).catch(() => {});
                                              }
                                              showSuccessFeedback('Produk dihapus.');
                                            }
                                          }}
                                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-rose-400"
                                          title="Hapus Produk"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
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

              {/* CSV Import Modal */}
              {isImportModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-2xl text-slate-200 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                        Import Data Produk (Google Sheets / CSV)
                      </h3>
                      <button
                        onClick={() => setIsImportModalOpen(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="text-xs text-slate-300 space-y-2">
                      <p>
                        Anda dapat mengupload file <strong>.csv</strong> atau menempelkan (paste) data CSV langsung dari <strong>Google Sheets / Excel</strong>.
                      </p>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                        Format kolom didukung: <code>ID, Nama Produk, Merk, Kategori, Tipe, Harga Normal, Harga Diskon, Jumlah Stok, Jumlah Packing, Satuan Packing, Produk Terbaru, Peringkat Favorit, URL Gambar Utama, Deskripsi Produk</code>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-white">Upload File CSV:</label>
                        <input
                          type="file"
                          accept=".csv"
                          ref={fileInputRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const text = event.target?.result as string;
                                setImportCsvText(text);
                              };
                              reader.readAsText(file);
                            }
                          }}
                          className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white hover:file:bg-emerald-600 cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-white block mb-1">
                          Atau Tempel (Paste) Teks CSV di bawah ini:
                        </label>
                        <textarea
                          rows={6}
                          value={importCsvText}
                          onChange={(e) => setImportCsvText(e.target.value)}
                          placeholder="Paste baris CSV dari Google Sheets atau file di sini..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-white block mb-1">Metode Penggabungan:</label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="importMode"
                              checked={importMode === 'merge'}
                              onChange={() => setImportMode('merge')}
                              className="text-emerald-500"
                            />
                            <span>Gabungkan / Update Produk (Merge & Update)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="importMode"
                              checked={importMode === 'replace'}
                              onChange={() => setImportMode('replace')}
                              className="text-emerald-500"
                            />
                            <span>Ganti Seluruh Produk (Replace All)</span>
                          </label>
                        </div>
                      </div>

                      {importError && (
                        <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                          {importError}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
                      <button
                        type="button"
                        onClick={() => setIsImportModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!importCsvText.trim()) {
                            setImportError('Silakan pilih file atau tempelkan teks CSV terlebih dahulu.');
                            return;
                          }
                          try {
                            const parsed = parseProductsCSV(importCsvText) as Product[];
                            if (parsed.length === 0) {
                              setImportError('Tidak ada data produk yang berhasil dibaca dari CSV. Periksa format kolom.');
                              return;
                            }

                            let updatedList: Product[];
                            if (importMode === 'replace') {
                              updatedList = parsed;
                            } else {
                              const existingMap = new Map<string, Product>();
                              products.forEach((p) => existingMap.set(p.id, p));
                              parsed.forEach((p) => existingMap.set(p.id, p));
                              updatedList = Array.from(existingMap.values());
                            }

                            storage.saveProducts(updatedList);
                            setProducts(updatedList);
                            if (appwriteService.isConfigured(settings.appwriteConfig)) {
                              appwriteService.pushAllProductsToAppwrite(settings.appwriteConfig, updatedList).catch(() => {});
                            }
                            setIsImportModalOpen(false);
                            showSuccessFeedback(`Berhasil mengimpor ${parsed.length} data produk dan disinkronkan!`);
                          } catch (err: any) {
                            setImportError(`Gagal membaca CSV: ${err.message || 'Format tidak valid'}`);
                          }
                        }}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Proses Import Data
                      </button>
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
                        Kelola kategori utama, urutkan posisi (naik/turun), edit logo/deskripsi, dan hapus kategori.
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
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-400" />
                        {isCreatingCategory ? 'Tambah Kategori Baru' : `Edit Kategori: ${editingCategory.name}`}
                      </h3>
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
                          <label className="font-semibold text-slate-300 block mb-1">Logo / Gambar Kategori (URL atau Upload)</label>
                          <input
                            type="text"
                            value={editingCategory.logoUrl || ''}
                            onChange={(e) => setEditingCategory({ ...editingCategory, logoUrl: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white mb-2"
                            placeholder="URL gambar..."
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  setEditingCategory({
                                    ...editingCategory,
                                    logoUrl: reader.result as string,
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white hover:file:bg-emerald-600 cursor-pointer"
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
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(null);
                            setIsCreatingCategory(false);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-700 text-slate-300 font-medium"
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
                            setIsCreatingCategory(false);
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
                    {categories.map((c, index) => (
                      <div
                        key={c.id}
                        className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-slate-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <img
                            src={c.logoUrl || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200'}
                            alt={c.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-600 shrink-0 bg-slate-900"
                          />
                          <div className="min-w-0">
                            <strong className="text-white text-xs block truncate">{c.name}</strong>
                            <span className="text-[10px] text-slate-400 line-clamp-1">{c.description}</span>
                          </div>
                        </div>

                        {/* Reorder & Action Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            disabled={index === 0}
                            onClick={() => {
                              if (index === 0) return;
                              const next = [...categories];
                              const temp = next[index - 1];
                              next[index - 1] = next[index];
                              next[index] = temp;
                              storage.saveCategories(next);
                              setCategories(next);
                              showSuccessFeedback(`Posisi "${c.name}" dipindahkan ke atas.`);
                            }}
                            className={`p-1.5 rounded-lg ${
                              index === 0
                                ? 'text-slate-600 cursor-not-allowed'
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                            }`}
                            title="Geser ke Atas"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={index === categories.length - 1}
                            onClick={() => {
                              if (index === categories.length - 1) return;
                              const next = [...categories];
                              const temp = next[index + 1];
                              next[index + 1] = next[index];
                              next[index] = temp;
                              storage.saveCategories(next);
                              setCategories(next);
                              showSuccessFeedback(`Posisi "${c.name}" dipindahkan ke bawah.`);
                            }}
                            className={`p-1.5 rounded-lg ${
                              index === categories.length - 1
                                ? 'text-slate-600 cursor-not-allowed'
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                            }`}
                            title="Geser ke Bawah"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingCategory(c);
                              setIsCreatingCategory(false);
                            }}
                            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus kategori "${c.name}"?`)) {
                                const updated = storage.deleteCategory(c.id);
                                setCategories(updated);
                                showSuccessFeedback('Kategori dihapus.');
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-700 hover:bg-rose-900/50 text-rose-400"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. KELOLA MERK DAGANG */}
              {activeTab === 'brands' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">Kelola Merk Dagang</h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Tambah, ubah nama, deskripsi, logo, atau hapus merk produk toko secara manual.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingBrand({
                          id: `brand-${Date.now()}`,
                          name: '',
                          slug: '',
                          description: '',
                          logoUrl: '',
                        });
                        setIsCreatingBrand(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Merk Baru
                    </button>
                  </div>

                  {editingBrand && (
                    <div className="p-6 rounded-3xl bg-slate-800 border-2 border-emerald-500/50 shadow-xl space-y-4 text-xs">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-400" />
                        {isCreatingBrand ? 'Tambah Merk Baru' : `Edit Merk: ${editingBrand.name}`}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">Nama Merk</label>
                          <input
                            type="text"
                            value={editingBrand.name}
                            onChange={(e) =>
                              setEditingBrand({
                                ...editingBrand,
                                name: e.target.value,
                                slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                            placeholder="Contoh: Philips, Panasonic, Broco"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">Logo / Gambar Merk (URL)</label>
                          <input
                            type="text"
                            value={editingBrand.logoUrl || ''}
                            onChange={(e) => setEditingBrand({ ...editingBrand, logoUrl: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                            placeholder="https://..."
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="font-semibold text-slate-300 block mb-1">Deskripsi Merk</label>
                          <input
                            type="text"
                            value={editingBrand.description || ''}
                            onChange={(e) => setEditingBrand({ ...editingBrand, description: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                            placeholder="Deskripsi keunggulan merk..."
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBrand(null);
                            setIsCreatingBrand(false);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-700 text-slate-300 font-medium"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!editingBrand.name.trim()) return;
                            const updated = storage.saveBrand(editingBrand);
                            setBrands(updated);
                            setEditingBrand(null);
                            setIsCreatingBrand(false);
                            showSuccessFeedback('Merk berhasil disimpan!');
                          }}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold"
                        >
                          Simpan Merk
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {brands.map((b) => (
                      <div key={b.id} className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <strong className="text-white text-sm block truncate">{b.name}</strong>
                          <span className="text-xs text-slate-400 line-clamp-1">{b.description || 'Tidak ada deskripsi'}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setEditingBrand(b);
                              setIsCreatingBrand(false);
                            }}
                            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
                            title="Edit Merk"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus merk "${b.name}"?`)) {
                                const updated = storage.deleteBrand(b.id);
                                setBrands(updated);
                                showSuccessFeedback('Merk dihapus.');
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-700 hover:bg-rose-900/50 text-rose-400"
                            title="Hapus Merk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. KELOLA TIPE PRODUK */}
              {activeTab === 'types' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">Kelola Tipe Produk</h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Tambah, edit kategori terkait, atau hapus tipe produk secara manual.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingProductType({
                          id: `type-${Date.now()}`,
                          name: '',
                          slug: '',
                          categoryName: categories[0]?.name || 'PHILIPS LED',
                          description: '',
                        });
                        setIsCreatingProductType(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Tipe Baru
                    </button>
                  </div>

                  {editingProductType && (
                    <div className="p-6 rounded-3xl bg-slate-800 border-2 border-emerald-500/50 shadow-xl space-y-4 text-xs">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-400" />
                        {isCreatingProductType ? 'Tambah Tipe Baru' : `Edit Tipe: ${editingProductType.name}`}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">Nama Tipe Produk</label>
                          <input
                            type="text"
                            value={editingProductType.name}
                            onChange={(e) =>
                              setEditingProductType({
                                ...editingProductType,
                                name: e.target.value,
                                slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                            placeholder="Contoh: Bohlam LED, Saklar Seri, Bor Listrik"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">Kategori Terkait</label>
                          <select
                            value={editingProductType.categoryName}
                            onChange={(e) => setEditingProductType({ ...editingProductType, categoryName: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="font-semibold text-slate-300 block mb-1">Deskripsi Tipe (Opsional)</label>
                          <input
                            type="text"
                            value={editingProductType.description || ''}
                            onChange={(e) => setEditingProductType({ ...editingProductType, description: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                            placeholder="Keterangan spesifik jenis tipe..."
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProductType(null);
                            setIsCreatingProductType(false);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-700 text-slate-300 font-medium"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!editingProductType.name.trim()) return;
                            const updated = storage.saveProductType(editingProductType);
                            setProductTypes(updated);
                            setEditingProductType(null);
                            setIsCreatingProductType(false);
                            showSuccessFeedback('Tipe produk berhasil disimpan!');
                          }}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold"
                        >
                          Simpan Tipe
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {productTypes.map((t) => (
                      <div key={t.id} className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <strong className="text-white text-xs block truncate">{t.name}</strong>
                          <span className="text-[10px] text-emerald-400 block">{t.categoryName}</span>
                          {t.description && <span className="text-[10px] text-slate-400 line-clamp-1">{t.description}</span>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setEditingProductType(t);
                              setIsCreatingProductType(false);
                            }}
                            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
                            title="Edit Tipe"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus tipe "${t.name}"?`)) {
                                const updated = storage.deleteProductType(t.id);
                                setProductTypes(updated);
                                showSuccessFeedback('Tipe produk dihapus.');
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-700 hover:bg-rose-900/50 text-rose-400"
                            title="Hapus Tipe"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                        <label className="font-semibold text-slate-300 block mb-1">
                          Batas Peringatan Stok Minimum (&le; Unit)
                        </label>
                        <input
                          type="number"
                          value={settings.lowStockThreshold || 20}
                          onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) || 20 })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-bold"
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

              {/* KELOLA USER ADMIN (MANAGER ONLY) */}
              {activeTab === 'adminUsers' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-amber-400" />
                        Kelola Akun & Hak Akses Admin
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Khusus Manager: Daftarkan username, password, dan tentukan pembatasan akses editing (Admin Penuh vs Admin Terbatas).
                      </p>
                    </div>
                  </div>

                  {adminUserSuccess && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                      {adminUserSuccess}
                    </div>
                  )}

                  {adminUserError && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                      {adminUserError}
                    </div>
                  )}

                  {/* Form Create New Admin User */}
                  <div className="p-6 rounded-3xl bg-slate-800/90 border border-slate-700 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-emerald-400" />
                      Daftarkan User Admin Baru
                    </h3>
                    <form onSubmit={handleCreateAdminUser} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">Username Admin</label>
                          <input
                            type="text"
                            required
                            value={newAdminUsername}
                            onChange={(e) => setNewAdminUsername(e.target.value)}
                            placeholder="Contoh: staf_gudang"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">Nama Lengkap Admin</label>
                          <input
                            type="text"
                            required
                            value={newAdminFullName}
                            onChange={(e) => setNewAdminFullName(e.target.value)}
                            placeholder="Contoh: Budi Santoso"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">
                            Password (Min 8 karakter, 1 Huruf Kapital)
                          </label>
                          <input
                            type="password"
                            required
                            value={newAdminPassword}
                            onChange={(e) => setNewAdminPassword(e.target.value)}
                            placeholder="Contoh: Gudang2026"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">
                            Tingkat Otorisasi / Hak Akses
                          </label>
                          <select
                            value={newAdminRole}
                            onChange={(e) => setNewAdminRole(e.target.value as 'manager' | 'admin_full' | 'admin_partial')}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                          >
                            <option value="admin_partial">
                              Admin Terbatas (Hanya Edit Harga, Diskon, Stok & Satuan Packing)
                            </option>
                            <option value="admin_full">
                              Admin Penuh (Dapat Menambah, Mengedit Seluruh Detail & Hapus Produk)
                            </option>
                            <option value="manager">
                              Manager (Akses Penuh Termasuk Kelola Admin & Halaman Utama)
                            </option>
                          </select>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 text-[11px] text-slate-400 space-y-1">
                        <strong className="text-white block">Penjelasan Pembatasan Akses:</strong>
                        <p>&bull; <span className="text-amber-300 font-semibold">Admin Terbatas:</span> Dapat dikonfigurasi fleksibel per bidang (Nama, Merk, Kategori, Foto, Tambah/Hapus Produk, dll). Selalu dapat mengubah Harga & Stok.</p>
                        <p>&bull; <span className="text-emerald-300 font-semibold">Admin Penuh:</span> Dapat mengelola seluruh katalog produk, import CSV, kategori, merk, dan tipe secara penuh.</p>
                      </div>

                      {/* Granular Permissions Configurator for New Admin (when admin_partial is selected) */}
                      {newAdminRole === 'admin_partial' && (
                        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                            <div>
                              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                                <Sliders className="w-4 h-4 text-amber-400" />
                                Konfigurasi Izin Khusus Admin Terbatas (Opsional per Bidang)
                              </h4>
                              <p className="text-[11px] text-slate-400">
                                Centang bidang / fitur yang diizinkan untuk diedit oleh admin ini. Bidang yang tidak dicentang akan otomatis terkunci.
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setNewAdminPermissions({
                                    canEditName: true,
                                    canEditBrand: true,
                                    canEditCategory: true,
                                    canEditType: true,
                                    canEditImages: true,
                                    canEditDescription: true,
                                    canEditFavoriteRank: true,
                                    canCreateProduct: true,
                                    canDeleteProduct: true,
                                    canImportCsv: true,
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold"
                              >
                                Aktifkan Semua
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setNewAdminPermissions({
                                    canEditName: false,
                                    canEditBrand: false,
                                    canEditCategory: false,
                                    canEditType: false,
                                    canEditImages: false,
                                    canEditDescription: false,
                                    canEditFavoriteRank: false,
                                    canCreateProduct: false,
                                    canDeleteProduct: false,
                                    canImportCsv: false,
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 text-[10px] font-bold"
                              >
                                Kunci Semua
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                                1. Bidang Data Inti Produk
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {[
                                  { key: 'canEditName', label: 'Nama Produk', desc: 'Izin ubah teks nama produk' },
                                  { key: 'canEditBrand', label: 'Merk (Brand)', desc: 'Izin ubah merk produk' },
                                  { key: 'canEditCategory', label: 'Kategori', desc: 'Izin ubah kategori produk' },
                                  { key: 'canEditType', label: 'Tipe Produk', desc: 'Izin ubah tipe / varian' },
                                  { key: 'canEditImages', label: 'Foto & Galeri Produk', desc: 'Izin upload / ganti foto' },
                                  { key: 'canEditDescription', label: 'Deskripsi Produk', desc: 'Izin ubah teks deskripsi' },
                                  { key: 'canEditFavoriteRank', label: 'Favorit Bulan Ini', desc: 'Izin atur rank 1 s/d 20' },
                                ].map((item) => {
                                  const k = item.key as keyof AdminPermissions;
                                  const active = Boolean(newAdminPermissions[k]);
                                  return (
                                    <button
                                      type="button"
                                      key={item.key}
                                      onClick={() =>
                                        setNewAdminPermissions((prev) => ({
                                          ...prev,
                                          [k]: !prev[k],
                                        }))
                                      }
                                      className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                                        active
                                          ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 shadow-sm'
                                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                                      }`}
                                    >
                                      <div
                                        className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                                          active ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600 bg-slate-900'
                                        }`}
                                      >
                                        {active && <Check className="w-3 h-3 stroke-[3]" />}
                                      </div>
                                      <div>
                                        <div className="font-bold text-xs text-white">{item.label}</div>
                                        <div className="text-[10px] text-slate-400 leading-snug">{item.desc}</div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                                2. Aksi & Operasi Katalog
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {[
                                  { key: 'canCreateProduct', label: 'Tambah Produk Baru', desc: 'Izin buat produk baru' },
                                  { key: 'canDeleteProduct', label: 'Hapus Produk', desc: 'Izin hapus produk' },
                                  { key: 'canImportCsv', label: 'Import CSV / Sheets', desc: 'Izin import CSV massal' },
                                ].map((item) => {
                                  const k = item.key as keyof AdminPermissions;
                                  const active = Boolean(newAdminPermissions[k]);
                                  return (
                                    <button
                                      type="button"
                                      key={item.key}
                                      onClick={() =>
                                        setNewAdminPermissions((prev) => ({
                                          ...prev,
                                          [k]: !prev[k],
                                        }))
                                      }
                                      className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                                        active
                                          ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 shadow-sm'
                                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                                      }`}
                                    >
                                      <div
                                        className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                                          active ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600 bg-slate-900'
                                        }`}
                                      >
                                        {active && <Check className="w-3 h-3 stroke-[3]" />}
                                      </div>
                                      <div>
                                        <div className="font-bold text-xs text-white">{item.label}</div>
                                        <div className="text-[10px] text-slate-400 leading-snug">{item.desc}</div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>
                              <strong>Catatan:</strong> Bidang <em>Harga Normal</em>, <em>Harga Diskon</em>, <em>Jumlah Stok Barang</em>, dan <em>Satuan Packing Grosir</em> selalu aktif untuk diedit oleh semua admin.
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-md"
                        >
                          <UserPlus className="w-4 h-4" />
                          Daftarkan Akun Admin
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Edit Admin Modal Form */}
                  {editingAdminUser && (
                    <div className="p-6 rounded-3xl bg-slate-800 border-2 border-amber-500/50 shadow-xl space-y-4 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-amber-400" />
                          Edit Hak Akses Admin: @{editingAdminUser.username} ({editingAdminUser.fullName})
                        </h3>
                        <button
                          type="button"
                          onClick={() => setEditingAdminUser(null)}
                          className="text-slate-400 hover:text-white"
                        >
                          Batal
                        </button>
                      </div>

                      <form onSubmit={handleUpdateAdminUser} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="font-semibold text-slate-300 block mb-1">
                              Ubah Tingkat Otorisasi
                            </label>
                            <select
                              value={editAdminRole}
                              onChange={(e) => setEditAdminRole(e.target.value as 'manager' | 'admin_full' | 'admin_partial')}
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                            >
                              <option value="admin_partial">
                                Admin Terbatas (Konfigurasi Fleksibel per Bidang)
                              </option>
                              <option value="admin_full">
                                Admin Penuh (Edit Seluruh Detail & Hapus Produk)
                              </option>
                              <option value="manager">
                                Manager (Akses Penuh Termasuk Kelola Admin & Halaman Utama)
                              </option>
                            </select>
                          </div>

                          <div>
                            <label className="font-semibold text-slate-300 block mb-1">
                              Reset Password (Opsional)
                            </label>
                            <input
                              type="password"
                              value={editAdminPassword}
                              onChange={(e) => setEditAdminPassword(e.target.value)}
                              placeholder="Biarkan kosong jika tidak ingin mengubah password"
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                            />
                          </div>
                        </div>

                        {/* Granular Permissions Configurator for Editing Admin User (when admin_partial) */}
                        {editAdminRole === 'admin_partial' && (
                          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                              <div>
                                <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                                  <Sliders className="w-4 h-4 text-amber-400" />
                                  Konfigurasi Izin Khusus Admin Terbatas
                                </h4>
                                <p className="text-[11px] text-slate-400">
                                  Centang bidang atau aksi yang diizinkan untuk admin @{editingAdminUser.username}.
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditAdminPermissions({
                                      canEditName: true,
                                      canEditBrand: true,
                                      canEditCategory: true,
                                      canEditType: true,
                                      canEditImages: true,
                                      canEditDescription: true,
                                      canEditFavoriteRank: true,
                                      canCreateProduct: true,
                                      canDeleteProduct: true,
                                      canImportCsv: true,
                                    })
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold"
                                >
                                  Aktifkan Semua
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditAdminPermissions({
                                      canEditName: false,
                                      canEditBrand: false,
                                      canEditCategory: false,
                                      canEditType: false,
                                      canEditImages: false,
                                      canEditDescription: false,
                                      canEditFavoriteRank: false,
                                      canCreateProduct: false,
                                      canDeleteProduct: false,
                                      canImportCsv: false,
                                    })
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 text-[10px] font-bold"
                                >
                                  Kunci Semua
                                </button>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                                  1. Bidang Data Inti Produk
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {[
                                    { key: 'canEditName', label: 'Nama Produk', desc: 'Izin ubah teks nama produk' },
                                    { key: 'canEditBrand', label: 'Merk (Brand)', desc: 'Izin ubah merk produk' },
                                    { key: 'canEditCategory', label: 'Kategori', desc: 'Izin ubah kategori produk' },
                                    { key: 'canEditType', label: 'Tipe Produk', desc: 'Izin ubah tipe / varian' },
                                    { key: 'canEditImages', label: 'Foto & Galeri Produk', desc: 'Izin upload / ganti foto' },
                                    { key: 'canEditDescription', label: 'Deskripsi Produk', desc: 'Izin ubah teks deskripsi' },
                                    { key: 'canEditFavoriteRank', label: 'Favorit Bulan Ini', desc: 'Izin atur rank 1 s/d 20' },
                                  ].map((item) => {
                                    const k = item.key as keyof AdminPermissions;
                                    const active = Boolean(editAdminPermissions[k]);
                                    return (
                                      <button
                                        type="button"
                                        key={item.key}
                                        onClick={() =>
                                          setEditAdminPermissions((prev) => ({
                                            ...prev,
                                            [k]: !prev[k],
                                          }))
                                        }
                                        className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                                          active
                                            ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 shadow-sm'
                                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                      >
                                        <div
                                          className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                                            active ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600 bg-slate-900'
                                          }`}
                                        >
                                          {active && <Check className="w-3 h-3 stroke-[3]" />}
                                        </div>
                                        <div>
                                          <div className="font-bold text-xs text-white">{item.label}</div>
                                          <div className="text-[10px] text-slate-400 leading-snug">{item.desc}</div>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                                  2. Aksi & Operasi Katalog
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {[
                                    { key: 'canCreateProduct', label: 'Tambah Produk Baru', desc: 'Izin buat produk baru' },
                                    { key: 'canDeleteProduct', label: 'Hapus Produk', desc: 'Izin hapus produk' },
                                    { key: 'canImportCsv', label: 'Import CSV / Sheets', desc: 'Izin import CSV massal' },
                                  ].map((item) => {
                                    const k = item.key as keyof AdminPermissions;
                                    const active = Boolean(editAdminPermissions[k]);
                                    return (
                                      <button
                                        type="button"
                                        key={item.key}
                                        onClick={() =>
                                          setEditAdminPermissions((prev) => ({
                                            ...prev,
                                            [k]: !prev[k],
                                          }))
                                        }
                                        className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                                          active
                                            ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 shadow-sm'
                                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                      >
                                        <div
                                          className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                                            active ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600 bg-slate-900'
                                          }`}
                                        >
                                          {active && <Check className="w-3 h-3 stroke-[3]" />}
                                        </div>
                                        <div>
                                          <div className="font-bold text-xs text-white">{item.label}</div>
                                          <div className="text-[10px] text-slate-400 leading-snug">{item.desc}</div>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>
                                <strong>Catatan:</strong> Bidang <em>Harga Normal</em>, <em>Harga Diskon</em>, <em>Jumlah Stok Barang</em>, dan <em>Satuan Packing Grosir</em> selalu aktif untuk diedit oleh semua admin.
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
                          <button
                            type="button"
                            onClick={() => setEditingAdminUser(null)}
                            className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 font-semibold"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
                          >
                            Simpan Perubahan Hak Akses
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* List of Registered Admin Accounts */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white">Daftar Akun Admin Terdaftar</h3>
                    <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/70">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-800/80 text-slate-200 uppercase text-[10px] font-bold">
                          <tr>
                            <th className="p-3">Username & Nama</th>
                            <th className="p-3">Peran / Hak Akses</th>
                            <th className="p-3">Batasan Editing</th>
                            <th className="p-3">Terakhir Login</th>
                            <th className="p-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {adminUsersList.map((usr) => (
                            <tr key={usr.id} className="hover:bg-slate-800/40">
                              <td className="p-3">
                                <div className="font-bold text-white">{usr.fullName}</div>
                                <span className="text-[10px] text-slate-400 font-mono">@{usr.username}</span>
                              </td>
                              <td className="p-3">
                                {usr.role === 'manager' && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                                    Manager (Superadmin)
                                  </span>
                                )}
                                {usr.role === 'admin_full' && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                                    Admin Penuh (Full)
                                  </span>
                                )}
                                {usr.role === 'admin_partial' && (
                                  <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold text-[10px] border border-sky-500/30">
                                    Admin Terbatas (Partial)
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-[11px]">
                                {usr.role === 'admin_partial' ? (
                                  <div className="space-y-1">
                                    <div className="text-amber-300 font-semibold text-[11px]">
                                      Admin Terbatas (Kustom)
                                    </div>
                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                      <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[9px] font-medium">
                                        Harga & Stok
                                      </span>
                                      {usr.permissions?.canEditName && (
                                        <span className="px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-500/30 text-[9px]">
                                          Nama
                                        </span>
                                      )}
                                      {usr.permissions?.canEditBrand && (
                                        <span className="px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-500/30 text-[9px]">
                                          Merk
                                        </span>
                                      )}
                                      {usr.permissions?.canEditCategory && (
                                        <span className="px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-500/30 text-[9px]">
                                          Kategori
                                        </span>
                                      )}
                                      {usr.permissions?.canEditType && (
                                        <span className="px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-500/30 text-[9px]">
                                          Tipe
                                        </span>
                                      )}
                                      {usr.permissions?.canEditImages && (
                                        <span className="px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-500/30 text-[9px]">
                                          Foto
                                        </span>
                                      )}
                                      {usr.permissions?.canEditDescription && (
                                        <span className="px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-500/30 text-[9px]">
                                          Deskripsi
                                        </span>
                                      )}
                                      {usr.permissions?.canCreateProduct && (
                                        <span className="px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30 text-[9px]">
                                          + Tambah
                                        </span>
                                      )}
                                      {usr.permissions?.canDeleteProduct && (
                                        <span className="px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/30 text-[9px]">
                                          - Hapus
                                        </span>
                                      )}
                                      {usr.permissions?.canImportCsv && (
                                        <span className="px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 text-[9px]">
                                          CSV
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-emerald-400 font-medium">
                                    Akses Seluruh Detail & Aksi
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-[10px] text-slate-400">
                                {usr.lastLogin ? new Date(usr.lastLogin).toLocaleString('id-ID') : 'Belum pernah'}
                              </td>
                              <td className="p-3 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      setEditingAdminUser(usr);
                                      setEditAdminRole(usr.role);
                                      setEditAdminPassword('');
                                      setEditAdminPermissions(
                                        usr.permissions || {
                                          canEditName: false,
                                          canEditBrand: false,
                                          canEditCategory: false,
                                          canEditType: false,
                                          canEditImages: false,
                                          canEditDescription: false,
                                          canEditFavoriteRank: false,
                                          canCreateProduct: false,
                                          canDeleteProduct: false,
                                          canImportCsv: false,
                                        }
                                      );
                                    }}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                                    title="Edit Hak Akses / Reset Password"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  {usr.username !== 'admin' && usr.username !== currentAdmin.username && (
                                    <button
                                      onClick={() => handleDeleteAdminUser(usr.id, usr.fullName)}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-rose-400"
                                      title="Hapus Akun Admin"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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

              {/* 9. APPWRITE BACKEND CONFIGURATION & REALTIME SYNC */}
              {activeTab === 'appwrite' && (
                <div className="space-y-6 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Database className="w-5 h-5 text-rose-400" />
                        Sinkronisasi Database & Realtime Appwrite
                      </h2>
                      <p className="text-slate-400 mt-1">
                        Hubungkan database Appwrite untuk sinkronisasi cloud realtime dua arah langsung melalui aplikasi.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                        Realtime Listener Siap
                      </span>
                    </div>
                  </div>

                  {/* Status & Jawaban Realtime Card */}
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs space-y-2">
                    <div className="font-bold text-white flex items-center gap-1.5 text-sm">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      Status Sinkronisasi & Realtime Database:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      <li>
                        <strong className="text-white">Realtime Aktif:</strong> Setiap kali Anda mengupdate collection di Appwrite atau sebaliknya, perubahan pada aplikasi saat ini <strong>langsung realtime terupdate</strong> tanpa perlu me-refresh halaman.
                      </li>
                      <li>
                        <strong className="text-white">Impor & Ekspor Langsung di Aplikasi:</strong> Anda <strong>tidak perlu membuka konsol Appwrite manual</strong>. Anda bisa langsung melakukan Impor CSV, Tambah Produk, Edit Stok & Harga, atau Hapus Produk langsung dari panel Admin ini — semua perubahan akan otomatis di-sync ke database Appwrite!
                      </li>
                    </ul>
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

                  {/* Appwrite Settings Box */}
                  <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="font-bold text-white text-sm flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Kredensial Koneksi Appwrite
                      </h3>

                      <label className="flex items-center gap-2 cursor-pointer bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
                        <input
                          type="checkbox"
                          checked={settings.appwriteConfig?.isEnabled === true}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              appwriteConfig: { ...settings.appwriteConfig, isEnabled: e.target.checked },
                            })
                          }
                          className="rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-600"
                        />
                        <span className="text-xs font-bold text-slate-200">
                          {settings.appwriteConfig?.isEnabled ? '🟢 Realtime Cloud Aktif' : '⚪ Mode Offline / Standalone'}
                        </span>
                      </label>
                    </div>

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
                          placeholder="Masukkan Project ID Appwrite Anda"
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
                          placeholder="default"
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
                          placeholder="products"
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

                  {/* Push & Pull Actions */}
                  <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 space-y-4">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-sky-400" />
                      Sinkronisasi Massal (Bulk Push & Pull Sync)
                    </h3>
                    <p className="text-slate-400 text-xs">
                      Gunakan tombol di bawah ini untuk mengunggah semua produk lokal ke database Appwrite atau menarik data terbaru dari Appwrite ke dalam aplikasi.
                    </p>

                    {appwritePushProgress && (
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-700 font-mono text-xs text-amber-300">
                        {appwritePushProgress}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        disabled={appwritePushing}
                        onClick={async () => {
                          if (!confirm(`Unggah ${products.length} produk lokal saat ini ke database Appwrite?`)) return;
                          setAppwritePushing(true);
                          setAppwritePushProgress('Memulai pengunggahan massal...');
                          const res = await appwriteService.pushAllProductsToAppwrite(
                            settings.appwriteConfig,
                            products,
                            (curr, total) => {
                              setAppwritePushProgress(`Mengunggah produk: ${curr} dari ${total} (${Math.round((curr / total) * 100)}%)`);
                            }
                          );
                          setAppwritePushing(false);
                          if (res.success) {
                            showSuccessFeedback(`Berhasil menyinkronkan ${res.count} produk ke Appwrite!`);
                            setAppwritePushProgress(`Selesai! Berhasil mengunggah ${res.count} produk.`);
                          } else {
                            setAppwritePushProgress(`Gagal: ${res.error}`);
                          }
                        }}
                        className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-2 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${appwritePushing ? 'animate-spin' : ''}`} />
                        {appwritePushing ? 'Mengunggah ke Appwrite...' : `Unggah Semua (${products.length}) Produk ke Appwrite`}
                      </button>

                      <button
                        type="button"
                        disabled={appwritePulling}
                        onClick={async () => {
                          setAppwritePulling(true);
                          try {
                            const res = await appwriteService.fetchAllProducts(settings.appwriteConfig);
                            if (res.success && res.products && res.products.length > 0) {
                              storage.saveProducts(res.products);
                              setProducts(res.products);
                              showSuccessFeedback(`Berhasil menarik ${res.products.length} produk dari Appwrite!`);
                            } else if (res.success && res.products && res.products.length === 0) {
                              alert('Tidak ditemukan dokumen produk pada koleksi Appwrite.');
                            } else {
                              alert(`Gagal mengambil data dari Appwrite: ${res.error || 'Terjadi kesalahan'}`);
                            }
                          } catch (err: any) {
                            alert(`Gagal mengambil data dari Appwrite: ${err.message}`);
                          } finally {
                            setAppwritePulling(false);
                          }
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center gap-2 disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        {appwritePulling ? 'Menarik Data...' : 'Tarik Data Produk dari Appwrite ke Aplikasi'}
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
