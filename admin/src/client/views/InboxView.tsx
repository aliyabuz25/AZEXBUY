import React, { useState, useEffect, useCallback } from 'react';
import {
  Inbox, ShoppingCart, Factory, RefreshCw, ChevronDown, ChevronUp,
  Clock, CheckCircle, XCircle, Globe, Package, AlertCircle,
} from 'lucide-react';
import { UiLanguage } from '../types';

interface InboxViewProps { uiLang: UiLanguage; }

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

const STATUS_COLORS: Record<string, string> = {
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'Under Review': 'bg-blue-50 text-blue-700 border-blue-200',
  'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Rejected': 'bg-red-50 text-red-700 border-red-200',
};

function badge(status: string) {
  const cls = STATUS_COLORS[status] || 'bg-slate-100 text-slate-600 border-slate-200';
  return <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold border rounded-sm ${cls}`}>{status}</span>;
}

function fmt(iso: string) {
  try { return new Date(iso).toLocaleString('az-AZ', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
}

export const InboxView: React.FC<InboxViewProps> = () => {
  const [tab, setTab] = useState<'rfqs' | 'producers'>('rfqs');
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const token = () => localStorage.getItem('octotech_admin_jwt') || sessionStorage.getItem('octotech_admin_jwt') || '';
  const authH = () => ({ Authorization: `Bearer ${token()}` });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rr, pr] = await Promise.all([
        fetch('/api/azexbuy/rfqs', { headers: authH() }),
        fetch('/api/azexbuy/producers', { headers: authH() }),
      ]);
      if (rr.ok) setRfqs(await rr.json());
      if (pr.ok) setProducers(await pr.json());
      setLastUpdate(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  const filteredRfqs = rfqs.filter(r =>
    !search || r.buyerCompany.toLowerCase().includes(search.toLowerCase()) ||
    r.country.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  );
  const filteredProducers = producers.filter(p =>
    !search || p.companyName.toLowerCase().includes(search.toLowerCase()) ||
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-50/50">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#0f3156] flex items-center justify-center">
            <Inbox className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">Gelen Qutusu</h1>
            <p className="text-[10px] text-slate-400">
              {lastUpdate ? `Son yenileme: ${lastUpdate.toLocaleTimeString('az-AZ')}` : 'Yüklənir...'}
              {' · '}
              <span className="text-emerald-600">Hər 15 saniyə avtomatik yenilənir</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Axtar..." className="h-7 px-3 text-xs border border-slate-200 bg-white focus:outline-none focus:border-slate-400 w-44 rounded-sm" />
          <button onClick={load} disabled={loading}
            className="h-7 px-3 flex items-center gap-1.5 text-xs border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-sm">
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 flex items-center shrink-0">
        {[
          { key: 'rfqs', label: `RFQ Sorğuları (${rfqs.length})`, icon: ShoppingCart },
          { key: 'producers', label: `Istehsalçı Qeydiyyatları (${producers.length})`, icon: Factory },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${tab === t.key ? 'border-[#0f3156] text-[#0f3156]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2">

        {/* RFQs */}
        {tab === 'rfqs' && (
          <>
            {filteredRfqs.length === 0 && (
              <div className="bg-white border border-slate-200 px-6 py-12 text-center">
                <AlertCircle className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Heç bir RFQ tapılmadı</p>
              </div>
            )}
            {filteredRfqs.map(r => (
              <div key={r.id} className="bg-white border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between gap-3">
                  <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <div className="w-7 h-7 bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      <ShoppingCart className="w-3.5 h-3.5 text-[#0f3156]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">{r.buyerCompany}</span>
                        <span className="text-[10px] text-slate-400">{r.country}</span>
                        <span className="text-[10px] font-mono text-slate-300">{r.id}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {r.items.map(i => `${i.productName} (${i.quantity} ${i.unit})`).join(' · ')}
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    {badge(r.status)}
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      {fmt(r.createdAt)}
                    </div>
                    <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)} className="p-1 text-slate-400 hover:text-slate-700">
                      {expandedId === r.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {expandedId === r.id && (
                  <div className="border-t border-slate-100 px-4 py-4 bg-slate-50/50 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {[
                        { label: 'Əlaqə', value: `${r.contactName}` },
                        { label: 'E-poçt', value: r.email },
                        { label: 'Telefon', value: r.phone || '—' },
                        { label: 'Incoterm', value: `${r.incoterm} / ${r.destinationPort || '—'}` },
                        { label: 'Marşrut', value: r.corridorRoute || '—' },
                        { label: 'Tarix', value: fmt(r.createdAt) },
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
                            <th className="px-2.5 py-1.5 text-left font-bold">Məhsul</th>
                            <th className="px-2.5 py-1.5 text-left font-bold">HS Kodu</th>
                            <th className="px-2.5 py-1.5 text-right font-bold">Miqdar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {r.items.map((it, i) => (
                            <tr key={i} className="border-t border-slate-200">
                              <td className="px-2.5 py-1.5 font-medium text-slate-800">{it.productName}</td>
                              <td className="px-2.5 py-1.5 font-mono text-slate-500">{it.hsCode || '—'}</td>
                              <td className="px-2.5 py-1.5 text-right font-bold text-[#0f3156]">{it.quantity} {it.unit}</td>
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
                    {r.notes && (
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Qeyd</div>
                        <p className="text-xs text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-sm">{r.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Producers */}
        {tab === 'producers' && (
          <>
            {filteredProducers.length === 0 && (
              <div className="bg-white border border-slate-200 px-6 py-12 text-center">
                <AlertCircle className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Heç bir qeydiyyat tapılmadı</p>
              </div>
            )}
            {filteredProducers.map(p => (
              <div key={p.id} className="bg-white border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between gap-3">
                  <button onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <div className="w-7 h-7 bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      <Factory className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">{p.companyName}</span>
                        <span className="text-[10px] text-slate-400">{p.economicRegion}</span>
                        <span className="text-[10px] font-mono text-slate-300">{p.id}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {p.productName} · HS: {p.hsCode || '—'} · Kapasite: {p.monthlyCapacity || '—'}
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold tabular-nums text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-sm">
                      {p.readinessScore}/100
                    </span>
                    {badge(p.status)}
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      {fmt(p.createdAt)}
                    </div>
                    <button onClick={() => setExpandedId(expandedId === p.id ? null : p.id)} className="p-1 text-slate-400 hover:text-slate-700">
                      {expandedId === p.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {expandedId === p.id && (
                  <div className="border-t border-slate-100 px-4 py-4 bg-slate-50/50 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {[
                        { label: 'VÖEN', value: p.voenTin },
                        { label: 'Əlaqə', value: p.contactPerson || '—' },
                        { label: 'E-poçt', value: p.email },
                        { label: 'Telefon', value: p.phone || '—' },
                        { label: 'Bölgə', value: p.economicRegion || '—' },
                        { label: 'Outsourced Desk', value: p.outsourcedDeskRequested ? 'Bəli' : 'Xeyr' },
                        { label: 'Tarix', value: fmt(p.createdAt) },
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
                            <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 font-medium rounded-sm flex items-center gap-1">
                              <Globe className="w-2.5 h-2.5" />{m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

      </div>
    </div>
  );
};
