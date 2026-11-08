import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronRight,
  Package, Tag, Star, Eye, EyeOff, RefreshCw, CheckCircle,
  FileText, ArrowUpDown, MessageSquare, Upload,
} from 'lucide-react';
import { UiLanguage } from '../types';

interface ProductCatalogViewProps { uiLang: UiLanguage; }

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

const LANGS = ['AZ', 'EN', 'TR', 'RU', 'AR', 'ES'] as const;
const LANG_LABELS: Record<string, string> = { AZ: 'Azərbaycanca', EN: 'English', TR: 'Türkçe', RU: 'Русский', AR: 'العربية', ES: 'Español' };

const Field: React.FC<{ label: string; children: React.ReactNode; full?: boolean }> = ({ label, children, full }) => (
  <div className={full ? 'col-span-2' : ''}>
    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{label}</label>
    {children}
  </div>
);

const inCls = 'w-full h-8 text-xs border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156]';
const taCls = 'w-full text-xs border border-slate-200 px-2.5 py-1.5 rounded-sm focus:outline-none focus:border-[#0f3156] resize-none';

// ─── SaveBar ────────────────────────────────────────────────────────────────
const SaveBar: React.FC<{ onSave: () => void; saving: boolean; saved: boolean }> = ({ onSave, saving, saved }) => (
  <div className="flex justify-end pt-2">
    <button onClick={onSave} disabled={saving}
      className="flex items-center gap-1.5 h-8 px-4 bg-[#0f3156] hover:bg-[#081c33] text-white text-xs font-bold rounded-sm disabled:opacity-50">
      {saved ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
      {saving ? 'Saxlanılır...' : saved ? 'Saxlandı' : 'Yadda Saxla'}
    </button>
  </div>
);

// ─── Empty state ─────────────────────────────────────────────────────────────
const Empty: React.FC<{ icon: React.ReactNode; message: string }> = ({ icon, message }) => (
  <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
    {icon}
    <p className="text-xs">{message}</p>
  </div>
);

export const ProductCatalogView: React.FC<ProductCatalogViewProps> = () => {
  const [tab, setTab] = useState<'categories' | 'products'>('categories');
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [editingProd, setEditingProd] = useState<any | null>(null);
  const [showNewCat, setShowNewCat] = useState(false);
  const [showNewProd, setShowNewProd] = useState(false);
  const blankML = () => ({ AZ: '', EN: '', TR: '', RU: '', AR: '', ES: '' });
  const [newCat, setNewCat] = useState({ name: blankML(), slug: '', description: blankML(), imageUrl: '', sortOrder: 0 });
  const [newProd, setNewProd] = useState({
    categoryId: '', name: blankML(), slug: '', shortDescription: blankML(), description: blankML(),
    moq: '', hsCode: '', originRegion: '', packagingInfo: '', isFeatured: false,
    seoTitle: '', seoDescription: '', certificates: [] as string[], images: [] as string[],
    sortOrder: 0,
  });
  const [filterCat, setFilterCat] = useState('');
  const [uploading, setUploading] = useState(false);
  const [inquiriesProd, setInquiriesProd] = useState<any | null>(null);
  const [inquiriesList, setInquiriesList] = useState<any[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);

  const loadInquiriesForProd = async (prod: any) => {
    setInquiriesProd(prod);
    setInquiriesLoading(true);
    try {
      const q = typeof prod.name === 'object' ? (prod.name.AZ || prod.name.EN || prod.slug) : prod.name || prod.slug;
      const res = await authFetch(`/api/azexbuy/inquiries-by-product?q=${encodeURIComponent(q)}`);
      if (res.ok) setInquiriesList(await res.json());
      else setInquiriesList([]);
    } catch {
      setInquiriesList([]);
    } finally {
      setInquiriesLoading(false);
    }
  };

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const r = await authFetch('/api/azexbuy/categories');
      if (r.ok) setCategories(await r.json());
    } finally { setLoading(false); }
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const r = await authFetch('/api/azexbuy/admin/products');
      if (r.ok) setProducts(await r.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCategories(); loadProducts(); }, [loadCategories, loadProducts]);

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  // ─── Category CRUD ────────────────────────────────────────────────────────
  const handleCreateCat = async () => {
    if (!newCat.name.EN?.trim() && !newCat.name.AZ?.trim()) return;
    const catToCreate = { ...newCat, slug: newCat.slug || (newCat.name.EN || newCat.name.AZ || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') };
    setSaving(true);
    try {
      const r = await authFetch('/api/azexbuy/categories', {
        method: 'POST', body: JSON.stringify(catToCreate),
      });
      if (r.ok) { setShowNewCat(false); setNewCat({ name: blankML(), slug: '', description: blankML(), imageUrl: '', sortOrder: 0 }); loadCategories(); showSaved(); }
      else { const e = await r.json(); alert(e.error || 'Xəta'); }
    } finally { setSaving(false); }
  };

  const handleUpdateCat = async (id: string, data: any) => {
    setSaving(true);
    try {
      await authFetch(`/api/azexbuy/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
      loadCategories(); showSaved();
    } finally { setSaving(false); setEditingCat(null); }
  };

  const handleDeleteCat = async (id: string, name: string) => {
    if (!confirm(`"${name}" kateqoriyasını silmək istəyirsiniz?`)) return;
    const r = await authFetch(`/api/azexbuy/categories/${id}`, { method: 'DELETE' });
    if (r.ok) loadCategories();
    else { const e = await r.json(); alert(e.error || 'Xəta'); }
  };

  // ─── Product CRUD ─────────────────────────────────────────────────────────
  const handleCreateProd = async () => {
    const nameVal = typeof newProd.name === 'string' ? newProd.name : (newProd.name as any).EN || (newProd.name as any).AZ || '';
    if (!nameVal.trim() || !newProd.slug.trim() || !newProd.categoryId) return;
    setSaving(true);
    try {
      const r = await authFetch('/api/azexbuy/admin/products', {
        method: 'POST', body: JSON.stringify(newProd),
      });
      if (r.ok) { setShowNewProd(false); setNewProd({ categoryId: '', name: blankML(), slug: '', shortDescription: blankML(), description: blankML(), moq: '', hsCode: '', originRegion: '', packagingInfo: '', isFeatured: false, seoTitle: '', seoDescription: '', certificates: [], images: [], sortOrder: 0 }); loadProducts(); showSaved(); }
      else { const e = await r.json(); alert(e.error || 'Xəta'); }
    } finally { setSaving(false); }
  };

  const handleUpdateProd = async (id: string, data: any) => {
    setSaving(true);
    try {
      await authFetch(`/api/azexbuy/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
      loadProducts(); showSaved();
    } finally { setSaving(false); setEditingProd(null); }
  };

  const handleDeleteProd = async (id: string, name: string) => {
    if (!confirm(`"${name}" məhsulunu silmək istəyirsiniz?`)) return;
    const r = await authFetch(`/api/azexbuy/admin/products/${id}`, { method: 'DELETE' });
    if (r.ok) loadProducts();
    else { const e = await r.json(); alert(e.error || 'Xəta'); }
  };

  const slugify = (s: string) => s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const filteredProducts = filterCat ? products.filter(p => p.categoryId === filterCat) : products;

  return (
    <div className="p-6 space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#0f3156]" /> Ürün Kataloğu
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{categories.length} kateqoriya · {products.length} məhsul</p>
        </div>
        <button onClick={() => { loadCategories(); loadProducts(); }} className="p-2 hover:bg-slate-100 rounded text-slate-400">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {(['categories', 'products'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${tab === t ? 'border-[#0f3156] text-[#0f3156]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t === 'categories' ? `Kateqoriyalar (${categories.length})` : `Məhsullar (${products.length})`}
          </button>
        ))}
      </div>

      {/* ── CATEGORIES TAB ── */}
      {tab === 'categories' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => setShowNewCat(v => !v)}
              className="flex items-center gap-1.5 h-8 px-3 bg-[#0f3156] hover:bg-[#081c33] text-white text-xs font-bold rounded-sm">
              <Plus className="w-3.5 h-3.5" /> Yeni Kateqoriya
            </button>
          </div>

          {showNewCat && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4 space-y-4">
              <h3 className="text-xs font-bold text-blue-800">Yeni Kateqoriya</h3>
              {/* Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Slug *">
                  <input value={newCat.slug} onChange={e => setNewCat(v => ({ ...v, slug: slugify(e.target.value) }))}
                    className={`${inCls} font-mono`} placeholder="food-products" />
                </Field>
                <Field label="Şəkil URL">
                  <div className="flex gap-2">
                    <input value={newCat.imageUrl || ''} onChange={e => setNewCat(v => ({ ...v, imageUrl: e.target.value }))}
                      className={inCls} placeholder="https://..." />
                    <label className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-sm border border-slate-200 flex items-center gap-1 cursor-pointer shrink-0">
                      <Upload className="w-3 h-3" />
                      <span className="hidden sm:inline">Yüklə</span>
                      <input type="file" accept="image/*" className="hidden" onChange={async e => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setUploading(true);
                          const url = await uploadFile(f);
                          if (url) setNewCat(v => ({ ...v, imageUrl: url }));
                          setUploading(false);
                        }
                      }} />
                    </label>
                  </div>
                  {newCat.imageUrl && (
                    <div className="mt-2 w-28 h-20 bg-white border border-slate-200 rounded p-1 flex items-center justify-center overflow-hidden">
                      <img src={newCat.imageUrl} alt="" className="max-w-full max-h-full object-contain" onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
                    </div>
                  )}
                </Field>
              </div>
              {/* Name - all langs */}
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Ad / Name *</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {LANGS.map(lang => (
                    <Field key={lang} label={LANG_LABELS[lang]}>
                      <input value={(newCat.name as any)[lang] || ''} onChange={e => setNewCat(v => ({ ...v, name: { ...(v.name as any), [lang]: e.target.value }, slug: v.slug || slugify(lang === 'EN' ? e.target.value : (v.name as any).EN || '') }))}
                        className={inCls} placeholder={lang === 'AZ' ? 'Qida məhsulları' : lang === 'EN' ? 'Food Products' : lang} />
                    </Field>
                  ))}
                </div>
              </div>
              {/* Description - all langs */}
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Açıqlama / Description</div>
                <div className="grid grid-cols-1 gap-2">
                  {LANGS.map(lang => (
                    <Field key={lang} label={LANG_LABELS[lang]}>
                      <textarea value={(newCat.description as any)[lang] || ''} onChange={e => setNewCat(v => ({ ...v, description: { ...(v.description as any), [lang]: e.target.value } }))}
                        className={taCls} rows={2} />
                    </Field>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowNewCat(false)} className="h-8 px-3 text-xs text-slate-500 hover:text-slate-700">İptal</button>
                <button onClick={handleCreateCat} disabled={saving}
                  className="h-8 px-4 bg-[#0f3156] text-white text-xs font-bold rounded-sm disabled:opacity-50">
                  {saving ? 'Əlavə edilir...' : 'Əlavə Et'}
                </button>
              </div>
            </div>
          )}

          {loading && <div className="text-center py-8 text-xs text-slate-400">Yüklənir...</div>}
          {!loading && categories.length === 0 && <Empty icon={<Tag className="w-8 h-8" />} message="Kateqoriya yoxdur" />}

          {categories.map(cat => (
            <div key={cat.id} className="bg-white border border-slate-200 rounded overflow-hidden">
              {editingCat?.id === cat.id ? (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Slug</label>
                      <input value={editingCat.slug} onChange={e => setEditingCat((v: any) => ({ ...v, slug: slugify(e.target.value) }))}
                        className={`${inCls} font-mono`} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Şəkil URL</label>
                      <div className="flex gap-2">
                        <input value={editingCat.imageUrl || ''} onChange={e => setEditingCat((v: any) => ({ ...v, imageUrl: e.target.value }))}
                          className={inCls} placeholder="https://..." />
                        <label className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-sm border border-slate-200 flex items-center gap-1 cursor-pointer shrink-0">
                          <Upload className="w-3 h-3" />
                          <span className="hidden sm:inline">Yüklə</span>
                          <input type="file" accept="image/*" className="hidden" onChange={async e => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setUploading(true);
                              const url = await uploadFile(f);
                              if (url) setEditingCat((v: any) => ({ ...v, imageUrl: url }));
                              setUploading(false);
                            }
                          }} />
                        </label>
                      </div>
                      {editingCat.imageUrl && (
                        <div className="mt-2 w-28 h-20 bg-white border border-slate-200 rounded p-1 flex items-center justify-center overflow-hidden">
                          <img src={editingCat.imageUrl} alt="" className="max-w-full max-h-full object-contain" onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Ad / Name</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {LANGS.map(lang => (
                        <div key={lang}>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{LANG_LABELS[lang]}</label>
                          <input value={typeof editingCat.name === 'object' ? (editingCat.name[lang] || '') : (editingCat.name || '')} onChange={e => setEditingCat((v: any) => ({ ...v, name: { ...(typeof v.name === 'object' ? v.name : {}), [lang]: e.target.value } }))}
                            className={inCls} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Açıqlama / Description</div>
                    <div className="grid grid-cols-1 gap-2">
                      {LANGS.map(lang => (
                        <div key={lang}>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{LANG_LABELS[lang]}</label>
                          <textarea value={typeof editingCat.description === 'object' ? (editingCat.description[lang] || '') : (editingCat.description || '')} onChange={e => setEditingCat((v: any) => ({ ...v, description: { ...(typeof v.description === 'object' ? v.description : {}), [lang]: e.target.value } }))}
                            rows={2} className={taCls} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingCat(null)} className="h-8 px-3 text-xs text-slate-500 hover:text-slate-700">İptal</button>
                    <button onClick={() => handleUpdateCat(cat.id, editingCat)} disabled={saving}
                      className="h-8 px-4 bg-[#0f3156] text-white text-xs font-bold rounded-sm disabled:opacity-50">Saxla</button>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {cat.imageUrl ? (
                      <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                        <img src={cat.imageUrl} alt="" className="max-w-full max-h-full object-contain" onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
                      </div>
                    ) : (
                      <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <div>
                      <span className="text-xs font-bold text-slate-800">{cat.name}</span>
                      <span className="ml-2 text-[10px] font-mono text-slate-400">{cat.slug}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cat.isActive ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                      {cat.isActive ? 'Aktiv' : 'Passiv'}
                    </span>
                    <span className="text-[10px] text-slate-400">{products.filter(p => p.categoryId === cat.id).length} məhsul</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => authFetch(`/api/azexbuy/categories/${cat.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !cat.isActive }) }).then(() => loadCategories())}
                      className="p-1 text-slate-300 hover:text-slate-600 rounded transition-colors" title={cat.isActive ? 'Deaktiv et' : 'Aktiv et'}>
                      {cat.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => setEditingCat({ ...cat })}
                      className="p-1 text-slate-300 hover:text-blue-500 rounded transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteCat(cat.id, cat.name)}
                      className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── PRODUCTS TAB ── */}
      {tab === 'products' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="h-8 text-xs border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] bg-white">
              <option value="">Bütün kateqoriyalar</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={() => setShowNewProd(v => !v)}
              className="flex items-center gap-1.5 h-8 px-3 bg-[#0f3156] hover:bg-[#081c33] text-white text-xs font-bold rounded-sm">
              <Plus className="w-3.5 h-3.5" /> Yeni Məhsul
            </button>
          </div>

          {showNewProd && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4 space-y-4">
              <h3 className="text-xs font-bold text-blue-800">Yeni Məhsul</h3>
              {/* Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Kateqoriya *" full>
                  <select value={newProd.categoryId} onChange={e => setNewProd(v => ({ ...v, categoryId: e.target.value }))}
                    className={`${inCls} bg-white`}>
                    <option value="">Seçin...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{typeof c.name === 'object' ? (c.name.AZ || c.name.EN || Object.values(c.name)[0]) : c.name}</option>)}
                  </select>
                </Field>
                <Field label="Slug *">
                  <input value={newProd.slug} onChange={e => setNewProd(v => ({ ...v, slug: slugify(e.target.value) }))}
                    className={`${inCls} font-mono`} placeholder="natural-honey" />
                </Field>
                <Field label="HS Kodu">
                  <input value={newProd.hsCode} onChange={e => setNewProd(v => ({ ...v, hsCode: e.target.value }))} className={inCls} placeholder="0409.00" />
                </Field>
                <Field label="MOQ">
                  <input value={newProd.moq} onChange={e => setNewProd(v => ({ ...v, moq: e.target.value }))} className={inCls} placeholder="500 kg" />
                </Field>
                <Field label="Mənşə Bölgəsi">
                  <input value={newProd.originRegion} onChange={e => setNewProd(v => ({ ...v, originRegion: e.target.value }))} className={inCls} placeholder="Şəki" />
                </Field>
                <Field label="Qablaşdırma">
                  <input value={newProd.packagingInfo} onChange={e => setNewProd(v => ({ ...v, packagingInfo: e.target.value }))} className={inCls} />
                </Field>
              </div>
              {/* Name - all langs */}
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Ad / Name *</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {LANGS.map(lang => (
                    <Field key={lang} label={LANG_LABELS[lang]}>
                      <input value={(newProd.name as any)[lang] || ''} onChange={e => setNewProd(v => ({ ...v, name: { ...(v.name as any), [lang]: e.target.value }, slug: v.slug || (lang === 'EN' ? slugify(e.target.value) : v.slug) }))}
                        className={inCls} />
                    </Field>
                  ))}
                </div>
              </div>
              {/* Short Description */}
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Qısa Açıqlama / Short Description</div>
                <div className="grid grid-cols-1 gap-2">
                  {LANGS.map(lang => (
                    <Field key={lang} label={LANG_LABELS[lang]}>
                      <textarea value={(newProd.shortDescription as any)[lang] || ''} onChange={e => setNewProd(v => ({ ...v, shortDescription: { ...(v.shortDescription as any), [lang]: e.target.value } }))}
                        className={taCls} rows={2} />
                    </Field>
                  ))}
                </div>
              </div>
              {/* Description */}
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Açıqlama / Description</div>
                <div className="grid grid-cols-1 gap-2">
                  {LANGS.map(lang => (
                    <Field key={lang} label={LANG_LABELS[lang]}>
                      <textarea value={(newProd.description as any)[lang] || ''} onChange={e => setNewProd(v => ({ ...v, description: { ...(v.description as any), [lang]: e.target.value } }))}
                        className={taCls} rows={3} />
                    </Field>
                  ))}
                </div>
              </div>
              {/* Images */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Məhsul Şəkilləri (Hər sətirdə bir URL)</label>
                  <label className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>{uploading ? 'Yüklənir...' : 'Kompüterdən Yüklə'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={async e => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setUploading(true);
                        const url = await uploadFile(f);
                        if (url) setNewProd(v => ({ ...v, images: [...(v.images || []), url] }));
                        setUploading(false);
                      }
                    }} />
                  </label>
                </div>
                <textarea
                  value={Array.isArray(newProd.images) ? newProd.images.join('\n') : ''}
                  onChange={e => setNewProd(v => ({ ...v, images: e.target.value.split('\n').map((s: string) => s.trim()).filter(Boolean) }))}
                  rows={2}
                  className={taCls}
                  placeholder="https://images.unsplash.com/..."
                />
                {Array.isArray(newProd.images) && newProd.images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {newProd.images.map((imgUrl: string, idx: number) => (
                      <div key={idx} className="w-14 h-14 bg-white border border-slate-200 rounded p-1 flex items-center justify-center overflow-hidden">
                        <img src={imgUrl} alt="" className="max-w-full max-h-full object-contain" onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Certificates */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sertifikatlar (Vergüllə ayırın: GlobalGAP, ISO 22000, Halal)</label>
                <input
                  value={Array.isArray(newProd.certificates) ? newProd.certificates.join(', ') : ''}
                  onChange={e => setNewProd(v => ({ ...v, certificates: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) }))}
                  className={inCls}
                  placeholder="GlobalGAP, ISO 22000, Halal, HACCP"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="new-featured" checked={newProd.isFeatured} onChange={e => setNewProd(v => ({ ...v, isFeatured: e.target.checked }))} />
                <label htmlFor="new-featured" className="text-xs text-slate-700">Ana səhifədə öne çıkar</label>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowNewProd(false)} className="h-8 px-3 text-xs text-slate-500">İptal</button>
                <button onClick={handleCreateProd} disabled={saving || !newProd.categoryId || !newProd.slug}
                  className="h-8 px-4 bg-[#0f3156] text-white text-xs font-bold rounded-sm disabled:opacity-50">
                  {saving ? 'Əlavə edilir...' : 'Əlavə Et'}
                </button>
              </div>
            </div>
          )}

          {loading && <div className="text-center py-8 text-xs text-slate-400">Yüklənir...</div>}
          {!loading && filteredProducts.length === 0 && <Empty icon={<Package className="w-8 h-8" />} message="Məhsul yoxdur" />}

          {filteredProducts.map(prod => (
            <div key={prod.id} className="bg-white border border-slate-200 rounded overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between">
                <button onClick={() => setExpandedId(expandedId === prod.id ? null : prod.id)}
                  className="flex items-center gap-3 flex-1 text-left min-w-0">
                  {prod.images && prod.images.length > 0 && prod.images[0] ? (
                    <div className="w-9 h-9 rounded border border-slate-200 bg-slate-50 flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                      <img src={prod.images[0]} alt="" className="max-w-full max-h-full object-contain" onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
                    </div>
                  ) : (
                    <Package className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-800">
                        {typeof prod.name === 'object' ? (prod.name.AZ || prod.name.EN || prod.name.TR || prod.slug) : prod.name}
                      </span>
                      {prod.isFeatured && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                      <span className="text-[10px] text-slate-400">{prod.categoryName}</span>
                      {prod.hsCode && <span className="text-[10px] font-mono text-slate-400">HS: {prod.hsCode}</span>}
                      {prod.moq && <span className="text-[10px] text-slate-400">MOQ: {prod.moq}</span>}
                    </div>
                    <span className="text-[10px] font-mono text-slate-300">{prod.slug}</span>
                  </div>
                  <span className="ml-2">
                    {expandedId === prod.id ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </span>
                </button>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  <button onClick={() => loadInquiriesForProd(prod)}
                    className="p-1 text-slate-400 hover:text-[#0f3156] hover:bg-slate-100 rounded transition-colors" title="Bu məhsul üzrə gələn taleplər (RFQ)">
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => authFetch(`/api/azexbuy/admin/products/${prod.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !prod.isActive }) }).then(() => loadProducts())}
                    className="p-1 text-slate-300 hover:text-slate-600 rounded" title={prod.isActive ? 'Deaktiv et' : 'Aktiv et'}>
                    {prod.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => authFetch(`/api/azexbuy/admin/products/${prod.id}`, { method: 'PATCH', body: JSON.stringify({ isFeatured: !prod.isFeatured }) }).then(() => loadProducts())}
                    className={`p-1 rounded transition-colors ${prod.isFeatured ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'}`} title="Öne Çıkar">
                    <Star className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteProd(prod.id, typeof prod.name === 'object' ? (prod.name.AZ || prod.name.EN || prod.slug) : prod.name)}
                    className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {expandedId === prod.id && (
                <div className="border-t border-slate-100 p-4 bg-slate-50/50 space-y-3">
                  {editingProd?.id === prod.id ? (
                    <>
                      <div className="space-y-4">
                        {/* Meta fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[['Slug','slug'],['HS Kodu','hsCode'],['MOQ','moq'],['Mənşə Bölgəsi','originRegion'],['Qablaşdırma','packagingInfo'],['Sıralama (Sıra No)','sortOrder']].map(([lbl, fld]) => (
                            <div key={fld}>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{lbl}</label>
                              <input value={(editingProd as any)[fld] || ''} onChange={e => setEditingProd((v: any) => ({ ...v, [fld]: fld === 'slug' ? slugify(e.target.value) : e.target.value }))}
                                className={inCls} />
                            </div>
                          ))}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kateqoriya</label>
                            <select value={editingProd.categoryId} onChange={e => setEditingProd((v: any) => ({ ...v, categoryId: e.target.value }))}
                              className={`${inCls} bg-white`}>
                              {categories.map(c => <option key={c.id} value={c.id}>{typeof c.name === 'object' ? (c.name.AZ || c.name.EN) : c.name}</option>)}
                            </select>
                          </div>
                        </div>
                        {/* Multilingual Name */}
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Ad / Name</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {LANGS.map(lang => (
                              <div key={lang}>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{LANG_LABELS[lang]}</label>
                                <input value={typeof editingProd.name === 'object' ? (editingProd.name[lang] || '') : (editingProd.name || '')} onChange={e => setEditingProd((v: any) => ({ ...v, name: { ...(typeof v.name === 'object' ? v.name : {}), [lang]: e.target.value } }))}
                                  className={inCls} />
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Multilingual Short Description */}
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Qısa Açıqlama / Short Description</div>
                          <div className="grid grid-cols-1 gap-2">
                            {LANGS.map(lang => (
                              <div key={lang}>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{LANG_LABELS[lang]}</label>
                                <textarea value={typeof editingProd.shortDescription === 'object' ? (editingProd.shortDescription[lang] || '') : (editingProd.shortDescription || '')} onChange={e => setEditingProd((v: any) => ({ ...v, shortDescription: { ...(typeof v.shortDescription === 'object' ? v.shortDescription : {}), [lang]: e.target.value } }))}
                                  rows={2} className={taCls} />
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Multilingual Description */}
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Açıqlama / Description</div>
                          <div className="grid grid-cols-1 gap-2">
                            {LANGS.map(lang => (
                              <div key={lang}>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{LANG_LABELS[lang]}</label>
                                <textarea value={typeof editingProd.description === 'object' ? (editingProd.description[lang] || '') : (editingProd.description || '')} onChange={e => setEditingProd((v: any) => ({ ...v, description: { ...(typeof v.description === 'object' ? v.description : {}), [lang]: e.target.value } }))}
                                  rows={3} className={taCls} />
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Images */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Məhsul Şəkilləri (Hər sətirdə bir URL)</label>
                            <label className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer">
                              <Upload className="w-3 h-3" />
                              <span>{uploading ? 'Yüklənir...' : 'Kompüterdən Yüklə'}</span>
                              <input type="file" accept="image/*" className="hidden" onChange={async e => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  setUploading(true);
                                  const url = await uploadFile(f);
                                  if (url) setEditingProd((v: any) => ({ ...v, images: [...(Array.isArray(v.images) ? v.images : []), url] }));
                                  setUploading(false);
                                }
                              }} />
                            </label>
                          </div>
                          <textarea
                            value={Array.isArray(editingProd.images) ? editingProd.images.join('\n') : ''}
                            onChange={e => setEditingProd((v: any) => ({ ...v, images: e.target.value.split('\n').map((s: string) => s.trim()).filter(Boolean) }))}
                            rows={2}
                            className={taCls}
                            placeholder="https://images.unsplash.com/..."
                          />
                          {Array.isArray(editingProd.images) && editingProd.images.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {editingProd.images.map((imgUrl: string, idx: number) => (
                                <div key={idx} className="w-14 h-14 bg-white border border-slate-200 rounded p-1 flex items-center justify-center overflow-hidden">
                                  <img src={imgUrl} alt="" className="max-w-full max-h-full object-contain" onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Certificates */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sertifikatlar (Vergüllə ayırın: GlobalGAP, ISO 22000, Halal)</label>
                          <input
                            value={Array.isArray(editingProd.certificates) ? editingProd.certificates.join(', ') : ''}
                            onChange={e => setEditingProd((v: any) => ({ ...v, certificates: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) }))}
                            className={inCls}
                            placeholder="GlobalGAP, ISO 22000, Halal, HACCP"
                          />
                        </div>
                        {/* SEO */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">SEO Başlığı</label>
                            <input value={editingProd.seoTitle || ''} onChange={e => setEditingProd((v: any) => ({ ...v, seoTitle: e.target.value }))} className={inCls} />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">SEO Açıqlama</label>
                            <input value={editingProd.seoDescription || ''} onChange={e => setEditingProd((v: any) => ({ ...v, seoDescription: e.target.value }))} className={inCls} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id={`feat-${prod.id}`} checked={editingProd.isFeatured} onChange={e => setEditingProd((v: any) => ({ ...v, isFeatured: e.target.checked }))} />
                        <label htmlFor={`feat-${prod.id}`} className="text-xs text-slate-700">Ana səhifədə öne çıkar</label>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingProd(null)} className="h-8 px-3 text-xs text-slate-500">İptal</button>
                        <button onClick={() => handleUpdateProd(prod.id, editingProd)} disabled={saving}
                          className="h-8 px-4 bg-[#0f3156] text-white text-xs font-bold rounded-sm disabled:opacity-50">Saxla</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {prod.shortDescription && <div className="col-span-3 text-slate-600 italic">{prod.shortDescription}</div>}
                        {[['Kateqoriya', prod.categoryName],['HS Kodu', prod.hsCode],['MOQ', prod.moq],['Mənşə', prod.originRegion],['Qablaşdırma', prod.packagingInfo]].filter(([,v]) => v).map(([k,v]) => (
                          <div key={k} className="bg-white border border-slate-100 rounded p-2">
                            <div className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">{k}</div>
                            <div className="text-slate-700 font-medium text-[11px]">{v}</div>
                          </div>
                        ))}
                      </div>
                      {prod.images && prod.images.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-[9px] font-bold text-slate-400 uppercase">Məhsul Şəkilləri</div>
                          <div className="flex flex-wrap gap-2">
                            {prod.images.map((imgUrl: string, idx: number) => (
                              <div key={idx} className="w-16 h-16 bg-white border border-slate-200 rounded p-1 flex items-center justify-center overflow-hidden">
                                <img src={imgUrl} alt="" className="max-w-full max-h-full object-contain" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <SaveBar onSave={() => setEditingProd({ ...prod })} saving={false} saved={false} />
                      <div className="text-center">
                        <button onClick={() => setEditingProd({ ...prod })}
                          className="flex items-center gap-1.5 mx-auto h-7 px-3 border border-slate-200 hover:border-[#0f3156] text-slate-600 hover:text-[#0f3156] text-xs rounded-sm transition-colors">
                          <Edit2 className="w-3 h-3" /> Redaktə et
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Product Inquiries Modal (Taleplər) ── */}
      {inquiriesProd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col shadow-xl overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0f3156]" />
                  Məhsul üzrə Gələn Taleplər (RFQ)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {typeof inquiriesProd.name === 'object' ? (inquiriesProd.name.AZ || inquiriesProd.name.EN) : inquiriesProd.name} · {inquiriesList.length} sorğu tapıldı
                </p>
              </div>
              <button onClick={() => setInquiriesProd(null)} className="p-1 rounded text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-2">
              {inquiriesLoading && <div className="text-center py-8 text-xs text-slate-400">Yüklənir...</div>}
              {!inquiriesLoading && inquiriesList.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">
                  Bu məhsul üçün hələlik heç bir alıcı tələbi (RFQ) daxil olmayıb.
                </div>
              )}
              {!inquiriesLoading && inquiriesList.map(rfq => (
                <div key={rfq.id} className="bg-slate-50/70 border border-slate-200 rounded p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{rfq.buyerCompany}</span>
                    <span className="text-[10px] font-mono text-slate-400">{rfq.id}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Ölkə: {rfq.country} · Tarix: {new Date(rfq.createdAt).toLocaleDateString('az-AZ')}
                  </div>
                  {rfq.items && rfq.items.length > 0 && (
                    <div className="bg-white border border-slate-200/80 rounded p-2 text-[11px]">
                      {rfq.items.map((it: any, i: number) => (
                        <div key={i} className="flex justify-between">
                          <span className="font-medium text-slate-800">{it.productName}</span>
                          <span className="font-bold text-[#0f3156]">{it.quantity} {it.unit}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {rfq.internalNotes && (
                    <div className="text-[10px] text-slate-600 bg-amber-50/60 border border-amber-200/60 rounded px-2 py-1">
                      <b>Daxili qeyd:</b> {rfq.internalNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button onClick={() => setInquiriesProd(null)} className="h-8 px-4 bg-[#0f3156] text-white text-xs font-bold rounded-sm">
                Bağla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global saving indicator */}
      {saved && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <CheckCircle className="w-3.5 h-3.5" /> Saxlandı
        </div>
      )}
    </div>
  );
};
