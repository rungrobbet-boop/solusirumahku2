import React from 'react';
import {
  Phone,
  Clock,
  MessageCircle,
  Lock,
  Mail,
  MapPin,
} from 'lucide-react';
import { StoreSettings, CategoryItem } from '../types';
import { Logo } from './Logo';
import { cleanPhoneNumber } from '../utils/formatters';

interface FooterProps {
  settings: StoreSettings;
  categories: CategoryItem[];
  onNavigateTab: (tab: any) => void;
  onSelectCategory: (categoryId: string) => void;
  onOpenAdmin: () => void;
  onOpenWhatsApp: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  categories,
  onNavigateTab,
  onSelectCategory,
  onOpenAdmin,
  onOpenWhatsApp,
}) => {
  const footerAlign = settings.footerLayoutAlign || 'left';
  const copyrightText =
    settings.footerCopyrightText ||
    `© ${new Date().getFullYear()} ${settings.storeName}. Hak Cipta Dilindungi.`;

  const alignClasses =
    footerAlign === 'center'
      ? 'items-center text-center'
      : footerAlign === 'right'
      ? 'items-end text-right'
      : 'items-start text-left';

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 pt-12 pb-8 mt-16" id="app-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
          {/* 1. Brand Col: Hanya Menampilkan Logo Saja (Kolom 1) */}
          <div className={`flex flex-col ${alignClasses} justify-start`}>
            <div className="inline-block">
              <Logo
                size={settings.footerLogoSize || 'md'}
                customPx={settings.footerCustomLogoPx}
                customLogoUrl={settings.customLogoUrl}
                showText={false}
                align={footerAlign}
                textColorMode="dark"
              />
            </div>
          </div>

          {/* 2. Quick Nav Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigateTab('home')}
                  className="hover:text-emerald-400 transition-colors text-slate-400 hover:underline text-left"
                >
                  Beranda Utama
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('categories')}
                  className="hover:text-emerald-400 transition-colors text-slate-400 hover:underline text-left"
                >
                  Katalog Kategori
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('brands')}
                  className="hover:text-emerald-400 transition-colors text-slate-400 hover:underline text-left"
                >
                  Daftar Merk & Tipe
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('infoTrend')}
                  className="hover:text-emerald-400 transition-colors text-slate-400 hover:underline text-left"
                >
                  Info & Trend Edukasi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('about')}
                  className="hover:text-emerald-400 transition-colors text-slate-400 hover:underline text-left"
                >
                  Tentang Kami
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('contact')}
                  className="hover:text-emerald-400 transition-colors text-slate-400 hover:underline text-left"
                >
                  Hubungi Kami
                </button>
              </li>
            </ul>
          </div>

          {/* 3. Layanan WhatsApp CS (Setelah Navigasi Cepat, Sebelum Kontak & Operasional) */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Layanan CS
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Butuh konsultasi produk, cek ketersediaan stok, atau penawaran proyek? Hubungi tim kami langsung.
            </p>
            <div className="pt-1">
              <button
                onClick={onOpenWhatsApp}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white text-xs font-bold shadow-xs transition-colors"
                title="Hubungi CS WhatsApp"
                id="footer-btn-whatsapp"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp CS</span>
              </button>
            </div>
          </div>

          {/* 4. Contact & Operational Info Synchronized */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Kontak & Operasional
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block">WhatsApp & CS</span>
                  <a
                    href={`https://wa.me/${cleanPhoneNumber(settings.phoneWhatsApp || '6281234567890')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-slate-200 hover:text-emerald-400 transition-colors"
                  >
                    +{cleanPhoneNumber(settings.phoneWhatsApp)}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500">Hari & Jam Operasional</span>
                  <span className="font-semibold text-slate-200">
                    {settings.operationalDays || 'Senin - Sabtu (Kecuali Libur Nasional)'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    {settings.businessHours || '08.00 - 17.30 WIB'}
                  </span>
                </div>
              </div>

              {settings.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-500 block">Email Toko</span>
                    <a
                      href={`mailto:${settings.email}`}
                      className="font-medium text-slate-300 hover:text-emerald-400 transition-colors truncate block"
                    >
                      {settings.email}
                    </a>
                  </div>
                </div>
              )}

              {settings.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Lokasi & Jangkauan</span>
                    <span className="text-[11px] text-slate-300 leading-snug block">
                      {settings.address}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>{copyrightText}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
              id="footer-btn-open-admin"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Akses Admin Toko</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
