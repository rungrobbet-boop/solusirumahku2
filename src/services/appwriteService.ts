import { Client, Databases, Storage, Account, ID, Query } from 'appwrite';
import { StoreSettings, Product } from '../types';
import { INITIAL_STORE_SETTINGS } from '../data/initialData';

export interface SyncProgressCallback {
  (current: number, total: number, message: string): void;
}

export function toSafeAppwriteId(id: string): string {
  let safe = (id || '').trim().replace(/[^a-zA-Z0-9._-]/g, '_');
  if (!safe || /^[^a-zA-Z0-9]/.test(safe)) {
    safe = 'p_' + safe;
  }
  return safe.substring(0, 36);
}

export class AppwriteService {
  private client: Client;
  private databases: Databases;
  private storage: Storage;
  private account: Account;
  private unsubscribeProducts: (() => void) | null = null;
  private unsubscribeSettings: (() => void) | null = null;

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

  // --- Fetch All Products from Appwrite ---
  async fetchAllProducts(config: StoreSettings['appwriteConfig']): Promise<{ success: boolean; products?: Product[]; error?: string }> {
    if (!this.isConfigured(config)) {
      return { success: false, error: 'Konfigurasi Appwrite belum lengkap.' };
    }
    try {
      this.updateConfig(config);
      let allDocs: any[] = [];
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const response = await this.databases.listDocuments(
          config.databaseId.trim(),
          config.productsCollectionId.trim(),
          [Query.limit(limit), Query.offset(offset)]
        );
        allDocs = [...allDocs, ...response.documents];
        if (response.documents.length < limit || allDocs.length >= response.total) {
          hasMore = false;
        } else {
          offset += limit;
        }
      }

      const products: Product[] = allDocs.map((doc) => this.documentToProduct(doc));
      return { success: true, products };
    } catch (err: unknown) {
      const error = err as Error;
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
    config: StoreSettings['appwriteConfig']
  ): Promise<{ success: boolean; settings?: StoreSettings; error?: string }> {
    if (!this.isConfigured(config)) {
      return { success: false, error: 'Appwrite belum dikonfigurasi.' };
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

      return { success: true, settings: mergedSettings };
    } catch (err: unknown) {
      const error = err as Error;
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

