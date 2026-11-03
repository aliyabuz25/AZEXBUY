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
} from '../data/translations';

// Same origin — both frontend and API run on the same port
const OCTO_API_BASE = '';
const LOC_CACHE_KEY = 'azexbuy_loc_override';
const CONTENT_CACHE_KEY = 'azexbuy_content_override';

function applyFlatOverrides(base: any, flat: Record<string, string>): any {
  if (!flat || Object.keys(flat).length === 0) return base;
  const result = JSON.parse(JSON.stringify(base));
  for (const [path, value] of Object.entries(flat)) {
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let cur = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (cur[p] === undefined || cur[p] === null) break;
      cur = cur[p];
    }
    const last = parts[parts.length - 1];
    if (cur && last !== undefined && last in cur) cur[last] = value;
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
  products: typeof PRODUCTS_DEFAULT;
  services: typeof SERVICES_DEFAULT;
  buyerSteps: typeof BUYER_STEPS_DEFAULT;
  producerSteps: typeof PRODUCER_STEPS_DEFAULT;
  refresh: () => void;
};

const LocalizationContext = createContext<LocalizationContextType>({
  strings: UI_STRINGS_DEFAULT,
  heroImage: HERO_IMAGE_DEFAULT,
  buyerCardImage: BUYER_CARD_DEFAULT,
  producerCardImage: PRODUCER_CARD_DEFAULT,
  whyAzImage: WHY_AZ_DEFAULT,
  products: PRODUCTS_DEFAULT,
  services: SERVICES_DEFAULT,
  buyerSteps: BUYER_STEPS_DEFAULT,
  producerSteps: PRODUCER_STEPS_DEFAULT,
  refresh: () => {},
});

function applyContentOverrides(content: any) {
  const images = content?.images || {};
  return {
    heroImage: images['HERO_IMAGE'] || HERO_IMAGE_DEFAULT,
    buyerCardImage: images['BUYER_CARD_IMAGE'] || BUYER_CARD_DEFAULT,
    producerCardImage: images['PRODUCER_CARD_IMAGE'] || PRODUCER_CARD_DEFAULT,
    whyAzImage: images['WHY_AZERBAIJAN_IMAGE'] || WHY_AZ_DEFAULT,
    products: content?.products?.length ? content.products : PRODUCTS_DEFAULT,
    services: content?.services?.length ? content.services : SERVICES_DEFAULT,
    buyerSteps: content?.buyer_steps?.length ? content.buyer_steps : BUYER_STEPS_DEFAULT,
    producerSteps: content?.producer_steps?.length ? content.producer_steps : PRODUCER_STEPS_DEFAULT,
  };
}

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [strings, setStrings] = useState<typeof UI_STRINGS_DEFAULT>(() => {
    try {
      const cached = localStorage.getItem(LOC_CACHE_KEY);
      if (cached) return buildMergedStrings(JSON.parse(cached)) as typeof UI_STRINGS_DEFAULT;
    } catch {}
    return UI_STRINGS_DEFAULT;
  });

  const [contentOverrides, setContentOverrides] = useState(() => {
    try {
      const cached = localStorage.getItem(CONTENT_CACHE_KEY);
      if (cached) return applyContentOverrides(JSON.parse(cached));
    } catch {}
    return applyContentOverrides({});
  });

  const fetchAndApply = async () => {
    try {
      const [locRes, contentRes] = await Promise.all([
        fetch(`${OCTO_API_BASE}/api/azexbuy/localization`),
        fetch(`${OCTO_API_BASE}/api/azexbuy/content`),
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
        // Always apply — even empty object resets to defaults
        localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(content || {}));
        setContentOverrides(applyContentOverrides(content || {}));
      }
    } catch {}
  };

  useEffect(() => {
    fetchAndApply();
    const interval = setInterval(fetchAndApply, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <LocalizationContext.Provider value={{ strings, ...contentOverrides, refresh: fetchAndApply }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => useContext(LocalizationContext);
