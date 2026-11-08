import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart, Factory, TrendingUp, Clock, Trash2, RefreshCw,
  CheckCircle, XCircle, ChevronDown, ChevronUp, Wifi, WifiOff,
  Package, Globe, AlertCircle, Mail, UserCheck, MessageSquare,
  FileText, ArrowRight, BarChart3,
} from 'lucide-react';
import { UiLanguage } from '../types';

interface AzexbuyViewProps { uiLang: UiLanguage; }

interface RFQ {
  id: string; createdAt: string; buyerCompany: string; country: string;
  contactName: string; email: string; phone?: string; incoterm?: string;
  destinationPort?: string; corridorRoute?: string;
  requiredCertifications: string[];
  items: { productName: string; hsCode: string; quantity: string; unit: string }[];
  notes?: string; status: string;
  assignedTo?: string; internalNotes?: string;
}

interface Producer {
  id: string; createdAt: string; companyName: string; voenTin: string;
  economicRegion?: string; contactPerson?: string; email: string; phone?: string;
  productName: string; hsCode?: string; monthlyCapacity?: string;
  certifications: string[]; targetMarkets: string[];
  outsourcedDeskRequested: boolean; readinessScore: number; status: string;
  assignedTo?: string; internalNotes?: string;
}

interface Contact {
  id: string; createdAt: string; fullName: string; organization: string;
  email: string; inquiryType: string; message: string; status: string;
}

interface Stats {
  rfqCount: number; producerCount: number; pendingRfqs: number;
  activeProducers: number; redis: string;
}

export const WORKFLOW_STATUSES = [
  'Yeni',
  'İncelemede',
  'Ek bilgi bekleniyor',
  'Tedarikçi/alıcı aramasında',
  'Teklif hazırlanıyor',
  'Müşteriye gönderildi',
  'Tamamlandı',
  'Kapatıldı',
] as const;

const STATUS_COLORS: Record<string, string> = {
  // Standart 8 CRM Statusu
  'Yeni': 'bg-blue-50 text-blue-700 border-blue-200',
  'İncelemede': 'bg-purple-50 text-purple-700 border-purple-200',
  'Ek bilgi bekleniyor': 'bg-amber-50 text-amber-700 border-amber-200',
  'Tedarikçi/alıcı aramasında': 'bg-sky-50 text-sky-700 border-sky-200',
  'Teklif hazırlanıyor': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Müşteriye gönderildi': 'bg-teal-50 text-teal-700 border-teal-200',
  'Tamamlandı': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Kapatıldı': 'bg-slate-100 text-slate-600 border-slate-200',

  // Əvvəlki qeydlərlə geriyə uyğunluq
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'Verified & Routing to Suppliers': 'bg-blue-50 text-blue-700 border-blue-200',
  'Under Review': 'bg-purple-50 text-purple-700 border-purple-200',
  'Audit Scheduled — Export Desk Assigned': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Documents Requested': 'bg-amber-50 text-amber-700 border-amber-200',
  'Active — Listed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Rejected': 'bg-red-50 text-red-700 border-red-200',
  'New': 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-purple-50 text-purple-700 border-purple-200',
  'Responded': 'bg-teal-50 text-teal-700 border-teal-200',
  'Closed': 'bg-slate-100 text-slate-600 border-slate-200',
};

const ALL_STATUS_OPTIONS = [
  ...WORKFLOW_STATUSES,
  'Pending',
  'Verified & Routing to Suppliers',
  'Under Review',
  'Completed',
  'Rejected',
];
const STATUS_OPTIONS_CONTACT = ['New', 'In Progress', 'Responded', 'Closed'];

export const AzexbuyView: React.FC<AzexbuyViewProps> = ({ uiLang }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rfqs' | 'producers' | 'contacts'>('overview');
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusEdit, setStatusEdit] = useState<{ id: string; type: 'rfq' | 'producer' | 'contact'; value: string } | null>(null);
  const [searchQ, setSearchQ] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('octotech_admin_jwt') || '';
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const [rfqRes, prodRes, statsRes, cntRes] = await Promise.all([
        fetch('/api/azexbuy/rfqs', { headers }),
        fetch('/api/azexbuy/producers', { headers }),
        fetch('/api/azexbuy/stats'),
        fetch('/api/azexbuy/contacts', { headers }),
      ]);
      if (rfqRes.ok) setRfqs(await rfqRes.json());
      if (prodRes.ok) setProducers(await prodRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (cntRes.ok) setContacts(await cntRes.json());
    } catch (err) {
      console.error('[AzexbuyView] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('octotech_admin_jwt') || '';
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleDeleteRFQ = async (id: string) => {
    if (!confirm('Bu RFQ-ni silmək istəyirsiniz?')) return;
    const res = await fetch(`/api/azexbuy/rfqs/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (!res.ok) { console.error('[AzexbuyView] Delete RFQ failed'); return; }
    setRfqs(prev => prev.filter(r => r.id !== id));
  };

  const handleDeleteProducer = async (id: string) => {
    if (!confirm('Bu istehsalçını silmək istəyirsiniz?')) return;
    const res = await fetch(`/api/azexbuy/producers/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (!res.ok) { console.error('[AzexbuyView] Delete producer failed'); return; }
    setProducers(prev => prev.filter(p => p.id !== id));
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Bu əlaqəni silmək istəyirsiniz?')) return;
    const res = await fetch(`/api/azexbuy/contacts/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (!res.ok) { console.error('[AzexbuyView] Delete contact failed'); return; }
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const handleStatusSave = async () => {
    if (!statusEdit) return;
    const url = statusEdit.type === 'rfq'
      ? `/api/azexbuy/rfqs/${statusEdit.id}`
      : statusEdit.type === 'producer'
      ? `/api/azexbuy/producers/${statusEdit.id}`
      : `/api/azexbuy/contacts/${statusEdit.id}`;
    const token = localStorage.getItem('octotech_admin_jwt') || '';
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ status: statusEdit.value }),
    });
    if (!res.ok) { console.error('[AzexbuyView] Status update failed'); return; }
    if (statusEdit.type === 'rfq') setRfqs(prev => prev.map(r => r.id === statusEdit.id ? { ...r, status: statusEdit.value } : r));
    else if (statusEdit.type === 'producer') setProducers(prev => prev.map(p => p.id === statusEdit.id ? { ...p, status: statusEdit.value } : p));
    else setContacts(prev => prev.map(c => c.id === statusEdit.id ? { ...c, status: statusEdit.value } : c));
    setStatusEdit(null);
  };

  const filteredRfqs = rfqs.filter(r =>
    !searchQ ||
    r.buyerCompany.toLowerCase().includes(searchQ.toLowerCase()) ||
    r.country.toLowerCase().includes(searchQ.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQ.toLowerCase())
  );
  const filteredProducers = producers.filter(p =>
    !searchQ ||
    p.companyName.toLowerCase().includes(searchQ.toLowerCase()) ||
    p.productName.toLowerCase().includes(searchQ.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQ.toLowerCase())
  );

  const fmt = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('az-AZ', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return iso; }
  };

  const badge = (status: string) => {
    const cls = STATUS_COLORS[status] || 'bg-slate-100 text-slate-600 border-slate-200';
    return <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold border rounded-sm ${cls}`}>{status}</span>;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">

      {/* Header */}
      <div className="bg-white border-b border-slate-200/90 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#0f3156] flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">AZEXBUY</h1>
            <p className="text-[10px] text-slate-500">Azerbaijan Export & Sourcing Platform — Admin</p>
          </div>
          {stats && (
            <div className={`flex items-center gap-1 text-[10px] font-medium ml-2 ${stats.redis === 'connected' ? 'text-emerald-600' : 'text-slate-400'}`}>
              {stats.redis === 'connected' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span className="hidden sm:inline">Redis {stats.redis === 'connected' ? 'Active' : 'Off'}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
            placeholder="Axtar..." className="h-7 px-3 text-xs border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-400 w-full sm:w-48 rounded-sm" />
          <button onClick={fetchAll} disabled={loading}
            className="h-7 px-3 flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors rounded-sm shrink-0 cursor-pointer">
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Yenilə</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center shrink-0 overflow-x-auto no-scrollbar">
        {(['overview', 'rfqs', 'producers', 'contacts'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-3 sm:px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === tab ? 'border-[#0f3156] text-[#0f3156]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            {tab === 'overview' ? 'İcmal' : tab === 'rfqs' ? `RFQ (${rfqs.length})` : tab === 'producers' ? `İstehsalçılar (${producers.length})` : `Əlaqələr (${contacts.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (() => {
          const totalSubmissions = rfqs.length + producers.length + contacts.length;
          const isNewStatus = (s: string) => ['Yeni', 'New', 'Pending'].includes(s);
          const isInReviewStatus = (s: string) => ['İncelemede', 'Under Review', 'Verified & Routing to Suppliers', 'Ek bilgi bekleniyor', 'Tedarikçi/alıcı aramasında', 'Teklif hazırlanıyor', 'In Progress', 'Audit Scheduled — Export Desk Assigned', 'Documents Requested'].includes(s);
          const isCompletedStatus = (s: string) => ['Tamamlandı', 'Completed', 'Active — Listed', 'Responded', 'Closed', 'Kapatıldı'].includes(s);

          const newSubmissionsCount = rfqs.filter(r => isNewStatus(r.status)).length +
            producers.filter(p => isNewStatus(p.status)).length +
            contacts.filter(c => isNewStatus(c.status)).length;

          const inReviewCount = rfqs.filter(r => isInReviewStatus(r.status)).length +
            producers.filter(p => isInReviewStatus(p.status)).length +
            contacts.filter(c => isInReviewStatus(c.status)).length;

          const completedCount = rfqs.filter(r => isCompletedStatus(r.status)).length +
            producers.filter(p => isCompletedStatus(p.status)).length +
            contacts.filter(c => isCompletedStatus(c.status)).length;

          // Status breakdown counts
          const statusBreakdown = WORKFLOW_STATUSES.map(st => {
            const count = rfqs.filter(r => r.status === st || (st === 'Yeni' && isNewStatus(r.status)) || (st === 'Tamamlandı' && ['Completed', 'Tamamlandı'].includes(r.status))).length +
              producers.filter(p => p.status === st || (st === 'Yeni' && isNewStatus(p.status)) || (st === 'Tamamlandı' && ['Completed', 'Tamamlandı'].includes(p.status))).length;
            return { status: st, count };
          });

          // Unified recent submissions
          const unifiedRecent = [
            ...rfqs.map(r => ({ id: r.id, createdAt: r.createdAt, title: r.buyerCompany, subtitle: `${r.country} · Alıcı RFQ`, type: 'rfq' as const, status: r.status })),
            ...producers.map(p => ({ id: p.id, createdAt: p.createdAt, title: p.companyName, subtitle: `${p.productName} · İstehsalçı`, type: 'producer' as const, status: p.status })),
            ...contacts.map(c => ({ id: c.id, createdAt: c.createdAt, title: c.fullName, subtitle: `${c.organization} · Əlaqə Sorğusu`, type: 'contact' as const, status: c.status })),
          ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

          return (
            <div className="p-6 space-y-6">
              {/* 1. Dashboard 4 Əsas Göstərici Kartları */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Toplam Başvuru Sayısı', value: totalSubmissions, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Yeni Başvurular', value: newSubmissionsCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'İncelemede Olanlar', value: inReviewCount, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
                  { label: 'Tamamlanan Başvurular', value: completedCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((s, i) => (
                  <div key={i} className="bg-white border border-slate-200/90 p-4 shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{s.label}</span>
                      <div className={`w-7 h-7 ${s.bg} flex items-center justify-center rounded`}>
                        <s.icon className={`w-4 h-4 ${s.color}`} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 tabular-nums">{s.value}</div>
                  </div>
                ))}
              </div>

              {/* 2. Başvuru Durumlarına Göre İstatistikler */}
              <div className="bg-white border border-slate-200/90 p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#0f3156]" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Başvuru Durumlarına Göre İstatistikler</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">8 Mərhələli CRM Axını</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {statusBreakdown.map(item => (
                    <div key={item.status} className="bg-slate-50/70 border border-slate-200/80 rounded p-2.5">
                      <div className="text-[10px] font-semibold text-slate-500 truncate mb-1">{item.status}</div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-base font-bold text-slate-900 tabular-nums">{item.count}</span>
                        {totalSubmissions > 0 && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {Math.round((item.count / totalSubmissions) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Son Başvuruların Listesi (Unified Recent Submissions) */}
              <div className="bg-white border border-slate-200/90 shadow-2xs">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0f3156]" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Son Başvuruların Listesi</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setActiveTab('rfqs')} className="text-[11px] text-[#0f3156] hover:underline font-medium">RFQ-lər ({rfqs.length})</button>
                    <span className="text-slate-300">·</span>
                    <button onClick={() => setActiveTab('producers')} className="text-[11px] text-emerald-700 hover:underline font-medium">İstehsalçılar ({producers.length})</button>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {unifiedRecent.map(item => (
                    <div key={item.id} className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.type === 'rfq' && <ShoppingCart className="w-4 h-4 text-[#0f3156] shrink-0" />}
                        {item.type === 'producer' && <Factory className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {item.type === 'contact' && <Mail className="w-4 h-4 text-purple-600 shrink-0" />}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900 truncate">{item.title}</span>
                            <span className="text-[9px] font-mono text-slate-400">{item.id}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{item.subtitle}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {badge(item.status)}
                        <span className="text-[10px] text-slate-400 hidden sm:inline">{fmt(item.createdAt)}</span>
                        <button
                          onClick={() => {
                            if (item.type === 'rfq') setActiveTab('rfqs');
                            else if (item.type === 'producer') setActiveTab('producers');
                            else setActiveTab('contacts');
                            setExpandedId(item.id);
                          }}
                          className="text-[11px] text-[#0f3156] hover:bg-slate-100 p-1 rounded"
                          title="Bax"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {unifiedRecent.length === 0 && (
                    <div className="px-4 py-8 text-center text-xs text-slate-400">Heç bir müraciət tapılmadı</div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* RFQs */}
        {activeTab === 'rfqs' && (
          <div className="p-6 space-y-2">
            {filteredRfqs.length === 0 && (
              <div className="bg-white border border-slate-200/90 px-6 py-12 text-center">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Hec bir RFQ tapilmadi</p>
              </div>
            )}
            {filteredRfqs.map(r => (
              <div key={r.id} className="bg-white border border-slate-200/90 overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between gap-3">
                  <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <ShoppingCart className="w-3.5 h-3.5 text-[#0f3156] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">{r.buyerCompany}</span>
                        <span className="text-[10px] text-slate-400">·</span>
                        <span className="text-[10px] text-slate-500">{r.country}</span>
                        <span className="text-[10px] font-mono text-slate-400">{r.id}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {r.items.map(i => `${i.productName} (${i.quantity} ${i.unit})`).join(' · ')}
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    {badge(r.status)}
                    <span className="text-[10px] text-slate-400 hidden sm:block">{fmt(r.createdAt)}</span>
                    <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)} className="p-1 text-slate-400 hover:text-slate-700">
                      {expandedId === r.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {expandedId === r.id && (
                  <div className="border-t border-slate-100 px-4 py-4 bg-slate-50/50 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {[
                        { label: 'Elaqe',    value: `${r.contactName} · ${r.email}` },
                        { label: 'Incoterm', value: `${r.incoterm} — ${r.destinationPort || '—'}` },
                        { label: 'Marsrut',  value: r.corridorRoute || '—' },
                        { label: 'Telefon',  value: r.phone || '—' },
                      ].map((f, i) => (
                        <div key={i}>
                          <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{f.label}</div>
                          <div className="font-medium text-slate-800">{f.value}</div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Mallar</div>
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-[10px] text-slate-500 uppercase">
                            <th className="px-2.5 py-1.5 text-left font-bold">Mehsul</th>
                            <th className="px-2.5 py-1.5 text-left font-bold">HS</th>
                            <th className="px-2.5 py-1.5 text-right font-bold">Hecm</th>
                          </tr>
                        </thead>
                        <tbody>
                          {r.items.map((it, i) => (
                            <tr key={i} className="border-t border-slate-200">
                              <td className="px-2.5 py-1.5 font-medium text-slate-800">{it.productName}</td>
                              <td className="px-2.5 py-1.5 font-mono text-slate-600">{it.hsCode}</td>
                              <td className="px-2.5 py-1.5 text-right tabular-nums font-bold text-[#0f3156]">{it.quantity} {it.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {r.requiredCertifications.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Sertifikatlar</div>
                        <div className="flex flex-wrap gap-1.5">
                          {r.requiredCertifications.map((c, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 font-medium rounded-sm">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Məsul Şəxs</div>
                        <input
                          type="text"
                          defaultValue={r.assignedTo || ''}
                          placeholder="Ad Soyad..."
                          onBlur={async e => {
                            const val = e.target.value;
                            if (val === (r.assignedTo || '')) return;
                            const token = localStorage.getItem('octotech_admin_jwt') || '';
                            await fetch(`/api/azexbuy/rfqs/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ assignedTo: val }) });
                            setRfqs(prev => prev.map(x => x.id === r.id ? { ...x, assignedTo: val } : x));
                          }}
                          className="w-full h-7 px-2 text-xs border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-400 rounded-sm"
                        />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Daxili Qeyd</div>
                        <input
                          type="text"
                          defaultValue={r.internalNotes || ''}
                          placeholder="Qeyd..."
                          onBlur={async e => {
                            const val = e.target.value;
                            if (val === (r.internalNotes || '')) return;
                            const token = localStorage.getItem('octotech_admin_jwt') || '';
                            await fetch(`/api/azexbuy/rfqs/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ internalNotes: val }) });
                            setRfqs(prev => prev.map(x => x.id === r.id ? { ...x, internalNotes: val } : x));
                          }}
                          className="w-full h-7 px-2 text-xs border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-400 rounded-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Status:</span>
                        {statusEdit?.id === r.id ? (
                          <>
                            <select value={statusEdit.value} onChange={e => setStatusEdit({ ...statusEdit, value: e.target.value })}
                              className="h-7 px-2 text-xs border border-slate-300 bg-white text-slate-900 focus:outline-none rounded-sm">
                              {ALL_STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                            </select>
                            <button onClick={handleStatusSave} className="h-7 px-2.5 bg-[#0f3156] text-white text-xs font-bold hover:bg-[#081c33] flex items-center gap-1 rounded-sm">
                              <CheckCircle className="w-3 h-3" /> Saxla
                            </button>
                            <button onClick={() => setStatusEdit(null)} className="h-7 px-2 text-slate-500 hover:text-slate-800">
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setStatusEdit({ id: r.id, type: 'rfq', value: r.status })}
                            className="text-[10px] text-[#0f3156] hover:underline font-medium">
                            Deyis
                          </button>
                        )}
                      </div>
                      <button onClick={() => handleDeleteRFQ(r.id)}
                        className="h-7 px-2.5 flex items-center gap-1.5 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded-sm">
                        <Trash2 className="w-3 h-3" /><span>Sil</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PRODUCERS */}
        {activeTab === 'producers' && (
          <div className="p-6 space-y-2">
            {filteredProducers.length === 0 && (
              <div className="bg-white border border-slate-200/90 px-6 py-12 text-center">
                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Hec bir istehsalci tapilmadi</p>
              </div>
            )}
            {filteredProducers.map(p => (
              <div key={p.id} className="bg-white border border-slate-200/90 overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between gap-3">
                  <button onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <Factory className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">{p.companyName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{p.id}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {p.productName} · HS: {p.hsCode} · {p.economicRegion}
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold tabular-nums text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-sm">
                      {p.readinessScore}/100
                    </span>
                    {badge(p.status)}
                    <button onClick={() => setExpandedId(expandedId === p.id ? null : p.id)} className="p-1 text-slate-400 hover:text-slate-700">
                      {expandedId === p.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {expandedId === p.id && (
                  <div className="border-t border-slate-100 px-4 py-4 bg-slate-50/50 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {[
                        { label: 'VOEN',      value: p.voenTin },
                        { label: 'Elaqe',     value: `${p.contactPerson || '—'} · ${p.email}` },
                        { label: 'Kapasite',  value: p.monthlyCapacity || '—' },
                        { label: 'Outsourced',value: p.outsourcedDeskRequested ? 'Beli' : 'Xeyr' },
                      ].map((f, i) => (
                        <div key={i}>
                          <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{f.label}</div>
                          <div className="font-medium text-slate-800">{f.value}</div>
                        </div>
                      ))}
                    </div>

                    {p.certifications.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Sertifikatlar</div>
                        <div className="flex flex-wrap gap-1.5">
                          {p.certifications.map((c, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium rounded-sm">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {p.targetMarkets.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Hədəf Bazarlar</div>
                        <div className="flex flex-wrap gap-1.5">
                          {p.targetMarkets.map((m, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 font-medium rounded-sm">{m}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Məsul Şəxs</div>
                        <input
                          type="text"
                          defaultValue={p.assignedTo || ''}
                          placeholder="Ad Soyad..."
                          onBlur={async e => {
                            const val = e.target.value;
                            if (val === (p.assignedTo || '')) return;
                            const token = localStorage.getItem('octotech_admin_jwt') || '';
                            await fetch(`/api/azexbuy/producers/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ assignedTo: val }) });
                            setProducers(prev => prev.map(x => x.id === p.id ? { ...x, assignedTo: val } : x));
                          }}
                          className="w-full h-7 px-2 text-xs border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-400 rounded-sm"
                        />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Daxili Qeyd</div>
                        <input
                          type="text"
                          defaultValue={p.internalNotes || ''}
                          placeholder="Qeyd..."
                          onBlur={async e => {
                            const val = e.target.value;
                            if (val === (p.internalNotes || '')) return;
                            const token = localStorage.getItem('octotech_admin_jwt') || '';
                            await fetch(`/api/azexbuy/producers/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ internalNotes: val }) });
                            setProducers(prev => prev.map(x => x.id === p.id ? { ...x, internalNotes: val } : x));
                          }}
                          className="w-full h-7 px-2 text-xs border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-400 rounded-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Status:</span>
                        {statusEdit?.id === p.id ? (
                          <>
                            <select value={statusEdit.value} onChange={e => setStatusEdit({ ...statusEdit, value: e.target.value })}
                              className="h-7 px-2 text-xs border border-slate-300 bg-white text-slate-900 focus:outline-none rounded-sm">
                              {ALL_STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                            </select>
                            <button onClick={handleStatusSave} className="h-7 px-2.5 bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 rounded-sm">
                              <CheckCircle className="w-3 h-3" /> Saxla
                            </button>
                            <button onClick={() => setStatusEdit(null)} className="h-7 px-2 text-slate-500">
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setStatusEdit({ id: p.id, type: 'producer', value: p.status })}
                            className="text-[10px] text-emerald-600 hover:underline font-medium">
                            Deyis
                          </button>
                        )}
                      </div>
                      <button onClick={() => handleDeleteProducer(p.id)}
                        className="h-7 px-2.5 flex items-center gap-1.5 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded-sm">
                        <Trash2 className="w-3 h-3" /><span>Sil</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      {/* CONTACTS */}
        {activeTab === 'contacts' && (
          <div className="p-6 space-y-2">
            {contacts.length === 0 && (
              <div className="bg-white border border-slate-200/90 px-6 py-12 text-center">
                <Mail className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Heç bir əlaqə sorğusu tapılmadı</p>
              </div>
            )}
            {contacts.filter(c => !searchQ || c.fullName.toLowerCase().includes(searchQ.toLowerCase()) || c.organization.toLowerCase().includes(searchQ.toLowerCase()) || c.email.toLowerCase().includes(searchQ.toLowerCase())).map(c => (
              <div key={c.id} className="bg-white border border-slate-200/90 overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between gap-3">
                  <button onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <Mail className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">{c.fullName}</span>
                        <span className="text-[10px] text-slate-400">·</span>
                        <span className="text-[10px] text-slate-500">{c.organization}</span>
                        <span className="text-[10px] font-mono text-slate-400">{c.id}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{c.inquiryType} · {c.email}</div>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold border rounded-sm ${c.status === 'New' ? 'bg-purple-50 text-purple-700 border-purple-200' : c.status === 'Responded' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : c.status === 'Closed' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{c.status}</span>
                    <span className="text-[10px] text-slate-400 hidden sm:block">{new Date(c.createdAt).toLocaleDateString('az-AZ', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <button onClick={() => setExpandedId(expandedId === c.id ? null : c.id)} className="p-1 text-slate-400 hover:text-slate-700">
                      {expandedId === c.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {expandedId === c.id && (
                  <div className="border-t border-slate-100 px-4 py-4 bg-slate-50/50 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      {[
                        { label: 'Ad Soyad', value: c.fullName },
                        { label: 'Təşkilat', value: c.organization },
                        { label: 'E-poçt', value: c.email },
                        { label: 'Sorğu Növü', value: c.inquiryType },
                        { label: 'ID', value: c.id },
                      ].map((f, i) => (
                        <div key={i}>
                          <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{f.label}</div>
                          <div className="font-medium text-slate-800">{f.value}</div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Mesaj</div>
                      <p className="text-xs text-slate-700 bg-white border border-slate-200 rounded p-3 leading-relaxed">{c.message}</p>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Status:</span>
                        {statusEdit?.id === c.id ? (
                          <>
                            <select value={statusEdit.value} onChange={e => setStatusEdit({ ...statusEdit, value: e.target.value })}
                              className="h-7 px-2 text-xs border border-slate-300 bg-white text-slate-900 focus:outline-none rounded-sm">
                              {STATUS_OPTIONS_CONTACT.map(s => <option key={s}>{s}</option>)}
                            </select>
                            <button onClick={handleStatusSave} className="h-7 px-2.5 bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 flex items-center gap-1 rounded-sm">
                              <CheckCircle className="w-3 h-3" /> Saxla
                            </button>
                            <button onClick={() => setStatusEdit(null)} className="h-7 px-2 text-slate-500">
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setStatusEdit({ id: c.id, type: 'contact', value: c.status })}
                            className="text-[10px] text-purple-600 hover:underline font-medium">
                            Dəyiş
                          </button>
                        )}
                      </div>
                      <button onClick={() => handleDeleteContact(c.id)}
                        className="h-7 px-2.5 flex items-center gap-1.5 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded-sm">
                        <Trash2 className="w-3 h-3" /><span>Sil</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
