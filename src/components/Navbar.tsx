import React, { useState, useRef, useEffect } from 'react';
import { Locale, ViewMode } from '../types';
import { useLocalization } from '../context/LocalizationContext';

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
  const t = strings[locale].nav;

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
              className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-[11px] font-bold text-slate-700 hover:border-slate-300 cursor-pointer"
            >
              <i className="fa-solid fa-globe text-[10px] text-brandNavy"></i>
              <span>{locale}</span>
              <i className={`fa-solid fa-chevron-down text-[8px] transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {langDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1 min-w-[72px]">
                {(['EN', 'AZ', 'TR', 'RU', 'AR', 'ES'] as Locale[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => { setLocale(lang); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                      locale === lang
                        ? 'bg-brandNavy text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-brandNavy'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
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

          {/* AI Desk — icon only on mobile */}
          <button
            type="button"
            onClick={onOpenAIDesk}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1.5 rounded transition-colors cursor-pointer shrink-0"
            title="AI Trade Desk"
          >
            <i className="fa-solid fa-brain text-emerald-600 text-sm"></i>
            <span className="hidden lg:inline">AI Desk</span>
          </button>

          {/* Request Quote — hidden on mobile, shown sm+ */}
          <button
            type="button"
            onClick={onOpenRFQ}
            className="hidden sm:block bg-brandNavy hover:bg-brandNavyDark text-white text-[11px] font-bold tracking-wider px-4 py-2 rounded transition-colors uppercase cursor-pointer whitespace-nowrap"
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="custom-container py-4 flex flex-col gap-3">

            {/* Language + AI row */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
              <div className="flex flex-wrap gap-1">
                {(['EN', 'AZ', 'TR', 'RU', 'AR', 'ES'] as Locale[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLocale(lang)}
                    className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                      locale === lang ? 'bg-brandNavy text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); onOpenAIDesk(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 cursor-pointer shrink-0"
              >
                <i className="fa-solid fa-brain text-emerald-600"></i>
                <span>AI Desk</span>
              </button>
            </div>

            {/* Nav grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left px-3 py-2 rounded text-sm font-semibold transition-colors cursor-pointer ${
                    activeView === item.id
                      ? 'bg-brandNavy text-white'
                      : 'text-gray-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleNavClick('dossiers')}
                className={`text-left px-3 py-2 rounded text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                  activeView === 'dossiers'
                    ? 'bg-brandNavy text-white'
                    : 'text-gray-700 hover:bg-slate-100'
                }`}
              >
                <span>{t.dossiers}</span>
                <span className="text-[10px] bg-brandGreen text-white px-1.5 py-0.5 rounded tabular-nums">
                  {dossiersCount + shortlistCount}
                </span>
              </button>
            </div>

            {/* Request Quote full width on mobile */}
            <button
              type="button"
              onClick={() => { onOpenRFQ(); setMobileMenuOpen(false); }}
              className="w-full bg-brandNavy hover:bg-brandNavyDark text-white text-sm font-bold py-3 rounded transition-colors uppercase cursor-pointer"
            >
              {t.requestQuote}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
