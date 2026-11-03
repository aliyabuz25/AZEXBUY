import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Save, Upload, RefreshCw, CheckCircle, ChevronDown, ChevronRight,
  Trash2, Plus, Eye, X, Image as ImgIcon, AlignLeft, Package,
  Star, Footprints, Layers, Globe, LayoutTemplate, Menu as MenuIcon,
  Anchor, HelpCircle, Info, Map, Users, FileText, BookOpen,
} from 'lucide-react';
import { UiLanguage } from '../types';

interface AzexbuyCMSViewProps { uiLang: UiLanguage; }

const OCTO = '';
const LOCALES = ['EN', 'AZ', 'TR', 'RU', 'AR', 'ES'] as const;
type Loc = typeof LOCALES[number];

async function apiGet(path: string) {
  try { const r = await fetch(`${OCTO}${path}`); return r.ok ? r.json() : null; } catch { return null; }
}
async function apiPost(path: string, body: any) {
  try {
    const r = await fetch(`${OCTO}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return r.ok ? r.json() : null;
  } catch { return null; }
}

// ── Default strings seed (EN + AZ for display, all locales stored in DB) ──────
const DEFAULT_STRINGS: Record<string, Record<string, string>> = {
  EN: {
    'nav.home': 'Home', 'nav.forBuyers': 'For Buyers', 'nav.forProducers': 'For Producers',
    'nav.services': 'Services', 'nav.products': 'Products', 'nav.howItWorks': 'How It Works',
    'nav.aboutUs': 'About Us', 'nav.insights': 'Insights', 'nav.contact': 'Contact',
    'nav.requestQuote': 'Request a Quote', 'nav.dossiers': 'Dossiers',
    'hero.kicker': 'AZEXBUY',
    'hero.title': 'Connecting Azerbaijani Products with Global Buyers',
    'hero.subtitle': 'We help international buyers source high-quality Azerbaijani products and support local producers in reaching global markets.',
    'hero.buyLabel': 'I WANT TO BUY', 'hero.buyAction': 'Find a Supplier',
    'hero.exportLabel': 'I WANT TO EXPORT', 'hero.exportAction': 'Find a Buyer',
    'whyAzexbuy.heading': 'Why AZEXBUY?',
    'whyAzexbuy.items[0].title': 'Verified Suppliers', 'whyAzexbuy.items[0].desc': 'We work only with trusted Azerbaijani manufacturers.', 'whyAzexbuy.items[0].metric': '250+ Certified Facilities',
    'whyAzexbuy.items[1].title': 'Global Buyer Access', 'whyAzexbuy.items[1].desc': 'We connect you with international buyers.', 'whyAzexbuy.items[1].metric': '42 Export Destinations',
    'whyAzexbuy.items[2].title': 'Market Intelligence', 'whyAzexbuy.items[2].desc': 'Data-driven insights for better decisions.', 'whyAzexbuy.items[2].metric': 'HS-6 Tariff & Route Data',
    'whyAzexbuy.items[3].title': 'End-to-End Export', 'whyAzexbuy.items[3].desc': 'From sourcing to delivery, we manage the process.', 'whyAzexbuy.items[3].metric': 'Incoterms 2020 Desk',
    'whyAzexbuy.items[4].title': 'International Logistics', 'whyAzexbuy.items[4].desc': 'Reliable and efficient transportation solutions.', 'whyAzexbuy.items[4].metric': 'Middle Corridor Hub',
    'bilateral.buyersTag': 'FOR BUYERS', 'bilateral.buyersTitle': 'Source From Azerbaijan',
    'bilateral.buyersDesc': "Tell us what you need. We'll find verified suppliers, compare offers and manage the export process.",
    'bilateral.buyersBtn': 'Find a Supplier', 'bilateral.producersTag': 'FOR PRODUCERS',
    'bilateral.producersTitle': 'Take Your Products Global',
    'bilateral.producersDesc': 'We help Azerbaijani manufacturers find international buyers and manage the export process.',
    'bilateral.producersBtn': 'Find a Buyer',
    'services.heading': 'Our Services', 'services.subheading': 'Comprehensive support for your export and sourcing needs.',
    'services.learnMore': 'Learn More', 'services.outsourcedTitle': 'Outsourced Export Department (Turnkey Trade Desk)',
    'services.outsourcedBadge': 'INSTITUTIONAL MANDATE',
    'services.outsourcedDesc': 'For Azerbaijani producers seeking complete international trade representation without establishing expensive foreign branches.',
    'services.outsourcedCta': 'Appoint AZEXBUY as Your Export Desk',
    'howItWorks.heading': 'How It Works', 'howItWorks.subheading': 'A simple process from request to delivery.',
    'howItWorks.seeFullProcess': 'See Full Process', 'howItWorks.forBuyersLabel': 'For Buyers',
    'howItWorks.forProducersLabel': 'For Producers',
    'howItWorks.clickStepHint': 'Select any phase number to inspect institutional SLA, required documents, and verification protocol.',
    'featuredProducts.heading': 'Featured Products', 'featuredProducts.subheading': 'Explore a selection of high-quality Azerbaijani products.',
    'featuredProducts.viewAll': 'View All Products', 'featuredProducts.requestProduct': 'Request This Product',
    'featuredProducts.hsCodeLabel': 'HS Code:',
    'whyAzerbaijan.heading': 'Why Azerbaijan?',
    'whyAzerbaijan.desc': 'Strategic location, rich resources and growing export potential make Azerbaijan an ideal hub for international trade.',
    'whyAzerbaijan.learnMore': 'Learn More',
    'whyAzerbaijan.features[0].line1': 'Strategic', 'whyAzerbaijan.features[0].line2': 'Location', 'whyAzerbaijan.features[0].detail': 'Nexus of the Trans-Caspian Middle Corridor linking Europe, Central Asia, CIS, and MENA via Port of Baku (Alat) and BTK Railway.',
    'whyAzerbaijan.features[1].line1': 'Diverse', 'whyAzerbaijan.features[1].line2': 'Industries', 'whyAzerbaijan.features[1].detail': '9 climatic zones supporting premium agriculture alongside Sumgayit chemical parks, metallurgy, textiles, and natural stone.',
    'whyAzerbaijan.features[2].line1': 'Quality', 'whyAzerbaijan.features[2].line2': 'Products', 'whyAzerbaijan.features[2].detail': 'ISO 22000, GLOBALG.A.P., OEKO-TEX, and API-certified manufacturing backed by strict AQTA phytosanitary traceability.',
    'whyAzerbaijan.features[3].line1': 'Growing', 'whyAzerbaijan.features[3].line2': 'Export Ecosystem', 'whyAzerbaijan.features[3].detail': 'Modern free economic zones (AFEZ), green customs corridors, and preferential trade regimes with CIS, Turkey, and EU GSP+.',
    'footer.description': 'Sovereign Trade & Sourcing Infrastructure Authority connecting verified Azerbaijani manufacturers with institutional global procurement desks.',
    'footer.hqTitle': 'Headquarters & Trade Desk',
    'footer.hqAddress': 'Baku Alliance Business Center, Heydar Aliyev Ave 95, Baku AZ1033, Republic of Azerbaijan',
    'footer.quickLinks': 'Platform & Portals', 'footer.complianceTitle': 'Trade Standards & Governance',
    'footer.rights': '© 2026 AZEXBUY Consortium — Azerbaijan Export & Sourcing Facilitation Platform. All rights reserved.',
  },
  AZ: {
    'nav.home': 'Ana Səhifə', 'nav.forBuyers': 'Alıcılar Üçün', 'nav.forProducers': 'İstehsalçılar Üçün',
    'nav.requestQuote': 'Qiymət Sorğusu', 'hero.kicker': 'AZEXBUY',
    'hero.title': 'Azərbaycan Məhsullarını Qlobal Alıcılarla Birləşdiririk',
    'hero.subtitle': 'Biz beynəlxalq alıcılara yüksək keyfiyyətli Azərbaycan məhsullarını tədarük etməkdə kömək edirik.',
    'hero.buyLabel': 'ALMAQ İSTƏYİRƏM', 'hero.buyAction': 'Təchizatçı Tap',
    'hero.exportLabel': 'İXRAC ETMƏK İSTƏYİRƏM', 'hero.exportAction': 'Alıcı Tap',
    'whyAzexbuy.heading': 'Niyə AZEXBUY?',
    'bilateral.buyersTitle': 'Azərbaycandan Tədarük Edin', 'bilateral.producersTitle': 'Məhsullarınızı Dünyaya Çıxarın',
    'services.heading': 'Xidmətlərimiz', 'howItWorks.heading': 'Necə İşləyir',
    'featuredProducts.heading': 'Seçilmiş Məhsullar', 'whyAzerbaijan.heading': 'Niyə Azərbaycan?',
    'footer.rights': '© 2026 AZEXBUY Konsorsiumu. Bütün hüquqlar qorunur.',
  },
};

// ── CMS page sections definition ──────────────────────────────────────────────
const CMS_PAGES = [
  { key: 'images',           label: 'Görseller',              icon: ImgIcon },
  { key: 'navbar',           label: 'Naviqasiya Menyusu',     icon: MenuIcon },
  { key: 'hero',             label: 'Hero Bolmesi',           icon: LayoutTemplate },
  { key: 'why_azexbuy',     label: 'Niye AZEXBUY',           icon: Star },
  { key: 'audience',         label: 'Alici / Istehsalci',     icon: Users },
  { key: 'services',         label: 'Xidmetler',              icon: Anchor },
  { key: 'how_it_works',    label: 'Nece Isleyir',            icon: HelpCircle },
  { key: 'featured_products',label: 'One Cixan Mehsullar',    icon: FileText },
  { key: 'why_azerbaijan',  label: 'Niye Azerbaycan',         icon: Map },
  { key: 'footer',           label: 'Footer',                 icon: Info },
  { key: 'products_catalog', label: 'Mehsullar Kataloqu',     icon: Package },
  { key: 'buyer_steps',     label: 'Alici Addimlari',         icon: Footprints },
  { key: 'producer_steps',  label: 'Istehsalci Addimlari',    icon: Layers },
  { key: 'media_library',   label: 'Sekil Kitabxanasi',       icon: ImgIcon },
] as const;
type PageKey = typeof CMS_PAGES[number]['key'];

const IMAGE_KEYS = [
  {
    key: 'HERO_IMAGE', label: 'Hero Arxa Fon',
    defaultUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9ZWqLLmb30gHFdTBf7cfY60pAMzYSTWRn2keRDZ7k8a3eQicd1I5xuOR1U44ux_eyOl79BjhxRaXdEbzovzXexqRo8oDy3gVECJAAKnDsq1DYgw7oR-p-U-VjFeMqmdwPl27SJVIP7hTVWchM1LYBR1EY2hy5C8iSkUcytv0qKVFgxmbifXswWW8UTnyUsQw5XBb81qNG2tremLOg_k5EPGCl-K_AWwSN8UQ3T1EN7HyePk3pvGD9',
  },
  {
    key: 'BUYER_CARD_IMAGE', label: 'Alıcı Kartı Görseli',
    defaultUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHfBjlFdQNaNAsP2RbAdqbBzskyL-GFgkaTpjwu0U6iT-t0tvmdQxrsHV7DOVkxLI4TCvj6qWpEawxqKJPqQE9f5GeXtwvTu7-fs3s495aRNM41LY0ardk4_DhtXk2RrKbiZgwssXvlrrI_EThET-4vRXO-9SbspxRcE3KXflGW-LnO8LzAq_bYYS10R-r010CzBLBwMqbd6slv40ntEvn3OyeauJszJaHkxnHTcGCq-0XAIDQmj6_',
  },
  {
    key: 'PRODUCER_CARD_IMAGE', label: 'Istehsalci Karti Görseli',
    defaultUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgrvRVBxN_YV05A8C2ZBQC2V2WHmgN9IrmvxhBvoVre7FKYjEbaR95Ew5PqX6-T-FG67u-0fHLCX6KeLtUrAkBIiJfWZGu7t3Ez2RyKvMerWTAHV1ROVLxhP4wE2oqLK-k9t1i6hrPmq-YJ-GDzjbqNDrNf2-SyjbXUmuQAJa5ScuKsRahZQdVKWyzFzRNPNYzxr3XOkiIb2BLWy4KJO-b-RWiNaaRqebQkQINqnQZfyBkDjpvxMId',
  },
  {
    key: 'WHY_AZERBAIJAN_IMAGE', label: 'Niye Azerbaycan Görseli',
    defaultUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1WtUBR_2hOeUbRABsre_R7H-yW12FldWdxDp_6_abkiZuNwgF3fMTiwxdQCKdfEbdEWa-6CSQc0bQgUbjojei2itk13mAz_e09yOnKuFWP_7AO2BpMiNUQByyYnqtrPMywT0b4g4COdLkLc5_L75NtOsKv5OOgHz7VdAMCF-WDWgmhqccS9HdQKKY8cwD4AeVg_Z5AczT8rfvCVFXyJrgDuQKAsNiyYL54OeN2_HoFxHi9ltf4bUcbHSmM',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
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

  // ── Load ────────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    const [l, c, imgs] = await Promise.all([
      apiGet('/api/azexbuy/localization'),
      apiGet('/api/azexbuy/content'),
      apiGet('/api/azexbuy/images'),
    ]);
    if (l && Object.keys(l).length > 0) {
      // Merge with defaults
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

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  // ── Save helpers ────────────────────────────────────────────────────────────
  const saveStrings = async (data: Record<string, Record<string, string>>) => {
    setSaving(true);
    setLocData(data);
    await apiPost('/api/azexbuy/localization', data);
    flash(); setSaving(false);
  };

  const saveContent = async (data: any) => {
    setSaving(true);
    setContent(data);
    await apiPost('/api/azexbuy/content', data);
    flash(); setSaving(false);
  };

  // ── Image upload ────────────────────────────────────────────────────────────
  const uploadImage = async (file: File, key: string) => {
    setUploading(key);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const r = await fetch(`${OCTO}/api/azexbuy/upload-image`, { method: 'POST', body: fd });
      if (r.ok) {
        const { url } = await r.json();
        const updated = { ...content, images: { ...(content.images || {}), [key]: url } };
        await saveContent(updated);
        load();
      }
    } catch {}
    setUploading(null); setPendingKey(null);
  };

  const triggerUpload = (key: string) => { setPendingKey(key); fileRef.current?.click(); };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && pendingKey) uploadImage(file, pendingKey);
    e.target.value = '';
  };
  const imgUrl = (key: string) => {
    if (content.images?.[key]) return content.images[key];
    const found = IMAGE_KEYS.find(k => k.key === key);
    return found?.defaultUrl || '';
  };
  const isCustomImg = (key: string) => Boolean(content.images?.[key]);

  const updateImgUrl = (key: string, url: string) => {
    setContent((prev: any) => ({ ...prev, images: { ...(prev.images || {}), [key]: url } }));
  };

  const resetImg = async (key: string) => {
    const updated = { ...content, images: { ...(content.images || {}), [key]: '' } };
    await saveContent(updated);
  };

  // ── String helpers ──────────────────────────────────────────────────────────
  const str = (key: string): string => locData[locale]?.[key] || DEFAULT_STRINGS[locale]?.[key] || DEFAULT_STRINGS['EN']?.[key] || '';
  const setStr = (key: string, val: string) => {
    setLocData(prev => ({ ...prev, [locale]: { ...(prev[locale] || {}), [key]: val } }));
  };

  // ── Render atoms ────────────────────────────────────────────────────────────
  const F = ({ label, k, multi = false }: { label: string; k: string; multi?: boolean }) => (
    <div className="bg-white border border-slate-200 rounded p-3">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">{label}</label>
        <span className="text-[9px] text-slate-300 font-mono">{str(k).length}c</span>
      </div>
      {multi
        ? <textarea value={str(k)} onChange={e => setStr(k, e.target.value)} rows={3}
            className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 px-2.5 py-2 focus:outline-none focus:border-[#0f3156] resize-none rounded-sm" />
        : <input value={str(k)} onChange={e => setStr(k, e.target.value)}
            className="w-full h-8 text-xs text-slate-900 bg-slate-50 border border-slate-200 px-2.5 focus:outline-none focus:border-[#0f3156] rounded-sm" />
      }
    </div>
  );

  const MultiLocF = ({ label, keyFn, multi = false }: { label: string; keyFn: (l: Loc) => string; multi?: boolean }) => (
    <div className="bg-white border border-slate-200 rounded p-3">
      <div className="text-[10px] font-bold text-slate-500 uppercase font-mono mb-2">{label}</div>
      <div className="grid grid-cols-2 gap-2">
        {LOCALES.map(l => {
          const k = keyFn(l);
          const val = locData[l]?.[k] || DEFAULT_STRINGS[l]?.[k] || '';
          return (
            <div key={l}>
              <div className="text-[9px] font-bold text-slate-400 mb-0.5">{l}</div>
              {multi
                ? <textarea value={val} onChange={e => setLocData(prev => ({ ...prev, [l]: { ...(prev[l] || {}), [k]: e.target.value } }))} rows={2}
                    className="w-full text-xs bg-slate-50 border border-slate-200 px-2 py-1.5 focus:outline-none focus:border-[#0f3156] resize-none rounded-sm" />
                : <input value={val} onChange={e => setLocData(prev => ({ ...prev, [l]: { ...(prev[l] || {}), [k]: e.target.value } }))}
                    className="w-full h-7 text-xs bg-slate-50 border border-slate-200 px-2 focus:outline-none focus:border-[#0f3156] rounded-sm" />
              }
            </div>
          );
        })}
      </div>
    </div>
  );

  const proxyUrl = (url: string) => url ? `/api/img-proxy?url=${encodeURIComponent(url)}` : '';

  const ImageF = ({ imgKey, label }: { imgKey: string; label: string }) => {
    const url = imgUrl(imgKey);
    const custom = isCustomImg(imgKey);
    const inputVal = content.images?.[imgKey] ?? '';
    const displayUrl = proxyUrl(url);

    return (
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">{label}</span>
          {custom
            ? <span className="text-[9px] px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-sm">OZELLESMIS</span>
            : <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 font-bold rounded-sm">VARSAYILAN</span>
          }
        </div>

        {/* Full-width preview */}
        <div
          className="relative w-full bg-slate-100 cursor-pointer overflow-hidden"
          style={{ height: '160px' }}
          onClick={() => url && setPreview(displayUrl)}
        >
          {displayUrl
            ? <img src={displayUrl} alt={label} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
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
          {/* URL input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Görsel URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={e => updateImgUrl(imgKey, e.target.value)}
                placeholder={imgUrl(imgKey) || 'https://...'}
                className="flex-1 h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 focus:outline-none focus:border-[#0f3156] font-mono rounded-sm"
              />
              <button
                onClick={() => saveContent(content)}
                className="h-8 px-3 text-xs font-bold bg-[#0f3156] text-white hover:bg-[#081c33] rounded-sm flex items-center gap-1.5 shrink-0"
              >
                <Save className="w-3 h-3" /> Saxla
              </button>
            </div>
          </div>

          {/* Upload button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerUpload(imgKey)}
              disabled={uploading === imgKey}
              className="h-7 px-3 flex items-center gap-1.5 text-xs font-bold border border-[#0f3156] text-[#0f3156] hover:bg-[#0f3156] hover:text-white transition-colors rounded-sm"
            >
              {uploading === imgKey ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              {uploading === imgKey ? 'Yüklənir...' : 'Serverdən Yüklə'}
            </button>
            {custom && (
              <button
                onClick={() => resetImg(imgKey)}
                className="h-7 px-2.5 flex items-center gap-1.5 text-xs text-red-500 border border-red-200 hover:bg-red-50 rounded-sm"
              >
                <Trash2 className="w-3 h-3" /> Varsayılana Qaytar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const SaveBar = ({ onSave }: { onSave: () => void }) => (
    <div className="flex justify-end pt-2">
      <button onClick={onSave} disabled={saving}
        className={`h-8 px-5 flex items-center gap-2 text-xs font-bold rounded-sm transition-colors ${saved ? 'bg-emerald-600 text-white' : 'bg-[#0f3156] hover:bg-[#081c33] text-white'}`}>
        {saved ? <><CheckCircle className="w-3.5 h-3.5" /> Saxlandı</> : <><Save className="w-3.5 h-3.5" /> Yadda Saxla</>}
      </button>
    </div>
  );

  const LocaleTabs = () => (
    <div className="flex items-center gap-1 mb-4">
      {LOCALES.map(l => (
        <button key={l} onClick={() => setLocale(l)}
          className={`px-2.5 py-1 text-[10px] font-bold rounded-sm transition-colors ${locale === l ? 'bg-[#0f3156] text-white' : 'text-slate-500 bg-white border border-slate-200 hover:bg-slate-100'}`}>
          {l}
        </button>
      ))}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />

      {/* Preview overlay */}
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
        <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-16">

          {/* ── IMAGES ── */}
          {page === 'images' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Əsas Görsellər</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Yüklə düyməsi ilə serverə yükləyin, ya da birbaşa URL yazın. Dəyişiklik 5 saniyədə saytda görünür.</p>
                </div>
                <button onClick={load} className="h-7 px-3 flex items-center gap-1.5 text-xs border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-sm">
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {IMAGE_KEYS.map(img => <ImageF key={img.key} imgKey={img.key} label={img.label} />)}
              </div>
            </>
          )}

          {/* ── NAVBAR ── */}
          {page === 'navbar' && (
            <>
              <h2 className="text-sm font-bold text-slate-800">Naviqasiya Menyusu</h2>
              <LocaleTabs />
              <div className="space-y-2">
                {['home','forBuyers','forProducers','services','products','howItWorks','aboutUs','insights','contact','requestQuote','dossiers'].map(k => (
                  <F key={k} label={k} k={`nav.${k}`} />
                ))}
              </div>
              <SaveBar onSave={() => saveStrings(locData)} />
            </>
          )}

          {/* ── HERO ── */}
          {page === 'hero' && (
            <>
              <h2 className="text-sm font-bold text-slate-800">Hero Bölməsi</h2>
              <ImageF imgKey="HERO_IMAGE" label="Hero Arxa Fon Şəkli" />
              <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider rounded mt-2">Başlıqlar — bütün dillər</div>
              <MultiLocF label="Kicker (üst etiket)" keyFn={l => `hero.kicker`} />
              <MultiLocF label="Əsas Başlıq" keyFn={l => `hero.title`} multi />
              <MultiLocF label="Alt Başlıq" keyFn={l => `hero.subtitle`} multi />
              <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider rounded">CTA Butonları</div>
              <MultiLocF label="Almaq İstəyirəm — Etiket" keyFn={l => `hero.buyLabel`} />
              <MultiLocF label="Almaq İstəyirəm — Buton Mətni" keyFn={l => `hero.buyAction`} />
              <MultiLocF label="İxrac Etmək İstəyirəm — Etiket" keyFn={l => `hero.exportLabel`} />
              <MultiLocF label="İxrac Etmək İstəyirəm — Buton Mətni" keyFn={l => `hero.exportAction`} />
              <SaveBar onSave={async () => { await saveContent(content); await saveStrings(locData); }} />
            </>
          )}

          {/* ── WHY AZEXBUY ── */}
          {page === 'why_azexbuy' && (
            <>
              <h2 className="text-sm font-bold text-slate-800">Niyə AZEXBUY? Bölməsi</h2>
              <MultiLocF label="Bölmə Başlığı" keyFn={l => `whyAzexbuy.heading`} />
              {[0,1,2,3,4].map(i => (
                <div key={i} className="bg-slate-100 p-3 rounded space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Kart {i+1}</div>
                  <MultiLocF label="Başlıq" keyFn={l => `whyAzexbuy.items[${i}].title`} />
                  <MultiLocF label="Açıqlama" keyFn={l => `whyAzexbuy.items[${i}].desc`} multi />
                  <MultiLocF label="Metrik" keyFn={l => `whyAzexbuy.items[${i}].metric`} />
                </div>
              ))}
              <SaveBar onSave={() => saveStrings(locData)} />
            </>
          )}

          {/* ── AUDIENCE CARDS ── */}
          {page === 'audience' && (
            <>
              <h2 className="text-sm font-bold text-slate-800">Alıcı / İstehsalçı Kartları</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase rounded">Alıcı Kartı (Mavi)</div>
                  <ImageF imgKey="BUYER_CARD_IMAGE" label="Alıcı Kartı Şəkli" />
                  <MultiLocF label="Etiket" keyFn={l => `bilateral.buyersTag`} />
                  <MultiLocF label="Başlıq" keyFn={l => `bilateral.buyersTitle`} />
                  <MultiLocF label="Açıqlama" keyFn={l => `bilateral.buyersDesc`} multi />
                  <MultiLocF label="Buton Mətni" keyFn={l => `bilateral.buyersBtn`} />
                </div>
                <div className="space-y-2">
                  <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase rounded">İstehsalçı Kartı (Yaşıl)</div>
                  <ImageF imgKey="PRODUCER_CARD_IMAGE" label="İstehsalçı Kartı Şəkli" />
                  <MultiLocF label="Etiket" keyFn={l => `bilateral.producersTag`} />
                  <MultiLocF label="Başlıq" keyFn={l => `bilateral.producersTitle`} />
                  <MultiLocF label="Açıqlama" keyFn={l => `bilateral.producersDesc`} multi />
                  <MultiLocF label="Buton Mətni" keyFn={l => `bilateral.producersBtn`} />
                </div>
              </div>
              <SaveBar onSave={() => saveStrings(locData)} />
            </>
          )}

          {/* ── SERVICES ── */}
          {page === 'services' && (
            <>
              <h2 className="text-sm font-bold text-slate-800">Xidmətlər Bölməsi</h2>
              <MultiLocF label="Bölmə Başlığı" keyFn={l => `services.heading`} />
              <MultiLocF label="Alt Başlıq" keyFn={l => `services.subheading`} multi />
              <MultiLocF label='"Ətraflı" Buton Mətni' keyFn={l => `services.learnMore`} />
              <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase rounded mt-2">Outsourced Export Department Bloku</div>
              <MultiLocF label="Blok Başlığı" keyFn={l => `services.outsourcedTitle`} multi />
              <MultiLocF label="Etiket/Badge" keyFn={l => `services.outsourcedBadge`} />
              <MultiLocF label="Açıqlama" keyFn={l => `services.outsourcedDesc`} multi />
              <MultiLocF label="CTA Mətni" keyFn={l => `services.outsourcedCta`} />
              <SaveBar onSave={() => saveStrings(locData)} />
            </>
          )}

          {/* ── HOW IT WORKS ── */}
          {page === 'how_it_works' && (
            <>
              <h2 className="text-sm font-bold text-slate-800">Necə İşləyir Bölməsi</h2>
              <MultiLocF label="Bölmə Başlığı" keyFn={l => `howItWorks.heading`} />
              <MultiLocF label="Alt Başlıq" keyFn={l => `howItWorks.subheading`} multi />
              <MultiLocF label='"Tam Prosesə Bax" Butonu' keyFn={l => `howItWorks.seeFullProcess`} />
              <MultiLocF label="Alıcılar Etiketi" keyFn={l => `howItWorks.forBuyersLabel`} />
              <MultiLocF label="İstehsalçılar Etiketi" keyFn={l => `howItWorks.forProducersLabel`} />
              <MultiLocF label="İpucu Mətni" keyFn={l => `howItWorks.clickStepHint`} multi />
              <SaveBar onSave={() => saveStrings(locData)} />
            </>
          )}

          {/* ── FEATURED PRODUCTS ── */}
          {page === 'featured_products' && (
            <>
              <h2 className="text-sm font-bold text-slate-800">Öne Çıxan Məhsullar Bölməsi</h2>
              <MultiLocF label="Başlıq" keyFn={l => `featuredProducts.heading`} />
              <MultiLocF label="Alt Başlıq" keyFn={l => `featuredProducts.subheading`} multi />
              <MultiLocF label='"Bütün Məhsullar" Linki' keyFn={l => `featuredProducts.viewAll`} />
              <MultiLocF label='"Bu Məhsulu Sifariş Et" Butonu' keyFn={l => `featuredProducts.requestProduct`} />
              <MultiLocF label='"HS Kodu" Etiketi' keyFn={l => `featuredProducts.hsCodeLabel`} />
              <SaveBar onSave={() => saveStrings(locData)} />
            </>
          )}

          {/* ── WHY AZERBAIJAN ── */}
          {page === 'why_azerbaijan' && (
            <>
              <h2 className="text-sm font-bold text-slate-800">Niyə Azərbaycan Bölməsi</h2>
              <ImageF imgKey="WHY_AZERBAIJAN_IMAGE" label="Arxa Fon Şəkli" />
              <MultiLocF label="Başlıq" keyFn={l => `whyAzerbaijan.heading`} />
              <MultiLocF label="Açıqlama" keyFn={l => `whyAzerbaijan.desc`} multi />
              <MultiLocF label='"Ətraflı" Linki' keyFn={l => `whyAzerbaijan.learnMore`} />
              {[0,1,2,3].map(i => (
                <div key={i} className="bg-slate-100 p-3 rounded space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Xüsusiyyət {i+1}</div>
                  <MultiLocF label="Sətir 1" keyFn={l => `whyAzerbaijan.features[${i}].line1`} />
                  <MultiLocF label="Sətir 2" keyFn={l => `whyAzerbaijan.features[${i}].line2`} />
                  <MultiLocF label="Detal" keyFn={l => `whyAzerbaijan.features[${i}].detail`} multi />
                </div>
              ))}
              <SaveBar onSave={async () => { await saveContent(content); await saveStrings(locData); }} />
            </>
          )}

          {/* ── FOOTER ── */}
          {page === 'footer' && (
            <>
              <h2 className="text-sm font-bold text-slate-800">Footer</h2>
              <MultiLocF label="Açıqlama (Brand mandate)" keyFn={l => `footer.description`} multi />
              <MultiLocF label="HQ Başlığı" keyFn={l => `footer.hqTitle`} />
              <MultiLocF label="HQ Ünvanı" keyFn={l => `footer.hqAddress`} multi />
              <MultiLocF label='"Sürətli Keçidlər" Başlığı' keyFn={l => `footer.quickLinks`} />
              <MultiLocF label='"Uyğunluq" Başlığı' keyFn={l => `footer.complianceTitle`} />
              <MultiLocF label="Copyright Mətni" keyFn={l => `footer.rights`} multi />
              <SaveBar onSave={() => saveStrings(locData)} />
            </>
          )}

          {/* ── PRODUCTS CATALOG ── */}
          {page === 'products_catalog' && (
            <>
              <h2 className="text-sm font-bold text-slate-800">Məhsullar Kataloqu</h2>
              <p className="text-xs text-slate-500">Hər məhsulun şəkli, başlıqları, texniki məlumatları bütün dillərdə.</p>
              {(content.products || []).length === 0 && (
                <div className="bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700 rounded">
                  Məhsul override-ı hələ yoxdur. AZEXBUY saytında default məhsullar göstərilir.
                  Düzəliş etdikdə avtomatik saxlanır.
                </div>
              )}
              {(content.products || []).map((prod: any, idx: number) => (
                <div key={prod.id || idx} className="bg-white border border-slate-200 rounded overflow-hidden">
                  <button onClick={() => setExpandedId(expandedId === 'p'+idx ? null : 'p'+idx)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      {prod.image && <img src={prod.image} className="w-10 h-7 object-cover border border-slate-200 rounded" />}
                      <span className="text-xs font-bold text-slate-900">{prod.name?.EN || prod.id}</span>
                      <span className="text-[10px] font-mono text-slate-400">HS: {prod.hsCode}</span>
                    </div>
                    {expandedId === 'p'+idx ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>
                  {expandedId === 'p'+idx && (
                    <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">
                      <div className="bg-white border border-slate-200 rounded p-3">
                        <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Məhsul Şəkli</div>
                        <div className="flex items-center gap-3">
                          {prod.image && <img src={prod.image} className="w-20 h-14 object-cover rounded border cursor-pointer" onClick={() => setPreview(prod.image)} />}
                          <div className="space-y-1.5">
                            <input type="text" value={prod.image || ''} onChange={e => {
                              const p = [...(content.products || [])]; p[idx] = { ...p[idx], image: e.target.value };
                              setContent((c: any) => ({ ...c, products: p }));
                            }} placeholder="https://..." className="h-7 w-64 text-xs bg-slate-50 border border-slate-200 px-2 focus:outline-none focus:border-[#0f3156] font-mono rounded-sm" />
                            <button onClick={() => triggerUpload(`product_${prod.id}_img`)} className="h-7 px-3 flex items-center gap-1.5 text-xs font-bold bg-[#0f3156] text-white hover:bg-[#081c33] rounded-sm">
                              <Upload className="w-3 h-3" /> Yeni Şəkil
                            </button>
                          </div>
                        </div>
                      </div>
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
                      <SaveBar onSave={() => saveContent(content)} />
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* ── BUYER STEPS ── */}
          {page === 'buyer_steps' && (
            <>
              <h2 className="text-sm font-bold text-slate-800">Alıcı Addımları (7 Addım)</h2>
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
                      <SaveBar onSave={() => saveContent(content)} />
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* ── PRODUCER STEPS ── */}
          {page === 'producer_steps' && (
            <>
              <h2 className="text-sm font-bold text-slate-800">İstehsalçı Addımları (10 Mərhələ)</h2>
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
                      <SaveBar onSave={() => saveContent(content)} />
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
                          await fetch(`${OCTO}/api/azexbuy/images/${img.filename}`, { method: 'DELETE' });
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
