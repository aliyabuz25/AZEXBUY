import React, { useState, useEffect, useCallback } from 'react';
import {
  Inbox, ShoppingCart, Factory, RefreshCw, ChevronDown, ChevronUp,
  Clock, AlertCircle, Globe, Trash2, Mail, Phone, MapPin,
  Package, Award, TrendingUp, Building2, User, Hash,
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

const STATUSES = ['Pending', 'Under Review', 'Completed', 'Rejected'];

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  'Pending':      { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',  dot: 'bg-amber-400' },
  'Under Review': { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',   dot: 'bg-blue-400' },
  'Completed':    { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',dot: 'bg-emerald-500' },
  'Rejected':     { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',    dot: 'bg-red-400' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] || { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold border rounded-full ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  if (!value || value === '—') return null;
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 bg-slate-100 rounded-md flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
      </div>
      <div>
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</div>
        <div className="text-xs font-medium text-slate-800 mt-0.5">{value}</div>
      </div>
    </div>
  );
}

function fmt(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('az-AZ', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'İndicə';
  if (mins < 60) return `${mins} dəq əvvəl`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} saat əvvəl`;
  return `${Math.floor(hrs / 24)} gün əvvəl`;
}

export const InboxView: React.FC<InboxViewProps> = () => {
  const [tab, setTab] = useState<'rfqs' | 'producers'>('rfqs');
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const token = () => localStorage.getItem('octotech_admin_jwt') || sessionStorage.getItem('octotech_admin_jwt') || '';
  const authH = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

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

  const updateStatus = async (type: 'rfqs' | 'producers', id: string, status: string) => {
    setStatusUpdating(id);
    await fetch(`/api/azexbuy/${type}/${id}`, {
      method: 'PATCH', headers: authH(), body: JSON.stringify({ status }),
    });
    await load();
    setStatusUpdating(null);
  };

  const deleteRecord = async (type: 'rfqs' | 'producers', id: string) => {
    if (!confirm('Bu qeydi silmək istədiyinizə əminsiniz?')) return;
    await fetch(`/api/azexbuy/${type}/${id}`, { method: 'DELETE', headers: authH() });
    await load();
    if (expandedId === id) setExpandedId(null);
  };

  const pendingRfqs = rfqs.filter(r => r.status === 'Pending').length;
  const pendingProducers = producers.filter(p => p.status === 'Pending').length;

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
    <div className="flex flex-col h-full bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0f3156] rounded-lg flex items-center justify-center">
            <Inbox className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">Gelen Qutusu</h1>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {lastUpdate ? `${timeAgo(lastUpdate.toISOString())} yeniləndi` : 'Yüklənir...'}
              <span className="text-emerald-500 ml-1.5">● Canlı</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Axtar..." className="h-8 pl-3 pr-8 text-xs border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#0f3156] focus:bg-white w-48 rounded-md transition-colors" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
            )}
          </div>
          <button onClick={load} disabled={loading}
            className="h-8 w-8 flex items-center justify-center border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-md transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b border-slate-100 px-6 py-2 flex items-center gap-6 shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <ShoppingCart className="w-3.5 h-3.5" />
          <span className="font-bold text-slate-800">{rfqs.length}</span> RFQ
          {pendingRfqs > 0 && <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 font-bold rounded-full text-[10px]">{pendingRfqs} gözləyir</span>}
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Factory className="w-3.5 h-3.5" />
          <span className="font-bold text-slate-800">{producers.length}</span> İstehsalçı
          {pendingProducers > 0 && <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 font-bold rounded-full text-[10px]">{pendingProducers} gözləyir</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 flex items-center gap-1 shrink-0">
        {[
          { key: 'rfqs', label: 'RFQ Sorğuları', count: rfqs.length, pending: pendingRfqs, icon: ShoppingCart, color: 'text-blue-600' },
          { key: 'producers', label: 'İstehsalçı Qeydiyyatları', count: producers.length, pending: pendingProducers, icon: Factory, color: 'text-emerald-600' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
              tab === t.key ? 'border-[#0f3156] text-[#0f3156]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}>
            <t.icon className={`w-3.5 h-3.5 ${tab === t.key ? 'text-[#0f3156]' : t.color}`} />
            {t.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              tab === t.key ? 'bg-[#0f3156] text-white' : 'bg-slate-100 text-slate-500'
            }`}>{t.count}</span>
            {t.pending > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-white">{t.pending}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">

        {/* RFQs */}
        {tab === 'rfqs' && (
          <>
            {filteredRfqs.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-xl px-6 py-16 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingCart className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-400">{search ? 'Axtarış nəticəsi tapılmadı' : 'Heç bir RFQ sorğusu yoxdur'}</p>
              </div>
            )}
            {filteredRfqs.map(r => (
              <div key={r.id} className={`bg-white border rounded-xl overflow-hidden transition-shadow hover:shadow-sm ${
                r.status === 'Pending' ? 'border-amber-200' : 'border-slate-200'
              }`}>
                {/* Card header */}
                <div className="px-5 py-4 flex items-center justify-between gap-3">
                  <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    className="flex items-center gap-4 flex-1 min-w-0 text-left">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      r.status === 'Pending' ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-100'
                    }`}>
                      <ShoppingCart className="w-4.5 h-4.5 text-[#0f3156]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-sm font-bold text-slate-900">{r.buyerCompany}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{r.country}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {r.items.length > 0
                          ? r.items.map(i => `${i.productName} — ${i.quantity} ${i.unit}`).join(' · ')
                          : 'Məhsul məlumatı yoxdur'
                        }
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={r.status} />
                    <span className="text-[10px] text-slate-400 hidden sm:flex items-center gap-1">
                      <Clock className="w-3 h-3" />{timeAgo(r.createdAt)}
                    </span>
                    <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md">
                      {expandedId === r.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {expandedId === r.id && (
                  <div className="border-t border-slate-100 bg-slate-50/50">
                    {/* Contact info */}
                    <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <InfoRow icon={User} label="Əlaqə şəxsi" value={r.contactName} />
                      <InfoRow icon={Mail} label="E-poçt" value={r.email} />
                      <InfoRow icon={Phone} label="Telefon" value={r.phone || '—'} />
                      <InfoRow icon={Package} label="Incoterm" value={`${r.incoterm || '—'} → ${r.destinationPort || '—'}`} />
                      <InfoRow icon={Globe} label="Marşrut" value={r.corridorRoute || '—'} />
                      <InfoRow icon={Clock} label="Tarix" value={fmt(r.createdAt)} />
                    </div>

                    {/* Products table */}
                    {r.items.length > 0 && (
                      <div className="px-5 pb-4">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sifariş edilən mallar</div>
                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-4 py-2.5 text-left font-bold text-slate-500 text-[10px] uppercase">Məhsul</th>
                                <th className="px-4 py-2.5 text-left font-bold text-slate-500 text-[10px] uppercase">HS Kodu</th>
                                <th className="px-4 py-2.5 text-right font-bold text-slate-500 text-[10px] uppercase">Miqdar</th>
                              </tr>
                            </thead>
                            <tbody>
                              {r.items.map((it, i) => (
                                <tr key={i} className="border-t border-slate-100">
                                  <td className="px-4 py-2.5 font-semibold text-slate-800">{it.productName}</td>
                                  <td className="px-4 py-2.5 font-mono text-slate-500 text-[11px]">{it.hsCode || '—'}</td>
                                  <td className="px-4 py-2.5 text-right font-bold text-[#0f3156]">{it.quantity} {it.unit}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Certifications */}
                    {r.requiredCertifications.length > 0 && (
                      <div className="px-5 pb-4">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tələb olunan sertifikatlar</div>
                        <div className="flex flex-wrap gap-1.5">
                          {r.requiredCertifications.map((c, i) => (
                            <span key={i} className="text-[11px] px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 font-medium rounded-full">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {r.notes && (
                      <div className="px-5 pb-4">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Qeyd</div>
                        <p className="text-xs text-slate-700 bg-white border border-slate-200 px-4 py-3 rounded-lg leading-relaxed">{r.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
                        <div className="flex gap-1">
                          {STATUSES.map(s => (
                            <button key={s} onClick={() => updateStatus('rfqs', r.id, s)}
                              disabled={statusUpdating === r.id || r.status === s}
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-full border transition-colors ${
                                r.status === s
                                  ? `${STATUS_STYLE[s]?.bg} ${STATUS_STYLE[s]?.text} ${STATUS_STYLE[s]?.border}`
                                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                              } disabled:opacity-50`}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => deleteRecord('rfqs', r.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-red-500 hover:bg-red-50 border border-red-200 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Sil
                      </button>
                    </div>
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
              <div className="bg-white border border-slate-200 rounded-xl px-6 py-16 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Factory className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-400">{search ? 'Axtarış nəticəsi tapılmadı' : 'Heç bir qeydiyyat yoxdur'}</p>
              </div>
            )}
            {filteredProducers.map(p => (
              <div key={p.id} className={`bg-white border rounded-xl overflow-hidden transition-shadow hover:shadow-sm ${
                p.status === 'Pending' ? 'border-amber-200' : 'border-slate-200'
              }`}>
                {/* Card header */}
                <div className="px-5 py-4 flex items-center justify-between gap-3">
                  <button onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                    className="flex items-center gap-4 flex-1 min-w-0 text-left">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      p.status === 'Pending' ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-100'
                    }`}>
                      <Factory className="w-4.5 h-4.5 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-sm font-bold text-slate-900">{p.companyName}</span>
                        {p.economicRegion && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{p.economicRegion}
                          </span>
                        )}
                        <span className="text-[11px] font-bold tabular-nums px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                          {p.readinessScore}/100
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        <span className="font-medium">{p.productName}</span>
                        {p.hsCode && <span className="ml-2 font-mono text-slate-400">HS: {p.hsCode}</span>}
                        {p.monthlyCapacity && <span className="ml-2">· {p.monthlyCapacity}/ay</span>}
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={p.status} />
                    <span className="text-[10px] text-slate-400 hidden sm:flex items-center gap-1">
                      <Clock className="w-3 h-3" />{timeAgo(p.createdAt)}
                    </span>
                    <button onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md">
                      {expandedId === p.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {expandedId === p.id && (
                  <div className="border-t border-slate-100 bg-slate-50/50">
                    {/* Contact + company info */}
                    <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <InfoRow icon={Hash} label="VÖEN / TİN" value={p.voenTin} />
                      <InfoRow icon={User} label="Əlaqə şəxsi" value={p.contactPerson || '—'} />
                      <InfoRow icon={Mail} label="E-poçt" value={p.email} />
                      <InfoRow icon={Phone} label="Telefon" value={p.phone || '—'} />
                      <InfoRow icon={MapPin} label="İqtisadi bölgə" value={p.economicRegion || '—'} />
                      <InfoRow icon={Package} label="Məhsul / HS" value={`${p.productName}${p.hsCode ? ` (${p.hsCode})` : ''}`} />
                      <InfoRow icon={TrendingUp} label="Aylıq kapasite" value={p.monthlyCapacity || '—'} />
                      <InfoRow icon={Building2} label="Outsourced Desk" value={p.outsourcedDeskRequested ? 'Bəli — Tələb olunur' : 'Xeyr'} />
                      <InfoRow icon={Clock} label="Qeydiyyat tarixi" value={fmt(p.createdAt)} />
                    </div>

                    {/* Certifications */}
                    {p.certifications.length > 0 && (
                      <div className="px-5 pb-4">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Award className="w-3 h-3" /> Sertifikatlar
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {p.certifications.map((c, i) => (
                            <span key={i} className="text-[11px] px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium rounded-full">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Target markets */}
                    {p.targetMarkets.length > 0 && (
                      <div className="px-5 pb-4">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Globe className="w-3 h-3" /> Hədəf bazarlar
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {p.targetMarkets.map((m, i) => (
                            <span key={i} className="text-[11px] px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 font-medium rounded-full flex items-center gap-1">
                              <Globe className="w-2.5 h-2.5" />{m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
                        <div className="flex gap-1">
                          {STATUSES.map(s => (
                            <button key={s} onClick={() => updateStatus('producers', p.id, s)}
                              disabled={statusUpdating === p.id || p.status === s}
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-full border transition-colors ${
                                p.status === s
                                  ? `${STATUS_STYLE[s]?.bg} ${STATUS_STYLE[s]?.text} ${STATUS_STYLE[s]?.border}`
                                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                              } disabled:opacity-50`}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => deleteRecord('producers', p.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-red-500 hover:bg-red-50 border border-red-200 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Sil
                      </button>
                    </div>
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
