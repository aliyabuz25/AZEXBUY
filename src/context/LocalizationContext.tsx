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

  return {
    heroImage: images['HERO_IMAGE'] || HERO_IMAGE_DEFAULT,
    buyerCardImage: images['BUYER_CARD_IMAGE'] || BUYER_CARD_DEFAULT,
    producerCardImage: images['PRODUCER_CARD_IMAGE'] || PRODUCER_CARD_DEFAULT,
    whyAzImage: images['WHY_AZERBAIJAN_IMAGE'] || WHY_AZ_DEFAULT,
    howItWorksBuyersImage: images['HOW_IT_WORKS_BUYERS_IMAGE'] || HOW_BUYERS_DEFAULT,
    howItWorksSellersImage: images['HOW_IT_WORKS_SELLERS_IMAGE'] || HOW_SELLERS_DEFAULT,
    products: content?.products?.length ? content.products : PRODUCTS_DEFAULT,
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
        // Sanity check — products must have valid name objects
        if (parsed?.products?.some((p: any) => !p?.name || typeof p.name !== 'object')) {
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
      const [locRes, contentRes, srvRes, teamRes] = await Promise.all([
        fetch(`${OCTO_API_BASE}/api/azexbuy/localization`),
        fetch(`${OCTO_API_BASE}/api/azexbuy/content`),
        fetch(`${OCTO_API_BASE}/api/azexbuy/services`),
        fetch(`${OCTO_API_BASE}/api/azexbuy/team`),
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
