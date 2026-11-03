import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, 
  Search, 
  Database, 
  Image as ImageIcon, 
  Globe, 
  Settings, 
  X,
  Plus
} from 'lucide-react';
import { TabItem, UiLanguage } from '../types';

interface TabsBarProps {
  tabs: TabItem[];
  activeTabId: string;
  onActivateTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onQuickAdd: () => void;
  uiLang: UiLanguage;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  grid: LayoutGrid,
  dashboard: LayoutGrid,
  search: Search,
  'seo-manager': Search,
  database: Database,
  'data-grid': Database,
  image: ImageIcon,
  media: ImageIcon,
  globe: Globe,
  localization: Globe,
  settings: Settings,
};

export const TabsBar: React.FC<TabsBarProps> = ({
  tabs,
  activeTabId,
  onActivateTab,
  onCloseTab,
  onQuickAdd
}) => {
  return (
    <header className="h-10 bg-slate-50 border-b border-slate-200/90 px-3 flex items-center justify-between overflow-x-auto select-none">
      <div className="flex items-center gap-1">
        <AnimatePresence initial={false}>
          {tabs.map(tab => {
            const Icon = iconMap[tab.id] || LayoutGrid;
            const isActive = activeTabId === tab.id;
            return (
              <motion.button
                key={tab.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                onClick={() => onActivateTab(tab.id)}
                className={`group relative h-7 px-3 rounded-none text-xs font-medium flex items-center gap-2 border transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 shadow-none'
                    : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`} />
                <span className="truncate max-w-[120px]">{tab.title}</span>
                {tab.closable && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    className="p-0.5 rounded-none hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors ml-0.5"
                    title="Bağla"
                  >
                    <X className="w-3 h-3" />
                  </span>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>

        <button
          onClick={onQuickAdd}
          className="h-7 w-7 rounded-none hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors ml-1"
          title="Yeni Vərəq Aç"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
