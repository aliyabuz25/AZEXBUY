import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Archive, Download, Upload, RefreshCw, CheckCircle2, AlertTriangle,
  Database, Image as ImageIcon, FileArchive, Clock, ShieldCheck,
  HardDrive, Layers, ArrowDownToLine, ArrowUpFromLine, Check, AlertCircle,
  FileCheck, Trash2, ChevronRight, Info
} from 'lucide-react';
import { UiLanguage } from '../types';

interface BackupRestoreViewProps {
  uiLang: UiLanguage;
  onToast?: (msg: string) => void;
}

interface TableSummary {
  name: string;
  rows: number;
  label?: string;
  db?: string;
}

interface BackupFileItem {
  filename: string;
  filePath: string;
  sizeBytes: number;
  createdAt: string;
  type: 'zip' | 'sqlite' | 'db';
  isSafety: boolean;
}

interface BackupInfo {
  engine: string;
  version: string;
  format: string;
  tablesCount: number;
  totalRecords: number;
  fileSizeBytes: number;
  lastGenerated: string | null;
  tableBreakdown: TableSummary[];
  safetyBackupsCount: number;
  mediaFilesCount: number;
  mediaTotalSizeBytes: number;
  zipBackupExists: boolean;
  zipFileSizeBytes: number;
  lastZipGenerated: string | null;
  backupsList: BackupFileItem[];
}

interface RestoreSummary {
  success: boolean;
  message: string;
  totalRestoredTables: number;
  totalRestoredRows: number;
  totalRestoredMedia: number;
  restoredMediaBytes?: number;
  restoredTables?: TableSummary[];
  safetyBackupFile?: string;
  backupTimestamp?: string;
}

const getToken = (): string => {
  return localStorage.getItem('octotech_admin_jwt') ||
    sessionStorage.getItem('octotech_admin_jwt') ||
    localStorage.getItem('azexbuy_admin_token') || '';
};

const formatBytes = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (isoString: string | null): string => {
  if (!isoString) return 'Məlumat yoxdur';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('az-AZ', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return isoString;
  }
};

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({ uiLang, onToast }) => {
  const [info, setInfo] = useState<BackupInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState<boolean>(true);
  const [backupsList, setBackupsList] = useState<BackupFileItem[]>([]);

  // Downloading states
  const [downloadingZip, setDownloadingZip] = useState<boolean>(false);
  const [downloadingSqlite, setDownloadingSqlite] = useState<boolean>(false);

  // Upload & Restore states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [confirmedOverwrite, setConfirmedOverwrite] = useState<boolean>(false);
  const [restoring, setRestoring] = useState<boolean>(false);
  const [restoreStep, setRestoreStep] = useState<string>('');
  const [restoreResult, setRestoreResult] = useState<RestoreSummary | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  // Server-saved restore modal
  const [restoreCandidate, setRestoreCandidate] = useState<BackupFileItem | null>(null);
  const [restoringSaved, setRestoringSaved] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const notify = (msg: string) => {
    if (onToast) onToast(msg);
  };

  const fetchBackupInfo = useCallback(async () => {
    try {
      setLoadingInfo(true);
      const token = getToken();
      const res = await fetch('/api/backup/info', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Status: ' + res.status);
      const json = await res.json();
      if (json.success && json.data) {
        setInfo(json.data);
        if (Array.isArray(json.data.backupsList)) {
          setBackupsList(json.data.backupsList);
        }
      }
    } catch (err: any) {
      console.error('Failed to load backup info:', err);
    } finally {
      setLoadingInfo(false);
    }
  }, []);

  const fetchBackupsList = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch('/api/backup/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setBackupsList(json.data);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchBackupInfo();
    fetchBackupsList();
  }, [fetchBackupInfo, fetchBackupsList]);

  // Handler: Download full ZIP backup
  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);
      notify('Tam ZIP backup hazırlanır (baza və bütün şəkillər)...');
      const token = getToken();

      // 1. First trigger generation via export-zip POST
      const res = await fetch('/api/backup/export-zip', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Backup yaradılarkən xəta baş verdi');
      }

      // 2. Trigger native browser download directly via the generated file URL
      const downloadUrl = `/api/backup/download-file/${encodeURIComponent(data.filename)}?token=${encodeURIComponent(token)}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', data.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      notify(`✓ Tam ZIP backup (${formatBytes(data.sizeBytes)}) endirildi!`);
      fetchBackupInfo();
      fetchBackupsList();
    } catch (err: any) {
      // Fallback: direct window download
      try {
        const token = getToken();
        const link = document.createElement('a');
        link.href = `/api/backup/download-zip?token=${encodeURIComponent(token)}`;
        link.setAttribute('download', 'azexbuy_full_backup.zip');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {}
      notify('Backup endirmə xətası: ' + err.message);
    } finally {
      setDownloadingZip(false);
    }
  };

  // Handler: Download SQLite only
  const handleDownloadSqlite = async () => {
    try {
      setDownloadingSqlite(true);
      notify('SQLite baza faylı hazırlanır...');
      const token = getToken();

      const res = await fetch('/api/backup/export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Baza export xətası');
      }

      const downloadUrl = `/api/backup/download-file/${encodeURIComponent(data.filename)}?token=${encodeURIComponent(token)}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', data.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      notify('✓ SQLite verilənlər bazası endirildi!');
      fetchBackupInfo();
      fetchBackupsList();
    } catch (err: any) {
      try {
        const token = getToken();
        const link = document.createElement('a');
        link.href = `/api/backup/download-sqlite?token=${encodeURIComponent(token)}`;
        link.setAttribute('download', 'azexbuy_full_backup.sqlite');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {}
      notify('SQLite endirmə xətası: ' + err.message);
    } finally {
      setDownloadingSqlite(false);
    }
  };

  // Handler: Drag and drop files
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.zip', '.sqlite', '.db', '.sqlite3'].includes(ext)) {
      setRestoreError('Yalnız .zip və ya .sqlite/.db faylları qəbul edilir.');
      setSelectedFile(null);
      return;
    }
    setRestoreError(null);
    setRestoreResult(null);
    setSelectedFile(file);
    setConfirmedOverwrite(false);
  };

  // Handler: Execute restore from uploaded file
  const handleExecuteRestore = async () => {
    if (!selectedFile) {
      setRestoreError('Zəhmət olmasa bərpa etmək üçün backup faylını seçin.');
      return;
    }
    if (!confirmedOverwrite) {
      setRestoreError('Davam etmək üçün mövcud məlumatların əvəzlənməsini təsdiq etməlisiniz.');
      return;
    }

    try {
      setRestoring(true);
      setRestoreError(null);
      setRestoreResult(null);

      setRestoreStep('1/5: Backup faylı serverə yüklənir...');
      const token = getToken();
      const formData = new FormData();
      formData.append('backupFile', selectedFile);

      setRestoreStep('2/5: Cari sistemin təhlükəsizlik nüsxəsi çıxarılır...');
      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      setRestoreStep('3/5: Baza cədvəlləri və mətnləri bərpa edilir...');
      setRestoreStep('4/5: Media faylları və şəkillər arxivdən çıxarılır...');
      setRestoreStep('5/5: Keşlər sıfırlanır və yoxlama tamamlanır...');

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Bərpa zamanı naməlum xəta baş verdi');
      }

      setRestoreResult(json.data);
      notify('✓ Bərpa prosesi uğurla tamamlandı!');
      setSelectedFile(null);
      setConfirmedOverwrite(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchBackupInfo();
      fetchBackupsList();
    } catch (err: any) {
      setRestoreError(err.message || 'Bərpa xətası baş verdi');
      notify('Bərpa xətası: ' + err.message);
    } finally {
      setRestoring(false);
      setRestoreStep('');
    }
  };

  // Handler: Restore directly from saved backup on server
  const handleRestoreSaved = async () => {
    if (!restoreCandidate) return;
    try {
      setRestoringSaved(true);
      notify(`"${restoreCandidate.filename}" faylından bərpa başladılır...`);
      const token = getToken();
      const res = await fetch('/api/backup/restore-saved', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename: restoreCandidate.filename })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Bərpa xətası');
      }

      setRestoreResult(json.data);
      setRestoreCandidate(null);
      notify('✓ Sistem uğurla bərpa edildi!');
      fetchBackupInfo();
      fetchBackupsList();
    } catch (err: any) {
      notify('Bərpa xətası: ' + err.message);
      setRestoreError(err.message);
    } finally {
      setRestoringSaved(false);
    }
  };

  // Handler: Download specific saved file
  const handleDownloadSavedFile = (item: BackupFileItem) => {
    const token = getToken();
    const url = `/api/backup/download-file/${encodeURIComponent(item.filename)}?token=${encodeURIComponent(token)}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = item.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Ehtiyat Nüsxə & Bərpa
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Full ZIP & SQLite
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Bütün saytın verilənlər bazasını (CMS məzmunu, RFQ, məhsullar, xidmətlər) və bütün media şəkillərini ZIP ilə endirin və bərpa edin.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchBackupInfo(); fetchBackupsList(); }}
            disabled={loadingInfo}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingInfo ? 'animate-spin' : ''}`} />
            Yenilə
          </button>
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Baza Cədvəlləri & Qeydlər</span>
            <Database className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {info ? `${info.tablesCount} cədvəl` : '—'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Cəmi qeydlər:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{info?.totalRecords?.toLocaleString() || '0'} sətir</span>
          </div>
        </div>

        <div className="p-4 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Media & Şəkillər</span>
            <ImageIcon className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {info ? `${info.mediaFilesCount} fayl` : '—'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Yüklənmiş həcm:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{formatBytes(info?.mediaTotalSizeBytes || 0)}</span>
          </div>
        </div>

        <div className="p-4 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Saxlanılan Backup-lar</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {backupsList.length} arxiv
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Təhlükəsizlik nüsxələri:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{info?.safetyBackupsCount || 0} ədəd</span>
          </div>
        </div>

        <div className="p-4 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Son ZIP Nüsxə</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {info?.lastZipGenerated ? formatDate(info.lastZipGenerated) : 'Yaradılmayıb'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Arxiv həcmi:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{formatBytes(info?.zipFileSizeBytes || 0)}</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Grid: Download vs Upload & Restore */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Download Full Backup */}
        <div className="p-5 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-base">
              <ArrowDownToLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              1. Tam Backup Endir (Download)
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Bütün saytın məzmununu tək bir arxivdə saxlayın. Arxivə <b>bütün verilənlər bazası cədvəlləri</b> (azexbuy.db, octo.db, CMS mətnləri, tərcümələr, RFQ sorğuları, istifadəçilər) və <b>bütün yüklənmiş şəkillər / media faylları</b> daxildir.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded p-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                ZIP Arxivin Tərkibi (100% Tam Nüsxə):
              </div>
              <ul className="space-y-1.5 pl-6 list-disc text-slate-600 dark:text-slate-400">
                <li><b className="text-slate-800 dark:text-slate-200">azexbuy_full_backup.sqlite</b> — Bütün sistemin unifikasiya edilmiş SQLite bazası</li>
                <li><b className="text-slate-800 dark:text-slate-200">data/azexbuy.db</b> — Əsas CMS, RFQ, məhsul və xidmətlər bazası</li>
                <li><b className="text-slate-800 dark:text-slate-200">data/octo.db</b> — Admin istifadəçiləri, SMTP və AI sazlamaları</li>
                <li><b className="text-slate-800 dark:text-slate-200">data/azexbuy_export.json</b> — İnsan tərəfindən oxuna bilən tam JSON eksportu</li>
                <li><b className="text-slate-800 dark:text-slate-200">uploads/</b> — Bütün yüklənmiş media və məhsul şəkilləri</li>
                <li><b className="text-slate-800 dark:text-slate-200">public_branding/</b> — Saytın logo və brend vizualları</li>
                <li><b className="text-slate-800 dark:text-slate-200">manifest.json</b> — Arxiv metadata və yoxlama siyahısı</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={downloadingZip}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {downloadingZip ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ZIP Hazırlanır & Endirilir...</span>
                </>
              ) : (
                <>
                  <FileArchive className="w-4 h-4" />
                  <span>Tam ZIP Backup Endir (.zip)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadSqlite}
              disabled={downloadingSqlite}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Yalnız SQLite cədvəllərini endir (şəkillər daxil deyil)"
            >
              {downloadingSqlite ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Database className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>Təkcə Baza (.sqlite)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Upload & Restore */}
        <div className="p-5 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-base">
              <ArrowUpFromLine className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              2. Backup-dan Bərpa Et (Restore from ZIP)
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Əvvəllər endirdiyiniz <b>.zip</b> arxivini (və ya .sqlite bazasını) seçərək bütün saytı bir kliklə bərpa edin. Bütün cədvəllər və şəkillər ehtiyat nüsxədəki vəziyyətinə gətiriləcək.
            </p>

            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,.sqlite,.db,.sqlite3"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {selectedFile.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Həcm: {formatBytes(selectedFile.size)} • Format:{' '}
                    <span className="font-mono uppercase">{selectedFile.name.split('.').pop()}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      Başqa fayl seçmək üçün klikləyin
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Backup faylını buraya sürükləyin və ya <span className="text-blue-600 dark:text-blue-400 underline">seçin</span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Dəstəklənən formatlar: <b>.zip</b> (Tam nüsxə + şəkillər) və ya <b>.sqlite</b> (500 MB-a qədər)
                  </p>
                </div>
              )}
            </div>

            {/* Safety Guarantee Notice */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Avtomatik Təhlükəsizlik Zəmanəti:</span> Bərpa prosesi başlamazdan əvvəl, sistem avtomatik olaraq cari məlumatların və şəkillərin təhlükəsizlik nüsxəsini (safety backup) çıxarır. Heç bir məlumat itkisi riski yoxdur.
              </div>
            </div>

            {/* Confirmation Checkbox */}
            {selectedFile && (
              <label className="flex items-start gap-2.5 p-3 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedOverwrite}
                  onChange={(e) => setConfirmedOverwrite(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 select-none">
                  Bərpa zamanı mövcud sayt məzmunu və media şəkillərinin bu backup faylı ilə əvəzlənməsini təsdiq edirəm.
                </span>
              </label>
            )}

            {/* Progress / Step text */}
            {restoring && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-300">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Bərpa davam edir...
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                  {restoreStep}
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-1.5 rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {restoreError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{restoreError}</span>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
            <button
              type="button"
              onClick={handleExecuteRestore}
              disabled={!selectedFile || !confirmedOverwrite || restoring}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {restoring ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Bərpa Prosesi Gedir...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Bərpanı Başlat (Restore Now)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Restore Success Summary Card (if just restored) */}
      {restoreResult && (
        <div className="p-5 rounded-lg border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/20 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-sm sm:text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            {restoreResult.message}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-slate-900 rounded border border-emerald-200 dark:border-emerald-800/40">
              <span className="text-slate-500 dark:text-slate-400 block">Bərpa olunan cədvəllər:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{restoreResult.totalRestoredTables} cədvəl</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded border border-emerald-200 dark:border-emerald-800/40">
              <span className="text-slate-500 dark:text-slate-400 block">Bərpa olunan qeydlər:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{restoreResult.totalRestoredRows} sətir</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded border border-emerald-200 dark:border-emerald-800/40">
              <span className="text-slate-500 dark:text-slate-400 block">Bərpa olunan media:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{restoreResult.totalRestoredMedia || 0} fayl</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded border border-emerald-200 dark:border-emerald-800/40">
              <span className="text-slate-500 dark:text-slate-400 block">Təhlükəsizlik nüsxəsi:</span>
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate block" title={restoreResult.safetyBackupFile}>
                {restoreResult.safetyBackupFile || 'Yaradıldı'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Saved Backups List on Server */}
      <div className="p-5 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Serverdəki Ehtiyat Nüsxələri Tarixçəsi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Avtomatik təhlükəsizlik nüsxələri və əvvəllər yaradılmış backup faylları. İstənilən vaxt birbaşa bərpa edə və ya endirə bilərsiniz.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
            Cəmi: {backupsList.length} fayl
          </span>
        </div>

        {backupsList.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
            Hələ heç bir ehtiyat nüsxəsi saxlanılmayıb. Yuxarıdakı "Tam ZIP Backup Endir" düyməsinə klikləyərək ilk backup-ı yarada bilərsiniz.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">Fayl Adı</th>
                  <th className="py-2.5 px-3 font-semibold">Növ</th>
                  <th className="py-2.5 px-3 font-semibold">Həcm</th>
                  <th className="py-2.5 px-3 font-semibold">Tarix</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {backupsList.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 font-mono text-slate-800 dark:text-slate-200 font-medium">
                      <div className="flex items-center gap-2">
                        {item.type === 'zip' ? (
                          <FileArchive className="w-4 h-4 text-blue-500 shrink-0" />
                        ) : (
                          <Database className="w-4 h-4 text-purple-500 shrink-0" />
                        )}
                        <span className="truncate max-w-[280px] sm:max-w-md" title={item.filename}>
                          {item.filename}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {item.isSafety ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Safety Backup
                        </span>
                      ) : item.type === 'zip' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          Full ZIP (Baza + Media)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          SQLite
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-mono">
                      {formatBytes(item.sizeBytes)}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDownloadSavedFile(item)}
                          className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                          title="Faylı birbaşa kompüterə endir"
                        >
                          <Download className="w-3 h-3 text-slate-500" />
                          <span>Endir</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRestoreCandidate(item)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          title="Bu ehtiyat nüsxəsindən sistemi bərpa et"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>Bərpa Et</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Server-Saved Restore */}
      {restoreCandidate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Bərpanı Təsdiq Edin
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Seçilmiş nüsxədən sistemin bərpası
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 font-mono">
              <div className="text-slate-800 dark:text-slate-200 font-semibold truncate">
                Fayl: {restoreCandidate.filename}
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                Həcm: {formatBytes(restoreCandidate.sizeBytes)} • Tarix: {formatDate(restoreCandidate.createdAt)}
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Bu əməliyyat cari sayt məzmununu və media şəkillərini seçilmiş nüsxə ilə əvəzləyəcək. Əməliyyatdan öncə avtomatik təhlükəsizlik nüsxəsi çıxarılacaq.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRestoreCandidate(null)}
                disabled={restoringSaved}
                className="px-3.5 py-2 text-xs font-medium rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Ləğv Et
              </button>

              <button
                type="button"
                onClick={handleRestoreSaved}
                disabled={restoringSaved}
                className="px-4 py-2 text-xs font-medium rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {restoringSaved ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Bərpa Edilir...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Bərpanı Təsdiq Et</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
