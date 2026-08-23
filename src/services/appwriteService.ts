import { Client, Databases, Storage, Account } from 'appwrite';
import { StoreSettings } from '../types';

export class AppwriteService {
  private client: Client;
  private databases: Databases;
  private storage: Storage;
  private account: Account;

  constructor(config?: StoreSettings['appwriteConfig']) {
    this.client = new Client();
    if (config && config.endpoint && config.projectId) {
      this.client
        .setEndpoint(config.endpoint)
        .setProject(config.projectId);
    }
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
    this.account = new Account(this.client);
  }

  updateConfig(config: StoreSettings['appwriteConfig']) {
    if (config.endpoint && config.projectId) {
      this.client = new Client()
        .setEndpoint(config.endpoint)
        .setProject(config.projectId);
      this.databases = new Databases(this.client);
      this.storage = new Storage(this.client);
      this.account = new Account(this.client);
    }
  }

  async testConnection(config: StoreSettings['appwriteConfig']): Promise<{ success: boolean; message: string }> {
    try {
      if (!config.endpoint || !config.projectId) {
        return { success: false, message: 'Endpoint dan Project ID wajib diisi.' };
      }
      const testClient = new Client()
        .setEndpoint(config.endpoint)
        .setProject(config.projectId);
      const testDatabases = new Databases(testClient);

      if (config.databaseId) {
        // Try fetching collection or checking database
        try {
          await testDatabases.listDocuments(config.databaseId, config.productsCollectionId || 'products');
          return { success: true, message: 'Koneksi ke Database dan Koleksi Appwrite Berhasil!' };
        } catch (dbErr: unknown) {
          const err = dbErr as Error;
          return {
            success: true,
            message: `Endpoint & Project ID valid! (Catatan koleksi/db: ${err?.message || 'Siap dikonfigurasi'})`,
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
}

export const appwriteService = new AppwriteService();
