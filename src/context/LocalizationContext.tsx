import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UI_STRINGS as UI_STRINGS_DEFAULT,
  PRODUCTS_CATALOG as PRODUCTS_DEFAULT,
  SERVICES_PILLARS as SERVICES_DEFAULT,
  BUYER_STEPS as BUYER_STEPS_DEFAULT,
  PRODUCER_STEPS as PRODUCER_STEPS_DEFAULT,
  HERO_IMAGE as HERO_IMAGE_DEFAULT,
  BUYER_CARD_IMAGE as BUYER_CARD_DEFAULT,
  PRODUCER_CARD_IMAGE as PRODUCER_CARD_DEFAULT,
  WHY_AZERBAIJAN_IMAGE as WHY_AZ_DEFAULT,
  HOW_IT_WORKS_BUYERS_IMAGE as HOW_BUYERS_DEFAULT,
  HOW_IT_WORKS_SELLERS_IMAGE as HOW_SELLERS_DEFAULT,
  ABOUT_PAGE_DEFAULT,
  DEFAULT_TEAM_MEMBERS,
} from '../data/translations';
import { CmsService, AboutPageContent, TeamMember } from '../types';

// Same origin — both frontend and API run on the same port
const OCTO_API_BASE = '';
const LOC_CACHE_KEY = 'azexbuy_loc_override';
const CONTENT_CACHE_KEY = 'azexbuy_content_override';
const CACHE_VERSION = 'v4';
const CACHE_VERSION_KEY = 'azexbuy_cache_ver';

// Clear stale cache on version mismatch
try {
  if (localStorage.getItem(CACHE_VERSION_KEY) !== CACHE_VERSION) {
    localStorage.removeItem(LOC_CACHE_KEY);
    localStorage.removeItem(CONTENT_CACHE_KEY);
    localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
  }
} catch {}

function applyFlatOverrides(base: any, flat: Record<string, string>): any {
  if (!flat || Object.keys(flat).length === 0) return base;
  const result = JSON.parse(JSON.stringify(base));
  for (const [path, value] of Object.entries(flat)) {
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let cur = result;
    let valid = true;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (cur === null || cur === undefined) { valid = false; break; }
      // Auto-create missing intermediate objects/arrays
      if (cur[p] === undefined || cur[p] === null) {
        const nextKey = parts[i + 1];
        cur[p] = /^\d+$/.test(nextKey) ? [] : {};
      }
      cur = cur[p];
    }
    if (!valid || cur === null || cur === undefined) continue;
    const last = parts[parts.length - 1];
    if (last !== undefined) cur[last] = value;
  }
  return result;
}

function buildMergedStrings(overrides: Record<string, Record<string, string>>) {
  const locales = ['EN', 'AZ', 'TR', 'RU', 'AR', 'ES'];
  const merged: any = {};
  for (const locale of locales) {
    merged[locale] = applyFlatOverrides(
      (UI_STRINGS_DEFAULT as any)[locale],
      overrides[locale] || {}
    );
  }
  return merged;
}

type LocalizationContextType = {
  strings: typeof UI_STRINGS_DEFAULT;
  heroImage: string;
  buyerCardImage: string;
  producerCardImage: string;
  whyAzImage: string;
  howItWorksBuyersImage: string;
  howItWorksSellersImage: string;
  products: typeof PRODUCTS_DEFAULT;
  services: typeof SERVICES_DEFAULT;
  buyerSteps: typeof BUYER_STEPS_DEFAULT;
  producerSteps: typeof PRODUCER_STEPS_DEFAULT;
  cmsServices: CmsService[];
  about: AboutPageContent;
  team: TeamMember[];
  contact: {
    phone: string;
    phoneAlt: string;
    email: string;
    emailAlt: string;
    hours: string;
  };
  refresh: () => void;
};

const LocalizationContext = createContext<LocalizationContextType>({
  strings: UI_STRINGS_DEFAULT,
  heroImage: HERO_IMAGE_DEFAULT,
  buyerCardImage: BUYER_CARD_DEFAULT,
  producerCardImage: PRODUCER_CARD_DEFAULT,
  whyAzImage: WHY_AZ_DEFAULT,
  howItWorksBuyersImage: HOW_BUYERS_DEFAULT,
  howItWorksSellersImage: HOW_SELLERS_DEFAULT,
  products: PRODUCTS_DEFAULT,
  services: SERVICES_DEFAULT,
  buyerSteps: BUYER_STEPS_DEFAULT,
  producerSteps: PRODUCER_STEPS_DEFAULT,
  cmsServices: [],
  about: ABOUT_PAGE_DEFAULT,
  team: DEFAULT_TEAM_MEMBERS,
  contact: {
    phone: '+994 (12) 404 85 00',
    phoneAlt: '+994 (50) 290 45 00',
    email: 'desk@azexbuy.az',
    emailAlt: 'procurement@azexbuy.az',
    hours: '09:00 – 18:00 (AZT / UTC+4)',
  },
  refresh: () => {},
});

function normalizeProductItem(p: any): any {
  if (!p) return null;
  const toLoc = (val: any, fallback = ''): any => {
    if (!val && !fallback) return { AZ: '', EN: '', TR: '', RU: '', AR: '', ES: '' };
    if (typeof val === 'string' && (val.trim().startsWith('{') || val.trim().startsWith('['))) {
      try { val = JSON.parse(val); } catch {}
    }
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const base = val.EN || val.AZ || val.TR || val.RU || Object.values(val)[0] || fallback;
      return {
        AZ: val.AZ || base,
        EN: val.EN || base,
        TR: val.TR || base,
        RU: val.RU || base,
        AR: val.AR || base,
        ES: val.ES || base,
      };
    }
    const str = String(val || fallback || '');
    return { AZ: str, EN: str, TR: str, RU: str, AR: str, ES: str };
  };

  const images = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []);
  const defaultImg = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800';
  const imgUrl = p.image || (images.length > 0 ? images[0] : defaultImg);

  const catSlug = String(p.categorySlug || p.categoryId || p.categoryKey || '').toLowerCase();
  let categoryKey = 'agro';
  if (catSlug.includes('agri') || catSlug.includes('food')) categoryKey = 'agro';
  else if (catSlug.includes('text') || catSlug.includes('carpet')) categoryKey = 'textile';
  else if (catSlug.includes('stone') || catSlug.includes('construct') || catSlug.includes('marm')) categoryKey = 'construction';
  else if (catSlug.includes('metal') || catSlug.includes('steel') || catSlug.includes('pipe') || catSlug.includes('pack')) categoryKey = 'metals';
  else if (catSlug.includes('chem') || catSlug.includes('urea') || catSlug.includes('fertil')) categoryKey = 'chemicals';
  else if (['agro', 'textile', 'construction', 'metals', 'chemicals'].includes(p.categoryKey)) categoryKey = p.categoryKey;

  const rawName = p.name;
  const nameLoc = toLoc(rawName, p.slug || 'Commodity');
  const shortDescLoc = toLoc(p.shortDesc || p.shortDescription || p.description, typeof rawName === 'string' ? rawName : nameLoc.EN);
  const originLoc = toLoc(p.originRegion, 'Azerbaijan');
  const packagingLoc = toLoc(p.packaging || p.packagingInfo, 'Export standard multi-layer packaging');
  const catLabelStr = p.categoryName || (categoryKey === 'agro' ? 'Agriculture & Food' : categoryKey === 'textile' ? 'Textile & Carpets' : categoryKey === 'construction' ? 'Construction & Stone' : categoryKey === 'metals' ? 'Metals & Steel' : 'Chemicals & Urea');
  const catLabelLoc = toLoc(p.categoryLabel || catLabelStr);

  const certs = Array.isArray(p.certifications) && p.certifications.length > 0
    ? p.certifications
    : (Array.isArray(p.certificates) && p.certificates.length > 0 ? p.certificates : ['ISO 22000', 'AQTA Phytosanitary', 'EUR.1 / CT-1']);

  const incoterms = Array.isArray(p.incoterms) && p.incoterms.length > 0
    ? p.incoterms
    : ['FCA', 'FOB', 'CIF', 'DAP'];

  const specs = p.technicalSpecs || {};
  const gradeSpecsStr = typeof specs === 'object' && Object.keys(specs).length > 0
    ? Object.entries(specs).map(([k, v]) => `${k}: ${v}`).join(' | ')
    : 'EU / International Export Grade A';
  const gradeSpecsLoc = toLoc(p.gradeSpecs || gradeSpecsStr);

  return {
    id: String(p.id || p.slug || Math.random().toString(36).slice(2, 8)),
    slug: p.slug || '',
    featured: !!p.featured || !!p.isFeatured || !!p.is_featured,
    isFeatured: !!p.featured || !!p.isFeatured || !!p.is_featured,
    hsCode: String(p.hsCode || p.hs_code || ''),
    categoryKey,
    categoryId: p.categoryId,
    categorySlug: p.categorySlug,
    name: nameLoc,
    categoryLabel: catLabelLoc,
    shortDesc: shortDescLoc,
    originRegion: originLoc,
    image: imgUrl,
    images: images.length > 0 ? images : [imgUrl],
    minOrderQty: p.minOrderQty || p.moq || '1x 20ft FCL',
    moq: p.minOrderQty || p.moq || '1x 20ft FCL',
    annualCapacity: p.annualCapacity || (specs as any)?.['Annual Capacity'] || (specs as any)?.['Yearly Capacity'] || '10,000 MT',
    verifiedSuppliersCount: Number(p.verifiedSuppliersCount) || (Number(p.sortOrder) > 0 ? Number(p.sortOrder) * 4 + 8 : 16),
    incoterms,
    certifications: certs,
    certificates: certs,
    leadTimeDays: p.leadTimeDays || '7–14 Days',
    packaging: packagingLoc,
    gradeSpecs: gradeSpecsLoc,
  };
}

function applyContentOverrides(content: any) {
  const images = content?.images || {};
  const about = content?.about ? { ...ABOUT_PAGE_DEFAULT, ...content.about } : { ...ABOUT_PAGE_DEFAULT };
  
  // Link customizable image keys to about sections
  if (images['ABOUT_WHO_WE_ARE_IMAGE'] && about.whoWeAre) about.whoWeAre.image = images['ABOUT_WHO_WE_ARE_IMAGE'];
  if (images['ABOUT_MISSION_IMAGE'] && about.missionVision) about.missionVision.missionImage = images['ABOUT_MISSION_IMAGE'];
  if (images['ABOUT_VISION_IMAGE'] && about.missionVision) about.missionVision.visionImage = images['ABOUT_VISION_IMAGE'];
  if (about.sectors?.items) {
    if (images['ABOUT_SECTOR_0_IMAGE'] && about.sectors.items[0]) about.sectors.items[0].image = images['ABOUT_SECTOR_0_IMAGE'];
    if (images['ABOUT_SECTOR_1_IMAGE'] && about.sectors.items[1]) about.sectors.items[1].image = images['ABOUT_SECTOR_1_IMAGE'];
    if (images['ABOUT_SECTOR_2_IMAGE'] && about.sectors.items[2]) about.sectors.items[2].image = images['ABOUT_SECTOR_2_IMAGE'];
    if (images['ABOUT_SECTOR_3_IMAGE'] && about.sectors.items[3]) about.sectors.items[3].image = images['ABOUT_SECTOR_3_IMAGE'];
    if (images['ABOUT_SECTOR_4_IMAGE'] && about.sectors.items[4]) about.sectors.items[4].image = images['ABOUT_SECTOR_4_IMAGE'];
    if (images['ABOUT_SECTOR_5_IMAGE'] && about.sectors.items[5]) about.sectors.items[5].image = images['ABOUT_SECTOR_5_IMAGE'];
  }

  const rawProducts = content?.products?.length ? content.products : PRODUCTS_DEFAULT;
  const products = rawProducts.map(normalizeProductItem).filter(Boolean);

  return {
    heroImage: images['HERO_IMAGE'] || HERO_IMAGE_DEFAULT,
    buyerCardImage: images['BUYER_CARD_IMAGE'] || BUYER_CARD_DEFAULT,
    producerCardImage: images['PRODUCER_CARD_IMAGE'] || PRODUCER_CARD_DEFAULT,
    whyAzImage: images['WHY_AZERBAIJAN_IMAGE'] || WHY_AZ_DEFAULT,
    howItWorksBuyersImage: images['HOW_IT_WORKS_BUYERS_IMAGE'] || HOW_BUYERS_DEFAULT,
    howItWorksSellersImage: images['HOW_IT_WORKS_SELLERS_IMAGE'] || HOW_SELLERS_DEFAULT,
    products: products.length ? products : PRODUCTS_DEFAULT,
    services: content?.services?.length ? content.services : SERVICES_DEFAULT,
    buyerSteps: content?.buyer_steps?.length ? content.buyer_steps : BUYER_STEPS_DEFAULT,
    producerSteps: content?.producer_steps?.length ? content.producer_steps : PRODUCER_STEPS_DEFAULT,
    about,
    contact: {
      phone: content?.contact?.phone || '+994 (12) 404 85 00',
      phoneAlt: content?.contact?.phoneAlt || '+994 (50) 290 45 00',
      email: content?.contact?.email || 'desk@azexbuy.az',
      emailAlt: content?.contact?.emailAlt || 'procurement@azexbuy.az',
      hours: content?.contact?.hours || '09:00 – 18:00 (AZT / UTC+4)',
    },
  };
}

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [strings, setStrings] = useState<typeof UI_STRINGS_DEFAULT>(() => {
    try {
      const cached = localStorage.getItem(LOC_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          return buildMergedStrings(parsed) as typeof UI_STRINGS_DEFAULT;
        }
        localStorage.removeItem(LOC_CACHE_KEY);
      }
    } catch { localStorage.removeItem(LOC_CACHE_KEY); }
    return UI_STRINGS_DEFAULT;
  });

  const [contentOverrides, setContentOverrides] = useState(() => {
    try {
      const cached = localStorage.getItem(CONTENT_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.products?.some((p: any) => !p?.name)) {
          localStorage.removeItem(CONTENT_CACHE_KEY);
          return applyContentOverrides({});
        }
        return applyContentOverrides(parsed);
      }
    } catch { localStorage.removeItem(CONTENT_CACHE_KEY); }
    return applyContentOverrides({});
  });

  const [cmsServices, setCmsServices] = useState<CmsService[]>([]);
  const [team, setTeam] = useState<TeamMember[]>(DEFAULT_TEAM_MEMBERS);

  const fetchAndApply = async () => {
    try {
      const [locRes, contentRes, srvRes, teamRes, prodRes] = await Promise.all([
        fetch(`${OCTO_API_BASE}/api/azexbuy/localization`),
        fetch(`${OCTO_API_BASE}/api/azexbuy/content`),
        fetch(`${OCTO_API_BASE}/api/azexbuy/services`),
        fetch(`${OCTO_API_BASE}/api/azexbuy/team`),
        fetch(`${OCTO_API_BASE}/api/azexbuy/products`),
      ]);
      if (locRes.ok) {
        const overrides = await locRes.json();
        if (overrides && Object.keys(overrides).length > 0) {
          localStorage.setItem(LOC_CACHE_KEY, JSON.stringify(overrides));
          setStrings(buildMergedStrings(overrides) as typeof UI_STRINGS_DEFAULT);
        }
      }
      if (contentRes.ok) {
        const content = await contentRes.json();
        localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(content || {}));
        setContentOverrides(applyContentOverrides(content || {}));
        if (Array.isArray(content?.cmsServices) && content.cmsServices.length > 0) {
          setCmsServices(content.cmsServices.filter((s: CmsService) => s.isActive));
        }
      }
      if (prodRes.ok) {
        try {
          const apiProds = await prodRes.json();
          if (Array.isArray(apiProds) && apiProds.length > 0) {
            const normalized = apiProds.map(normalizeProductItem).filter(Boolean);
            setContentOverrides((prev: any) => ({
              ...prev,
              products: normalized,
            }));
          }
        } catch {}
      }
      if (srvRes.ok) {
        try {
          const srvData: CmsService[] = await srvRes.json();
          if (Array.isArray(srvData) && srvData.length > 0) {
            setCmsServices(srvData.filter(s => s.isActive));
          }
        } catch {}
      }
      if (teamRes.ok) {
        try {
          const teamData = await teamRes.json();
          if (Array.isArray(teamData) && teamData.length > 0) {
            setTeam(teamData.filter((m: TeamMember) => m.isActive));
          }
        } catch {}
      }
    } catch {}
  };

  useEffect(() => {
    fetchAndApply();
    const interval = setInterval(fetchAndApply, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <LocalizationContext.Provider value={{ strings, ...contentOverrides, cmsServices, team, refresh: fetchAndApply }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => useContext(LocalizationContext);
