import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Factory, Clock, TrendingUp,
  CheckCircle2, AlertCircle, MapPin, Package, RefreshCw,
  Search, Image, Languages, FileText,
} from 'lucide-react';
import { UiLanguage } from '../types';

interface RFQ {
  id: string; createdAt: string; buyerCompany: string; country: string;
  items: { productName: string; quantity: string; unit: string }[];
  status: string;
}
interface Producer {
  id: string; createdAt: string; companyName: string; productName: string;
  monthlyCapacity?: string; readinessScore: number; status: string;
}

interface DashboardViewProps {
  records?: any[]; media?: any[]; translations?: any[];
  seo?: any; siteConfig?: any; uiLang: UiLanguage;
}

const STATUS_COLOR: Record<string, string> = {
  'Pending':      'bg-amber-100 text-amber-700 border-amber-200',
  'Under Review': 'bg-blue-100 text-blue-700 border-blue-200',
  'Completed':    'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Rejected':     'bg-red-100 text-red-700 border-red-200',
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'İndicə';
  if (m < 60) return `${m} dəq`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} saat`;
  return `${Math.floor(h / 24)} gün`;
}

// Mini bar chart component
function BarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t-sm ${color} transition-all duration-500`}
            style={{ height: `${Math.max(4, (d.value / max) * 52)}px` }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="text-[9px] text-slate-400 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// Donut chart component
function DonutChart({ pending, total, color }: { pending: number; total: number; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? (pending / total) : 0;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${pct * circ} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        className="transition-all duration-700"
      />
      <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0f172a">
        {total}
      </text>
    </svg>
  );
}

export const DashboardView: React.FC<DashboardViewProps> = ({ records = [], media = [], translations = [], seo, uiLang }) => {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [seoScore, setSeoScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const token = () => localStorage.getItem('octotech_admin_jwt') || '';

  const load = async () => {
    setLoading(true);
    try {
      const [rr, pr, sr] = await Promise.all([
        fetch('/api/azexbuy/rfqs', { headers: { Authorization: `Bearer ${token()}` } }),
        fetch('/api/azexbuy/producers', { headers: { Authorization: `Bearer ${token()}` } }),
        fetch('/api/seo'),
      ]);
      if (rr.ok) setRfqs(await rr.json());
      if (pr.ok) setProducers(await pr.json());
      if (sr.ok) { const sd = await sr.json(); if (sd.computedScore) setSeoScore(sd.computedScore); }
      setLastUpdate(new Date());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Stats
  const isPending = (s?: string) => s === 'Pending' || s === 'Yeni' || s === 'New';
  const isCompleted = (s?: string) => s === 'Completed' || s === 'Tamamlandı';
  const isUnderReview = (s?: string) => s === 'Under Review' || s === 'İncelemede';
  const isClosed = (s?: string) => s === 'Rejected' || s === 'Kapatıldı' || s === 'Closed';

  const rfqPending   = rfqs.filter(r => isPending(r.status)).length;
  const rfqCompleted = rfqs.filter(r => isCompleted(r.status)).length;
  const prodPending  = producers.filter(p => isPending(p.status)).length;
  const prodCompleted = producers.filter(p => isCompleted(p.status)).length;

  // Country distribution (top 5)
  const countryCounts: Record<string, number> = {};
  rfqs.forEach(r => { countryCounts[r.country || 'Unknown'] = (countryCounts[r.country || 'Unknown'] || 0) + 1; });
  const topCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([label, value]) => ({ label, value }));

  // Status distribution for bar chart
  const rfqStatusData = [
    { label: 'Yeni / Pending',  value: rfqPending },
    { label: 'İncelemede',      value: rfqs.filter(r => isUnderReview(r.status)).length },
    { label: 'Tamamlandı',      value: rfqCompleted },
    { label: 'Kapatıldı',       value: rfqs.filter(r => isClosed(r.status)).length },
  ];
  const prodStatusData = [
    { label: 'Yeni / Pending',  value: prodPending },
    { label: 'İncelemede',      value: producers.filter(p => isUnderReview(p.status)).length },
    { label: 'Tamamlandı',      value: prodCompleted },
    { label: 'Kapatıldı',       value: producers.filter(p => isClosed(p.status)).length },
  ];

  // Readiness score avg
  const avgReadiness = producers.length > 0
    ? Math.round(producers.reduce((s, p) => s + p.readinessScore, 0) / producers.length)
    : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">İdarə Paneli</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lastUpdate ? `Son yenilənmə: ${timeAgo(lastUpdate.toISOString())} əvvəl` : 'Yüklənir...'}
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 hover:bg-slate-50 rounded-md text-slate-500 transition-colors cursor-pointer">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Yenilə
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Ümumi RFQ',
            value: rfqs.length,
            sub: `${rfqPending} gözləyir`,
            icon: ShoppingCart,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            pending: rfqPending,
            total: rfqs.length,
            donutColor: '#3b82f6',
          },
          {
            label: 'Ümumi İstehsalçı',
            value: producers.length,
            sub: `${prodPending} gözləyir`,
            icon: Factory,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            pending: prodPending,
            total: producers.length,
            donutColor: '#10b981',
          },
          {
            label: 'Tamamlanan RFQ',
            value: rfqCompleted,
            sub: `${rfqs.length > 0 ? Math.round(rfqCompleted / rfqs.length * 100) : 0}% uğur`,
            icon: CheckCircle2,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            pending: rfqCompleted,
            total: rfqs.length,
            donutColor: '#8b5cf6',
          },
          {
            label: 'Orta Hazırlıq',
            value: `${avgReadiness}`,
            sub: `${producers.length} istehsalçı`,
            icon: TrendingUp,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            pending: avgReadiness,
            total: 100,
            donutColor: '#f97316',
          },
        ].map((card, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <DonutChart pending={card.pending} total={card.total} color={card.donutColor} />
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{card.label}</div>
              <div className="text-2xl font-bold text-slate-900 mt-0.5">{card.value}</div>
              <div className={`text-xs font-medium mt-0.5 ${card.pending > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{card.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Secondary Stat Cards — Records / Media / SEO / Translations */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'İçerik Kayıtları',
            value: records.length,
            sub: `${records.filter((r: any) => r.status === 'published').length} yayınlandı`,
            icon: FileText,
            color: 'text-sky-600',
            bg: 'bg-sky-50',
          },
          {
            label: 'Media Faylları',
            value: media.length,
            sub: `${(media.reduce((s: number, m: any) => s + (m.size || 0), 0) / 1024 / 1024).toFixed(1)} MB`,
            icon: Image,
            color: 'text-pink-600',
            bg: 'bg-pink-50',
          },
          {
            label: 'SEO Skoru',
            value: `${seoScore}/100`,
            sub: seoScore >= 80 ? 'Əla' : seoScore >= 60 ? 'Orta' : 'Zəif',
            icon: Search,
            color: seoScore >= 80 ? 'text-emerald-600' : seoScore >= 60 ? 'text-amber-600' : 'text-red-500',
            bg: seoScore >= 80 ? 'bg-emerald-50' : seoScore >= 60 ? 'bg-amber-50' : 'bg-red-50',
          },
          {
            label: 'Lokalizasiya Açarları',
            value: translations.length,
            sub: '4 dil (AZ/TR/RU/EN)',
            icon: Languages,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
          },
        ].map((card, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 + i * 0.06 }}
            className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
              <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{card.label}</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{card.value}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 truncate">{card.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* RFQ Status Bar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShoppingCart className="w-3.5 h-3.5 text-blue-500" /> RFQ Status Paylanması
          </div>
          <BarChart data={rfqStatusData} color="bg-blue-400" />
        </motion.div>

        {/* Producer Status Bar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Factory className="w-3.5 h-3.5 text-emerald-500" /> İstehsalçı Status Paylanması
          </div>
          <BarChart data={prodStatusData} color="bg-emerald-400" />
        </motion.div>

        {/* Top Countries */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-purple-500" /> Ən Çox Sorğu Göndərən Ölkələr
          </div>
          {topCountries.length === 0 ? (
            <div className="h-16 flex items-center justify-center text-xs text-slate-300">Məlumat yoxdur</div>
          ) : (
            <BarChart data={topCountries} color="bg-purple-400" />
          )}
        </motion.div>
      </div>

      {/* Recent RFQs + Producers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Recent RFQs */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-blue-500" /> Son RFQ Sorğuları
            </h3>
            <span className="text-[10px] text-slate-400">{rfqs.length} ümumi</span>
          </div>
          {rfqs.length === 0 ? (
            <div className="py-8 flex flex-col items-center gap-2 text-slate-300">
              <ShoppingCart className="w-8 h-8" />
              <span className="text-xs">Heç bir RFQ tapılmadı</span>
            </div>
          ) : (
            <div className="space-y-2">
              {rfqs.slice(0, 5).map(r => (
                <div key={r.id} className="flex items-center justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-800 truncate">{r.buyerCompany}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-2.5 h-2.5" />{r.country}
                      {r.items?.length > 0 && (
                        <span className="ml-1 flex items-center gap-0.5">
                          <Package className="w-2.5 h-2.5" />
                          {r.items[0].productName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${STATUS_COLOR[r.status] || 'bg-slate-100 text-slate-500'}`}>
                      {r.status}
                    </span>
                    <span className="text-[10px] text-slate-300 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />{timeAgo(r.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Producers */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Factory className="w-3.5 h-3.5 text-emerald-500" /> Son İstehsalçılar
            </h3>
            <span className="text-[10px] text-slate-400">{producers.length} ümumi</span>
          </div>
          {producers.length === 0 ? (
            <div className="py-8 flex flex-col items-center gap-2 text-slate-300">
              <Factory className="w-8 h-8" />
              <span className="text-xs">Heç bir istehsalçı tapılmadı</span>
            </div>
          ) : (
            <div className="space-y-2">
              {producers.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-800 truncate">{p.companyName}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Package className="w-2.5 h-2.5" />{p.productName}
                      {p.monthlyCapacity && <span className="ml-1">· {p.monthlyCapacity}/ay</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                      {p.readinessScore}/100
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${STATUS_COLOR[p.status] || 'bg-slate-100 text-slate-500'}`}>
                      {p.status}
                    </span>
                    <span className="text-[10px] text-slate-300 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />{timeAgo(p.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Pending alert */}
      {(rfqPending + prodPending) > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
          className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-xs text-amber-700 font-medium">
            <strong>{rfqPending + prodPending}</strong> gözləyən sorğu var — Gelen Qutusu'ndan nəzərdən keçirin.
          </span>
        </motion.div>
      )}
    </div>
  );
};
