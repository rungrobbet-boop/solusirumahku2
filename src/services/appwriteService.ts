import { Client, Databases, Storage, Account, ID, Query } from 'appwrite';
import { StoreSettings, Product } from '../types';

export interface SyncProgressCallback {
  (current: number, total: number, message: string): void;
}

export class AppwriteService {
  private client: Client;
  private databases: Databases;
  private storage: Storage;
  private account: Account;
  private unsubscribeRealtime: (() => void) | null = null;

  constructor(config?: StoreSettings['appwriteConfig']) {
    this.client = new Client();
    if (config && config.isEnabled && config.endpoint && config.projectId && config.projectId.trim()) {
      this.client.setEndpoint(config.endpoint).setProject(config.projectId.trim());
    }
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
    this.account = new Account(this.client);
  }

  updateConfig(config?: StoreSettings['appwriteConfig']) {
    if (config && config.endpoint && config.projectId && config.projectId.trim()) {
      this.client = new Client().setEndpoint(config.endpoint).setProject(config.projectId.trim());
      this.databases = new Databases(this.client);
      this.storage = new Storage(this.client);
      this.account = new Account(this.client);
    }
  }

  isConfigured(config?: StoreSettings['appwriteConfig']): boolean {
    if (!config) return false;
    if (config.isEnabled !== true) return false;
    if (!config.endpoint || !config.projectId || !config.databaseId || !config.productsCollectionId) {
      return false;
    }
    const cleanId = config.projectId.trim().toLowerCase();
    if (!cleanId || cleanId === 'solusi-rumahku-app' || cleanId === 'project-id' || cleanId === 'your-project-id') {
      return false;
    }
    return true;
  }

  async testConnection(config: StoreSettings['appwriteConfig']): Promise<{ success: boolean; message: string }> {
    try {
      if (!config.endpoint || !config.projectId) {
        return { success: false, message: 'Endpoint dan Project ID wajib diisi.' };
      }
      const testClient = new Client().setEndpoint(config.endpoint).setProject(config.projectId);
      const testDatabases = new Databases(testClient);

      if (config.databaseId && config.productsCollectionId) {
        try {
          const res = await testDatabases.listDocuments(config.databaseId, config.productsCollectionId, [
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
            message: `Gagal akses koleksi database: ${err?.message || 'Periksa Database ID, Collection ID, dan izin (Permissions) Appwrite.'}`,
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
      name: product.name,
      brand: product.brand,
      category: product.category,
      type: product.type,
      price: Number(product.price) || 0,
      discountPrice: product.discountPrice !== undefined ? Number(product.discountPrice) : null,
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
          config.databaseId,
          config.productsCollectionId,
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

  // --- Push Single Product to Appwrite (Upsert) ---
  async saveProduct(config: StoreSettings['appwriteConfig'], product: Product): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured(config)) return { success: false, error: 'Appwrite tidak dikonfigurasi.' };
    try {
      this.updateConfig(config);
      const payload = this.productToDocumentPayload(product);
      // Valid Appwrite ID: only alphanumeric, hyphen, underscore, max 36 chars
      const safeDocId = product.id.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 36);

      try {
        await this.databases.updateDocument(
          config.databaseId,
          config.productsCollectionId,
          safeDocId,
          payload
        );
      } catch (updateErr: any) {
        if (updateErr?.code === 404 || updateErr?.message?.includes('not found')) {
          await this.databases.createDocument(
            config.databaseId,
            config.productsCollectionId,
            safeDocId,
            payload
          );
        } else {
          throw updateErr;
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
      const safeDocId = productId.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 36);
      await this.databases.deleteDocument(
        config.databaseId,
        config.productsCollectionId,
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
  ): Promise<{ success: boolean; count: number; error?: string }> {
    if (!this.isConfigured(config)) {
      return { success: false, count: 0, error: 'Konfigurasi Appwrite belum lengkap.' };
    }
    try {
      this.updateConfig(config);
      let successCount = 0;
      const total = products.length;

      for (let i = 0; i < total; i++) {
        const p = products[i];
        if (onProgress) {
          onProgress(i + 1, total, `Mengunggah (${i + 1}/${total}): ${p.name}`);
        }
        const res = await this.saveProduct(config, p);
        if (res.success) {
          successCount++;
        }
      }

      return { success: true, count: successCount };
    } catch (err: unknown) {
      const error = err as Error;
      return { success: false, count: 0, error: error?.message || 'Gagal mengunggah data ke Appwrite.' };
    }
  }

  // --- Subscribe to Realtime Updates ---
  subscribeToProducts(
    config: StoreSettings['appwriteConfig'],
    onProductChange: (type: 'create' | 'update' | 'delete', product: Product | { id: string }) => void
  ): () => void {
    if (!this.isConfigured(config)) {
      return () => {};
    }

    try {
      this.updateConfig(config);
      const channel = `databases.${config.databaseId}.collections.${config.productsCollectionId}.documents`;
      
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

      this.unsubscribeRealtime = unsubscribe;
      return () => {
        try {
          if (unsubscribe && typeof unsubscribe === 'function') {
            unsubscribe();
          }
        } catch {
          // ignore cleanup errors
        }
      };
    } catch (err) {
      console.warn('Gagal mengaktifkan Realtime Appwrite:', err);
      return () => {};
    }
  }
}

export const appwriteService = new AppwriteService();
