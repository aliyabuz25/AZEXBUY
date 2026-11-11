import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Settings,
  ChevronLeft,
  Menu,
  Clock,
  LogOut,
  Boxes,
  PenLine,
  Users,
  Inbox,
  Mail,
  Activity,
  Package,
  BookOpen,
  Briefcase,
  Cpu,
  Globe,
  X,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { UiLanguage } from '../types';
import { DICTIONARIES } from '../i18n';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeTabId: string;
  onSelectTab: (id: string, title: string, icon: string) => void;
  siteName: string;
  uiLang: UiLanguage;
  adminName?: string;
  adminEmail?: string;
  onLogout?: () => void;
  sessionRemainingSeconds?: number;
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
}

interface NavSubItem {
  id: string;
  label: string;
  badge?: number;
  cmsPageKey?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  subItems?: NavSubItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Əsas İdarəetmə',
    items: [
      {
        id: 'azexbuy',
        label: 'İcmal & Sorğular',
        icon: Boxes,
        subItems: [
          { id: 'azexbuy', label: 'Dashboard & Statistika' },
          { id: 'azexbuy', label: 'RFQ Sorğuları' },
          { id: 'azexbuy', label: 'İstehsalçı Qeydiyyatları' },
        ],
      },
      {
        id: 'inbox',
        label: 'Gələn Qutusu',
        icon: Inbox,
      },
      {
        id: 'product-catalog',
        label: 'Məhsul Kataloqu',
        icon: Package,
      },
      {
        id: 'services',
        label: 'Xidmətlər',
        icon: Briefcase,
      },
      {
        id: 'articles',
        label: 'Bloq & Məqalələr',
        icon: BookOpen,
      },
    ],
  },
  {
    title: 'Məzmun & CMS',
    items: [
      {
        id: 'azexbuy-cms',
        label: 'CMS — Məzmun',
        icon: PenLine,
        subItems: [
          { id: 'azexbuy-cms', label: 'Əsas Səhifə (Hero, Bloklar)', cmsPageKey: 'hero' },
          { id: 'azexbuy-cms', label: 'Xidmət Müraciəti Modal (+/-)', cmsPageKey: 'service_modal' },
          { id: 'azexbuy-cms', label: 'Haqqımızda & Komanda', cmsPageKey: 'about' },
          { id: 'azexbuy-cms', label: 'Bütün Görsəllər & Media', cmsPageKey: 'images' },
        ],
      },
      {
        id: 'localization',
        label: 'Lokalizasiya & Dillər',
        icon: Globe,
      },
    ],
  },
  {
    title: 'Sistem & Tənzimləmələr',
    items: [
      { id: 'user-management', label: 'İstifadəçilər',  icon: Users },
      { id: 'smtp-settings',   label: 'SMTP E-poçt',    icon: Mail },
      { id: 'ai-settings',     label: 'OpenRouter AI',  icon: Cpu },
      { id: 'logs',            label: 'Sistem Logları', icon: Activity },
      { id: 'settings',        label: 'Parametrlər',    icon: Settings },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  activeTabId,
  onSelectTab,
  siteName,
  uiLang,
  adminName = 'Admin',
  adminEmail,
  onLogout,
  sessionRemainingSeconds = 600,
  isMobileDrawer = false,
  onCloseMobile,
}) => {
  const t = DICTIONARIES[uiLang] || DICTIONARIES.az;
  void t;
  void adminEmail;

  const [unreadCounts, setUnreadCounts] = useState<{ rfqs: number; producers: number }>({ rfqs: 0, producers: 0 });

  useEffect(() => {
    const token = () => localStorage.getItem('octotech_admin_jwt') || sessionStorage.getItem('octotech_admin_jwt') || '';
    const fetchCounts = async () => {
      try {
        const [rr, pr] = await Promise.all([
          fetch('/api/azexbuy/rfqs', { headers: { Authorization: `Bearer ${token()}` } }),
          fetch('/api/azexbuy/producers', { headers: { Authorization: `Bearer ${token()}` } }),
        ]);
        if (rr.ok && pr.ok) {
          const rfqs = await rr.json();
          const producers = await pr.json();
          const isPending = (s?: string) => s === 'Pending' || s === 'Yeni' || s === 'New' || s === 'İncelemede';
          setUnreadCounts({
            rfqs: Array.isArray(rfqs) ? rfqs.filter((r: any) => isPending(r.status)).length : 0,
            producers: Array.isArray(producers) ? producers.filter((p: any) => isPending(p.status)).length : 0,
          });
        } else {
          setUnreadCounts({ rfqs: 0, producers: 0 });
        }
      } catch {
        setUnreadCounts({ rfqs: 0, producers: 0 });
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 15000);
    return () => clearInterval(interval);
  }, []);

  const [sessionSeconds, setSessionSeconds] = useState<number>(sessionRemainingSeconds);
  const onLogoutRef = useRef(onLogout);
  useEffect(() => { onLogoutRef.current = onLogout; }, [onLogout]);

  const prevRemainingRef = useRef(sessionRemainingSeconds);
  useEffect(() => {
    if (sessionRemainingSeconds !== undefined && sessionRemainingSeconds > prevRemainingRef.current) {
      setSessionSeconds(sessionRemainingSeconds);
    }
    prevRemainingRef.current = sessionRemainingSeconds;
  }, [sessionRemainingSeconds]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds(prev => {
        if (prev <= 1) { clearInterval(timer); onLogoutRef.current?.(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getBadge = (id: string): number => {
    if (id === 'inbox') return unreadCounts.rfqs + unreadCounts.producers;
    return 0;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'azexbuy': true,
    'azexbuy-cms': false,
  });

  const toggleSubmenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return NAV_SECTIONS;
    const q = searchQuery.toLowerCase();
    return NAV_SECTIONS.map(sec => {
      const matchingItems = sec.items.filter(item => {
        const matchesMain = item.label.toLowerCase().includes(q);
        const matchesSub = item.subItems?.some(s => s.label.toLowerCase().includes(q));
        return matchesMain || matchesSub;
      });
      return { ...sec, items: matchingItems };
    }).filter(sec => sec.items.length > 0);
  }, [searchQuery]);

  const handleTabClick = (item: { id: string; label: string; icon: any }, extraParam?: string) => {
    if (extraParam) {
      localStorage.setItem('azexbuy_cms_initial_page', extraParam);
    }
    onSelectTab(item.id, item.label, item.id);
    if (isMobileDrawer) {
      onCloseMobile?.();
    }
  };

  const renderNavButton = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = activeTabId === item.id;
    const badge = getBadge(item.id);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedSections[item.id];

    if (collapsed && !isMobileDrawer) {
      return (
        <div key={item.id} className="relative group flex justify-center">
          <button
            onClick={() => handleTabClick(item)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all relative cursor-pointer ${
              isActive
                ? 'bg-[#0f3156] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Icon className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
            {badge > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </button>
          {/* Tooltip with subitems if any */}
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-medium rounded-lg whitespace-nowrap shadow-lg pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
            <div>{item.label}{badge > 0 ? ` (${badge})` : ''}</div>
            {hasSubItems && (
              <div className="mt-1 pt-1 border-t border-slate-700/60 text-[10px] text-slate-300 space-y-0.5">
                {item.subItems!.map((sub, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="text-slate-500">•</span> {sub.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div key={item.id} className="space-y-0.5">
        <div
          onClick={() => handleTabClick(item)}
          className={`group w-full flex items-center gap-2.5 py-2 px-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer ${
            isActive
              ? 'bg-[#0f3156] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
          }`}
        >
          <Icon className={`shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#0f3156]'}`} style={{ width: '16px', height: '16px' }} />
          <span className="truncate flex-1 tracking-tight">{item.label}</span>
          
          {badge > 0 && (
            <span className={`min-w-[18px] h-4 px-1 text-[9px] font-bold rounded-full flex items-center justify-center leading-none shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
              {badge > 99 ? '99+' : badge}
            </span>
          )}

          {hasSubItems && (
            <button
              type="button"
              onClick={(e) => toggleSubmenu(item.id, e)}
              className={`p-1 rounded hover:bg-black/10 transition-colors ${isActive ? 'text-white/80' : 'text-slate-400'}`}
              title={isExpanded ? 'Bölmələri bağla' : 'Bölmələri göstər'}
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Accordion Sub-links for faster navigation */}
        {hasSubItems && isExpanded && (
          <div className="ml-5 pl-2.5 border-l border-slate-200/80 space-y-0.5 py-1">
            {item.subItems!.map((sub, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleTabClick({ id: sub.id, label: sub.label, icon: item.icon }, sub.cmsPageKey)}
                className="w-full text-left py-1 px-2 rounded-md text-[11px] font-medium text-slate-500 hover:text-[#0f3156] hover:bg-slate-100/60 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <span className="truncate">{sub.label}</span>
                <span className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400">→</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`${
        isMobileDrawer
          ? 'h-full w-full bg-white flex flex-col z-40 select-none shadow-2xl'
          : `hidden md:flex bg-white border-r border-slate-200/80 flex-col shrink-0 transition-[width] duration-200 ease-in-out z-40 select-none ${
              collapsed ? 'w-16 min-w-[64px]' : 'w-56 min-w-[224px]'
            }`
      }`}
    >
      {/* Brand Header */}
      <div className="h-12 px-3.5 flex items-center justify-between border-b border-slate-100 shrink-0">
        {isMobileDrawer ? (
          <>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded bg-[#0f3156] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                A
              </div>
              <span className="text-xs font-bold text-slate-900 truncate tracking-tight">
                {siteName || 'AZEXBUY Admin'}
              </span>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              title="Bağla"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : !collapsed ? (
          <>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded bg-[#0f3156] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                A
              </div>
              <span className="text-xs font-bold text-slate-900 truncate tracking-tight">
                {siteName || 'AZEXBUY Admin'}
              </span>
            </div>
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              title="Yığ"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="w-full h-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
            title="Genişləndir"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav with Live Search & Quick Filter */}
      <div className="flex-1 flex flex-col min-h-0">
        {(!collapsed || isMobileDrawer) && (
          <div className="px-3 pt-2.5 pb-1">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Menyuda axtar..."
                className="w-full pl-8 pr-6 py-1.5 text-xs bg-slate-50 border border-slate-200/90 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0f3156] focus:border-[#0f3156] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-2.5 px-2 space-y-4">
          {!collapsed || isMobileDrawer ? (
            filteredSections.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-slate-400">
                Uyğun bölmə tapılmadı
              </div>
            ) : (
              filteredSections.map((section, idx) => (
                <div key={idx}>
                  <div className="px-3 mb-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </div>
                  <div className="space-y-0.5">
                    {section.items.map(item => renderNavButton(item))}
                  </div>
                </div>
              ))
            )
          ) : (
            <div className="space-y-1">
              {NAV_SECTIONS.map((section, idx) => (
                <div key={idx}>
                  {section.items.map(item => renderNavButton(item))}
                  {idx < NAV_SECTIONS.length - 1 && (
                    <div className="border-t border-slate-100 my-2 mx-1" />
                  )}
                </div>
              ))}
            </div>
          )}
        </nav>
      </div>

      {/* Quick Website View Action */}
      {(!collapsed || isMobileDrawer) && (
        <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/50">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-semibold text-[#0f3156] bg-white border border-slate-200 shadow-2xs hover:bg-[#0f3156] hover:text-white transition-all group"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:text-amber-300" />
              Sayta Keçid Et
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
          </a>
        </div>
      )}

      {/* Bottom Profile & Session */}
      {!collapsed || isMobileDrawer ? (
        <div className="border-t border-slate-100 bg-white shrink-0">
          <div className="p-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] select-none shrink-0 relative bg-slate-100 text-[#0f3156]"
                title={adminName}
              >
                <span>{getInitials(adminName)}</span>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-800 truncate leading-tight">{adminName}</div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                  <Clock className="w-2.5 h-2.5 shrink-0" />
                  <span>{formatSessionTime(sessionSeconds)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
              title="Çıxış"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t border-slate-100 py-2.5 flex flex-col items-center gap-2 bg-white shrink-0 relative group">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] select-none relative cursor-pointer bg-slate-100 text-[#0f3156]"
            title={adminName}
          >
            <span>{getInitials(adminName)}</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white bg-emerald-500" />
          </div>
          <button onClick={onLogout} className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer" title="Çıxış">
            <LogOut className="w-3.5 h-3.5" />
          </button>
          {/* Tooltip */}
          <div className="absolute left-full ml-2 bottom-2 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-md shadow-xl pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 whitespace-nowrap space-y-0.5">
            <div className="font-semibold text-[11px]">{adminName}</div>
            <div className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" /> {formatSessionTime(sessionSeconds)}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
