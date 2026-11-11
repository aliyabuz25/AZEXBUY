import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Save, Upload, RefreshCw, CheckCircle, ChevronDown, ChevronRight,
  Trash2, Plus, Eye, X, Image as ImgIcon, Package,
  Star, Footprints, Layers, LayoutTemplate, Menu as MenuIcon,
  Anchor, HelpCircle, Info, Map, Users, FileText, Pencil, Mail, ExternalLink, UserPlus,
  Search, Phone, Copy, RotateCcw, BarChart3, Target, Workflow, ShieldCheck, Globe2, TrendingUp, Building2, ArrowRight,
  MapPin, Share2,
} from 'lucide-react';
import { UiLanguage } from '../types';
import { flattenStrings } from '../utils/flattenStrings';
import { UI_STRINGS, ABOUT_PAGE_DEFAULT, SERVICES_PILLARS } from '../../../../src/data/translations';

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

async function apiPatch(path: string, body: any): Promise<{ ok: boolean; data: any }> {
  try {
    const r = await fetch(`${OCTO}${path}`, {
      method: 'PATCH',
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

async function apiDelete(path: string): Promise<boolean> {
  try {
    const r = await fetch(`${OCTO}${path}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    return r.ok;
  } catch { return false; }
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
  // ── Əsas Səhifə ──
  { key: 'navbar',            label: 'Naviqasiya Menyusu',         icon: MenuIcon,       group: 'Əsas Səhifə' },
  { key: 'hero',              label: 'Hero Bölməsi',               icon: LayoutTemplate, group: 'Əsas Səhifə' },
  { key: 'audience',          label: 'Alıcı və İstehsalçı Masası', icon: Users,          group: 'Əsas Səhifə' },
  { key: 'why_azexbuy',       label: 'Niyə AZEXBUY',               icon: Star,           group: 'Əsas Səhifə' },
  { key: 'services',          label: 'İxrac Xidmətləri',           icon: Anchor,         group: 'Əsas Səhifə' },
  { key: 'how_it_works',      label: 'Necə İşləyir (7 & 10)',      icon: HelpCircle,     group: 'Əsas Səhifə' },
  { key: 'featured_products', label: 'Önə Çıxan Məhsullar',        icon: FileText,       group: 'Əsas Səhifə' },
  { key: 'why_azerbaijan',    label: 'Niyə Azərbaycan',            icon: Map,            group: 'Əsas Səhifə' },
  { key: 'footer',            label: 'Footer & Rekvizitlər',       icon: Info,           group: 'Əsas Səhifə' },

  // ── Daxili Səhifələr ──
  { key: 'about',             label: 'Haqqımızda',                 icon: Info,           group: 'Daxili Səhifələr' },
  { key: 'team',              label: 'Komanda (Ekip)',             icon: Users,          group: 'Daxili Səhifələr' },
  { key: 'contact',           label: 'Əlaqə & Ofis Məlumatları',   icon: Phone,          group: 'Daxili Səhifələr' },

  // ── Kataloq və Axınlar ──
  { key: 'products_catalog',  label: 'Məhsullar Kataloqu',         icon: Package,        group: 'Kataloq və Axınlar' },
  { key: 'buyer_steps',       label: 'Alıcı Addımları',            icon: Footprints,     group: 'Kataloq və Axınlar' },
  { key: 'producer_steps',    label: 'İstehsalçı Addımları',       icon: Layers,         group: 'Kataloq və Axınlar' },

  // ── Qlobal Redaktor və Görsəllər ──
  { key: 'images',            label: 'Bütün Görsəllər',            icon: ImgIcon,        group: 'Qlobal Redaktor' },
  { key: 'media_library',     label: 'Şəkil Kitabxanası',          icon: ImgIcon,        group: 'Qlobal Redaktor' },
  { key: 'all_strings',       label: 'Bütün Sözlər (Axtarış)',     icon: FileText,       group: 'Qlobal Redaktor' },
] as const;
type PageKey = typeof CMS_PAGES[number]['key'];
const CMS_GROUPS = ['Əsas Səhifə', 'Daxili Səhifələr', 'Kataloq və Axınlar', 'Qlobal Redaktor'] as const;

const IMAGE_KEYS = [
  { key: 'HERO_IMAGE',                   label: 'Hero Arxa Fon',                    defaultUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9ZWqLLmb30gHFdTBf7cfY60pAMzYSTWRn2keRDZ7k8a3eQicd1I5xuOR1U44ux_eyOl79BjhxRaXdEbzovzXexqRo8oDy3gVECJAAKnDsq1DYgw7oR-p-U-VjFeMqmdwPl27SJVIP7hTVWchM1LYBR1EY2hy5C8iSkUcytv0qKVFgxmbifXswWW8UTnyUsQw5XBb81qNG2tremLOg_k5EPGCl-K_AWwSN8UQ3T1EN7HyePk3pvGD9' },
  { key: 'BUYER_CARD_IMAGE',             label: 'Alıcı Kartı Görseli',              defaultUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHfBjlFdQNaNAsP2RbAdqbBzskyL-GFgkaTpjwu0U6iT-t0tvmdQxrsHV7DOVkxLI4TCvj6qWpEawxqKJPqQE9f5GeXtwvTu7-fs3s495aRNM41LY0ardk4_DhtXk2RrKbiZgwssXvlrrI_EThET-4vRXO-9SbspxRcE3KXflGW-LnO8LzAq_bYYS10R-r010CzBLBwMqbd6slv40ntEvn3OyeauJszJaHkxnHTcGCq-0XAIDQmj6_' },
  { key: 'PRODUCER_CARD_IMAGE',          label: 'İstehsalçı Kartı Görseli',         defaultUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgrvRVBxN_YV05A8C2ZBQC2V2WHmgN9IrmvxhBvoVre7FKYjEbaR95Ew5PqX6-T-FG67u-0fHLCX6KeLtUrAkBIiJfWZGu7t3Ez2RyKvMerWTAHV1ROVLxhP4wE2oqLK-k9t1i6hrPmq-YJ-GDzjbqNDrNf2-SyjbXUmuQAJa5ScuKsRahZQdVKWyzFzRNPNYzxr3XOkiIb2BLWy4KJO-b-RWiNaaRqebQkQINqnQZfyBkDjpvxMId' },
  { key: 'BUYER_HERO_IMAGE',             label: 'Alıcı Portalı Hero Arxa Fon',      defaultUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1600&q=80' },
  { key: 'PRODUCER_HERO_IMAGE',          label: 'İstehsalçı Portalı Hero Arxa Fon', defaultUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&q=80' },
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
  <div className="bg-white border border-slate-200/90 rounded-lg p-3 space-y-1.5 shadow-2xs">
    <div className="flex items-center justify-between">
      <label className="text-xs font-semibold text-slate-800">{label}</label>
      <span className="text-[10px] text-slate-400 font-mono">{value.length} simvol</span>
    </div>
    {multi
      ? <textarea value={value} onChange={e => onChange(k, e.target.value)} rows={3}
          className="w-full text-xs text-slate-900 bg-slate-50/70 border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:bg-white focus:border-[#0f3156] focus:ring-1 focus:ring-[#0f3156]/20 transition-all resize-none" />
      : <input value={value} onChange={e => onChange(k, e.target.value)}
          className="w-full h-8 text-xs text-slate-900 bg-slate-50/70 border border-slate-200 rounded-md px-3 focus:outline-none focus:bg-white focus:border-[#0f3156] focus:ring-1 focus:ring-[#0f3156]/20 transition-all" />
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
  <div className="bg-white border border-slate-200/90 rounded-lg p-3.5 space-y-2.5 shadow-2xs">
    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
      <span className="text-xs font-bold text-slate-800">{label}</span>
      <span className="text-[10px] text-slate-400 font-mono select-all bg-slate-50 px-2 py-0.5 rounded border border-slate-200">{strKey}</span>
    </div>
    <div className="space-y-2">
      {LOCALES.map(l => {
        const val = locData[l]?.[strKey] || DEFAULT_STRINGS[l]?.[strKey] || '';
        return (
          <div key={l} className="flex items-start gap-2.5">
            <div className="w-10 sm:w-12 h-8 rounded bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px] font-mono flex items-center justify-center shrink-0 mt-0.5">
              {l}
            </div>
            <div className="flex-1 min-w-0">
              {multi ? (
                <textarea
                  value={val}
                  onChange={e => onChange(l, strKey, e.target.value)}
                  rows={2}
                  className="w-full text-xs bg-slate-50/70 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:bg-white focus:border-[#0f3156] focus:ring-1 focus:ring-[#0f3156]/20 transition-all resize-none"
                  placeholder={`${l} dilində daxil edin...`}
                />
              ) : (
                <input
                  value={val}
                  onChange={e => onChange(l, strKey, e.target.value)}
                  className="w-full h-8 text-xs bg-slate-50/70 border border-slate-200 rounded-md px-3 focus:outline-none focus:bg-white focus:border-[#0f3156] focus:ring-1 focus:ring-[#0f3156]/20 transition-all"
                  placeholder={`${l} dilində...`}
                />
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-mono self-center shrink-0 min-w-[32px] text-right">
              {val.length}c
            </span>
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
  <div className="flex items-center justify-between pt-4 pb-2 sticky bottom-0 bg-slate-50/90 backdrop-blur-sm border-t border-slate-200 mt-4 px-1">
    {saved
      ? <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-sm">
          <CheckCircle className="w-3.5 h-3.5" /> Dəyişikliklər uğurla saxlandı
        </div>
      : <div />}
    <button onClick={onSave} disabled={saving}
      className={`h-9 px-6 flex items-center gap-2 text-xs font-bold rounded-sm transition-all shadow-sm ${saved ? 'bg-emerald-600 text-white' : 'bg-[#0f3156] hover:bg-[#081c33] text-white'} disabled:opacity-60`}>
      <Save className="w-3.5 h-3.5" />
      {saving ? 'Saxlanılır...' : 'Saxla'}
    </button>
  </div>
));

// ── Home-page "Our Services" pillar editor ──────────────────────────────
interface PillarLocText { AZ?: string; EN?: string; TR?: string; RU?: string; AR?: string; ES?: string; }
interface PillarItem { EN?: string; AZ?: string; TR?: string; RU?: string; AR?: string; ES?: string; }
interface ServicePillarEditorProps {
  content: any;
  onChange: (updater: (prev: any) => any) => void;
  onSaveContent: (data: any) => Promise<void>;
  saving: boolean;
  saved: boolean;
}
const PILLAR_LOCS = ['EN', 'AZ', 'TR', 'RU', 'AR', 'ES'] as const;

const ServicePillarEditor = React.memo(({ content, onChange, onSaveContent, saving, saved }: ServicePillarEditorProps) => {
  // Seed from the saved content (or defaults) on first mount so the fields start populated
  const [pillars, setPillars] = useState<any[]>(
    content?.services?.length ? content.services : SERVICES_PILLARS
  );

  const applyChange = (nextPillars: any[]) => {
    setPillars(nextPillars);
    onChange((prev: any) => ({ ...prev, services: nextPillars }));
  };

  const updatePillar = (id: string, updater: (p: any) => any) => {
    applyChange(pillars.map((p: any) => (p.id === id ? updater(p) : p)));
  };

  const setPillarLoc = (id: string, field: 'title' | 'subtitle', loc: string, value: string) => {
    updatePillar(id, (p: any) => ({ ...p, [field]: { ...(p[field] || {}), [loc]: value } }));
  };

  const setPillarTurnaround = (id: string, value: string) => {
    updatePillar(id, (p: any) => ({ ...p, turnaround: value }));
  };

  const setPillarItemLoc = (id: string, idx: number, loc: string, value: string) => {
    updatePillar(id, (p: any) => {
      const items = [...(p.items || [])];
      items[idx] = { ...items[idx], [loc]: value };
      return { ...p, items };
    });
  };

  return (
    <div className="space-y-4">
      {pillars.map((p: any) => (
        <div key={p.id} className="border border-slate-200/90 rounded-lg p-4 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <i className={`${p.iconClass} text-base text-slate-500`}></i>
            <span className="text-xs font-bold text-slate-800">{p.id}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {p.turnaround ? `· ${p.turnaround}` : '· Məhdudiyyət müddəti təyin edilməyib'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PILLAR_LOCS.map((loc) => (
              <div key={loc} className="flex items-start gap-2">
                <div className="w-8 h-7 rounded bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[10px] font-mono flex items-center justify-center shrink-0">
                  {loc}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <input
                    value={(p.title as PillarLocText)?.[loc] || ''}
                    onChange={(e) => setPillarLoc(p.id, 'title', loc, e.target.value)}
                    placeholder={`Başlıq (${loc})`}
                    className="w-full h-7 text-[11px] bg-slate-50/70 border border-slate-200 rounded px-2 focus:outline-none focus:bg-white focus:border-[#0f3156]"
                  />
                  <input
                    value={(p.subtitle as PillarLocText)?.[loc] || ''}
                    onChange={(e) => setPillarLoc(p.id, 'subtitle', loc, e.target.value)}
                    placeholder={`Tam izah (${loc})`}
                    className="w-full h-7 text-[11px] bg-slate-50/70 border border-slate-200 rounded px-2 focus:outline-none focus:bg-white focus:border-[#0f3156]"
                  />
                </div>
              </div>
            ))}
          </div>
          {/* Turnaround */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-7 rounded bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[10px] font-mono flex items-center justify-center shrink-0">
              SLA
            </div>
            <input
              value={p.turnaround || ''}
              onChange={(e) => setPillarTurnaround(p.id, e.target.value)}
              placeholder="Turnaround müddəti (məs: 5 Business Days)"
              className="flex-1 h-7 text-[11px] bg-slate-50/70 border border-slate-200 rounded px-2 focus:outline-none focus:bg-white focus:border-[#0f3156]"
            />
          </div>
          {/* Məsələlər (items) — each row lists all 6 locales compactly */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Məsələlər (6 dil × {p.items?.length || 0})
              </span>
              <button
                type="button"
                onClick={() => {
                  updatePillar(p.id, (prev: any) => ({
                    ...prev,
                    items: [...(prev.items || []), { EN: '', AZ: '', TR: '', RU: '', AR: '', ES: '' }]
                  }));
                }}
                className="h-6 px-2 flex items-center gap-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
              >
                <Plus className="w-3 h-3" /> Məsələ Əlavə Et
              </button>
            </div>
            <div className="space-y-1.5">
              {(p.items || []).map((item: PillarItem, idx: number) => (
                <div key={idx} className="border border-slate-100 rounded-sm p-2 bg-slate-50/50 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{idx + 1}. {item.EN || item.AZ || 'Yeni maddə'}</span>
                    <button
                      type="button"
                      title="Sil"
                      onClick={() => {
                        updatePillar(p.id, (prev: any) => ({
                          ...prev,
                          items: (prev.items || []).filter((_: any, i: number) => i !== idx)
                        }));
                      }}
                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PILLAR_LOCS.map((loc) => (
                      <input
                        key={loc}
                        value={(item as any)?.[loc] || ''}
                        onChange={(e) => setPillarItemLoc(p.id, idx, loc, e.target.value)}
                        placeholder={loc}
                        className="h-6 text-[10px] bg-white border border-slate-200 rounded px-1.5 focus:outline-none focus:border-[#0f3156] w-full"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onSaveContent({ ...content, services: pillars })}
        disabled={saving}
        className="h-8 px-4 flex items-center gap-2 text-xs font-bold rounded-sm bg-[#0f3156] hover:bg-[#081c33] text-white disabled:opacity-60"
      >
        <Save className="w-3 h-3" />
        {saving ? 'Saxlanılır...' : 'Kartları Saxla'}
      </button>
      {saved && <div className="text-xs text-emerald-700 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Dəyişikliklər saxlanıldı</div>}
    </div>
  );
});

interface LocaleTabsProps {
  locale: Loc;
  onSelect: (l: Loc) => void;
}
const LocaleTabs = React.memo(({ locale, onSelect }: LocaleTabsProps) => (
  <div className="flex items-center gap-1.5 mb-4 p-1 bg-slate-100/80 rounded-lg w-fit border border-slate-200/60 select-none">
    {LOCALES.map(l => (
      <button
        key={l}
        onClick={() => onSelect(l)}
        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer ${
          locale === l
            ? 'bg-[#0f3156] text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
        }`}
      >
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
      <div className="relative w-full bg-slate-100/80 cursor-pointer overflow-hidden flex items-center justify-center p-2" style={{ height: '170px' }}
        onClick={() => url && onPreview(proxyUrl)}>
        {proxyUrl
          ? <img src={proxyUrl} alt={label} className="max-w-full max-h-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          : <div className="w-full h-full flex items-center justify-center"><ImgIcon className="w-8 h-8 text-slate-300" /></div>
        }
        {url && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="bg-white/95 shadow-sm px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 rounded-sm">
              <Eye className="w-3.5 h-3.5" /> Tam Görünüş
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
  const [page, setPage] = useState<PageKey>('navbar');
  const [locale, setLocale] = useState<Loc>('EN');

  const [locData, setLocData] = useState<Record<string, Record<string, string>>>(DEFAULT_STRINGS);
  const [content, setContent] = useState<any>({});
  const [images, setImages] = useState<any[]>([]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [stringSearch, setStringSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [newKeyName, setNewKeyName] = useState('');
  const [showAddKey, setShowAddKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const allKeys = React.useMemo(() => {
    const set = new Set<string>();
    for (const loc of LOCALES) {
      if (DEFAULT_STRINGS[loc]) {
        Object.keys(DEFAULT_STRINGS[loc]).forEach(k => set.add(k));
      }
      if (locData[loc]) {
        Object.keys(locData[loc]).forEach(k => set.add(k));
      }
    }
    return Array.from(set).sort();
  }, [locData]);

  const filteredKeys = React.useMemo(() => {
    const query = stringSearch.trim().toLowerCase();
    return allKeys.filter(k => {
      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'other') {
          const standardPrefixes = ['nav.', 'hero.', 'whyAzexbuy.', 'bilateral.', 'services.', 'howItWorks.', 'featuredProducts.', 'whyAzerbaijan.', 'footer.'];
          if (standardPrefixes.some(p => k.startsWith(p))) return false;
        } else if (!k.startsWith(`${selectedCategory}.`)) {
          return false;
        }
      }
      if (!query) return true;
      if (k.toLowerCase().includes(query)) return true;
      for (const loc of LOCALES) {
        const val = locData[loc]?.[k] || DEFAULT_STRINGS[loc]?.[k] || '';
        if (val.toLowerCase().includes(query)) return true;
      }
      return false;
    });
  }, [allKeys, stringSearch, selectedCategory, locData]);

  const handleCopyKey = (k: string) => {
    navigator.clipboard?.writeText(k);
    setCopiedKey(k);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleAddCustomKey = () => {
    const trimmed = newKeyName.trim();
    if (!trimmed) return;
    setLocData(prev => {
      const next = { ...prev };
      for (const loc of LOCALES) {
        next[loc] = { ...(next[loc] || {}), [trimmed]: next[loc]?.[trimmed] || '' };
      }
      return next;
    });
    setNewKeyName('');
    setShowAddKey(false);
    setStringSearch(trimmed);
  };

  const handleResetKey = (k: string) => {
    if (!window.confirm(`"${k}" açarını varsayılan dəyərinə qaytarmaq istəyirsiniz?`)) return;
    setLocData(prev => {
      const next = { ...prev };
      for (const loc of LOCALES) {
        if (next[loc]) {
          const copy = { ...next[loc] };
          delete copy[k];
          next[loc] = copy;
        }
      }
      return next;
    });
  };

  // Team members state
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [showNewMember, setShowNewMember] = useState(false);
  const [newMember, setNewMember] = useState({ id: '', name: '', photo: '', email: '', linkedin: '', sortOrder: 0, isActive: true, role: { AZ:'', EN:'', TR:'', RU:'', AR:'', ES:'' }, bio: { AZ:'', EN:'', TR:'', RU:'', AR:'', ES:'' } });

  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const loadTeam = useCallback(async () => {
    setTeamLoading(true);
    const tm = await apiGet('/api/azexbuy/team?fresh=1');
    if (Array.isArray(tm)) setTeamMembers(tm);
    setTeamLoading(false);
  }, []);

  const load = useCallback(async () => {
    const [l, c, imgs, tm] = await Promise.all([
      apiGet('/api/azexbuy/localization'),
      apiGet('/api/azexbuy/content'),
      apiGet('/api/azexbuy/images'),
      apiGet('/api/azexbuy/team?fresh=1'),
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
    if (Array.isArray(tm)) setTeamMembers(tm);
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

  const handleToggleMemberActive = async (member: any) => {
    const updated = !member.isActive;
    const res = await apiPatch(`/api/azexbuy/team/${member.id}`, { isActive: updated });
    if (res.ok) {
      setTeamMembers(prev => prev.map(m => m.id === member.id ? { ...m, isActive: updated } : m));
      flash();
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!window.confirm('Bu komanda üzvünü silmək istədiyinizdən əminsiniz?')) return;
    const ok = await apiDelete(`/api/azexbuy/team/${id}`);
    if (ok) {
      setTeamMembers(prev => prev.filter(m => m.id !== id));
      flash();
    }
  };

  const handleSaveNewMember = async () => {
    if (!newMember.name) { alert('Ad və Soyad daxil edilməlidir'); return; }
    const id = newMember.id || `tm-${Date.now().toString(36)}`;
    const payload = { ...newMember, id };
    const res = await apiPost('/api/azexbuy/team', payload);
    if (res.ok) {
      setShowNewMember(false);
      setNewMember({ id: '', name: '', photo: '', email: '', linkedin: '', sortOrder: teamMembers.length + 1, isActive: true, role: { AZ:'', EN:'', TR:'', RU:'', AR:'', ES:'' }, bio: { AZ:'', EN:'', TR:'', RU:'', AR:'', ES:'' } });
      loadTeam();
      flash();
    } else {
      alert('Saxlama xətası baş verdi.');
    }
  };

  const handleSaveEditMember = async () => {
    if (!editingMember || !editingMember.name) return;
    const res = await apiPatch(`/api/azexbuy/team/${editingMember.id}`, editingMember);
    if (res.ok) {
      setEditingMember(null);
      loadTeam();
      flash();
    } else {
      alert('Yeniləmə xətası baş verdi.');
    }
  };

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
        if (key === 'team_new') {
          setNewMember(prev => ({ ...prev, photo: url }));
        } else if (key === 'team_edit') {
          setEditingMember((prev: any) => ({ ...prev, photo: url }));
        } else {
          const curAbout = content.about ? { ...ABOUT_PAGE_DEFAULT, ...content.about } : { ...ABOUT_PAGE_DEFAULT };
          if (key === 'about_whoWeAreImage' || key === 'ABOUT_WHO_WE_ARE_IMAGE') {
            curAbout.whoWeAre = { ...(curAbout.whoWeAre || {}), image: url };
          } else if (key === 'about_missionImage' || key === 'ABOUT_MISSION_IMAGE') {
            curAbout.missionVision = { ...(curAbout.missionVision || {}), missionImage: url };
          } else if (key === 'about_visionImage' || key === 'ABOUT_VISION_IMAGE') {
            curAbout.missionVision = { ...(curAbout.missionVision || {}), visionImage: url };
          } else if (key.startsWith('about_sector_') || key.startsWith('ABOUT_SECTOR_')) {
            const numStr = key.replace('about_sector_', '').replace('ABOUT_SECTOR_', '').replace('_IMAGE', '');
            const sIdx = parseInt(numStr, 10);
            if (!isNaN(sIdx) && curAbout.sectors?.items?.[sIdx]) {
              curAbout.sectors.items[sIdx] = { ...curAbout.sectors.items[sIdx], image: url };
            }
          }
          const updated = {
            ...content,
            images: { ...(content.images || {}), [key]: url },
            about: curAbout,
          };
          await saveContent(updated);
          load();
        }
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
      <div className="bg-white border-b border-slate-200 px-3 sm:px-5 py-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm font-bold text-slate-900">AZEXBUY — Tam Məzmun İdarəetməsi</h1>
          <p className="text-[10px] text-slate-400 mt-0.5">Sitenin başdan sona bütün mətnləri, görsəlləri, məhsulları düzənleyin</p>
        </div>
        <button onClick={load} className="h-7 px-3 flex items-center gap-1.5 text-xs border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-sm cursor-pointer shrink-0">
          <RefreshCw className="w-3 h-3" /> <span className="hidden sm:inline">Yenilə</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Desktop Left Nav: Smooth, grouped with Lucide icons */}
        <div className="hidden md:flex flex-col w-60 shrink-0 bg-white border-r border-slate-200/80 overflow-y-auto py-2.5 px-2 space-y-3 select-none">
          {CMS_GROUPS.map(grp => {
            const pagesInGroup = CMS_PAGES.filter(p => p.group === grp);
            return (
              <div key={grp} className="space-y-0.5">
                <div className="px-2.5 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  {grp}
                </div>
                {pagesInGroup.map(p => {
                  const Icon = p.icon;
                  const isActive = page === p.key;
                  return (
                    <button
                      key={p.key}
                      onClick={() => setPage(p.key as PageKey)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-all duration-150 text-left cursor-pointer ${
                        isActive
                          ? 'bg-[#0f3156] text-white shadow-2xs font-semibold'
                          : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate flex-1 tracking-tight">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Mobile Horizontal Pill Strip with Lucide icons */}
        <div className="flex md:hidden w-full bg-white border-b border-slate-200 overflow-x-auto p-2 gap-1.5 no-scrollbar shrink-0 select-none">
          {CMS_PAGES.map(p => {
            const Icon = p.icon;
            const isActive = page === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setPage(p.key as PageKey)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#0f3156] text-white shadow-2xs'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 pb-4">

          {/* ── ALL STRINGS (UNIVERSAL SEARCH & LIVE EDITOR) ── */}
          {page === 'all_strings' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-[#0f3156]/10 text-[#0f3156] flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Bütün Sayt Mətnləri (Universal Canlı Redaktə)</h2>
                    <p className="text-xs text-slate-500">Saytın istənilən mətnini açar sözlə və ya açar adı ilə tapın və 6 dildə redaktə edin.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddKey(!showAddKey)}
                  className="h-8 px-3.5 flex items-center gap-1.5 text-xs font-bold bg-[#0f3156] text-white hover:bg-[#081c33] rounded-md shrink-0 self-start sm:self-auto cursor-pointer shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Yeni Mətn Açarı
                </button>
              </div>

              {showAddKey && (
                <div className="bg-white border border-slate-300 rounded-lg p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Yeni Xüsusi Mətn Açarı Əlavə Et</span>
                    <button onClick={() => setShowAddKey(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                  </div>
                  <p className="text-[11px] text-slate-500">Nöqtəli formatda açar adı yazın (məs: <code>custom.promoBanner</code>, <code>buyers.urgentNotice</code>). Bu açar dərhal 6 dildə redaktə edilə bilər.</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={e => setNewKeyName(e.target.value)}
                      placeholder="məs: header.bannerNote"
                      className="flex-1 h-8 text-xs bg-slate-50 border border-slate-200 px-3 rounded-md font-mono focus:outline-none focus:border-[#0f3156]"
                    />
                    <button
                      onClick={handleAddCustomKey}
                      disabled={!newKeyName.trim()}
                      className="h-8 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-md cursor-pointer"
                    >
                      Əlavə Et
                    </button>
                  </div>
                </div>
              )}

              {/* Search & Filter Toolbar */}
              <div className="bg-white border border-slate-200/90 rounded-lg p-3 space-y-3 shadow-2xs">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={stringSearch}
                    onChange={e => setStringSearch(e.target.value)}
                    placeholder="İstənilən söz və ya açar adı axtarın (məs: KOBİA, Hazelnuts, hero.title, Bakı, Escrow...)"
                    className="w-full h-9 pl-9 pr-8 text-xs bg-slate-50/80 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:border-[#0f3156] focus:ring-1 focus:ring-[#0f3156]/20 transition-all"
                  />
                  {stringSearch && (
                    <button onClick={() => setStringSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                  {[
                    { key: 'ALL', label: 'Bütün Mətnlər' },
                    { key: 'nav', label: 'Naviqasiya' },
                    { key: 'hero', label: 'Hero' },
                    { key: 'whyAzexbuy', label: 'Niyə AZEXBUY' },
                    { key: 'bilateral', label: 'Alıcı / İstehsalçı' },
                    { key: 'services', label: 'Xidmətlər' },
                    { key: 'howItWorks', label: 'Necə İşləyir' },
                    { key: 'featuredProducts', label: 'Məhsullar' },
                    { key: 'whyAzerbaijan', label: 'Niyə Azərbaycan' },
                    { key: 'footer', label: 'Footer & Ünvan' },
                    { key: 'other', label: 'Digər / Xüsusi' },
                  ].map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${selectedCategory === cat.key ? 'bg-[#0f3156] text-white shadow-2xs' : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/80'}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Göstərilən nəticələr: <strong className="text-slate-800">{filteredKeys.length}</strong> / {allKeys.length} mətn açarı</span>
                  {stringSearch && <span className="text-amber-600 font-medium">"{stringSearch}" süzgəci aktivdir</span>}
                </div>
              </div>

              {/* Key Cards */}
              {filteredKeys.length === 0 ? (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-lg text-slate-500 text-xs">
                  Axtarışınıza uyğun heç bir mətn tapılmadı. Fərqli söz və ya açar axtarın.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredKeys.map(k => {
                    const isModified = LOCALES.some(loc => {
                      const curVal = locData[loc]?.[k];
                      const defVal = DEFAULT_STRINGS[loc]?.[k];
                      return curVal !== undefined && curVal !== defVal;
                    });
                    const isLong = LOCALES.some(loc => {
                      const val = locData[loc]?.[k] || DEFAULT_STRINGS[loc]?.[k] || '';
                      return val.length > 50 || val.includes('\n');
                    });

                    return (
                      <div key={k} className="bg-white border border-slate-200/90 rounded-lg p-3.5 shadow-2xs space-y-2.5">
                        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-800 select-all">{k}</span>
                            <button
                              onClick={() => handleCopyKey(k)}
                              title="Açar adını kopyala"
                              className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            {copiedKey === k && (
                              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Kopyalandı!</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {isModified && (
                              <span className="text-[9px] px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 font-bold rounded-sm">
                                DƏYİŞDİRİLDİ
                              </span>
                            )}
                            {isModified && (
                              <button
                                onClick={() => handleResetKey(k)}
                                title="Varsayılan dəyərə qaytar"
                                className="text-[10px] text-slate-400 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                              >
                                <RotateCcw className="w-3 h-3" /> Sıfırla
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 6 Locales Inputs - Alt-Alta Userfriendly Stack */}
                        <div className="space-y-2 pt-0.5">
                          {LOCALES.map(loc => {
                            const val = locData[loc]?.[k] !== undefined ? locData[loc][k] : (DEFAULT_STRINGS[loc]?.[k] || '');
                            return (
                              <div key={loc} className="flex items-start gap-2.5 bg-slate-50/70 border border-slate-200/80 rounded-md p-2">
                                <div className="w-10 sm:w-12 h-8 rounded bg-white border border-slate-200 text-slate-700 font-bold text-[11px] font-mono flex items-center justify-center shrink-0 mt-0.5">
                                  {loc}
                                </div>
                                <div className="flex-1 min-w-0">
                                  {isLong ? (
                                    <textarea
                                      value={val}
                                      onChange={e => handleMultiLocChange(loc, k, e.target.value)}
                                      rows={2}
                                      className="w-full text-xs bg-white border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#0f3156] focus:ring-1 focus:ring-[#0f3156]/20 transition-all resize-none"
                                      placeholder={`${loc} dilində mətni daxil edin...`}
                                    />
                                  ) : (
                                    <input
                                      type="text"
                                      value={val}
                                      onChange={e => handleMultiLocChange(loc, k, e.target.value)}
                                      className="w-full h-8 text-xs bg-white border border-slate-200 rounded px-2.5 focus:outline-none focus:border-[#0f3156] focus:ring-1 focus:ring-[#0f3156]/20 transition-all"
                                      placeholder={`${loc} dilində...`}
                                    />
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono self-center shrink-0 min-w-[32px] text-right">
                                  {val.length}c
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <SaveBar onSave={() => saveStrings(locData)} saving={saving} saved={saved} />
            </>
          )}

          {/* ── CONTACT & OFFICE DETAILS ── */}
          {page === 'contact' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-[#0f3156]/10 text-[#0f3156] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Əlaqə, Ofis və Rekvizit Məlumatları</h2>
                    <p className="text-xs text-slate-500">Saytın footer, əlaqə bölmələri və rəsmi ünvan məlumatlarını bütün 6 dildə tənzimləyin.</p>
                  </div>
                </div>
              </div>

              {/* Section 1: Rəsmi Əlaqə Kanalları */}
              <div className="bg-white border border-slate-200/90 rounded-lg p-4 space-y-4 shadow-2xs">
                <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0f3156]" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase font-mono">1. Rəsmi Əlaqə Kanalları & Qaynar Xətlər</h3>
                    <p className="text-[11px] text-slate-400">Footer və Əlaqə Masasında görünən telefon və poçt ünvanları</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Əsas Telefon (Direct Trade Desk)</label>
                    <input
                      type="text"
                      value={content.contact?.phone || '+994 (12) 404 85 00'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), phone: v } }));
                      }}
                      placeholder="+994 (12) 404 85 00"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">İkinci Telefon / Qaynar Xətt</label>
                    <input
                      type="text"
                      value={content.contact?.phoneAlt || '+994 (50) 290 45 00'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), phoneAlt: v } }));
                      }}
                      placeholder="+994 (50) 290 45 00"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Əsas Elektron Poçt (Official Dispatch)</label>
                    <input
                      type="text"
                      value={content.contact?.email || 'desk@azexbuy.az'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), email: v } }));
                      }}
                      placeholder="desk@azexbuy.az"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Satınalma / Tender Emaili</label>
                    <input
                      type="text"
                      value={content.contact?.emailAlt || 'procurement@azexbuy.az'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), emailAlt: v } }));
                      }}
                      placeholder="procurement@azexbuy.az"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">İş Qrafiki & Saatları</label>
                    <input
                      type="text"
                      value={content.contact?.hours || '09:00 – 18:00 (AZT / UTC+4) · B.e – Cümə'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), hours: v } }));
                      }}
                      placeholder="09:00 – 18:00 (AZT / UTC+4)"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Baş Qərargah və Hüquqi Məlumatlar (6 Dillərdə) */}
              <div className="space-y-3">
                <div className="bg-slate-100 p-2.5 rounded text-xs font-bold text-slate-700">
                  2. Baş Qərargah Ünvanı və Çoxdilli Rekvizitlər (6 Dildə)
                </div>

                <MultiLocF label="Qərargah Bölmə Başlığı" strKey="footer.hqTitle" locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label="Tam Ünvan (Baku Alliance Business Center...)" strKey="footer.hqAddress" multi locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label="Şirkət Mandatı / Qısa Təsvir" strKey="footer.description" multi locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label="Müəllif Hüquqları (Copyright)" strKey="footer.rights" multi locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label='"Sürətli Keçidlər" Bölmə Başlığı' strKey="footer.quickLinks" locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label='"Tənzimləmə və Uyğunluq" Başlığı' strKey="footer.complianceTitle" locData={locData} onChange={handleMultiLocChange} />
              </div>

              <SaveBar
                onSave={async () => {
                  setSaving(true);
                  await Promise.all([
                    apiPost('/api/azexbuy/localization', locData),
                    apiPost('/api/azexbuy/content', content),
                  ]);
                  flash();
                  setSaving(false);
                }}
                saving={saving}
                saved={saved}
              />
            </>
          )}

          {/* ── IMAGES ── */}
          {page === 'images' && (
            <>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-7 h-7 rounded bg-[#0f3156]/10 text-[#0f3156] flex items-center justify-center shrink-0">
                  <ImgIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Bütün Sayt Görsəlləri</h2>
                  <p className="text-xs text-slate-500">Əsas səhifə, haqqımızda və ixrac sektorlarının 15 əsas şəklini buradan idarə edin.</p>
                </div>
              </div>
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
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-7 h-7 rounded bg-[#0f3156]/10 text-[#0f3156] flex items-center justify-center shrink-0">
                  <MenuIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Naviqasiya Menyusu</h2>
                  <p className="text-xs text-slate-500">Saytın yuxarı menyusundakı keçidlərin mətnlərini 6 dildə tənzimləyin.</p>
                </div>
              </div>
              <LocaleTabs locale={locale} onSelect={setLocale} />
              <div className="space-y-2.5">
                {[
                  { k: 'home', label: 'Ana Səhifə (Home)' },
                  { k: 'forBuyers', label: 'Alıcılar Üçün (For Buyers)' },
                  { k: 'forProducers', label: 'İstehsalçılar Üçün (For Producers)' },
                  { k: 'services', label: 'Xidmətlər (Services)' },
                  { k: 'products', label: 'Məhsullar (Products)' },
                  { k: 'howItWorks', label: 'Necə İşləyir (How It Works)' },
                  { k: 'aboutUs', label: 'Haqqımızda (About Us)' },
                  { k: 'insights', label: 'Bazar İcmalları (Insights)' },
                  { k: 'contact', label: 'Əlaqə (Contact)' },
                  { k: 'requestQuote', label: 'Qiymət Sorğusu Butonu (Request Quote)' },
                  { k: 'dossiers', label: 'Dosyelər / Sənədlər (Dossiers)' },
                ].map(item => (
                  <F key={item.k} label={item.label} k={`nav.${item.k}`} value={str(`nav.${item.k}`)} onChange={handleStrChange} />
                ))}
              </div>
              <SaveBar onSave={() => saveStrings(locData)} saving={saving} saved={saved} />
            </>
          )}

          {/* ── CONTACT & OFFICE DETAILS ── */}
          {page === 'contact' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-[#0f3156]/10 text-[#0f3156] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Əlaqə, Ofis və Rekvizit Məlumatları</h2>
                    <p className="text-xs text-slate-500">Saytın footer, əlaqə bölmələri və rəsmi ünvan məlumatlarını bütün 6 dildə tənzimləyin.</p>
                  </div>
                </div>
              </div>

              {/* Section 1: Rəsmi Əlaqə Kanalları */}
              <div className="bg-white border border-slate-200/90 rounded-lg p-4 space-y-4 shadow-2xs">
                <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0f3156]" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase font-mono">1. Rəsmi Əlaqə Kanalları & Qaynar Xətlər</h3>
                    <p className="text-[11px] text-slate-400">Footer və Əlaqə Masasında görünən telefon və poçt ünvanları</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Əsas Telefon (Direct Trade Desk)</label>
                    <input
                      type="text"
                      value={content.contact?.phone || '+994 (12) 404 85 00'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), phone: v } }));
                      }}
                      placeholder="+994 (12) 404 85 00"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">İkinci Telefon / Qaynar Xətt</label>
                    <input
                      type="text"
                      value={content.contact?.phoneAlt || '+994 (50) 290 45 00'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), phoneAlt: v } }));
                      }}
                      placeholder="+994 (50) 290 45 00"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Əsas Elektron Poçt (Official Dispatch)</label>
                    <input
                      type="text"
                      value={content.contact?.email || 'desk@azexbuy.az'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), email: v } }));
                      }}
                      placeholder="desk@azexbuy.az"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Satınalma / Tender Emaili</label>
                    <input
                      type="text"
                      value={content.contact?.emailAlt || 'procurement@azexbuy.az'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), emailAlt: v } }));
                      }}
                      placeholder="procurement@azexbuy.az"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">İş Qrafiki & Saatları</label>
                    <input
                      type="text"
                      value={content.contact?.hours || '09:00 – 18:00 (AZT / UTC+4) · B.e – Cümə'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), hours: v } }));
                      }}
                      placeholder="09:00 – 18:00 (AZT / UTC+4)"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Baş Qərargah və Hüquqi Məlumatlar (6 Dillərdə) */}
              <div className="space-y-3">
                <div className="bg-slate-100 p-2.5 rounded text-xs font-bold text-slate-700">
                  2. Baş Qərargah Ünvanı və Çoxdilli Rekvizitlər (6 Dildə)
                </div>

                <MultiLocF label="Qərargah Bölmə Başlığı" strKey="footer.hqTitle" locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label="Tam Ünvan (Baku Alliance Business Center...)" strKey="footer.hqAddress" multi locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label="Şirkət Mandatı / Qısa Təsvir" strKey="footer.description" multi locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label="Müəllif Hüquqları (Copyright)" strKey="footer.rights" multi locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label='"Sürətli Keçidlər" Bölmə Başlığı' strKey="footer.quickLinks" locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label='"Tənzimləmə və Uyğunluq" Başlığı' strKey="footer.complianceTitle" locData={locData} onChange={handleMultiLocChange} />
              </div>

              <SaveBar
                onSave={async () => {
                  setSaving(true);
                  await Promise.all([
                    apiPost('/api/azexbuy/localization', locData),
                    apiPost('/api/azexbuy/content', content),
                  ]);
                  flash();
                  setSaving(false);
                }}
                saving={saving}
                saved={saved}
              />
            </>
          )}

          {/* ── HERO ── */}
          {page === 'hero' && (
            <>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-7 h-7 rounded bg-[#0f3156]/10 text-[#0f3156] flex items-center justify-center shrink-0">
                  <LayoutTemplate className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Hero Bölməsi</h2>
                  <p className="text-xs text-slate-500">Əsas səhifənin ən üstündəki arxa fon şəkli, şüarlar və hərəkətə çağırış (CTA) butonları.</p>
                </div>
              </div>
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

          {/* ── CONTACT & OFFICE DETAILS ── */}
          {page === 'contact' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-[#0f3156]/10 text-[#0f3156] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Əlaqə, Ofis və Rekvizit Məlumatları</h2>
                    <p className="text-xs text-slate-500">Saytın footer, əlaqə bölmələri və rəsmi ünvan məlumatlarını bütün 6 dildə tənzimləyin.</p>
                  </div>
                </div>
              </div>

              {/* Section 1: Rəsmi Əlaqə Kanalları */}
              <div className="bg-white border border-slate-200/90 rounded-lg p-4 space-y-4 shadow-2xs">
                <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0f3156]" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase font-mono">1. Rəsmi Əlaqə Kanalları & Qaynar Xətlər</h3>
                    <p className="text-[11px] text-slate-400">Footer və Əlaqə Masasında görünən telefon və poçt ünvanları</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Əsas Telefon (Direct Trade Desk)</label>
                    <input
                      type="text"
                      value={content.contact?.phone || '+994 (12) 404 85 00'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), phone: v } }));
                      }}
                      placeholder="+994 (12) 404 85 00"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">İkinci Telefon / Qaynar Xətt</label>
                    <input
                      type="text"
                      value={content.contact?.phoneAlt || '+994 (50) 290 45 00'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), phoneAlt: v } }));
                      }}
                      placeholder="+994 (50) 290 45 00"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Əsas Elektron Poçt (Official Dispatch)</label>
                    <input
                      type="text"
                      value={content.contact?.email || 'desk@azexbuy.az'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), email: v } }));
                      }}
                      placeholder="desk@azexbuy.az"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Satınalma / Tender Emaili</label>
                    <input
                      type="text"
                      value={content.contact?.emailAlt || 'procurement@azexbuy.az'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), emailAlt: v } }));
                      }}
                      placeholder="procurement@azexbuy.az"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">İş Qrafiki & Saatları</label>
                    <input
                      type="text"
                      value={content.contact?.hours || '09:00 – 18:00 (AZT / UTC+4) · B.e – Cümə'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), hours: v } }));
                      }}
                      placeholder="09:00 – 18:00 (AZT / UTC+4)"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Baş Qərargah və Hüquqi Məlumatlar (6 Dillərdə) */}
              <div className="space-y-3">
                <div className="bg-slate-100 p-2.5 rounded text-xs font-bold text-slate-700">
                  2. Baş Qərargah Ünvanı və Çoxdilli Rekvizitlər (6 Dildə)
                </div>

                <MultiLocF label="Qərargah Bölmə Başlığı" strKey="footer.hqTitle" locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label="Tam Ünvan (Baku Alliance Business Center...)" strKey="footer.hqAddress" multi locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label="Şirkət Mandatı / Qısa Təsvir" strKey="footer.description" multi locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label="Müəllif Hüquqları (Copyright)" strKey="footer.rights" multi locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label='"Sürətli Keçidlər" Bölmə Başlığı' strKey="footer.quickLinks" locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label='"Tənzimləmə və Uyğunluq" Başlığı' strKey="footer.complianceTitle" locData={locData} onChange={handleMultiLocChange} />
              </div>

              <SaveBar
                onSave={async () => {
                  setSaving(true);
                  await Promise.all([
                    apiPost('/api/azexbuy/localization', locData),
                    apiPost('/api/azexbuy/content', content),
                  ]);
                  flash();
                  setSaving(false);
                }}
                saving={saving}
                saved={saved}
              />
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
                  <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase rounded">Alıcı Portalı Hero Arxa Fon</div>
                  <ImageField imgKey="BUYER_HERO_IMAGE" label="Alıcı Portalı Hero Arxa Fon Şəkli"
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
                  <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase rounded">İstehsalçı Portalı Hero Arxa Fon</div>
                  <ImageField imgKey="PRODUCER_HERO_IMAGE" label="İstehsalçı Portalı Hero Arxa Fon Şəkli"
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

          {/* ── CONTACT & OFFICE DETAILS ── */}
          {page === 'contact' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-[#0f3156]/10 text-[#0f3156] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Əlaqə, Ofis və Rekvizit Məlumatları</h2>
                    <p className="text-xs text-slate-500">Saytın footer, əlaqə bölmələri və rəsmi ünvan məlumatlarını bütün 6 dildə tənzimləyin.</p>
                  </div>
                </div>
              </div>

              {/* Section 1: Rəsmi Əlaqə Kanalları */}
              <div className="bg-white border border-slate-200/90 rounded-lg p-4 space-y-4 shadow-2xs">
                <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0f3156]" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase font-mono">1. Rəsmi Əlaqə Kanalları & Qaynar Xətlər</h3>
                    <p className="text-[11px] text-slate-400">Footer və Əlaqə Masasında görünən telefon və poçt ünvanları</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Əsas Telefon (Direct Trade Desk)</label>
                    <input
                      type="text"
                      value={content.contact?.phone || '+994 (12) 404 85 00'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), phone: v } }));
                      }}
                      placeholder="+994 (12) 404 85 00"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">İkinci Telefon / Qaynar Xətt</label>
                    <input
                      type="text"
                      value={content.contact?.phoneAlt || '+994 (50) 290 45 00'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), phoneAlt: v } }));
                      }}
                      placeholder="+994 (50) 290 45 00"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Əsas Elektron Poçt (Official Dispatch)</label>
                    <input
                      type="text"
                      value={content.contact?.email || 'desk@azexbuy.az'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), email: v } }));
                      }}
                      placeholder="desk@azexbuy.az"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Satınalma / Tender Emaili</label>
                    <input
                      type="text"
                      value={content.contact?.emailAlt || 'procurement@azexbuy.az'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), emailAlt: v } }));
                      }}
                      placeholder="procurement@azexbuy.az"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">İş Qrafiki & Saatları</label>
                    <input
                      type="text"
                      value={content.contact?.hours || '09:00 – 18:00 (AZT / UTC+4) · B.e – Cümə'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), hours: v } }));
                      }}
                      placeholder="09:00 – 18:00 (AZT / UTC+4)"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Baş Qərargah və Hüquqi Məlumatlar (6 Dillərdə) */}
              <div className="space-y-3">
                <div className="bg-slate-100 p-2.5 rounded text-xs font-bold text-slate-700">
                  2. Baş Qərargah Ünvanı və Çoxdilli Rekvizitlər (6 Dildə)
                </div>

                <MultiLocF label="Qərargah Bölmə Başlığı" strKey="footer.hqTitle" locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label="Tam Ünvan (Baku Alliance Business Center...)" strKey="footer.hqAddress" multi locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label="Şirkət Mandatı / Qısa Təsvir" strKey="footer.description" multi locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label="Müəllif Hüquqları (Copyright)" strKey="footer.rights" multi locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label='"Sürətli Keçidlər" Bölmə Başlığı' strKey="footer.quickLinks" locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label='"Tənzimləmə və Uyğunluq" Başlığı' strKey="footer.complianceTitle" locData={locData} onChange={handleMultiLocChange} />
              </div>

              <SaveBar
                onSave={async () => {
                  setSaving(true);
                  await Promise.all([
                    apiPost('/api/azexbuy/localization', locData),
                    apiPost('/api/azexbuy/content', content),
                  ]);
                  flash();
                  setSaving(false);
                }}
                saving={saving}
                saved={saved}
              />
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
              <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase rounded mt-2">Ana Sayfa Servis Kartları (4)</div>
              <ServicePillarEditor
                content={content}
                onChange={(next) => setContent(next)}
                onSaveContent={saveContent}
                saving={saving}
                saved={saved}
              />
              <SaveBar onSave={async () => { await saveContent(content); await saveStrings(locData); }} saving={saving} saved={saved} />
            </>
          )}

          {/* ── CONTACT & OFFICE DETAILS ── */}
          {page === 'contact' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-[#0f3156]/10 text-[#0f3156] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Əlaqə, Ofis və Rekvizit Məlumatları</h2>
                    <p className="text-xs text-slate-500">Saytın footer, əlaqə bölmələri və rəsmi ünvan məlumatlarını bütün 6 dildə tənzimləyin.</p>
                  </div>
                </div>
              </div>

              {/* Section 1: Rəsmi Əlaqə Kanalları */}
              <div className="bg-white border border-slate-200/90 rounded-lg p-4 space-y-4 shadow-2xs">
                <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0f3156]" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase font-mono">1. Rəsmi Əlaqə Kanalları & Qaynar Xətlər</h3>
                    <p className="text-[11px] text-slate-400">Footer və Əlaqə Masasında görünən telefon və poçt ünvanları</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Əsas Telefon (Direct Trade Desk)</label>
                    <input
                      type="text"
                      value={content.contact?.phone || '+994 (12) 404 85 00'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), phone: v } }));
                      }}
                      placeholder="+994 (12) 404 85 00"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">İkinci Telefon / Qaynar Xətt</label>
                    <input
                      type="text"
                      value={content.contact?.phoneAlt || '+994 (50) 290 45 00'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), phoneAlt: v } }));
                      }}
                      placeholder="+994 (50) 290 45 00"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Əsas Elektron Poçt (Official Dispatch)</label>
                    <input
                      type="text"
                      value={content.contact?.email || 'desk@azexbuy.az'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), email: v } }));
                      }}
                      placeholder="desk@azexbuy.az"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Satınalma / Tender Emaili</label>
                    <input
                      type="text"
                      value={content.contact?.emailAlt || 'procurement@azexbuy.az'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), emailAlt: v } }));
                      }}
                      placeholder="procurement@azexbuy.az"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">İş Qrafiki & Saatları</label>
                    <input
                      type="text"
                      value={content.contact?.hours || '09:00 – 18:00 (AZT / UTC+4) · B.e – Cümə'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), hours: v } }));
                      }}
                      placeholder="09:00 – 18:00 (AZT / UTC+4)"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Baş Qərargah və Hüquqi Məlumatlar (6 Dillərdə) */}
              <div className="space-y-3">
                <div className="bg-slate-100 p-2.5 rounded text-xs font-bold text-slate-700">
                  2. Baş Qərargah Ünvanı və Çoxdilli Rekvizitlər (6 Dildə)
                </div>

                <MultiLocF label="Qərargah Bölmə Başlığı" strKey="footer.hqTitle" locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label="Tam Ünvan (Baku Alliance Business Center...)" strKey="footer.hqAddress" multi locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label="Şirkət Mandatı / Qısa Təsvir" strKey="footer.description" multi locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label="Müəllif Hüquqları (Copyright)" strKey="footer.rights" multi locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label='"Sürətli Keçidlər" Bölmə Başlığı' strKey="footer.quickLinks" locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label='"Tənzimləmə və Uyğunluq" Başlığı' strKey="footer.complianceTitle" locData={locData} onChange={handleMultiLocChange} />
              </div>

              <SaveBar
                onSave={async () => {
                  setSaving(true);
                  await Promise.all([
                    apiPost('/api/azexbuy/localization', locData),
                    apiPost('/api/azexbuy/content', content),
                  ]);
                  flash();
                  setSaving(false);
                }}
                saving={saving}
                saved={saved}
              />
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

          {/* ── CONTACT & OFFICE DETAILS ── */}
          {page === 'contact' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-[#0f3156]/10 text-[#0f3156] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Əlaqə, Ofis və Rekvizit Məlumatları</h2>
                    <p className="text-xs text-slate-500">Saytın footer, əlaqə bölmələri və rəsmi ünvan məlumatlarını bütün 6 dildə tənzimləyin.</p>
                  </div>
                </div>
              </div>

              {/* Section 1: Rəsmi Əlaqə Kanalları */}
              <div className="bg-white border border-slate-200/90 rounded-lg p-4 space-y-4 shadow-2xs">
                <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0f3156]" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase font-mono">1. Rəsmi Əlaqə Kanalları & Qaynar Xətlər</h3>
                    <p className="text-[11px] text-slate-400">Footer və Əlaqə Masasında görünən telefon və poçt ünvanları</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Əsas Telefon (Direct Trade Desk)</label>
                    <input
                      type="text"
                      value={content.contact?.phone || '+994 (12) 404 85 00'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), phone: v } }));
                      }}
                      placeholder="+994 (12) 404 85 00"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">İkinci Telefon / Qaynar Xətt</label>
                    <input
                      type="text"
                      value={content.contact?.phoneAlt || '+994 (50) 290 45 00'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), phoneAlt: v } }));
                      }}
                      placeholder="+994 (50) 290 45 00"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Əsas Elektron Poçt (Official Dispatch)</label>
                    <input
                      type="text"
                      value={content.contact?.email || 'desk@azexbuy.az'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), email: v } }));
                      }}
                      placeholder="desk@azexbuy.az"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Satınalma / Tender Emaili</label>
                    <input
                      type="text"
                      value={content.contact?.emailAlt || 'procurement@azexbuy.az'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), emailAlt: v } }));
                      }}
                      placeholder="procurement@azexbuy.az"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">İş Qrafiki & Saatları</label>
                    <input
                      type="text"
                      value={content.contact?.hours || '09:00 – 18:00 (AZT / UTC+4) · B.e – Cümə'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), hours: v } }));
                      }}
                      placeholder="09:00 – 18:00 (AZT / UTC+4)"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Baş Qərargah və Hüquqi Məlumatlar (6 Dillərdə) */}
              <div className="space-y-3">
                <div className="bg-slate-100 p-2.5 rounded text-xs font-bold text-slate-700">
                  2. Baş Qərargah Ünvanı və Çoxdilli Rekvizitlər (6 Dildə)
                </div>

                <MultiLocF label="Qərargah Bölmə Başlığı" strKey="footer.hqTitle" locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label="Tam Ünvan (Baku Alliance Business Center...)" strKey="footer.hqAddress" multi locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label="Şirkət Mandatı / Qısa Təsvir" strKey="footer.description" multi locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label="Müəllif Hüquqları (Copyright)" strKey="footer.rights" multi locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label='"Sürətli Keçidlər" Bölmə Başlığı' strKey="footer.quickLinks" locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label='"Tənzimləmə və Uyğunluq" Başlığı' strKey="footer.complianceTitle" locData={locData} onChange={handleMultiLocChange} />
              </div>

              <SaveBar
                onSave={async () => {
                  setSaving(true);
                  await Promise.all([
                    apiPost('/api/azexbuy/localization', locData),
                    apiPost('/api/azexbuy/content', content),
                  ]);
                  flash();
                  setSaving(false);
                }}
                saving={saving}
                saved={saved}
              />
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

          {/* ── CONTACT & OFFICE DETAILS ── */}
          {page === 'contact' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-[#0f3156]/10 text-[#0f3156] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Əlaqə, Ofis və Rekvizit Məlumatları</h2>
                    <p className="text-xs text-slate-500">Saytın footer, əlaqə bölmələri və rəsmi ünvan məlumatlarını bütün 6 dildə tənzimləyin.</p>
                  </div>
                </div>
              </div>

              {/* Section 1: Rəsmi Əlaqə Kanalları */}
              <div className="bg-white border border-slate-200/90 rounded-lg p-4 space-y-4 shadow-2xs">
                <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0f3156]" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase font-mono">1. Rəsmi Əlaqə Kanalları & Qaynar Xətlər</h3>
                    <p className="text-[11px] text-slate-400">Footer və Əlaqə Masasında görünən telefon və poçt ünvanları</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Əsas Telefon (Direct Trade Desk)</label>
                    <input
                      type="text"
                      value={content.contact?.phone || '+994 (12) 404 85 00'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), phone: v } }));
                      }}
                      placeholder="+994 (12) 404 85 00"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">İkinci Telefon / Qaynar Xətt</label>
                    <input
                      type="text"
                      value={content.contact?.phoneAlt || '+994 (50) 290 45 00'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), phoneAlt: v } }));
                      }}
                      placeholder="+994 (50) 290 45 00"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Əsas Elektron Poçt (Official Dispatch)</label>
                    <input
                      type="text"
                      value={content.contact?.email || 'desk@azexbuy.az'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), email: v } }));
                      }}
                      placeholder="desk@azexbuy.az"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Satınalma / Tender Emaili</label>
                    <input
                      type="text"
                      value={content.contact?.emailAlt || 'procurement@azexbuy.az'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), emailAlt: v } }));
                      }}
                      placeholder="procurement@azexbuy.az"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">İş Qrafiki & Saatları</label>
                    <input
                      type="text"
                      value={content.contact?.hours || '09:00 – 18:00 (AZT / UTC+4) · B.e – Cümə'}
                      onChange={e => {
                        const v = e.target.value;
                        setContent((p: any) => ({ ...p, contact: { ...(p.contact || {}), hours: v } }));
                      }}
                      placeholder="09:00 – 18:00 (AZT / UTC+4)"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Baş Qərargah və Hüquqi Məlumatlar (6 Dillərdə) */}
              <div className="space-y-3">
                <div className="bg-slate-100 p-2.5 rounded text-xs font-bold text-slate-700">
                  2. Baş Qərargah Ünvanı və Çoxdilli Rekvizitlər (6 Dildə)
                </div>

                <MultiLocF label="Qərargah Bölmə Başlığı" strKey="footer.hqTitle" locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label="Tam Ünvan (Baku Alliance Business Center...)" strKey="footer.hqAddress" multi locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label="Şirkət Mandatı / Qısa Təsvir" strKey="footer.description" multi locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label="Müəllif Hüquqları (Copyright)" strKey="footer.rights" multi locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label='"Sürətli Keçidlər" Bölmə Başlığı' strKey="footer.quickLinks" locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label='"Tənzimləmə və Uyğunluq" Başlığı' strKey="footer.complianceTitle" locData={locData} onChange={handleMultiLocChange} />
              </div>

              <SaveBar
                onSave={async () => {
                  setSaving(true);
                  await Promise.all([
                    apiPost('/api/azexbuy/localization', locData),
                    apiPost('/api/azexbuy/content', content),
                  ]);
                  flash();
                  setSaving(false);
                }}
                saving={saving}
                saved={saved}
              />
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
                      {prod.image && (
                        <div className="w-10 h-8 bg-slate-100 border border-slate-200 rounded flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                          <img src={prod.image} alt="" className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
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
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
                    <button onClick={() => setExpandedId(expandedId === 'bs'+idx ? null : 'bs'+idx)}
                      className="flex-1 flex items-center justify-between text-left cursor-pointer">
                      <span className="text-xs font-bold text-slate-900">Addım {step.number || idx + 1}: {step.title?.EN || step.title?.AZ || ''}</span>
                      {expandedId === 'bs'+idx ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </button>
                    <button
                      type="button"
                      title="Bu addımı sil"
                      onClick={() => {
                        if (!confirm(`Addım ${step.number || idx + 1} silinsin?`)) return;
                        const steps = (content.buyer_steps || []).filter((_: any, i: number) => i !== idx).map((s: any, i: number) => ({ ...s, number: i + 1 }));
                        const updated = { ...content, buyer_steps: steps };
                        setContent(updated);
                        saveContent(updated);
                      }}
                      className="ml-3 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
                    <button onClick={() => setExpandedId(expandedId === 'ps'+idx ? null : 'ps'+idx)}
                      className="flex-1 flex items-center justify-between text-left cursor-pointer">
                      <span className="text-xs font-bold text-slate-900">Mərhələ {step.number || idx + 1}: {step.title?.EN || step.title?.AZ || ''}</span>
                      {expandedId === 'ps'+idx ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </button>
                    <button
                      type="button"
                      title="Bu mərhələni sil"
                      onClick={() => {
                        if (!confirm(`Mərhələ ${step.number || idx + 1} silinsin?`)) return;
                        const steps = (content.producer_steps || []).filter((_: any, i: number) => i !== idx).map((s: any, i: number) => ({ ...s, number: i + 1 }));
                        const updated = { ...content, producer_steps: steps };
                        setContent(updated);
                        saveContent(updated);
                      }}
                      className="ml-3 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
                    <div className="h-28 bg-slate-100/80 relative cursor-pointer flex items-center justify-center p-1.5 overflow-hidden" onClick={() => setPreview(img.url)}>
                      <img src={img.url} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
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

          {/* ── ABOUT PAGE (HAQQIMIZDA) ── */}
          {page === 'about' && (() => {
            const ab = content.about ? { ...ABOUT_PAGE_DEFAULT, ...content.about } : { ...ABOUT_PAGE_DEFAULT };
            const updateAb = (fn: (prev: typeof ABOUT_PAGE_DEFAULT) => typeof ABOUT_PAGE_DEFAULT) => {
              const next = fn(ab);
              setContent((c: any) => ({ ...c, about: next }));
            };

            return (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Haqqımızda Səhifəsi Məzmunu</h2>
                    <p className="text-xs text-slate-500">About səhifəsinin bütün bölmələrinin mətnlərini və görsəllərini buradan redaktə edin.</p>
                  </div>
                  <SaveBar onSave={() => saveContent(content)} saving={saving} saved={saved} />
                </div>

                {/* 01 — Biz Kimik? */}
                <div className="bg-white border border-slate-200 rounded overflow-hidden">
                  <button onClick={() => setExpandedId(expandedId === 'ab_who' ? null : 'ab_who')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 text-left">
                    <span className="text-xs font-bold text-slate-900">01. Biz Kimik? (Who We Are)</span>
                    {expandedId === 'ab_who' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>
                  {expandedId === 'ab_who' && (
                    <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">
                      {/* Image */}
                      <div className="bg-white border border-slate-200 rounded p-3">
                        <label className="block text-[10px] font-bold text-slate-400 font-mono mb-1.5 uppercase">Bölmə Görsəli URL</label>
                        <div className="flex gap-2">
                          <input value={ab.whoWeAre?.image || ''} onChange={e => {
                            const val = e.target.value;
                            updateAb(p => ({ ...p, whoWeAre: { ...p.whoWeAre, image: val } }));
                          }} className="flex-1 h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm" />
                          <button onClick={() => triggerUpload('about_whoWeAreImage')} className="h-8 px-3 bg-[#0f3156] text-white text-xs font-bold rounded-sm flex items-center gap-1.5">
                            <Upload className="w-3 h-3" /> Yüklə
                          </button>
                        </div>
                      </div>

                      {/* Multilingual Text Fields */}
                      {[
                        { label: 'Kicker / Badge', fld: 'badge', multi: false },
                        { label: 'Əsas Başlıq', fld: 'title', multi: false },
                        { label: 'Paraqraf 1', fld: 'p1', multi: true },
                        { label: 'Paraqraf 2', fld: 'p2', multi: true },
                        { label: 'Paraqraf 3', fld: 'p3', multi: true },
                        { label: 'Görsəl Şüarı (Tagline)', fld: 'imageTagline', multi: false },
                        { label: 'Görsəl Alt Yazısı', fld: 'imageSub', multi: false },
                      ].map(item => (
                        <div key={item.fld} className="bg-white border border-slate-200 rounded p-3">
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 font-mono">{item.label}</div>
                          <div className="grid grid-cols-2 gap-2">
                            {LOCALES.map(loc => (
                              <div key={loc}>
                                <div className="text-[9px] font-bold text-slate-400 mb-0.5">{loc}</div>
                                {item.multi ? (
                                  <textarea
                                    value={(ab.whoWeAre as any)?.[item.fld]?.[loc] || ''}
                                    onChange={e => {
                                      const v = e.target.value;
                                      updateAb(p => ({
                                        ...p,
                                        whoWeAre: {
                                          ...p.whoWeAre,
                                          [item.fld]: { ...((p.whoWeAre as any)[item.fld] || {}), [loc]: v }
                                        }
                                      }));
                                    }}
                                    rows={2}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-sm focus:outline-none focus:border-[#0f3156]"
                                  />
                                ) : (
                                  <input
                                    value={(ab.whoWeAre as any)?.[item.fld]?.[loc] || ''}
                                    onChange={e => {
                                      const v = e.target.value;
                                      updateAb(p => ({
                                        ...p,
                                        whoWeAre: {
                                          ...p.whoWeAre,
                                          [item.fld]: { ...((p.whoWeAre as any)[item.fld] || {}), [loc]: v }
                                        }
                                      }));
                                    }}
                                    className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2 rounded-sm focus:outline-none focus:border-[#0f3156]"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <SaveBar onSave={() => saveContent(content)} saving={saving} saved={saved} />
                    </div>
                  )}
                </div>

                {/* 02 — Fəaliyyətimiz */}
                <div className="bg-white border border-slate-200 rounded overflow-hidden">
                  <button onClick={() => setExpandedId(expandedId === 'ab_act' ? null : 'ab_act')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 text-left">
                    <span className="text-xs font-bold text-slate-900">02. Fəaliyyətimiz (Our Activities)</span>
                    {expandedId === 'ab_act' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>
                  {expandedId === 'ab_act' && (
                    <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">
                      {[
                        { label: 'Badge', fld: 'badge', multi: false },
                        { label: 'Başlıq', fld: 'title', multi: false },
                        { label: 'Təsvir', fld: 'desc', multi: true },
                      ].map(item => (
                        <div key={item.fld} className="bg-white border border-slate-200 rounded p-3">
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 font-mono">{item.label}</div>
                          <div className="grid grid-cols-2 gap-2">
                            {LOCALES.map(loc => (
                              <div key={loc}>
                                <div className="text-[9px] font-bold text-slate-400 mb-0.5">{loc}</div>
                                {item.multi ? (
                                  <textarea
                                    value={(ab.activities as any)?.[item.fld]?.[loc] || ''}
                                    onChange={e => {
                                      const v = e.target.value;
                                      updateAb(p => ({
                                        ...p,
                                        activities: {
                                          ...p.activities,
                                          [item.fld]: { ...((p.activities as any)[item.fld] || {}), [loc]: v }
                                        }
                                      }));
                                    }}
                                    rows={2}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-sm focus:outline-none focus:border-[#0f3156]"
                                  />
                                ) : (
                                  <input
                                    value={(ab.activities as any)?.[item.fld]?.[loc] || ''}
                                    onChange={e => {
                                      const v = e.target.value;
                                      updateAb(p => ({
                                        ...p,
                                        activities: {
                                          ...p.activities,
                                          [item.fld]: { ...((p.activities as any)[item.fld] || {}), [loc]: v }
                                        }
                                      }));
                                    }}
                                    className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2 rounded-sm focus:outline-none focus:border-[#0f3156]"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Items */}
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Fəaliyyət Maddələri ({(ab.activities.items || []).length} ədəd)</span>
                          <button
                            type="button"
                            onClick={() => {
                              updateAb(p => {
                                const items = [...(p.activities.items || [])];
                                items.push({
                                  icon: 'fa-solid fa-circle-check',
                                  title: { AZ: '', EN: '', TR: '', RU: '', AR: '', ES: '' },
                                  desc: { AZ: '', EN: '', TR: '', RU: '', AR: '', ES: '' }
                                });
                                return { ...p, activities: { ...p.activities, items } };
                              });
                            }}
                            className="h-6 px-2 flex items-center gap-1 text-[10px] font-bold bg-[#0f3156] text-white hover:bg-[#081c33] rounded transition-colors"
                          >
                            <Plus className="w-3 h-3" /> Maddə Əlavə Et
                          </button>
                        </div>
                        {(ab.activities.items || []).map((act: any, idx: number) => (
                          <div key={idx} className="bg-white border border-slate-200 rounded p-3 space-y-2">
                            <div className="text-[11px] font-bold text-brandNavy flex items-center justify-between">
                              <span>Maddə {idx + 1}: {act.title?.EN || act.title?.AZ || ''}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-mono">{act.icon}</span>
                                <button
                                  type="button"
                                  title="Maddəni sil"
                                  onClick={() => {
                                    if (!confirm(`Maddə ${idx + 1} silinsin?`)) return;
                                    updateAb(p => {
                                      const items = (p.activities.items || []).filter((_: any, i: number) => i !== idx);
                                      return { ...p, activities: { ...p.activities, items } };
                                    });
                                  }}
                                  className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {LOCALES.map(loc => (
                                <div key={loc}>
                                  <div className="text-[9px] font-bold text-slate-400">{loc} Başlıq</div>
                                  <input
                                    value={act.title?.[loc] || ''}
                                    onChange={e => {
                                      const v = e.target.value;
                                      updateAb(p => {
                                        const items = [...(p.activities.items || [])];
                                        items[idx] = { ...items[idx], title: { ...(items[idx].title || {}), [loc]: v } };
                                        return { ...p, activities: { ...p.activities, items } };
                                      });
                                    }}
                                    className="w-full h-7 text-xs bg-slate-50 border border-slate-200 px-2 rounded-sm mb-1"
                                  />
                                  <div className="text-[9px] font-bold text-slate-400">{loc} Təsvir</div>
                                  <textarea
                                    value={act.desc?.[loc] || ''}
                                    onChange={e => {
                                      const v = e.target.value;
                                      updateAb(p => {
                                        const items = [...(p.activities.items || [])];
                                        items[idx] = { ...items[idx], desc: { ...(items[idx].desc || {}), [loc]: v } };
                                        return { ...p, activities: { ...p.activities, items } };
                                      });
                                    }}
                                    rows={2}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-sm resize-none"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <SaveBar onSave={() => saveContent(content)} saving={saving} saved={saved} />
                    </div>
                  )}
                </div>

                {/* 03 — Missiya və Vizyon */}
                <div className="bg-white border border-slate-200 rounded overflow-hidden">
                  <button onClick={() => setExpandedId(expandedId === 'ab_mv' ? null : 'ab_mv')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 text-left">
                    <span className="text-xs font-bold text-slate-900">03. Missiya və Vizyon (Mission & Vision)</span>
                    {expandedId === 'ab_mv' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>
                  {expandedId === 'ab_mv' && (
                    <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">
                      {/* Mission image */}
                      <div className="bg-white border border-slate-200 rounded p-3">
                        <label className="block text-[10px] font-bold text-slate-400 font-mono mb-1.5 uppercase">Missiya Şəkli URL</label>
                        <div className="flex gap-2">
                          <input value={ab.missionVision?.missionImage || ''} onChange={e => {
                            const val = e.target.value;
                            updateAb(p => ({ ...p, missionVision: { ...p.missionVision, missionImage: val } }));
                          }} className="flex-1 h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm" />
                          <button onClick={() => triggerUpload('about_missionImage')} className="h-8 px-3 bg-[#0f3156] text-white text-xs font-bold rounded-sm flex items-center gap-1.5">
                            <Upload className="w-3 h-3" /> Yüklə
                          </button>
                        </div>
                      </div>

                      {/* Vision image */}
                      <div className="bg-white border border-slate-200 rounded p-3">
                        <label className="block text-[10px] font-bold text-slate-400 font-mono mb-1.5 uppercase">Vizyon Şəkli URL</label>
                        <div className="flex gap-2">
                          <input value={ab.missionVision?.visionImage || ''} onChange={e => {
                            const val = e.target.value;
                            updateAb(p => ({ ...p, missionVision: { ...p.missionVision, visionImage: val } }));
                          }} className="flex-1 h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm" />
                          <button onClick={() => triggerUpload('about_visionImage')} className="h-8 px-3 bg-[#0f3156] text-white text-xs font-bold rounded-sm flex items-center gap-1.5">
                            <Upload className="w-3 h-3" /> Yüklə
                          </button>
                        </div>
                      </div>

                      {/* Multilingual MV */}
                      {[
                        { label: 'Missiya Badge', fld: 'missionBadge', multi: false },
                        { label: 'Missiya Başlıq', fld: 'missionTitle', multi: false },
                        { label: 'Missiya Mətni', fld: 'missionDesc', multi: true },
                        { label: 'Vizyon Badge', fld: 'visionBadge', multi: false },
                        { label: 'Vizyon Başlıq', fld: 'visionTitle', multi: false },
                        { label: 'Vizyon Mətni', fld: 'visionDesc', multi: true },
                      ].map(item => (
                        <div key={item.fld} className="bg-white border border-slate-200 rounded p-3">
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 font-mono">{item.label}</div>
                          <div className="grid grid-cols-2 gap-2">
                            {LOCALES.map(loc => (
                              <div key={loc}>
                                <div className="text-[9px] font-bold text-slate-400 mb-0.5">{loc}</div>
                                {item.multi ? (
                                  <textarea
                                    value={(ab.missionVision as any)?.[item.fld]?.[loc] || ''}
                                    onChange={e => {
                                      const v = e.target.value;
                                      updateAb(p => ({
                                        ...p,
                                        missionVision: {
                                          ...p.missionVision,
                                          [item.fld]: { ...((p.missionVision as any)[item.fld] || {}), [loc]: v }
                                        }
                                      }));
                                    }}
                                    rows={2}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-sm"
                                  />
                                ) : (
                                  <input
                                    value={(ab.missionVision as any)?.[item.fld]?.[loc] || ''}
                                    onChange={e => {
                                      const v = e.target.value;
                                      updateAb(p => ({
                                        ...p,
                                        missionVision: {
                                          ...p.missionVision,
                                          [item.fld]: { ...((p.missionVision as any)[item.fld] || {}), [loc]: v }
                                        }
                                      }));
                                    }}
                                    className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2 rounded-sm"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <SaveBar onSave={() => saveContent(content)} saving={saving} saved={saved} />
                    </div>
                  )}
                </div>

                {/* 04 — Xidmət Modelimiz */}
                <div className="bg-white border border-slate-200 rounded overflow-hidden">
                  <button onClick={() => setExpandedId(expandedId === 'ab_srv' ? null : 'ab_srv')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 text-left">
                    <span className="text-xs font-bold text-slate-900">04. Xidmət Modelimiz (Service Model)</span>
                    {expandedId === 'ab_srv' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>
                  {expandedId === 'ab_srv' && (
                    <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">
                      {[
                        { label: 'Badge', fld: 'badge', multi: false },
                        { label: 'Başlıq', fld: 'title', multi: false },
                        { label: 'Təsvir', fld: 'desc', multi: true },
                        { label: 'Alt Qeyd (Bottom Note)', fld: 'bottomNote', multi: true },
                      ].map(item => (
                        <div key={item.fld} className="bg-white border border-slate-200 rounded p-3">
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 font-mono">{item.label}</div>
                          <div className="grid grid-cols-2 gap-2">
                            {LOCALES.map(loc => (
                              <div key={loc}>
                                <div className="text-[9px] font-bold text-slate-400 mb-0.5">{loc}</div>
                                {item.multi ? (
                                  <textarea
                                    value={(ab.serviceModel as any)?.[item.fld]?.[loc] || ''}
                                    onChange={e => {
                                      const v = e.target.value;
                                      updateAb(p => ({
                                        ...p,
                                        serviceModel: {
                                          ...p.serviceModel,
                                          [item.fld]: { ...((p.serviceModel as any)[item.fld] || {}), [loc]: v }
                                        }
                                      }));
                                    }}
                                    rows={2}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-sm"
                                  />
                                ) : (
                                  <input
                                    value={(ab.serviceModel as any)?.[item.fld]?.[loc] || ''}
                                    onChange={e => {
                                      const v = e.target.value;
                                      updateAb(p => ({
                                        ...p,
                                        serviceModel: {
                                          ...p.serviceModel,
                                          [item.fld]: { ...((p.serviceModel as any)[item.fld] || {}), [loc]: v }
                                        }
                                      }));
                                    }}
                                    className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2 rounded-sm"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <SaveBar onSave={() => saveContent(content)} saving={saving} saved={saved} />
                    </div>
                  )}
                </div>

                {/* 05 — Strateji İstiqamətlər */}
                <div className="bg-white border border-slate-200 rounded overflow-hidden">
                  <button onClick={() => setExpandedId(expandedId === 'ab_pillars' ? null : 'ab_pillars')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 text-left">
                    <span className="text-xs font-bold text-slate-900">05. Strateji İstiqamətlər (Strategic Pillars)</span>
                    {expandedId === 'ab_pillars' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>
                  {expandedId === 'ab_pillars' && (
                    <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">
                      {[
                        { label: 'Bölmə Badge', fld: 'badge', multi: false },
                        { label: 'Bölmə Başlığı', fld: 'title', multi: false },
                        { label: 'Bölmə Təsviri', fld: 'desc', multi: true },
                      ].map(item => (
                        <div key={item.fld} className="bg-white border border-slate-200 rounded p-3">
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 font-mono">{item.label}</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {LOCALES.map(loc => (
                              <div key={loc}>
                                <div className="text-[9px] font-bold text-slate-400 mb-0.5">{loc}</div>
                                {item.multi ? (
                                  <textarea
                                    value={(ab.activities as any)?.[item.fld]?.[loc] || ''}
                                    onChange={e => {
                                      const v = e.target.value;
                                      updateAb(p => ({
                                        ...p,
                                        activities: {
                                          ...p.activities,
                                          [item.fld]: { ...((p.activities as any)[item.fld] || {}), [loc]: v }
                                        }
                                      }));
                                    }}
                                    rows={2}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-sm"
                                  />
                                ) : (
                                  <input
                                    value={(ab.activities as any)?.[item.fld]?.[loc] || ''}
                                    onChange={e => {
                                      const v = e.target.value;
                                      updateAb(p => ({
                                        ...p,
                                        activities: {
                                          ...p.activities,
                                          [item.fld]: { ...((p.activities as any)[item.fld] || {}), [loc]: v }
                                        }
                                      }));
                                    }}
                                    className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2 rounded-sm"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <SaveBar onSave={() => saveContent(content)} saving={saving} saved={saved} />
                    </div>
                  )}
                </div>

                {/* 06 — İnstitusional Dəyərlər */}
                <div className="bg-white border border-slate-200 rounded overflow-hidden">
                  <button onClick={() => setExpandedId(expandedId === 'ab_values' ? null : 'ab_values')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 text-left">
                    <span className="text-xs font-bold text-slate-900">06. İnstitusional Dəyərlər (Core Values)</span>
                    {expandedId === 'ab_values' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>
                  {expandedId === 'ab_values' && (
                    <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">
                      {[
                        { label: 'Bölmə Badge', fld: 'badge', multi: false },
                        { label: 'Bölmə Başlığı', fld: 'title', multi: false },
                        { label: 'Bölmə Təsviri', fld: 'desc', multi: true },
                      ].map(item => (
                        <div key={item.fld} className="bg-white border border-slate-200 rounded p-3">
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 font-mono">{item.label}</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {LOCALES.map(loc => (
                              <div key={loc}>
                                <div className="text-[9px] font-bold text-slate-400 mb-0.5">{loc}</div>
                                {item.multi ? (
                                  <textarea
                                    value={(ab.values as any)?.[item.fld]?.[loc] || ''}
                                    onChange={e => {
                                      const v = e.target.value;
                                      updateAb(p => ({
                                        ...p,
                                        values: {
                                          ...p.values,
                                          [item.fld]: { ...((p.values as any)[item.fld] || {}), [loc]: v }
                                        }
                                      }));
                                    }}
                                    rows={2}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-sm"
                                  />
                                ) : (
                                  <input
                                    value={(ab.values as any)?.[item.fld]?.[loc] || ''}
                                    onChange={e => {
                                      const v = e.target.value;
                                      updateAb(p => ({
                                        ...p,
                                        values: {
                                          ...p.values,
                                          [item.fld]: { ...((p.values as any)[item.fld] || {}), [loc]: v }
                                        }
                                      }));
                                    }}
                                    className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2 rounded-sm"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <SaveBar onSave={() => saveContent(content)} saving={saving} saved={saved} />
                    </div>
                  )}
                </div>

                {/* 07 — Prioritet İxrac Sektorları */}
                <div className="bg-white border border-slate-200 rounded overflow-hidden">
                  <button onClick={() => setExpandedId(expandedId === 'ab_sectors' ? null : 'ab_sectors')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 text-left">
                    <span className="text-xs font-bold text-slate-900">07. Prioritet İxrac Sektorları (Priority Export Sectors & Images)</span>
                    {expandedId === 'ab_sectors' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>
                  {expandedId === 'ab_sectors' && (
                    <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/50">
                      {[
                        { label: 'Bölmə Badge', fld: 'badge', multi: false },
                        { label: 'Bölmə Başlığı', fld: 'title', multi: false },
                        { label: 'Bölmə Təsviri', fld: 'desc', multi: true },
                      ].map(item => (
                        <div key={item.fld} className="bg-white border border-slate-200 rounded p-3">
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 font-mono">{item.label}</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {LOCALES.map(loc => (
                              <div key={loc}>
                                <div className="text-[9px] font-bold text-slate-400 mb-0.5">{loc}</div>
                                {item.multi ? (
                                  <textarea
                                    value={(ab.sectors as any)?.[item.fld]?.[loc] || ''}
                                    onChange={e => {
                                      const v = e.target.value;
                                      updateAb(p => ({
                                        ...p,
                                        sectors: {
                                          ...p.sectors,
                                          [item.fld]: { ...((p.sectors as any)[item.fld] || {}), [loc]: v }
                                        }
                                      }));
                                    }}
                                    rows={2}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-sm"
                                  />
                                ) : (
                                  <input
                                    value={(ab.sectors as any)?.[item.fld]?.[loc] || ''}
                                    onChange={e => {
                                      const v = e.target.value;
                                      updateAb(p => ({
                                        ...p,
                                        sectors: {
                                          ...p.sectors,
                                          [item.fld]: { ...((p.sectors as any)[item.fld] || {}), [loc]: v }
                                        }
                                      }));
                                    }}
                                    className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2 rounded-sm"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Sector cards with Image Upload */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">İxrac Sektorlarının Şəkilləri və Mətnləri ({(ab.sectors?.items || []).length} ədəd)</span>
                          <button
                            type="button"
                            onClick={() => {
                              updateAb(p => {
                                const items = [...(p.sectors?.items || [])];
                                items.push({
                                  image: '',
                                  title: { AZ: '', EN: '', TR: '', RU: '', AR: '', ES: '' },
                                  desc: { AZ: '', EN: '', TR: '', RU: '', AR: '', ES: '' }
                                });
                                return { ...p, sectors: { ...p.sectors, items } };
                              });
                            }}
                            className="h-6 px-2 flex items-center gap-1 text-[10px] font-bold bg-[#0f3156] text-white hover:bg-[#081c33] rounded transition-colors"
                          >
                            <Plus className="w-3 h-3" /> Sektor Əlavə Et
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(ab.sectors?.items || []).map((sec: any, idx: number) => {
                            const imgUrl = sec.image || '';
                            return (
                              <div key={idx} className="bg-white border border-slate-200 rounded p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-slate-700">Sektor #{idx + 1} — {sec.title?.AZ || sec.title?.EN || `Sektor ${idx + 1}`}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400 font-mono">ID: {idx}</span>
                                    <button
                                      type="button"
                                      title="Sektoru sil"
                                      onClick={() => {
                                        if (!confirm(`Sektor #${idx + 1} silinsin?`)) return;
                                        updateAb(p => {
                                          const items = (p.sectors?.items || []).filter((_: any, i: number) => i !== idx);
                                          return { ...p, sectors: { ...p.sectors, items } };
                                        });
                                      }}
                                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Şəkil URL & Yükləmə</label>
                                  <div className="flex gap-2">
                                    <input
                                      value={imgUrl}
                                      onChange={e => {
                                        const v = e.target.value;
                                        updateAb(p => {
                                          const items = [...(p.sectors?.items || [])];
                                          if (items[idx]) items[idx] = { ...items[idx], image: v };
                                          return { ...p, sectors: { ...p.sectors, items } };
                                        });
                                      }}
                                      className="flex-1 h-7 text-xs bg-slate-50 border border-slate-200 px-2 rounded-sm"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => triggerUpload(`about_sector_${idx}`)}
                                      className="h-7 px-2.5 bg-[#0f3156] text-white text-[11px] font-bold rounded-sm flex items-center gap-1 hover:bg-[#081c33] shrink-0"
                                    >
                                      <Upload className="w-3 h-3" /> Yüklə
                                    </button>
                                  </div>
                                  {imgUrl && (
                                    <div className="mt-1.5 flex items-center gap-2">
                                      <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                        <img src={imgUrl} alt="Sector" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                                      </div>
                                      <span className="text-[10px] text-slate-400 truncate flex-1 font-mono">{imgUrl}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <SaveBar onSave={() => saveContent(content)} saving={saving} saved={saved} />
                    </div>
                  )}
                </div>

                {/* 08 — Dəhlizlər və Tərəfdaşlar */}
                <div className="bg-white border border-slate-200 rounded overflow-hidden">
                  <button onClick={() => setExpandedId(expandedId === 'ab_corridors' ? null : 'ab_corridors')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 text-left">
                    <span className="text-xs font-bold text-slate-900">08. Logistika Dəhlizləri və Tərəfdaşlar (Trade Corridors)</span>
                    {expandedId === 'ab_corridors' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>
                  {expandedId === 'ab_corridors' && (
                    <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">
                      {[
                        { label: 'Bölmə Badge', fld: 'badge', multi: false },
                        { label: 'Bölmə Başlığı', fld: 'title', multi: false },
                        { label: 'Bölmə Təsviri', fld: 'desc', multi: true },
                      ].map(item => (
                        <div key={item.fld} className="bg-white border border-slate-200 rounded p-3">
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 font-mono">{item.label}</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {LOCALES.map(loc => (
                              <div key={loc}>
                                <div className="text-[9px] font-bold text-slate-400 mb-0.5">{loc}</div>
                                {item.multi ? (
                                  <textarea
                                    value={(ab.partnership as any)?.[item.fld]?.[loc] || ''}
                                    onChange={e => {
                                      const v = e.target.value;
                                      updateAb(p => ({
                                        ...p,
                                        partnership: {
                                          ...p.partnership,
                                          [item.fld]: { ...((p.partnership as any)[item.fld] || {}), [loc]: v }
                                        }
                                      }));
                                    }}
                                    rows={2}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-sm"
                                  />
                                ) : (
                                  <input
                                    value={(ab.partnership as any)?.[item.fld]?.[loc] || ''}
                                    onChange={e => {
                                      const v = e.target.value;
                                      updateAb(p => ({
                                        ...p,
                                        partnership: {
                                          ...p.partnership,
                                          [item.fld]: { ...((p.partnership as any)[item.fld] || {}), [loc]: v }
                                        }
                                      }));
                                    }}
                                    className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2 rounded-sm"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <SaveBar onSave={() => saveContent(content)} saving={saving} saved={saved} />
                    </div>
                  )}
                </div>

                {/* 09 — Komanda Bölməsi Başlığı */}
                <div className="bg-white border border-slate-200 rounded overflow-hidden">
                  <button onClick={() => setExpandedId(expandedId === 'ab_team_head' ? null : 'ab_team_head')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 text-left">
                    <span className="text-xs font-bold text-slate-900">09. Komanda Bölməsi Başlıqları (Team Section Header)</span>
                    {expandedId === 'ab_team_head' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>
                  {expandedId === 'ab_team_head' && (
                    <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">
                      {[
                        { label: 'Badge', fld: 'badge', multi: false },
                        { label: 'Başlıq', fld: 'title', multi: false },
                        { label: 'Açıqlama', fld: 'desc', multi: true },
                      ].map(item => (
                        <div key={item.fld} className="bg-white border border-slate-200 rounded p-3">
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 font-mono">{item.label}</div>
                          <div className="grid grid-cols-2 gap-2">
                            {LOCALES.map(loc => (
                              <div key={loc}>
                                <div className="text-[9px] font-bold text-slate-400 mb-0.5">{loc}</div>
                                {item.multi ? (
                                  <textarea
                                    value={(ab.team as any)?.[item.fld]?.[loc] || ''}
                                    onChange={e => {
                                      const v = e.target.value;
                                      updateAb(p => ({
                                        ...p,
                                        team: {
                                          ...p.team,
                                          [item.fld]: { ...((p.team as any)[item.fld] || {}), [loc]: v }
                                        }
                                      }));
                                    }}
                                    rows={2}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-sm"
                                  />
                                ) : (
                                  <input
                                    value={(ab.team as any)?.[item.fld]?.[loc] || ''}
                                    onChange={e => {
                                      const v = e.target.value;
                                      updateAb(p => ({
                                        ...p,
                                        team: {
                                          ...p.team,
                                          [item.fld]: { ...((p.team as any)[item.fld] || {}), [loc]: v }
                                        }
                                      }));
                                    }}
                                    className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2 rounded-sm"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <SaveBar onSave={() => saveContent(content)} saving={saving} saved={saved} />
                    </div>
                  )}
                </div>

                {/* 10 — Əməkdaşlığa Dəvət (CTA) */}
                <div className="bg-white border border-slate-200 rounded overflow-hidden">
                  <button onClick={() => setExpandedId(expandedId === 'ab_cta' ? null : 'ab_cta')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 text-left">
                    <span className="text-xs font-bold text-slate-900">10. Əməkdaşlığa Dəvət (CTA)</span>
                    {expandedId === 'ab_cta' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>
                  {expandedId === 'ab_cta' && (
                    <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">
                      {[
                        { label: 'Badge', fld: 'badge', multi: false },
                        { label: 'Başlıq', fld: 'title', multi: false },
                        { label: 'Mətn', fld: 'desc', multi: true },
                        { label: 'Alıcı Butonu', fld: 'buyerBtn', multi: false },
                        { label: 'İstehsalçı Butonu', fld: 'producerBtn', multi: false },
                        { label: 'Əlaqə Butonu', fld: 'contactBtn', multi: false },
                      ].map(item => (
                        <div key={item.fld} className="bg-white border border-slate-200 rounded p-3">
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 font-mono">{item.label}</div>
                          <div className="grid grid-cols-2 gap-2">
                            {LOCALES.map(loc => (
                              <div key={loc}>
                                <div className="text-[9px] font-bold text-slate-400 mb-0.5">{loc}</div>
                                {item.multi ? (
                                  <textarea
                                    value={(ab.cta as any)?.[item.fld]?.[loc] || ''}
                                    onChange={e => {
                                      const v = e.target.value;
                                      updateAb(p => ({
                                        ...p,
                                        cta: {
                                          ...p.cta,
                                          [item.fld]: { ...((p.cta as any)[item.fld] || {}), [loc]: v }
                                        }
                                      }));
                                    }}
                                    rows={2}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-sm"
                                  />
                                ) : (
                                  <input
                                    value={(ab.cta as any)?.[item.fld]?.[loc] || ''}
                                    onChange={e => {
                                      const v = e.target.value;
                                      updateAb(p => ({
                                        ...p,
                                        cta: {
                                          ...p.cta,
                                          [item.fld]: { ...((p.cta as any)[item.fld] || {}), [loc]: v }
                                        }
                                      }));
                                    }}
                                    className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2 rounded-sm"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <SaveBar onSave={() => saveContent(content)} saving={saving} saved={saved} />
                    </div>
                  )}
                </div>

                <SaveBar onSave={() => saveContent(content)} saving={saving} saved={saved} />
              </>
            );
          })()}

          {/* ── TEAM MANAGEMENT (KOMANDA) ── */}
          {page === 'team' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Komanda İdarəetməsi (Ekip)</h2>
                  <p className="text-xs text-slate-500">Haqqımızda səhifəsində görünən komanda üzvlərini, vəzifələrini və əlaqə məlumatlarını idarə edin.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadTeam}
                    disabled={teamLoading}
                    className="h-8 px-3 flex items-center gap-1.5 text-xs border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${teamLoading ? 'animate-spin' : ''}`} /> Yenilə
                  </button>
                  <button
                    onClick={() => {
                      setNewMember({
                        id: `tm-${Date.now().toString(36)}`,
                        name: '',
                        photo: '',
                        email: '',
                        linkedin: '',
                        sortOrder: teamMembers.length + 1,
                        isActive: true,
                        role: { AZ:'', EN:'', TR:'', RU:'', AR:'', ES:'' },
                        bio: { AZ:'', EN:'', TR:'', RU:'', AR:'', ES:'' }
                      });
                      setShowNewMember(true);
                    }}
                    className="h-8 px-3.5 flex items-center gap-1.5 text-xs font-bold bg-[#0f3156] text-white hover:bg-[#081c33] rounded-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Yeni Komanda Üzvü
                  </button>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white border border-slate-200 p-3 rounded">
                  <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">Ümumi Üzvlər</div>
                  <div className="text-xl font-black text-slate-800 mt-0.5">{teamMembers.length}</div>
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded">
                  <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">Aktiv Üzvlər</div>
                  <div className="text-xl font-black text-emerald-600 mt-0.5">
                    {teamMembers.filter(m => m.isActive).length}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded">
                  <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">Deaktiv Üzvlər</div>
                  <div className="text-xl font-black text-slate-400 mt-0.5">
                    {teamMembers.filter(m => !m.isActive).length}
                  </div>
                </div>
              </div>

              {/* Members List */}
              {teamLoading && (
                <div className="py-12 text-center text-xs text-slate-400">
                  <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2" /> Komanda üzvləri yüklənir...
                </div>
              )}

              {!teamLoading && teamMembers.length === 0 && (
                <div className="bg-white border border-dashed border-slate-200 rounded p-8 text-center text-xs text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" /> Hələ heç bir komanda üzvü əlavə edilməyib.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map(m => {
                  const roleTxt = m.role?.[locale] || m.role?.AZ || m.role?.EN || '';
                  const bioTxt = m.bio?.[locale] || m.bio?.AZ || m.bio?.EN || '';

                  return (
                    <div key={m.id} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between hover:shadow-sm transition-shadow">
                      <div>
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                            {m.photo ? (
                              <img src={m.photo} alt={m.name} className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Users className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h3 className="text-xs font-bold text-slate-900 truncate">{m.name}</h3>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${m.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                                {m.isActive ? 'Aktiv' : 'Passiv'}
                              </span>
                            </div>
                            <div className="text-[11px] font-medium text-emerald-700 truncate mt-0.5">{roleTxt || 'Vəzifə qeyd edilməyib'}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Sıra: #{m.sortOrder ?? 0}</div>
                          </div>
                        </div>

                        {bioTxt && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3 bg-slate-50 p-2 rounded border border-slate-100">
                            {bioTxt}
                          </p>
                        )}

                        <div className="space-y-1 text-[10px] text-slate-500 font-mono mb-3">
                          {m.email && <div className="truncate"><span className="text-slate-400">Email:</span> {m.email}</div>}
                          {m.linkedin && <div className="truncate"><span className="text-slate-400">LinkedIn:</span> {m.linkedin}</div>}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleMemberActive(m)}
                          className={`h-7 px-2 text-[10px] font-bold border rounded-sm transition-colors ${m.isActive ? 'border-amber-300 text-amber-700 hover:bg-amber-50' : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'}`}
                        >
                          {m.isActive ? 'Deaktiv Et' : 'Aktivləşdir'}
                        </button>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingMember(m)}
                            className="h-7 px-2.5 flex items-center gap-1 text-[11px] font-medium border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-sm"
                          >
                            <Pencil className="w-3 h-3" /> Redaktə
                          </button>
                          <button
                            onClick={() => handleDeleteMember(m.id)}
                            className="h-7 px-2 text-red-500 hover:bg-red-50 border border-red-200 rounded-sm"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add/Edit Modal */}
              {(showNewMember || editingMember !== null) && (() => {
                const isNew = showNewMember;
                const cur = isNew ? newMember : editingMember;
                const setCur = isNew ? setNewMember : setEditingMember;

                return (
                  <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                      {/* Modal Header */}
                      <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-emerald-400" />
                          <h3 className="text-xs font-bold uppercase tracking-wider">
                            {isNew ? 'Yeni Komanda Üzvü Əlavə Et' : `Redaktə: ${cur.name}`}
                          </h3>
                        </div>
                        <button onClick={() => { setShowNewMember(false); setEditingMember(null); }} className="text-slate-400 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="p-5 overflow-y-auto space-y-4 flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Ad və Soyad *</label>
                            <input
                              value={cur.name || ''}
                              onChange={e => setCur((p: any) => ({ ...p, name: e.target.value }))}
                              placeholder="Məs: Ali Əhmədov"
                              className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Sıralama (Order)</label>
                            <input
                              type="number"
                              value={cur.sortOrder ?? 0}
                              onChange={e => setCur((p: any) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                              className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156]"
                            />
                          </div>
                        </div>

                        {/* Photo URL + upload */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Şəkil URL</label>
                          <div className="flex gap-2">
                            <input
                              value={cur.photo || ''}
                              onChange={e => setCur((p: any) => ({ ...p, photo: e.target.value }))}
                              placeholder="https://..."
                              className="flex-1 h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156]"
                            />
                            <button
                              type="button"
                              onClick={() => triggerUpload(isNew ? 'team_new' : 'team_edit')}
                              className="h-8 px-3 bg-[#0f3156] text-white text-xs font-bold rounded-sm flex items-center gap-1.5 hover:bg-[#081c33]"
                            >
                              <Upload className="w-3 h-3" /> Yüklə
                            </button>
                          </div>
                          {cur.photo && (
                            <div className="mt-2 flex items-center gap-3">
                              <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                                <img src={cur.photo} alt="Preview" className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
                              </div>
                              <span className="text-[10px] text-slate-400 truncate font-mono">{cur.photo}</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Email</label>
                            <input
                              value={cur.email || ''}
                              onChange={e => setCur((p: any) => ({ ...p, email: e.target.value }))}
                              placeholder="ad@azexbuy.com"
                              className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">LinkedIn URL</label>
                            <input
                              value={cur.linkedin || ''}
                              onChange={e => setCur((p: any) => ({ ...p, linkedin: e.target.value }))}
                              placeholder="https://linkedin.com/in/..."
                              className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            id="m_active"
                            checked={cur.isActive !== false}
                            onChange={e => setCur((p: any) => ({ ...p, isActive: e.target.checked }))}
                            className="rounded border-slate-300 text-[#0f3156] focus:ring-0"
                          />
                          <label htmlFor="m_active" className="text-xs font-bold text-slate-700 cursor-pointer">
                            Saytda Aktiv Göstərilsin
                          </label>
                        </div>

                        {/* Multilingual Roles */}
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-2">
                          <div className="text-[10px] font-bold text-slate-600 uppercase font-mono">Vəzifə / Rol (Bütün dillərdə)</div>
                          <div className="space-y-1.5">
                            {LOCALES.map(loc => (
                              <div key={loc} className="flex items-center gap-2">
                                <div className="w-10 h-7 rounded bg-white border border-slate-200 text-slate-700 font-bold text-[11px] font-mono flex items-center justify-center shrink-0">
                                  {loc}
                                </div>
                                <input
                                  value={cur.role?.[loc] || ''}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setCur((p: any) => ({ ...p, role: { ...(p.role || {}), [loc]: val } }));
                                  }}
                                  className="flex-1 h-7 text-xs bg-white border border-slate-200 px-2 rounded-sm focus:outline-none focus:border-[#0f3156]"
                                  placeholder={`${loc} dilində vəzifə...`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Multilingual Bio */}
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-2">
                          <div className="text-[10px] font-bold text-slate-600 uppercase font-mono">Bio / Təcrübə (Bütün dillərdə)</div>
                          <div className="space-y-1.5">
                            {LOCALES.map(loc => (
                              <div key={loc} className="flex items-start gap-2">
                                <div className="w-10 h-7 rounded bg-white border border-slate-200 text-slate-700 font-bold text-[11px] font-mono flex items-center justify-center shrink-0 mt-0.5">
                                  {loc}
                                </div>
                                <textarea
                                  value={cur.bio?.[loc] || ''}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setCur((p: any) => ({ ...p, bio: { ...(p.bio || {}), [loc]: val } }));
                                  }}
                                  rows={2}
                                  className="flex-1 text-xs bg-white border border-slate-200 px-2 py-1 rounded-sm focus:outline-none focus:border-[#0f3156] resize-none"
                                  placeholder={`${loc} dilində bio...`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => { setShowNewMember(false); setEditingMember(null); }}
                          className="h-8 px-4 text-xs font-medium border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-sm"
                        >
                          İmtina
                        </button>
                        <button
                          type="button"
                          onClick={isNew ? handleSaveNewMember : handleSaveEditMember}
                          className="h-8 px-5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm"
                        >
                          {isNew ? 'Əlavə Et' : 'Dəyişiklikləri Saxla'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
