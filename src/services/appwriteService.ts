import { Client, Databases, Storage, Account, ID, Query } from 'appwrite';
import { StoreSettings, Product } from '../types';
import { INITIAL_STORE_SETTINGS } from '../data/initialData';

export interface SyncProgressCallback {
  (current: number, total: number, message: string): void;
}

export interface FetchProductsPageOptions {
  limit?: number;
  lastVisibleId?: string | null;
  category?: string;
  brand?: string;
  isLatest?: boolean;
  forceRefresh?: boolean;
}

export interface FetchProductsPageResult {
  success: boolean;
  products: Product[];
  lastVisible: string | null;
  hasMore: boolean;
  total: number;
  error?: string;
}

export interface PersistenceOptions {
  enabled?: boolean;
  ttlMs?: number; // Cache time-to-live in ms, default 15 mins
}

export function toSafeAppwriteId(id: string): string {
  let safe = (id || '').trim().replace(/[^a-zA-Z0-9._-]/g, '_');
  if (!safe || /^[^a-zA-Z0-9]/.test(safe)) {
    safe = 'p_' + safe;
  }
  return safe.substring(0, 36);
}

const CACHE_PREFIX = 'appwrite_cache_';
const DEFAULT_CACHE_TTL = 15 * 60 * 1000; // 15 minutes to save read quota

export class AppwriteService {
  private client: Client;
  private databases: Databases;
  private storage: Storage;
  private account: Account;
  private unsubscribeProducts: (() => void) | null = null;
  private unsubscribeSettings: (() => void) | null = null;
  private persistenceEnabled: boolean = true;
  private cacheTTL: number = DEFAULT_CACHE_TTL;
  private memoryCache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor(config?: StoreSettings['appwriteConfig']) {
    this.client = new Client();
    if (config && config.isEnabled && config.endpoint?.trim() && config.projectId?.trim()) {
      const cleanProj = config.projectId.trim();
      if (cleanProj && cleanProj.length > 2 && !cleanProj.includes('placeholder')) {
        this.client.setEndpoint(config.endpoint.trim()).setProject(cleanProj);
      }
    }
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
    this.account = new Account(this.client);

    // Initialize local offline persistence
    this.enablePersistence({ enabled: true, ttlMs: DEFAULT_CACHE_TTL });
  }

  /**
   * Mengaktifkan caching offline & persistensi dokumen lokal untuk meminimalkan pemakaian kuota read Appwrite.
   */
  enablePersistence(options: PersistenceOptions = { enabled: true, ttlMs: DEFAULT_CACHE_TTL }) {
    this.persistenceEnabled = options.enabled ?? true;
    this.cacheTTL = options.ttlMs || DEFAULT_CACHE_TTL;
  }

  // --- Internal Cache Helpers to Minimize Appwrite Reads ---
  private getCache<T>(key: string): T | null {
    if (!this.persistenceEnabled) return null;
    const fullKey = CACHE_PREFIX + key;
    
    // Check memory cache first
    const mem = this.memoryCache.get(fullKey);
    if (mem && Date.now() - mem.timestamp < this.cacheTTL) {
      return mem.data as T;
    }

    // Check localStorage cache for cross-session/offline persistence
    try {
      const raw = localStorage.getItem(fullKey);
      if (raw) {
        const item = JSON.parse(raw);
        if (item && Date.now() - item.timestamp < this.cacheTTL) {
          this.memoryCache.set(fullKey, item);
          return item.data as T;
        }
      }
    } catch {
      // ignore storage error
    }
    return null;
  }

  private setCache(key: string, data: any) {
    if (!this.persistenceEnabled) return;
    const fullKey = CACHE_PREFIX + key;
    const item = { data, timestamp: Date.now() };
    this.memoryCache.set(fullKey, item);
    try {
      localStorage.setItem(fullKey, JSON.stringify(item));
    } catch {
      // ignore storage quota error
    }
  }

  private invalidateCache(prefix?: string) {
    if (prefix) {
      const fullPrefix = CACHE_PREFIX + prefix;
      for (const k of this.memoryCache.keys()) {
        if (k.startsWith(fullPrefix)) this.memoryCache.delete(k);
      }
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(fullPrefix)) keysToRemove.push(k);
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {
        // ignore
      }
    } else {
      this.memoryCache.clear();
    }
  }

  updateConfig(config?: StoreSettings['appwriteConfig']) {
    if (config && config.endpoint?.trim() && config.projectId?.trim()) {
      const cleanEndpoint = config.endpoint.trim();
      const cleanProject = config.projectId.trim();
      if (cleanProject && cleanProject.length > 2 && !cleanProject.includes('placeholder')) {
        this.client = new Client().setEndpoint(cleanEndpoint).setProject(cleanProject);
        this.databases = new Databases(this.client);
        this.storage = new Storage(this.client);
        this.account = new Account(this.client);
      }
    }
  }

  isConfigured(config?: StoreSettings['appwriteConfig']): boolean {
    if (!config) return false;
    if (config.isEnabled !== true) return false;
    if (!config.endpoint || !config.projectId || !config.databaseId || !config.productsCollectionId) {
      return false;
    }
    const cleanEndpoint = config.endpoint.trim();
    const cleanProject = config.projectId.trim();
    const cleanDb = config.databaseId.trim();
    const cleanCol = config.productsCollectionId.trim();

    if (!cleanEndpoint || !cleanProject || !cleanDb || !cleanCol) {
      return false;
    }

    const cleanId = cleanProject.toLowerCase();
    if (
      cleanId.length < 3 ||
      cleanId === 'solusi-rumahku-app' ||
      cleanId === 'project-id' ||
      cleanId === 'your-project-id' ||
      cleanId.includes('placeholder')
    ) {
      return false;
    }
    return true;
  }

  async testConnection(config: StoreSettings['appwriteConfig']): Promise<{ success: boolean; message: string }> {
    try {
      if (!config.endpoint || !config.projectId) {
        return { success: false, message: 'Endpoint dan Project ID wajib diisi.' };
      }
      const testClient = new Client().setEndpoint(config.endpoint.trim()).setProject(config.projectId.trim());
      const testDatabases = new Databases(testClient);

      if (config.databaseId && config.productsCollectionId) {
        try {
          const res = await testDatabases.listDocuments(config.databaseId.trim(), config.productsCollectionId.trim(), [
            Query.limit(1),
          ]);
          return {
            success: true,
            message: `Koneksi berhasil! Ditemukan total ${res.total} dokumen produk di koleksi Appwrite.`,
          };
        } catch (dbErr: unknown) {
          const err = dbErr as Error;
          return {
            success: false,
            message: `Gagal akses koleksi database: ${err?.message || 'Periksa Database ID, Collection ID, dan izin (Permissions Role Any) Appwrite.'}`,
          };
        }
      }

      return { success: true, message: 'Koneksi ke Appwrite Server Berhasil diinisialisasi!' };
    } catch (error: unknown) {
      const err = error as Error;
      return {
        success: false,
        message: `Gagal terhubung ke Appwrite: ${err?.message || 'Periksa kembali Endpoint dan Project ID.'}`,
      };
    }
  }

  // --- Map Appwrite Document to Local Product ---
  private documentToProduct(doc: any): Product {
    if (doc.productJson && typeof doc.productJson === 'string') {
      try {
        const parsed = JSON.parse(doc.productJson);
        if (parsed && parsed.id && parsed.name) {
          return parsed as Product;
        }
      } catch {
        // fallback to attributes
      }
    }

    let specs: Record<string, string> = {};
    if (typeof doc.specifications === 'string' && doc.specifications.trim()) {
      try {
        specs = JSON.parse(doc.specifications);
      } catch {
        specs = {};
      }
    } else if (typeof doc.specifications === 'object' && doc.specifications !== null) {
      specs = doc.specifications;
    }

    let images: string[] = [];
    if (Array.isArray(doc.images)) {
      images = doc.images;
    } else if (typeof doc.images === 'string') {
      try {
        const parsed = JSON.parse(doc.images);
        images = Array.isArray(parsed) ? parsed : [doc.images];
      } catch {
        images = [doc.images];
      }
    }

    return {
      id: doc.$id || doc.id,
      name: doc.name || 'Produk Tanpa Nama',
      brand: doc.brand || 'Umum',
      category: doc.category || 'Lainnya',
      type: doc.type || 'Standard',
      price: Number(doc.price) || 0,
      discountPrice: doc.discountPrice !== undefined && doc.discountPrice !== null ? Number(doc.discountPrice) : undefined,
      stockCount: doc.stockCount !== undefined && doc.stockCount !== null ? Number(doc.stockCount) : null,
      mainImage: doc.mainImage || '',
      images: images.length > 0 ? images : [doc.mainImage || ''],
      description: doc.description || '',
      specifications: specs,
      packingQuantity: doc.packingQuantity !== undefined && doc.packingQuantity !== null ? Number(doc.packingQuantity) : null,
      packingUnit: doc.packingUnit || undefined,
      isFavoriteMonthRank: doc.isFavoriteMonthRank !== undefined && doc.isFavoriteMonthRank !== null ? Number(doc.isFavoriteMonthRank) : null,
      isLatest: Boolean(doc.isLatest),
      rating: doc.rating !== undefined && doc.rating !== null ? Number(doc.rating) : 5.0,
      salesCount: doc.salesCount !== undefined && doc.salesCount !== null ? Number(doc.salesCount) : 0,
      createdAt: doc.createdAt || doc.$createdAt || new Date().toISOString(),
      updatedAt: doc.updatedAt || doc.$updatedAt || new Date().toISOString(),
    };
  }

  // --- Map Local Product to Appwrite Document Payload ---
  private productToDocumentPayload(product: Product): Record<string, any> {
    const payload: Record<string, any> = {
      name: product.name || '',
      brand: product.brand || 'Umum',
      category: product.category || 'Lainnya',
      type: product.type || 'Standard',
      price: Number(product.price) || 0,
      discountPrice: product.discountPrice !== undefined && product.discountPrice !== null ? Number(product.discountPrice) : null,
      stockCount: product.stockCount !== undefined && product.stockCount !== null ? Number(product.stockCount) : null,
      mainImage: product.mainImage || '',
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.mainImage || ''],
      description: product.description || '',
      specifications: JSON.stringify(product.specifications || {}),
      packingQuantity: product.packingQuantity !== undefined && product.packingQuantity !== null ? Number(product.packingQuantity) : null,
      packingUnit: product.packingUnit || null,
      isFavoriteMonthRank: product.isFavoriteMonthRank !== undefined && product.isFavoriteMonthRank !== null ? Number(product.isFavoriteMonthRank) : null,
      isLatest: Boolean(product.isLatest),
      rating: Number(product.rating) || 5.0,
      salesCount: Number(product.salesCount) || 0,
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return payload;
  }

  // --- Fetch Products with Cursor-Based Pagination (Limit 20, CursorAfter / StartAfter) ---
  async fetchProductsPage(
    config: StoreSettings['appwriteConfig'],
    options: FetchProductsPageOptions = {}
  ): Promise<FetchProductsPageResult> {
    if (!this.isConfigured(config)) {
      return { success: false, products: [], lastVisible: null, hasMore: false, total: 0, error: 'Konfigurasi Appwrite belum lengkap.' };
    }

    const {
      limit = 20,
      lastVisibleId = null,
      category,
      brand,
      isLatest,
      forceRefresh = false,
    } = options;

    const cacheKey = `products_page_${category || 'all'}_${brand || 'all'}_${isLatest ? 'latest' : 'all'}_${limit}_${lastVisibleId || 'first'}`;

    // 1. Check local offline cache first to save read quota if not forced
    if (!forceRefresh) {
      const cached = this.getCache<FetchProductsPageResult>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      this.updateConfig(config);

      // Build structured queries with strict limit & where filters
      const queries: string[] = [Query.limit(limit)];

      if (lastVisibleId) {
        // Appwrite cursor-based pagination equivalent to startAfter
        queries.push(Query.cursorAfter(lastVisibleId));
      }

      if (category && category.trim()) {
        queries.push(Query.equal('category', category.trim()));
      }

      if (brand && brand.trim()) {
        queries.push(Query.equal('brand', brand.trim()));
      }

      if (isLatest) {
        queries.push(Query.equal('isLatest', true));
      }

      // Order by created date descending
      try {
        queries.push(Query.orderDesc('$createdAt'));
      } catch {
        // ignore if index not created
      }

      const response = await this.databases.listDocuments(
        config.databaseId.trim(),
        config.productsCollectionId.trim(),
        queries
      );

      const products: Product[] = response.documents.map((doc) => this.documentToProduct(doc));
      const lastDoc = response.documents.length > 0 ? response.documents[response.documents.length - 1] : null;
      const lastVisible = lastDoc ? lastDoc.$id : null;
      const total = response.total;
      const hasMore = response.documents.length === limit;

      const result: FetchProductsPageResult = {
        success: true,
        products,
        lastVisible,
        hasMore,
        total,
      };

      // Save to persistence cache
      this.setCache(cacheKey, result);

      return result;
    } catch (err: unknown) {
      const error = err as Error;

      // On network failure or rate limit, attempt reading from fallback cache
      const cached = this.getCache<FetchProductsPageResult>(cacheKey);
      if (cached) {
        return cached;
      }

      return {
        success: false,
        products: [],
        lastVisible: null,
        hasMore: false,
        total: 0,
        error: error?.message || 'Gagal memuat halaman produk dari Appwrite.',
      };
    }
  }

  // --- Fetch Single Product by ID (Direct getDocument, no list query to save read cost) ---
  async fetchProductById(
    config: StoreSettings['appwriteConfig'],
    productId: string,
    useCache: boolean = true
  ): Promise<{ success: boolean; product?: Product; error?: string }> {
    if (!this.isConfigured(config)) {
      return { success: false, error: 'Konfigurasi Appwrite belum lengkap.' };
    }

    const safeDocId = toSafeAppwriteId(productId);
    const cacheKey = `product_doc_${safeDocId}`;

    if (useCache) {
      const cached = this.getCache<Product>(cacheKey);
      if (cached) {
        return { success: true, product: cached };
      }
    }

    try {
      this.updateConfig(config);
      // Direct getDocument using docRef (safeDocId), NOT a listDocuments query!
      const doc = await this.databases.getDocument(
        config.databaseId.trim(),
        config.productsCollectionId.trim(),
        safeDocId
      );

      const product = this.documentToProduct(doc);
      this.setCache(cacheKey, product);
      return { success: true, product };
    } catch (err: unknown) {
      const error = err as Error;
      const cached = this.getCache<Product>(cacheKey);
      if (cached) {
        return { success: true, product: cached };
      }
      return { success: false, error: error?.message || 'Produk tidak ditemukan di Appwrite.' };
    }
  }

  // --- Fetch All Products from Appwrite (Cached & with limit query) ---
  async fetchAllProducts(
    config: StoreSettings['appwriteConfig'],
    forceRefresh: boolean = false
  ): Promise<{ success: boolean; products?: Product[]; error?: string }> {
    if (!this.isConfigured(config)) {
      return { success: false, error: 'Konfigurasi Appwrite belum lengkap.' };
    }

    const cacheKey = 'all_products_cache';
    if (!forceRefresh) {
      const cached = this.getCache<Product[]>(cacheKey);
      if (cached && cached.length > 0) {
        return { success: true, products: cached };
      }
    }

    try {
      this.updateConfig(config);
      let allDocs: any[] = [];
      let lastId: string | null = null;
      const limit = 25; // Smaller batch size with cursor to avoid heavy reads
      let hasMore = true;

      while (hasMore) {
        const queries: string[] = [Query.limit(limit)];
        if (lastId) {
          queries.push(Query.cursorAfter(lastId));
        }

        const response = await this.databases.listDocuments(
          config.databaseId.trim(),
          config.productsCollectionId.trim(),
          queries
        );

        allDocs = [...allDocs, ...response.documents];
        if (response.documents.length < limit || allDocs.length >= response.total) {
          hasMore = false;
        } else {
          lastId = response.documents[response.documents.length - 1].$id;
        }
      }

      const products: Product[] = allDocs.map((doc) => this.documentToProduct(doc));
      this.setCache(cacheKey, products);
      return { success: true, products };
    } catch (err: unknown) {
      const error = err as Error;
      const cached = this.getCache<Product[]>(cacheKey);
      if (cached && cached.length > 0) {
        return { success: true, products: cached };
      }
      return { success: false, error: error?.message || 'Gagal memuat produk dari Appwrite.' };
    }
  }

  // --- Push Single Product to Appwrite (Upsert with intelligent schema adaptation) ---
  async saveProduct(config: StoreSettings['appwriteConfig'], product: Product): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured(config)) return { success: false, error: 'Appwrite tidak dikonfigurasi.' };
    try {
      this.updateConfig(config);
      const safeDocId = toSafeAppwriteId(product.id);
      let payload = this.productToDocumentPayload(product);

      // Attempt upsert with attribute fallback loop
      let attempts = 0;
      const maxAttempts = 6;

      while (attempts < maxAttempts) {
        attempts++;
        try {
          try {
            await this.databases.updateDocument(
              config.databaseId.trim(),
              config.productsCollectionId.trim(),
              safeDocId,
              payload
            );
          } catch (updateErr: any) {
            if (updateErr?.code === 404 || updateErr?.message?.includes('not found') || updateErr?.message?.includes('could not be found')) {
              await this.databases.createDocument(
                config.databaseId.trim(),
                config.productsCollectionId.trim(),
                safeDocId,
                payload
              );
            } else {
              throw updateErr;
            }
          }
          return { success: true };
        } catch (opErr: any) {
          const errMsg = opErr?.message || '';
          // Detect missing attribute error in Appwrite collection
          const match = errMsg.match(/Attribute ["']?([a-zA-Z0-9_]+)["']? not found/i) ||
                        errMsg.match(/Invalid document structure: Attribute "([^"]+)" not found/i) ||
                        errMsg.match(/Unknown attribute:? ["']?([a-zA-Z0-9_]+)["']?/i);

          if (match && match[1] && payload[match[1]] !== undefined) {
            delete payload[match[1]];
            continue; // Retry with missing attribute removed
          }

          // If general attribute structure error and still has optional fields, strip optional fields
          if (errMsg.includes('Invalid document structure') && (payload.specifications || payload.isFavoriteMonthRank !== undefined || payload.packingQuantity !== undefined)) {
            delete payload.specifications;
            delete payload.isFavoriteMonthRank;
            delete payload.packingQuantity;
            delete payload.packingUnit;
            delete payload.salesCount;
            delete payload.rating;
            delete payload.isLatest;
            continue;
          }

          throw opErr;
        }
      }

      return { success: true };
    } catch (err: unknown) {
      const error = err as Error;
      return { success: false, error: error?.message || 'Gagal menyimpan produk ke Appwrite.' };
    } finally {
      this.invalidateCache('products_');
      this.invalidateCache('all_products_');
      this.invalidateCache(`product_doc_${toSafeAppwriteId(product.id)}`);
    }
  }

  // --- Delete Single Product from Appwrite ---
  async deleteProduct(config: StoreSettings['appwriteConfig'], productId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured(config)) return { success: false, error: 'Appwrite tidak dikonfigurasi.' };
    try {
      this.updateConfig(config);
      const safeDocId = toSafeAppwriteId(productId);
      await this.databases.deleteDocument(
        config.databaseId.trim(),
        config.productsCollectionId.trim(),
        safeDocId
      );
      this.invalidateCache('products_');
      this.invalidateCache('all_products_');
      this.invalidateCache(`product_doc_${safeDocId}`);
      return { success: true };
    } catch (err: unknown) {
      const error = err as Error;
      return { success: false, error: error?.message || 'Gagal menghapus produk dari Appwrite.' };
    }
  }

  // --- Push All Local Products to Appwrite (Bulk Sync / Migration) ---
  async pushAllProductsToAppwrite(
    config: StoreSettings['appwriteConfig'],
    products: Product[],
    onProgress?: SyncProgressCallback
  ): Promise<{ success: boolean; count: number; failedCount: number; error?: string }> {
    if (!this.isConfigured(config)) {
      return { success: false, count: 0, failedCount: products.length, error: 'Konfigurasi Appwrite belum lengkap atau belum diaktifkan.' };
    }
    try {
      this.updateConfig(config);
      let successCount = 0;
      let failedCount = 0;
      let firstError = '';
      const total = products.length;

      for (let i = 0; i < total; i++) {
        const p = products[i];
        if (onProgress) {
          onProgress(i + 1, total, `Mengunggah (${i + 1}/${total}): ${p.name}`);
        }
        const res = await this.saveProduct(config, p);
        if (res.success) {
          successCount++;
        } else {
          failedCount++;
          if (!firstError && res.error) {
            firstError = res.error;
          }
        }
      }

      if (successCount === 0 && total > 0) {
        return {
          success: false,
          count: 0,
          failedCount,
          error: firstError || 'Gagal mengunggah. Pastikan Permissions di Appwrite Console (Role Any / Guests) sudah dicentang Create & Update.',
        };
      }

      return {
        success: true,
        count: successCount,
        failedCount,
        error: failedCount > 0 ? `Sebagian gagal (${failedCount}): ${firstError}` : undefined,
      };
    } catch (err: unknown) {
      const error = err as Error;
      return { success: false, count: 0, failedCount: products.length, error: error?.message || 'Gagal mengunggah data ke Appwrite.' };
    }
  }

  // --- Save Store Settings (Logo, WhatsApp, Store Name, Banner, Footer) to Appwrite ---
  async saveStoreSettings(
    config: StoreSettings['appwriteConfig'],
    settings: StoreSettings
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured(config)) {
      return { success: false, error: 'Appwrite belum dikonfigurasi.' };
    }
    const colId = config.infoCollectionId?.trim() || 'settings';
    const docId = 'store_global_settings';

    try {
      this.updateConfig(config);
      // Clean settings object for storage
      const settingsPayload: Record<string, any> = {
        storeName: settings.storeName || '',
        tagline: settings.tagline || '',
        phoneWhatsApp: settings.phoneWhatsApp || '',
        customLogoUrl: settings.customLogoUrl || '',
        logoTextPrefix: settings.logoTextPrefix || '',
        logoTextSuffix: settings.logoTextSuffix || '',
        address: settings.address || '',
        city: settings.city || '',
        businessHours: settings.businessHours || '',
        email: settings.email || '',
        instagramUrl: settings.instagramUrl || '',
        facebookUrl: settings.facebookUrl || '',
        tiktokUrl: settings.tiktokUrl || '',
        heroTitle: settings.heroTitle || '',
        heroSubtitle: settings.heroSubtitle || '',
        heroBadge: settings.heroBadge || '',
        heroMediaUrl: settings.heroMediaUrl || '',
        heroBackgroundUrl: settings.heroBackgroundUrl || '',
        heroCta1Text: settings.heroCta1Text || '',
        heroCta2Text: settings.heroCta2Text || '',
        pageBackgroundPattern: settings.pageBackgroundPattern || 'default',
        pageBackgroundImageUrl: settings.pageBackgroundImageUrl || '',
        footerTaglineText: settings.footerTaglineText || '',
        footerCopyrightText: settings.footerCopyrightText || '',
        footerLogoSize: settings.footerLogoSize || 'md',
        footerCustomLogoPx: Number(settings.footerCustomLogoPx) || 56,
        settingsJson: JSON.stringify(settings),
        updatedAt: new Date().toISOString(),
      };

      try {
        await this.databases.updateDocument(
          config.databaseId.trim(),
          colId,
          docId,
          settingsPayload
        );
      } catch (updateErr: any) {
        if (updateErr?.code === 404 || updateErr?.message?.includes('not found') || updateErr?.message?.includes('could not be found')) {
          await this.databases.createDocument(
            config.databaseId.trim(),
            colId,
            docId,
            settingsPayload
          );
        } else {
          // If attribute not found, try sending only settingsJson
          if (updateErr?.message?.includes('Attribute') || updateErr?.message?.includes('Invalid document structure')) {
            try {
              await this.databases.updateDocument(
                config.databaseId.trim(),
                colId,
                docId,
                { settingsJson: JSON.stringify(settings), updatedAt: new Date().toISOString() }
              );
            } catch {
              await this.databases.createDocument(
                config.databaseId.trim(),
                colId,
                docId,
                { settingsJson: JSON.stringify(settings), updatedAt: new Date().toISOString() }
              );
            }
          } else {
            throw updateErr;
          }
        }
      }

      this.invalidateCache('store_settings');
      return { success: true };
    } catch (err: unknown) {
      const error = err as Error;
      return {
        success: false,
        error: `Gagal menyimpan Pengaturan Toko ke Appwrite (Collection "${colId}"): ${error?.message || 'Pastikan Collection sudah dibuat dan izin Any: Create/Update dicentang.'}`,
      };
    }
  }

  // --- Fetch Store Settings from Appwrite ---
  async fetchStoreSettings(
    config: StoreSettings['appwriteConfig'],
    forceRefresh: boolean = false
  ): Promise<{ success: boolean; settings?: StoreSettings; error?: string }> {
    if (!this.isConfigured(config)) {
      return { success: false, error: 'Appwrite belum dikonfigurasi.' };
    }

    const cacheKey = 'store_settings';
    if (!forceRefresh) {
      const cached = this.getCache<StoreSettings>(cacheKey);
      if (cached) {
        return { success: true, settings: cached };
      }
    }

    const colId = config.infoCollectionId?.trim() || 'settings';
    const docId = 'store_global_settings';

    try {
      this.updateConfig(config);
      let doc: any = null;
      try {
        doc = await this.databases.getDocument(config.databaseId.trim(), colId, docId);
      } catch (docErr: any) {
        // Fallback: list 1 document in settings collection
        try {
          const listRes = await this.databases.listDocuments(config.databaseId.trim(), colId, [Query.limit(1)]);
          if (listRes.documents.length > 0) {
            doc = listRes.documents[0];
          }
        } catch {
          // collection might not exist yet
        }
      }

      if (!doc) {
        return { success: false, error: `Dokumen pengaturan belum ditemukan di koleksi "${colId}".` };
      }

      let parsedSettings: Partial<StoreSettings> = {};
      if (doc.settingsJson && typeof doc.settingsJson === 'string') {
        try {
          parsedSettings = JSON.parse(doc.settingsJson);
        } catch {
          parsedSettings = {};
        }
      }

      const mergedSettings: StoreSettings = {
        ...INITIAL_STORE_SETTINGS,
        ...parsedSettings,
        storeName: doc.storeName || parsedSettings.storeName || INITIAL_STORE_SETTINGS.storeName,
        tagline: doc.tagline || parsedSettings.tagline || INITIAL_STORE_SETTINGS.tagline,
        phoneWhatsApp: doc.phoneWhatsApp || parsedSettings.phoneWhatsApp || INITIAL_STORE_SETTINGS.phoneWhatsApp,
        customLogoUrl: doc.customLogoUrl !== undefined ? doc.customLogoUrl : (parsedSettings.customLogoUrl || ''),
        logoTextPrefix: doc.logoTextPrefix || parsedSettings.logoTextPrefix || INITIAL_STORE_SETTINGS.logoTextPrefix,
        logoTextSuffix: doc.logoTextSuffix || parsedSettings.logoTextSuffix || INITIAL_STORE_SETTINGS.logoTextSuffix,
        address: doc.address || parsedSettings.address || INITIAL_STORE_SETTINGS.address,
        businessHours: doc.businessHours || parsedSettings.businessHours || INITIAL_STORE_SETTINGS.businessHours,
        email: doc.email || parsedSettings.email || INITIAL_STORE_SETTINGS.email,
        heroTitle: doc.heroTitle || parsedSettings.heroTitle || INITIAL_STORE_SETTINGS.heroTitle,
        heroSubtitle: doc.heroSubtitle || parsedSettings.heroSubtitle || INITIAL_STORE_SETTINGS.heroSubtitle,
        heroMediaUrl: doc.heroMediaUrl !== undefined ? doc.heroMediaUrl : (parsedSettings.heroMediaUrl || ''),
        heroBackgroundUrl: doc.heroBackgroundUrl !== undefined ? doc.heroBackgroundUrl : (parsedSettings.heroBackgroundUrl || ''),
        appwriteConfig: {
          ...config,
          isEnabled: true,
        },
      };

      this.setCache(cacheKey, mergedSettings);
      return { success: true, settings: mergedSettings };
    } catch (err: unknown) {
      const error = err as Error;
      const cached = this.getCache<StoreSettings>(cacheKey);
      if (cached) {
        return { success: true, settings: cached };
      }
      return { success: false, error: error?.message || 'Gagal memuat pengaturan toko dari Appwrite.' };
    }
  }

  // --- Subscribe to Store Settings Realtime ---
  subscribeToStoreSettings(
    config: StoreSettings['appwriteConfig'],
    onSettingsUpdate: (settings: StoreSettings) => void
  ): () => void {
    if (!this.isConfigured(config)) return () => {};
    const colId = config.infoCollectionId?.trim() || 'settings';
    const channel = `databases.${config.databaseId.trim()}.collections.${colId}.documents`;

    try {
      if (this.unsubscribeSettings) {
        try {
          this.unsubscribeSettings();
        } catch {
          // ignore
        }
        this.unsubscribeSettings = null;
      }

      this.updateConfig(config);
      const unsubscribe = this.client.subscribe(channel, (response: any) => {
        try {
          const payload = response?.payload;
          if (payload) {
            let parsed: Partial<StoreSettings> = {};
            if (payload.settingsJson) {
              try {
                parsed = JSON.parse(payload.settingsJson);
              } catch {
                parsed = {};
              }
            }
            const updated: StoreSettings = {
              ...INITIAL_STORE_SETTINGS,
              ...parsed,
              storeName: payload.storeName || parsed.storeName || INITIAL_STORE_SETTINGS.storeName,
              tagline: payload.tagline || parsed.tagline || INITIAL_STORE_SETTINGS.tagline,
              phoneWhatsApp: payload.phoneWhatsApp || parsed.phoneWhatsApp || INITIAL_STORE_SETTINGS.phoneWhatsApp,
              customLogoUrl: payload.customLogoUrl !== undefined ? payload.customLogoUrl : (parsed.customLogoUrl || ''),
              heroTitle: payload.heroTitle || parsed.heroTitle || INITIAL_STORE_SETTINGS.heroTitle,
              heroSubtitle: payload.heroSubtitle || parsed.heroSubtitle || INITIAL_STORE_SETTINGS.heroSubtitle,
              appwriteConfig: { ...config, isEnabled: true },
            };
            onSettingsUpdate(updated);
          }
        } catch (subErr) {
          console.warn('Realtime settings payload warning:', subErr);
        }
      });

      this.unsubscribeSettings = unsubscribe;
      return () => {
        try {
          if (unsubscribe && typeof unsubscribe === 'function') {
            unsubscribe();
          }
        } catch {
          // ignore
        }
        if (this.unsubscribeSettings === unsubscribe) {
          this.unsubscribeSettings = null;
        }
      };
    } catch {
      return () => {};
    }
  }

  // --- Subscribe to Products Realtime Updates ---
  subscribeToProducts(
    config: StoreSettings['appwriteConfig'],
    onProductChange: (type: 'create' | 'update' | 'delete', product: Product | { id: string }) => void
  ): () => void {
    if (!this.isConfigured(config)) {
      return () => {};
    }

    try {
      if (this.unsubscribeProducts) {
        try {
          this.unsubscribeProducts();
        } catch {
          // ignore
        }
        this.unsubscribeProducts = null;
      }

      this.updateConfig(config);
      const cleanDb = config.databaseId.trim();
      const cleanCol = config.productsCollectionId.trim();
      const channel = `databases.${cleanDb}.collections.${cleanCol}.documents`;
      
      const unsubscribe = this.client.subscribe(channel, (response: any) => {
        try {
          const events: string[] = response?.events || [];
          const payload = response?.payload;
          if (!payload) return;

          if (events.some((e) => e.includes('.create'))) {
            const product = this.documentToProduct(payload);
            onProductChange('create', product);
          } else if (events.some((e) => e.includes('.update'))) {
            const product = this.documentToProduct(payload);
            onProductChange('update', product);
          } else if (events.some((e) => e.includes('.delete'))) {
            onProductChange('delete', { id: payload.$id });
          }
        } catch (subErr) {
          console.warn('Realtime payload handling warning:', subErr);
        }
      });

      this.unsubscribeProducts = unsubscribe;
      return () => {
        try {
          if (unsubscribe && typeof unsubscribe === 'function') {
            unsubscribe();
          }
        } catch {
          // ignore cleanup errors
        }
        if (this.unsubscribeProducts === unsubscribe) {
          this.unsubscribeProducts = null;
        }
      };
    } catch (err) {
      console.warn('Gagal mengaktifkan Realtime Appwrite:', err);
      return () => {};
    }
  }
}

export const appwriteService = new AppwriteService();

