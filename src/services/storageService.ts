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
    return this.get<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_STORE_SETTINGS);
  }

  saveSettings(settings: StoreSettings): void {
    this.set(STORAGE_KEYS.SETTINGS, settings);
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
      return { success: false, error: `Kode akses salah. Masukkan kode akses khusus manajer yang sah ("dear2226").` };
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
  getStockNotifications(): {
    lowStockProducts: Product[];
    unspecifiedStockProducts: Product[];
    totalAlerts: number;
  } {
    const products = this.getProducts();
    const settings = this.getSettings();
    const threshold = settings.lowStockThreshold || 5;

    const lowStockProducts = products.filter(
      (p) => typeof p.stockCount === 'number' && p.stockCount > 0 && p.stockCount <= threshold
    );

    const unspecifiedStockProducts = products.filter(
      (p) => p.stockCount === null || p.stockCount === undefined || (typeof p.stockCount === 'number' && p.stockCount <= 0)
    );

    return {
      lowStockProducts,
      unspecifiedStockProducts,
      totalAlerts: lowStockProducts.length + unspecifiedStockProducts.length,
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
