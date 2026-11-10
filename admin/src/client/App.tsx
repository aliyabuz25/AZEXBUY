import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Database, Download, Palette, Compass } from 'lucide-react';
import { 
  UiLanguage, 
  TabItem, 
  SiteConfig, 
  SeoConfig, 
  TranslationItem, 
  RecordItem, 
  MediaItem, 
  MulterConfig 
} from './types';
import { DICTIONARIES } from './i18n';
import { COLOR_THEMES, getInitialTheme, applyTheme } from './theme';
import { Sidebar } from './components/Sidebar';
import { TabsBar } from './components/TabsBar';
import { OnboardingWizard } from './components/OnboardingWizard';
import { CommandPalette } from './components/CommandPalette';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { InteractiveTutorial } from './components/InteractiveTutorial';
import { StartupUpdateToast } from './components/StartupUpdateToast';
import { FullscreenLogin } from './components/FullscreenLogin';
import { FloatingFlagSelector } from './components/FloatingFlagSelector';

import { DashboardView } from './views/DashboardView';
import { SeoManagerView } from './views/SeoManagerView';
import { LocalizationView } from './views/LocalizationView';
import { MediaView } from './views/MediaView';
import { DataRecordsView } from './views/DataRecordsView';
import { SettingsView } from './views/SettingsView';
import { AzexbuyView } from './views/AzexbuyView';
import { AzexbuyCMSView } from './views/AzexbuyCMSView';
import { UserManagementView } from './views/UserManagementView';
import { InboxView } from './views/InboxView';
import { SmtpSettingsView } from './views/SmtpSettingsView';
import { LogsView } from './views/LogsView';
import { ProductCatalogView } from './views/ProductCatalogView';
import { ArticlesView } from './views/ArticlesView';
import { ServicesView } from './views/ServicesView';

const LANG_STORAGE_KEY = 'octotech_admin_lang';
const SIDEBAR_STORAGE_KEY = 'octotech_admin_sidebar_collapsed';
const TAB_STORAGE_KEY = 'octotech_admin_active_tab';
const JWT_STORAGE_KEY = 'octotech_admin_jwt';

const getInitialLang = (): UiLanguage => {
  if (typeof window === 'undefined') return 'az';
  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  if (saved && (saved === 'az' || saved === 'tr' || saved === 'ru' || saved === 'en')) {
    return saved as UiLanguage;
  }
  return 'az';
};

const getInitialSidebarCollapsed = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
};

const getInitialActiveTab = (): string => {
  if (typeof window === 'undefined') return 'dashboard';
  return localStorage.getItem(TAB_STORAGE_KEY) || 'dashboard';
};

export const App: React.FC = () => {
  const [uiLang, setUiLang] = useState<UiLanguage>(getInitialLang);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(getInitialSidebarCollapsed);
  const [activeTabId, setActiveTabId] = useState<string>(getInitialActiveTab);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Theme state
  const [currentTheme, setCurrentTheme] = useState<string>(getInitialTheme);
  const [themeModalOpen, setThemeModalOpen] = useState(false);

  // Azerbaijani Interactive Tutorial state (first visit auto-detect)
  const [tutorialOpen, setTutorialOpen] = useState(false);

  // Authentication & 10-Minute JWT Session State
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(JWT_STORAGE_KEY);
  });
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [sessionRemaining, setSessionRemaining] = useState<number>(600);
  const sessionWarnShownRef = useRef(false);
  const [sessionWarnVisible, setSessionWarnVisible] = useState(false);

  // Data states
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [seo, setSeo] = useState<SeoConfig>({
    title: 'Octotech LL. | Rəsmi Mağaza',
    description: 'Ən son texnologiya və innovativ həllər.',
    canonical: 'http://localhost:3000',
    keywords: 'elektronika, satish, zemanet',
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: 'Octotech LL.',
    ogDescription: 'Rəsmi Satış və Zəmanət Mərkəzi',
    ogImage: '',
    sitemapUrl: 'http://localhost:3000/sitemap.xml',
    lastUpdated: new Date().toISOString()
  });
  const [translations, setTranslations] = useState<TranslationItem[]>([]);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [multerConfig, setMulterConfig] = useState<MulterConfig | null>(null);

  // Setup onboarding modal state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Admin user
  const [adminUser, setAdminUser] = useState<{ fullName: string; email: string; role?: string }>({
    fullName: 'Admin',
    email: 'admin@octotech.az',
    role: 'Super Admin'
  });

  const t = DICTIONARIES[uiLang] || DICTIONARIES.az;

  const [tabs, setTabs] = useState<TabItem[]>([
    { id: 'dashboard',        title: 'Canlı İcmal',            icon: 'dashboard',        closable: false },
    { id: 'azexbuy',          title: 'AZEXBUY',                icon: 'azexbuy',          closable: true },
    { id: 'azexbuy-cms',      title: 'AZEXBUY CMS',            icon: 'azexbuy-cms',      closable: true },
    { id: 'articles',         title: 'Bloq & Məqalələr',       icon: 'articles',         closable: true },
    { id: 'product-catalog',  title: 'Məhsul Kataloqu',        icon: 'product-catalog',  closable: true },
    { id: 'inbox',            title: 'Gelen Qutusu',           icon: 'inbox',            closable: true },
    { id: 'user-management',  title: 'İstifadəçi İdarəetməsi', icon: 'users',            closable: true },
    { id: 'smtp-settings',    title: 'SMTP E-poçt',            icon: 'mail',             closable: true },
    { id: 'settings',         title: 'Sistem Parametrləri',    icon: 'settings',         closable: true },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Sync active theme to DOM and persistence
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // First visit check: auto-launch Azerbaijani interactive tutorial
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('octotech_tutorial_completed');
      if (!completed) {
        const timer = setTimeout(() => {
          setTutorialOpen(true);
        }, 350);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleSelectTheme = (themeId: string) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
    const themeName = COLOR_THEMES.find(t => t.id === themeId)?.name || themeId;
    showToast(`Tema tətbiq edildi: ${themeName}`);
  };

  // Sync tab titles on language change
  useEffect(() => {
    const titleMap: Record<string, string> = {
      dashboard: t['nav.dashboard'] || 'Canlı İcmal',
      'seo-manager': t['nav.seoManager'] || 'Axtarış & SEO',
      'data-grid': t['nav.records'] || 'Məlumat Bazası',
      media: t['nav.media'] || 'Media Mərkəzi',
      localization: t['nav.localization'] || 'Lokalizasiya & Dillər',
      settings: t['nav.settings'] || 'Sistem Parametrləri',
    };

    setTabs(prev => prev.map(tab => ({
      ...tab,
      title: titleMap[tab.id] || tab.title
    })));
  }, [uiLang]);

  // Initial Data Fetch
  const fetchData = async () => {
    try {
      // Check setup status
      const setupRes = await fetch('/api/setup');
      const setupData = await setupRes.json();
      if (setupData.success) {
        if (!setupData.data.setup?.completed) {
          setWizardOpen(true);
        }
        if (setupData.data.site) setSiteConfig(setupData.data.site);
        if (setupData.data.uploadConfig) setMulterConfig(setupData.data.uploadConfig);
        if (setupData.data.admin) setAdminUser(setupData.data.admin);
      }

      // Fetch SEO
      const seoRes = await fetch('/api/seo');
      const seoData = await seoRes.json();
      if (seoData.success && seoData.data) setSeo(seoData.data);

      // Fetch Translations
      const transRes = await fetch('/api/translations');
      const transData = await transRes.json();
      if (transData.success && transData.data) setTranslations(transData.data);

      // Fetch Records
      const recRes = await fetch('/api/records');
      const recData = await recRes.json();
      if (recData.success && recData.data) setRecords(recData.data);

      // Fetch Media
      const mediaRes = await fetch('/api/media');
      const mediaData = await mediaRes.json();
      if (mediaData.success && mediaData.data) setMedia(mediaData.data);

      // Fetch Upload Config
      const upRes = await fetch('/api/settings/upload');
      const upData = await upRes.json();
      if (upData.success && upData.data) setMulterConfig(upData.data);
    } catch (err) {
      console.error('Initial data fetch error:', err);
    }
  };

  // Verify JWT on app initialization (Non-Bypassable)
  useEffect(() => {
    const verifyAuth = async () => {
      const savedToken = typeof window !== 'undefined' ? localStorage.getItem(JWT_STORAGE_KEY) : null;
      if (!savedToken) {
        setToken(null);
        setAuthChecking(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${savedToken}` }
        });
        const data = await res.json();
        if (res.ok && data.success && data.data?.user) {
          setToken(savedToken);
          setAdminUser({
            fullName: data.data.user.fullName || data.data.user.username || 'Admin',
            email: data.data.user.email || 'admin@octotech.az',
            role: data.data.user.role || 'Super Admin'
          });
          setSessionRemaining(data.data.remainingSeconds || 600);
          fetchData();
        } else {
          localStorage.removeItem(JWT_STORAGE_KEY);
          setToken(null);
        }
      } catch {
        localStorage.removeItem(JWT_STORAGE_KEY);
        setToken(null);
      } finally {
        setAuthChecking(false);
      }
    };

    verifyAuth();
  }, []);

  // Real-time 10-Minute Session Countdown (600 seconds)
  useEffect(() => {
    if (!token) return;
    sessionWarnShownRef.current = false; // reset on new session
    const timer = setInterval(() => {
      setSessionRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleLogout('Sessiyanın müddəti (10 dəqiqə) bitmişdir. Zəhmət olmasa yenidən daxil olun.');
          return 0;
        }
        // Show warning once when 60 seconds remain
        if (prev === 61 && !sessionWarnShownRef.current) {
          sessionWarnShownRef.current = true;
          setSessionWarnVisible(true);
          setTimeout(() => setSessionWarnVisible(false), 8000);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [token]);

  const handleLoginSuccess = (newToken: string, user: any, expiresIn: number, isDefaultCredentials?: boolean) => {
    localStorage.setItem(JWT_STORAGE_KEY, newToken);
    setToken(newToken);
    setSessionRemaining(expiresIn || 600);
    if (user) {
      setAdminUser({
        fullName: user.fullName || user.username || 'Admin',
        email: user.email || 'admin@octotech.az',
        role: user.role || 'Super Admin'
      });
    }
    fetchData();
    showToast('Uğurla daxil oldunuz! 10 dəqiqəlik sessiya başladı.');

    // Default credentials xəbərdarlığı — server flag göndərirsə
    if (isDefaultCredentials) {
      setTimeout(() => {
        showToast('⚠ TƏHLÜKƏSİZLİK: Default "admin/admin" giriş məlumatları dəyişdirilməyib! Parametrlərdən dərhal yeniləyin.');
      }, 2000);
    }
  };

  const handleLogout = async (msg?: string) => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch {
        // ignore
      }
    }
    localStorage.removeItem(JWT_STORAGE_KEY);
    setToken(null);
    setSessionRemaining(600);
    showToast(msg || 'Sessiya təhlükəsiz şəkildə sonlandırıldı');
  };

  const getAuthHeaders = (extra: Record<string, string> = {}) => {
    const headers: Record<string, string> = { ...extra };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const handleUnauthorized = () => {
    handleLogout('Sessiyanın müddəti (10 dəqiqə) bitmişdir. Zəhmət olmasa yenidən daxil olun.');
  };

  // Single-session SSE — başqa cihazdan giriş olduqda kick
  useEffect(() => {
    if (!token) return;
    // EventSource Authorization header dəstəkləmir — token query param ilə göndərilir
    const es2 = new EventSource(`/api/auth/session-events?token=${encodeURIComponent(token)}`);

    es2.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'kicked') {
          es2.close();
          localStorage.removeItem('octotech_admin_jwt');
          setToken(null);
          setSessionRemaining(600);
          showToast('⚠ Başqa bir cihazdan giriş edildi. Sessiyanız sonlandırıldı.');
        }
      } catch {}
    };
    es2.onerror = () => { es2.close(); };
    return () => { es2.close(); };
  }, [token]);

  // Keyboard shortcut Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectLang = (lang: UiLanguage) => {
    setUiLang(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  };

  const handleActivateTab = (id: string) => {
    setActiveTabId(id);
    localStorage.setItem(TAB_STORAGE_KEY, id);
  };

  const openTab = (id: string, title: string, icon: string) => {
    const existing = tabs.find(t => t.id === id);
    if (!existing) {
      setTabs(prev => [...prev, { id, title, icon, closable: id !== 'dashboard' }]);
    }
    handleActivateTab(id);
  };

  const closeTab = (id: string) => {
    const idx = tabs.findIndex(t => t.id === id);
    if (idx === -1) return;
    const nextTabs = tabs.filter(t => t.id !== id);
    setTabs(nextTabs);
    if (activeTabId === id) {
      const fallback = nextTabs[Math.max(0, idx - 1)] || nextTabs[0];
      if (fallback) handleActivateTab(fallback.id);
    }
  };

  // API Mutators
  const handleSaveSeo = async (updatedSeo: SeoConfig) => {
    try {
      const res = await fetch('/api/seo', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updatedSeo)
      });
      if (res.status === 401) return handleUnauthorized();
      const data = await res.json();
      if (data.success) {
        setSeo(data.data);
        showToast('SEO parametrləri yeniləndi');
      }
    } catch {
      showToast('Xəta baş verdi');
    }
  };

  const handleSaveTranslation = async (item: TranslationItem) => {
    try {
      const res = await fetch('/api/translations', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(item)
      });
      if (res.status === 401) return handleUnauthorized();
      const data = await res.json();
      if (data.success) {
        setTranslations(prev => prev.map(t => t.key === item.key ? item : t));
        showToast('Tərcümə yadda saxlanıldı');
      }
    } catch {
      showToast('Xəta baş verdi');
    }
  };

  const handleAddTranslation = async (item: TranslationItem) => {
    try {
      const res = await fetch('/api/translations', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(item)
      });
      if (res.status === 401) return handleUnauthorized();
      const data = await res.json();
      if (data.success) {
        setTranslations(prev => [item, ...prev]);
        showToast('Yeni açar əlavə olundu');
      }
    } catch {
      showToast('Xəta baş verdi');
    }
  };

  const handleDeleteTranslation = async (key: string) => {
    try {
      const res = await fetch(`/api/translations/${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.status === 401) return handleUnauthorized();
      const data = await res.json();
      if (data.success) {
        setTranslations(prev => prev.filter(t => t.key !== key));
        showToast('Açar silindi');
      }
    } catch {
      showToast('Xəta baş verdi');
    }
  };

  const handleUploadMedia = async (file: File): Promise<boolean> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });
      if (res.status === 401) {
        handleUnauthorized();
        return false;
      }
      const data = await res.json();
      if (data.success && data.data) {
        setMedia(prev => [data.data, ...prev]);
        showToast(`"${file.name}" yükləndi`);
        return true;
      } else {
        showToast(data.error || 'Yükləmə xətası');
        return false;
      }
    } catch {
      showToast('Fayl yükləmə xətası');
      return false;
    }
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      const res = await fetch(`/api/media/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.status === 401) return handleUnauthorized();
      const data = await res.json();
      if (data.success) {
        setMedia(prev => prev.filter(m => m.id !== id));
        showToast('Fayl silindi');
      }
    } catch {
      showToast('Silinmə xətası');
    }
  };

  const handleAddRecord = async (title: string) => {
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          title,
          source: 'Octotech Admin Core',
          author: 'Admin',
          status: 'published'
        })
      });
      if (res.status === 401) return handleUnauthorized();
      const data = await res.json();
      if (data.success && data.data) {
        setRecords(prev => [data.data, ...prev]);
        showToast('Yeni qeyd əlavə olundu');
      }
    } catch {
      showToast('Xəta baş verdi');
    }
  };

  const handleSaveSite = async (newSite: SiteConfig) => {
    try {
      const res = await fetch('/api/site', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(newSite)
      });
      if (res.status === 401) return handleUnauthorized();
      const data = await res.json();
      if (data.success) {
        setSiteConfig(data.data);
        showToast('Sayt məlumatları yeniləndi');
      }
    } catch {
      showToast('Xəta baş verdi');
    }
  };

  const handleSaveMulter = async (newMulter: MulterConfig) => {
    try {
      const res = await fetch('/api/settings/upload', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(newMulter)
      });
      if (res.status === 401) return handleUnauthorized();
      const data = await res.json();
      if (data.success) {
        setMulterConfig(data.data);
        showToast('Multer qaydaları yeniləndi');
      }
    } catch {
      showToast('Xəta baş verdi');
    }
  };

  const handleWizardComplete = (result: any) => {
    if (result.site) setSiteConfig(result.site);
    if (result.uploadConfig) setMulterConfig(result.uploadConfig);
    if (result.systemLang) setUiLang(result.systemLang);
    setWizardOpen(false);
    showToast(`Xoş gəldiniz! "${result.site?.name || 'Octotech'}" sistemi aktivləşdirildi.`);
  };

  // 1. Loading state while verifying JWT session
  if (authChecking) {
    return (
      <div 
        className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center text-white space-y-3 select-none"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}
      >
        <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-slate-400">Sessiya yoxlanılır...</span>
      </div>
    );
  }

  // 2. Fullscreen Login: 100% Non-Bypassable
  // When unauthenticated, the application tree and data views are completely unmounted
  if (!token) {
    return (
      <FullscreenLogin 
        onLoginSuccess={handleLoginSuccess}
        uiLang={uiLang}
      />
    );
  }

  const currentTab = tabs.find(t => t.id === activeTabId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Desktop Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        activeTabId={activeTabId}
        onSelectTab={openTab}
        siteName={siteConfig?.name || 'AZEXBUY Admin'}
        uiLang={uiLang}
        adminName={adminUser.fullName || 'Admin'}
        adminEmail={adminUser.email}
        sessionRemainingSeconds={sessionRemaining}
        onLogout={() => {
          handleLogout('Sessiya təhlükəsiz şəkildə sonlandırıldı');
        }}
      />

      {/* Mobile Drawer (Responsive AAA) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[150000] flex md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            {/* Slide-in Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl"
            >
              <Sidebar
                collapsed={false}
                onToggleCollapse={() => {}}
                activeTabId={activeTabId}
                onSelectTab={(id, title, icon) => {
                  openTab(id, title, icon);
                  setMobileMenuOpen(false);
                }}
                siteName={siteConfig?.name || 'AZEXBUY Admin'}
                uiLang={uiLang}
                adminName={adminUser.fullName || 'Admin'}
                adminEmail={adminUser.email}
                sessionRemainingSeconds={sessionRemaining}
                onLogout={() => {
                  setMobileMenuOpen(false);
                  handleLogout('Sessiya təhlükəsiz şəkildə sonlandırıldı');
                }}
                isMobileDrawer={true}
                onCloseMobile={() => setMobileMenuOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {/* Workspace Multi-Tab Bar */}
        <TabsBar
          tabs={tabs}
          activeTabId={activeTabId}
          onActivateTab={(id) => {
            handleActivateTab(id);
            setMobileMenuOpen(false);
          }}
          onCloseTab={closeTab}
          onQuickAdd={() => openTab('seo-manager', 'Axtarış & SEO', 'search')}
          uiLang={uiLang}
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        />

        {/* Viewport Top Breadcrumb & Action Bar */}
        <div className="h-10 px-3 sm:px-4 bg-white border-b border-slate-200/90 flex items-center justify-between shrink-0 overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0">
            <span className="hidden sm:inline">AZEXBUY</span>
            <span className="hidden sm:inline">/</span>
            <span className="text-slate-900 font-semibold truncate max-w-[130px] sm:max-w-none">{currentTab?.title || 'Canlı İcmal'}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Azerbaijani Interactive Tutorial Button */}
            <button
              onClick={() => setTutorialOpen(true)}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-none border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Sistem Bələdçisi (Tutorial) - 6 mərhələli bələdçi turu"
            >
              <Compass className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              <span className="hidden sm:inline">Bələdçi</span>
            </button>

            {/* Theme Selector Top Bar Button - Flat & Sharp */}
            <button
              onClick={() => setThemeModalOpen(true)}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-none border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Rəng sxemini dəyiş"
            >
              <Palette className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              <span className="hidden sm:inline">Tema</span>
              <span 
                className="w-2.5 h-2.5 rounded-none border border-black/20" 
                style={{ backgroundColor: COLOR_THEMES.find(t => t.id === currentTheme)?.colors.accent || '#0f172a' }} 
              />
            </button>

            <a
              href="/api/backup/download"
              download
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-none border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Bütün saytın tam SQLite backupını endir"
            >
              <Database className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              <span className="hidden sm:inline">Backup</span>
            </a>

            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 px-2 sm:px-2.5 py-1 rounded-none border border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">{t['topbar.quickSearch'] || 'Axtarış (CMD+K)...'}</span>
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-y-auto">
          {activeTabId === 'dashboard' && (
            <DashboardView 
              records={records} 
              media={media}
              translations={translations}
              seo={seo}
              siteConfig={siteConfig}
              uiLang={uiLang} 
            />
          )}
          {activeTabId === 'seo-manager' && <SeoManagerView seo={seo} onSaveSeo={handleSaveSeo} uiLang={uiLang} />}
          {activeTabId === 'localization' && (
            <LocalizationView
              translations={translations}
              onSaveTranslation={handleSaveTranslation}
              onAddTranslation={handleAddTranslation}
              onDeleteTranslation={handleDeleteTranslation}
              uiLang={uiLang}
            />
          )}
          {activeTabId === 'media' && (
            <MediaView
              media={media}
              multerConfig={multerConfig}
              onUploadFile={handleUploadMedia}
              onDeleteMedia={handleDeleteMedia}
              uiLang={uiLang}
            />
          )}
          {activeTabId === 'data-grid' && (
            <DataRecordsView records={records} onAddRecord={handleAddRecord} uiLang={uiLang} />
          )}
          {activeTabId === 'settings' && (
            <SettingsView
              siteConfig={siteConfig}
              multerConfig={multerConfig}
              onSaveSite={handleSaveSite}
              onSaveMulter={handleSaveMulter}
              onRerunWizard={() => setWizardOpen(true)}
              onOpenTutorial={() => setTutorialOpen(true)}
              uiLang={uiLang}
              currentTheme={currentTheme}
              onSelectTheme={handleSelectTheme}
            />
          )}
          {activeTabId === 'azexbuy' && (
            <AzexbuyView uiLang={uiLang} />
          )}
          {activeTabId === 'azexbuy-cms' && (
            <AzexbuyCMSView uiLang={uiLang} />
          )}
          {activeTabId === 'inbox' && (
            <InboxView uiLang={uiLang} />
          )}
          {activeTabId === 'user-management' && (
            <UserManagementView uiLang={uiLang} />
          )}
          {activeTabId === 'smtp-settings' && (
            <SmtpSettingsView uiLang={uiLang} />
          )}
          {activeTabId === 'logs' && (
            <LogsView uiLang={uiLang} />
          )}
          {activeTabId === 'product-catalog' && (
            <ProductCatalogView uiLang={uiLang} />
          )}
          {activeTabId === 'articles' && (
            <ArticlesView uiLang={uiLang} />
          )}
          {activeTabId === 'services' && (
            <ServicesView uiLang={uiLang} />
          )}
        </div>
      </main>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onSelectTab={openTab}
        onSelectTheme={handleSelectTheme}
        onOpenThemes={() => setThemeModalOpen(true)}
        onOpenTutorial={() => setTutorialOpen(true)}
        uiLang={uiLang}
      />

      {/* Theme Selector Modal */}
      <ThemeSelectorModal
        isOpen={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
        uiLang={uiLang}
      />

      {/* Azerbaijani Interactive Step-by-Step Tutorial */}
      <InteractiveTutorial
        isOpen={tutorialOpen}
        onClose={() => {
          setTutorialOpen(false);
          localStorage.setItem('octotech_tutorial_completed', 'true');
        }}
        uiLang={uiLang}
      />

      {/* Startup Bottom-Right Update / Up-to-Date Toast */}
      <StartupUpdateToast
        uiLang={uiLang}
        onOpenSettings={() => openTab('settings', t['nav.settings'] || 'Sistem Parametrləri', 'settings')}
        onUpdateCompleted={(newVer) => {
          showToast(`Sistem v${newVer} versiyasına uğurla yeniləndi!`);
        }}
      />

      {/* Fullscreen Onboarding Card Deck Wizard */}
      <OnboardingWizard
        isOpen={wizardOpen}
        onComplete={handleWizardComplete}
        uiLang={uiLang}
      />

      {/* Floating Language Selector */}
      <FloatingFlagSelector
        currentLang={uiLang}
        onSelectLang={(lang) => {
          setUiLang(lang);
          localStorage.setItem(LANG_STORAGE_KEY, lang);
        }}
      />

      {/* Session Expiry Warning Banner */}
      <AnimatePresence>
        {sessionWarnVisible && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-0 left-0 right-0 z-[200000] bg-amber-500 text-white text-xs font-semibold px-4 py-2.5 flex items-center justify-between shadow-lg"
          >
            <span>⚠ Sessiyanızın vaxtı 60 saniyə ərzində bitəcək. Fayl itkisinin qarşısını almaq üçün işinizi yadda saxlayın.</span>
            <button
              onClick={() => setSessionWarnVisible(false)}
              className="ml-4 text-white/80 hover:text-white font-bold text-sm leading-none"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100000] bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-xl shadow-lg border border-slate-800"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
