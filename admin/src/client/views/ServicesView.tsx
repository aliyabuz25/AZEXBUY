import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, Edit2, Save, Briefcase, RefreshCw,
  CheckCircle, Eye, EyeOff, ChevronDown, ChevronRight, ToggleLeft, ToggleRight, Upload,
} from 'lucide-react';
import { UiLanguage, toText } from '../types';
import { SEED_SERVICES } from '../../seed';

interface ServicesViewProps { uiLang: UiLanguage; }

const token = () => localStorage.getItem('octotech_admin_jwt') || '';
const authFetch = (url: string, opts: RequestInit = {}) =>
  fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}`, ...(opts.headers || {}) } });

const uploadFile = async (file: File): Promise<string | null> => {
  const fd = new FormData();
  fd.append('image', file);
  try {
    const res = await fetch('/api/azexbuy/upload-image', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token()}` },
      body: fd,
    });
    if (res.ok) {
      const data = await res.json();
      return data.url || null;
    }
  } catch {}
  return null;
};

const inputCls = 'w-full h-8 text-xs border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156]';
const textareaCls = 'w-full text-xs border border-slate-200 px-2.5 py-1.5 rounded-sm focus:outline-none focus:border-[#0f3156] resize-none';

const ICON_OPTIONS = [
  'fa-solid fa-chart-line', 'fa-solid fa-handshake', 'fa-solid fa-file-contract',
  'fa-solid fa-truck-fast', 'fa-solid fa-building-columns', 'fa-solid fa-globe',
  'fa-solid fa-briefcase', 'fa-solid fa-boxes-stacked', 'fa-solid fa-leaf',
  'fa-solid fa-magnifying-glass-chart', 'fa-solid fa-ship', 'fa-solid fa-plane',
];

const COLOR_OPTIONS = [
  { label: 'Navy', value: 'bg-brandNavy' },
  { label: 'Emerald', value: 'bg-emerald-600' },
  { label: 'Sky', value: 'bg-sky-600' },
  { label: 'Purple', value: 'bg-purple-600' },
  { label: 'Amber', value: 'bg-amber-500' },
  { label: 'Rose', value: 'bg-rose-600' },
];

const LANGS = ['AZ', 'EN', 'TR', 'RU', 'AR', 'ES'] as const;
const LANG_LABELS: Record<string, string> = { AZ: 'Azərbaycanca', EN: 'English', TR: 'Türkçe', RU: 'Русский', AR: 'العربية', ES: 'Español' };

const SERVICE_CATEGORIES = [
  'Export',
  'Logistics',
  'Quality & Certification',
  'Finance',
  'Legal & Compliance',
  'Marketing & Sales',
  'Customs & Clearance'
];

const BLANK_SERVICE = {
  title: { AZ: '', EN: '', TR: '', RU: '', AR: '', ES: '' },
  description: { AZ: '', EN: '', TR: '', RU: '', AR: '', ES: '' },
  scope: { AZ: [], EN: [], TR: [], RU: [], AR: [], ES: [] },
  targetAudience: { AZ: '', EN: '', TR: '', RU: '', AR: '', ES: '' },
  iconClass: 'fa-solid fa-briefcase',
  colorClass: 'bg-brandNavy',
  serviceType: 'primary' as 'primary' | 'secondary',
  category: 'Export',
  isApproved: true,
  rfqSlug: '',
  imageUrl: '',
  isActive: true,
  sortOrder: 0,
};

const Field: React.FC<{ label: string; children: React.ReactNode; col?: boolean }> = ({ label, children, col }) => (
  <div className={col ? 'col-span-2' : ''}>
    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{label}</label>
    {children}
  </div>
);

const ScopeEditor: React.FC<{ value: string[]; onChange: (v: string[]) => void }> = ({ value, onChange }) => {
  const [input, setInput] = useState('');
  return (
    <div>
      <div className="flex gap-1 mb-1">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && input.trim()) { onChange([...value, input.trim()]); setInput(''); e.preventDefault(); } }}
          placeholder="Add item, press Enter"
          className={inputCls}
        />
        <button
          type="button"
          onClick={() => { if (input.trim()) { onChange([...value, input.trim()]); setInput(''); } }}
          className="px-2.5 h-8 text-xs bg-[#0f3156] text-white rounded-sm"
        >+</button>
      </div>
      <div className="space-y-1">
        {value.map((item, i) => (
          <div key={i} className="flex items-center gap-1 text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded">
            <span className="flex-1">{item}</span>
            <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 ml-1 font-bold">×</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ServicesView: React.FC<ServicesViewProps> = () => {
  const [services, setServices] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'services' | 'applications'>('services');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showNew, setShowNew] = useState(false);
  const [newSrv, setNewSrv] = useState<any>({ ...BLANK_SERVICE });
  const [filterType, setFilterType] = useState<'all' | 'primary' | 'secondary'>('all');

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      let loaded: any[] = [];
      // 1. Try /api/azexbuy/services
      try {
        const res = await authFetch('/api/azexbuy/services');
        if (res.ok) {
          const text = await res.text();
          if (text.startsWith('[') || text.startsWith('{')) {
            const data = JSON.parse(text);
            if (Array.isArray(data) && data.length > 0) {
              loaded = data;
            }
          }
        }
      } catch {}

      // 2. Fallback: /api/azexbuy/content (cmsServices)
      if (loaded.length === 0) {
        try {
          const contentRes = await fetch('/api/azexbuy/content');
          if (contentRes.ok) {
            const content = await contentRes.json();
            if (Array.isArray(content.cmsServices) && content.cmsServices.length > 0) {
              loaded = content.cmsServices;
            }
          }
        } catch {}
      }

      setServices(loaded);
    } finally { setLoading(false); }
  }, []);

  const loadApplications = useCallback(async () => {
    try {
      const res = await authFetch('/api/azexbuy/service-applications');
      if (res.ok) {
        const text = await res.text();
        if (text.startsWith('[') || text.startsWith('{')) {
          const data = JSON.parse(text);
          if (Array.isArray(data)) setApplications(data);
        }
      }
    } catch {}
  }, []);

  useEffect(() => { loadServices(); loadApplications(); }, [loadServices, loadApplications]);

  const handleSave = async (id: string) => {
    setSaving(true);
    try {
      try {
        await authFetch(`/api/azexbuy/services/${id}`, { method: 'PATCH', body: JSON.stringify(editData) });
      } catch {}

      try {
        const contentRes = await fetch('/api/azexbuy/content');
        const content = contentRes.ok ? await contentRes.json() : {};
        if (Array.isArray(content.cmsServices)) {
          content.cmsServices = content.cmsServices.map((s: any) => s.id === id ? { ...s, ...editData, updatedAt: new Date().toISOString() } : s);
          await authFetch('/api/azexbuy/content', { method: 'POST', body: JSON.stringify(content) });
        }
      } catch {}

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setEditingId(null);
      await loadServices();
    } finally { setSaving(false); }
  };

  const handleCreate = async () => {
    if (!newSrv.title.EN && !newSrv.title.AZ) return;
    setSaving(true);
    try {
      const id = `srv-${Date.now()}`;
      const createdItem = {
        ...newSrv,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await authFetch('/api/azexbuy/services', { method: 'POST', body: JSON.stringify(createdItem) });
      } catch {}

      try {
        const contentRes = await fetch('/api/azexbuy/content');
        const content = contentRes.ok ? await contentRes.json() : {};
        const existingList = Array.isArray(content.cmsServices) ? content.cmsServices : [...services];
        content.cmsServices = [createdItem, ...existingList.filter((s: any) => s.id !== id)];
        await authFetch('/api/azexbuy/content', { method: 'POST', body: JSON.stringify(content) });
      } catch {}

      setShowNew(false);
      setNewSrv({ ...BLANK_SERVICE });
      await loadServices();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu xidməti silmək istədiyinizə əminsiniz?')) return;
    try {
      await authFetch(`/api/azexbuy/services/${id}`, { method: 'DELETE' });
    } catch {}

    try {
      const contentRes = await fetch('/api/azexbuy/content');
      const content = contentRes.ok ? await contentRes.json() : {};
      if (Array.isArray(content.cmsServices)) {
        content.cmsServices = content.cmsServices.filter((s: any) => s.id !== id);
        await authFetch('/api/azexbuy/content', { method: 'POST', body: JSON.stringify(content) });
      }
    } catch {}

    await loadServices();
  };

  const handleToggleActive = async (srv: any) => {
    const updatedStatus = !srv.isActive;
    try {
      await authFetch(`/api/azexbuy/services/${srv.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: updatedStatus }) });
    } catch {}

    try {
      const contentRes = await fetch('/api/azexbuy/content');
      const content = contentRes.ok ? await contentRes.json() : {};
      if (Array.isArray(content.cmsServices)) {
        content.cmsServices = content.cmsServices.map((s: any) => s.id === srv.id ? { ...s, isActive: updatedStatus, updatedAt: new Date().toISOString() } : s);
        await authFetch('/api/azexbuy/content', { method: 'POST', body: JSON.stringify(content) });
      }
    } catch {}

    await loadServices();
  };

  const handleSeedDefaults = async () => {
    if (!confirm('Varsayılan 6 ixrac xidmətini panelə yükləmək istəyirsiniz?')) return;
    setSaving(true);
    try {
      // 1. Try server seed endpoint
      try { await authFetch('/api/azexbuy/seed'); } catch {}

      // 2. Also ensure cmsServices in content is populated
      const contentRes = await fetch('/api/azexbuy/content');
      const content = contentRes.ok ? await contentRes.json() : {};
      content.cmsServices = SEED_SERVICES.map(s => ({
        id: s.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title: s.title,
        description: s.description,
        scope: s.scope,
        targetAudience: s.targetAudience,
        iconClass: s.iconClass,
        colorClass: s.colorClass,
        serviceType: s.serviceType,
        isActive: Boolean(s.isActive),
        sortOrder: s.sortOrder,
      }));
      await authFetch('/api/azexbuy/content', { method: 'POST', body: JSON.stringify(content) });
      await loadServices();
    } finally { setSaving(false); }
  };

  const handleAppStatus = async (id: string, status: string) => {
    await authFetch(`/api/azexbuy/service-applications/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await loadApplications();
  };

  const handleDeleteApp = async (id: string) => {
    if (!confirm('Bu müraciəti silmək istədiyinizə əminsiniz?')) return;
    await authFetch(`/api/azexbuy/service-applications/${id}`, { method: 'DELETE' });
    await loadApplications();
  };

  const filtered = services.filter(s => filterType === 'all' || s.serviceType === filterType);

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Xidmətlər</h1>
          <p className="text-xs text-slate-500 mt-0.5">Hizmet kartlarını və müraciətləri idarə edin</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" /> Saxlandı
            </span>
          )}
          <button onClick={() => { loadServices(); loadApplications(); }} className="p-1.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'services' ? 'border-b-2 border-[#0f3156] text-[#0f3156]' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Xidmətlər ({services.length})
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'applications' ? 'border-b-2 border-[#0f3156] text-[#0f3156]' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Müraciətlər ({applications.length})
        </button>
      </div>

      {/* SERVICES TAB */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-1">
              {(['all', 'primary', 'secondary'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-3 py-1 text-[11px] font-bold rounded cursor-pointer ${filterType === f ? 'bg-[#0f3156] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {f === 'all' ? 'Hamısı' : f === 'primary' ? 'Əsas' : 'Əlavə'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSeedDefaults}
                disabled={saving}
                title="Sistemdəki varsayılan 6 ixrac xidmətini bərpa et"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded cursor-pointer transition-colors disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
                Varsayılanları Yüklə
              </button>
              <button
                onClick={() => setShowNew(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f3156] text-white text-xs font-bold rounded cursor-pointer hover:bg-[#1a4a7a]"
              >
                <Plus className="w-3.5 h-3.5" />
                Yeni Xidmət
              </button>
            </div>
          </div>

          {/* New Service Form */}
          {showNew && (
            <div className="border border-emerald-200 bg-emerald-50/40 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700">Yeni Xidmət Əlavə Et</span>
                <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer">×</button>
              </div>
              <div className="space-y-4">
                {/* Title — all 6 languages */}
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Başlıq / Title</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {LANGS.map(lang => (
                      <Field key={lang} label={LANG_LABELS[lang]}>
                        <input value={newSrv.title?.[lang] || ''} onChange={e => setNewSrv((p: any) => ({ ...p, title: { ...p.title, [lang]: e.target.value } }))} className={inputCls} placeholder={lang} />
                      </Field>
                    ))}
                  </div>
                </div>
                {/* Description — all 6 languages */}
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Açıqlama / Description</div>
                  <div className="grid grid-cols-1 gap-2">
                    {LANGS.map(lang => (
                      <Field key={lang} label={LANG_LABELS[lang]}>
                        <textarea value={newSrv.description?.[lang] || ''} onChange={e => setNewSrv((p: any) => ({ ...p, description: { ...p.description, [lang]: e.target.value } }))} className={textareaCls} rows={2} placeholder={lang} />
                      </Field>
                    ))}
                  </div>
                </div>
                {/* Target Audience — all 6 languages */}
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Hədəf Kitle / Target Audience</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {LANGS.map(lang => (
                      <Field key={lang} label={LANG_LABELS[lang]}>
                        <input value={newSrv.targetAudience?.[lang] || ''} onChange={e => setNewSrv((p: any) => ({ ...p, targetAudience: { ...p.targetAudience, [lang]: e.target.value } }))} className={inputCls} placeholder={lang} />
                      </Field>
                    ))}
                  </div>
                </div>
                {/* Scope — all 6 languages */}
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Kapsam / Scope</div>
                  <div className="grid grid-cols-1 gap-2">
                    {LANGS.map(lang => (
                      <Field key={lang} label={LANG_LABELS[lang]}>
                        <ScopeEditor value={newSrv.scope?.[lang] || []} onChange={v => setNewSrv((p: any) => ({ ...p, scope: { ...p.scope, [lang]: v } }))} />
                      </Field>
                    ))}
                  </div>
                </div>
                {/* Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="İkon">
                    <select value={newSrv.iconClass} onChange={e => setNewSrv((p: any) => ({ ...p, iconClass: e.target.value }))} className={inputCls}>
                      {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                    </select>
                  </Field>
                  <Field label="Rəng">
                    <select value={newSrv.colorClass} onChange={e => setNewSrv((p: any) => ({ ...p, colorClass: e.target.value }))} className={inputCls}>
                      {COLOR_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Növ">
                    <select value={newSrv.serviceType} onChange={e => setNewSrv((p: any) => ({ ...p, serviceType: e.target.value }))} className={inputCls}>
                      <option value="primary">Əsas xidmət</option>
                      <option value="secondary">Əlavə xidmət</option>
                    </select>
                  </Field>
                  <Field label="Kateqoriya">
                    <select value={newSrv.category || 'Export'} onChange={e => setNewSrv((p: any) => ({ ...p, category: e.target.value }))} className={inputCls}>
                      {SERVICE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </Field>
                  <Field label="RFQ Müraciət Kodu">
                    <input type="text" value={newSrv.rfqSlug || ''} onChange={e => setNewSrv((p: any) => ({ ...p, rfqSlug: e.target.value }))} className={inputCls} placeholder="customs-clearance" />
                  </Field>
                  <Field label="Sıra">
                    <input type="number" value={newSrv.sortOrder} onChange={e => setNewSrv((p: any) => ({ ...p, sortOrder: Number(e.target.value) }))} className={inputCls} />
                  </Field>
                  <Field label="Xidmət Şəkli URL" col>
                    <div className="flex gap-2">
                      <input type="text" value={newSrv.imageUrl || ''} onChange={e => setNewSrv((p: any) => ({ ...p, imageUrl: e.target.value }))} className={inputCls} placeholder="https://..." />
                      <label className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-sm border border-slate-200 flex items-center gap-1 cursor-pointer shrink-0">
                        <Upload className="w-3 h-3" />
                        <span className="hidden sm:inline">Yüklə</span>
                        <input type="file" accept="image/*" className="hidden" onChange={async e => {
                          const f = e.target.files?.[0];
                          if (f) {
                            const url = await uploadFile(f);
                            if (url) setNewSrv((p: any) => ({ ...p, imageUrl: url }));
                          }
                        }} />
                      </label>
                    </div>
                    {newSrv.imageUrl && (
                      <div className="mt-2 w-28 h-20 bg-slate-100 border border-slate-200 rounded p-1 flex items-center justify-center overflow-hidden">
                        <img src={newSrv.imageUrl} alt="" className="max-w-full max-h-full object-contain" onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
                      </div>
                    )}
                  </Field>
                  <div className="col-span-2 flex items-center gap-2">
                    <input type="checkbox" id="new-srv-approved" checked={newSrv.isApproved !== false} onChange={e => setNewSrv((p: any) => ({ ...p, isApproved: e.target.checked }))} />
                    <label htmlFor="new-srv-approved" className="text-xs text-slate-700">Təsdiqlənib (Yayımlansın — təsdiqlənməyən əlavə xidmətlər saytda gizli saxlanılır)</label>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowNew(false)} className="px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded cursor-pointer">İptal</button>
                <button onClick={handleCreate} disabled={saving} className="px-4 py-1.5 text-xs font-bold bg-[#0f3156] text-white rounded cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
                  <Save className="w-3 h-3" /> {saving ? '...' : 'Yarat'}
                </button>
              </div>
            </div>
          )}

          {/* Services list */}
          {loading ? (
            <div className="text-center py-10 text-slate-400 text-xs">Yüklənir...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center gap-3 bg-white border border-dashed border-slate-200 rounded-lg">
              <Briefcase className="w-10 h-10 text-slate-300" />
              <span className="font-medium text-slate-600">Hələ heç bir xidmət əlavə edilməyib</span>
              <button
                onClick={handleSeedDefaults}
                disabled={saving}
                className="mt-1 px-4 py-2 bg-[#0f3156] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-[#1a4a7a] flex items-center gap-2 shadow-sm disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
                Varsayılan 6 İxrac Xidmətini Yüklə
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(srv => {
                const isExpanded = expandedId === srv.id;
                const isEditing = editingId === srv.id;
                return (
                  <div key={srv.id} className={`border rounded-lg overflow-hidden ${srv.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60'}`}>
                    {/* Row header */}
                    <div className="flex items-center gap-3 p-3 bg-white hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : srv.id)}>
                      <div className={`w-8 h-8 rounded-full ${srv.colorClass} flex items-center justify-center shrink-0`}>
                        <i className={`${srv.iconClass} text-white text-xs`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">{toText(srv.title, '—')}</div>
                        <div className="text-[10px] text-slate-400">{typeof srv.title === 'object' ? toText(srv.title?.EN) : ''}</div>
                      </div>
                      {srv.imageUrl && (
                        <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                          <img src={srv.imageUrl} alt="" className="max-w-full max-h-full object-contain" onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
                        </div>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${srv.serviceType === 'primary' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {srv.serviceType === 'primary' ? 'Əsas' : 'Əlavə'}
                      </span>
                      {srv.category && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                          {srv.category}
                        </span>
                      )}
                      {srv.isApproved === false && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          Təsdiq Gözləyir
                        </span>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); handleToggleActive(srv); }}
                        className="p-1 rounded cursor-pointer"
                        title={srv.isActive ? 'Deaktiv et' : 'Aktiv et'}
                      >
                        {srv.isActive
                          ? <ToggleRight className="w-4 h-4 text-emerald-600" />
                          : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                      </button>
                      <button onClick={e => { e.stopPropagation(); setEditingId(srv.id); setEditData({ ...srv }); setExpandedId(srv.id); }} className="p-1 rounded hover:bg-slate-100 cursor-pointer">
                        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(srv.id); }} className="p-1 rounded hover:bg-red-50 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                    </div>

                    {/* Expanded detail / edit */}
                    {isExpanded && (
                      <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-4">
                        {isEditing ? (
                          <>
                            <div className="space-y-4">
                              <div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Başlıq / Title</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {LANGS.map(lang => (
                                    <Field key={lang} label={LANG_LABELS[lang]}>
                                      <input value={editData.title?.[lang] || ''} onChange={e => setEditData((p: any) => ({ ...p, title: { ...p.title, [lang]: e.target.value } }))} className={inputCls} />
                                    </Field>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Açıqlama / Description</div>
                                <div className="grid grid-cols-1 gap-2">
                                  {LANGS.map(lang => (
                                    <Field key={lang} label={LANG_LABELS[lang]}>
                                      <textarea value={editData.description?.[lang] || ''} onChange={e => setEditData((p: any) => ({ ...p, description: { ...p.description, [lang]: e.target.value } }))} className={textareaCls} rows={2} />
                                    </Field>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Hədəf Kitle / Target Audience</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {LANGS.map(lang => (
                                    <Field key={lang} label={LANG_LABELS[lang]}>
                                      <input value={editData.targetAudience?.[lang] || ''} onChange={e => setEditData((p: any) => ({ ...p, targetAudience: { ...p.targetAudience, [lang]: e.target.value } }))} className={inputCls} />
                                    </Field>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Kapsam / Scope</div>
                                <div className="grid grid-cols-1 gap-2">
                                  {LANGS.map(lang => (
                                    <Field key={lang} label={LANG_LABELS[lang]}>
                                      <ScopeEditor value={editData.scope?.[lang] || []} onChange={v => setEditData((p: any) => ({ ...p, scope: { ...p.scope, [lang]: v } }))} />
                                    </Field>
                                  ))}
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Field label="İkon">
                                  <select value={editData.iconClass || ''} onChange={e => setEditData((p: any) => ({ ...p, iconClass: e.target.value }))} className={inputCls}>
                                    {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                                  </select>
                                </Field>
                                <Field label="Rəng">
                                  <select value={editData.colorClass || ''} onChange={e => setEditData((p: any) => ({ ...p, colorClass: e.target.value }))} className={inputCls}>
                                    {COLOR_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                  </select>
                                </Field>
                                <Field label="Növ">
                                  <select value={editData.serviceType || 'primary'} onChange={e => setEditData((p: any) => ({ ...p, serviceType: e.target.value }))} className={inputCls}>
                                    <option value="primary">Əsas xidmət</option>
                                    <option value="secondary">Əlavə xidmət</option>
                                  </select>
                                </Field>
                                <Field label="Kateqoriya">
                                  <select value={editData.category || 'Export'} onChange={e => setEditData((p: any) => ({ ...p, category: e.target.value }))} className={inputCls}>
                                    {SERVICE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                  </select>
                                </Field>
                                <Field label="RFQ Müraciət Kodu">
                                  <input type="text" value={editData.rfqSlug || ''} onChange={e => setEditData((p: any) => ({ ...p, rfqSlug: e.target.value }))} className={inputCls} placeholder="customs-clearance" />
                                </Field>
                                <Field label="Sıra">
                                  <input type="number" value={editData.sortOrder || 0} onChange={e => setEditData((p: any) => ({ ...p, sortOrder: Number(e.target.value) }))} className={inputCls} />
                                </Field>
                                <Field label="Xidmət Şəkli URL" col>
                                  <div className="flex gap-2">
                                    <input type="text" value={editData.imageUrl || ''} onChange={e => setEditData((p: any) => ({ ...p, imageUrl: e.target.value }))} className={inputCls} placeholder="https://..." />
                                    <label className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-sm border border-slate-200 flex items-center gap-1 cursor-pointer shrink-0">
                                      <Upload className="w-3 h-3" />
                                      <span className="hidden sm:inline">Yüklə</span>
                                      <input type="file" accept="image/*" className="hidden" onChange={async e => {
                                        const f = e.target.files?.[0];
                                        if (f) {
                                          const url = await uploadFile(f);
                                          if (url) setEditData((p: any) => ({ ...p, imageUrl: url }));
                                        }
                                      }} />
                                    </label>
                                  </div>
                                  {editData.imageUrl && (
                                    <div className="mt-2 w-28 h-20 bg-slate-100 border border-slate-200 rounded p-1 flex items-center justify-center overflow-hidden">
                                      <img src={editData.imageUrl} alt="" className="max-w-full max-h-full object-contain" onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
                                    </div>
                                  )}
                                </Field>
                                <div className="col-span-2 flex items-center gap-2">
                                  <input type="checkbox" id={`srv-appr-${srv.id}`} checked={editData.isApproved !== false} onChange={e => setEditData((p: any) => ({ ...p, isApproved: e.target.checked }))} />
                                  <label htmlFor={`srv-appr-${srv.id}`} className="text-xs text-slate-700">Təsdiqlənib (Yayımlansın — təsdiqlənməyən əlavə xidmətlər saytda gizli saxlanılır)</label>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded cursor-pointer">İptal</button>
                              <button onClick={() => handleSave(srv.id)} disabled={saving} className="px-4 py-1.5 text-xs font-bold bg-[#0f3156] text-white rounded cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
                                <Save className="w-3 h-3" /> {saving ? '...' : 'Saxla'}
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-xs text-slate-700 space-y-2">
                            <p><span className="font-bold">EN:</span> {toText(srv.description?.EN || srv.description)}</p>
                            <p><span className="font-bold">AZ:</span> {toText(srv.description?.AZ || srv.description)}</p>
                            {srv.scope?.EN?.length > 0 && (
                              <div>
                                <span className="font-bold block mb-1">Scope (EN):</span>
                                <ul className="list-disc list-inside space-y-0.5">
                                  {srv.scope.EN.map((item: string, i: number) => <li key={i}>{item}</li>)}
                                </ul>
                              </div>
                            )}
                            <p><span className="font-bold">Target:</span> {srv.targetAudience?.EN}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* APPLICATIONS TAB */}
      {activeTab === 'applications' && (
        <div className="space-y-3">
          {applications.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs flex flex-col items-center gap-2">
              <Briefcase className="w-8 h-8" />
              <span>Hələ müraciət yoxdur</span>
            </div>
          ) : (
            applications.map(app => (
              <div key={app.id} className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-800">{app.fullName} — {app.company}</div>
                    <div className="text-[10px] text-slate-500">{app.email} · {app.country}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{new Date(app.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={app.status}
                      onChange={e => handleAppStatus(app.id, e.target.value)}
                      className="text-[10px] font-bold border border-slate-200 rounded px-2 py-1 h-7 cursor-pointer"
                    >
                      {['Pending', 'Contacted', 'In Progress', 'Completed', 'Rejected'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button onClick={() => handleDeleteApp(app.id)} className="p-1 hover:bg-red-50 rounded cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
                {app.selectedServices?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {app.selectedServices.map((sId: string) => {
                      const srv = services.find(s => s.id === sId);
                      return <span key={sId} className="text-[10px] font-bold bg-brandNavy/10 text-[#0f3156] px-2 py-0.5 rounded-full">{srv?.title?.AZ || srv?.title?.EN || sId}</span>;
                    })}
                  </div>
                )}
                {app.details && (
                  <p className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded">{app.details}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
