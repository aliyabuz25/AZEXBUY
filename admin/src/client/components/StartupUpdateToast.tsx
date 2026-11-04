import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  ArrowUpCircle, 
  RefreshCw, 
  X, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { UiLanguage } from '../types';

interface StartupUpdateToastProps {
  uiLang?: UiLanguage;
  onOpenSettings: () => void;
  onUpdateCompleted?: (newVersion: string) => void;
}

type ToastPhase = 'checking' | 'up_to_date' | 'has_update' | 'updating' | 'updated' | 'error' | 'closed';

interface UpdateData {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  releaseName?: string;
  releaseNotes?: string[];
}

const TOAST_I18N = {
  az: {
    checking: 'Yeniləmələr yoxlanılır...',
    checkingSub: 'Rəsmi versiya və sistem təhlükəsizliyi yoxlanılır (3s)',
    upToDate: 'Sistem Tam Güncəldir',
    upToDateSub: (v: string) => `v${v} • Ən son rəsmi versiyadasınız`,
    updateAvailable: 'Yeniləmə Mövcuddur',
    updateAvailableSub: (cur: string, latest: string) => `v${latest} hazırdır (Cari: v${cur})`,
    updating: 'Sistem yenilənir...',
    updatingSub: 'SQLite nüsxəsi qorunur və paketlər tətbiq edilir',
    updated: 'Uğurla Yeniləndi',
    updatedSub: (v: string) => `Sistem v${v} versiyasına keçirildi`,
    error: 'Yoxlama xətası',
    errorSub: 'Serverlə əlaqə qurula bilmədi',
    btnUpdate: 'İndi Yenilə',
    btnView: 'Bax',
    dismiss: 'Bağla'
  },
  tr: {
    checking: 'Güncellemeler denetleniyor...',
    checkingSub: 'Resmi sürüm ve sistem güvenliği kontrol ediliyor (3s)',
    upToDate: 'Sistem Tamamen Güncel',
    upToDateSub: (v: string) => `v${v} • En son resmi sürümü kullanıyorsunuz`,
    updateAvailable: 'Yeni Güncelleme Mevcut',
    updateAvailableSub: (cur: string, latest: string) => `v${latest} hazır (Mevcut: v${cur})`,
    updating: 'Sistem güncelleniyor...',
    updatingSub: 'SQLite yedeği alınıyor ve paketler uygulanıyor',
    updated: 'Başarıyla Güncellendi',
    updatedSub: (v: string) => `Sistem v${v} sürümüne güncellendi`,
    error: 'Kontrol hatası',
    errorSub: 'Sunucuya bağlanılamadı',
    btnUpdate: 'Şimdi Güncelle',
    btnView: 'İncele',
    dismiss: 'Kapat'
  },
  ru: {
    checking: 'Проверка обновлений...',
    checkingSub: 'Сверка версии с официальным сервером (3с)',
    upToDate: 'Система обновлена',
    upToDateSub: (v: string) => `v${v} • Установлена последняя официальная версия`,
    updateAvailable: 'Доступно обновление',
    updateAvailableSub: (cur: string, latest: string) => `Доступна v${latest} (Текущая: v${cur})`,
    updating: 'Обновление системы...',
    updatingSub: 'Создание копии SQLite и применение пакетов',
    updated: 'Успешно обновлено',
    updatedSub: (v: string) => `Система обновлена до версии v${v}`,
    error: 'Ошибка проверки',
    errorSub: 'Не удалось подключиться к серверу',
    btnUpdate: 'Обновить сейчас',
    btnView: 'Смотреть',
    dismiss: 'Закрыть'
  },
  en: {
    checking: 'Checking for updates...',
    checkingSub: 'Verifying official release and system integrity (3s)',
    upToDate: 'System is Up to Date',
    upToDateSub: (v: string) => `v${v} • You are running the latest official release`,
    updateAvailable: 'New Update Available',
    updateAvailableSub: (cur: string, latest: string) => `v${latest} is available (Current: v${cur})`,
    updating: 'Applying update...',
    updatingSub: 'Backing up SQLite and applying update',
    updated: 'Updated Successfully',
    updatedSub: (v: string) => `System has been updated to v${v}`,
    error: 'Check failed',
    errorSub: 'Could not connect to update server',
    btnUpdate: 'Update Now',
    btnView: 'View',
    dismiss: 'Dismiss'
  }
};

export const StartupUpdateToast: React.FC<StartupUpdateToastProps> = ({
  uiLang = 'az',
  onOpenSettings,
  onUpdateCompleted
}) => {
  const [phase, setPhase] = useState<ToastPhase>('checking');
  const [updateData, setUpdateData] = useState<UpdateData | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loc = TOAST_I18N[uiLang] || TOAST_I18N.az;

  // On mount: trigger the 3s update check
  useEffect(() => {
    let isMounted = true;
    const startTime = Date.now();
    const duration = 3000;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(95, Math.round((elapsed / duration) * 100));
      if (isMounted) setProgress(pct);
    }, 150);

    const performCheck = async () => {
      try {
        const res = await fetch('/api/system/update/check');
        const json = await res.json();
        
        clearInterval(progressInterval);
        if (!isMounted) return;

        setProgress(100);

        if (json.success && json.data) {
          setUpdateData(json.data);
          if (json.data.hasUpdate) {
            setPhase('has_update');
            // Does not auto-dismiss so the user sees the available update
          } else {
            setPhase('up_to_date');
            // Auto dismiss after 6 seconds for up-to-date
            dismissTimerRef.current = setTimeout(() => {
              if (isMounted) setPhase('closed');
            }, 6000);
          }
        } else {
          setPhase('error');
          dismissTimerRef.current = setTimeout(() => {
            if (isMounted) setPhase('closed');
          }, 4500);
        }
      } catch (err) {
        clearInterval(progressInterval);
        if (isMounted) {
          setPhase('error');
          dismissTimerRef.current = setTimeout(() => {
            if (isMounted) setPhase('closed');
          }, 4500);
        }
      }
    };

    performCheck();

    return () => {
      isMounted = false;
      clearInterval(progressInterval);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  const handleApplyUpdate = async () => {
    setPhase('updating');
    try {
      const res = await fetch('/api/system/update/apply', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('octotech_admin_jwt') || ''}` },
      });
      const json = await res.json();
      if (json.success) {
        setPhase('updated');
        const newVersion = json.data?.currentVersion || updateData?.latestVersion || '2.4.5';
        if (onUpdateCompleted) {
          onUpdateCompleted(newVersion);
        }
        dismissTimerRef.current = setTimeout(() => {
          setPhase('closed');
        }, 5000);
      } else {
        setPhase('error');
      }
    } catch {
      setPhase('error');
    }
  };

  const handleClose = () => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    setPhase('closed');
  };

  if (phase === 'closed') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 40, y: 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: 40, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="fixed bottom-16 right-5 z-[99999] w-88 max-w-[calc(100vw-2.5rem)] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xl rounded-none overflow-hidden select-none"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", sans-serif' }}
      >
        {/* Progress Bar (Visible during checking phase) */}
        {phase === 'checking' && (
          <div className="w-full h-0.5 bg-slate-200 dark:bg-slate-800">
            <motion.div
              className="h-full bg-slate-900 dark:bg-white"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.15 }}
            />
          </div>
        )}

        <div className="p-3.5 flex items-start gap-3">
          {/* Status Icon */}
          <div className="shrink-0 pt-0.5">
            {phase === 'checking' && (
              <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center rounded-none border border-slate-300 dark:border-slate-700">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </div>
            )}

            {phase === 'up_to_date' && (
              <div className="w-7 h-7 bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center rounded-none">
                <ShieldCheck className="w-4 h-4" />
              </div>
            )}

            {phase === 'has_update' && (
              <div className="w-7 h-7 bg-amber-500 text-white flex items-center justify-center rounded-none font-bold">
                <ArrowUpCircle className="w-4 h-4" />
              </div>
            )}

            {phase === 'updating' && (
              <div className="w-7 h-7 bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center rounded-none">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </div>
            )}

            {phase === 'updated' && (
              <div className="w-7 h-7 bg-emerald-600 text-white flex items-center justify-center rounded-none">
                <Check className="w-4 h-4" />
              </div>
            )}

            {phase === 'error' && (
              <div className="w-7 h-7 bg-red-600 text-white flex items-center justify-center rounded-none font-bold text-xs">
                !
              </div>
            )}
          </div>

          {/* Text Information */}
          <div className="flex-1 min-w-0 pr-1">
            {phase === 'checking' && (
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {loc.checking}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {progress}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                  {loc.checkingSub}
                </p>
              </div>
            )}

            {phase === 'up_to_date' && (
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {loc.upToDate}
                  </span>
                  <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono border border-slate-300 dark:border-slate-700">
                    v{updateData?.currentVersion || '2.4.2'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                  {loc.upToDateSub(updateData?.currentVersion || '2.4.2')}
                </p>
              </div>
            )}

            {phase === 'has_update' && (
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {loc.updateAvailable}
                  </span>
                  <span className="px-1.5 py-0.2 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-mono font-bold border border-amber-500/30">
                    v{updateData?.latestVersion || '2.4.5'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                  {loc.updateAvailableSub(updateData?.currentVersion || '2.4.2', updateData?.latestVersion || '2.4.5')}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    onClick={handleApplyUpdate}
                    className="h-7 px-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-none text-[11px] font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowUpCircle className="w-3 h-3" />
                    <span>{loc.btnUpdate}</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenSettings();
                      handleClose();
                    }}
                    className="h-7 px-2 rounded-none border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>{loc.btnView}</span>
                  </button>
                </div>
              </div>
            )}

            {phase === 'updating' && (
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {loc.updating}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                  {loc.updatingSub}
                </p>
              </div>
            )}

            {phase === 'updated' && (
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {loc.updated}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                  {loc.updatedSub(updateData?.latestVersion || '2.4.5')}
                </p>
              </div>
            )}

            {phase === 'error' && (
              <div>
                <div className="text-xs font-bold text-red-600 uppercase tracking-wider">
                  {loc.error}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                  {loc.errorSub}
                </p>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="shrink-0 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title={loc.dismiss}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
