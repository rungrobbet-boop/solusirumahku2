import React, { useState, useMemo } from 'react';
import {
  Search,
  History,
  TrendingUp,
  Calendar,
  Eye,
  Video,
  ArrowRight,
  Sparkles,
  X,
} from 'lucide-react';
import { InfoTrendItem } from '../types';

interface InfoTrendViewProps {
  articles: InfoTrendItem[];
  onSelectArticle: (article: InfoTrendItem) => void;
}

export const InfoTrendView: React.FC<InfoTrendViewProps> = ({ articles, onSelectArticle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([
    'Lampu LED hemat energi',
    'Mesin bor tembok',
    'Tips instalasi MCB',
    'Smart lighting',
  ]);

  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    const trimmed = query.trim();
    if (!searchHistory.includes(trimmed)) {
      setSearchHistory([trimmed, ...searchHistory.slice(0, 7)]);
    }
  };

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchQuery =
        !searchQuery ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchTag = !selectedTag || art.tags.includes(selectedTag) || art.category === selectedTag;

      return matchQuery && matchTag;
    });
  }, [articles, searchQuery, selectedTag]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      set.add(a.category);
      a.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [articles]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8" id="info-trend-view-container">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#065f46] text-white p-6 sm:p-10 mb-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-bold uppercase tracking-wider backdrop-blur-xs mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            Wawasan & Edukasi Teknik
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
            Info &amp; Trend SST CATALOG
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed mb-6">
            Panduan teknis, ulasan tren pencahayaan pintar, tips perawatan instalasi listrik, dan rekomendasi perkakas kerja teknik terbaik dari para teknisi berpengalaman.
          </p>

          {/* Search Box */}
          <div className="relative">
            <div className="flex items-center bg-white rounded-2xl p-1.5 shadow-md">
              <Search className="w-5 h-5 text-slate-600 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchSubmit(searchQuery);
                }}
                placeholder="Cari artikel, topik, atau kata kunci..."
                className="w-full text-slate-800 text-xs sm:text-sm px-3 py-2 bg-transparent focus:outline-none placeholder:text-slate-600"
                id="input-search-info-trend"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 mr-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleSearchSubmit(searchQuery)}
                className="px-4 py-2 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0"
              >
                Cari
              </button>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-80 h-80 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
      </div>

      {/* Search History & Topics */}
      <div className="mb-8 flex flex-col gap-3">
        {/* Search History Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <History className="w-3.5 h-3.5 text-[#065f46]" />
            Riwayat Pencarian:
          </span>
          {searchHistory.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchQuery(item);
                handleSearchSubmit(item);
              }}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-[#ecfdf5] hover:text-[#065f46] border border-slate-200 text-slate-700 transition-colors"
            >
              {item}
            </button>
          ))}
          {searchHistory.length > 0 && (
            <button
              onClick={() => setSearchHistory([])}
              className="text-[11px] text-slate-600 hover:text-rose-600 underline ml-1"
            >
              Hapus Riwayat
            </button>
          )}
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedTag(null)}
            className={`text-xs px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              selectedTag === null
                ? 'bg-[#064e3b] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua Topik ({articles.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
          <p className="text-base font-bold text-slate-700 mb-1">Tidak ada artikel yang cocok</p>
          <p className="text-xs text-slate-600 mb-4">
            Coba gunakan kata kunci lain atau pilih topik dari daftar di atas.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTag(null);
            }}
            className="px-4 py-2 rounded-xl bg-[#065f46] text-white text-xs font-bold"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className="group bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#065f46]/40 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
              id={`article-card-${art.id}`}
            >
              {/* Cover Image / Video badge */}
              <div className="relative w-full aspect-video bg-slate-100 overflow-hidden">
                <img
                  src={art.imageUrl || 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&auto=format&fit=crop&q=80'}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#064e3b]/90 text-white shadow-xs backdrop-blur-xs">
                    {art.category}
                  </span>
                </div>

                {art.videoUrl && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-600 text-white shadow-xs">
                      <Video className="w-3 h-3" />
                      Video
                    </span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-600 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {art.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {art.views} views
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#065f46] transition-colors leading-snug line-clamp-2 mb-2">
                    {art.title}
                  </h3>

                  <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">
                    {art.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#065f46] group-hover:text-[#047857]">
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
