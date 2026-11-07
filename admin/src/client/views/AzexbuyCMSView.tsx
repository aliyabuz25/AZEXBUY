import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Save, Upload, RefreshCw, CheckCircle, ChevronDown, ChevronRight,
  Trash2, Plus, Eye, X, Image as ImgIcon, Package,
  Star, Footprints, Layers, LayoutTemplate, Menu as MenuIcon,
  Anchor, HelpCircle, Info, Map, Users, FileText,
} from 'lucide-react';
import { UiLanguage } from '../types';
import { flattenStrings } from '../utils/flattenStrings';
import { UI_STRINGS } from '../../../../src/data/translations';

interface AzexbuyCMSViewProps { uiLang: UiLanguage; }

const OCTO = '';
const LOCALES = ['EN', 'AZ', 'TR', 'RU', 'AR', 'ES'] as const;
type Loc = typeof LOCALES[number];

const getToken = () => localStorage.getItem('octotech_admin_jwt') || '';

async function apiGet(path: string) {
  try {
    const r = await fetch(`${OCTO}${path}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    return r.ok ? r.json() : null;
  } catch { return null; }
}

async function apiPost(path: string, body: any): Promise<{ ok: boolean; data: any }> {
  try {
    const r = await fetch(`${OCTO}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => null);
    return { ok: r.ok, data };
  } catch { return { ok: false, data: null }; }
}

// ── Default strings — UI_STRINGS'den flat key formatına çevrilir (tüm 6 dil) ──
const DEFAULT_STRINGS: Record<string, Record<string, string>> = (() => {
  const result: Record<string, Record<string, string>> = {};
  for (const locale of LOCALES) {
    const nested = (UI_STRINGS as any)[locale];
    if (nested) result[locale] = flattenStrings(nested);
  }
  return result;
})();

const CMS_PAGES = [
  { key: 'images',            label: 'Görseller',              icon: ImgIcon },
  { key: 'navbar',            label: 'Naviqasiya Menyusu',     icon: MenuIcon },
  { key: 'hero',              label: 'Hero Bolmesi',           icon: LayoutTemplate },
  { key: 'why_azexbuy',      label: 'Niye AZEXBUY',           icon: Star },
  { key: 'audience',          label: 'Alici / Istehsalci',     icon: Users },
  { key: 'services',          label: 'Xidmetler',              icon: Anchor },
  { key: 'how_it_works',     label: 'Nece Isleyir',            icon: HelpCircle },
  { key: 'featured_products', label: 'One Cixan Mehsullar',    icon: FileText },
  { key: 'why_azerbaijan',   label: 'Niye Azerbaycan',         icon: Map },
  { key: 'footer',            label: 'Footer',                 icon: Info },
  { key: 'products_catalog',  label: 'Mehsullar Kataloqu',     icon: Package },
  { key: 'buyer_steps',      label: 'Alici Addimlari',         icon: Footprints },
  { key: 'producer_steps',   label: 'Istehsalci Addimlari',    icon: Layers },
  { key: 'media_library',    label: 'Sekil Kitabxanasi',       icon: ImgIcon },
] as const;
type PageKey = typeof CMS_PAGES[number]['key'];

const IMAGE_KEYS = [
  { key: 'HERO_IMAGE',                   label: 'Hero Arxa Fon',                    defaultUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9ZWqLLmb30gHFdTBf7cfY60pAMzYSTWRn2keRDZ7k8a3eQicd1I5xuOR1U44ux_eyOl79BjhxRaXdEbzovzXexqRo8oDy3gVECJAAKnDsq1DYgw7oR-p-U-VjFeMqmdwPl27SJVIP7hTVWchM1LYBR1EY2hy5C8iSkUcytv0qKVFgxmbifXswWW8UTnyUsQw5XBb81qNG2tremLOg_k5EPGCl-K_AWwSN8UQ3T1EN7HyePk3pvGD9' },
  { key: 'BUYER_CARD_IMAGE',             label: 'Alıcı Kartı Görseli',              defaultUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHfBjlFdQNaNAsP2RbAdqbBzskyL-GFgkaTpjwu0U6iT-t0tvmdQxrsHV7DOVkxLI4TCvj6qWpEawxqKJPqQE9f5GeXtwvTu7-fs3s495aRNM41LY0ardk4_DhtXk2RrKbiZgwssXvlrrI_EThET-4vRXO-9SbspxRcE3KXflGW-LnO8LzAq_bYYS10R-r010CzBLBwMqbd6slv40ntEvn3OyeauJszJaHkxnHTcGCq-0XAIDQmj6_' },
  { key: 'PRODUCER_CARD_IMAGE',          label: 'İstehsalçı Kartı Görseli',         defaultUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgrvRVBxN_YV05A8C2ZBQC2V2WHmgN9IrmvxhBvoVre7FKYjEbaR95Ew5PqX6-T-FG67u-0fHLCX6KeLtUrAkBIiJfWZGu7t3Ez2RyKvMerWTAHV1ROVLxhP4wE2oqLK-k9t1i6hrPmq-YJ-GDzjbqNDrNf2-SyjbXUmuQAJa5ScuKsRahZQdVKWyzFzRNPNYzxr3XOkiIb2BLWy4KJO-b-RWiNaaRqebQkQINqnQZfyBkDjpvxMId' },
  { key: 'WHY_AZERBAIJAN_IMAGE',         label: 'Niyə Azərbaycan Görseli',          defaultUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1WtUBR_2hOeUbRABsre_R7H-yW12FldWdxDp_6_abkiZuNwgF3fMTiwxdQCKdfEbdEWa-6CSQc0bQgUbjojei2itk13mAz_e09yOnKuFWP_7AO2BpMiNUQByyYnqtrPMywT0b4g4COdLkLc5_L75NtOsKv5OOgHz7VdAMCF-WDWgmhqccS9HdQKKY8cwD4AeVg_Z5AczT8rfvCVFXyJrgDuQKAsNiyYL54OeN2_HoFxHi9ltf4bUcbHSmM' },
  { key: 'HOW_IT_WORKS_BUYERS_IMAGE',    label: 'Necə İşləyir — Alıcılar Görseli',  defaultUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80' },
  { key: 'HOW_IT_WORKS_SELLERS_IMAGE',   label: 'Necə İşləyir — Satıcılar Görseli', defaultUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80' },
];

// ── Standalone field components (defined OUTSIDE main component to prevent remounting) ──

interface FProps {
  label: string;
  k: string;
  multi?: boolean;
  value: string;
  onChange: (k: string, val: string) => void;
}
const F = React.memo(({ label, k, multi = false, value, onChange }: FProps) => (
  <div className="bg-white border border-slate-200 rounded p-3">
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">{label}</label>
      <span className="text-[9px] text-slate-300 font-mono">{value.length}c</span>
    </div>
    {multi
      ? <textarea value={value} onChange={e => onChange(k, e.target.value)} rows={3}
          className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 px-2.5 py-2 focus:outline-none focus:border-[#0f3156] resize-none rounded-sm" />
      : <input value={value} onChange={e => onChange(k, e.target.value)}
          className="w-full h-8 text-xs text-slate-900 bg-slate-50 border border-slate-200 px-2.5 focus:outline-none focus:border-[#0f3156] rounded-sm" />
    }
  </div>
));

interface MultiLocFProps {
  label: string;
  strKey: string;
  multi?: boolean;
  locData: Record<string, Record<string, string>>;
  onChange: (loc: string, k: string, val: string) => void;
}
const MultiLocF = React.memo(({ label, strKey, multi = false, locData, onChange }: MultiLocFProps) => (
  <div className="bg-white border border-slate-200 rounded p-3">
    <div className="text-[10px] font-bold text-slate-500 uppercase font-mono mb-2">{label}</div>
    <div className="grid grid-cols-2 gap-2">
      {LOCALES.map(l => {
        const val = locData[l]?.[strKey] || DEFAULT_STRINGS[l]?.[strKey] || '';
        return (
          <div key={l}>
            <div className="text-[9px] font-bold text-slate-400 mb-0.5">{l}</div>
            {multi
              ? <textarea value={val} onChange={e => onChange(l, strKey, e.target.value)} rows={2}
                  className="w-full text-xs bg-slate-50 border border-slate-200 px-2 py-1.5 focus:outline-none focus:border-[#0f3156] resize-none rounded-sm" />
              : <input value={val} onChange={e => onChange(l, strKey, e.target.value)}
                  className="w-full h-7 text-xs bg-slate-50 border border-slate-200 px-2 focus:outline-none focus:border-[#0f3156] rounded-sm" />
            }
          </div>
        );
      })}
    </div>
  </div>
));

interface SaveBarProps {
  onSave: () => void;
  saving: boolean;
  saved: boolean;
}
const SaveBar = React.memo(({ onSave, saving, saved }: SaveBarProps) => (
  <div className="flex justify-end pt-4 pb-2 sticky bottom-0 bg-slate-50/90 backdrop-blur-sm border-t border-slate-200 mt-4 px-1">
    <button onClick={onSave} disabled={saving}
      className={`h-9 px-6 flex items-center gap-2 text-xs font-bold rounded-sm transition-colors shadow-sm ${saved ? 'bg-emerald-600 text-white' : 'bg-[#0f3156] hover:bg-[#081c33] text-white'} disabled:opacity-60`}>
      {saving
        ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saxlanır...</>
        : saved
          ? <><CheckCircle className="w-3.5 h-3.5" /> Saxlandı</>
          : <><Save className="w-3.5 h-3.5" /> Yadda Saxla</>
      }
    </button>
  </div>
));

interface LocaleTabsProps {
  locale: Loc;
  onSelect: (l: Loc) => void;
}
const LocaleTabs = React.memo(({ locale, onSelect }: LocaleTabsProps) => (
  <div className="flex items-center gap-1 mb-4">
    {LOCALES.map(l => (
      <button key={l} onClick={() => onSelect(l)}
        className={`px-2.5 py-1 text-[10px] font-bold rounded-sm transition-colors ${locale === l ? 'bg-[#0f3156] text-white' : 'text-slate-500 bg-white border border-slate-200 hover:bg-slate-100'}`}>
        {l}
      </button>
    ))}
  </div>
));

interface ImageFieldProps {
  imgKey: string;
  label: string;
  content: any;
  uploading: string | null;
  onSaveContent: (data: any) => Promise<void>;
  onTriggerUpload: (key: string) => void;
  onUpdateImgUrl: (key: string, url: string) => void;
  onPreview: (url: string) => void;
  saving: boolean;
  saved: boolean;
}
const ImageField = React.memo(({ imgKey, label, content, uploading, onSaveContent, onTriggerUpload, onUpdateImgUrl, onPreview, saving, saved }: ImageFieldProps) => {
  const defKey = IMAGE_KEYS.find(k => k.key === imgKey);
  const customUrl = content.images?.[imgKey];
  const url = customUrl || defKey?.defaultUrl || '';
  const proxyUrl = url ? `/api/img-proxy?url=${encodeURIComponent(url)}` : '';
  const custom = Boolean(customUrl);
  const inputVal = content.images?.[imgKey] ?? '';

  return (
    <div className="bg-white border border-slate-200 rounded overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">{label}</span>
        {custom
          ? <span className="text-[9px] px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-sm">OZELLESMIS</span>
          : <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 font-bold rounded-sm">VARSAYILAN</span>
        }
      </div>
      <div className="relative w-full bg-slate-100 cursor-pointer overflow-hidden" style={{ height: '160px' }}
        onClick={() => url && onPreview(proxyUrl)}>
        {proxyUrl
          ? <img src={proxyUrl} alt={label} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          : <div className="w-full h-full flex items-center justify-center"><ImgIcon className="w-8 h-8 text-slate-300" /></div>
        }
        {url && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="bg-white/90 px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 rounded-sm">
              <Eye className="w-3.5 h-3.5" /> Tam Goruntule
            </div>
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Görsel URL</label>
          <div className="flex gap-2">
            <input type="text" value={inputVal} onChange={e => onUpdateImgUrl(imgKey, e.target.value)}
              placeholder={defKey?.defaultUrl || 'https://...'}
              className="flex-1 h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 focus:outline-none focus:border-[#0f3156] font-mono rounded-sm" />
            <button onClick={() => onSaveContent(content)} disabled={saving}
              className={`h-8 px-3 text-xs font-bold rounded-sm flex items-center gap-1.5 shrink-0 ${saved ? 'bg-emerald-600 text-white' : 'bg-[#0f3156] hover:bg-[#081c33] text-white'} disabled:opacity-60`}>
              <Save className="w-3 h-3" /> Saxla
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onTriggerUpload(imgKey)} disabled={uploading === imgKey}
            className="h-7 px-3 flex items-center gap-1.5 text-xs font-bold border border-[#0f3156] text-[#0f3156] hover:bg-[#0f3156] hover:text-white transition-colors rounded-sm">
            {uploading === imgKey ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            {uploading === imgKey ? 'Yüklənir...' : 'Serverdən Yüklə'}
          </button>
          {custom && (
            <button onClick={() => {
              const updated = { ...content, images: { ...(content.images || {}), [imgKey]: '' } };
              onSaveContent(updated);
            }} className="h-7 px-2.5 flex items-center gap-1.5 text-xs text-red-500 border border-red-200 hover:bg-red-50 rounded-sm">
              <Trash2 className="w-3 h-3" /> Varsayılana Qaytar
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

// ── Main Component ─────────────────────────────────────────────────────────────
export const AzexbuyCMSView: React.FC<AzexbuyCMSViewProps> = () => {
  const [page, setPage] = useState<PageKey>('images');
  const [locale, setLocale] = useState<Loc>('EN');

  const [locData, setLocData] = useState<Record<string, Record<string, string>>>(DEFAULT_STRINGS);
  const [content, setContent] = useState<any>({});
  const [images, setImages] = useState<any[]>([]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [l, c, imgs] = await Promise.all([
      apiGet('/api/azexbuy/localization'),
      apiGet('/api/azexbuy/content'),
      apiGet('/api/azexbuy/images'),
    ]);
    if (l && Object.keys(l).length > 0) {
      const merged: Record<string, Record<string, string>> = {};
      for (const loc of LOCALES) {
        merged[loc] = { ...(DEFAULT_STRINGS[loc] || {}), ...(l[loc] || {}) };
      }
      setLocData(merged);
    }
    if (c) setContent(c);
    if (imgs) setImages(imgs);
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const saveStrings = useCallback(async (data: Record<string, Record<string, string>>) => {
    setSaving(true);
    const result = await apiPost('/api/azexbuy/localization', data);
    if (result.ok) { flash(); } else { alert('Saxlama xətası. Zəhmət olmasa yenidən cəhd edin.'); }
    setSaving(false);
  }, []);

  const saveContent = useCallback(async (data: any) => {
    setSaving(true);
    setContent(data);
    const result = await apiPost('/api/azexbuy/content', data);
    if (result.ok) { flash(); } else { alert('Saxlama xətası. Zəhmət olmasa yenidən cəhd edin.'); }
    setSaving(false);
  }, []);

  // Stable string change handler
  const handleStrChange = useCallback((k: string, val: string) => {
    setLocData(prev => ({ ...prev, [locale]: { ...(prev[locale] || {}), [k]: val } }));
  }, [locale]);

  const handleMultiLocChange = useCallback((loc: string, k: string, val: string) => {
    setLocData(prev => ({ ...prev, [loc]: { ...(prev[loc] || {}), [k]: val } }));
  }, []);

  const handleUpdateImgUrl = useCallback((key: string, url: string) => {
    setContent((prev: any) => ({ ...prev, images: { ...(prev.images || {}), [key]: url } }));
  }, []);

  const uploadImage = async (file: File, key: string) => {
    setUploading(key);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const r = await fetch(`${OCTO}/api/azexbuy/upload-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: fd,
      });
      if (r.ok) {
        const { url } = await r.json();
        const updated = { ...content, images: { ...(content.images || {}), [key]: url } };
        await saveContent(updated);
        load();
      }
    } catch {}
    setUploading(null); setPendingKey(null);
  };

  const triggerUpload = useCallback((key: string) => { setPendingKey(key); fileRef.current?.click(); }, []);
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && pendingKey) uploadImage(file, pendingKey);
    e.target.value = '';
  };

  const str = (k: string) => locData[locale]?.[k] || DEFAULT_STRINGS[locale]?.[k] || DEFAULT_STRINGS['EN']?.[k] || '';

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />

      {preview && (
        <div className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center p-6" onClick={() => setPreview(null)}>
          <img src={preview} className="max-w-full max-h-full object-contain rounded shadow-2xl" />
          <button onClick={() => setPreview(null)} className="absolute top-5 right-5 text-white/80 hover:text-white bg-black/40 rounded-full p-1"><X className="w-5 h-5" /></button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm font-bold text-slate-900">AZEXBUY — Tam Məzmun İdarəetməsi</h1>
          <p className="text-[10px] text-slate-400 mt-0.5">Sitenin başdan sona bütün mətnləri, görsəlləri, məhsulları düzənleyin</p>
        </div>
        <button onClick={load} className="h-7 px-3 flex items-center gap-1.5 text-xs border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-sm">
          <RefreshCw className="w-3 h-3" /> Yenilə
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left nav */}
        <div className="w-52 shrink-0 bg-white border-r border-slate-200 overflow-y-auto">
          {CMS_PAGES.map(p => (
            <button key={p.key} onClick={() => setPage(p.key as PageKey)}
              className={`w-full text-left px-3.5 py-2.5 text-xs font-medium border-b border-slate-100 transition-colors ${page === p.key ? 'bg-[#0f3156] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-4">

          {/* ── IMAGES ── */}
          {page === 'images' && (
            <>
              <h2 className="text-sm font-bold text-slate-800">Əsas Görsellər</h2>
              <p className="text-xs text-slate-500">URL yazın ya da yükləyin, sonra Saxla düyməsinə basın.</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {IMAGE_KEYS.map(img => (
                  <ImageField key={img.key} imgKey={img.key} label={img.label}
                    content={content} uploading={uploading}
                    onSaveContent={saveContent} onTriggerUpload={triggerUpload}
                    onUpdateImgUrl={handleUpdateImgUrl} onPreview={setPreview}
                    saving={saving} saved={saved} />
                ))}
              </div>
            </>
          )}

          {/* ── NAVBAR ── */}
          {page === 'navbar' && (
            <>
              <h2 className="text-sm font-bold text-slate-800">Naviqasiya Menyusu</h2>
              <LocaleTabs locale={locale} onSelect={setLocale} />
              <div className="space-y-2">
                {['home','forBuyers','forProducers','services','products','howItWorks','aboutUs','insights','contact','requestQuote','dossiers'].map(k => (
                  <F key={k} label={k} k={`nav.${k}`} value={str(`nav.${k}`)} onChange={handleStrChange} />
                ))}
              </div>
              <SaveBar onSave={() => saveStrings(locData)} saving={saving} saved={saved} />
            </>
          )}

          {/* ── HERO ── */}
          {page === 'hero' && (
            <>
              <h2 className="text-sm font-bold text-slate-800">Hero Bölməsi</h2>
              <ImageField imgKey="HERO_IMAGE" label="Hero Arxa Fon Şəkli"
                content={content} uploading={uploading}
                onSaveContent={saveContent} onTriggerUpload={triggerUpload}
                onUpdateImgUrl={handleUpdateImgUrl} onPreview={setPreview}
                saving={saving} saved={saved} />
              <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider rounded mt-2">Başlıqlar — bütün dillər</div>
              <MultiLocF label="Kicker (üst etiket)" strKey="hero.kicker" locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label="Əsas Başlıq" strKey="hero.title" multi locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label="Alt Başlıq" strKey="hero.subtitle" multi locData={locData} onChange={handleMultiLocChange} />
              <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider rounded">CTA Butonları</div>
              <MultiLocF label="Almaq İstəyirəm — Etiket" strKey="hero.buyLabel" locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label="Almaq İstəyirəm — Buton Mətni" strKey="hero.buyAction" locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label="İxrac Etmək İstəyirəm — Etiket" strKey="hero.exportLabel" locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label="İxrac Etmək İstəyirəm — Buton Mətni" strKey="hero.exportAction" locData={locData} onChange={handleMultiLocChange} />
              <SaveBar onSave={async () => { await saveContent(content); await saveStrings(locData); }} saving={saving} saved={saved} />
            </>
          )}

          {/* ── WHY AZEXBUY ── */}
          {page === 'why_azexbuy' && (
            <>
              <h2 className="text-sm font-bold text-slate-800">Niyə AZEXBUY? Bölməsi</h2>
              <MultiLocF label="Bölmə Başlığı" strKey="whyAzexbuy.heading" locData={locData} onChange={handleMultiLocChange} />
              {[0,1,2,3,4].map(i => (
                <div key={i} className="bg-slate-100 p-3 rounded space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Kart {i+1}</div>
                  <MultiLocF label="Başlıq" strKey={`whyAzexbuy.items[${i}].title`} locData={locData} onChange={handleMultiLocChange} />
                  <MultiLocF label="Açıqlama" strKey={`whyAzexbuy.items[${i}].desc`} multi locData={locData} onChange={handleMultiLocChange} />
                  <MultiLocF label="Metrik" strKey={`whyAzexbuy.items[${i}].metric`} locData={locData} onChange={handleMultiLocChange} />
                </div>
              ))}
              <SaveBar onSave={() => saveStrings(locData)} saving={saving} saved={saved} />
            </>
          )}

          {/* ── AUDIENCE ── */}
          {page === 'audience' && (
            <>
              <h2 className="text-sm font-bold text-slate-800">Alıcı / İstehsalçı Kartları</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase rounded">Alıcı Kartı (Mavi)</div>
                  <ImageField imgKey="BUYER_CARD_IMAGE" label="Alıcı Kartı Şəkli"
                    content={content} uploading={uploading}
                    onSaveContent={saveContent} onTriggerUpload={triggerUpload}
                    onUpdateImgUrl={handleUpdateImgUrl} onPreview={setPreview}
                    saving={saving} saved={saved} />
                  <MultiLocF label="Etiket" strKey="bilateral.buyersTag" locData={locData} onChange={handleMultiLocChange} />
                  <MultiLocF label="Başlıq" strKey="bilateral.buyersTitle" locData={locData} onChange={handleMultiLocChange} />
                  <MultiLocF label="Açıqlama" strKey="bilateral.buyersDesc" multi locData={locData} onChange={handleMultiLocChange} />
                  <MultiLocF label="Buton Mətni" strKey="bilateral.buyersBtn" locData={locData} onChange={handleMultiLocChange} />
                </div>
                <div className="space-y-2">
                  <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase rounded">İstehsalçı Kartı (Yaşıl)</div>
                  <ImageField imgKey="PRODUCER_CARD_IMAGE" label="İstehsalçı Kartı Şəkli"
                    content={content} uploading={uploading}
                    onSaveContent={saveContent} onTriggerUpload={triggerUpload}
                    onUpdateImgUrl={handleUpdateImgUrl} onPreview={setPreview}
                    saving={saving} saved={saved} />
                  <MultiLocF label="Etiket" strKey="bilateral.producersTag" locData={locData} onChange={handleMultiLocChange} />
                  <MultiLocF label="Başlıq" strKey="bilateral.producersTitle" locData={locData} onChange={handleMultiLocChange} />
                  <MultiLocF label="Açıqlama" strKey="bilateral.producersDesc" multi locData={locData} onChange={handleMultiLocChange} />
                  <MultiLocF label="Buton Mətni" strKey="bilateral.producersBtn" locData={locData} onChange={handleMultiLocChange} />
                </div>
              </div>
              <SaveBar onSave={() => saveStrings(locData)} saving={saving} saved={saved} />
            </>
          )}

          {/* ── SERVICES ── */}
          {page === 'services' && (
            <>
              <h2 className="text-sm font-bold text-slate-800">Xidmətlər Bölməsi</h2>
              <MultiLocF label="Bölmə Başlığı" strKey="services.heading" locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label="Alt Başlıq" strKey="services.subheading" multi locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label='"Ətraflı" Buton Mətni' strKey="services.learnMore" locData={locData} onChange={handleMultiLocChange} />
              <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase rounded mt-2">Outsourced Export Department Bloku</div>
              <MultiLocF label="Blok Başlığı" strKey="services.outsourcedTitle" multi locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label="Etiket/Badge" strKey="services.outsourcedBadge" locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label="Açıqlama" strKey="services.outsourcedDesc" multi locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label="CTA Mətni" strKey="services.outsourcedCta" locData={locData} onChange={handleMultiLocChange} />
              <SaveBar onSave={() => saveStrings(locData)} saving={saving} saved={saved} />
            </>
          )}

          {/* ── HOW IT WORKS ── */}
          {page === 'how_it_works' && (
            <>
              <h2 className="text-sm font-bold text-slate-800">Necə İşləyir Bölməsi</h2>

              <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider rounded">Görsellər</div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ImageField imgKey="HOW_IT_WORKS_BUYERS_IMAGE" label="Alıcılar Görseli"
                  content={content} uploading={uploading}
                  onSaveContent={saveContent} onTriggerUpload={triggerUpload}
                  onUpdateImgUrl={handleUpdateImgUrl} onPreview={setPreview}
                  saving={saving} saved={saved} />
                <ImageField imgKey="HOW_IT_WORKS_SELLERS_IMAGE" label="Satıcılar Görseli"
                  content={content} uploading={uploading}
                  onSaveContent={saveContent} onTriggerUpload={triggerUpload}
                  onUpdateImgUrl={handleUpdateImgUrl} onPreview={setPreview}
                  saving={saving} saved={saved} />
              </div>

              <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider rounded mt-2">Mətnlər</div>
              <MultiLocF label="Bölmə Başlığı" strKey="howItWorks.heading" locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label="Alt Başlıq" strKey="howItWorks.subheading" multi locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label='"Tam Prosesə Bax" Butonu' strKey="howItWorks.seeFullProcess" locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label="Alıcılar Etiketi" strKey="howItWorks.forBuyersLabel" locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label="İstehsalçılar Etiketi" strKey="howItWorks.forProducersLabel" locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label="İpucu Mətni" strKey="howItWorks.clickStepHint" multi locData={locData} onChange={handleMultiLocChange} />
              <SaveBar onSave={async () => { await saveContent(content); await saveStrings(locData); }} saving={saving} saved={saved} />
            </>
          )}

          {/* ── FEATURED PRODUCTS ── */}
          {page === 'featured_products' && (
            <>
              <h2 className="text-sm font-bold text-slate-800">Öne Çıxan Məhsullar Bölməsi</h2>
              <MultiLocF label="Başlıq" strKey="featuredProducts.heading" locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label="Alt Başlıq" strKey="featuredProducts.subheading" multi locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label='"Bütün Məhsullar" Linki' strKey="featuredProducts.viewAll" locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label='"Bu Məhsulu Sifariş Et" Butonu' strKey="featuredProducts.requestProduct" locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label='"HS Kodu" Etiketi' strKey="featuredProducts.hsCodeLabel" locData={locData} onChange={handleMultiLocChange} />
              <SaveBar onSave={() => saveStrings(locData)} saving={saving} saved={saved} />
            </>
          )}

          {/* ── WHY AZERBAIJAN ── */}
          {page === 'why_azerbaijan' && (
            <>
              <h2 className="text-sm font-bold text-slate-800">Niyə Azərbaycan Bölməsi</h2>
              <ImageField imgKey="WHY_AZERBAIJAN_IMAGE" label="Arxa Fon Şəkli"
                content={content} uploading={uploading}
                onSaveContent={saveContent} onTriggerUpload={triggerUpload}
                onUpdateImgUrl={handleUpdateImgUrl} onPreview={setPreview}
                saving={saving} saved={saved} />
              <MultiLocF label="Başlıq" strKey="whyAzerbaijan.heading" locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label="Açıqlama" strKey="whyAzerbaijan.desc" multi locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label='"Ətraflı" Linki' strKey="whyAzerbaijan.learnMore" locData={locData} onChange={handleMultiLocChange} />
              {[0,1,2,3].map(i => (
                <div key={i} className="bg-slate-100 p-3 rounded space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Xüsusiyyət {i+1}</div>
                  <MultiLocF label="Sətir 1" strKey={`whyAzerbaijan.features[${i}].line1`} locData={locData} onChange={handleMultiLocChange} />
                  <MultiLocF label="Sətir 2" strKey={`whyAzerbaijan.features[${i}].line2`} locData={locData} onChange={handleMultiLocChange} />
                  <MultiLocF label="Detal" strKey={`whyAzerbaijan.features[${i}].detail`} multi locData={locData} onChange={handleMultiLocChange} />
                </div>
              ))}
              <SaveBar onSave={async () => { await saveContent(content); await saveStrings(locData); }} saving={saving} saved={saved} />
            </>
          )}

          {/* ── FOOTER ── */}
          {page === 'footer' && (
            <>
              <h2 className="text-sm font-bold text-slate-800">Footer</h2>
              <MultiLocF label="Açıqlama (Brand mandate)" strKey="footer.description" multi locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label="HQ Başlığı" strKey="footer.hqTitle" locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label="HQ Ünvanı" strKey="footer.hqAddress" multi locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label='"Sürətli Keçidlər" Başlığı' strKey="footer.quickLinks" locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label='"Uyğunluq" Başlığı' strKey="footer.complianceTitle" locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label="Copyright Mətni" strKey="footer.rights" multi locData={locData} onChange={handleMultiLocChange} />
              <SaveBar onSave={() => saveStrings(locData)} saving={saving} saved={saved} />
            </>
          )}

          {/* ── PRODUCTS CATALOG ── */}
          {page === 'products_catalog' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Məhsullar Kataloqu</h2>
                  <p className="text-xs text-slate-500">Hər məhsulun şəkli, başlıqları, texniki məlumatları bütün dillərdə.</p>
                </div>
                <button
                  onClick={() => {
                    const newProd = { id: `prod-${Date.now()}`, hsCode: '', minOrderQty: '', annualCapacity: '', leadTimeDays: '', name: {}, shortDesc: {}, originRegion: {}, packaging: {}, gradeSpecs: {} };
                    const updated = { ...content, products: [...(content.products || []), newProd] };
                    setContent(updated);
                    saveContent(updated);
                  }}
                  className="flex items-center gap-1.5 h-8 px-3 bg-[#0f3156] hover:bg-[#081c33] text-white text-xs font-bold rounded-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Yeni Məhsul
                </button>
              </div>
              {(content.products || []).length === 0 && (
                <div className="bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700 rounded">
                  Məhsul override-ı hələ yoxdur. AZEXBUY saytında default məhsullar göstərilir.
                </div>
              )}
              {(content.products || []).map((prod: any, idx: number) => (
                <div key={prod.id || idx} className="bg-white border border-slate-200 rounded overflow-hidden">
                  <div className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                    <button onClick={() => setExpandedId(expandedId === 'p'+idx ? null : 'p'+idx)}
                      className="flex items-center gap-3 flex-1 text-left">
                      {prod.image && <img src={prod.image} className="w-10 h-7 object-cover border border-slate-200 rounded" />}
                      <span className="text-xs font-bold text-slate-900">{prod.name?.EN || prod.id}</span>
                      <span className="text-[10px] font-mono text-slate-400">HS: {prod.hsCode}</span>
                      {expandedId === 'p'+idx ? <ChevronDown className="w-4 h-4 text-slate-400 ml-auto" /> : <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />}
                    </button>
                    <button onClick={() => {
                      if (!confirm('Bu məhsulu silmək istəyirsiniz?')) return;
                      const p = (content.products || []).filter((_: any, i: number) => i !== idx);
                      const updated = { ...content, products: p };
                      setContent(updated);
                      saveContent(updated);
                    }} className="ml-2 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {expandedId === 'p'+idx && (
                    <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">
                      {[['HS Kodu','hsCode'],['Min Sifariş','minOrderQty'],['Yıllık Kapasite','annualCapacity'],['Çatdırılma Müddəti','leadTimeDays']].map(([lbl, fld]) => (
                        <div key={fld} className="bg-white border border-slate-200 rounded p-3">
                          <label className="block text-[10px] font-bold text-slate-400 font-mono mb-1.5 uppercase">{lbl}</label>
                          <input value={prod[fld] || ''} onChange={e => {
                            const p = [...(content.products || [])]; p[idx] = { ...p[idx], [fld]: e.target.value };
                            setContent((c: any) => ({ ...c, products: p }));
                          }} className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 focus:outline-none focus:border-[#0f3156] rounded-sm" />
                        </div>
                      ))}
                      {[['Ad','name'],['Qısa Təsvir','shortDesc'],['Mənşə Bölgəsi','originRegion'],['Qablaşdırma','packaging'],['Keyfiyyət Standartları','gradeSpecs']].map(([lbl, fld]) => (
                        <div key={fld} className="bg-white border border-slate-200 rounded p-3">
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 font-mono">{lbl}</div>
                          <div className="grid grid-cols-2 gap-2">
                            {LOCALES.map(l => (
                              <div key={l}>
                                <div className="text-[9px] font-bold text-slate-400 mb-0.5">{l}</div>
                                <textarea value={prod[fld]?.[l] || ''} onChange={e => {
                                  const p = [...(content.products || [])];
                                  p[idx] = { ...p[idx], [fld]: { ...(p[idx][fld] || {}), [l]: e.target.value } };
                                  setContent((c: any) => ({ ...c, products: p }));
                                }} rows={2} className="w-full text-xs bg-slate-50 border border-slate-200 px-2 py-1 focus:outline-none focus:border-[#0f3156] resize-none rounded-sm" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <SaveBar onSave={() => saveContent(content)} saving={saving} saved={saved} />
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* ── BUYER STEPS ── */}
          {page === 'buyer_steps' && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800">Alıcı Addımları</h2>
                <button
                  onClick={() => {
                    const steps = content.buyer_steps || [];
                    const newStep = { number: steps.length + 1, sla: '', authority: '', title: {}, detailTitle: {}, description: {}, deliverable: {} };
                    const updated = { ...content, buyer_steps: [...steps, newStep] };
                    setContent(updated);
                    saveContent(updated);
                  }}
                  className="flex items-center gap-1.5 h-8 px-3 bg-[#0f3156] hover:bg-[#081c33] text-white text-xs font-bold rounded-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Yeni Addım
                </button>
              </div>
              {(content.buyer_steps || []).length === 0 && (
                <div className="bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700 rounded">Hələ override yoxdur — default addımlar göstərilir.</div>
              )}
              {(content.buyer_steps || []).map((step: any, idx: number) => (
                <div key={idx} className="bg-white border border-slate-200 rounded overflow-hidden">
                  <button onClick={() => setExpandedId(expandedId === 'bs'+idx ? null : 'bs'+idx)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                    <span className="text-xs font-bold text-slate-900">Addım {step.number}: {step.title?.EN || ''}</span>
                    {expandedId === 'bs'+idx ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>
                  {expandedId === 'bs'+idx && (
                    <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">
                      {[['SLA','sla'],['Səlahiyyətli İnstitut','authority']].map(([lbl, fld]) => (
                        <div key={fld} className="bg-white border border-slate-200 rounded p-3">
                          <label className="block text-[10px] font-bold text-slate-400 font-mono mb-1.5 uppercase">{lbl}</label>
                          <input value={step[fld] || ''} onChange={e => {
                            const steps = [...(content.buyer_steps || [])]; steps[idx] = { ...steps[idx], [fld]: e.target.value };
                            setContent((c: any) => ({ ...c, buyer_steps: steps }));
                          }} className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 focus:outline-none focus:border-[#0f3156] rounded-sm" />
                        </div>
                      ))}
                      {[['Başlıq','title'],['Detal Başlığı','detailTitle'],['Açıqlama','description'],['Çatdırılacaq','deliverable']].map(([lbl, fld]) => (
                        <div key={fld} className="bg-white border border-slate-200 rounded p-3">
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 font-mono">{lbl}</div>
                          <div className="grid grid-cols-2 gap-2">
                            {LOCALES.map(l => (
                              <div key={l}>
                                <div className="text-[9px] font-bold text-slate-400 mb-0.5">{l}</div>
                                <textarea value={step[fld]?.[l] || ''} onChange={e => {
                                  const steps = [...(content.buyer_steps || [])];
                                  steps[idx] = { ...steps[idx], [fld]: { ...(steps[idx][fld] || {}), [l]: e.target.value } };
                                  setContent((c: any) => ({ ...c, buyer_steps: steps }));
                                }} rows={2} className="w-full text-xs bg-slate-50 border border-slate-200 px-2 py-1 focus:outline-none focus:border-[#0f3156] resize-none rounded-sm" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <SaveBar onSave={() => saveContent(content)} saving={saving} saved={saved} />
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* ── PRODUCER STEPS ── */}
          {page === 'producer_steps' && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800">İstehsalçı Mərhələləri</h2>
                <button
                  onClick={() => {
                    const steps = content.producer_steps || [];
                    const newStep = { number: steps.length + 1, sla: '', authority: '', title: {}, detailTitle: {}, description: {}, deliverable: {} };
                    const updated = { ...content, producer_steps: [...steps, newStep] };
                    setContent(updated);
                    saveContent(updated);
                  }}
                  className="flex items-center gap-1.5 h-8 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Yeni Mərhələ
                </button>
              </div>
              {(content.producer_steps || []).length === 0 && (
                <div className="bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700 rounded">Hələ override yoxdur — default mərhələlər göstərilir.</div>
              )}
              {(content.producer_steps || []).map((step: any, idx: number) => (
                <div key={idx} className="bg-white border border-slate-200 rounded overflow-hidden">
                  <button onClick={() => setExpandedId(expandedId === 'ps'+idx ? null : 'ps'+idx)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                    <span className="text-xs font-bold text-slate-900">Mərhələ {step.number}: {step.title?.EN || ''}</span>
                    {expandedId === 'ps'+idx ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>
                  {expandedId === 'ps'+idx && (
                    <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">
                      {[['SLA','sla'],['Səlahiyyətli Institut','authority']].map(([lbl, fld]) => (
                        <div key={fld} className="bg-white border border-slate-200 rounded p-3">
                          <label className="block text-[10px] font-bold text-slate-400 font-mono mb-1.5 uppercase">{lbl}</label>
                          <input value={step[fld] || ''} onChange={e => {
                            const steps = [...(content.producer_steps || [])]; steps[idx] = { ...steps[idx], [fld]: e.target.value };
                            setContent((c: any) => ({ ...c, producer_steps: steps }));
                          }} className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 focus:outline-none focus:border-[#0f3156] rounded-sm" />
                        </div>
                      ))}
                      {[['Başlıq','title'],['Detal Başlığı','detailTitle'],['Açıqlama','description'],['Çatdırılacaq','deliverable']].map(([lbl, fld]) => (
                        <div key={fld} className="bg-white border border-slate-200 rounded p-3">
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 font-mono">{lbl}</div>
                          <div className="grid grid-cols-2 gap-2">
                            {LOCALES.map(l => (
                              <div key={l}>
                                <div className="text-[9px] font-bold text-slate-400 mb-0.5">{l}</div>
                                <textarea value={step[fld]?.[l] || ''} onChange={e => {
                                  const steps = [...(content.producer_steps || [])];
                                  steps[idx] = { ...steps[idx], [fld]: { ...(steps[idx][fld] || {}), [l]: e.target.value } };
                                  setContent((c: any) => ({ ...c, producer_steps: steps }));
                                }} rows={2} className="w-full text-xs bg-slate-50 border border-slate-200 px-2 py-1 focus:outline-none focus:border-[#0f3156] resize-none rounded-sm" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <SaveBar onSave={() => saveContent(content)} saving={saving} saved={saved} />
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* ── MEDIA LIBRARY ── */}
          {page === 'media_library' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-slate-800">Şəkil Kitabxanası</h2>
                <button onClick={() => { setPendingKey('lib'); fileRef.current?.click(); }}
                  className="h-7 px-3 flex items-center gap-1.5 text-xs font-bold bg-[#0f3156] text-white hover:bg-[#081c33] rounded-sm">
                  <Plus className="w-3 h-3" /> Yeni Şəkil
                </button>
              </div>
              {images.length === 0 && (
                <div className="text-center py-12 text-xs text-slate-400">
                  <ImgIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" /> Kitabxana boşdur
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {images.map(img => (
                  <div key={img.filename} className="bg-white border border-slate-200 rounded overflow-hidden group">
                    <div className="h-24 bg-slate-100 relative cursor-pointer" onClick={() => setPreview(img.url)}>
                      <img src={img.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      <div className="text-[10px] text-slate-500 font-mono truncate">{img.filename}</div>
                      <div className="text-[9px] text-slate-400">{(img.size / 1024).toFixed(0)} KB</div>
                      <div className="flex gap-1">
                        <button onClick={() => navigator.clipboard.writeText(img.url)}
                          className="flex-1 h-6 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-sm transition-colors">
                          URL Kopyala
                        </button>
                        <button onClick={async () => {
                          await fetch(`${OCTO}/api/azexbuy/images/${img.filename}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${getToken()}` },
                          });
                          load();
                        }} className="h-6 px-1.5 text-red-500 hover:bg-red-50 border border-red-200 rounded-sm">
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
