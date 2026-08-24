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
  AdminPermissions,
  CartItem,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_BRANDS,
  INITIAL_PRODUCT_TYPES,
  INITIAL_PRODUCTS,
  INITIAL_INFO_TRENDS,
  INITIAL_GALLERY_MEDIA,
  INITIAL_CUSTOM_FEATURES,
  INITIAL_STORE_SETTINGS,
} from '../data/initialData';

const STORAGE_KEYS = {
  PRODUCTS: 'solusirumahku_products_v1',
  CATEGORIES: 'solusirumahku_categories_v1',
  BRANDS: 'solusirumahku_brands_v1',
  TYPES: 'solusirumahku_types_v1',
  INFO_TRENDS: 'solusirumahku_info_trends_v1',
  GALLERY: 'solusirumahku_gallery_v1',
  CUSTOM_FEATURES: 'solusirumahku_custom_features_v1',
  SETTINGS: 'solusirumahku_settings_v1',
  ADMIN_USERS: 'solusirumahku_admin_users_v1',
  CURRENT_ADMIN: 'solusirumahku_current_admin_v1',
  ADMIN_PASSWORDS: 'solusirumahku_admin_passwords_v1',
};

// Manager access code required before registration
export const MANAGER_ACCESS_CODE = 'dear2226';

// Password validator: Min 8 chars, combination of letters & digits, at least 1 uppercase letter
export function validateAdminPassword(password: string): { isValid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password wajib minimal 8 karakter.' };
  }
  const hasUppercase = /[A-Z]/.test(password);
  if (!hasUppercase) {
    return { isValid: false, message: 'Password wajib memiliki minimal 1 huruf kapital (huruf besar).' };
  }
  const hasLowercaseOrDigit = /[a-z]/.test(password) && /\d/.test(password);
  if (!hasLowercaseOrDigit) {
    return { isValid: false, message: 'Password wajib kombinasi huruf dan angka (termasuk huruf kecil & angka).' };
  }
  return { isValid: true };
}

class StorageService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage write error (quota exceeded or private mode):', e);
    }
  }

  // --- Products ---
  getProducts(): Product[] {
    return this.get<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  saveProducts(products: Product[]): void {
    this.set(STORAGE_KEYS.PRODUCTS, products);
  }

  saveProduct(product: Product): Product[] {
    const list = this.getProducts();
    const index = list.findIndex((p) => p.id === product.id);
    let updated: Product[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...product, updatedAt: new Date().toISOString() };
    } else {
      updated = [
        {
          ...product,
          id: product.id || `prod-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...list,
      ];
    }
    this.saveProducts(updated);
    return updated;
  }

  deleteProduct(id: string): Product[] {
    const list = this.getProducts();
    const updated = list.filter((p) => p.id !== id);
    this.saveProducts(updated);
    return updated;
  }

  // --- Categories ---
  getCategories(): CategoryItem[] {
    return this.get<CategoryItem[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }

  saveCategories(categories: CategoryItem[]): void {
    this.set(STORAGE_KEYS.CATEGORIES, categories);
  }

  saveCategory(cat: CategoryItem): CategoryItem[] {
    const list = this.getCategories();
    const index = list.findIndex((c) => c.id === cat.id);
    let updated: CategoryItem[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = cat;
    } else {
      updated = [...list, { ...cat, id: cat.id || `cat-${Date.now()}` }];
    }
    this.saveCategories(updated);
    return updated;
  }

  deleteCategory(id: string): CategoryItem[] {
    const list = this.getCategories();
    const updated = list.filter((c) => c.id !== id);
    this.saveCategories(updated);
    return updated;
  }

  // --- Brands ---
  getBrands(): BrandItem[] {
    return this.get<BrandItem[]>(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
  }

  saveBrands(brands: BrandItem[]): void {
    this.set(STORAGE_KEYS.BRANDS, brands);
  }

  saveBrand(brand: BrandItem): BrandItem[] {
    const list = this.getBrands();
    const index = list.findIndex((b) => b.id === brand.id);
    let updated: BrandItem[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = brand;
    } else {
      updated = [...list, { ...brand, id: brand.id || `brand-${Date.now()}` }];
    }
    this.saveBrands(updated);
    return updated;
  }

  deleteBrand(id: string): BrandItem[] {
    const list = this.getBrands();
    const updated = list.filter((b) => b.id !== id);
    this.saveBrands(updated);
    return updated;
  }

  // --- Product Types ---
  getProductTypes(): ProductTypeItem[] {
    return this.get<ProductTypeItem[]>(STORAGE_KEYS.TYPES, INITIAL_PRODUCT_TYPES);
  }

  saveProductTypes(types: ProductTypeItem[]): void {
    this.set(STORAGE_KEYS.TYPES, types);
  }

  saveProductType(item: ProductTypeItem): ProductTypeItem[] {
    const list = this.getProductTypes();
    const index = list.findIndex((t) => t.id === item.id);
    let updated: ProductTypeItem[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = item;
    } else {
      updated = [...list, { ...item, id: item.id || `type-${Date.now()}` }];
    }
    this.saveProductTypes(updated);
    return updated;
  }

  deleteProductType(id: string): ProductTypeItem[] {
    const list = this.getProductTypes();
    const updated = list.filter((t) => t.id !== id);
    this.saveProductTypes(updated);
    return updated;
  }

  // --- Info & Trends ---
  getInfoTrends(): InfoTrendItem[] {
    return this.get<InfoTrendItem[]>(STORAGE_KEYS.INFO_TRENDS, INITIAL_INFO_TRENDS);
  }

  saveInfoTrends(items: InfoTrendItem[]): void {
    this.set(STORAGE_KEYS.INFO_TRENDS, items);
  }

  saveInfoTrend(item: InfoTrendItem): InfoTrendItem[] {
    const list = this.getInfoTrends();
    const index = list.findIndex((i) => i.id === item.id);
    let updated: InfoTrendItem[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = item;
    } else {
      updated = [{ ...item, id: item.id || `info-${Date.now()}` }, ...list];
    }
    this.saveInfoTrends(updated);
    return updated;
  }

  deleteInfoTrend(id: string): InfoTrendItem[] {
    const list = this.getInfoTrends();
    const updated = list.filter((i) => i.id !== id);
    this.saveInfoTrends(updated);
    return updated;
  }

  // --- Gallery Media ---
  getGalleryMedia(): GalleryMediaItem[] {
    return this.get<GalleryMediaItem[]>(STORAGE_KEYS.GALLERY, INITIAL_GALLERY_MEDIA);
  }

  saveGalleryMedia(items: GalleryMediaItem[]): void {
    this.set(STORAGE_KEYS.GALLERY, items);
  }

  saveGalleryItem(item: GalleryMediaItem): GalleryMediaItem[] {
    const list = this.getGalleryMedia();
    const index = list.findIndex((g) => g.id === item.id);
    let updated: GalleryMediaItem[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = item;
    } else {
      updated = [...list, { ...item, id: item.id || `gal-${Date.now()}` }];
    }
    this.saveGalleryMedia(updated);
    return updated;
  }

  deleteGalleryItem(id: string): GalleryMediaItem[] {
    const list = this.getGalleryMedia();
    const updated = list.filter((g) => g.id !== id);
    this.saveGalleryMedia(updated);
    return updated;
  }

  // --- Custom Manual Features ---
  getCustomFeatures(): CustomManualFeature[] {
    return this.get<CustomManualFeature[]>(STORAGE_KEYS.CUSTOM_FEATURES, INITIAL_CUSTOM_FEATURES);
  }

  saveCustomFeatures(features: CustomManualFeature[]): void {
    this.set(STORAGE_KEYS.CUSTOM_FEATURES, features);
  }

  saveCustomFeature(feature: CustomManualFeature): CustomManualFeature[] {
    const list = this.getCustomFeatures();
    const index = list.findIndex((f) => f.id === feature.id);
    let updated: CustomManualFeature[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = feature;
    } else {
      updated = [...list, { ...feature, id: feature.id || `feat-${Date.now()}` }];
    }
    this.saveCustomFeatures(updated);
    return updated;
  }

  deleteCustomFeature(id: string): CustomManualFeature[] {
    const list = this.getCustomFeatures();
    const updated = list.filter((f) => f.id !== id);
    this.saveCustomFeatures(updated);
    return updated;
  }

  // --- Settings ---
  getSettings(): StoreSettings {
    const raw = this.get<Partial<StoreSettings>>(STORAGE_KEYS.SETTINGS, INITIAL_STORE_SETTINGS);
    const rawAppwrite = raw.appwriteConfig || {} as Partial<StoreSettings['appwriteConfig']>;

    const merged: StoreSettings = {
      ...INITIAL_STORE_SETTINGS,
      ...raw,
      appwriteConfig: {
        endpoint: rawAppwrite.endpoint?.trim() || INITIAL_STORE_SETTINGS.appwriteConfig.endpoint,
        projectId:
          rawAppwrite.projectId &&
          rawAppwrite.projectId.trim() &&
          rawAppwrite.projectId !== 'solusi-rumahku-app' &&
          rawAppwrite.projectId !== 'your-project-id'
            ? rawAppwrite.projectId.trim()
            : INITIAL_STORE_SETTINGS.appwriteConfig.projectId,
        databaseId:
          rawAppwrite.databaseId && rawAppwrite.databaseId.trim()
            ? rawAppwrite.databaseId.trim()
            : INITIAL_STORE_SETTINGS.appwriteConfig.databaseId,
        productsCollectionId:
          rawAppwrite.productsCollectionId && rawAppwrite.productsCollectionId.trim()
            ? rawAppwrite.productsCollectionId.trim()
            : INITIAL_STORE_SETTINGS.appwriteConfig.productsCollectionId,
        infoCollectionId:
          rawAppwrite.infoCollectionId && rawAppwrite.infoCollectionId.trim()
            ? rawAppwrite.infoCollectionId.trim()
            : INITIAL_STORE_SETTINGS.appwriteConfig.infoCollectionId,
        bucketId: rawAppwrite.bucketId || '',
        isEnabled:
          rawAppwrite.isEnabled !== undefined
            ? Boolean(rawAppwrite.isEnabled)
            : INITIAL_STORE_SETTINGS.appwriteConfig.isEnabled,
      },
    };

    // Auto-inject Vite environment variables (e.g., from Netlify build / .env) if available
    try {
      const envEndpoint = (import.meta as any).env?.VITE_APPWRITE_ENDPOINT;
      const envProjectId = (import.meta as any).env?.VITE_APPWRITE_PROJECT_ID;
      const envDatabaseId = (import.meta as any).env?.VITE_APPWRITE_DATABASE_ID;
      const envProductsColId = (import.meta as any).env?.VITE_APPWRITE_PRODUCTS_COLLECTION_ID;
      const envIsEnabled = (import.meta as any).env?.VITE_APPWRITE_IS_ENABLED;

      if (envEndpoint && (!merged.appwriteConfig.endpoint || merged.appwriteConfig.endpoint.trim() === '')) {
        merged.appwriteConfig.endpoint = envEndpoint;
      }
      if (envProjectId && (!merged.appwriteConfig.projectId || merged.appwriteConfig.projectId.trim() === '')) {
        merged.appwriteConfig.projectId = envProjectId;
      }
      if (envDatabaseId && (!merged.appwriteConfig.databaseId || merged.appwriteConfig.databaseId.trim() === '')) {
        merged.appwriteConfig.databaseId = envDatabaseId;
      }
      if (envProductsColId && (!merged.appwriteConfig.productsCollectionId || merged.appwriteConfig.productsCollectionId.trim() === '')) {
        merged.appwriteConfig.productsCollectionId = envProductsColId;
      }
      if (envIsEnabled !== undefined && envIsEnabled !== null && envIsEnabled !== '') {
        const wantsEnabled = envIsEnabled === 'true' || envIsEnabled === true;
        if (wantsEnabled && merged.appwriteConfig.projectId?.trim() && merged.appwriteConfig.databaseId?.trim() && merged.appwriteConfig.productsCollectionId?.trim()) {
          merged.appwriteConfig.isEnabled = true;
        }
      }
    } catch {
      // Ignore if import.meta.env is unavailable
    }

    if (typeof merged.lowStockThreshold !== 'number' || isNaN(merged.lowStockThreshold) || merged.lowStockThreshold <= 0) {
      merged.lowStockThreshold = 20;
    }
    return merged;
  }

  saveSettings(settings: StoreSettings): void {
    const cleaned = {
      ...settings,
      lowStockThreshold:
        typeof settings.lowStockThreshold === 'number' && !isNaN(settings.lowStockThreshold) && settings.lowStockThreshold > 0
          ? settings.lowStockThreshold
          : 20,
    };
    this.set(STORAGE_KEYS.SETTINGS, cleaned);
  }

  // --- Admin Authentication ---
  getCurrentAdmin(): AdminUser | null {
    return this.get<AdminUser | null>(STORAGE_KEYS.CURRENT_ADMIN, null);
  }

  setCurrentAdmin(admin: AdminUser | null): void {
    this.set(STORAGE_KEYS.CURRENT_ADMIN, admin);
  }

  getAdminUsers(): AdminUser[] {
    const defaultAdmins: AdminUser[] = [
      {
        id: 'admin-manager-1',
        username: 'admin',
        fullName: 'Manager Solusi Rumahku',
        role: 'manager',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ];
    return this.get<AdminUser[]>(STORAGE_KEYS.ADMIN_USERS, defaultAdmins);
  }

  private getAdminPasswords(): Record<string, string> {
    // Default initial password is Admin2026!
    const defaultPasswords: Record<string, string> = {
      admin: 'Admin2026',
    };
    return this.get<Record<string, string>>(STORAGE_KEYS.ADMIN_PASSWORDS, defaultPasswords);
  }

  loginAdmin(username: string, password: string): { success: boolean; admin?: AdminUser; error?: string } {
    const users = this.getAdminUsers();
    const passwords = this.getAdminPasswords();

    const user = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!user) {
      return { success: false, error: 'Username admin tidak ditemukan.' };
    }

    const storedPassword = passwords[user.username.toLowerCase()];
    if (storedPassword !== password) {
      return { success: false, error: 'Password admin yang Anda masukkan salah.' };
    }

    const updatedUser = { ...user, lastLogin: new Date().toISOString() };
    this.setCurrentAdmin(updatedUser);
    return { success: true, admin: updatedUser };
  }

  registerManagerAdmin(
    accessCode: string,
    username: string,
    fullName: string,
    password: string
  ): { success: boolean; admin?: AdminUser; error?: string } {
    if (accessCode.trim() !== MANAGER_ACCESS_CODE) {
      return { success: false, error: 'Kode akses salah. Masukkan kode otorisasi manajer yang valid.' };
    }

    if (!username || username.trim().length < 3) {
      return { success: false, error: 'Username minimal 3 karakter.' };
    }

    const validation = validateAdminPassword(password);
    if (!validation.isValid) {
      return { success: false, error: validation.message };
    }

    const users = this.getAdminUsers();
    if (users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
      return { success: false, error: 'Username sudah digunakan. Silakan gunakan username lain.' };
    }

    const newAdmin: AdminUser = {
      id: `admin-${Date.now()}`,
      username: username.trim(),
      fullName: fullName.trim() || 'Manager Solusi Rumahku',
      role: 'manager',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    const updatedUsers = [...users, newAdmin];
    this.set(STORAGE_KEYS.ADMIN_USERS, updatedUsers);

    const passwords = this.getAdminPasswords();
    passwords[username.trim().toLowerCase()] = password;
    this.set(STORAGE_KEYS.ADMIN_PASSWORDS, passwords);

    this.setCurrentAdmin(newAdmin);
    return { success: true, admin: newAdmin };
  }

  changeAdminPassword(
    username: string,
    oldPass: string,
    newPass: string
  ): { success: boolean; error?: string } {
    const passwords = this.getAdminPasswords();
    const userKey = username.trim().toLowerCase();

    if (passwords[userKey] !== oldPass) {
      return { success: false, error: 'Password lama tidak sesuai.' };
    }

    const validation = validateAdminPassword(newPass);
    if (!validation.isValid) {
      return { success: false, error: validation.message };
    }

    passwords[userKey] = newPass;
    this.set(STORAGE_KEYS.ADMIN_PASSWORDS, passwords);
    return { success: true };
  }

  // --- Admin Management (By Manager) ---
  createAdminUserByManager(
    managerUser: AdminUser,
    newAdmin: {
      username: string;
      fullName: string;
      role: 'manager' | 'admin_full' | 'admin_partial';
      password: string;
      permissions?: AdminPermissions;
    }
  ): { success: boolean; admin?: AdminUser; error?: string } {
    if (managerUser.role !== 'manager') {
      return { success: false, error: 'Hanya akun dengan akses Manager yang dapat mendaftarkan admin baru.' };
    }

    if (!newAdmin.username || newAdmin.username.trim().length < 3) {
      return { success: false, error: 'Username minimal 3 karakter.' };
    }

    const validation = validateAdminPassword(newAdmin.password);
    if (!validation.isValid) {
      return { success: false, error: validation.message };
    }

    const users = this.getAdminUsers();
    if (users.some((u) => u.username.toLowerCase() === newAdmin.username.trim().toLowerCase())) {
      return { success: false, error: 'Username sudah digunakan. Silakan pilih username lain.' };
    }

    const created: AdminUser = {
      id: `admin-${Date.now()}`,
      username: newAdmin.username.trim(),
      fullName: newAdmin.fullName.trim() || 'Admin Solusi Rumahku',
      role: newAdmin.role,
      permissions: newAdmin.permissions,
      createdAt: new Date().toISOString(),
      createdBy: managerUser.username,
    };

    const updatedUsers = [...users, created];
    this.set(STORAGE_KEYS.ADMIN_USERS, updatedUsers);

    const passwords = this.getAdminPasswords();
    passwords[newAdmin.username.trim().toLowerCase()] = newAdmin.password;
    this.set(STORAGE_KEYS.ADMIN_PASSWORDS, passwords);

    return { success: true, admin: created };
  }

  updateAdminUserByManager(
    managerUser: AdminUser,
    targetAdmin: AdminUser,
    newPassword?: string
  ): { success: boolean; error?: string } {
    if (managerUser.role !== 'manager') {
      return { success: false, error: 'Hanya Manager yang dapat mengubah data user admin.' };
    }

    if (newPassword && newPassword.trim()) {
      const validation = validateAdminPassword(newPassword);
      if (!validation.isValid) {
        return { success: false, error: validation.message };
      }
      const passwords = this.getAdminPasswords();
      passwords[targetAdmin.username.toLowerCase()] = newPassword;
      this.set(STORAGE_KEYS.ADMIN_PASSWORDS, passwords);
    }

    const users = this.getAdminUsers();
    const updatedUsers = users.map((u) => (u.id === targetAdmin.id ? { ...u, ...targetAdmin } : u));
    this.set(STORAGE_KEYS.ADMIN_USERS, updatedUsers);

    // If updating current logged in user
    const current = this.getCurrentAdmin();
    if (current && current.id === targetAdmin.id) {
      this.setCurrentAdmin({ ...current, ...targetAdmin });
    }

    return { success: true };
  }

  deleteAdminUserByManager(
    managerUser: AdminUser,
    targetAdminId: string
  ): { success: boolean; error?: string } {
    if (managerUser.role !== 'manager') {
      return { success: false, error: 'Hanya Manager yang dapat menghapus user admin.' };
    }

    if (managerUser.id === targetAdminId) {
      return { success: false, error: 'Tidak dapat menghapus akun Anda sendiri yang sedang aktif.' };
    }

    const users = this.getAdminUsers();
    const target = users.find((u) => u.id === targetAdminId);
    if (!target) {
      return { success: false, error: 'User admin tidak ditemukan.' };
    }

    if (target.username.toLowerCase() === 'admin' && users.filter((u) => u.role === 'manager').length <= 1) {
      return { success: false, error: 'Akun manajer utama tidak dapat dihapus.' };
    }

    const updatedUsers = users.filter((u) => u.id !== targetAdminId);
    this.set(STORAGE_KEYS.ADMIN_USERS, updatedUsers);

    const passwords = this.getAdminPasswords();
    delete passwords[target.username.toLowerCase()];
    this.set(STORAGE_KEYS.ADMIN_PASSWORDS, passwords);

    return { success: true };
  }

  logoutAdmin(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN);
  }

  // --- Shopping Cart Persistence ---
  getCart(): CartItem[] {
    return this.get<CartItem[]>('solusi_rumahku_cart', []);
  }

  saveCart(cart: CartItem[]): void {
    this.set('solusi_rumahku_cart', cart);
  }

  // --- Automatic Stock Alert System ---
  getStockNotifications(
    customProducts?: Product[],
    customThreshold?: number
  ): {
    lowStockProducts: Product[];
    unspecifiedStockProducts: Product[];
    totalAlerts: number;
    thresholdUsed: number;
  } {
    const products =
      customProducts && Array.isArray(customProducts) && customProducts.length > 0
        ? customProducts
        : this.getProducts();
    const settings = this.getSettings();
    const threshold =
      typeof customThreshold === 'number' && !isNaN(customThreshold) && customThreshold > 0
        ? customThreshold
        : (typeof settings.lowStockThreshold === 'number' && settings.lowStockThreshold > 0
            ? settings.lowStockThreshold
            : 20);

    const lowStockProducts = products.filter((p) => {
      if (p.stockCount === null || p.stockCount === undefined || (p.stockCount as unknown) === '') {
        return false;
      }
      const num = typeof p.stockCount === 'number' ? p.stockCount : Number(p.stockCount);
      return !isNaN(num) && num > 0 && num <= threshold;
    });

    const unspecifiedStockProducts = products.filter((p) => {
      if (p.stockCount === null || p.stockCount === undefined || (p.stockCount as unknown) === '') {
        return true;
      }
      const num = typeof p.stockCount === 'number' ? p.stockCount : Number(p.stockCount);
      return isNaN(num) || num <= 0;
    });

    return {
      lowStockProducts,
      unspecifiedStockProducts,
      totalAlerts: lowStockProducts.length + unspecifiedStockProducts.length,
      thresholdUsed: threshold,
    };
  }

  // Reset to initial factory defaults
  resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.BRANDS);
    localStorage.removeItem(STORAGE_KEYS.TYPES);
    localStorage.removeItem(STORAGE_KEYS.INFO_TRENDS);
    localStorage.removeItem(STORAGE_KEYS.GALLERY);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_FEATURES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  }
}

export const storage = new StorageService();
