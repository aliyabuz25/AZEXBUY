import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, X, Moon, Sun } from 'lucide-react';
import { COLOR_THEMES, ColorTheme } from '../theme';
import { UiLanguage } from '../types';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onSelectTheme: (themeId: string) => void;
  uiLang: UiLanguage;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  uiLang
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'light' | 'dark'>('all');

  const filteredThemes = COLOR_THEMES.filter(theme => {
    if (filterMode === 'all') return true;
    return theme.mode === filterMode;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4">
          {/* Flat Semi-transparent Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60"
          />

          {/* Modal Container: Flat, Köşeli (Sharp Edges) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-none border border-slate-300 dark:border-slate-700 shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header: Clean, Flat, Technical */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-none bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center shrink-0">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Sistem Rəng Sxemləri
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    İnterfeys üçün texniki rəng və kontrast rejimini seçin
                  </p>
                </div>
              </div>

              {/* Mode Filters: Flat Segmented Tabs */}
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-slate-300 dark:border-slate-700 text-xs">
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-3 py-1.5 font-medium transition-colors ${
                      filterMode === 'all'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-50 dark:bg-slate-800'
                    }`}
                  >
                    Hamısı ({COLOR_THEMES.length})
                  </button>
                  <button
                    onClick={() => setFilterMode('light')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 font-medium border-l border-slate-300 dark:border-slate-700 transition-colors ${
                      filterMode === 'light'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-50 dark:bg-slate-800'
                    }`}
                  >
                    <Sun className="w-3 h-3" />
                    <span>Açıq (4)</span>
                  </button>
                  <button
                    onClick={() => setFilterMode('dark')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 font-medium border-l border-slate-300 dark:border-slate-700 transition-colors ${
                      filterMode === 'dark'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-50 dark:bg-slate-800'
                    }`}
                  >
                    <Moon className="w-3 h-3" />
                    <span>Tünd (4)</span>
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-none border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Themes Grid: Flat & Köşeli */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5 overflow-y-auto">
              {filteredThemes.map((theme: ColorTheme) => {
                const isSelected = currentTheme === theme.id;

                return (
                  <button
                    key={theme.id}
                    onClick={() => onSelectTheme(theme.id)}
                    className={`p-3.5 rounded-none text-left border transition-colors flex flex-col justify-between group cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 dark:border-white ring-1 ring-slate-900 dark:ring-white bg-slate-50 dark:bg-slate-800/60'
                        : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      {/* Flat Architectural Micro Mockup */}
                      <div 
                        className="w-full h-20 rounded-none p-1.5 mb-2.5 border relative overflow-hidden flex gap-1.5 select-none"
                        style={{
                          backgroundColor: theme.colors.bg,
                          borderColor: theme.colors.border
                        }}
                      >
                        {/* Micro Sidebar */}
                        <div 
                          className="w-12 rounded-none p-1 flex flex-col justify-between shrink-0 border"
                          style={{
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border
                          }}
                        >
                          <div className="space-y-1">
                            <div className="w-full h-1 rounded-none" style={{ backgroundColor: theme.colors.accent }} />
                            <div className="w-3/4 h-0.5 rounded-none opacity-40" style={{ backgroundColor: theme.colors.text }} />
                            <div className="w-full h-0.5 rounded-none opacity-20" style={{ backgroundColor: theme.colors.text }} />
                          </div>
                          <div className="w-full h-1 rounded-none opacity-30" style={{ backgroundColor: theme.colors.text }} />
                        </div>

                        {/* Micro Content Area */}
                        <div className="flex-1 flex flex-col gap-1">
                          <div 
                            className="h-3 rounded-none px-1 flex items-center justify-between border"
                            style={{
                              backgroundColor: theme.colors.surface,
                              borderColor: theme.colors.border
                            }}
                          >
                            <div className="w-8 h-0.5 rounded-none opacity-40" style={{ backgroundColor: theme.colors.text }} />
                            <div className="w-2 h-1.5 rounded-none" style={{ backgroundColor: theme.colors.accent }} />
                          </div>

                          <div className="grid grid-cols-2 gap-1">
                            <div 
                              className="p-1 rounded-none border"
                              style={{
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.border
                              }}
                            >
                              <div className="w-4 h-0.5 rounded-none opacity-40 mb-0.5" style={{ backgroundColor: theme.colors.text }} />
                              <div className="w-3 h-1 rounded-none" style={{ backgroundColor: theme.colors.accent }} />
                            </div>
                            <div 
                              className="p-1 rounded-none border"
                              style={{
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.border
                              }}
                            >
                              <div className="w-5 h-0.5 rounded-none opacity-40 mb-0.5" style={{ backgroundColor: theme.colors.text }} />
                              <div className="w-4 h-1 rounded-none opacity-80" style={{ backgroundColor: theme.colors.text }} />
                            </div>
                          </div>

                          <div 
                            className="flex-1 rounded-none p-0.5 border flex items-center justify-between"
                            style={{
                              backgroundColor: theme.colors.surface,
                              borderColor: theme.colors.border
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-none" style={{ backgroundColor: theme.colors.accent }} />
                            <span className="w-8 h-0.5 rounded-none opacity-60" style={{ backgroundColor: theme.colors.text }} />
                            <span className="w-3 h-0.5 rounded-none opacity-30" style={{ backgroundColor: theme.colors.text }} />
                          </div>
                        </div>

                        {isSelected && (
                          <div 
                            className="absolute top-1 right-1 px-1.5 py-0.5 rounded-none text-[8.5px] font-bold text-white uppercase tracking-wider flex items-center gap-1"
                            style={{ backgroundColor: theme.colors.accent }}
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            <span>AKTİV</span>
                          </div>
                        )}
                      </div>

                      {/* Header Line */}
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                            {theme.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            [{theme.tag}]
                          </span>
                        </div>

                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-none uppercase border ${
                          theme.mode === 'dark' 
                            ? 'bg-slate-900 text-slate-200 border-slate-700' 
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}>
                          {theme.mode === 'dark' ? 'Tünd' : 'Açıq'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mb-2.5">
                        {theme.description}
                      </p>
                    </div>

                    {/* Flat Square Palette Swatches */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
                        <span 
                          className="w-3 h-3 rounded-none border border-black/20" 
                          style={{ backgroundColor: theme.colors.bg }}
                          title="Fon"
                        />
                        <span 
                          className="w-3 h-3 rounded-none border border-black/20" 
                          style={{ backgroundColor: theme.colors.surface }}
                          title="Panel"
                        />
                        <span 
                          className="w-3 h-3 rounded-none border border-black/20" 
                          style={{ backgroundColor: theme.colors.border }}
                          title="Çərçivə"
                        />
                        <span 
                          className="w-3 h-3 rounded-none border border-black/20" 
                          style={{ backgroundColor: theme.colors.accent }}
                          title="Vurğu"
                        />
                      </div>

                      {isSelected ? (
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Seçildi
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                          Seç
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Flat Footer */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
              <span className="font-mono text-[11px]">
                Konfiqurasiya dərhal sistemə tətbiq olunur.
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold uppercase tracking-wider text-xs hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
              >
                Bağla
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
