import React from 'react';
import { X, Smartphone, Wifi, Battery, Signal, Sparkles } from 'lucide-react';

interface AndroidPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidPreviewModal: React.FC<AndroidPreviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={onClose}
      id="android-preview-modal"
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md bg-slate-900 rounded-[42px] p-3 shadow-2xl border-4 border-slate-700 flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Android Device Top Speaker & Camera Notch */}
        <div className="flex items-center justify-between px-6 py-2 text-white/80 text-[10px] select-none">
          <span>09:41</span>
          <div className="w-16 h-4 bg-black rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
          </div>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Close Button Floating */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-slate-800 shadow-lg flex items-center justify-center z-10 hover:bg-slate-100"
          title="Tutup Preview Android"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Android Screen Frame Content */}
        <div className="w-full h-[620px] rounded-[32px] overflow-hidden bg-slate-50 relative flex flex-col border border-slate-800">
          <iframe
            src={window.location.href}
            title="SST CATALOG Android Preview"
            className="w-full h-full border-none"
          />
        </div>

        {/* Android Bottom Navigation Bar Indicator */}
        <div className="py-2 flex items-center justify-center">
          <div className="w-32 h-1 bg-slate-500 rounded-full" />
        </div>
      </div>
    </div>
  );
};
