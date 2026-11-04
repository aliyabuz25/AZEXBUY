import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  ChevronLeft,
  Menu,
  Clock,
  LogOut,
  Boxes,
  ChevronDown,
  ChevronRight,
  PenLine,
  Users,
  Inbox,
  Mail,
  Image as ImageIcon,
  Globe,
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
}

// AZEXBUY sub-items
const AZEXBUY_ITEMS = [
  { id: 'azexbuy',      label: 'İcmal & Sorğular', icon: Boxes },
  { id: 'azexbuy-cms',  label: 'CMS — Məzmun',     icon: PenLine },
  { id: 'inbox',        label: 'Gelen Qutusu',      icon: Inbox },
];

// Top-level nav sections (outside AZEXBUY collapsible)
const PLATFORM_SECTIONS = [
  {
    title: 'Məzmun',
    items: [
      { id: 'media',        label: 'Media Mərkəzi',   icon: ImageIcon },
      { id: 'localization', label: 'Lokalizasiya',    icon: Globe },
    ],
  },
  {
    title: 'İdarəetmə',
    items: [
      { id: 'user-management', label: 'İstifadəçi İdarəetməsi', icon: Users },
      { id: 'smtp-settings',   label: 'SMTP E-poçt',            icon: Mail },
      { id: 'settings',        label: 'Sistem Parametrləri',    icon: Settings },
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
}) => {
  const t = DICTIONARIES[uiLang] || DICTIONARIES.az;

  // AZEXBUY collapsible open state (default open)
  const [azexbuyOpen, setAzexbuyOpen] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<{ rfqs: number; producers: number }>({ rfqs: 0, producers: 0 });

  // Poll unread counts every 15s
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
          const rfqUnread = rfqs.filter((r: any) => r.status === 'Pending').length;
          const prodUnread = producers.filter((p: any) => p.status === 'Pending').length;
          setUnreadCounts({ rfqs: rfqUnread, producers: prodUnread });
        }
      } catch {}
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 15000);
    return () => clearInterval(interval);
  }, []);

  const [sessionSeconds, setSessionSeconds] = useState<number>(sessionRemainingSeconds);
  const onLogoutRef = useRef(onLogout);

  useEffect(() => { onLogoutRef.current = onLogout; }, [onLogout]);

  // Sync from parent only once on mount or when session is explicitly refreshed (new login)
  const prevRemainingRef = useRef(sessionRemainingSeconds);
  useEffect(() => {
    if (sessionRemainingSeconds !== undefined && sessionRemainingSeconds > prevRemainingRef.current) {
      // Only reset if server reports MORE time (fresh login / token refresh)
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
  }, []); // stable — uses ref for onLogout

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

  // Check if any AZEXBUY sub-item is active
  const allPlatformIds = PLATFORM_SECTIONS.flatMap(s => s.items.map(i => i.id)).concat(AZEXBUY_ITEMS.map(i => i.id));
  const anyPlatformActive = allPlatformIds.includes(activeTabId);

  const getBadge = (id: string): number => {
    if (id === 'inbox') return unreadCounts.rfqs + unreadCounts.producers;
    return 0;
  };

  const renderNavButton = (item: { id: string; label: string; icon: any }, indent = false) => {
    const Icon = item.icon;
    const isActive = activeTabId === item.id;
    const badge = getBadge(item.id);

    if (collapsed) {
      return (
        <div key={item.id} className="relative group flex justify-center">
          <button
            onClick={() => onSelectTab(item.id, item.label, item.id)}
            className={`w-10 h-9 flex items-center justify-center rounded-none transition-all relative ${
              isActive
                ? 'bg-slate-100 text-slate-900 shadow-xs border border-slate-200/90'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-500'}`} />
            {badge > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </button>
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-none whitespace-nowrap shadow-lg pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
            {item.label}{badge > 0 ? ` (${badge})` : ''}
          </div>
        </div>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => onSelectTab(item.id, item.label, item.id)}
        className={`w-full flex items-center justify-start gap-2 py-1.5 rounded-none text-xs font-medium transition-all group text-left px-2.5 ${
          isActive
            ? 'bg-slate-100 text-slate-900 font-semibold shadow-xs border border-slate-200/80'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${
          isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
        }`} />
        <span className="truncate flex-1 text-left">{item.label}</span>
        {badge > 0 && (
          <span className="min-w-[18px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none shrink-0">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside
      className={`bg-white border-r border-slate-200/90 flex flex-col shrink-0 transition-[width] duration-200 ease-in-out z-40 select-none ${
        collapsed ? 'w-16 min-w-[64px]' : 'w-60 min-w-[240px]'
      }`}
    >
      {/* Brand Header */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-slate-200/90 shrink-0">
        {!collapsed ? (
          <>
            <div className="flex items-center min-w-0">
              <span className="text-xs font-semibold text-slate-900 truncate tracking-tight">
                {siteName || 'Octotech Store'}
              </span>
            </div>
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-none text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
              title="Sidebarı yığ"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="w-full h-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-none transition-colors"
            title="Sidebarı genişləndir"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">

        {/* ── AZEXBUY Collapsible Platform ── */}
        {!collapsed ? (
          <div className="space-y-0.5">
            {/* Collapsible header */}
            <button
              onClick={() => setAzexbuyOpen(prev => !prev)}
              className={`w-full flex items-center justify-start gap-2 px-2.5 py-2 rounded-none text-xs font-bold transition-all group text-left ${
                anyPlatformActive
                  ? 'text-[#0f3156] bg-blue-50/60 border border-blue-100'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Boxes className={`w-4 h-4 shrink-0 ${anyPlatformActive ? 'text-[#0f3156]' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className="flex-1 text-left truncate">Platformlar / AZEXBUY</span>
              {(unreadCounts.rfqs + unreadCounts.producers) > 0 && (
                <span className="min-w-[18px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none shrink-0">
                  {(unreadCounts.rfqs + unreadCounts.producers) > 99 ? '99+' : unreadCounts.rfqs + unreadCounts.producers}
                </span>
              )}
              {azexbuyOpen
                ? <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                : <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              }
            </button>

            {/* Collapsible body */}
            {azexbuyOpen && (
              <div className="ml-2 border-l border-slate-200 pl-1.5 space-y-2.5 py-1">

                {/* AZEXBUY direct item */}
                <div className="space-y-0.5">
                  <div className="px-2 pt-0.5 pb-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">AZEXBUY Admin</div>
                  {AZEXBUY_ITEMS.map(item => renderNavButton(item, false))}
                </div>

                {/* Platform sections */}
                {PLATFORM_SECTIONS.map((sec, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="px-2 pt-0.5 pb-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      {sec.title}
                    </div>
                    {sec.items.map(item => renderNavButton(item, false))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Collapsed mode — show all icons flat
          <div className="space-y-0.5">
            <div className="border-t border-slate-100 my-1 mx-1" />
            {AZEXBUY_ITEMS.map(item => renderNavButton(item))}
            <div className="border-t border-slate-100 my-1 mx-1" />
            {PLATFORM_SECTIONS.flatMap(sec => sec.items).map(item => renderNavButton(item))}
          </div>
        )}
      </nav>

      {/* Bottom Profile & Session */}
      {!collapsed ? (
        <div className="border-t border-slate-200/90 bg-white shrink-0">
          <div className="p-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="circle-pfp w-8 h-8 flex items-center justify-center font-bold text-xs select-none border shrink-0 relative transition-transform"
                style={{ backgroundColor: 'var(--theme-surface-subtle)', color: 'var(--theme-accent)', borderColor: 'var(--theme-border)' }}
                title={adminName}
              >
                <span>{getInitials(adminName)}</span>
                <span className="circle-pfp absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white" style={{ backgroundColor: '#10b981' }} title="Aktiv Sessiya" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-900 truncate leading-tight">{adminName}</div>
                <div className="flex items-center gap-1 text-[10.5px] text-slate-500 font-mono mt-0.5 select-none" title="Aktiv Sessiya Müddəti">
                  <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  <span>Sessiya: {formatSessionTime(sessionSeconds)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-none text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
              title="Sessiyadan Çıxış"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
          <div
            onClick={() => onSelectTab('settings', 'Sistem Parametrləri', 'settings')}
            className="h-6 px-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 hover:text-slate-700 bg-slate-50/50 cursor-pointer transition-colors"
          >
            <span className="font-medium tracking-tight">Core v2.4.3</span>
            <span className="font-mono text-[9px] uppercase">RƏSMİ</span>
          </div>
        </div>
      ) : (
        <div className="border-t border-slate-200/90 py-2.5 flex flex-col items-center gap-2 bg-white shrink-0 relative group">
          <div
            onClick={onLogout}
            className="circle-pfp w-8 h-8 flex items-center justify-center font-bold text-xs select-none border shrink-0 relative cursor-pointer hover:scale-105 transition-transform"
            style={{ backgroundColor: 'var(--theme-surface-subtle)', color: 'var(--theme-accent)', borderColor: 'var(--theme-border)' }}
            title="Klikləyərək çıxış edin"
          >
            <span>{getInitials(adminName)}</span>
            <span className="circle-pfp absolute -bottom-0.5 -right-0.5 w-2 h-2 border border-white" style={{ backgroundColor: '#10b981' }} />
          </div>
          <button onClick={onLogout} className="p-1 rounded-none text-slate-400 hover:text-rose-600 transition-colors cursor-pointer" title="Çıxış et">
            <LogOut className="w-3.5 h-3.5" />
          </button>
          <div className="absolute left-full ml-2 bottom-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-none shadow-xl pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 whitespace-nowrap space-y-1">
            <div className="font-semibold">{adminName}</div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" /> Sessiya: {formatSessionTime(sessionSeconds)}
            </div>
            <div className="pt-1 border-t border-slate-800 text-[9.5px] text-rose-400 font-medium">Çıxış üçün klikləyin</div>
          </div>
        </div>
      )}
    </aside>
  );
};
