import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart, Factory, TrendingUp, Clock, Trash2, RefreshCw,
  CheckCircle, XCircle, ChevronDown, ChevronUp, Wifi, WifiOff,
  Package, Globe, AlertCircle,
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
}

interface Producer {
  id: string; createdAt: string; companyName: string; voenTin: string;
  economicRegion?: string; contactPerson?: string; email: string; phone?: string;
  productName: string; hsCode?: string; monthlyCapacity?: string;
  certifications: string[]; targetMarkets: string[];
  outsourcedDeskRequested: boolean; readinessScore: number; status: string;
}

interface Stats {
  rfqCount: number; producerCount: number; pendingRfqs: number;
  activeProducers: number; redis: string;
}

const STATUS_COLORS: Record<string, string> = {
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'Verified & Routing to Suppliers': 'bg-blue-50 text-blue-700 border-blue-200',
  'Audit Scheduled — Export Desk Assigned': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Completed': 'bg-slate-100 text-slate-600 border-slate-200',
  'Rejected': 'bg-red-50 text-red-700 border-red-200',
};
const STATUS_OPTIONS_RFQ = ['Pending', 'Verified & Routing to Suppliers', 'Under Review', 'Matched with Suppliers', 'Completed', 'Rejected'];
const STATUS_OPTIONS_PRODUCER = ['Pending', 'Audit Scheduled — Export Desk Assigned', 'Documents Requested', 'Active — Listed', 'Completed', 'Rejected'];

export const AzexbuyView: React.FC<AzexbuyViewProps> = ({ uiLang }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rfqs' | 'producers'>('overview');
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusEdit, setStatusEdit] = useState<{ id: string; type: 'rfq' | 'producer'; value: string } | null>(null);
  const [searchQ, setSearchQ] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('octo_token') || sessionStorage.getItem('octo_token') || '';
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const [rfqRes, prodRes, statsRes] = await Promise.all([
        fetch('/api/azexbuy/rfqs', { headers }),
        fetch('/api/azexbuy/producers', { headers }),
        fetch('/api/azexbuy/stats'),
      ]);
      if (rfqRes.ok) setRfqs(await rfqRes.json());
      if (prodRes.ok) setProducers(await prodRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error('[AzexbuyView] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('octo_token') || sessionStorage.getItem('octo_token') || '';
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

  const handleStatusSave = async () => {
    if (!statusEdit) return;
    const url = statusEdit.type === 'rfq'
      ? `/api/azexbuy/rfqs/${statusEdit.id}`
      : `/api/azexbuy/producers/${statusEdit.id}`;
    const token = localStorage.getItem('octo_token') || sessionStorage.getItem('octo_token') || '';
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ status: statusEdit.value }),
    });
    if (!res.ok) { console.error('[AzexbuyView] Status update failed'); return; }
    if (statusEdit.type === 'rfq') setRfqs(prev => prev.map(r => r.id === statusEdit.id ? { ...r, status: statusEdit.value } : r));
    else setProducers(prev => prev.map(p => p.id === statusEdit.id ? { ...p, status: statusEdit.value } : p));
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
      <div className="bg-white border-b border-slate-200/90 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#0f3156] flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">AZEXBUY</h1>
            <p className="text-[10px] text-slate-500">Azerbaijan Export & Sourcing Platform — Admin</p>
          </div>
          {stats && (
            <div className={`flex items-center gap-1 text-[10px] font-medium ml-2 ${stats.redis === 'connected' ? 'text-emerald-600' : 'text-slate-400'}`}>
              {stats.redis === 'connected' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>Redis {stats.redis === 'connected' ? 'Active' : 'Off'}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
            placeholder="Axtar..." className="h-7 px-3 text-xs border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-400 w-48 rounded-sm" />
          <button onClick={fetchAll} disabled={loading}
            className="h-7 px-3 flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors rounded-sm">
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Yenilə</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200/90 px-6 flex items-center shrink-0">
        {(['overview', 'rfqs', 'producers'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${activeTab === tab ? 'border-[#0f3156] text-[#0f3156]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            {tab === 'overview' ? 'Icmal' : tab === 'rfqs' ? `RFQ (${rfqs.length})` : `Istehsalcilar (${producers.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Cemi RFQ',        value: stats?.rfqCount     ?? '—', icon: ShoppingCart, color: 'text-blue-600',     bg: 'bg-blue-50' },
                { label: 'Goyleyen RFQ',    value: stats?.pendingRfqs  ?? '—', icon: Clock,        color: 'text-amber-600',    bg: 'bg-amber-50' },
                { label: 'Istehsalcilar',   value: stats?.producerCount ?? '—', icon: Factory,      color: 'text-emerald-600',  bg: 'bg-emerald-50' },
                { label: 'Aktiv Istehsalci',value: stats?.activeProducers ?? '—', icon: TrendingUp, color: 'text-[#0f3156]',   bg: 'bg-blue-50/60' },
              ].map((s, i) => (
                <div key={i} className="bg-white border border-slate-200/90 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{s.label}</span>
                    <div className={`w-7 h-7 ${s.bg} flex items-center justify-center`}>
                      <s.icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 tabular-nums">{s.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-200/90">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Son RFQ Sorqulari</span>
                <button onClick={() => setActiveTab('rfqs')} className="text-[11px] text-[#0f3156] hover:underline font-medium">Hamisina bax</button>
              </div>
              <div className="divide-y divide-slate-100">
                {rfqs.slice(0, 5).map(r => (
                  <div key={r.id} className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-slate-50">
                    <div className="flex items-center gap-3 min-w-0">
                      <ShoppingCart className="w-3.5 h-3.5 text-[#0f3156] shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">{r.buyerCompany}</div>
                        <div className="text-[10px] text-slate-500">{r.country} · {r.id}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {badge(r.status)}
                      <span className="text-[10px] text-slate-400">{fmt(r.createdAt)}</span>
                    </div>
                  </div>
                ))}
                {rfqs.length === 0 && <div className="px-4 py-8 text-center text-xs text-slate-400">Hec bir RFQ tapilmadi</div>}
              </div>
            </div>

            <div className="bg-white border border-slate-200/90">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Son Istehsalcilar</span>
                <button onClick={() => setActiveTab('producers')} className="text-[11px] text-[#0f3156] hover:underline font-medium">Hamisina bax</button>
              </div>
              <div className="divide-y divide-slate-100">
                {producers.slice(0, 5).map(p => (
                  <div key={p.id} className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-slate-50">
                    <div className="flex items-center gap-3 min-w-0">
                      <Factory className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">{p.companyName}</div>
                        <div className="text-[10px] text-slate-500">{p.productName} · {p.economicRegion}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {badge(p.status)}
                      <span className="text-[10px] text-slate-400">{fmt(p.createdAt)}</span>
                    </div>
                  </div>
                ))}
                {producers.length === 0 && <div className="px-4 py-8 text-center text-xs text-slate-400">Hec bir istehsalci tapilmadi</div>}
              </div>
            </div>
          </div>
        )}

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

                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Status:</span>
                        {statusEdit?.id === r.id ? (
                          <>
                            <select value={statusEdit.value} onChange={e => setStatusEdit({ ...statusEdit, value: e.target.value })}
                              className="h-7 px-2 text-xs border border-slate-300 bg-white text-slate-900 focus:outline-none rounded-sm">
                              {STATUS_OPTIONS_RFQ.map(s => <option key={s}>{s}</option>)}
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

                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Status:</span>
                        {statusEdit?.id === p.id ? (
                          <>
                            <select value={statusEdit.value} onChange={e => setStatusEdit({ ...statusEdit, value: e.target.value })}
                              className="h-7 px-2 text-xs border border-slate-300 bg-white text-slate-900 focus:outline-none rounded-sm">
                              {STATUS_OPTIONS_PRODUCER.map(s => <option key={s}>{s}</option>)}
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

      </div>
    </div>
  );
};
