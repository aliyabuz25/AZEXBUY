import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Archive, Download, Upload, RefreshCw, CheckCircle2,
  Database, FileArchive, Clock, ShieldCheck,
  ChevronDown, AlertCircle, FileCheck, X
} from 'lucide-react';
import { UiLanguage } from '../types';

interface BackupRestoreViewProps {
  uiLang: UiLanguage;
  onToast?: (msg: string) => void;
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
  tablesCount: number;
  totalRecords: number;
  mediaFilesCount: number;
  mediaTotalSizeBytes: number;
  lastZipGenerated: string | null;
  zipFileSizeBytes: number;
  backupsList: BackupFileItem[];
}

interface RestoreSummary {
  success: boolean;
  message: string;
  totalRestoredTables: number;
  totalRestoredRows: number;
  totalRestoredMedia: number;
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
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('az-AZ', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
};

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({ uiLang, onToast }) => {
  const [info, setInfo] = useState<BackupInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState<boolean>(true);
  const [backupsList, setBackupsList] = useState<BackupFileItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Download states
  const [downloadingZip, setDownloadingZip] = useState<boolean>(false);
  const [downloadingSqlite, setDownloadingSqlite] = useState<boolean>(false);

  // Upload & Restore states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [restoring, setRestoring] = useState<boolean>(false);
  const [restoreResult, setRestoreResult] = useState<RestoreSummary | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [showConfirmUploadRestore, setShowConfirmUploadRestore] = useState<boolean>(false);

  // Server saved backup candidate for restore
  const [restoreCandidate, setRestoreCandidate] = useState<BackupFileItem | null>(null);
  const [restoringSaved, setRestoringSaved] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const notify = (msg: string) => {
    if (onToast) onToast(msg);
  };

  const fetchBackupData = useCallback(async () => {
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
      console.error('Failed to load backup data:', err);
    } finally {
      setLoadingInfo(false);
    }
  }, []);

  useEffect(() => {
    fetchBackupData();
  }, [fetchBackupData]);

  // Handler: Download full ZIP backup
  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);
      notify('Tam ZIP ehtiyat nüsxəsi hazırlanır...');
      const token = getToken();

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

      const downloadUrl = `/api/backup/download-file/${encodeURIComponent(data.filename)}?token=${encodeURIComponent(token)}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', data.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      notify(`✓ Ehtiyat nüsxəsi (${formatBytes(data.sizeBytes)}) endirildi!`);
      fetchBackupData();
    } catch (err: any) {
      try {
        const token = getToken();
        const link = document.createElement('a');
        link.href = `/api/backup/download-zip?token=${encodeURIComponent(token)}`;
        link.setAttribute('download', 'azexbuy_full_backup.zip');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {}
      notify('Endirmə xətası: ' + err.message);
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
      fetchBackupData();
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

  // Drag & drop handlers
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
      setRestoreError('Yalnız .zip və ya .sqlite faylları dəstəklənir.');
      setSelectedFile(null);
      return;
    }
    setRestoreError(null);
    setRestoreResult(null);
    setSelectedFile(file);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setRestoreError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Execute restore from uploaded file
  const handleConfirmRestoreUpload = async () => {
    if (!selectedFile) return;
    setShowConfirmUploadRestore(false);

    try {
      setRestoring(true);
      setRestoreError(null);
      setRestoreResult(null);
      notify('Bərpa prosesi başladıldı...');

      const token = getToken();
      const formData = new FormData();
      formData.append('backupFile', selectedFile);

      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Bərpa zamanı xəta baş verdi');
      }

      setRestoreResult(json.data);
      notify('✓ Sistem uğurla bərpa edildi!');
      clearSelectedFile();
      fetchBackupData();
    } catch (err: any) {
      setRestoreError(err.message || 'Bərpa xətası baş verdi');
      notify('Xəta: ' + err.message);
    } finally {
      setRestoring(false);
    }
  };

  // Restore saved backup on server
  const handleRestoreSaved = async () => {
    if (!restoreCandidate) return;
    try {
      setRestoringSaved(true);
      notify('Bərpa başladılır...');
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
      fetchBackupData();
    } catch (err: any) {
      notify('Xəta: ' + err.message);
      setRestoreError(err.message);
    } finally {
      setRestoringSaved(false);
    }
  };

  // Download specific saved file from server
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
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Ehtiyat Nüsxə & Bərpa
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Saytın məlumat bazasını və şəkillərini ZIP kimi saxlayın və ya bərpa edin.
            </p>
          </div>
        </div>

        <button
          onClick={fetchBackupData}
          disabled={loadingInfo}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingInfo ? 'animate-spin' : ''}`} />
          Yenilə
        </button>
      </div>

      {/* Success Notification Banner */}
      {restoreResult && (
        <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
              Bərpa prosesi uğurla tamamlandı
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
              {restoreResult.totalRestoredTables} cədvəl, {restoreResult.totalRestoredRows} qeyd və {restoreResult.totalRestoredMedia || 0} media faylı yeniləndi.
            </p>
          </div>
          <button
            onClick={() => setRestoreResult(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:opacity-75 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Banner */}
      {restoreError && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs text-red-700 dark:text-red-300">
            {restoreError}
          </div>
          <button
            onClick={() => setRestoreError(null)}
            className="text-red-600 dark:text-red-400 hover:opacity-75 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main 2-Column Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Download Backup Card */}
        <div className="p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Download className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Ehtiyat Nüsxəni Endir
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Bütün məlumat bazası (CMS mətnləri, tərcümələr, xidmətlər, məhsullar, RFQ) və sayta yüklənmiş bütün şəkillər tək bir ZIP arxivində saxlanılır.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={downloadingZip}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {downloadingZip ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ZIP Hazırlanır...</span>
                </>
              ) : (
                <>
                  <FileArchive className="w-4 h-4" />
                  <span>Tam ZIP Backup Endir</span>
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleDownloadSqlite}
                disabled={downloadingSqlite}
                className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Database className="w-3 h-3" />
                <span>Yalnız verilənlər bazasını (.sqlite) endir</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Restore Backup Card */}
        <div className="p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Upload className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Nüsxədən Bərpa Et
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Daha əvvəl saxlanılmış <b>.zip</b> və ya <b>.sqlite</b> faylını seçərək saytı həmin vəziyyətə bərpa edin. Əməliyyat öncəsi avtomatik təhlükəsizlik nüsxəsi çıxarılır.
            </p>
          </div>

          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,.sqlite,.db,.sqlite3"
              onChange={handleFileChange}
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/60 dark:bg-slate-800/20'
                }`}
              >
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Faylı seçin və ya bura atın
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  .zip (şəkillərlə) və ya .sqlite
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={selectedFile.name}>
                      {selectedFile.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {formatBytes(selectedFile.size)}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearSelectedFile}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
                  title="Faylı sil"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowConfirmUploadRestore(true)}
              disabled={!selectedFile || restoring}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm transition-colors shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {restoring ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Bərpa Edilir...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Bərpa Et</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Server Backups History (Collapsible) */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              Serverdəki Saxlanılan Nüsxələr
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
              {backupsList.length}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showHistory ? 'rotate-180' : ''}`} />
        </button>

        {showHistory && (
          <div className="border-t border-slate-200 dark:border-slate-800 p-4 sm:p-5">
            {backupsList.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400">
                Hələlik saxlanılan ehtiyat nüsxəsi yoxdur.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                      <th className="pb-2 font-medium">Fayl</th>
                      <th className="pb-2 font-medium">Həcm</th>
                      <th className="pb-2 font-medium">Tarix</th>
                      <th className="pb-2 font-medium text-right">Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {backupsList.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 pr-3 font-mono text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-1.5 truncate max-w-[260px] sm:max-w-md">
                            {item.isSafety ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 shrink-0">
                                Safety
                              </span>
                            ) : null}
                            <span className="truncate" title={item.filename}>{item.filename}</span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-3 text-slate-500 font-mono">
                          {formatBytes(item.sizeBytes)}
                        </td>
                        <td className="py-2.5 pr-3 text-slate-500 whitespace-nowrap">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="py-2.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDownloadSavedFile(item)}
                              className="px-2 py-1 rounded text-[11px] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                            >
                              Endir
                            </button>
                            <button
                              type="button"
                              onClick={() => setRestoreCandidate(item)}
                              className="px-2 py-1 rounded text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                            >
                              Bərpa Et
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
        )}
      </div>

      {/* Confirmation Modal for Uploaded File Restore */}
      {showConfirmUploadRestore && selectedFile && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="text-center space-y-2">
              <div className="w-11 h-11 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Bərpanı Təsdiq Edin
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <b>{selectedFile.name}</b> faylından sistem bərpa olunacaq. Mövcud məzmun bu nüsxə ilə əvəzlənəcək.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfirmUploadRestore(false)}
                className="flex-1 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Ləğv et
              </button>
              <button
                type="button"
                onClick={handleConfirmRestoreUpload}
                className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
              >
                Bərpa Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Server Backup Restore */}
      {restoreCandidate && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="text-center space-y-2">
              <div className="w-11 h-11 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Bərpanı Təsdiq Edin
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <b>{restoreCandidate.filename}</b> faylından sayt məlumatları və şəkilləri bərpa ediləcək.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRestoreCandidate(null)}
                disabled={restoringSaved}
                className="flex-1 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Ləğv et
              </button>
              <button
                type="button"
                onClick={handleRestoreSaved}
                disabled={restoringSaved}
                className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {restoringSaved ? 'Bərpa Edilir...' : 'Bərpa Et'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
