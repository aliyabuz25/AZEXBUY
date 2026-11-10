import React, { useState, useEffect, useRef, useCallback, useMemo, ReactNode } from 'react';

function PageTransition({ viewKey, children }: { viewKey: string; children: ReactNode }) {
  const [displayed, setDisplayed] = useState<ReactNode>(() => children);
  const [animating, setAnimating] = useState(false);
  const prevKey = useRef(viewKey);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (viewKey !== prevKey.current) {
      setAnimating(true);
      timerRef.current = setTimeout(() => {
        setDisplayed(children);
        prevKey.current = viewKey;
        setAnimating(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 160);
    } else {
      setDisplayed(children);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [viewKey, children]);

  return (
    <div style={{
      opacity: animating ? 0 : 1,
      transform: animating ? 'translateY(10px)' : 'translateY(0)',
      transition: 'opacity 0.16s ease, transform 0.16s ease',
    }}>
      {displayed}
    </div>
  );
}
import {
  Locale,
  ProducerApplication,
  ProductItem,
  RFQSubmission,
  ServiceApplication,
  StepItem,
  ViewMode,
  getLocalizedText,
} from './types';
import { useLocalization } from './context/LocalizationContext';
import { Navbar } from './components/Navbar';
import {
  GlobalSearchModal,
  PrintableDossierModal,
  ProducerOnboardingModal,
  RFQBuilderModal,
} from './components/Modals';
import { AIDeskModal } from './components/AIDeskModal';
import {
  CatalogView,
  DossiersView,
  ProductSpecModal,
  SubpagePortalView,
} from './components/PortalViews';
import { ArticlesView } from './components/ArticlesView';
import { AboutView } from './components/AboutView';
import { InsightsView } from './components/InsightsView';
import { ServiceApplicationModal } from './components/ServiceApplicationModal';

const SAMPLE_INITIAL_RFQ: RFQSubmission = {
  id: 'AZX-RFQ-2026-4819',
  createdAt: '2026-10-21T09:30:00.000Z',
  buyerCompany: 'Hanseatic Food & Commodities GmbH',
  country: 'Germany',
  contactName: 'Dr. Markus Weber',
  email: 'm.weber@hanseatic-commodities.de',
  phone: '+49 40 3198 4410',
  incoterm: 'CIF',
  destinationPort: 'Port of Constanta / Hamburg',
  corridorRoute: 'Middle Corridor (TITR) -> Black Sea -> Central Europe',
  requiredCertifications: [
    'AQTA Phytosanitary Certificate',
    'Certificate of Origin (CT-1 / EUR.1)',
    'ISO 22000 / Quality Assay',
  ],
  items: [
    {
      productId: 'hazelnut-080222',
      productName: 'Hazelnut',
      hsCode: '080222',
      quantity: '40',
      unit: 'MT',
    },
    {
      productId: 'pomegranate-081090',
      productName: 'Pomegranate',
      hsCode: '081090',
      quantity: '18',
      unit: 'MT',
    },
  ],
  notes: 'Caliber 11-13mm natural shelled kernels in 25kg vacuum foil bags. Documentary L/C at sight.',
  status: 'Verified & Routing to Suppliers',
};

const SAMPLE_INITIAL_PRODUCER: ProducerApplication = {
  id: 'AZX-EXP-2026-2094',
  createdAt: '2026-10-20T14:15:00.000Z',
  companyName: 'Zaqatala-Sheki Hazelnut Cooperative LLC',
  voenTin: '1402938471',
  economicRegion: 'Sheki – Zaqatala',
  contactPerson: 'Rashad Aliyev',
  email: 'export@zaqatalahazelnut.az',
  phone: '+994 50 214 88 90',
  productName: 'Shelled Ata-Baba Hazelnut Kernels',
  hsCode: '080222',
  categoryKey: 'Agriculture & Food',
  monthlyCapacity: '180 MT / Month',
  certifications: ['AQTA Registration', 'CT-1 / EUR.1 Eligible', 'ISO 9001 / 22000', 'Halal Certified'],
  targetMarkets: ['European Union', 'GCC / Middle East', 'CIS & Central Asia'],
  outsourcedDeskRequested: true,
  readinessScore: 94,
  status: 'Audit Scheduled — Export Desk Assigned',
};

export default function App() {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('azexbuy_locale') as Locale | null;
    const valid: Locale[] = ['EN', 'AZ', 'TR', 'RU', 'AR', 'ES'];
    return saved && valid.includes(saved) ? saved : 'AZ';
  });

  const VALID_VIEWS: ViewMode[] = ['home','buyers','producers','services','products','how-it-works','about','insights','contact','dossiers','ai-desk','articles'];

  const getViewFromHash = (): ViewMode => {
    const hash = window.location.hash.replace('#/', '').replace('#', '') as ViewMode;
    return VALID_VIEWS.includes(hash) ? hash : 'home';
  };

  const [activeView, setActiveViewState] = useState<ViewMode>(getViewFromHash);

  const setActiveView = (view: ViewMode) => {
    setActiveViewState(view);
    window.location.hash = view === 'home' ? '' : `/${view}`;
  };

  useEffect(() => {
    const onHashChange = () => setActiveViewState(getViewFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const [rfqSubmissions, setRfqSubmissions] = useState<RFQSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('azexbuy_rfqs');
      return saved ? JSON.parse(saved) : [SAMPLE_INITIAL_RFQ];
    } catch {
      return [SAMPLE_INITIAL_RFQ];
    }
  });

  const [producerApps, setProducerApps] = useState<ProducerApplication[]>(() => {
    try {
      const saved = localStorage.getItem('azexbuy_producers');
      return saved ? JSON.parse(saved) : [SAMPLE_INITIAL_PRODUCER];
    } catch {
      return [SAMPLE_INITIAL_PRODUCER];
    }
  });

  const [shortlistedIds, setShortlistedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('azexbuy_shortlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals & Drawers
  const [rfqModalOpen, setRfqModalOpen] = useState(false);
  const [rfqInitialProduct, setRfqInitialProduct] = useState<ProductItem | null>(null);
  const [producerModalOpen, setProducerModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [inspectedProduct, setInspectedProduct] = useState<ProductItem | null>(null);
  const [activePrintRFQ, setActivePrintRFQ] = useState<RFQSubmission | null>(null);
  const [activePrintProducer, setActivePrintProducer] = useState<ProducerApplication | null>(null);
  const [aiDeskOpen, setAiDeskOpen] = useState(false);
  const [serviceAppModalOpen, setServiceAppModalOpen] = useState(false);
  const [serviceAppPreselected, setServiceAppPreselected] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((msg: string) => {
    clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3500);
  }, []);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  // Interactive inline step selection on Home view
  const [selectedStepInfo, setSelectedStepInfo] = useState<{
    track: 'buyer' | 'producer';
    step: StepItem;
  } | null>(null);

  // Selected Why Azerbaijan highlight on Home view
  const [activeAzFeatureIdx, setActiveAzFeatureIdx] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('azexbuy_locale', locale);
    document.documentElement.dir = locale === 'AR' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale.toLowerCase();
  }, [locale]);

  useEffect(() => {
    localStorage.setItem('azexbuy_rfqs', JSON.stringify(rfqSubmissions));
  }, [rfqSubmissions]);

  useEffect(() => {
    localStorage.setItem('azexbuy_producers', JSON.stringify(producerApps));
  }, [producerApps]);

  useEffect(() => {
    localStorage.setItem('azexbuy_shortlist', JSON.stringify(shortlistedIds));
  }, [shortlistedIds]);

  const handleOpenProductRFQ = (product: ProductItem) => {
    setRfqInitialProduct(product);
    setRfqModalOpen(true);
  };

  const handleOpenGeneralRFQ = () => {
    setRfqInitialProduct(null);
    setRfqModalOpen(true);
  };

  const OCTO_API = '';

  const handleSubmitRFQ = (newRfq: RFQSubmission) => {
    setRfqSubmissions((prev) => [newRfq, ...prev]);
    setRfqModalOpen(false);
    setActivePrintProducer(null);
    setActivePrintRFQ(newRfq);
    // Sync to backend first, then show toast
    fetch(`${OCTO_API}/api/azexbuy/rfqs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRfq),
    }).then(r => {
      if (r.ok) {
        showToast('Official RFQ dossier registered and stored in trade registry.');
      } else {
        showToast('RFQ submitted locally. Server sync failed — our team will follow up.');
        console.warn('[AZEXBUY] RFQ server sync failed:', r.status);
      }
    }).catch(() => {
      showToast('RFQ submitted locally. Server sync failed — our team will follow up.');
      console.warn('[AZEXBUY] RFQ server sync error');
    });
  };

  const handleSubmitProducer = (newApp: ProducerApplication) => {
    setProducerApps((prev) => [newApp, ...prev]);
    setProducerModalOpen(false);
    setActivePrintRFQ(null);
    setActivePrintProducer(newApp);
    // Sync to backend first, then show toast
    fetch(`${OCTO_API}/api/azexbuy/producers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newApp),
    }).then(r => {
      if (r.ok) {
        showToast('Producer export registration submitted for technical audit.');
      } else {
        showToast('Registration submitted locally. Server sync failed — our team will follow up.');
        console.warn('[AZEXBUY] Producer server sync failed:', r.status);
      }
    }).catch(() => {
      showToast('Registration submitted locally. Server sync failed — our team will follow up.');
      console.warn('[AZEXBUY] Producer server sync error');
    });
  };

  const handleToggleShortlist = (id: string) => {
    setShortlistedIds((prev) => {
      const exists = prev.includes(id);
      showToast(exists ? 'Commodity removed from shortlist' : 'Commodity saved to RFQ shortlist');
      return exists ? prev.filter((item) => item !== id) : [...prev, id];
    });
  };

  const handleUpdateRFQStatus = (id: string, status: string, assignedTo?: string, note?: string) => {
    setRfqSubmissions((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const internalNotes = note
          ? [...(r.internalNotes || []), `${new Date().toLocaleDateString()}: ${note}`]
          : r.internalNotes;
        return { ...r, status, assignedTo: assignedTo ?? r.assignedTo, internalNotes };
      })
    );
    showToast('RFQ dossier status updated.');
  };

  const handleUpdateProducerStatus = (id: string, status: string, assignedTo?: string, note?: string) => {
    setProducerApps((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const internalNotes = note
          ? [...(p.internalNotes || []), `${new Date().toLocaleDateString()}: ${note}`]
          : p.internalNotes;
        return { ...p, status, assignedTo: assignedTo ?? p.assignedTo, internalNotes };
      })
    );
    showToast('Producer record status updated.');
  };

  const handleDeleteRFQ = (id: string) => {
    setRfqSubmissions((prev) => prev.filter((r) => r.id !== id));
    showToast('RFQ dossier removed from registry.');
  };

  const handleDeleteProducer = (id: string) => {
    setProducerApps((prev) => prev.filter((p) => p.id !== id));
    showToast('Producer record removed from registry.');
  };

  const { strings, heroImage, buyerCardImage, producerCardImage, whyAzImage, products: cmsProducts, services: cmsServicesPillars, buyerSteps: cmsBuyerSteps, producerSteps: cmsProducerSteps, cmsServices, contact } = useLocalization();
  const t = strings[locale] || strings.AZ || strings.EN;
  const featuredProducts = cmsProducts.filter((p: any) => p.featured);

  const whyIcons = [
    'fa-regular fa-circle-check',
    'fa-solid fa-globe',
    'fa-solid fa-chart-line',
    'fa-regular fa-clipboard',
    'fa-solid fa-truck',
  ];

  // ── Category tiles (home "Selected Products" section) ────────────────────
  const CAT_ICONS: Record<string, string> = {
    agro: 'fa-solid fa-leaf',
    textile: 'fa-solid fa-scroll',
    construction: 'fa-solid fa-gem',
    metals: 'fa-solid fa-industry',
    chemicals: 'fa-solid fa-flask',
  };
  const CAT_DEFAULT_LABELS: Record<string, Record<string, string>> = {
    agro:         { AZ: 'Kənd Təsərrüfatı və Qida', EN: 'Agriculture & Food', TR: 'Tarım ve Gıda', RU: 'Агропром и продукты' },
    textile:      { AZ: 'Tekstil və Xalça',          EN: 'Textile & Carpets',    TR: 'Tekstil ve Kilim',   RU: 'Текстиль и ковры' },
    construction: { AZ: 'Tikinti Daşı və Mərmər',     EN: 'Construction & Stone', TR: 'İnşaat Taşı ve Mermer', RU: 'Мрамор и стройматериалы' },
    metals:       { AZ: 'Metallurgiya və Sənaye',     EN: 'Metals & Steel',       TR: 'Metalürji ve Çelik',  RU: 'Металлургия и трубы' },
    chemicals:    { AZ: 'Kimya və Polimerlər',        EN: 'Chemicals & Urea',     TR: 'Kimyasallar ve Üre',  RU: 'Химия и удобрения' },
  };
  const categoryTiles = useMemo(() => {
    const counts: Record<string, number> = {};
    const labels: Record<string, any> = {};
    cmsProducts.forEach((p: any) => {
      const key = p.categoryKey || 'agro';
      counts[key] = (counts[key] || 0) + 1;
      if (!labels[key]) labels[key] = p.categoryLabel;
    });
    return Object.keys(CAT_DEFAULT_LABELS)
      .filter((key) => counts[key] > 0)
      .map((key) => ({
        key,
        icon: CAT_ICONS[key] || 'fa-solid fa-cube',
        label: labels[key] || CAT_DEFAULT_LABELS[key],
        count: counts[key],
      }));
  }, [cmsProducts]);

  const azIcons = [
    'fa-solid fa-location-dot',
    'fa-solid fa-cubes-stacked',
    'fa-regular fa-circle-check',
    'fa-solid fa-seedling',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-brandText">
      {/* Main Sticky Header — hidden on insights page */}
      {activeView !== 'insights' && <Navbar
        locale={locale}
        setLocale={setLocale}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenRFQ={handleOpenGeneralRFQ}
        onOpenAIDesk={() => setAiDeskOpen(true)}
        dossiersCount={rfqSubmissions.length + producerApps.length}
        shortlistCount={shortlistedIds.length}
      />}

      {/* Breadcrumb bar when inside a dedicated portal view */}
      {activeView !== 'home' && activeView !== 'insights' && (
        <div className="bg-slate-100 border-b border-slate-200 py-2 no-print">
          <div className="custom-container flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <button
                type="button"
                onClick={() => setActiveView('home')}
                className="font-bold text-brandNavy hover:underline cursor-pointer flex items-center gap-1"
              >
                <i className="fa-solid fa-arrow-left text-[10px]"></i>
                <span>{t.nav.home}</span>
              </button>
              <span>/</span>
              <span className="font-semibold text-slate-800 capitalize">{activeView}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveView('dossiers')}
                className="text-brandNavy hover:text-brandGreen font-bold cursor-pointer"
              >
                Saved Dossiers ({rfqSubmissions.length + producerApps.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Switcher */}
      <main className="flex-1">
        <PageTransition viewKey={activeView}>
        {activeView === 'home' && (
          <>
            {/* BEGIN: HeroSection */}
            <section
              className="relative min-h-[500px] lg:min-h-[560px] flex items-center bg-gray-900 border-b border-gray-100 overflow-hidden"
              data-purpose="hero-banner"
            >
              {/* Full-width authentic Baku panorama & traditional Azerbaijani bountiful table background image */}
              <div className="absolute inset-0 z-0">
                <img
                  alt="Azerbaijani products, pomegranates, hazelnuts, traditional armudu tea glasses, samovar and Baku Flame Towers landscape"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                  src={heroImage}
                />
                {/* Soft readable gradient overlay to ensure high contrast for typography and buttons */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/20"></div>
              </div>

              <div className="custom-container relative z-10 w-full py-10">
                <div className="max-w-2xl">
                  <span className="block tracking-wider uppercase text-lg sm:text-xl font-extrabold text-brandNavy mb-2">
                    {t.hero.kicker}
                  </span>
                  <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight text-brandNavy leading-[1.18] mb-4">
                    {t.hero.title}
                  </h1>
                  <p className="text-base text-gray-700 mb-8 max-w-xl leading-relaxed font-normal">
                    {t.hero.subtitle}
                  </p>

                  {/* Hero Dual CTA Cards */}
                  <div className="flex flex-col sm:flex-row items-stretch gap-4 max-w-xl">
                    {/* CTA 1: Buyers */}
                    <button
                      type="button"
                      onClick={handleOpenGeneralRFQ}
                      className="flex-1 bg-brandNavy hover:bg-brandNavyDark text-white p-4 rounded-md shadow-sm transition-all flex items-center justify-between group cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center text-lg shrink-0">
                          <i className="fa-solid fa-cart-shopping"></i>
                        </div>
                        <div className="text-left">
                          <span className="block text-xs uppercase font-extrabold tracking-wider text-blue-200 leading-none mb-1">
                            {t.hero.buyLabel}
                          </span>
                          <span className="block text-sm font-semibold text-white">
                            {t.hero.buyAction}
                          </span>
                        </div>
                      </div>
                      <i className="fa-solid fa-arrow-right text-sm text-gray-300 group-hover:translate-x-1 transition-transform"></i>
                    </button>

                    {/* CTA 2: Producers */}
                    <button
                      type="button"
                      onClick={() => setProducerModalOpen(true)}
                      className="flex-1 bg-brandGreen hover:bg-brandGreenDark text-white p-4 rounded-md shadow-sm transition-all flex items-center justify-between group cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center text-lg shrink-0">
                          <i className="fa-solid fa-seedling"></i>
                        </div>
                        <div className="text-left">
                          <span className="block text-xs uppercase font-extrabold tracking-wider text-green-100 leading-none mb-1">
                            {t.hero.exportLabel}
                          </span>
                          <span className="block text-sm font-semibold text-white">
                            {t.hero.exportAction}
                          </span>
                        </div>
                      </div>
                      <i className="fa-solid fa-arrow-right text-sm text-gray-200 group-hover:translate-x-1 transition-transform"></i>
                    </button>
                  </div>
                </div>
              </div>
            </section>
            {/* END: HeroSection */}

            {/* BEGIN: WhyAZEXBUY */}
            <section
              className="bg-white border-b border-gray-100 py-6"
              data-purpose="value-propositions"
            >
              <div className="custom-container">
                <h2 className="text-xl font-extrabold text-brandNavy mb-4">
                  {t.whyAzexbuy.heading}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {t.whyAzexbuy.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-start pr-2">
                      <div className="w-11 h-11 rounded-lg bg-blue-50 text-brandNavy flex items-center justify-center text-xl mb-3">
                        <i className={whyIcons[idx] ?? 'fa-solid fa-circle-check'}></i>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            {/* END: WhyAZEXBUY */}

            {/* BEGIN: DualAudienceCards */}
            <section className="bg-white py-6" data-purpose="audience-split">
              <div className="custom-container">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: For Buyers */}
                  <div className="relative bg-gradient-to-r from-[#ebf5fe] via-[#edf6fe] to-[#d6ebfd] rounded-xl border border-blue-100/80 overflow-hidden flex flex-col sm:flex-row items-stretch justify-between shadow-sm min-h-[220px]">
                    {/* Content Side */}
                    <div className="p-6 sm:p-7 flex flex-col justify-between max-w-sm sm:max-w-md z-10 relative">
                      <div>
                        <span className="text-[11px] font-extrabold tracking-wider uppercase text-blue-600 block mb-1.5">
                          {t.bilateral.buyersTag}
                        </span>
                        <h3 className="text-2xl font-black text-brandNavy mb-2.5 leading-tight tracking-tight">
                          {t.bilateral.buyersTitle}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6 font-normal max-w-xs">
                          {t.bilateral.buyersDesc}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenGeneralRFQ}
                        className="inline-flex items-center gap-2 bg-brandNavy hover:bg-brandNavyDark text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all w-fit shadow-sm cursor-pointer"
                      >
                        <span>{t.bilateral.buyersBtn}</span>
                        <i className="fa-solid fa-arrow-right text-[11px]"></i>
                      </button>
                    </div>
                    {/* Image Graphic with Smooth Seamless Gradient Fade */}
                    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
                      <img
                        alt="Cargo container ship with global network"
                        className="w-full h-full object-cover object-right"
                        referrerPolicy="no-referrer"
                        src={buyerCardImage}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#edf6fe] via-[#edf6fe]/90 via-45% to-transparent"></div>
                    </div>
                  </div>

                  {/* Right: For Producers */}
                  <div className="relative bg-gradient-to-r from-[#eef9f5] via-[#f0fbf7] to-[#d8f3e9] rounded-xl border border-emerald-100/80 overflow-hidden flex flex-col sm:flex-row items-stretch justify-between shadow-sm min-h-[220px]">
                    {/* Content Side */}
                    <div className="p-6 sm:p-7 flex flex-col justify-between max-w-sm sm:max-w-md z-10 relative">
                      <div>
                        <span className="text-[11px] font-extrabold tracking-wider uppercase text-brandGreen block mb-1.5">
                          {t.bilateral.producersTag}
                        </span>
                        <h3 className="text-2xl font-black text-brandNavy mb-2.5 leading-tight tracking-tight">
                          {t.bilateral.producersTitle}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6 font-normal max-w-xs">
                          {t.bilateral.producersDesc}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProducerModalOpen(true)}
                        className="inline-flex items-center gap-2 bg-brandGreen hover:bg-brandGreenDark text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all w-fit shadow-sm cursor-pointer"
                      >
                        <span>{t.bilateral.producersBtn}</span>
                        <i className="fa-solid fa-arrow-right text-[11px]"></i>
                      </button>
                    </div>
                    {/* Image Graphic with Smooth Seamless Gradient Fade */}
                    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
                      <img
                        alt="Modern industrial manufacturing factory"
                        className="w-full h-full object-cover object-right"
                        referrerPolicy="no-referrer"
                        src={producerCardImage}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#f0fbf7] via-[#f0fbf7]/90 via-45% to-transparent"></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            {/* END: DualAudienceCards */}

            {/* BEGIN: OurServices */}
            <section
              className="bg-white border-t border-gray-100 py-6"
              data-purpose="services-overview"
            >
              <div className="custom-container">
                <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <h2 className="text-2xl font-extrabold text-brandNavy">
                      {t.services.heading}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {t.services.subheading}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveView('services')}
                    className="text-xs font-bold text-brandNavy hover:text-brandGreen flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Explore Outsourced Export Desk</span>
                    <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {cmsServicesPillars.map((srv) => (
                    <div
                      key={srv.id}
                      className="border border-gray-200/90 rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div
                          className={`w-12 h-12 rounded-full ${srv.colorClass} text-white flex items-center justify-center text-xl mb-4 shadow-sm`}
                        >
                          <i className={srv.iconClass}></i>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-3">
                          {getLocalizedText(srv.title, locale)}
                        </h3>
                        <p className="text-xs text-gray-600 leading-relaxed mb-4">
                          {getLocalizedText(srv.subtitle, locale)}
                        </p>
                        <ul className="space-y-1.5 text-xs text-gray-600 mb-6 font-medium">
                          {srv.items.map((it, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                              {getLocalizedText(it, locale)}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveView('services')}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold ${srv.linkColorClass} hover:underline cursor-pointer w-fit`}
                      >
                        <span>{t.services.learnMore}</span>
                        <i className="fa-solid fa-arrow-right text-[10px]"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            {/* END: OurServices */}

            {/* BEGIN: HowItWorks */}
            <section
              className="bg-slate-50/70 border-t border-b border-gray-200/80 py-6 overflow-hidden"
              data-purpose="process-pipeline"
            >
              <div className="custom-container">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  {/* Left Side Intro */}
                  <div className="lg:w-1/4 shrink-0">
                    <h2 className="text-2xl font-extrabold text-brandNavy mb-2">
                      {t.howItWorks.heading}
                    </h2>
                    <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                      {t.howItWorks.subheading}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveView('how-it-works')}
                      className="inline-flex items-center gap-2 bg-brandNavy hover:bg-brandNavyDark text-white text-xs font-bold px-4 py-2.5 rounded transition-all cursor-pointer"
                    >
                      <span>{t.howItWorks.seeFullProcess}</span>
                      <i className="fa-solid fa-arrow-right text-[11px]"></i>
                    </button>
                  </div>

                  {/* Right Side Process Timelines */}
                  <div className="lg:w-3/4 w-full flex flex-col gap-8 overflow-x-auto pb-2">
                    {/* Buyers Pipeline (7 steps) */}
                    <div className="min-w-[640px]">
                      <span className="text-xs font-extrabold tracking-wide uppercase text-blue-700 block mb-3">
                        {t.howItWorks.forBuyersLabel}
                      </span>
                      <div className="grid grid-cols-7 gap-2 relative">
                        {cmsBuyerSteps.map((step, idx) => {
                          const isLast = idx === cmsBuyerSteps.length - 1;
                          const isSelected =
                            selectedStepInfo?.track === 'buyer' &&
                            selectedStepInfo.step.number === step.number;
                          return (
                            <button
                              key={step.number}
                              type="button"
                              onClick={() =>
                                setSelectedStepInfo(
                                  isSelected ? null : { track: 'buyer', step }
                                )
                              }
                              className={`flex flex-col items-center text-center relative cursor-pointer group ${
                                !isLast ? 'step-line' : ''
                              }`}
                            >
                              <span
                                className={`w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center relative z-10 shadow-sm mb-1.5 transition-transform group-hover:scale-110 tabular-nums ${
                                  isSelected ? 'bg-brandNavy ring-2 ring-blue-300' : 'bg-blue-600'
                                }`}
                              >
                                {step.number}
                              </span>
                              <span className="text-[10.5px] leading-tight text-gray-700 font-medium group-hover:text-brandNavy">
                                {getLocalizedText(step.title, locale)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Producers Pipeline (10 steps) */}
                    <div className="min-w-[680px]">
                      <span className="text-xs font-extrabold tracking-wide uppercase text-brandGreen block mb-3">
                        {t.howItWorks.forProducersLabel}
                      </span>
                      <div className="grid grid-cols-10 gap-1.5 relative">
                        {cmsProducerSteps.map((step, idx) => {
                          const isLast = idx === cmsProducerSteps.length - 1;
                          const isSelected =
                            selectedStepInfo?.track === 'producer' &&
                            selectedStepInfo.step.number === step.number;
                          return (
                            <button
                              key={step.number}
                              type="button"
                              onClick={() =>
                                setSelectedStepInfo(
                                  isSelected ? null : { track: 'producer', step }
                                )
                              }
                              className={`flex flex-col items-center text-center relative cursor-pointer group ${
                                !isLast ? 'step-line' : ''
                              }`}
                            >
                              <span
                                className={`w-6 h-6 rounded-full text-white font-bold text-[11px] flex items-center justify-center relative z-10 shadow-sm mb-1.5 transition-transform group-hover:scale-110 tabular-nums ${
                                  isSelected
                                    ? 'bg-brandNavy ring-2 ring-emerald-300'
                                    : 'bg-brandGreen'
                                }`}
                              >
                                {step.number}
                              </span>
                              <span className="text-[9.5px] leading-tight text-gray-700 group-hover:text-brandGreen">
                                {getLocalizedText(step.title, locale)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interactive Step Drawer when user clicks any step circle — CTA only on the last step */}
                    {selectedStepInfo && (() => {
                      const isBuyerLast = selectedStepInfo.track === 'buyer'
                        && selectedStepInfo.step.number === Math.max(...cmsBuyerSteps.map(s => s.number));
                      const isProducerLast = selectedStepInfo.track === 'producer'
                        && selectedStepInfo.step.number === Math.max(...cmsProducerSteps.map(s => s.number));
                      return (
                      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-brandNavy mb-0.5">
                            <span>{selectedStepInfo.step.authority}</span>
                            <span>·</span>
                            <span className="text-brandGreen tabular-nums">
                              SLA: {selectedStepInfo.step.sla}
                            </span>
                          </div>
                          <h4 className="text-sm font-extrabold text-slate-900">
                            {getLocalizedText(selectedStepInfo.step.detailTitle, locale)}
                          </h4>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {getLocalizedText(selectedStepInfo.step.description, locale)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isBuyerLast && (
                            <button
                              type="button"
                              onClick={() => handleOpenGeneralRFQ()}
                              className="bg-brandNavy text-white text-xs font-bold px-3.5 py-2 rounded cursor-pointer"
                            >
                              Start Buyer RFQ
                            </button>
                          )}
                          {isProducerLast && (
                            <button
                              type="button"
                              onClick={() => setProducerModalOpen(true)}
                              className="bg-brandNavy text-white text-xs font-bold px-3.5 py-2 rounded cursor-pointer"
                            >
                              Register Producer
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedStepInfo(null)}
                            className="text-slate-400 hover:text-slate-700 p-1.5 cursor-pointer"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </section>
            {/* END: HowItWorks */}

            {/* BEGIN: FeaturedProducts */}
            <section className="bg-white py-6" data-purpose="featured-products">
              <div className="custom-container">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-brandNavy">
                      {t.featuredProducts.heading}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      {t.featuredProducts.subheading}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveView('products')}
                    className="text-xs font-bold text-brandNavy hover:text-brandGreen flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{t.featuredProducts.viewAll}</span>
                    <i className="fa-solid fa-arrow-right text-[11px]"></i>
                  </button>
                </div>

                {/* Category tiles — one per category, with item count */}
                {categoryTiles.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {categoryTiles.map((cat) => (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setActiveView('products')}
                        className="border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-between h-32 text-left hover:shadow-md hover:border-brandGreen/40 transition-all cursor-pointer group"
                      >
                        <div className="w-11 h-11 rounded-full bg-brandGreen/10 text-brandGreen flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
                          <i className={cat.icon}></i>
                        </div>
                        <div className="mt-2 text-center">
                          <span className="block text-xs font-bold text-gray-900 leading-tight">{getLocalizedText(cat.label, locale)}</span>
                          <span className="mt-1 inline-block text-[10px] font-semibold text-brandNavy bg-brandNavy/5 border border-brandNavy/10 px-2 py-0.5 rounded-full tabular-nums">
                            {cat.count} {cat.count === 1 ? (locale === 'AZ' ? 'məhsul' : locale === 'TR' ? 'ürün' : locale === 'RU' ? 'товар' : 'item') : (locale === 'AZ' ? 'məhsul' : locale === 'TR' ? 'ürün' : locale === 'RU' ? 'товара' : 'items')}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-6 flex items-center justify-center gap-3 text-sm text-gray-500">
                    <i className="fa-solid fa-box-open text-2xl text-gray-300"></i>
                    <span>{locale === 'AZ' ? 'Kateqoriya üzrə məhsullar hazır deyil' : locale === 'TR' ? 'Kategoriye ürünü hazır değil' : locale === 'RU' ? 'Нет товаров по категориям' : 'No products by category yet'}</span>
                  </div>
                )}
              </div>
            </section>
            {/* END: FeaturedProducts */}

            {/* BEGIN: WhyAzerbaijan */}
            <section
              className="relative w-full bg-[#071c30] text-white overflow-hidden min-h-[160px] sm:min-h-[180px] lg:min-h-[190px] flex items-center border-t border-gray-100"
              data-purpose="azerbaijan-advantages"
            >
              {/* Full-width Panoramic Baku Boulevard Sunset Background Image */}
              <div className="absolute inset-0 z-0">
                <img
                  alt="Baku Boulevard, Caspian Sea, Flame Towers, and Baku TV Tower panorama at dusk"
                  className="w-full h-full object-cover object-right"
                  referrerPolicy="no-referrer"
                  src={whyAzImage}
                />
                {/* Smooth deep navy gradient overlay transitioning to transparent on the right */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#071d33] via-[#071d33]/90 via-45% to-transparent"></div>
              </div>

              <div className="custom-container relative z-10 w-full py-7 sm:py-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-10">
                  {/* Left: Heading, Subtitle & Button */}
                  <div className="max-w-md text-left z-10">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
                      {t.whyAzerbaijan.heading}
                    </h2>
                    <p className="text-xs text-gray-200/90 leading-relaxed font-normal mb-4 max-w-sm">
                      {t.whyAzerbaijan.desc}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveView('insights')}
                      className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white text-xs font-semibold px-4 py-1.5 rounded transition-colors bg-[#08233d]/50 hover:bg-[#08233d]/80 cursor-pointer"
                    >
                      <span>{t.whyAzerbaijan.learnMore}</span>
                      <i className="fa-solid fa-arrow-right text-[10px]"></i>
                    </button>
                  </div>

                  {/* Middle: 4 Crisp White Icons with Labels */}
                  <div className="flex flex-wrap items-center gap-6 sm:gap-9 text-center z-10">
                    {t.whyAzerbaijan.features.map((feat, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setActiveAzFeatureIdx(activeAzFeatureIdx === idx ? null : idx)
                        }
                        className="flex flex-col items-center group cursor-pointer"
                      >
                        <div className="w-8 h-8 flex items-center justify-center text-white/90 group-hover:text-amber-300 text-lg mb-1 transition-colors">
                          <i className={azIcons[idx] ?? 'fa-solid fa-circle-check'}></i>
                        </div>
                        <span className="text-[11px] leading-tight font-medium text-white/90 max-w-[85px]">
                          {feat.line1}
                          <br />
                          {feat.line2}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {activeAzFeatureIdx !== null && (
                  <div className="mt-4 p-3.5 bg-[#08233d]/90 border border-white/20 rounded text-xs text-slate-100 flex items-center justify-between gap-4 max-w-2xl">
                    <span>{t.whyAzerbaijan.features[activeAzFeatureIdx].detail}</span>
                    <button
                      type="button"
                      onClick={() => setActiveAzFeatureIdx(null)}
                      className="text-white/70 hover:text-white cursor-pointer"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                )}
              </div>
            </section>
            {/* END: WhyAzerbaijan */}
          </>
        )}

        {activeView === 'products' && (
          <CatalogView
            locale={locale}
            shortlistedIds={shortlistedIds}
            onToggleShortlist={handleToggleShortlist}
            onRequestProduct={handleOpenProductRFQ}
            onInspectProduct={(p) => setInspectedProduct(p)}
            onOpenMultiRFQ={handleOpenGeneralRFQ}
          />
        )}

        {activeView === 'articles' && (
<InsightsView locale={locale} onNavigateHome={() => setActiveView('home')} />
          
        )}

        {activeView === 'dossiers' && (
          <DossiersView
            rfqList={rfqSubmissions}
            producerList={producerApps}
            shortlistedIds={shortlistedIds}
            locale={locale}
            onInspectRFQ={(rfq) => {
              setActivePrintProducer(null);
              setActivePrintRFQ(rfq);
            }}
            onInspectProducer={(app) => {
              setActivePrintRFQ(null);
              setActivePrintProducer(app);
            }}
            onOpenRFQ={handleOpenGeneralRFQ}
            onOpenProducerModal={() => setProducerModalOpen(true)}
            onRemoveShortlist={handleToggleShortlist}
            onUpdateRFQStatus={handleUpdateRFQStatus}
            onUpdateProducerStatus={handleUpdateProducerStatus}
            onDeleteRFQ={handleDeleteRFQ}
            onDeleteProducer={handleDeleteProducer}
          />
        )}

        {activeView === 'about' && (
          <AboutView
            locale={locale}
            onOpenRFQ={handleOpenGeneralRFQ}
            onOpenProducer={() => setProducerModalOpen(true)}
            onNavigate={(v) => setActiveView(v)}
          />
        )}

        {activeView === 'insights' && (
<InsightsView locale={locale} onNavigateHome={() => setActiveView('home')} />
          
        )}

        {['buyers', 'producers', 'services', 'how-it-works', 'contact'].includes(
          activeView
        ) && (
          <SubpagePortalView
            activeView={activeView}
            locale={locale}
            onOpenRFQ={handleOpenGeneralRFQ}
            onOpenProducer={() => setProducerModalOpen(true)}
            onOpenServiceApp={(serviceId) => { setServiceAppPreselected(serviceId); setServiceAppModalOpen(true); }}
            onNavigate={(v) => setActiveView(v)}
          />
        )}
        </PageTransition>
      </main>

      {/* Institutional Footer */}
      <footer className="bg-[#061526] text-slate-300 border-t border-slate-800 py-10 no-print">
        <div className="custom-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8 border-b border-slate-800/80 text-xs">
            {/* Brand & Mandate */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 100 100">
                  <circle cx="50" cy="20" fill="#009775" r="14"></circle>
                  <circle cx="80" cy="50" fill="#3b82f6" r="14"></circle>
                  <circle cx="50" cy="80" fill="#e63946" r="14"></circle>
                  <circle cx="20" cy="50" fill="#f4a261" r="14"></circle>
                  <circle cx="71" cy="29" fill="#2a9d8f" opacity="0.8" r="11"></circle>
                  <circle cx="71" cy="71" fill="#60a5fa" opacity="0.8" r="11"></circle>
                  <circle cx="29" cy="71" fill="#e76f51" opacity="0.8" r="11"></circle>
                  <circle cx="29" cy="29" fill="#457b9d" opacity="0.8" r="11"></circle>
                </svg>
                <span className="text-lg font-extrabold tracking-tight text-white">
                  AZEXBUY
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">{t.footer.description}</p>
              <div className="text-[11px] text-slate-400 pt-1">
                <span>Sovereign Trade & Sourcing Infrastructure Consortium</span>
              </div>
            </div>

            {/* Platform Navigation */}
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider text-[11px] mb-3">
                {t.footer.quickLinks}
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveView('buyers')}
                    className="hover:text-white cursor-pointer"
                  >
                    {t.nav.forBuyers} — RFQ Sourcing Desk
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveView('producers')}
                    className="hover:text-white cursor-pointer"
                  >
                    {t.nav.forProducers} — Export Onboarding
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveView('products')}
                    className="hover:text-white cursor-pointer"
                  >
                    {t.nav.products} — National HS-6 Catalog
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveView('services')}
                    className="hover:text-white cursor-pointer"
                  >
                    {t.nav.services} — Outsourced Export Dept.
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveView('insights')}
                    className="hover:text-white cursor-pointer"
                  >
                    Articles — Trade Intelligence & Reports
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveView('dossiers')}
                    className="hover:text-white cursor-pointer"
                  >
                    Saved Printable RFQ Dossiers ({rfqSubmissions.length + producerApps.length})
                  </button>
                </li>
              </ul>
            </div>

            {/* Headquarters */}
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider text-[11px] mb-3">
                {t.footer.hqTitle}
              </h4>
              <p className="text-slate-400 leading-relaxed mb-2">{t.footer.hqAddress}</p>
              <p className="text-slate-300 font-semibold tabular-nums">
                Tel: {contact.phone}
              </p>
              <p className="text-slate-300 font-semibold">Email: {contact.email}</p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <span>{t.footer.rights}</span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setActiveView('insights')}
                className="hover:text-slate-300 cursor-pointer"
              >
                Middle Corridor Transit Data
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setActiveView('contact')}
                className="hover:text-slate-300 cursor-pointer"
              >
                {t.footer.contactUs}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      <RFQBuilderModal
        isOpen={rfqModalOpen}
        onClose={() => setRfqModalOpen(false)}
        locale={locale}
        initialProduct={rfqInitialProduct}
        shortlistedIds={shortlistedIds}
        sourceView={activeView}
        onSubmitRFQ={handleSubmitRFQ}
      />

      <ProducerOnboardingModal
        isOpen={producerModalOpen}
        onClose={() => setProducerModalOpen(false)}
        locale={locale}
        onSubmitProducer={handleSubmitProducer}
      />

      <ProductSpecModal
        product={inspectedProduct}
        locale={locale}
        onClose={() => setInspectedProduct(null)}
        onRequestProduct={handleOpenProductRFQ}
      />

      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        locale={locale}
        onSelectProduct={(p) => setInspectedProduct(p)}
        onRequestProduct={handleOpenProductRFQ}
      />

      <PrintableDossierModal
        rfq={activePrintRFQ}
        producerApp={activePrintProducer}
        locale={locale}
        onClose={() => {
          setActivePrintRFQ(null);
          setActivePrintProducer(null);
        }}
      />

      {/* Service Application Modal */}
      {serviceAppModalOpen && (
        <ServiceApplicationModal
          locale={locale}
          services={cmsServices}
          preselectedServiceId={serviceAppPreselected}
          onClose={() => { setServiceAppModalOpen(false); setServiceAppPreselected(undefined); }}
          onSubmit={() => { setServiceAppModalOpen(false); setServiceAppPreselected(undefined); showToast(locale === 'AZ' ? 'Müraciətiniz göndərildi!' : locale === 'TR' ? 'Başvurunuz gönderildi!' : locale === 'RU' ? 'Заявка отправлена!' : 'Application submitted!'); }}
        />
      )}

      {/* AI Sovereign Trade & Sourcing Consultant Modal */}
      <AIDeskModal
        isOpen={aiDeskOpen}
        onClose={() => setAiDeskOpen(false)}
        locale={locale}
        onOpenRFQ={handleOpenGeneralRFQ}
        onOpenProducer={() => setProducerModalOpen(true)}
      />

      {/* Floating Trade Desk Trigger Button */}
      <button
        type="button"
        onClick={() => setAiDeskOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-white hover:bg-slate-50 text-brandNavy px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-semibold border border-slate-200 cursor-pointer transition-all hover:shadow-md no-print"
        title="AZEXBUY Trade Desk"
      >
        <i className="fa-solid fa-comments text-brandNavy text-xs"></i>
        <span>Trade Desk</span>
      </button>

      {/* Instant Action Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200 no-print">
          <i className="fa-solid fa-circle-check text-emerald-400"></i>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
