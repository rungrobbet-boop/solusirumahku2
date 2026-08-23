import { Product } from '../types';

export function exportProductsToCSV(products: Product[], filename = 'solusi-rumahku-produk.csv') {
  const headers = [
    'ID',
    'Nama Produk',
    'Merk',
    'Kategori',
    'Tipe',
    'Harga Normal',
    'Harga Diskon',
    'Jumlah Stok',
    'Jumlah Packing',
    'Satuan Packing',
    'Produk Terbaru (true/false)',
    'Peringkat Favorit (1-20 / kosong)',
    'URL Gambar Utama',
    'Deskripsi Produk',
  ];

  const rows = products.map((p) => [
    p.id || '',
    `"${(p.name || '').replace(/"/g, '""')}"`,
    `"${(p.brand || '').replace(/"/g, '""')}"`,
    `"${(p.category || '').replace(/"/g, '""')}"`,
    `"${(p.type || '').replace(/"/g, '""')}"`,
    p.price || 0,
    p.discountPrice || '',
    p.stockCount !== undefined && p.stockCount !== null ? p.stockCount : '',
    p.packingQuantity || '',
    `"${(p.packingUnit || '').replace(/"/g, '""')}"`,
    p.isLatest ? 'true' : 'false',
    p.isFavoriteMonthRank || '',
    `"${(p.mainImage || '').replace(/"/g, '""')}"`,
    `"${(p.description || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseProductsCSV(csvText: string): Partial<Product>[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Helper to split CSV row taking quotes into account
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headerLine = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const parsedProducts: Partial<Product>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || values.every((v) => !v)) continue;

    const rowObj: Record<string, string> = {};
    headerLine.forEach((header, idx) => {
      rowObj[header] = values[idx] || '';
    });

    // Flexible column matching
    const id = rowObj['id'] || `prod-${Date.now()}-${i}`;
    const name = rowObj['namaproduk'] || rowObj['nama'] || rowObj['name'] || values[1] || '';
    if (!name) continue;

    const brand = rowObj['merk'] || rowObj['brand'] || values[2] || 'Umum';
    const category = rowObj['kategori'] || rowObj['category'] || values[3] || 'Lain-Lain';
    const type = rowObj['tipe'] || rowObj['type'] || values[4] || 'Standar';
    const priceStr = rowObj['harganormal'] || rowObj['harga'] || rowObj['price'] || values[5] || '0';
    const price = parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;

    const discStr = rowObj['hargadiskon'] || rowObj['diskon'] || rowObj['discountprice'] || values[6] || '';
    const discountPrice = discStr ? parseInt(discStr.replace(/[^0-9]/g, ''), 10) || undefined : undefined;

    const stockStr = rowObj['jumlahstok'] || rowObj['stok'] || rowObj['stockcount'] || values[7] || '';
    const stockCount = stockStr !== '' ? parseInt(stockStr.replace(/[^0-9]/g, ''), 10) || 0 : undefined;

    const packQtyStr = rowObj['jumlahpacking'] || rowObj['packingqty'] || rowObj['packingquantity'] || values[8] || '';
    const packingQuantity = packQtyStr ? parseInt(packQtyStr.replace(/[^0-9]/g, ''), 10) || undefined : undefined;

    const packingUnit = rowObj['satuanpacking'] || rowObj['packingunit'] || values[9] || undefined;
    const isLatest = (rowObj['produkterbaru'] || rowObj['islatest'] || values[10] || '').toLowerCase() === 'true';

    const favRankStr = rowObj['peringkatfavorit'] || rowObj['favorit'] || values[11] || '';
    const isFavoriteMonthRank = favRankStr ? parseInt(favRankStr.replace(/[^0-9]/g, ''), 10) || undefined : undefined;

    const mainImage = rowObj['urlgambarutama'] || rowObj['gambar'] || rowObj['image'] || values[12] || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500';
    const description = rowObj['deskripsiproduk'] || rowObj['deskripsi'] || rowObj['description'] || values[13] || '';

    parsedProducts.push({
      id,
      name,
      brand,
      category,
      type,
      price,
      discountPrice,
      stockCount,
      packingQuantity,
      packingUnit,
      isLatest,
      isFavoriteMonthRank,
      mainImage,
      images: [mainImage],
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return parsedProducts;
}
