import React, { useState } from 'react';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ShieldCheck,
  Award,
  Users,
  Image as ImageIcon,
  Video,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { StoreSettings, GalleryMediaItem } from '../types';
import { Logo } from './Logo';
import { cleanPhoneNumber } from '../utils/formatters';

interface AboutContactViewProps {
  settings: StoreSettings;
  galleryMedia: GalleryMediaItem[];
  onOpenWhatsApp: () => void;
}

export const AboutContactView: React.FC<AboutContactViewProps> = ({
  settings,
  galleryMedia,
  onOpenWhatsApp,
}) => {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const activeMedia = galleryMedia[activeMediaIndex] || galleryMedia[0];

  const targetWaNumber = cleanPhoneNumber(settings.phoneWhatsApp || '6281234567890');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8" id="about-contact-view">
      {/* Hero Section: Brand & Context Purpose */}
      <div className="rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#065f46] text-white p-6 sm:p-12 mb-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-bold uppercase tracking-wider backdrop-blur-xs mb-4">
            <Building2 className="w-4 h-4" />
            Profil & Visi Toko
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-4">
            Tentang {settings.storeName}
          </h1>

          <p className="text-sm sm:text-lg text-emerald-50 leading-relaxed font-medium mb-6">
            {settings.tagline}
          </p>

          {/* Context & Purpose Card (Admin Editable Context) */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-5 sm:p-6 backdrop-blur-md">
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-emerald-200 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-300" />
              Untuk Siapa Aplikasi Ini & Apa Tujuannya?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed whitespace-pre-line">
              {settings.contextAbout}
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block opacity-20 pointer-events-none">
          <Logo size="xl" showText={false} />
        </div>
      </div>

      {/* Core Strengths Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ecfdf5] text-[#065f46] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">100% Produk Original</h4>
            <p className="text-xs text-slate-700 leading-normal">
              Seluruh produk berasal dari distributor resmi Philips, Schneider, Panasonic, Bosch, dan Makita.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ecfdf5] text-[#065f46] flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Standar SNI & Garansi</h4>
            <p className="text-xs text-slate-700 leading-normal">
              Keamanan kelistrikan terjamin dengan sertifikasi SNI dan perlindungan garansi resmi toko.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ecfdf5] text-[#065f46] flex items-center justify-center shrink-0">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Konsultasi Ramah via WA</h4>
            <p className="text-xs text-slate-700 leading-normal">
              Dukungan pemilihan spesifikasi teknis dan pemesanan instan langsung terhubung ke WhatsApp toko.
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Section (Up to 10 background & main media items from admin) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <span className="text-xs font-bold text-[#065f46] uppercase tracking-wider bg-[#ecfdf5] px-2.5 py-1 rounded-md inline-block mb-1">
              Galeri Profil & Fasilitas
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Dokumentasi Toko, Gudang & Workshop
            </h2>
          </div>
          <span className="text-xs text-slate-700 font-semibold">
            {galleryMedia.length} Media Tersedia
          </span>
        </div>

        {activeMedia && (
          <div className="flex flex-col gap-4">
            {/* Featured Active Media Stage */}
            <div className="relative w-full aspect-video sm:aspect-21/9 rounded-2xl overflow-hidden bg-slate-900 shadow-md">
              {activeMedia.type === 'video' ? (
                <iframe
                  src={activeMedia.mediaUrl}
                  title={activeMedia.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img
                  src={activeMedia.backgroundUrl || activeMedia.mediaUrl}
                  alt={activeMedia.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Caption Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 bg-gradient-to-t from-black/85 via-black/50 to-transparent text-white pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#065f46] px-2 py-0.5 rounded text-white inline-block mb-1">
                  {activeMedia.category || 'Galeri Toko'}
                </span>
                <h3 className="text-base sm:text-xl font-bold leading-tight">
                  {activeMedia.title}
                </h3>
                {activeMedia.caption && (
                  <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl line-clamp-2">
                    {activeMedia.caption}
                  </p>
                )}
              </div>
            </div>

            {/* Media Selector Thumbnails (Up to 10 items) */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-2">
              {galleryMedia.slice(0, 10).map((media, idx) => (
                <button
                  key={media.id}
                  onClick={() => setActiveMediaIndex(idx)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                    activeMediaIndex === idx
                      ? 'border-[#065f46] ring-2 ring-[#065f46]/30 scale-95'
                      : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                  title={media.title}
                >
                  <img
                    src={media.mediaUrl}
                    alt={media.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white">
                    {media.type === 'video' ? (
                      <Video className="w-3.5 h-3.5 fill-white" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact & Location Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact Details Card */}
        <div className="md:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-[#065f46] uppercase tracking-wider bg-[#ecfdf5] px-2.5 py-1 rounded-md inline-block mb-1">
              Hubungi Kami
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-6">
              Layanan Informasi & Order
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#ecfdf5] text-[#065f46] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-900 block">Alamat Toko & Gudang:</strong>
                  <span>{settings.address}</span>
                  <span className="block text-slate-700 font-semibold">{settings.city}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#ecfdf5] text-[#065f46] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-900 block">Jam Operasional:</strong>
                  <span>{settings.businessHours}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#ecfdf5] text-[#065f46] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-900 block">Email Resmi:</strong>
                  <span>{settings.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#ecfdf5] text-[#065f46] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-900 block">WhatsApp Toko:</strong>
                  <span>+{targetWaNumber}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100">
            <button
              onClick={onOpenWhatsApp}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#15803d] hover:bg-[#166534] text-white text-sm sm:text-base font-bold shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
              id="btn-about-open-whatsapp"
            >
              <MessageCircle className="w-5 h-5 fill-white text-[#15803d]" />
              Chat Langsung via WhatsApp
            </button>
          </div>
        </div>

        {/* Location & Delivery Coverage Card */}
        <div className="md:col-span-6 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-md inline-block mb-1">
              Pengiriman & Ekspedisi
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-4">
              Jangkauan Pengiriman Seluruh Indonesia
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              Kami melayani pengiriman peralatan proyek, rol kabel, instalasi lampu, dan perkakas teknik ke seluruh wilayah Indonesia melalui ekspedisi kargo terpercaya, kurir instan (Jabodetabek), maupun ambil langsung di toko.
            </p>

            <div className="space-y-2.5 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Pengemasan aman standar industri (Dus tebal + Bubble wrap)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Dukungan Ekspedisi: JNE, J&T, SiCepat, Wahana, Dakota Cargo, Indah Logistik</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Same-Day & Instant Delivery via GoSend / GrabExpress untuk area terjangkau</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Solusi Rumahku • Mitra Proyek & Rumah Idaman</span>
            <span className="font-bold text-emerald-400">Terpercaya Sejak 2020</span>
          </div>
        </div>
      </div>
    </div>
  );
};
