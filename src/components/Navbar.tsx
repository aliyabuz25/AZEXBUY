import React, { useState, useRef, useEffect } from 'react';
import { Locale, ViewMode } from '../types';
import { useLocalization } from '../context/LocalizationContext';

const CircleFlagAZ = () => (
  <svg className="w-5 h-5 rounded-full" viewBox="0 0 512 512">
    <mask id="cfaz"><circle cx="256" cy="256" r="256" fill="#fff"/></mask>
    <g mask="url(#cfaz)">
      <path fill="#00b5e2" d="M0 0h512v170.7H0z"/>
      <path fill="#ef3340" d="M0 170.7h512v170.6H0z"/>
      <path fill="#509e2f" d="M0 341.3h512V512H0z"/>
      <circle cx="230" cy="256" r="54" fill="#fff"/>
      <circle cx="242" cy="256" r="44" fill="#ef3340"/>
      <polygon fill="#fff" points="266,234 272,246 284,244 278,254 286,264 274,264 270,276 264,266 252,270 256,258 248,250 260,250"/>
    </g>
  </svg>
);

const CircleFlagEN = () => (
  <svg className="w-5 h-5 rounded-full" viewBox="0 0 512 512">
    <mask id="cfen"><circle cx="256" cy="256" r="256" fill="#fff"/></mask>
    <g mask="url(#cfen)">
      <path fill="#012169" d="M0 0h512v512H0z"/>
      <path stroke="#fff" strokeWidth="60" d="M0 0l512 512M512 0L0 512"/>
      <path stroke="#c8102e" strokeWidth="38" d="M0 0l512 512M512 0L0 512"/>
      <path stroke="#fff" strokeWidth="100" d="M256 0v512M0 256h512"/>
      <path stroke="#c8102e" strokeWidth="60" d="M256 0v512M0 256h512"/>
    </g>
  </svg>
);

const CircleFlagTR = () => (
  <svg className="w-5 h-5 rounded-full" viewBox="0 0 512 512">
    <mask id="cftr"><circle cx="256" cy="256" r="256" fill="#fff"/></mask>
    <g mask="url(#cftr)">
      <circle cx="256" cy="256" r="256" fill="#e30a17"/>
      <circle cx="206" cy="256" r="82" fill="#fff"/>
      <circle cx="224" cy="256" r="66" fill="#e30a17"/>
      <polygon fill="#fff" points="274,226 280,246 300,246 284,258 290,278 274,266 258,278 264,258 248,246 268,246"/>
    </g>
  </svg>
);

const CircleFlagRU = () => (
  <svg className="w-5 h-5 rounded-full" viewBox="0 0 512 512">
    <mask id="cfru"><circle cx="256" cy="256" r="256" fill="#fff"/></mask>
    <g mask="url(#cfru)">
      <path fill="#fff" d="M0 0h512v170.7H0z"/>
      <path fill="#0039a6" d="M0 170.7h512v170.6H0z"/>
      <path fill="#d52b1e" d="M0 341.3h512V512H0z"/>
    </g>
  </svg>
);

const CircleFlagAR = () => (
  <svg className="w-5 h-5 rounded-full" viewBox="0 0 512 512">
    <mask id="cfar"><circle cx="256" cy="256" r="256" fill="#fff"/></mask>
    <g mask="url(#cfar)">
      <path fill="#006c35" d="M0 0h512v170.7H0z"/>
      <path fill="#fff" d="M0 170.7h512v170.6H0z"/>
      <path fill="#000" d="M0 341.3h512V512H0z"/>
    </g>
  </svg>
);

const CircleFlagES = () => (
  <svg className="w-5 h-5 rounded-full" viewBox="0 0 512 512">
    <mask id="cfes"><circle cx="256" cy="256" r="256" fill="#fff"/></mask>
    <g mask="url(#cfes)">
      <path fill="#c60b1e" d="M0 0h512v512H0z"/>
      <path fill="#ffc400" d="M0 128h512v256H0z"/>
    </g>
  </svg>
);

const FLAG_MAP: Record<Locale, React.FC> = {
  AZ: CircleFlagAZ,
  EN: CircleFlagEN,
  TR: CircleFlagTR,
  RU: CircleFlagRU,
  AR: CircleFlagAR,
  ES: CircleFlagES,
};

const LANG_LABELS: Record<Locale, string> = {
  AZ: 'Azərbaycan',
  EN: 'English',
  TR: 'Türkçe',
  RU: 'Русский',
  AR: 'العربية',
  ES: 'Español',
};

interface NavbarProps {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  onOpenSearch: () => void;
  onOpenRFQ: () => void;
  onOpenAIDesk: () => void;
  dossiersCount: number;
  shortlistCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  locale,
  setLocale,
  activeView,
  setActiveView,
  onOpenSearch,
  onOpenRFQ,
  onOpenAIDesk,
  dossiersCount,
  shortlistCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { strings } = useLocalization();
  const t = strings[locale]?.nav || strings['AZ']?.nav || strings['EN']?.nav || ({} as any);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: ViewMode; label: string }[] = [
    { id: 'home', label: t.home },
    { id: 'buyers', label: t.forBuyers },
    { id: 'producers', label: t.forProducers },
    { id: 'services', label: t.services },
    { id: 'products', label: t.products },
    { id: 'how-it-works', label: t.howItWorks },
    { id: 'about', label: t.aboutUs },
    { id: 'insights', label: t.insights },
    { id: 'contact', label: t.contact },
  ];

  const handleNavClick = (view: ViewMode) => {
    setActiveView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 no-print">
      {/* Main topbar */}
      <div className="custom-container flex items-center justify-between h-16 gap-3">

        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 group cursor-pointer shrink-0"
          data-purpose="brand-logo"
        >
          <svg className="w-8 h-8 shrink-0 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 100 100">
            <circle cx="50" cy="20" fill="#009775" r="14" />
            <circle cx="80" cy="50" fill="#0f3156" r="14" />
            <circle cx="50" cy="80" fill="#e63946" r="14" />
            <circle cx="20" cy="50" fill="#f4a261" r="14" />
            <circle cx="71" cy="29" fill="#2a9d8f" opacity="0.8" r="11" />
            <circle cx="71" cy="71" fill="#1d3557" opacity="0.8" r="11" />
            <circle cx="29" cy="71" fill="#e76f51" opacity="0.8" r="11" />
            <circle cx="29" cy="29" fill="#457b9d" opacity="0.8" r="11" />
          </svg>
          <span className="text-xl font-extrabold tracking-tight text-brandNavy whitespace-nowrap">
            AZEXBUY
          </span>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden xl:flex items-center gap-5 text-[13px] font-semibold text-gray-700 flex-1 justify-center">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
                  isActive
                    ? 'text-brandNavy font-bold border-b-2 border-brandNavy'
                    : 'hover:text-brandGreen text-gray-700'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Language Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-2.5 py-1.5 hover:border-slate-300 shadow-sm cursor-pointer transition-colors"
            >
              {React.createElement(FLAG_MAP[locale] || CircleFlagAZ)}
              <i className={`fa-solid fa-chevron-down text-[8px] text-slate-500 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {langDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2 w-48 overflow-hidden">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dil Seçin</div>
                {(['AZ', 'EN', 'TR', 'RU', 'AR', 'ES'] as Locale[]).map((lang) => {
                  const Flag = FLAG_MAP[lang];
                  const isActive = locale === lang;
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => { setLocale(lang); setLangDropdownOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-slate-100 text-slate-900 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Flag />
                      <span>{LANG_LABELS[lang]}</span>
                      {isActive && <span className="ml-auto text-brandNavy">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search */}
          <button
            type="button"
            aria-label="Search"
            onClick={onOpenSearch}
            className="p-2 rounded text-gray-600 hover:text-brandNavy hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-magnifying-glass text-sm"></i>
          </button>

          {/* Dossiers */}
          <button
            type="button"
            onClick={() => handleNavClick('dossiers')}
            className={`relative p-2 rounded transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold ${
              activeView === 'dossiers'
                ? 'bg-blue-50 text-brandNavy border border-blue-200'
                : 'text-gray-600 hover:text-brandNavy hover:bg-slate-100'
            }`}
            title={t.dossiers}
          >
            <i className="fa-regular fa-folder-open text-sm"></i>
            {(dossiersCount > 0 || shortlistCount > 0) && (
              <span className="bg-brandGreen text-white text-[9px] font-extrabold px-1 py-0.5 rounded tabular-nums">
                {dossiersCount + shortlistCount}
              </span>
            )}
          </button>

          {/* Request Quote — hidden on mobile, shown sm+ */}
          <button
            type="button"
            onClick={onOpenRFQ}
            className="hidden sm:block bg-brandNavy hover:bg-brandNavyDark text-white text-[11px] font-bold tracking-wider px-4 py-2 rounded transition-colors cursor-pointer whitespace-nowrap"
          >
            {t.requestQuote}
          </button>

          {/* Hamburger — visible below xl */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded text-gray-700 hover:text-brandNavy hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle menu"
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Full-Screen Drawer */}
      <div
        className={`xl:hidden fixed inset-0 z-[200] transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Drawer panel — slides from right */}
        <div
          className={`absolute top-0 right-0 h-full w-full max-w-sm bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-7 h-7 shrink-0" fill="none" viewBox="0 0 100 100">
                <circle cx="50" cy="20" fill="#009775" r="14" />
                <circle cx="80" cy="50" fill="#0f3156" r="14" />
                <circle cx="50" cy="80" fill="#e63946" r="14" />
                <circle cx="20" cy="50" fill="#f4a261" r="14" />
                <circle cx="71" cy="29" fill="#2a9d8f" opacity="0.8" r="11" />
                <circle cx="71" cy="71" fill="#1d3557" opacity="0.8" r="11" />
                <circle cx="29" cy="71" fill="#e76f51" opacity="0.8" r="11" />
                <circle cx="29" cy="29" fill="#457b9d" opacity="0.8" r="11" />
              </svg>
              <span className="text-lg font-extrabold tracking-tight text-brandNavy">AZEXBUY</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">

            {/* Nav items — full width, alt alta */}
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                  activeView === item.id
                    ? 'bg-brandNavy text-white'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                {activeView === item.id && <i className="fa-solid fa-chevron-right text-[10px] opacity-70"></i>}
              </button>
            ))}

            <button
              type="button"
              onClick={() => handleNavClick('dossiers')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                activeView === 'dossiers'
                  ? 'bg-brandNavy text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{t.dossiers}</span>
              {(dossiersCount + shortlistCount) > 0 && (
                <span className="text-[10px] bg-brandGreen text-white px-1.5 py-0.5 rounded-full tabular-nums">
                  {dossiersCount + shortlistCount}
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="border-t border-slate-100 my-2" />

            {/* Language picker — inline, full width */}
            <div className="px-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Dil / Language</div>
              <div className="flex flex-col gap-1">
                {(['AZ', 'EN', 'TR', 'RU', 'AR', 'ES'] as Locale[]).map((lang) => {
                  const Flag = FLAG_MAP[lang];
                  const isActive = locale === lang;
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => { setLocale(lang); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Flag />
                      <span>{LANG_LABELS[lang]}</span>
                      {isActive && <i className="fa-solid fa-check text-brandNavy text-xs ml-auto"></i>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="px-4 py-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { onOpenRFQ(); setMobileMenuOpen(false); }}
              className="w-full bg-brandNavy hover:bg-brandNavyDark text-white text-sm font-bold py-3.5 rounded-xl transition-colors cursor-pointer"
            >
              {t.requestQuote}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
