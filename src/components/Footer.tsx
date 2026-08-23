import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Award,
  ChevronRight,
  MessageCircle,
  Lock,
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
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 pt-12 pb-8 mt-16" id="app-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-800/80">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <Logo size="md" />
              <div>
                <h3 className="text-base font-black text-white">{settings.storeName}</h3>
                <p className="text-[11px] text-emerald-400 font-semibold">{settings.tagline}</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Pusat distributor dan ritel peralatan listrik, perkakas teknik, dan perlengkapan rumah tangga berkualitas terstandar SNI di {settings.city}.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onOpenWhatsApp}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white text-xs font-bold shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Chat WhatsApp CS
              </button>
            </div>
          </div>

          {/* Nav Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigateTab('home')}
                  className="hover:text-emerald-400 transition-colors text-slate-400 hover:underline"
                >
                  Beranda Utama
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('categories')}
                  className="hover:text-emerald-400 transition-colors text-slate-400 hover:underline"
                >
                  Katalog Kategori
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('brands')}
                  className="hover:text-emerald-400 transition-colors text-slate-400 hover:underline"
                >
                  Daftar Merk & Tipe
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('infoTrend')}
                  className="hover:text-emerald-400 transition-colors text-slate-400 hover:underline"
                >
                  Info & Trend Edukasi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('about')}
                  className="hover:text-emerald-400 transition-colors text-slate-400 hover:underline"
                >
                  Tentang Kami & Kontak
                </button>
              </li>
            </ul>
          </div>

          {/* Categories Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Kategori Terpopuler
            </h4>
            <ul className="space-y-1.5 text-xs">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onNavigateTab('categories');
                      onSelectCategory(cat.id);
                    }}
                    className="hover:text-emerald-400 transition-colors text-slate-400 line-clamp-1 text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Kontak & Operasional
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{settings.address}, {settings.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>+{cleanPhoneNumber(settings.phoneWhatsApp)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{settings.businessHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {settings.storeName}. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
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
