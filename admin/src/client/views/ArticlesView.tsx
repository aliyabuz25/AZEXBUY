import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, Edit2, Save, BookOpen, RefreshCw,
  CheckCircle, Eye, EyeOff, ChevronDown, ChevronRight, Tag, Star,
} from 'lucide-react';
import { UiLanguage } from '../types';
import { BBCodeEditor, BBCodeRenderer } from '../components/BBCodeEditor';

interface ArticlesViewProps { uiLang: UiLanguage; }

const token = () => localStorage.getItem('octotech_admin_jwt') || '';
const authFetch = (url: string, opts: RequestInit = {}) =>
  fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}`, ...(opts.headers || {}) } });

const CATEGORIES = [
  'Export Guides',
  'Market Research',
  'Trade Terms',
  'Regulations',
  'Product Analysis',
  'Market Insights',
  'Industry Updates',
];

const slugify = (s: string) => s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const Empty: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
    <BookOpen className="w-8 h-8" />
    <p className="text-xs">{message}</p>
  </div>
);

const BLANK_ARTICLE = {
  title: '', slug: '', category: 'Export Guides', summary: '', content: '',
  coverImage: '', seoTitle: '', seoDescription: '', isPublished: false, author: 'AZEXBUY',
  sourceName: '', sourceUrl: '', sourceCountry: '', sourcePeriod: '', pubStatus: 'draft',
};

// ─── Inline field helper ──────────────────────────────────────────────────────
const Field: React.FC<{
  label: string;
  children: React.ReactNode;
  col?: boolean;
}> = ({ label, children, col }) => (
  <div className={col ? 'col-span-2' : ''}>
    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{label}</label>
    {children}
  </div>
);

const inputCls = 'w-full h-8 text-xs border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156]';

export const ArticlesView: React.FC<ArticlesViewProps> = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showNew, setShowNew] = useState(false);
  const [newArt, setNewArt] = useState({ ...BLANK_ARTICLE });
  const [filterCat, setFilterCat] = useState('');
  const [filterPub, setFilterPub] = useState<'all' | 'published' | 'draft'>('all');
  // preview mode for expanded-but-not-editing view
  const [previewIds, setPreviewIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await authFetch('/api/azexbuy/admin/articles');
      if (r.ok) setArticles(await r.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const handleCreate = async () => {
    if (!newArt.title.trim() || !newArt.slug.trim()) return;
    setSaving(true);
    try {
      const r = await authFetch('/api/azexbuy/admin/articles', {
        method: 'POST', body: JSON.stringify(newArt),
      });
      if (r.ok) {
        setShowNew(false); setNewArt({ ...BLANK_ARTICLE }); load(); showSaved();
      } else { const e = await r.json(); alert(e.error || 'Xəta'); }
    } finally { setSaving(false); }
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    try {
      const r = await authFetch(`/api/azexbuy/admin/articles/${id}`, { method: 'PATCH', body: JSON.stringify(editData) });
      if (r.ok) { setEditingId(null); load(); showSaved(); }
      else { const e = await r.json().catch(() => ({})); alert(e.error || `Xəta: ${r.status}`); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" məqaləsini silmək istəyirsiniz?`)) return;
    const r = await authFetch(`/api/azexbuy/admin/articles/${id}`, { method: 'DELETE' });
    if (r.ok) load();
  };

  const handleTogglePublish = async (art: any) => {
    await authFetch(`/api/azexbuy/admin/articles/${art.id}`, {
      method: 'PATCH', body: JSON.stringify({ isPublished: !art.isPublished }),
    });
    load();
  };

  const handleToggleFeatured = async (art: any) => {
    if (art.isFeatured) {
      await authFetch(`/api/azexbuy/admin/articles/${art.id}/unfeature`, { method: 'PATCH' });
    } else {
      await authFetch(`/api/azexbuy/admin/articles/${art.id}/feature`, { method: 'PATCH' });
    }
    load();
    showSaved();
  };

  const togglePreview = (id: string) => {
    setPreviewIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filtered = articles
    .filter(a => !filterCat || a.category === filterCat)
    .filter(a => filterPub === 'all' ? true : filterPub === 'published' ? a.isPublished : !a.isPublished);

  const publishedCount = articles.filter(a => a.isPublished).length;
  const draftCount = articles.filter(a => !a.isPublished).length;

  return (
    <div className="p-6 space-y-4 max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#0f3156]" /> Makaleler — Insights
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {articles.length} məqalə · {publishedCount} yayımlandı · {draftCount} qaralama
          </p>
        </div>
        <button onClick={load} className="p-2 hover:bg-slate-100 rounded text-slate-400">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="h-8 text-xs border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] bg-white">
            <option value="">Bütün kateqoriyalar</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex border border-slate-200 rounded-sm overflow-hidden">
            {(['all', 'published', 'draft'] as const).map(v => (
              <button key={v} onClick={() => setFilterPub(v)}
                className={`h-8 px-3 text-xs font-medium transition-colors ${filterPub === v ? 'bg-[#0f3156] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                {v === 'all' ? 'Hamısı' : v === 'published' ? 'Yayımlandı' : 'Qaralama'}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => setShowNew(v => !v)}
          className="flex items-center gap-1.5 h-8 px-3 bg-[#0f3156] hover:bg-[#081c33] text-white text-xs font-bold rounded-sm">
          <Plus className="w-3.5 h-3.5" /> Yeni Məqalə
        </button>
      </div>

      {/* ── New Article Form ── */}
      {showNew && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4 space-y-3">
          <h3 className="text-xs font-bold text-blue-800">Yeni Məqalə</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Başlıq *">
              <input value={newArt.title}
                onChange={e => setNewArt(v => ({ ...v, title: e.target.value, slug: slugify(e.target.value) }))}
                className={inputCls} placeholder="Məqalə başlığı" />
            </Field>
            <Field label="Slug *">
              <input value={newArt.slug}
                onChange={e => setNewArt(v => ({ ...v, slug: slugify(e.target.value) }))}
                className={`${inputCls} font-mono`} placeholder="meqale-basligi" />
            </Field>
            <Field label="Kateqoriya">
              <select value={newArt.category} onChange={e => setNewArt(v => ({ ...v, category: e.target.value }))}
                className={`${inputCls} bg-white`}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Kapak Şəkli URL">
              <input value={newArt.coverImage} onChange={e => setNewArt(v => ({ ...v, coverImage: e.target.value }))}
                className={inputCls} placeholder="https://..." />
              {newArt.coverImage && (
                <div className="mt-2 w-32 h-20 bg-slate-100 border border-slate-200 rounded p-1 flex items-center justify-center overflow-hidden">
                  <img src={newArt.coverImage} alt="" className="max-w-full max-h-full object-contain" onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
                </div>
              )}
            </Field>
            <Field label="Xülasə" col>
              <textarea value={newArt.summary} onChange={e => setNewArt(v => ({ ...v, summary: e.target.value }))}
                rows={2} className="w-full text-xs border border-slate-200 px-2.5 py-1.5 rounded-sm focus:outline-none focus:border-[#0f3156] resize-none" />
            </Field>
            <Field label="Müəllif">
              <input value={newArt.author} onChange={e => setNewArt(v => ({ ...v, author: e.target.value }))}
                className={inputCls} placeholder="AZEXBUY" />
            </Field>
            <Field label="SEO Başlığı">
              <input value={newArt.seoTitle} onChange={e => setNewArt(v => ({ ...v, seoTitle: e.target.value }))}
                className={inputCls} />
            </Field>
            <Field label="SEO Açıqlaması">
              <input value={newArt.seoDescription} onChange={e => setNewArt(v => ({ ...v, seoDescription: e.target.value }))}
                className={inputCls} />
            </Field>
            <Field label="Mənbə Adı">
              <input value={newArt.sourceName} onChange={e => setNewArt(v => ({ ...v, sourceName: e.target.value }))}
                className={inputCls} placeholder="Məs: Dövlət Statistika Komitəsi / ITC Trademap" />
            </Field>
            <Field label="Mənbə URL">
              <input value={newArt.sourceUrl} onChange={e => setNewArt(v => ({ ...v, sourceUrl: e.target.value }))}
                className={inputCls} placeholder="https://trademap.org/..." />
            </Field>
            <Field label="Mənbə Ölkəsi">
              <input value={newArt.sourceCountry} onChange={e => setNewArt(v => ({ ...v, sourceCountry: e.target.value }))}
                className={inputCls} placeholder="Azərbaycan / Qlobal" />
            </Field>
            <Field label="Mənbə Dövrü / Tarixi">
              <input value={newArt.sourcePeriod} onChange={e => setNewArt(v => ({ ...v, sourcePeriod: e.target.value }))}
                className={inputCls} placeholder="2024–2025 I Rüb" />
            </Field>
            <Field label="Yayım Statusu">
              <select value={newArt.pubStatus} onChange={e => {
                const s = e.target.value;
                setNewArt(v => ({ ...v, pubStatus: s, isPublished: s === 'published' }));
              }} className={`${inputCls} bg-white`}>
                <option value="draft">Taslak (Qaralama)</option>
                <option value="published">Yayımlandı</option>
                <option value="archived">Arxivləndi</option>
              </select>
            </Field>
          </div>

          {/* BBCode Editor for content */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Məzmun (BBCode)
            </label>
            <BBCodeEditor
              value={newArt.content}
              onChange={v => setNewArt(prev => ({ ...prev, content: v }))}
              placeholder="Məqalə məzmununu BBCode ilə yazın..."
              minHeight={280}
            />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="new-pub" checked={newArt.isPublished}
              onChange={e => setNewArt(v => ({ ...v, isPublished: e.target.checked }))} />
            <label htmlFor="new-pub" className="text-xs text-slate-700">Dərhal yayımla</label>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowNew(false)} className="h-8 px-3 text-xs text-slate-500">İptal</button>
            <button onClick={handleCreate} disabled={saving || !newArt.title || !newArt.slug}
              className="h-8 px-4 bg-[#0f3156] text-white text-xs font-bold rounded-sm disabled:opacity-50">
              {saving ? 'Saxlanılır...' : 'Əlavə Et'}
            </button>
          </div>
        </div>
      )}

      {loading && <div className="text-center py-8 text-xs text-slate-400">Yüklənir...</div>}
      {!loading && filtered.length === 0 && <Empty message="Məqalə yoxdur" />}

      {/* ── Article List ── */}
      {filtered.map(art => (
        <div key={art.id} className="bg-white border border-slate-200 rounded overflow-hidden">
          {/* Row header */}
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <button
              onClick={() => setExpandedId(expandedId === art.id ? null : art.id)}
              className="flex items-center gap-3 flex-1 text-left min-w-0"
            >
              {art.coverImage ? (
                <div className="w-10 h-10 rounded border border-slate-200 bg-slate-50 flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                  <img src={art.coverImage} alt="" className="max-w-full max-h-full object-contain" onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
                </div>
              ) : (
                <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-800 truncate">{art.title}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${art.isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {art.isPublished ? 'Yayımlandı' : 'Qaralama'}
                  </span>
                  {art.isFeatured && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide bg-amber-50 text-amber-600 flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5" fill="currentColor" /> Öne Çıkan
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                    <Tag className="w-3 h-3" />{art.category}
                  </span>
                  {art.content && (
                    <span className="text-[9px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded font-mono">BBCode</span>
                  )}
                </div>
                {art.publishedAt && (
                  <span className="text-[10px] text-slate-400">{new Date(art.publishedAt).toLocaleDateString('az-AZ')}</span>
                )}
              </div>
              {expandedId === art.id
                ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
            </button>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => handleToggleFeatured(art)}
                className={`p-1 rounded transition-colors ${art.isFeatured ? 'text-amber-500 hover:text-slate-400' : 'text-slate-300 hover:text-amber-500'}`}
                title={art.isFeatured ? 'Öne Çıkarmayı Kaldır' : 'Öne Çıkar (Analitik sayfasında göster)'}>
                <Star className="w-3.5 h-3.5" fill={art.isFeatured ? 'currentColor' : 'none'} />
              </button>
              <button onClick={() => handleTogglePublish(art)}
                className={`p-1 rounded transition-colors ${art.isPublished ? 'text-green-500 hover:text-slate-400' : 'text-slate-300 hover:text-green-500'}`}
                title={art.isPublished ? 'Qaralamaya al' : 'Yayımla'}>
                {art.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => { setEditingId(art.id); setEditData({ ...art }); setExpandedId(art.id); }}
                className="p-1 text-slate-300 hover:text-blue-500 rounded transition-colors">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(art.id, art.title)}
                className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Expanded panel */}
          {expandedId === art.id && (
            <div className="border-t border-slate-100 p-4 bg-slate-50/50 space-y-3">
              {editingId === art.id ? (
                /* ── EDIT MODE ── */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Başlıq">
                      <input value={editData.title || ''}
                        onChange={e => setEditData((v: any) => ({ ...v, title: e.target.value }))}
                        className={inputCls} />
                    </Field>
                    <Field label="Slug">
                      <input value={editData.slug || ''}
                        onChange={e => setEditData((v: any) => ({ ...v, slug: slugify(e.target.value) }))}
                        className={`${inputCls} font-mono`} />
                    </Field>
                    <Field label="Kateqoriya">
                      <select value={editData.category || ''}
                        onChange={e => setEditData((v: any) => ({ ...v, category: e.target.value }))}
                        className={`${inputCls} bg-white`}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="Kapak Şəkli URL">
                      <input value={editData.coverImage || ''}
                        onChange={e => setEditData((v: any) => ({ ...v, coverImage: e.target.value }))}
                        className={inputCls} placeholder="https://..." />
                      {editData.coverImage && (
                        <div className="mt-2 w-32 h-20 bg-slate-100 border border-slate-200 rounded p-1 flex items-center justify-center overflow-hidden">
                          <img src={editData.coverImage} alt="" className="max-w-full max-h-full object-contain" onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
                        </div>
                      )}
                    </Field>
                    <Field label="Xülasə" col>
                      <textarea value={editData.summary || ''}
                        onChange={e => setEditData((v: any) => ({ ...v, summary: e.target.value }))}
                        rows={2} className="w-full text-xs border border-slate-200 px-2.5 py-1.5 rounded-sm focus:outline-none focus:border-[#0f3156] resize-none" />
                    </Field>
                    <Field label="SEO Başlığı">
                      <input value={editData.seoTitle || ''}
                        onChange={e => setEditData((v: any) => ({ ...v, seoTitle: e.target.value }))}
                        className={inputCls} />
                    </Field>
                    <Field label="SEO Açıqlaması">
                      <input value={editData.seoDescription || ''}
                        onChange={e => setEditData((v: any) => ({ ...v, seoDescription: e.target.value }))}
                        className={inputCls} />
                    </Field>
                    <Field label="Mənbə Adı">
                      <input value={editData.sourceName || ''}
                        onChange={e => setEditData((v: any) => ({ ...v, sourceName: e.target.value }))}
                        className={inputCls} placeholder="Məs: Dövlət Statistika Komitəsi / ITC Trademap" />
                    </Field>
                    <Field label="Mənbə URL">
                      <input value={editData.sourceUrl || ''}
                        onChange={e => setEditData((v: any) => ({ ...v, sourceUrl: e.target.value }))}
                        className={inputCls} placeholder="https://..." />
                    </Field>
                    <Field label="Mənbə Ölkəsi">
                      <input value={editData.sourceCountry || ''}
                        onChange={e => setEditData((v: any) => ({ ...v, sourceCountry: e.target.value }))}
                        className={inputCls} placeholder="Azərbaycan" />
                    </Field>
                    <Field label="Mənbə Dövrü">
                      <input value={editData.sourcePeriod || ''}
                        onChange={e => setEditData((v: any) => ({ ...v, sourcePeriod: e.target.value }))}
                        className={inputCls} placeholder="2024–2025" />
                    </Field>
                    <Field label="Yayım Statusu">
                      <select value={editData.pubStatus || (editData.isPublished ? 'published' : 'draft')} onChange={e => {
                        const s = e.target.value;
                        setEditData((v: any) => ({ ...v, pubStatus: s, isPublished: s === 'published' }));
                      }} className={`${inputCls} bg-white`}>
                        <option value="draft">Taslak (Qaralama)</option>
                        <option value="published">Yayımlandı</option>
                        <option value="archived">Arxivləndi</option>
                      </select>
                    </Field>
                  </div>

                  {/* BBCode Editor */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Məzmun (BBCode Editoru)
                    </label>
                    <BBCodeEditor
                      value={editData.content || ''}
                      onChange={v => setEditData((prev: any) => ({ ...prev, content: v }))}
                      placeholder="Məzmun..."
                      minHeight={320}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id={`pub-${art.id}`}
                      checked={editData.isPublished}
                      onChange={e => setEditData((v: any) => ({ ...v, isPublished: e.target.checked }))} />
                    <label htmlFor={`pub-${art.id}`} className="text-xs text-slate-700">Yayımla</label>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingId(null)} className="h-8 px-3 text-xs text-slate-500">İptal</button>
                    <button onClick={() => handleUpdate(art.id)} disabled={saving}
                      className="h-8 px-4 bg-[#0f3156] text-white text-xs font-bold rounded-sm disabled:opacity-50 flex items-center gap-1.5">
                      <Save className="w-3.5 h-3.5" /> {saving ? 'Saxlanılır...' : 'Saxla'}
                    </button>
                  </div>
                </>
              ) : (
                /* ── VIEW MODE ── */
                <div className="space-y-3">
                  {art.coverImage && (
                    <div className="w-full h-52 bg-slate-100/70 rounded-md border border-slate-200 overflow-hidden flex items-center justify-center p-2">
                      <img src={art.coverImage} alt={art.title}
                        className="max-w-full max-h-full object-contain rounded drop-shadow-xs" />
                    </div>
                  )}
                  {art.summary && (
                    <p className="text-xs text-slate-600 italic border-l-2 border-blue-200 pl-3">{art.summary}</p>
                  )}

                  {/* BBCode content preview */}
                  {art.content && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Məzmun</span>
                        <button
                          onClick={() => togglePreview(art.id)}
                          className="text-[10px] text-blue-500 hover:underline"
                        >
                          {previewIds.has(art.id) ? '← BBCode göster' : 'Önizle →'}
                        </button>
                      </div>
                      {previewIds.has(art.id) ? (
                        <div className="bg-white border border-slate-100 rounded p-3 text-sm text-slate-700">
                          <BBCodeRenderer content={art.content} />
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 bg-white border border-slate-100 rounded p-2 max-h-32 overflow-y-auto font-mono whitespace-pre-wrap">
                          {art.content.slice(0, 500)}{art.content.length > 500 ? '…' : ''}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-[10px] text-slate-400">
                    {art.author && <span>Müəllif: {art.author}</span>}
                    {art.publishedAt && <span>Yayımlanma: {new Date(art.publishedAt).toLocaleDateString('az-AZ')}</span>}
                    {art.updatedAt && <span>Son yeniləmə: {new Date(art.updatedAt).toLocaleDateString('az-AZ')}</span>}
                  </div>
                  <div className="flex justify-center pt-1">
                    <button
                      onClick={() => { setEditingId(art.id); setEditData({ ...art }); }}
                      className="flex items-center gap-1.5 h-7 px-3 border border-slate-200 hover:border-[#0f3156] text-slate-600 hover:text-[#0f3156] text-xs rounded-sm transition-colors">
                      <Edit2 className="w-3 h-3" /> Redaktə et
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {saved && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <CheckCircle className="w-3.5 h-3.5" /> Saxlandı
        </div>
      )}
    </div>
  );
};
