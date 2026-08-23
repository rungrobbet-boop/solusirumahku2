import React from 'react';
import { X, Calendar, User, Eye, Tag, Video, Image as ImageIcon, Share2, ArrowLeft } from 'lucide-react';
import { InfoTrendItem } from '../types';

interface InfoTrendDetailModalProps {
  item: InfoTrendItem | null;
  onClose: () => void;
}

export const InfoTrendDetailModal: React.FC<InfoTrendDetailModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const isVideoYoutube = item.videoUrl?.includes('youtube') || item.videoUrl?.includes('youtu.be');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={onClose}
      id="info-trend-detail-modal"
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-bold text-[#065f46] hover:text-[#047857]"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Info & Trend
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-700 transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 sm:p-8 flex-1">
          {/* Category & Date */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 mb-3">
            <span className="font-bold text-[#065f46] bg-[#ecfdf5] px-2.5 py-1 rounded-full uppercase tracking-wider">
              {item.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {item.date}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {item.author}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {item.views} kali dibaca
            </span>
          </div>

          {/* Article Title */}
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-4">
            {item.title}
          </h1>

          {/* Media Player / Image Display */}
          {item.videoUrl ? (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6 bg-black shadow-md">
              {isVideoYoutube ? (
                <iframe
                  src={item.videoUrl}
                  title={item.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={item.videoUrl} controls className="w-full h-full object-cover">
                  Browser Anda tidak mendukung tag video.
                </video>
              )}
            </div>
          ) : item.imageUrl ? (
            <div className="relative w-full max-h-[380px] rounded-2xl overflow-hidden mb-6 bg-slate-100 shadow-xs">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : null}

          {/* Summary Quote */}
          {item.summary && (
            <div className="p-4 rounded-2xl bg-[#f0fdf4] border-l-4 border-[#15803d] mb-6">
              <p className="text-sm font-semibold text-emerald-950 italic">
                &ldquo;{item.summary}&rdquo;
              </p>
            </div>
          )}

          {/* Full Article Content */}
          <div className="prose prose-emerald max-w-none text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line mb-8">
            {item.content}
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                Tags:
              </span>
              {item.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-medium transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
