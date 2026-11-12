import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Save, Upload, RefreshCw, CheckCircle, ChevronDown, ChevronRight,
  Trash2, Plus, Eye, X, Image as ImgIcon, Package,
  Star, Footprints, Layers, LayoutTemplate, Menu as MenuIcon,
  Anchor, HelpCircle, Info, Map, Users, FileText, Pencil, Mail, ExternalLink, UserPlus,
  Search, Phone, Copy, RotateCcw, BarChart3, Target, Workflow, ShieldCheck, Globe2, TrendingUp, Building2, ArrowRight,
  MapPin, Share2, Briefcase,
} from 'lucide-react';
import { UiLanguage } from '../types';
import { flattenStrings } from '../utils/flattenStrings';
import { UI_STRINGS, ABOUT_PAGE_DEFAULT, SERVICES_PILLARS } from '../../../../src/data/translations';
import { SEED_SERVICES } from '../../seed';

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
  { key: 'service_modal',     label: 'Xidmət Müraciəti Modal',     icon: Briefcase,      group: 'Əsas Səhifə' },
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
  // ── Əsas Səhifə & Daxili Səhifə Hero Görsəlləri ──
  { key: 'HERO_IMAGE',                   label: 'Hero Arxa Fon (Ana Səhifə)',       defaultUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9ZWqLLmb30gHFdTBf7cfY60pAMzYSTWRn2keRDZ7k8a3eQicd1I5xuOR1U44ux_eyOl79BjhxRaXdEbzovzXexqRo8oDy3gVECJAAKnDsq1DYgw7oR-p-U-VjFeMqmdwPl27SJVIP7hTVWchM1LYBR1EY2hy5C8iSkUcytv0qKVFgxmbifXswWW8UTnyUsQw5XBb81qNG2tremLOg_k5EPGCl-K_AWwSN8UQ3T1EN7HyePk3pvGD9' },
  { key: 'SERVICES_HERO_IMAGE',          label: 'Xidmətlər Səhifəsi Hero Arxa Fon', defaultUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&q=80' },
  { key: 'PRODUCTS_HERO_IMAGE',          label: 'Məhsul Kataloqu Hero Arxa Fon',    defaultUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&q=80' },
  { key: 'HOW_IT_WORKS_HERO_IMAGE',      label: 'Necə İşləyir Hero Arxa Fon',       defaultUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&q=80' },
  { key: 'BUYER_CARD_IMAGE',             label: 'Alıcı Kartı Görseli',              defaultUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHfBjlFdQNaNAsP2RbAdqbBzskyL-GFgkaTpjwu0U6iT-t0tvmdQxrsHV7DOVkxLI4TCvj6qWpEawxqKJPqQE9f5GeXtwvTu7-fs3s495aRNM41LY0ardk4_DhtXk2RrKbiZgwssXvlrrI_EThET-4vRXO-9SbspxRcE3KXflGW-LnO8LzAq_bYYS10R-r010CzBLBwMqbd6slv40ntEvn3OyeauJszJaHkxnHTcGCq-0XAIDQmj6_' },
  { key: 'PRODUCER_CARD_IMAGE',          label: 'İstehsalçı Kartı Görseli',         defaultUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgrvRVBxN_YV05A8C2ZBQC2V2WHmgN9IrmvxhBvoVre7FKYjEbaR95Ew5PqX6-T-FG67u-0fHLCX6KeLtUrAkBIiJfWZGu7t3Ez2RyKvMerWTAHV1ROVLxhP4wE2oqLK-k9t1i6hrPmq-YJ-GDzjbqNDrNf2-SyjbXUmuQAJa5ScuKsRahZQdVKWyzFzRNPNYzxr3XOkiIb2BLWy4KJO-b-RWiNaaRqebQkQINqnQZfyBkDjpvxMId' },
  { key: 'BUYER_HERO_IMAGE',             label: 'Alıcı Portalı Hero Arxa Fon',      defaultUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1600&q=80' },
  { key: 'PRODUCER_HERO_IMAGE',          label: 'İstehsalçı Portalı Hero Arxa Fon', defaultUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&q=80' },
  { key: 'WHY_AZERBAIJAN_IMAGE',         label: 'Niyə Azərbaycan Görseli',          defaultUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1WtUBR_2hOeUbRABsre_R7H-yW12FldWdxDp_6_abkiZuNwgF3fMTiwxdQCKdfEbdEWa-6CSQc0bQgUbjojei2itk13mAz_e09yOnKuFWP_7AO2BpMiNUQByyYnqtrPMywT0b4g4COdLkLc5_L75NtOsKv5OOgHz7VdAMCF-WDWgmhqccS9HdQKKY8cwD4AeVg_Z5AczT8rfvCVFXyJrgDuQKAsNiyYL54OeN2_HoFxHi9ltf4bUcbHSmM' },
  { key: 'HOW_IT_WORKS_BUYERS_IMAGE',    label: 'Necə İşləyir — Alıcılar Görseli',  defaultUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80' },
  { key: 'HOW_IT_WORKS_SELLERS_IMAGE',   label: 'Necə İşləyir — Satıcılar Görseli', defaultUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80' },

  // ── Haqqımızda & Korporativ Görsəllər ──
  { key: 'ABOUT_WHO_WE_ARE_IMAGE',       label: 'Haqqımızda — Biz Kimik Şəkli',    defaultUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80' },
  { key: 'ABOUT_MISSION_IMAGE',          label: 'Haqqımızda — Missiya Şəkli',       defaultUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80' },
  { key: 'ABOUT_VISION_IMAGE',           label: 'Haqqımızda — Viziya Şəkli',        defaultUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80' },

  // ── İxrac Sektorları (Haqqımızda Səhifəsi) ──
  { key: 'ABOUT_SECTOR_0_IMAGE',         label: 'Sektor 1: Kənd Təsərrüfatı & Qida', defaultUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80' },
  { key: 'ABOUT_SECTOR_1_IMAGE',         label: 'Sektor 2: Emal Sənayesi',          defaultUrl: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=400&q=80' },
  { key: 'ABOUT_SECTOR_2_IMAGE',         label: 'Sektor 3: Tikinti Materialları',   defaultUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80' },
  { key: 'ABOUT_SECTOR_3_IMAGE',         label: 'Sektor 4: Sənaye & Metal',         defaultUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80' },
  { key: 'ABOUT_SECTOR_4_IMAGE',         label: 'Sektor 5: Kimya & Xammal',         defaultUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&q=80' },
  { key: 'ABOUT_SECTOR_5_IMAGE',         label: 'Sektor 6: Elektrik & Avadanlıq',   defaultUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80' },
  { key: 'ABOUT_SECTOR_6_IMAGE',         label: 'Sektor 7: Tekstil & Yüngül Sənaye', defaultUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { key: 'ABOUT_SECTOR_7_IMAGE',         label: 'Sektor 8: Qablaşdırma & Mallar',   defaultUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=80' },
];

export const CATEGORY_TILES_CONFIG = [
  {
    key: 'industrial',
    label: 'Sənaye və Tekstil',
    defaultCount: 158,
    defaultImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
  },
  {
    key: 'agro',
    label: 'Kənd Təsərrüfatı və Təzə Məhsullar',
    defaultCount: 85,
    defaultImage: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80',
  },
  {
    key: 'construction',
    label: 'Tikinti Materialları',
    defaultCount: 66,
    defaultImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80',
  },
  {
    key: 'packaging',
    label: 'Qablaşdırma və Kisələr',
    defaultCount: 42,
    defaultImage: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
  },
  {
    key: 'chemicals',
    label: 'Kimya və Ekstraktlar',
    defaultCount: 36,
    defaultImage: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=600&q=80',
  },
  {
    key: 'food',
    label: 'Qida Məhsulları',
    defaultCount: 3,
    defaultImage: 'https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=600&q=80',
  },
  {
    key: 'metals',
    label: 'Metallurgiya və Polad',
    defaultCount: 0,
    defaultImage: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
  },
  {
    key: 'textile',
    label: 'Tekstil və Xalça',
    defaultCount: 0,
    defaultImage: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80',
  },
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

// ── Common Icon Picker for FontAwesome Icons ────────────────────────────
export const AVAILABLE_FA_ICONS = [
  { cls: 'fa-regular fa-circle-check', label: 'Check Circle (Seçim / Yoxlanmış)' },
  { cls: 'fa-solid fa-circle-check', label: 'Solid Check (Təsdiqlənmiş)' },
  { cls: 'fa-solid fa-globe', label: 'Qlobal / Dünya (Globe)' },
  { cls: 'fa-solid fa-earth-americas', label: 'Dünya Xəritəsi' },
  { cls: 'fa-solid fa-chart-line', label: 'Bazar / Qrafik (Chart Line)' },
  { cls: 'fa-solid fa-chart-pie', label: 'Diaqram / Analitika' },
  { cls: 'fa-regular fa-clipboard', label: 'Sənəd / Qeydiyyat (Clipboard)' },
  { cls: 'fa-solid fa-file-contract', label: 'Müqavilə (Contract)' },
  { cls: 'fa-solid fa-truck', label: 'Yük Maşını / TIR (Truck)' },
  { cls: 'fa-solid fa-truck-fast', label: 'Sürətli Çatdırılma' },
  { cls: 'fa-solid fa-ship', label: 'Gəmi / Dəniz Nəqliyyatı (Ship)' },
  { cls: 'fa-solid fa-plane-departure', label: 'Təyyarə / Hava Yükü' },
  { cls: 'fa-solid fa-train', label: 'Qatar / Dəmir Yolu' },
  { cls: 'fa-solid fa-warehouse', label: 'Anbar / Saxlama' },
  { cls: 'fa-solid fa-boxes-stacked', label: 'Yüklər / Qutular' },
  { cls: 'fa-solid fa-location-dot', label: 'Məkan / Mövqe (Location Dot)' },
  { cls: 'fa-solid fa-map-location-dot', label: 'Xəritə Məkanı' },
  { cls: 'fa-solid fa-cubes-stacked', label: 'Sənaye / Kublar (Cubes)' },
  { cls: 'fa-solid fa-industry', label: 'Fabrik / Sənaye (Industry)' },
  { cls: 'fa-solid fa-factory', label: 'İstehsal Müəssisəsi (Factory)' },
  { cls: 'fa-solid fa-seedling', label: 'Aqrar / Bitki / İnkişaf (Seedling)' },
  { cls: 'fa-solid fa-wheat-awn', label: 'Buğda / Kənd Təsərrüfatı' },
  { cls: 'fa-solid fa-apple-whole', label: 'Meyvə / Qida' },
  { cls: 'fa-solid fa-shield-halved', label: 'Təhlükəsizlik / Zəmanət (Shield)' },
  { cls: 'fa-solid fa-award', label: 'Mükafat / Keyfiyyət Sertifikatı' },
  { cls: 'fa-solid fa-certificate', label: 'Sertifikat (Certificate)' },
  { cls: 'fa-solid fa-store', label: 'Mağaza / Ticarət (Store)' },
  { cls: 'fa-solid fa-shop', label: 'Satış / Topdansatış' },
  { cls: 'fa-solid fa-network-wired', label: 'Şəbəkə / Tərəfdaşlıq (Network)' },
  { cls: 'fa-solid fa-users', label: 'İstifadəçilər / Komanda' },
  { cls: 'fa-solid fa-handshake', label: 'Əməkdaşlıq / Razılaşma' },
  { cls: 'fa-solid fa-scale-balanced', label: 'Gömrük / Hüquq / Uyğunluq' },
  { cls: 'fa-solid fa-flask', label: 'Laboratoriya / Sınaq' },
  { cls: 'fa-solid fa-magnifying-glass', label: 'Axtarış / Araşdırma' },
  { cls: 'fa-solid fa-bullseye', label: 'Hədəf Bazar / Strategiya' },
  { cls: 'fa-solid fa-bolt', label: 'Sürət / Enerji' },
  { cls: 'fa-solid fa-briefcase', label: 'Biznes / Portfel' },
  { cls: 'fa-solid fa-building', label: 'Korporativ / Bina' },
  { cls: 'fa-solid fa-coins', label: 'Maliyyə / Valyuta' },
];

export const IconPickerDropdown: React.FC<{
  value: string;
  onChange: (val: string) => void;
  label?: string;
}> = ({ value, onChange, label = 'İkon' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');

  const filteredIcons = AVAILABLE_FA_ICONS.filter(
    (ic) => ic.cls.toLowerCase().includes(filter.toLowerCase()) || ic.label.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="relative">
      {label && <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-8 px-2.5 bg-white border border-slate-200 hover:border-[#0f3156] rounded-sm flex items-center justify-between gap-2 text-xs text-slate-700 shadow-2xs transition-colors"
      >
        <div className="flex items-center gap-2 truncate">
          <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center shrink-0 text-[#0f3156]">
            <i className={value || 'fa-solid fa-circle-check'}></i>
          </div>
          <span className="truncate font-mono text-[11px]">
            {AVAILABLE_FA_ICONS.find((ic) => ic.cls === value)?.label || value || 'İkon seçin'}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded shadow-xl p-2 max-h-64 overflow-y-auto space-y-2">
          <div className="sticky top-0 bg-white pb-1 border-b border-slate-100">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="İkon axtar (məs: truck, globe, ship)..."
              className="w-full h-7 px-2 text-xs border border-slate-200 rounded focus:outline-none focus:border-[#0f3156]"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-1 gap-1">
            {filteredIcons.map((ic) => {
              const isSelected = ic.cls === value;
              return (
                <button
                  key={ic.cls}
                  type="button"
                  onClick={() => {
                    onChange(ic.cls);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-2 py-1.5 rounded text-left text-xs transition-colors ${
                    isSelected ? 'bg-[#0f3156] text-white' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-sm shrink-0 ${isSelected ? 'text-white' : 'text-[#0f3156]'}`}>
                    <i className={ic.cls}></i>
                  </div>
                  <div className="truncate flex-1">
                    <div className="font-medium text-[11px] truncate">{ic.label}</div>
                    <div className={`text-[9px] font-mono truncate ${isSelected ? 'text-slate-200' : 'text-slate-400'}`}>{ic.cls}</div>
                  </div>
                  {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

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
const PILLAR_LOCS = ['AZ', 'EN', 'TR', 'RU', 'AR', 'ES'] as const;

const PILLAR_LANG_TABS = [
  { code: 'ALL', label: 'Bütün Dillər', flag: '🌐' },
  { code: 'TR', label: 'Türkçe', flag: '🇹🇷', badge: 'Önəmli' },
  { code: 'ES', label: 'Español', flag: '🇪🇸', badge: 'Önəmli' },
  { code: 'AZ', label: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'EN', label: 'English', flag: '🇬🇧' },
  { code: 'RU', label: 'Русский', flag: '🇷🇺' },
  { code: 'AR', label: 'العربية', flag: '🇸🇦' },
] as const;

type PillarLangCode = typeof PILLAR_LANG_TABS[number]['code'];

const mergeServicePillarsWithDefaults = (services: any[]): any[] => {
  if (!Array.isArray(services) || services.length === 0) {
    return SERVICES_PILLARS;
  }
  const knownIds = new Set(SERVICES_PILLARS.map((p) => p.id));
  const merged = SERVICES_PILLARS.map((defPillar, idx) => {
    const saved = services.find((s) => s?.id === defPillar.id) || services[idx];
    if (!saved) return defPillar;

    const mergeLoc = (savedObj: any, defObj: any) => {
      const result: any = { ...(defObj || {}) };
      if (savedObj && typeof savedObj === 'object') {
        for (const loc of ['EN', 'AZ', 'TR', 'RU', 'AR', 'ES']) {
          if (savedObj[loc] !== undefined && savedObj[loc] !== null && String(savedObj[loc]).trim().length > 0) {
            result[loc] = savedObj[loc];
          }
        }
      }
      return result;
    };

    const items = (defPillar.items || []).map((defItem, itemIdx) => {
      const savedItem = saved.items?.[itemIdx];
      if (!savedItem) return defItem;
      if (typeof savedItem === 'string') {
        return { ...defItem, AZ: savedItem };
      }
      return mergeLoc(savedItem, defItem);
    });

    if (Array.isArray(saved.items) && saved.items.length > (defPillar.items || []).length) {
      for (let i = (defPillar.items || []).length; i < saved.items.length; i++) {
        items.push(saved.items[i]);
      }
    }

    return {
      ...defPillar,
      ...saved,
      id: defPillar.id,
      iconClass: saved.iconClass || defPillar.iconClass,
      colorClass: saved.colorClass || defPillar.colorClass,
      linkColorClass: saved.linkColorClass || defPillar.linkColorClass,
      turnaround: saved.turnaround || defPillar.turnaround,
      title: mergeLoc(saved.title, defPillar.title),
      subtitle: mergeLoc(saved.subtitle, defPillar.subtitle),
      items,
      deliverables: saved.deliverables || defPillar.deliverables,
    };
  });

  const extraPillars = services.filter((s) => s?.id && !knownIds.has(s.id));
  return [...merged, ...extraPillars];
};

const ServicePillarEditor = React.memo(({ content, onChange, onSaveContent, saving, saved }: ServicePillarEditorProps) => {
  const [activeTab, setActiveTab] = useState<PillarLangCode>('ALL');
  const [restoreNotice, setRestoreNotice] = useState<string | null>(null);

  // Seed from the saved content merged with defaults so TR and ES are always present
  const [pillars, setPillars] = useState<any[]>(() =>
    mergeServicePillarsWithDefaults(content?.services)
  );

  // Synchronize when content.services updates from backend
  useEffect(() => {
    if (Array.isArray(content?.services) && content.services.length > 0) {
      setPillars(mergeServicePillarsWithDefaults(content.services));
    }
  }, [content?.services]);

  const applyChange = (nextPillars: any[]) => {
    setPillars(nextPillars);
    onChange((prev: any) => ({ ...prev, services: nextPillars }));
  };

  const handleRestoreDefaults = () => {
    if (confirm('Bütün xidmət kartlarının çatışmayan tərcümələri (TR və ES daxil) sistem standartları ilə doldurulsun?')) {
      const merged = mergeServicePillarsWithDefaults(pillars);
      applyChange(merged);
      setRestoreNotice('Standart tərcümələr uğurla tətbiq edildi! Saxlamağı unutmayın.');
      setTimeout(() => setRestoreNotice(null), 4000);
    }
  };

  const updatePillar = (id: string, updater: (p: any) => any) => {
    applyChange(pillars.map((p: any) => (p.id === id ? updater(p) : p)));
  };

  const addPillar = () => {
    const newId = `service-${Date.now().toString(36).slice(-4)}`;
    const newPillar = {
      id: newId,
      iconClass: 'fa-solid fa-chart-line',
      colorClass: 'bg-brandNavy',
      linkColorClass: 'text-brandNavy',
      title: { AZ: 'Yeni Xidmət', EN: 'New Service', TR: 'Yeni Hizmet', RU: 'Новая услуga', AR: '', ES: 'Nuevo Servicio' },
      subtitle: { AZ: 'Xidmət haqqında qısa izah', EN: 'Brief service description', TR: 'Hizmet hakkında kısa açıklama', RU: '', AR: '', ES: 'Descripción breve del servicio' },
      turnaround: '3–5 Days',
      items: [
        { AZ: 'Yeni Maddə 1', EN: 'Item 1', TR: 'Madde 1', RU: '', AR: '', ES: 'Elemento 1' },
        { AZ: 'Yeni Maddə 2', EN: 'Item 2', TR: 'Madde 2', RU: '', AR: '', ES: 'Elemento 2' },
      ],
      deliverables: []
    };
    applyChange([...pillars, newPillar]);
  };

  const removePillar = (id: string) => {
    if (confirm('Bu xidmət kartını silmək istədiyinizdən əminsiniz?')) {
      applyChange(pillars.filter((p: any) => p.id !== id));
    }
  };

  const setPillarLoc = (id: string, field: 'title' | 'subtitle', loc: string, value: string) => {
    updatePillar(id, (p: any) => ({ ...p, [field]: { ...(p[field] || {}), [loc]: value } }));
  };

  const setPillarTurnaround = (id: string, value: string) => {
    updatePillar(id, (p: any) => ({ ...p, turnaround: value }));
  };

  const setPillarIcon = (id: string, iconClass: string) => {
    updatePillar(id, (p: any) => ({ ...p, iconClass }));
  };

  const setPillarColor = (id: string, colorClass: string) => {
    updatePillar(id, (p: any) => ({ ...p, colorClass }));
  };

  const setPillarItemLoc = (id: string, idx: number, loc: string, value: string) => {
    updatePillar(id, (p: any) => {
      const items = [...(p.items || [])];
      const cur = items[idx];
      const curObj = typeof cur === 'object' && cur !== null
        ? { ...cur }
        : { AZ: String(cur || ''), EN: String(cur || ''), TR: '', RU: '', AR: '', ES: '' };
      curObj[loc] = value;
      items[idx] = curObj;
      return { ...p, items };
    });
  };

  const addItemToPillar = (id: string, afterIdx?: number) => {
    updatePillar(id, (prev: any) => {
      const items = [...(prev.items || [])];
      const newItem = { AZ: '', EN: '', TR: '', RU: '', AR: '', ES: '' };
      if (typeof afterIdx === 'number') {
        items.splice(afterIdx + 1, 0, newItem);
      } else {
        items.push(newItem);
      }
      return { ...prev, items };
    });
  };

  const removeItemFromPillar = (id: string, idx: number) => {
    updatePillar(id, (prev: any) => ({
      ...prev,
      items: (prev.items || []).filter((_: any, i: number) => i !== idx)
    }));
  };

  return (
    <div className="space-y-4">
      {/* Top Bar with Language Tabs & Action Controls */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <Globe2 className="w-3.5 h-3.5 text-brandNavy" />
              Xidmət Kartları & Tərcümələrin Detallı Redaktəsi
            </div>
            <div className="text-[11px] text-slate-500">
              Türkcə (TR) və İspanyolca (ES) daxil olmaqla bütün dillərdə başlıq, izah və bəndləri ayrıca redaktə edə bilərsiniz.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="h-7 px-2.5 flex items-center gap-1 text-[11px] font-semibold rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors cursor-pointer shadow-2xs"
              title="Sistemdəki TR və ES tərcümələrini bərpa et"
            >
              <RotateCcw className="w-3 h-3 text-brandGreen" /> Standart Tərcümələri Bərpa Et
            </button>
            <button
              type="button"
              onClick={addPillar}
              className="h-7 px-2.5 flex items-center gap-1 text-[11px] font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Yeni Kart (+)
            </button>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 border-t border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 font-mono">
            Dil Seçimi:
          </span>
          {PILLAR_LANG_TABS.map((tab) => {
            const isActive = activeTab === tab.code;
            return (
              <button
                key={tab.code}
                type="button"
                onClick={() => setActiveTab(tab.code)}
                className={`h-7 px-2.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-[#0f3156] text-white border-[#0f3156] shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{tab.flag}</span>
                <span>{tab.label}</span>
                {'badge' in tab && tab.badge && (
                  <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                    isActive ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {restoreNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{restoreNotice}</span>
        </div>
      )}

      {/* Active Language Helper Banner */}
      {activeTab !== 'ALL' && (
        <div className="bg-blue-50/60 border border-blue-200/80 rounded-lg p-2.5 text-xs text-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{PILLAR_LANG_TABS.find(t => t.code === activeTab)?.flag}</span>
            <div>
              <span className="font-bold">
                {PILLAR_LANG_TABS.find(t => t.code === activeTab)?.label} ({activeTab})
              </span>{' '}
              dilində detallı redaktə rejimindəsiniz. Aşağıdakı sahələri geniş şəkildə redaktə edin.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className="text-[11px] font-bold text-blue-700 hover:underline shrink-0 ml-3"
          >
            Bütün Dilləri Göstər →
          </button>
        </div>
      )}

      {/* List of Pillars */}
      {pillars.map((p: any, pIdx: number) => {
        const azTitle = p.title?.AZ || '';
        const enTitle = p.title?.EN || '';
        const azSubtitle = p.subtitle?.AZ || '';
        const enSubtitle = p.subtitle?.EN || '';

        return (
          <div key={p.id} className="border border-slate-200/90 rounded-lg p-4 bg-white space-y-3.5 shadow-2xs">
            {/* Header of Pillar Card */}
            <div className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${p.colorClass || 'bg-brandNavy'} flex items-center justify-center text-white text-base shadow-xs`}>
                  <i className={`${p.iconClass || 'fa-solid fa-circle-check'}`}></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] flex items-center justify-center font-bold">
                      0{pIdx + 1}
                    </span>
                    <span>{p.title?.AZ || p.title?.EN || p.id}</span>
                    {p.title?.TR && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        (TR: {p.title.TR})
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    ID: <span className="font-semibold text-slate-600">{p.id}</span> {p.turnaround ? `· SLA: ${p.turnaround}` : ''}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removePillar(p.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                title="Kartı Sil (-)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Settings (Icon, Color, SLA) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-2.5 bg-slate-50/70 rounded-md border border-slate-100">
              <IconPickerDropdown
                label="Kartın İkonu"
                value={p.iconClass || 'fa-solid fa-circle-check'}
                onChange={(newIcon) => setPillarIcon(p.id, newIcon)}
              />
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Kart Rəngi</label>
                <select
                  value={p.colorClass || 'bg-brandNavy'}
                  onChange={(e) => setPillarColor(p.id, e.target.value)}
                  className="w-full h-8 text-xs bg-white border border-slate-200 rounded px-2.5 focus:outline-none focus:border-[#0f3156]"
                >
                  <option value="bg-brandNavy">Navy (#0f3156)</option>
                  <option value="bg-emerald-600">Emerald</option>
                  <option value="bg-sky-600">Sky</option>
                  <option value="bg-purple-600">Purple</option>
                  <option value="bg-amber-500">Amber</option>
                  <option value="bg-rose-600">Rose</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Turnaround / SLA</label>
                <input
                  value={p.turnaround || ''}
                  onChange={(e) => setPillarTurnaround(p.id, e.target.value)}
                  placeholder="məs: 5 Business Days"
                  className="w-full h-8 text-xs bg-white border border-slate-200 rounded px-2.5 focus:outline-none focus:border-[#0f3156]"
                />
              </div>
            </div>

            {/* DEDICATED SINGLE-LANGUAGE EDITING VIEW */}
            {activeTab !== 'ALL' ? (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Kart Başlığı ({activeTab})
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Ref (EN): {enTitle || azTitle}
                      </span>
                    </div>
                    <input
                      value={(p.title as PillarLocText)?.[activeTab] || ''}
                      onChange={(e) => setPillarLoc(p.id, 'title', activeTab, e.target.value)}
                      placeholder={`Xidmət başlığını ${activeTab} dilində yazın`}
                      className="w-full h-8 text-xs bg-white border border-slate-300 rounded px-2.5 focus:outline-none focus:border-[#0f3156] font-medium"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Açıqlama / İzah ({activeTab})
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]" title={enSubtitle || azSubtitle}>
                        Ref: {enSubtitle || azSubtitle}
                      </span>
                    </div>
                    <input
                      value={(p.subtitle as PillarLocText)?.[activeTab] || ''}
                      onChange={(e) => setPillarLoc(p.id, 'subtitle', activeTab, e.target.value)}
                      placeholder={`Xidmət haqqında ətraflı izahı ${activeTab} dilində yazın`}
                      className="w-full h-8 text-xs bg-white border border-slate-300 rounded px-2.5 focus:outline-none focus:border-[#0f3156]"
                    />
                  </div>
                </div>

                {/* Single Language Items Checklist */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <i className="fa-solid fa-list-check text-brandNavy text-xs"></i>
                      Xidmət Alt Bəndləri ({activeTab}) — {p.items?.length || 0} bənd
                    </span>
                    <button
                      type="button"
                      onClick={() => addItemToPillar(p.id)}
                      className="h-6 px-2.5 flex items-center gap-1 text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Yeni Bənd Əlavə Et (+)
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(p.items || []).map((item: any, idx: number) => {
                      const itemVal = typeof item === 'object' ? item?.[activeTab] || '' : '';
                      const itemRefEn = typeof item === 'object' ? item?.EN || '' : '';
                      const itemRefAz = typeof item === 'object' ? item?.AZ || '' : String(item || '');

                      return (
                        <div key={idx} className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center text-[10px] text-slate-600 font-bold font-mono">
                                {idx + 1}
                              </span>
                              <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                                  AZ: {itemRefAz || '-'}
                                </span>
                                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                                  EN: {itemRefEn || '-'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                title="Aşağısına yeni bənd əlavə et (+)"
                                onClick={() => addItemToPillar(p.id, idx)}
                                className="h-6 px-2 text-[10px] font-bold text-emerald-700 bg-white hover:bg-emerald-50 border border-slate-200 rounded flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3" /> Əlavə et
                              </button>
                              <button
                                type="button"
                                title="Bu bəndi sil (-)"
                                onClick={() => removeItemFromPillar(p.id, idx)}
                                className="h-6 w-6 text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 rounded flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <input
                            value={itemVal}
                            onChange={(e) => setPillarItemLoc(p.id, idx, activeTab, e.target.value)}
                            placeholder={`Maddə ${idx + 1} (${activeTab} mətni)`}
                            className="w-full h-8 text-xs bg-white border border-slate-300 rounded px-2.5 focus:outline-none focus:border-[#0f3156] font-medium"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* MULTI-LANGUAGE ('ALL') EDITING VIEW */
              <div className="space-y-3 pt-1">
                {/* Titles and Subtitles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {PILLAR_LOCS.map((loc) => {
                    const isTrOrEs = loc === 'TR' || loc === 'ES';
                    return (
                      <div
                        key={loc}
                        className={`p-2.5 rounded-lg border ${
                          isTrOrEs ? 'bg-amber-50/40 border-amber-200' : 'bg-slate-50/70 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 flex items-center gap-1">
                            <span>{loc === 'TR' ? '🇹🇷 TR' : loc === 'ES' ? '🇪🇸 ES' : loc === 'AZ' ? '🇦🇿 AZ' : loc === 'EN' ? '🇬🇧 EN' : loc === 'RU' ? '🇷🇺 RU' : '🇸🇦 AR'}</span>
                          </span>
                          {isTrOrEs && (
                            <span className="text-[9px] font-bold text-amber-700 uppercase">Detallı</span>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <input
                            value={(p.title as PillarLocText)?.[loc] || ''}
                            onChange={(e) => setPillarLoc(p.id, 'title', loc, e.target.value)}
                            placeholder={`Başlıq (${loc})`}
                            className="w-full h-7 text-[11px] bg-white border border-slate-200 rounded px-2 focus:outline-none focus:border-[#0f3156] font-medium"
                          />
                          <input
                            value={(p.subtitle as PillarLocText)?.[loc] || ''}
                            onChange={(e) => setPillarLoc(p.id, 'subtitle', loc, e.target.value)}
                            placeholder={`Açıqlama (${loc})`}
                            className="w-full h-7 text-[11px] bg-white border border-slate-200 rounded px-2 focus:outline-none focus:border-[#0f3156]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Items Checklist for ALL */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <i className="fa-solid fa-list-check text-brandNavy text-xs"></i>
                      Kart Daxili Maddələr ({p.items?.length || 0} bənd)
                    </span>
                    <button
                      type="button"
                      onClick={() => addItemToPillar(p.id)}
                      className="h-6 px-2.5 flex items-center gap-1 text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Başlıq Əlavə Et (+)
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(p.items || []).map((item: any, idx: number) => {
                      const itemAz = typeof item === 'object' ? item.AZ || '' : String(item || '');
                      const itemEn = typeof item === 'object' ? item.EN || '' : '';
                      return (
                        <div key={idx} className="border border-slate-200 rounded p-2.5 bg-slate-50/60 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700 font-mono flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                                {idx + 1}
                              </span>
                              {itemAz || itemEn || `Maddə #${idx + 1}`}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                title="Aşağısına yeni başlıq əlavə et (+)"
                                onClick={() => addItemToPillar(p.id, idx)}
                                className="h-6 px-2 text-[10px] font-bold text-emerald-700 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3" /> Əlavə et
                              </button>
                              <button
                                type="button"
                                title="Bu başlığı sil (-)"
                                onClick={() => removeItemFromPillar(p.id, idx)}
                                className="h-6 w-6 text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Multilingual inputs for this item */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
                            {PILLAR_LOCS.map((loc) => {
                              const isTrOrEs = loc === 'TR' || loc === 'ES';
                              return (
                                <div key={loc} className="relative">
                                  <input
                                    value={(item as any)?.[loc] ?? (loc === 'AZ' && typeof item === 'string' ? item : '')}
                                    onChange={(e) => setPillarItemLoc(p.id, idx, loc, e.target.value)}
                                    placeholder={loc}
                                    className={`h-7 text-[11px] bg-white border rounded px-2 pr-7 focus:outline-none focus:border-[#0f3156] w-full ${
                                      isTrOrEs ? 'border-amber-300 font-medium' : 'border-slate-200'
                                    }`}
                                  />
                                  <span className={`absolute right-1.5 top-1.5 text-[9px] font-bold pointer-events-none font-mono ${
                                    isTrOrEs ? 'text-amber-700' : 'text-slate-400'
                                  }`}>
                                    {loc}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={addPillar}
          className="h-8 px-3.5 flex items-center gap-1.5 text-xs font-bold rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Yeni Servis Kartı Əlavə Et (+)
        </button>
        <button
          type="button"
          onClick={() => onSaveContent({ ...content, services: pillars })}
          disabled={saving}
          className="h-8 px-5 flex items-center gap-2 text-xs font-bold rounded-sm bg-[#0f3156] hover:bg-[#081c33] text-white disabled:opacity-60 shadow-sm cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saxlanılır...' : 'Xidmət Kartlarını Yadda Saxla'}
        </button>
      </div>
      {saved && <div className="text-xs text-emerald-700 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Dəyişikliklər saxlanıldı</div>}
    </div>
  );
});

// ── Service Modal & Options Editor Component (+/- and Icon Picker) ───────────
interface ServiceModalEditorProps {
  content: any;
  onChange: (updater: (prev: any) => any) => void;
  onSaveContent: (data: any) => Promise<void>;
  saving: boolean;
  saved: boolean;
}

const ServiceModalEditor = React.memo(({ content, onChange, onSaveContent, saving, saved }: ServiceModalEditorProps) => {
  const [servicesList, setServicesList] = useState<any[]>(() => {
    if (Array.isArray(content?.cmsServices) && content.cmsServices.length > 0) {
      return content.cmsServices;
    }
    return SEED_SERVICES.map(s => ({ ...s }));
  });
  const [modalFilter, setModalFilter] = useState<'all' | 'primary' | 'secondary'>('all');

  // Synchronize when content.cmsServices changes from backend
  useEffect(() => {
    if (Array.isArray(content?.cmsServices) && content.cmsServices.length > 0) {
      setServicesList(content.cmsServices);
    }
  }, [content?.cmsServices]);

  const applyChange = (nextList: any[]) => {
    setServicesList(nextList);
    onChange((prev: any) => ({ ...prev, cmsServices: nextList }));
  };

  const updateItem = (id: string, updater: (item: any) => any) => {
    applyChange(servicesList.map((s: any) => (s.id === id ? updater(s) : s)));
  };

  const addServiceOption = (type: 'primary' | 'secondary' = 'primary') => {
    const newId = `srv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newItem = {
      id: newId,
      title: {
        AZ: 'Yeni Xidmət Seçimi',
        EN: 'New Service Selection',
        TR: 'Yeni Hizmet Seçeneği',
        RU: 'Новая опция услуги',
        AR: 'خيار خدمة جديد',
        ES: 'Nueva opción de servicio'
      },
      description: { AZ: '', EN: '', TR: '', RU: '', AR: '', ES: '' },
      targetAudience: {
        AZ: 'Hədəf auditoriya və ya qısa alt başlıq',
        EN: 'Target audience or brief subtext',
        TR: 'Hedef kitle veya kısa açıklama',
        RU: 'Целевая аудитория или краткое описание',
        AR: 'الجمهور المستهدف أو النص الفرعي',
        ES: 'Público objetivo o subtítulo'
      },
      scope: { AZ: [], EN: [], TR: [], RU: [], AR: [], ES: [] },
      iconClass: type === 'primary' ? 'fa-solid fa-chart-line' : 'fa-solid fa-briefcase',
      colorClass: type === 'primary' ? 'bg-[#0f3156]' : 'bg-slate-700',
      serviceType: type,
      category: 'Export',
      isActive: true,
      sortOrder: servicesList.length + 1,
    };
    applyChange([...servicesList, newItem]);
  };

  const removeServiceOption = (id: string) => {
    if (confirm('Bu xidmət seçimini müraciət modalından silmək istədiyinizə əminsiniz?')) {
      applyChange(servicesList.filter((s: any) => s.id !== id));
    }
  };

  const setItemLoc = (id: string, field: 'title' | 'targetAudience', loc: string, value: string) => {
    updateItem(id, (s: any) => ({
      ...s,
      [field]: { ...(s[field] || {}), [loc]: value }
    }));
  };

  const filteredServices = servicesList.filter(s => {
    if (modalFilter === 'all') return true;
    return s.serviceType === modalFilter;
  });

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 border border-slate-200/90 rounded-lg shadow-2xs">
        <div>
          <div className="text-xs font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Xidmət Müraciəti Seçimləri (+/- İdarəetmə)
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Müştərinin "Xidmət Müraciəti" modalında gördüyü xidmət kartlarını artırıb-azaldın, ikonlarını canlı önizləmə ilə dəyişin.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-100 p-0.5 rounded text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setModalFilter('all')}
              className={`px-2 py-1 rounded transition-colors ${modalFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Hamısı ({servicesList.length})
            </button>
            <button
              type="button"
              onClick={() => setModalFilter('primary')}
              className={`px-2 py-1 rounded transition-colors ${modalFilter === 'primary' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Əsas ({servicesList.filter(s => s.serviceType === 'primary').length})
            </button>
            <button
              type="button"
              onClick={() => setModalFilter('secondary')}
              className={`px-2 py-1 rounded transition-colors ${modalFilter === 'secondary' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Əlavə ({servicesList.filter(s => s.serviceType === 'secondary').length})
            </button>
          </div>
          <button
            type="button"
            onClick={() => addServiceOption('primary')}
            className="h-7 px-2.5 flex items-center gap-1.5 text-[11px] font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> + Əsas Xidmət
          </button>
          <button
            type="button"
            onClick={() => addServiceOption('secondary')}
            className="h-7 px-2.5 flex items-center gap-1.5 text-[11px] font-bold rounded bg-slate-700 hover:bg-slate-800 text-white shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> + Əlavə Xidmət
          </button>
        </div>
      </div>

      {/* List of service items */}
      <div className="space-y-3">
        {filteredServices.map((srv: any, idx: number) => {
          const isPrimary = srv.serviceType === 'primary';
          return (
            <div key={srv.id} className="border border-slate-200/90 rounded-lg p-3.5 bg-white space-y-3 shadow-2xs transition-all hover:border-slate-300">
              <div className="flex items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg ${srv.colorClass || (isPrimary ? 'bg-[#0f3156]' : 'bg-slate-700')} flex items-center justify-center text-white shrink-0 text-sm shadow-xs`}>
                    <i className={srv.iconClass || 'fa-solid fa-briefcase'}></i>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-2">
                      <span>{idx + 1}. {srv.title?.AZ || srv.title?.EN || srv.id}</span>
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${isPrimary ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {isPrimary ? 'Əsas xidmət' : 'Əlavə xidmət'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {srv.targetAudience?.AZ || srv.targetAudience?.EN || 'Alt izahat təyin olunmayıb'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      updateItem(srv.id, (prev: any) => ({
                        ...prev,
                        serviceType: prev.serviceType === 'primary' ? 'secondary' : 'primary'
                      }));
                    }}
                    className="px-2 py-1 text-[10px] font-bold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    title="Növü dəyiş (Əsas / Əlavə)"
                  >
                    Növü Dəyiş
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateItem(srv.id, (prev: any) => ({
                        ...prev,
                        isActive: !prev.isActive
                      }));
                    }}
                    className={`px-2 py-1 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                      srv.isActive !== false ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {srv.isActive !== false ? 'Aktiv' : 'Passiv'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeServiceOption(srv.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                    title="Bu Xidmət Seçimini Sil (-)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Icon Selector & Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <IconPickerDropdown
                  label="İkon Seçimi (Önizləməli FontAwesome)"
                  value={srv.iconClass || 'fa-solid fa-briefcase'}
                  onChange={(ic) => updateItem(srv.id, (prev: any) => ({ ...prev, iconClass: ic }))}
                />
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">İkon Fon Rəngi (Tailwind)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={srv.colorClass || 'bg-[#0f3156]'}
                      onChange={(e) => updateItem(srv.id, (prev: any) => ({ ...prev, colorClass: e.target.value }))}
                      placeholder="məs: bg-brandNavy, bg-emerald-600, bg-sky-600, bg-rose-600"
                      className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                    />
                    <div className={`w-8 h-8 rounded shrink-0 ${srv.colorClass || 'bg-[#0f3156]'} border border-slate-200 shadow-2xs`}></div>
                  </div>
                </div>
              </div>

              {/* Multilingual Titles (6 languages) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">
                  Xidmətin Başlığı (6 Dil)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PILLAR_LOCS.map((loc) => (
                    <div key={loc} className="flex items-center gap-1.5 bg-slate-50/70 border border-slate-200 rounded px-2 py-1">
                      <span className="text-[9px] font-bold text-slate-400 font-mono w-4">{loc}</span>
                      <input
                        type="text"
                        value={srv.title?.[loc] || ''}
                        onChange={(e) => setItemLoc(srv.id, 'title', loc, e.target.value)}
                        placeholder={`Başlıq (${loc})`}
                        className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Multilingual Target Audience / Subtitle (6 languages) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">
                  Alt İzah / Hədəf Auditoriya Mətni (6 Dil)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PILLAR_LOCS.map((loc) => (
                    <div key={loc} className="flex items-center gap-1.5 bg-slate-50/70 border border-slate-200 rounded px-2 py-1">
                      <span className="text-[9px] font-bold text-slate-400 font-mono w-4">{loc}</span>
                      <input
                        type="text"
                        value={srv.targetAudience?.[loc] || ''}
                        onChange={(e) => setItemLoc(srv.id, 'targetAudience', loc, e.target.value)}
                        placeholder={`Alt izah (${loc})`}
                        className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => addServiceOption('primary')}
            className="h-8 px-3.5 flex items-center gap-1.5 text-xs font-bold rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> + Əsas Xidmət Əlavə Et
          </button>
          <button
            type="button"
            onClick={() => addServiceOption('secondary')}
            className="h-8 px-3.5 flex items-center gap-1.5 text-xs font-bold rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> + Əlavə Xidmət Əlavə Et
          </button>
        </div>

        <button
          type="button"
          onClick={async () => {
            await onSaveContent({ ...content, cmsServices: servicesList });
            try {
              // Also sync with /api/azexbuy/services table
              for (const s of servicesList) {
                await fetch(`/api/azexbuy/services/${s.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                  body: JSON.stringify(s)
                }).catch(() => {});
              }
            } catch {}
          }}
          disabled={saving}
          className="h-8 px-5 flex items-center gap-2 text-xs font-bold rounded-sm bg-[#0f3156] hover:bg-[#081c33] text-white disabled:opacity-60 shadow-sm cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saxlanılır...' : 'Xidmət Müraciəti Seçimlərini Saxla'}
        </button>
      </div>

      {saved && (
        <div className="text-xs text-emerald-700 flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 p-2 rounded">
          <CheckCircle className="w-3.5 h-3.5" /> Xidmət müraciəti seçimləri uğurla yadda saxlanıldı!
        </div>
      )}
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
  const [page, setPage] = useState<PageKey>(() => {
    const saved = localStorage.getItem('azexbuy_cms_initial_page');
    if (saved) {
      localStorage.removeItem('azexbuy_cms_initial_page');
      return saved as PageKey;
    }
    return 'navbar';
  });
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

  const handleUpdateCatImageUrl = useCallback((catKey: string, url: string) => {
    setContent((prev: any) => ({
      ...prev,
      categoryImages: { ...(prev.categoryImages || {}), [catKey]: url },
    }));
  }, []);

  const handleUpdateCatCount = useCallback((catKey: string, countVal: number) => {
    setContent((prev: any) => ({
      ...prev,
      categoryCounts: { ...(prev.categoryCounts || {}), [catKey]: countVal },
    }));
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
        } else if (key.startsWith('category_')) {
          const catKey = key.replace('category_', '');
          const updated = {
            ...content,
            categoryImages: { ...(content.categoryImages || {}), [catKey]: url },
          };
          await saveContent(updated);
          load();
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
                  <p className="text-xs text-slate-500">Əsas səhifə, portallar, haqqımızda və 8 ixrac sektorunun 19 əsas şəklini buradan tək-tək dəyişdirin.</p>
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
          {page === 'why_azexbuy' && (() => {
            const DEFAULT_WHY_ITEMS = [
              {
                icon: 'fa-regular fa-circle-check',
                title: { AZ: 'Yoxlanılmış Təchizatçılar', EN: 'Verified Suppliers', TR: 'Doğrulanmış Tedarikçiler', RU: 'Проверенные поставщики', AR: '', ES: '' },
                desc: { AZ: 'Yalnız etibarlı Azərbaycan istehsalçıları ilə işləyirik.', EN: 'We work only with trusted Azerbaijani manufacturers.', TR: 'Yalnızca güvenilir Azerbaycan üreticileriyle çalışıyoruz.', RU: 'Мы работаем только с проверенными производителями Азербайджана.', AR: '', ES: '' },
                metric: '250+ Certified Facilities'
              },
              {
                icon: 'fa-solid fa-globe',
                title: { AZ: 'Qlobal Alıcı Çıxışı', EN: 'Global Buyer Access', TR: 'Küresel Alıcı Erişimi', RU: 'Доступ к глобальным покупателям', AR: '', ES: '' },
                desc: { AZ: 'Sizi beynəlxalq satınalma şəbəkələri ilə əlaqələndiririk.', EN: 'We connect you with international procurement networks.', TR: 'Sizi uluslararası satın alma ağlarıyla buluşturuyoruz.', RU: 'Мы связываем вас с международными сетями закупок.', AR: '', ES: '' },
                metric: '42 Export Destinations'
              },
              {
                icon: 'fa-solid fa-chart-line',
                title: { AZ: 'Bazar Analitikası', EN: 'Market Intelligence', TR: 'Pazar Analitiği', RU: 'Рыночная аналитика', AR: '', ES: '' },
                desc: { AZ: 'Daha dəqiq qərarlar üçün məlumat əsaslı təhlillər.', EN: 'Data-driven insights for better decisions.', TR: 'Daha isabetli kararlar için veri odaklı analizler.', RU: 'Аналитика на основе данных для точных решений.', AR: '', ES: '' },
                metric: 'HS-6 Tariff & Route Data'
              },
              {
                icon: 'fa-regular fa-clipboard',
                title: { AZ: 'Tam İxrac İdarəetməsi', EN: 'End-to-End Export', TR: 'Uçtan Uca İhracat Yönetimi', RU: 'Полное управление экспортом', AR: '', ES: '' },
                desc: { AZ: 'Tədarükdən çatdırılmaya qədər bütün prosesi idarə edirik.', EN: 'From sourcing to delivery, we manage the process.', TR: 'Tedarikten teslimata kadar tüm süreci yönetiyoruz.', RU: 'От закупки до поставки — мы управляем всем процессом.', AR: '', ES: '' },
                metric: 'Incoterms 2020 Desk'
              },
              {
                icon: 'fa-solid fa-truck',
                title: { AZ: 'Beynəlxalq Logistika', EN: 'International Logistics', TR: 'Uluslararası Lojistik', RU: 'Международная логистика', AR: '', ES: '' },
                desc: { AZ: 'Etibarlı və səmərəli multimodal nəqliyyat həlləri.', EN: 'Reliable and efficient multimodal transport solutions.', TR: 'Güvenilir ve verimli çok modlu taşımacılık çözümleri.', RU: 'Надежные и эффективные мультимодальные транспортные решения.', AR: '', ES: '' },
                metric: 'Middle Corridor Hub'
              }
            ];

            const curItems = Array.isArray(content.whyAzexbuy?.items) && content.whyAzexbuy.items.length > 0
              ? content.whyAzexbuy.items
              : DEFAULT_WHY_ITEMS;

            const updateWhyItems = (newItems: any[]) => {
              setContent((p: any) => ({
                ...p,
                whyAzexbuy: {
                  ...(p.whyAzexbuy || {}),
                  items: newItems,
                }
              }));
            };

            const addWhyCard = () => {
              const newCard = {
                icon: 'fa-solid fa-circle-check',
                title: { AZ: 'Yeni Üstünlük', EN: 'New Advantage', TR: 'Yeni Avantaj', RU: 'Новое преимущество', AR: '', ES: '' },
                desc: { AZ: 'Üstünlük haqqında qısa təsvir', EN: 'Description of advantage', TR: '', RU: '', AR: '', ES: '' },
                metric: '100% Quality'
              };
              updateWhyItems([...curItems, newCard]);
            };

            const removeWhyCard = (index: number) => {
              if (confirm('Bu üstünlük kartını silmək istədiyinizdən əminsiniz?')) {
                updateWhyItems(curItems.filter((_: any, i: number) => i !== index));
              }
            };

            const setWhyItemField = (index: number, fld: 'icon' | 'metric', val: string) => {
              const copy = [...curItems];
              copy[index] = { ...copy[index], [fld]: val };
              updateWhyItems(copy);
            };

            const setWhyItemLoc = (index: number, fld: 'title' | 'desc', loc: string, val: string) => {
              const copy = [...curItems];
              copy[index] = {
                ...copy[index],
                [fld]: { ...(copy[index][fld] || {}), [loc]: val }
              };
              updateWhyItems(copy);
            };

            return (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Niyə AZEXBUY? Bölməsi</h2>
                    <p className="text-xs text-slate-500">Ana səhifədəki üstünlük kartlarını (+/-) artırıb azaldın və ikonlarını seçin.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addWhyCard}
                    className="h-7 px-3 flex items-center gap-1.5 text-xs font-bold rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Yeni Kart Əlavə Et
                  </button>
                </div>

                <MultiLocF label="Bölmə Başlığı" strKey="whyAzexbuy.heading" locData={locData} onChange={handleMultiLocChange} />

                <div className="space-y-3 pt-2">
                  {curItems.map((item: any, i: number) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded bg-blue-50 text-brandNavy flex items-center justify-center text-sm">
                            <i className={item.icon || 'fa-solid fa-circle-check'}></i>
                          </div>
                          <span className="text-xs font-bold text-slate-800">
                            Kart #{i + 1} — {item.title?.AZ || item.title?.EN || `Kart ${i + 1}`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeWhyCard(i)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Kartı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* İkon Dropdown və Metrik */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <IconPickerDropdown
                          label="İkon (FontAwesome)"
                          value={item.icon || 'fa-solid fa-circle-check'}
                          onChange={(ic) => setWhyItemField(i, 'icon', ic)}
                        />
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Metrik / Etiket</label>
                          <input
                            type="text"
                            value={item.metric || ''}
                            onChange={(e) => setWhyItemField(i, 'metric', e.target.value)}
                            placeholder="məs: 250+ Certified Facilities"
                            className="w-full h-8 text-xs bg-white border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156]"
                          />
                        </div>
                      </div>

                      {/* Başlıq (6 Dil) */}
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Kart Başlığı (6 Dil)</div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                          {LOCALES.map(loc => (
                            <div key={loc} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded px-2 py-1">
                              <span className="text-[9px] font-bold text-slate-400 font-mono w-4">{loc}</span>
                              <input
                                type="text"
                                value={item.title?.[loc] || ''}
                                onChange={(e) => setWhyItemLoc(i, 'title', loc, e.target.value)}
                                placeholder={`Başlıq (${loc})`}
                                className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Açıqlama (6 Dil) */}
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Açıqlama Mətni (6 Dil)</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {LOCALES.map(loc => (
                            <div key={loc} className="bg-white border border-slate-200 rounded p-1.5">
                              <div className="text-[9px] font-bold text-slate-400 font-mono mb-1">{loc}</div>
                              <textarea
                                rows={2}
                                value={item.desc?.[loc] || ''}
                                onChange={(e) => setWhyItemLoc(i, 'desc', loc, e.target.value)}
                                placeholder={`Təsvir (${loc})`}
                                className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3">
                  <button
                    type="button"
                    onClick={addWhyCard}
                    className="h-8 px-3.5 flex items-center gap-1.5 text-xs font-bold rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Kart Əlavə Et
                  </button>
                  <SaveBar
                    onSave={async () => {
                      await saveContent(content);
                      await saveStrings(locData);
                    }}
                    saving={saving}
                    saved={saved}
                  />
                </div>
              </>
            );
          })()}

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

              <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider rounded">Səhifə Hero Görseli</div>
              <ImageField imgKey="SERVICES_HERO_IMAGE" label="Xidmətlər Səhifəsi Hero Banneri"
                content={content} uploading={uploading}
                onSaveContent={saveContent} onTriggerUpload={triggerUpload}
                onUpdateImgUrl={handleUpdateImgUrl} onPreview={setPreview}
                saving={saving} saved={saved} />

              <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase rounded mt-2">Hero və Bölmə Mətnləri</div>
              <MultiLocF label="Bölmə / Hero Başlığı" strKey="services.heading" locData={locData} onChange={handleMultiLocChange} />
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

          {/* ── SERVICE APPLICATION MODAL & OPTIONS (+/-) ── */}
          {page === 'service_modal' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-[#0f3156]/10 text-[#0f3156] flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Xidmət Müraciəti Modalı və Seçimləri</h2>
                    <p className="text-xs text-slate-500">
                      Pop-up müraciət pəncərəsindəki bütün xidmətləri (+/-) artırıb-azaldın, ikonlarını seçin və mətnləri tənzimləyin.
                    </p>
                  </div>
                </div>
              </div>

              <ServiceModalEditor
                content={content}
                onChange={(next) => setContent(next)}
                onSaveContent={saveContent}
                saving={saving}
                saved={saved}
              />
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
              <ImageField imgKey="HOW_IT_WORKS_HERO_IMAGE" label="Necə İşləyir Səhifəsi Hero Banneri"
                content={content} uploading={uploading}
                onSaveContent={saveContent} onTriggerUpload={triggerUpload}
                onUpdateImgUrl={handleUpdateImgUrl} onPreview={setPreview}
                saving={saving} saved={saved} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
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

              <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider rounded mt-2">Hero və Bölmə Mətnləri</div>
              <MultiLocF label="Bölmə / Hero Başlığı" strKey="howItWorks.heading" locData={locData} onChange={handleMultiLocChange} />
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

              <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider rounded">Səhifə Hero Görseli</div>
              <ImageField imgKey="PRODUCTS_HERO_IMAGE" label="Məhsullar Səhifəsi Hero Banneri"
                content={content} uploading={uploading}
                onSaveContent={saveContent} onTriggerUpload={triggerUpload}
                onUpdateImgUrl={handleUpdateImgUrl} onPreview={setPreview}
                saving={saving} saved={saved} />

              <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase rounded mt-2">Hero və Bölmə Mətnləri</div>
              <MultiLocF label="Bölmə / Hero Başlığı" strKey="featuredProducts.heading" locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label="Alt Başlıq" strKey="featuredProducts.subheading" multi locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label='"Bütün Məhsullar" Linki' strKey="featuredProducts.viewAll" locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label='"Bu Məhsulu Sifariş Et" Butonu' strKey="featuredProducts.requestProduct" locData={locData} onChange={handleMultiLocChange} />
              <MultiLocF label='"HS Kodu" Etiketi' strKey="featuredProducts.hsCodeLabel" locData={locData} onChange={handleMultiLocChange} />

              {/* ── Kateqoriya Görsəlləri və Məhsul Sayları ── */}
              <div className="mt-6 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Ana Səhifə Kateqoriya Görsəlləri və Sayları</h3>
                    <p className="text-xs text-slate-500">
                      İkonlar əvəzinə hər kateqoriyanın özünəməxsus yüksək keyfiyyətli şəklini yükləyin və göstəriləcək məhsul sayını tənzimləyin.
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                    {CATEGORY_TILES_CONFIG.length} Kateqoriya
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CATEGORY_TILES_CONFIG.map((cat) => {
                    const currentImg = content.categoryImages?.[cat.key] || cat.defaultImage;
                    const currentCount = typeof content.categoryCounts?.[cat.key] === 'number'
                      ? content.categoryCounts[cat.key]
                      : cat.defaultCount;
                    const isUploadingThis = uploading === `category_${cat.key}`;

                    return (
                      <div
                        key={cat.key}
                        className="bg-white border border-slate-200/90 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs hover:border-[#0f3156]/40 transition-all"
                      >
                        <div>
                          {/* Header with Title and Key */}
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="text-xs font-bold text-slate-800 leading-tight">{cat.label}</h4>
                              <span className="text-[10px] font-mono text-slate-400">kod: {cat.key}</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {currentCount} məhsul
                            </span>
                          </div>

                          {/* Image Preview */}
                          <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 border border-slate-200/80 relative mb-3 flex items-center justify-center group/thumb">
                            {currentImg ? (
                              <img
                                src={currentImg}
                                alt={cat.label}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = 'none';
                                  const parent = (e.currentTarget as HTMLElement).parentElement;
                                  if (parent && !parent.querySelector('.no-preview-tag')) {
                                    const fallback = document.createElement('div');
                                    fallback.className = 'no-preview-tag flex flex-col items-center justify-center text-slate-400 gap-1';
                                    fallback.innerHTML = '<span class="text-[10px] font-medium text-rose-500">Görsəl yüklənmədi</span>';
                                    parent.appendChild(fallback);
                                  }
                                }}
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
                                <ImgIcon className="w-6 h-6 text-slate-300" />
                                <span className="text-[10px] font-medium">Şəkil yoxdur</span>
                              </div>
                            )}
                            {isUploadingThis && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs gap-1.5 font-medium">
                                <RefreshCw className="w-4 h-4 animate-spin" /> Yüklənir...
                              </div>
                            )}
                          </div>

                          {/* URL input */}
                          <div className="space-y-1 mb-2.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-medium text-slate-600">Görsəl URL</label>
                              {content.categoryImages?.[cat.key] && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCatImageUrl(cat.key, '')}
                                  className="text-[10px] text-rose-500 hover:underline cursor-pointer"
                                >
                                  Təmizlə
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              value={content.categoryImages?.[cat.key] ?? ''}
                              placeholder={cat.defaultImage}
                              onChange={(e) => handleUpdateCatImageUrl(cat.key, e.target.value)}
                              className="w-full h-7 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded px-2 focus:outline-none focus:bg-white focus:border-[#0f3156]"
                            />
                          </div>

                          {/* Product Count Input */}
                          <div className="space-y-1 mb-3">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-medium text-slate-600">Göstəriləcək Məhsul Sayı</label>
                              <span className="text-[10px] text-slate-400 font-mono">defolt: {cat.defaultCount}</span>
                            </div>
                            <input
                              type="number"
                              min="0"
                              value={content.categoryCounts?.[cat.key] ?? cat.defaultCount}
                              onChange={(e) => handleUpdateCatCount(cat.key, parseInt(e.target.value, 10) || 0)}
                              className="w-full h-7 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded px-2 focus:outline-none focus:bg-white focus:border-[#0f3156]"
                            />
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => triggerUpload(`category_${cat.key}`)}
                            disabled={Boolean(uploading)}
                            className="flex-1 h-7 text-[11px] font-medium bg-[#0f3156]/5 text-[#0f3156] hover:bg-[#0f3156]/10 rounded flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Upload className="w-3 h-3" /> Şəkil Seç & Yüklə
                          </button>
                          {currentImg && (
                            <button
                              type="button"
                              onClick={() => setPreview(currentImg)}
                              className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded flex items-center justify-center transition-colors cursor-pointer"
                              title="Böyük Baxış"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateCatImageUrl(cat.key, cat.defaultImage);
                              handleUpdateCatCount(cat.key, cat.defaultCount);
                            }}
                            className="h-7 w-7 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded flex items-center justify-center transition-colors cursor-pointer"
                            title="Defolta Qaytar"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <SaveBar onSave={async () => { await saveContent(content); await saveStrings(locData); }} saving={saving} saved={saved} />
            </>
          )}

          {/* ── SERVICE APPLICATION MODAL & OPTIONS (+/-) ── */}
          {page === 'service_modal' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-[#0f3156]/10 text-[#0f3156] flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Xidmət Müraciəti Modalı və Seçimləri</h2>
                    <p className="text-xs text-slate-500">
                      Pop-up müraciət pəncərəsindəki bütün xidmətləri (+/-) artırıb-azaldın, ikonlarını seçin və mətnləri tənzimləyin.
                    </p>
                  </div>
                </div>
              </div>

              <ServiceModalEditor
                content={content}
                onChange={(next) => setContent(next)}
                onSaveContent={saveContent}
                saving={saving}
                saved={saved}
              />
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
          {page === 'why_azerbaijan' && (() => {
            const DEFAULT_AZ_FEATURES = [
              {
                icon: 'fa-solid fa-location-dot',
                line1: { AZ: 'Strateji', EN: 'Strategic', TR: 'Stratejik', RU: 'Стратегическое', AR: '', ES: '' },
                line2: { AZ: 'Mövqe', EN: 'Location', TR: 'Konum', RU: 'Положение', AR: '', ES: '' },
                detail: {
                  AZ: 'Bakı Limanı (Ələt) və BTQ dəmir yolu vasitəsilə Avropa, Mərkəzi Asiya və Yaxın Şərqi birləşdirən Orta Dəhliz mərkəzi.',
                  EN: 'Nexus of the Trans-Caspian Middle Corridor linking Europe, Central Asia, CIS, and MENA via Port of Baku (Alat) and BTK Railway.',
                  TR: 'Bakü Limanı (Alat) ve BTK demiryolu ile Avrupa, Orta Asya ve Orta Doğu\'yu bağlayan Orta Koridor merkezi.',
                  RU: 'Узел Транскаспийского Среднего коридора, соединяющий Европу, Центральную Азию и Ближний Восток.',
                  AR: '',
                  ES: ''
                }
              },
              {
                icon: 'fa-solid fa-cubes-stacked',
                line1: { AZ: 'Çoxşaxəli', EN: 'Diverse', TR: 'Çok Yönlü', RU: 'Диверсифицированная', AR: '', ES: '' },
                line2: { AZ: 'Sənaye', EN: 'Industries', TR: 'Sanayi', RU: 'Промышленность', AR: '', ES: '' },
                detail: {
                  AZ: '9 iqlim qurşağında kənd təsərrüfatı ilə yanaşı Sumqayıt kimya parkları, metallurgiya, tekstil və təbii daş sənayesi.',
                  EN: '9 climatic zones supporting premium agriculture alongside Sumgayit chemical parks, metallurgy, textiles, and natural stone.',
                  TR: '9 iklim kuşağında tarımın yanı sıra Sumgayıt kimya parkları, metalurji, tekstil ve doğal taş sanayisi.',
                  RU: '9 климатических зон для агросектора, химические парки Сумгайыта, металлургия, текстиль и натуральный камень.',
                  AR: '',
                  ES: ''
                }
              },
              {
                icon: 'fa-regular fa-circle-check',
                line1: { AZ: 'Keyfiyyətli', EN: 'Quality', TR: 'Kaliteli', RU: 'Качественная', AR: '', ES: '' },
                line2: { AZ: 'Məhsullar', EN: 'Products', TR: 'Ürünler', RU: 'Продукция', AR: '', ES: '' },
                detail: {
                  AZ: 'AQTA fitosanitar izlənilməsi ilə dəstəklənən ISO 22000, GLOBALG.A.P., OEKO-TEX və API sertifikatlı istehsalat.',
                  EN: 'ISO 22000, GLOBALG.A.P., OEKO-TEX, and API-certified manufacturing backed by strict AQTA phytosanitary traceability.',
                  TR: 'AQTA fitosaniter izlenebilirliği ile desteklenen ISO 22000, GLOBALG.A.P., OEKO-TEX ve API sertifikalı üretim.',
                  RU: 'Производство по стандартам ISO 22000, GLOBALG.A.P., OEKO-TEX и API с полным фитосанитарным контролем AQTA.',
                  AR: '',
                  ES: ''
                }
              },
              {
                icon: 'fa-solid fa-seedling',
                line1: { AZ: 'Böyüyən', EN: 'Growing', TR: 'Büyüyen', RU: 'Растущая', AR: '', ES: '' },
                line2: { AZ: 'İxrac Ekosistemi', EN: 'Export Ecosystem', TR: 'İhracat Ekosistemi', RU: 'Экспортная экосистема', AR: '', ES: '' },
                detail: {
                  AZ: 'Ələt Azad İqtisadi Zonası, yaşıl gömrük dəhlizi və MDB, Türkiyə və Aİ GSP+ ilə güzəştli ticarət rejimləri.',
                  EN: 'Modern free economic zones (AFEZ), green customs corridors, and preferential trade regimes with CIS, Turkey, and EU GSP+.',
                  TR: 'Alat Serbest Ticaret Bölgesi, yeşil gümrük koridoru ve BDT, Türkiye ve AB GSP+ ile tercihli ticaret rejimleri.',
                  RU: 'СЭЗ Алят, зелёные таможенные коридоры и преференциальные режимы торговли со странами СНГ, Турцией и ЕС.',
                  AR: '',
                  ES: ''
                }
              }
            ];

            const curFeatures = Array.isArray(content.whyAzerbaijan?.features) && content.whyAzerbaijan.features.length > 0
              ? content.whyAzerbaijan.features
              : DEFAULT_AZ_FEATURES;

            const updateFeatures = (newFeats: any[]) => {
              setContent((p: any) => ({
                ...p,
                whyAzerbaijan: {
                  ...(p.whyAzerbaijan || {}),
                  features: newFeats,
                }
              }));
            };

            const addFeature = () => {
              const newFeat = {
                icon: 'fa-solid fa-circle-check',
                line1: { AZ: 'Yeni', EN: 'New', TR: 'Yeni', RU: 'Новый', AR: '', ES: '' },
                line2: { AZ: 'Xüsusiyyət', EN: 'Feature', TR: 'Özellik', RU: 'Фактор', AR: '', ES: '' },
                detail: {
                  AZ: 'Azərbaycan haqqında xüsusiyyətin geniş izahı.',
                  EN: 'Comprehensive detail of the strategic advantage.',
                  TR: 'Stratejik avantajın detaylı açıklaması.',
                  RU: 'Подробное описание преимущества.',
                  AR: '',
                  ES: ''
                }
              };
              updateFeatures([...curFeatures, newFeat]);
            };

            const removeFeature = (idx: number) => {
              if (confirm('Bu xüsusiyyəti silmək istədiyinizdən əminsiniz?')) {
                updateFeatures(curFeatures.filter((_: any, i: number) => i !== idx));
              }
            };

            const setFeatureIcon = (idx: number, icon: string) => {
              const copy = [...curFeatures];
              copy[idx] = { ...copy[idx], icon };
              updateFeatures(copy);
            };

            const setFeatureLoc = (idx: number, fld: 'line1' | 'line2' | 'detail', loc: string, val: string) => {
              const copy = [...curFeatures];
              copy[idx] = {
                ...copy[idx],
                [fld]: { ...(copy[idx][fld] || {}), [loc]: val }
              };
              updateFeatures(copy);
            };

            return (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Niyə Azərbaycan Bölməsi</h2>
                    <p className="text-xs text-slate-500">Banner arxa fonu, başlıqlar və 4 xüsusiyyət kartını (+/-) idarə edin.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="h-7 px-3 flex items-center gap-1.5 text-xs font-bold rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Yeni Xüsusiyyət Əlavə Et
                  </button>
                </div>

                <ImageField imgKey="WHY_AZERBAIJAN_IMAGE" label="Arxa Fon Şəkli"
                  content={content} uploading={uploading}
                  onSaveContent={saveContent} onTriggerUpload={triggerUpload}
                  onUpdateImgUrl={handleUpdateImgUrl} onPreview={setPreview}
                  saving={saving} saved={saved} />
                <MultiLocF label="Başlıq" strKey="whyAzerbaijan.heading" locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label="Açıqlama" strKey="whyAzerbaijan.desc" multi locData={locData} onChange={handleMultiLocChange} />
                <MultiLocF label='"Ətraflı" Linki' strKey="whyAzerbaijan.learnMore" locData={locData} onChange={handleMultiLocChange} />

                <div className="space-y-3 pt-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Ölkə Üstünlükləri & Xüsusiyyətlər ({curFeatures.length} ədəd)
                  </div>
                  {curFeatures.map((feat: any, i: number) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded bg-amber-50 text-amber-700 flex items-center justify-center text-sm">
                            <i className={feat.icon || 'fa-solid fa-circle-check'}></i>
                          </div>
                          <span className="text-xs font-bold text-slate-800">
                            Xüsusiyyət #{i + 1} — {feat.line1?.AZ || feat.line1?.EN || ''} {feat.line2?.AZ || feat.line2?.EN || ''}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFeature(i)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Xüsusiyyəti Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* İkon Seçici */}
                      <IconPickerDropdown
                        label="İkon (FontAwesome)"
                        value={feat.icon || 'fa-solid fa-circle-check'}
                        onChange={(ic) => setFeatureIcon(i, ic)}
                      />

                      {/* Sətir 1 və Sətir 2 (6 Dil) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Sətir 1 (Qısa etiket)</div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                            {LOCALES.map(loc => (
                              <div key={loc} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded px-2 py-1">
                                <span className="text-[9px] font-bold text-slate-400 font-mono w-4">{loc}</span>
                                <input
                                  type="text"
                                  value={feat.line1?.[loc] || ''}
                                  onChange={(e) => setFeatureLoc(i, 'line1', loc, e.target.value)}
                                  placeholder={loc}
                                  className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Sətir 2 (Alt etiket)</div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                            {LOCALES.map(loc => (
                              <div key={loc} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded px-2 py-1">
                                <span className="text-[9px] font-bold text-slate-400 font-mono w-4">{loc}</span>
                                <input
                                  type="text"
                                  value={feat.line2?.[loc] || ''}
                                  onChange={(e) => setFeatureLoc(i, 'line2', loc, e.target.value)}
                                  placeholder={loc}
                                  className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Geniş Detal / İzah (6 Dil) */}
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Klik edildikdə açılan geniş izah (6 Dil)</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {LOCALES.map(loc => (
                            <div key={loc} className="bg-white border border-slate-200 rounded p-1.5">
                              <div className="text-[9px] font-bold text-slate-400 font-mono mb-1">{loc}</div>
                              <textarea
                                rows={2}
                                value={feat.detail?.[loc] || ''}
                                onChange={(e) => setFeatureLoc(i, 'detail', loc, e.target.value)}
                                placeholder={`Geniş detal (${loc})`}
                                className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3">
                  <button
                    type="button"
                    onClick={addFeature}
                    className="h-8 px-3.5 flex items-center gap-1.5 text-xs font-bold rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Xüsusiyyət Əlavə Et
                  </button>
                  <SaveBar
                    onSave={async () => {
                      await saveContent(content);
                      await saveStrings(locData);
                    }}
                    saving={saving}
                    saved={saved}
                  />
                </div>
              </>
            );
          })()}

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
                                  color: 'from-blue-600 to-indigo-600',
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
                                  icon: 'fa-solid fa-industry',
                                  color: 'from-amber-500 to-orange-600',
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

                      {/* Tərəfdaşlıq & Ekosistem Kartları (İstehsalçılar, Alıcılar, Distribütorlar, Xidmət Tərəfdaşları) */}
                      <div className="space-y-3 pt-3 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Tərəfdaşlıq Kartları ({(ab.partnership?.items || []).length} ədəd)
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              updateAb(p => {
                                const items = [...(p.partnership?.items || [])];
                                items.push({
                                  icon: 'fa-solid fa-handshake',
                                  color: 'bg-indigo-600',
                                  title: { AZ: 'Yeni Tərəfdaş Qrupu', EN: 'New Partner Category', TR: 'Yeni İş Ortağı Grubu', RU: 'Новая категория партнеров', AR: '', ES: '' },
                                  desc: { AZ: 'Tərəfdaş qrupunun fəaliyyət sahəsi və imkanları.', EN: 'Scope and capabilities of partner group.', TR: '', RU: '', AR: '', ES: '' }
                                });
                                return {
                                  ...p,
                                  partnership: {
                                    ...p.partnership,
                                    items,
                                  }
                                };
                              });
                            }}
                            className="h-7 px-3 flex items-center gap-1.5 text-xs font-bold rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" /> Tərəfdaş Əlavə Et
                          </button>
                        </div>

                        {(ab.partnership?.items || []).map((pItem: any, pIdx: number) => (
                          <div key={pIdx} className="bg-white border border-slate-200 rounded p-3 space-y-3 shadow-2xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded ${pItem.color || 'bg-brandNavy'} text-white flex items-center justify-center text-sm shadow-xs`}>
                                  <i className={pItem.icon || 'fa-solid fa-handshake'}></i>
                                </div>
                                <span className="text-xs font-bold text-slate-800">
                                  #{pIdx + 1} — {pItem.title?.AZ || pItem.title?.EN || `Tərəfdaş ${pIdx + 1}`}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm('Bu tərəfdaşlıq kartını silmək istədiyinizdən əminsiniz?')) {
                                    updateAb(p => ({
                                      ...p,
                                      partnership: {
                                        ...p.partnership,
                                        items: (p.partnership?.items || []).filter((_: any, i: number) => i !== pIdx),
                                      }
                                    }));
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Kartı Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* İkon və Rəng */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <IconPickerDropdown
                                label="İkon (FontAwesome)"
                                value={pItem.icon || 'fa-solid fa-handshake'}
                                onChange={(ic) => {
                                  updateAb(p => {
                                    const items = [...(p.partnership?.items || [])];
                                    items[pIdx] = { ...items[pIdx], icon: ic };
                                    return { ...p, partnership: { ...p.partnership, items } };
                                  });
                                }}
                              />
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Arxa Fon Rəngi (Tailwind)</label>
                                <input
                                  type="text"
                                  value={pItem.color || 'bg-brandNavy'}
                                  onChange={(e) => {
                                    const c = e.target.value;
                                    updateAb(p => {
                                      const items = [...(p.partnership?.items || [])];
                                      items[pIdx] = { ...items[pIdx], color: c };
                                      return { ...p, partnership: { ...p.partnership, items } };
                                    });
                                  }}
                                  placeholder="məs: bg-blue-600, bg-emerald-600, bg-violet-600"
                                  className="w-full h-8 text-xs bg-slate-50 border border-slate-200 px-2 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono"
                                />
                              </div>
                            </div>

                            {/* Başlıq (6 Dil) */}
                            <div>
                              <div className="text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Tərəfdaş Başlığı (6 Dil)</div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                {LOCALES.map(loc => (
                                  <div key={loc} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2 py-1">
                                    <span className="text-[9px] font-bold text-slate-400 font-mono w-4">{loc}</span>
                                    <input
                                      type="text"
                                      value={pItem.title?.[loc] || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        updateAb(p => {
                                          const items = [...(p.partnership?.items || [])];
                                          items[pIdx] = {
                                            ...items[pIdx],
                                            title: { ...(items[pIdx].title || {}), [loc]: val }
                                          };
                                          return { ...p, partnership: { ...p.partnership, items } };
                                        });
                                      }}
                                      placeholder={loc}
                                      className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Təsvir (6 Dil) */}
                            <div>
                              <div className="text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Təsvir (6 Dil)</div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {LOCALES.map(loc => (
                                  <div key={loc} className="bg-slate-50 border border-slate-200 rounded p-1.5">
                                    <div className="text-[9px] font-bold text-slate-400 font-mono mb-1">{loc}</div>
                                    <textarea
                                      rows={2}
                                      value={pItem.desc?.[loc] || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        updateAb(p => {
                                          const items = [...(p.partnership?.items || [])];
                                          items[pIdx] = {
                                            ...items[pIdx],
                                            desc: { ...(items[pIdx].desc || {}), [loc]: val }
                                          };
                                          return { ...p, partnership: { ...p.partnership, items } };
                                        });
                                      }}
                                      placeholder={`Təsvir (${loc})`}
                                      className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
