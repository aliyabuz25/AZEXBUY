import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Shield, 
  HardDrive, 
  Database, 
  Download, 
  UploadCloud, 
  AlertCircle,
  ExternalLink,
  Palette,
  Moon,
  Sun,
  Check,
  RefreshCw,
  GitBranch,
  ArrowUpCircle,
  Terminal,
  Clock,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { SiteConfig, MulterConfig, UiLanguage } from '../types';
import { COLOR_THEMES, ColorTheme } from '../theme';

interface SettingsViewProps {
  siteConfig: SiteConfig | null;
  multerConfig: MulterConfig | null;
  onSaveSite: (site: SiteConfig) => Promise<void>;
  onSaveMulter: (multer: MulterConfig) => Promise<void>;
  onRerunWizard: () => void;
  onOpenTutorial?: () => void;
  uiLang: UiLanguage;
  currentTheme: string;
  onSelectTheme: (themeId: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  siteConfig,
  multerConfig,
  onSaveSite,
  onSaveMulter,
  onRerunWizard,
  onOpenTutorial,
  uiLang,
  currentTheme,
  onSelectTheme
}) => {
  const [siteName, setSiteName] = useState(siteConfig?.name || 'Octotech Store');
  const [siteDomain, setSiteDomain] = useState(siteConfig?.domain || window.location.origin);
  const [siteType, setSiteType] = useState(siteConfig?.type || 'Next.js + Headless Engine');

  const [maxSize, setMaxSize] = useState(multerConfig?.maxFileSizeMB || 25);
  const [mime, setMime] = useState(multerConfig?.allowedMimeTypes || 'image/jpeg,image/png,image/webp,image/svg+xml,application/pdf');

  const [savingSite, setSavingSite] = useState(false);
  const [savingMulter, setSavingMulter] = useState(false);
  const [siteSuccess, setSiteSuccess] = useState(false);
  const [multerSuccess, setMulterSuccess] = useState(false);

  // Backup state
  const [backupInfo, setBackupInfo] = useState<{
    engine: string;
    version: string;
    format: string;
    tablesCount: number;
    totalRecords: number;
    fileSizeBytes: number;
    lastGenerated: string | null;
  } | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreMsg, setRestoreMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Software Update State
  const [currentVersion, setCurrentVersion] = useState<string>('2.4.0');
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [checkProgress, setCheckProgress] = useState<number>(0);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<string | null>(null);
  const [updateData, setUpdateData] = useState<{
    hasUpdate: boolean;
    latestVersion: string;
    releaseName?: string;
    releaseNotes?: string[];
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateLogs, setUpdateLogs] = useState<string[]>([]);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);

  const fetchBackupInfo = async () => {
    try {
      const res = await fetch('/api/backup/info');
      const data = await res.json();
      if (data.success) {
        setBackupInfo(data.data);
      }
    } catch (err) {
      console.error('Backup info fetch error:', err);
    }
  };

  const fetchVersion = async () => {
    try {
      const res = await fetch('/api/system/version');
      const data = await res.json();
      if (data.success && data.data?.version) {
        setCurrentVersion(data.data.version);
      }
    } catch {}
  };

  useEffect(() => {
    fetchBackupInfo();
    fetchVersion();
  }, []);

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    setUpdateStatus('3 saniyə güncellemeler check ediliyor...');
    setUpdateData(null);
    setUpdateLogs([]);
    setCheckProgress(0);

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(95, Math.round((elapsed / 3000) * 100));
      setCheckProgress(pct);
      const remainingSec = Math.max(1, Math.ceil((3000 - elapsed) / 1000));
      setUpdateStatus(`${remainingSec} saniyə güncellemeler check ediliyor...`);
    }, 200);

    try {
      const res = await fetch('/api/system/update/check');
      const data = await res.json();
      clearInterval(interval);
      setCheckProgress(100);
      setLastCheckTime(new Date().toLocaleTimeString());

      if (data.success) {
        setUpdateData(data.data);
        setCurrentVersion(data.data.currentVersion);
        if (data.data.hasUpdate) {
          setUpdateStatus(`Yeni versiya mövcuddur: v${data.data.latestVersion}`);
        } else {
          setUpdateStatus(`Sistem ən son versiyadadır (v${data.data.currentVersion}).`);
        }
      } else {
        setUpdateStatus('Yoxlama xətası: ' + (data.error || 'Server cavab vermədi'));
      }
    } catch (err: any) {
      clearInterval(interval);
      setUpdateStatus('Yoxlama zamanı xəta baş verdi: ' + err.message);
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleApplyUpdate = async () => {
    setIsUpdating(true);
    setUpdateLogs(['[1/5] Mövcud məlumat bazası və yüklənmiş fayllar təhlükəsizlik rejimində qorunur...']);

    try {
      const res = await fetch('/api/system/update/apply', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('octotech_admin_jwt') || ''}` },
      });
      const data = await res.json();
      if (data.success) {
        setUpdateLogs(data.data.logs || [
          '[1/5] Məlumat bazası təhlükəsizlik rejimində qorundu.',
          '[2/5] SQLite backup yaradıldı.',
          '[3/5] Rəsmi versiya paketləri gətirildi.',
          '[4/5] İstehsalat qurulması icra edildi.',
          '[5/5] Sistem uğurla yeniləndi!'
        ]);
        setCurrentVersion(data.data.currentVersion);
        setUpdateData(prev => prev ? { ...prev, hasUpdate: false } : null);
        setUpdateSuccess(true);
        setUpdateStatus(`Sistem uğurla v${data.data.currentVersion} versiyasına keçirildi!`);
      } else {
        setUpdateLogs(prev => [...prev, `[XƏTA] ${data.error || 'Yeniləmə xətası'}`]);
      }
    } catch (err: any) {
      setUpdateLogs(prev => [...prev, `[XƏTA] ${err.message}`]);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSite(true);
    await onSaveSite({
      name: siteName,
      domain: siteDomain,
      type: siteType,
      endpoint: siteConfig?.endpoint || `${window.location.origin}/api`
    });
    setSavingSite(false);
    setSiteSuccess(true);
    setTimeout(() => setSiteSuccess(false), 2000);
  };

  const handleSaveMulter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMulter(true);
    await onSaveMulter({
      maxFileSizeMB: Number(maxSize),
      allowedMimeTypes: mime,
      uploadDir: multerConfig?.uploadDir || 'uploads'
    });
    setSavingMulter(false);
    setMulterSuccess(true);
    setTimeout(() => setMulterSuccess(false), 2000);
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm(`"${file.name}" faylından məlumat bazası tam bərpa edilsin? Mövcud məlumatlar əvəzlənəcək.`)) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setRestoring(true);
    setRestoreMsg(null);

    const formData = new FormData();
    formData.append('backup', file);

    try {
      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setRestoreMsg(`Bərpa edildi: ${data.data.restoredTables?.length || 9} cədvəl yeniləndi.`);
        fetchBackupInfo();
      } else {
        setRestoreMsg('Bərpa xətası: ' + (data.error || 'Naməlum xəta'));
      }
    } catch (err: any) {
      setRestoreMsg('Bərpa xətası: ' + err.message);
    } finally {
      setRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header: Technical & Sharp */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          <span>Sistem və Mühit Parametrləri</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Sayt konfiqurasiyası, SQLite tam ehtiyat nüsxəsi, rəng temaları və fayl yükləmə limitləri.
        </p>
      </div>

      {/* Rəng və Görünüş Temaları Gallery Card: Flat & Sharp */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-none border border-slate-300 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-none bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Rəng Sxemləri
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Açıq və ya tünd kontrast sxemini seçin.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-400 font-mono px-2 py-1 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            [8 Sxem]
          </div>
        </div>

        {/* Theme Cards Grid: Flat & Sharp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {COLOR_THEMES.map((theme: ColorTheme) => {
            const isSelected = currentTheme === theme.id;

            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => onSelectTheme(theme.id)}
                className={`p-3 rounded-none text-left border transition-colors flex flex-col justify-between group cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 dark:border-white ring-1 ring-slate-900 dark:ring-white bg-slate-50 dark:bg-slate-800'
                    : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  {/* Micro Preview Mockup - Flat */}
                  <div 
                    className="w-full h-16 rounded-none p-1 mb-2 border relative overflow-hidden flex gap-1 select-none"
                    style={{
                      backgroundColor: theme.colors.bg,
                      borderColor: theme.colors.border
                    }}
                  >
                    {/* Micro Sidebar */}
                    <div 
                      className="w-7 rounded-none p-0.5 flex flex-col justify-between shrink-0 border"
                      style={{
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border
                      }}
                    >
                      <div className="space-y-0.5">
                        <div className="w-full h-1 rounded-none" style={{ backgroundColor: theme.colors.accent }} />
                        <div className="w-2/3 h-0.5 rounded-none opacity-40" style={{ backgroundColor: theme.colors.text }} />
                      </div>
                      <div className="w-full h-0.5 rounded-none opacity-20" style={{ backgroundColor: theme.colors.text }} />
                    </div>

                    {/* Micro Content */}
                    <div className="flex-1 flex flex-col gap-0.5">
                      <div 
                        className="h-2 rounded-none px-0.5 flex items-center justify-between border"
                        style={{
                          backgroundColor: theme.colors.surface,
                          borderColor: theme.colors.border
                        }}
                      >
                        <div className="w-5 h-0.5 rounded-none opacity-40" style={{ backgroundColor: theme.colors.text }} />
                        <div className="w-1.5 h-1 rounded-none" style={{ backgroundColor: theme.colors.accent }} />
                      </div>

                      <div className="grid grid-cols-2 gap-0.5 flex-1">
                        <div 
                          className="p-0.5 border rounded-none"
                          style={{
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border
                          }}
                        >
                          <div className="w-3 h-0.5 rounded-none opacity-40 mb-0.5" style={{ backgroundColor: theme.colors.text }} />
                          <div className="w-2 h-0.5 rounded-none" style={{ backgroundColor: theme.colors.accent }} />
                        </div>
                        <div 
                          className="p-0.5 border rounded-none"
                          style={{
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border
                          }}
                        >
                          <div className="w-3 h-0.5 rounded-none opacity-40 mb-0.5" style={{ backgroundColor: theme.colors.text }} />
                          <div className="w-2 h-0.5 rounded-none opacity-80" style={{ backgroundColor: theme.colors.text }} />
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div 
                        className="absolute top-0.5 right-0.5 px-1 py-0.5 rounded-none text-[7.5px] font-bold text-white uppercase"
                        style={{ backgroundColor: theme.colors.accent }}
                      >
                        <Check className="w-2 h-2 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                      {theme.name}
                    </span>
                    <span className={`text-[9px] font-mono px-1 py-0.2 rounded-none uppercase border ${
                      theme.mode === 'dark' 
                        ? 'bg-slate-900 text-slate-200 border-slate-700' 
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      {theme.mode === 'dark' ? 'Tünd' : 'Açıq'}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 font-mono mb-1 truncate">
                    [{theme.tag}]
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 p-0.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-none border border-black/20" 
                      style={{ backgroundColor: theme.colors.bg }}
                      title="Fon"
                    />
                    <span 
                      className="w-2.5 h-2.5 rounded-none border border-black/20" 
                      style={{ backgroundColor: theme.colors.surface }}
                      title="Panel"
                    />
                    <span 
                      className="w-2.5 h-2.5 rounded-none border border-black/20" 
                      style={{ backgroundColor: theme.colors.accent }}
                      title="Vurğu"
                    />
                  </div>

                  {isSelected ? (
                    <span className="text-[10.5px] font-bold text-slate-900 dark:text-white flex items-center gap-1 uppercase">
                      <Check className="w-3 h-3 stroke-[2.5]" /> Aktiv
                    </span>
                  ) : (
                    <span className="text-[10.5px] font-medium text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white">
                      Seç
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Software Version & Safe Update Card: Flat & Sharp */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-none border border-slate-300 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-none bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center shrink-0">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Sistem Versiyası & Proqram Təminatı Yeniləməsi
                </h3>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-none border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  v{currentVersion}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-none bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                  Stabil
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Sistemi və məlumatları zədələmədən rəsmi mərkəz üzərindən avtomatik yoxlama və qorunan yeniləmə.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCheckUpdate}
              disabled={isCheckingUpdate || isUpdating}
              className="h-8 px-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-none text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
              <span>{isCheckingUpdate ? 'Yoxlanılır...' : 'Yeniləmələri Yoxla'}</span>
            </button>
          </div>
        </div>

        {/* 3-second checking progress status */}
        {isCheckingUpdate && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-800 dark:text-slate-200 font-semibold">{updateStatus}</span>
              <span className="text-slate-500">{checkProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-none overflow-hidden">
              <div 
                className="h-full bg-slate-900 dark:bg-white transition-all duration-200 ease-out" 
                style={{ width: `${checkProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* System Meta Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
          <div className="p-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="block text-[9.5px] uppercase text-slate-400">Cari Versiya</span>
            <span className="font-bold text-slate-900 dark:text-white">v{currentVersion}</span>
          </div>

          <div className="p-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="block text-[9.5px] uppercase text-slate-400">Rəsmi Mənbə</span>
            <span className="font-bold text-slate-900 dark:text-white truncate block">
              OctoUniversalCore
            </span>
          </div>

          <div className="p-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="block text-[9.5px] uppercase text-slate-400">Budaq</span>
            <span className="font-bold text-slate-900 dark:text-white">main (rəsmi)</span>
          </div>

          <div className="p-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="block text-[9.5px] uppercase text-slate-400">Son Yoxlanış</span>
            <span className="font-bold text-slate-900 dark:text-white truncate block">
              {lastCheckTime || 'Bugün'}
            </span>
          </div>
        </div>

        {/* Update Available Banner & Action */}
        {updateData && updateData.hasUpdate && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {updateData.releaseName || `Yeni Versiya: v${updateData.latestVersion}`}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold">
                  v{updateData.latestVersion} Mövcuddur
                </span>
              </div>

              <button
                onClick={handleApplyUpdate}
                disabled={isUpdating}
                className="h-8 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-none text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shrink-0 disabled:opacity-60"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isUpdating ? 'Yenilənir...' : 'Sistemi Bozmadan Yenilə'}</span>
              </button>
            </div>

            {/* Safety Guarantee Tag */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Qorunan Rejim: Bütün SQLite bazası, ayarlar və yüklənmiş fayllar tam qorunur.</span>
            </div>

            {/* Release notes */}
            {updateData.releaseNotes && updateData.releaseNotes.length > 0 && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Buraxılış Dəyişiklikləri:
                </span>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                  {updateData.releaseNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Up-to-date Message */}
        {updateData && !updateData.hasUpdate && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
            <span>Sistem ən son versiyadadır (v{currentVersion}). Rəsmi mərkəzdə heç bir yeni yeniləmə yoxdur.</span>
          </div>
        )}

        {/* Real-time Update Execution Logs */}
        {updateLogs.length > 0 && (
          <div className="p-3 bg-slate-900 text-slate-100 font-mono text-[11px] space-y-1 rounded-none border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 pb-1 border-b border-slate-800 text-[10px] uppercase tracking-wider">
              <Terminal className="w-3 h-3" />
              <span>Sistem Təhlükəsiz Yeniləmə Jurnalı</span>
            </div>
            {updateLogs.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SQLite Full Backup & Restore Card: Flat */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-none border border-slate-300 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-none bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <span>SQLite Tam Backup & Restore</span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-none border border-slate-300 dark:border-slate-700 font-mono">
                  v2.4
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Bütün məzmunu, SEO konfiqurasiyalarını, media fayllarını və tərcümələri .sqlite formatında saxlayın və ya bərpa edin.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="/adminer"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 px-3 rounded-none border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Ayrı pəncərədə rəsmi Adminer interfeysini aç"
            >
              <Database className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              <span>Adminer (/adminer)</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <input
              type="file"
              ref={fileInputRef}
              accept=".sqlite"
              onChange={handleRestoreFile}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={restoring}
              className="h-8 px-3 rounded-none border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
              <span>{restoring ? 'Bərpa olunur...' : 'Bərpa Et'}</span>
            </button>

            <a
              href="/api/backup/download"
              download
              className="h-8 px-3 rounded-none bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup Endir (.sqlite)</span>
            </a>
          </div>
        </div>

        {/* Backup Meta Info Pills: Flat & Sharp */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
          <div className="p-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="block text-[9.5px] uppercase text-slate-400">Format</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">.sqlite</span>
          </div>

          <div className="p-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="block text-[9.5px] uppercase text-slate-400">Cədvəllər</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">9 Cədvəl</span>
          </div>

          <div className="p-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="block text-[9.5px] uppercase text-slate-400">Sətirlər</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {backupInfo?.totalRecords ? `${backupInfo.totalRecords} sətir` : 'Aktiv'}
            </span>
          </div>

          <div className="p-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="block text-[9.5px] uppercase text-slate-400">Həcm</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {backupInfo?.fileSizeBytes ? `${(backupInfo.fileSizeBytes / 1024).toFixed(1)} KB` : '57.3 KB'}
            </span>
          </div>
        </div>

        {restoreMsg && (
          <div className="p-2.5 rounded-none bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-slate-600 dark:text-slate-400" />
            <span>{restoreMsg}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Site Details Card: Flat & Sharp */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-none border border-slate-300 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>Sayt Parametrləri</span>
            </h3>
            {siteSuccess && (
              <span className="text-xs text-slate-600 dark:text-slate-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saxlanıldı
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSite} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Sayt Adı</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full h-8 px-2.5 rounded-none border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:border-slate-900 dark:focus:border-white bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Domen / Host</label>
              <input
                type="text"
                value={siteDomain}
                onChange={(e) => setSiteDomain(e.target.value)}
                className="w-full h-8 px-2.5 rounded-none border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:border-slate-900 dark:focus:border-white bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Mühit Tipi</label>
              <select
                value={siteType}
                onChange={(e) => setSiteType(e.target.value)}
                className="w-full h-8 px-2 rounded-none border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:border-slate-900 dark:focus:border-white bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Next.js + Headless Engine">Next.js + Headless Engine</option>
                <option value="React Vite SPA">React Vite SPA</option>
                <option value="Shopify Storefront">Shopify Storefront</option>
                <option value="WordPress REST API">WordPress REST API</option>
                <option value="Node.js Custom API">Node.js Custom API</option>
                <option value="Supabase / PostgreSQL">Supabase / PostgreSQL</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingSite}
                className="h-8 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-none text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSite ? 'Saxlanılır...' : 'Yadda Saxla'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Multer & Storage Card: Flat & Sharp */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-none border border-slate-300 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>Yükləmə Limitləri</span>
            </h3>
            {multerSuccess && (
              <span className="text-xs text-slate-600 dark:text-slate-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saxlanıldı
              </span>
            )}
          </div>

          <form onSubmit={handleSaveMulter} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Maksimum Fayl Həcmi (MB)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={maxSize}
                onChange={(e) => setMaxSize(Number(e.target.value))}
                className="w-full h-8 px-2.5 rounded-none border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:border-slate-900 dark:focus:border-white bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">İcazəli MIME Növləri</label>
              <textarea
                rows={3}
                value={mime}
                onChange={(e) => setMime(e.target.value)}
                className="w-full p-2 rounded-none border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:border-slate-900 dark:focus:border-white resize-none bg-white dark:bg-slate-800"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingMulter}
                className="h-8 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-none text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingMulter ? 'Saxlanılır...' : 'Yadda Saxla'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Interactive System Tutorial Card: Flat & Sharp */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-none border border-slate-300 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
            <span>Sistem Bələdçisi (Tutorial)</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Admin panelinin 6 əsas mərhələsini izah edən interaktiv bələdçi turunu istənilən vaxt yenidən başladın.
          </p>
        </div>
        <button
          onClick={onOpenTutorial}
          className="h-8 px-3 rounded-none border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Bələdçini Başlat</span>
        </button>
      </div>

      {/* Rerun Setup Wizard Card: Flat & Sharp */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-none border border-slate-300 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Quraşdırma Sihirbazı</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Brend məlumatlarını və admin profilini formalaşdırın.
          </p>
        </div>
        <button
          onClick={onRerunWizard}
          className="h-8 px-3 rounded-none border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Sihirbazı Başlat</span>
        </button>
      </div>
    </div>
  );
};
