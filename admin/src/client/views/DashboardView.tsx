import React from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Search, 
  Image as ImageIcon, 
  Globe, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  HardDrive
} from 'lucide-react';
import { RecordItem, MediaItem, TranslationItem, SeoConfig, SiteConfig, UiLanguage } from '../types';

interface DashboardViewProps {
  records: RecordItem[];
  media?: MediaItem[];
  translations?: TranslationItem[];
  seo?: SeoConfig;
  siteConfig?: SiteConfig | null;
  uiLang: UiLanguage;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  records = [], 
  media = [], 
  translations = [], 
  seo, 
  siteConfig, 
  uiLang 
}) => {
  // 1. Real Records Statistics
  const totalRecords = records.length;
  const publishedRecords = records.filter(r => r.status === 'published').length;
  const syncedRecords = records.filter(r => r.status === 'synced').length;

  // 2. Real SEO Score Calculation
  let computedSeoScore = 0;
  if (seo?.title && seo.title.trim().length >= 10) computedSeoScore += 25;
  if (seo?.description && seo.description.trim().length >= 30) computedSeoScore += 25;
  if (seo?.canonical && seo.canonical.startsWith('http')) computedSeoScore += 20;
  if (seo?.robotsIndex) computedSeoScore += 15;
  if (seo?.ogImage) computedSeoScore += 15;

  // 3. Real Media Storage Calculation
  const totalMediaCount = media.length;
  const totalMediaBytes = media.reduce((acc, m) => acc + (m.size || 0), 0);
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // 4. Real Translations Statistics
  const totalTranslations = translations.length;

  // Dynamic SVG Heights based on real metrics
  const h1 = Math.max(25, 110 - Math.min(80, totalRecords * 7));
  const h2 = Math.max(20, 110 - Math.min(80, totalMediaCount * 12));
  const h3 = Math.max(15, 110 - Math.min(85, totalTranslations * 6));
  const h4 = Math.max(15, 110 - Math.min(90, computedSeoScore * 0.9));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 select-none">
      {/* 4 Real Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Real Records Count */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white p-4 rounded-none border border-slate-300 dark:border-slate-800 space-y-2"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Məlumat Bazası</span>
            <Database className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {totalRecords} <span className="text-xs font-normal text-slate-500">qeyd</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
            <span className="text-slate-700 font-semibold">{publishedRecords} Dərc</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">{syncedRecords} Sinxron</span>
          </div>
        </motion.div>

        {/* Card 2: Real SEO Score */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-none border border-slate-300 dark:border-slate-800 space-y-2"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Real SEO Skoru</span>
            <Search className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {computedSeoScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-600 font-medium truncate">
            {computedSeoScore >= 80 ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Yüksək (Google SERP Uyğun)</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{seo?.canonical ? 'Meta teqlər qismən' : 'Kanonik URL təyin edin'}</span>
              </>
            )}
          </div>
        </motion.div>

        {/* Card 3: Real Media Assets & Size */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white p-4 rounded-none border border-slate-300 dark:border-slate-800 space-y-2"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Media Kitabxanası</span>
            <ImageIcon className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {totalMediaCount} <span className="text-xs font-normal text-slate-500">fayl</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-600 font-mono">
            <HardDrive className="w-3 h-3 text-slate-400" />
            <span>{formatBytes(totalMediaBytes)} həcm</span>
          </div>
        </motion.div>

        {/* Card 4: Real Localization Keys & Languages */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-none border border-slate-300 dark:border-slate-800 space-y-2"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Lokalizasiya</span>
            <Globe className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {totalTranslations} <span className="text-xs font-normal text-slate-500">açar</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <span>4 Dil (AZ, TR, RU, EN)</span>
          </div>
        </motion.div>
      </div>

      {/* Real Metrics Wave Graph */}
      <div className="bg-white rounded-none border border-slate-300 dark:border-slate-800 p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Məzmun & Aktivlik Qrafiki
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Məlumat bazası, media aktivləri və tərcümələrin real paylanması.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 border border-slate-300 dark:border-slate-700">
            Mərkəzi Baza İcmalı
          </span>
        </div>

        {/* SVG Sparkline Graph with Real Heights */}
        <div className="h-44 w-full pt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 600 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="freqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--theme-accent, #0f172a)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--theme-accent, #0f172a)" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={`M0,${h1 + 20} Q100,${h1} 200,${h2} T400,${h3} T600,${h4} L600,120 L0,120 Z`}
              fill="url(#freqGrad)"
            />
            <path
              d={`M0,${h1 + 20} Q100,${h1} 200,${h2} T400,${h3} T600,${h4}`}
              fill="none"
              stroke="var(--theme-accent, #0f172a)"
              strokeWidth="2.5"
            />
            {/* Spark points matching real counts */}
            <circle cx="200" cy={h2} r="3.5" fill="var(--theme-accent, #0f172a)" stroke="var(--theme-surface, #ffffff)" strokeWidth="2" />
            <circle cx="400" cy={h3} r="3.5" fill="var(--theme-accent, #0f172a)" stroke="var(--theme-surface, #ffffff)" strokeWidth="2" />
            <circle cx="600" cy={h4} r="3.5" fill="var(--theme-accent, #0f172a)" stroke="var(--theme-surface, #ffffff)" strokeWidth="2" />
          </svg>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Başlanğıc</span>
          <span>Baza Qeydləri ({totalRecords})</span>
          <span>Media Aktivləri ({totalMediaCount})</span>
          <span>Tərcümələr ({totalTranslations})</span>
          <span>SEO ({computedSeoScore}%)</span>
        </div>
      </div>

      {/* Real Synced Events */}
      <div className="bg-white rounded-none border border-slate-300 dark:border-slate-800 p-5 space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>Son Məzmun Qeydləri</span>
        </h3>

        {records.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Hələ heç bir məzmun qeydi əlavə olunmayıb.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {records.slice(0, 5).map(rec => (
              <div key={rec.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-slate-400 text-[11px]">{rec.id}</span>
                  <span className="font-medium text-slate-800">{rec.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-mono text-[11px]">{rec.date}</span>
                  <span className={`px-2 py-0.5 rounded-none text-[10.5px] font-mono capitalize ${
                    rec.status === 'published' ? 'bg-slate-100 text-slate-800 border border-slate-200' :
                    rec.status === 'synced' ? 'bg-slate-50 text-slate-700 border border-slate-200' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {rec.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
