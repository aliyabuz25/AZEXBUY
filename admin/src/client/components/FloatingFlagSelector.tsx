import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { UiLanguage } from '../types';

interface FloatingFlagSelectorProps {
  currentLang: UiLanguage;
  onSelectLang: (lang: UiLanguage) => void;
}

const CircleFlagAz = () => (
  <svg className="w-6 h-6 rounded-full shadow-xs" viewBox="0 0 512 512">
    <mask id="f-mask-az"><circle cx="256" cy="256" r="256" fill="#fff"/></mask>
    <g mask="url(#f-mask-az)">
      <path fill="#00b5e2" d="M0 0h512v170.7H0z"/>
      <path fill="#ef3340" d="M0 170.7h512v170.6H0z"/>
      <path fill="#509e2f" d="M0 341.3h512V512H0z"/>
      <circle cx="230" cy="256" r="54" fill="#fff"/>
      <circle cx="242" cy="256" r="44" fill="#ef3340"/>
      <polygon fill="#fff" points="266,234 272,246 284,244 278,254 286,264 274,264 270,276 264,266 252,270 256,258 248,250 260,250"/>
    </g>
  </svg>
);

const CircleFlagTr = () => (
  <svg className="w-6 h-6 rounded-full shadow-xs" viewBox="0 0 512 512">
    <mask id="f-mask-tr"><circle cx="256" cy="256" r="256" fill="#fff"/></mask>
    <g mask="url(#f-mask-tr)">
      <circle cx="256" cy="256" r="256" fill="#e30a17"/>
      <circle cx="206" cy="256" r="82" fill="#fff"/>
      <circle cx="224" cy="256" r="66" fill="#e30a17"/>
      <polygon fill="#fff" points="274,226 280,246 300,246 284,258 290,278 274,266 258,278 264,258 248,246 268,246"/>
    </g>
  </svg>
);

const CircleFlagRu = () => (
  <svg className="w-6 h-6 rounded-full shadow-xs" viewBox="0 0 512 512">
    <mask id="f-mask-ru"><circle cx="256" cy="256" r="256" fill="#fff"/></mask>
    <g mask="url(#f-mask-ru)">
      <path fill="#fff" d="M0 0h512v170.7H0z"/>
      <path fill="#0039a6" d="M0 170.7h512v170.6H0z"/>
      <path fill="#d52b1e" d="M0 341.3h512V512H0z"/>
    </g>
  </svg>
);

const CircleFlagEn = () => (
  <svg className="w-6 h-6 rounded-full shadow-xs" viewBox="0 0 512 512">
    <mask id="f-mask-gb"><circle cx="256" cy="256" r="256" fill="#fff"/></mask>
    <g mask="url(#f-mask-gb)">
      <path fill="#012169" d="M0 0h512v512H0z"/>
      <path stroke="#fff" strokeWidth="60" d="M0 0l512 512M512 0L0 512"/>
      <path stroke="#c8102e" strokeWidth="38" d="M0 0l512 512M512 0L0 512"/>
      <path stroke="#fff" strokeWidth="100" d="M256 0v512M0 256h512"/>
      <path stroke="#c8102e" strokeWidth="60" d="M256 0v512M0 256h512"/>
    </g>
  </svg>
);

const flagComponents = {
  az: CircleFlagAz,
  tr: CircleFlagTr,
  ru: CircleFlagRu,
  en: CircleFlagEn
};

const languages: { id: UiLanguage; label: string }[] = [
  { id: 'az', label: 'Azərbaycan' },
  { id: 'tr', label: 'Türkçe' },
  { id: 'ru', label: 'Русский' },
  { id: 'en', label: 'English' }
];

export const FloatingFlagSelector: React.FC<FloatingFlagSelectorProps> = ({
  currentLang,
  onSelectLang
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const ActiveFlag = flagComponents[currentLang] || CircleFlagAz;

  return (
    <div ref={containerRef} className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-14 right-0 bg-white rounded-2xl border border-slate-200/90 shadow-xl p-2 w-48 space-y-1 overflow-hidden"
          >
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Panel Dilini Seçin
            </div>
            {languages.map(lang => {
              const Flag = flagComponents[lang.id];
              const isSelected = currentLang === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => {
                    onSelectLang(lang.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Flag />
                    <span>{lang.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-slate-900" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Circle Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(prev => !prev);
        }}
        className="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center cursor-pointer hover:border-slate-300 transition-colors"
        title="Dili Dəyişdir"
      >
        <ActiveFlag />
      </motion.button>
    </div>
  );
};
