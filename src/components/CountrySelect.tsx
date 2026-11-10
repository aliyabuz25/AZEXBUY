import React, { useState, useRef, useEffect, useMemo } from 'react';
import { WORLD_COUNTRIES, Country } from '../data/countries';

export const CircleFlag: React.FC<{ code: string; name?: string; className?: string }> = ({
  code,
  name,
  className = 'w-5 h-5',
}) => {
  const [hasError, setHasError] = useState(false);
  const codeLower = code?.toLowerCase() || '';

  if (hasError || !codeLower) {
    return (
      <span
        className={`${className} rounded-full bg-slate-100 text-slate-600 font-bold text-[9px] flex items-center justify-center shrink-0 border border-slate-200 select-none`}
        title={name || code}
      >
        {code?.slice(0, 2).toUpperCase() || '🌐'}
      </span>
    );
  }

  return (
    <img
      src={`https://hatscripts.github.io/circle-flags/flags/${codeLower}.svg`}
      alt={name || code}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`${className} rounded-full object-cover shrink-0 border border-slate-100 shadow-xs select-none`}
    />
  );
};

interface CountrySelectProps {
  value: string;
  onChange: (countryName: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  required = false,
  placeholder = 'Select Destination Country...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Find currently selected country by name or code
  const selectedCountry = useMemo(() => {
    if (!value) return null;
    const v = value.trim().toLowerCase();
    return (
      WORLD_COUNTRIES.find(
        (c) => c.name.toLowerCase() === v || c.code.toLowerCase() === v
      ) || { code: 'UN', name: value }
    );
  }, [value]);

  // Filter countries by search query
  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return WORLD_COUNTRIES;
    return WORLD_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (c: Country) => {
    onChange(c.name);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${isOpen ? 'z-[100]' : 'z-20'} ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden input to satisfy form required check if needed */}
      <input
        type="text"
        required={required}
        value={value}
        onChange={() => {}}
        tabIndex={-1}
        className="sr-only"
        aria-hidden="true"
      />

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative z-10 w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded text-slate-900 flex items-center justify-between gap-2 hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-800 cursor-pointer transition-colors shadow-xs"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selectedCountry && selectedCountry.name ? (
          <div className="flex items-center gap-2.5 truncate">
            <CircleFlag code={selectedCountry.code} name={selectedCountry.name} className="w-5 h-5" />
            <span className="font-semibold text-slate-800 truncate">{selectedCountry.name}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 truncate">
            <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400">
              <i className="fa-solid fa-globe text-[11px]"></i>
            </span>
            <span className="truncate">{placeholder}</span>
          </div>
        )}
        <i
          className={`fa-solid fa-chevron-down text-slate-400 text-[10px] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        ></i>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl z-[9999] overflow-hidden flex flex-col max-h-72 ring-1 ring-black/5">
          {/* Search Header */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/90 shrink-0">
            <div className="relative flex items-center">
              <i className="fa-solid fa-magnifying-glass text-slate-400 text-xs absolute left-2.5 pointer-events-none"></i>
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or code (e.g. Germany, DE)..."
                className="w-full h-8 pl-8 pr-7 text-xs bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>
          </div>

          {/* Countries List */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No countries match "{search}"
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = selectedCountry?.code === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/50 font-semibold text-brandNavy' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <CircleFlag code={c.code} name={c.name} className="w-5 h-5" />
                      <span className="text-xs truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {c.code}
                      </span>
                      {isSelected && (
                        <i className="fa-solid fa-check text-brandGreen text-xs"></i>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
