import React from 'react';
import { AlertTriangle, MessageCircle, X, ShieldAlert } from 'lucide-react';

interface WhatsAppConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  targetPhoneNumber: string;
}

export const WhatsAppConfirmModal: React.FC<WhatsAppConfirmModalProps> = ({
  isOpen,
  onClose,
  onProceed,
  targetPhoneNumber,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
      id="whatsapp-confirm-modal"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-amber-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-center text-slate-900 mb-2">
          Pemberitahuan Penting Pesanan
        </h3>

        {/* Mandatory User Notification Notice */}
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-center mb-5">
          <p className="text-xs sm:text-sm font-extrabold text-amber-900 leading-snug">
            &ldquo;Stok dan Diskon Tidak Mengikat, Selalu Lakukan Konfirmasi Melalui Whatsapp&rdquo;
          </p>
          <p className="text-[11px] text-amber-800 mt-2 leading-normal">
            Daftar belanja Anda akan dialihkan secara otomatis ke admin toko untuk verifikasi ketersediaan stok fisik terbaru dan total akhir.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors order-2 sm:order-1"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onProceed();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white text-sm font-bold shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
            id="btn-confirm-whatsapp-proceed"
          >
            <MessageCircle className="w-4 h-4" />
            Lanjut ke WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
