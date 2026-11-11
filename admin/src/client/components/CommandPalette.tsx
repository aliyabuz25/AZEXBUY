import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  LayoutGrid, 
  Globe, 
  Database, 
  Image as ImageIcon, 
  Settings,
  Palette,
  Moon,
  Sun,
  GitBranch,
  Compass,
  Boxes,
  PenLine,
  Package,
  BookOpen,
  Briefcase,
  Inbox,
  Users,
  Mail,
  Cpu,
  Activity
} from 'lucide-react';
import { UiLanguage } from '../types';
import { DICTIONARIES } from '../i18n';
import { COLOR_THEMES } from '../theme';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (id: string, title: string, icon: string) => void;
  onSelectTheme?: (themeId: string) => void;
  onOpenThemes?: () => void;
  onOpenTutorial?: () => void;
  uiLang: UiLanguage;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onSelectTheme,
  onOpenThemes,
  onOpenTutorial,
  uiLang
}) => {
  const [query, setQuery] = useState('');
  const t = DICTIONARIES[uiLang] || DICTIONARIES.az;

  interface PaletteItem {
    type: 'nav' | 'theme' | 'theme_modal' | 'tutorial';
    id: string;
    title: string;
    subtitle?: string;
    icon: any;
    color?: string;
  }

  const navItems: PaletteItem[] = [
    { type: 'nav', id: 'azexbuy', title: 'AZEXBUY: İcmal & Sorğular', icon: Boxes, subtitle: 'RFQ, İstehsalçı qeydiyyatları və əlaqə sorğuları' },
    { type: 'nav', id: 'inbox', title: 'Gələn Qutusu (Inbox)', icon: Inbox, subtitle: 'Gələn müraciətlər və bildirişlər' },
    { type: 'nav', id: 'product-catalog', title: 'Məhsul Kataloqu', icon: Package, subtitle: 'İxrac məhsulları, HS kodlar, sertifikatlar' },
    { type: 'nav', id: 'services', title: 'Xidmətlər İdarəetməsi', icon: Briefcase, subtitle: 'İxrac xidmətləri, kateqoriyalar, ikonlar' },
    { type: 'nav', id: 'articles', title: 'Bloq & Analitika Məqalələri', icon: BookOpen, subtitle: 'Bloq yazıları, xəbərlər və analitikalar' },
    { type: 'nav', id: 'azexbuy-cms', title: 'AZEXBUY CMS — Məzmun', icon: PenLine, subtitle: 'Bütün səhifələr, xidmət modalları, mətn və şəkillər' },
    { type: 'nav', id: 'localization', title: t['nav.localization'] || 'Lokalizasiya & Dillər', icon: Globe, subtitle: '6 dildə sistem tərcümələri' },
    { type: 'nav', id: 'user-management', title: 'İstifadəçilər & Girişlər', icon: Users, subtitle: 'Admin istifadəçiləri və səlahiyyətlər' },
    { type: 'nav', id: 'smtp-settings', title: 'SMTP E-poçt Konfiqurasiyası', icon: Mail, subtitle: 'E-poçt göndərmə və bildiriş serveri' },
    { type: 'nav', id: 'ai-settings', title: 'OpenRouter AI Parametrləri', icon: Cpu, subtitle: 'Süni intellekt və model konfiqurasiyası' },
    { type: 'nav', id: 'logs', title: 'Sistem Logları', icon: Activity, subtitle: 'Sistem audit və əməliyyat logları' },
    { type: 'nav', id: 'settings', title: t['nav.settings'] || 'Sistem Parametrləri', icon: Settings, subtitle: 'Ümumi konfiqurasiya və sazlamalar' },
    { type: 'nav', id: 'dashboard', title: t['nav.dashboard'] || 'Köhnə Analitika İcmalı', icon: LayoutGrid, subtitle: 'Köhnə analitika paneli' },
  ];

  const themeItems: PaletteItem[] = COLOR_THEMES.map(theme => ({
    type: 'theme',
    id: theme.id,
    title: `Tema: ${theme.name}`,
    subtitle: `${theme.mode === 'dark' ? 'Tünd Rejim' : 'Açıq Rejim'} • ${theme.description}`,
    icon: theme.mode === 'dark' ? Moon : Palette,
    color: theme.colors.accent
  }));

  const allItems: PaletteItem[] = [
    { type: 'tutorial', id: 'tutorial', title: 'Sistem Bələdçisi (Tutorial)', subtitle: '6 mərhələli interaktiv sistem bələdçisini aç', icon: Compass },
    ...navItems,
    { type: 'theme_modal', id: 'theme_modal', title: 'Palitra: Rəng Temaları Qalereyası', subtitle: 'Bütün 8 temaya vizual baxış və seçim', icon: Palette },
    ...themeItems
  ];

  const filtered = allItems.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
    item.id.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[99999] bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-24 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-none max-w-lg w-full shadow-2xl border border-slate-300 dark:border-slate-700 overflow-hidden"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-2.5 px-4 border-b border-slate-200 dark:border-slate-800 h-11">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Səhifə, əmr və ya rəng sxemi axtarın..."
            className="flex-1 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none bg-transparent"
            autoFocus
          />
          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-none border border-slate-300 dark:border-slate-700">
            ESC
          </span>
        </div>

        {/* Results */}
        <div className="p-1.5 space-y-0.5 max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 font-mono">
              Nəticə tapılmadı.
            </div>
          ) : (
            filtered.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => {
                    if (item.type === 'tutorial') {
                      if (onOpenTutorial) onOpenTutorial();
                    } else if (item.type === 'nav') {
                      onSelectTab(item.id, item.title, item.id);
                    } else if (item.type === 'theme' && onSelectTheme) {
                      onSelectTheme(item.id);
                    } else if (item.type === 'theme_modal' && onOpenThemes) {
                      onOpenThemes();
                    }
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-none text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-none bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.type === 'theme' && item.color && (
                    <span 
                      className="w-2.5 h-2.5 rounded-none border border-black/20 shrink-0" 
                      style={{ backgroundColor: item.color }} 
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};
