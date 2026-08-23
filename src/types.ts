export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  type: string;
  price: number;
  discountPrice?: number;
  stockCount?: number | null; // null or undefined means "Tanya Admin", number > 0 means "Tersedia"
  mainImage: string;
  images: string[]; // up to 5 images (file data urls or web urls)
  description: string;
  specifications: Record<string, string>;
  packingQuantity?: number | null; // Jumlah satuan per packing untuk pembelian partai / grosir
  packingUnit?: 'Pieces' | 'Roll' | 'Slop' | 'Renteng' | 'Yard' | 'Meter' | 'Set' | 'Unit' | 'Lusin' | 'Pack' | 'Karung' | 'Kotak' | 'Box / Carton' | string; // Satuan packing
  isFavoriteMonthRank?: number | null; // 1 to 20 rank for "Produk Favorit Bulan ini"
  isLatest?: boolean;
  rating?: number;
  salesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  logoUrl?: string;
  description?: string;
  displayOrder: number;
  productCount?: number;
}

export interface BrandItem {
  id: string;
  name: string;
  logoUrl?: string;
  description?: string;
  featured?: boolean;
}

export interface ProductTypeItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
}

export interface InfoTrendItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  author: string;
  date: string;
  tags: string[];
  views: number;
}

export interface GalleryMediaItem {
  id: string;
  title: string;
  type: 'image' | 'video';
  mediaUrl: string;
  backgroundUrl?: string;
  caption?: string;
  category?: string;
  isFeatured?: boolean;
}

export interface CustomManualFeature {
  id: string;
  title: string;
  description: string;
  iconName: string;
  linkUrl?: string;
  bannerUrl?: string;
  badgeText?: string;
  isActive: boolean;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  phoneWhatsApp: string;
  contextAbout: string; // "Untuk siapa aplikasi ini dan apa tujuannya"
  address: string;
  city: string;
  businessHours: string;
  email: string;
  instagramUrl?: string;
  facebookUrl?: string;
  lowStockThreshold: number;
  appwriteConfig: {
    endpoint: string;
    projectId: string;
    databaseId: string;
    productsCollectionId: string;
    infoCollectionId: string;
    bucketId: string;
    isEnabled: boolean;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
  notes?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  role: 'manager' | 'admin';
  createdAt: string;
  lastLogin?: string;
}
