import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon, 
  UploadCloud, 
  Trash2, 
  Copy, 
  Check, 
  Search, 
  FileCheck,
  AlertCircle 
} from 'lucide-react';
import { MediaItem, MulterConfig, UiLanguage } from '../types';

interface MediaViewProps {
  media: MediaItem[];
  multerConfig: MulterConfig | null;
  onUploadFile: (file: File) => Promise<boolean>;
  onDeleteMedia: (id: string) => Promise<void>;
  uiLang: UiLanguage;
}

export const MediaView: React.FC<MediaViewProps> = ({
  media,
  multerConfig,
  onUploadFile,
  onDeleteMedia,
  uiLang
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMedia = media.filter(m => 
    m.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      await onUploadFile(files[i]);
    }
    setUploading(false);
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-slate-700" />
            <span>Media Mərkəzi</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Multer mühərriki ilə təchiz edilmiş fayl kitabxanası və aktivlərin saxlanması.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {multerConfig && (
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              Multer Limiti: Maks {multerConfig.maxFileSizeMB} MB
            </span>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{uploading ? 'Yüklənir...' : 'Fayl Yüklə'}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFiles(e.target.files)}
            multiple
            className="hidden"
          />
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragging 
            ? 'border-slate-900 bg-slate-50' 
            : 'border-slate-200 hover:border-slate-300 bg-white'
        }`}
      >
        <UploadCloud className={`w-8 h-8 mx-auto mb-2 transition-colors ${isDragging ? 'text-slate-900' : 'text-slate-400'}`} />
        <p className="text-xs font-semibold text-slate-800">
          Faylları bura sürükləyin və ya kompüterdən seçin
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          JPEG, PNG, WebP, SVG, PDF (Maksimum {multerConfig?.maxFileSizeMB || 25} MB)
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Fayl adı ilə axtarış..."
            className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Cəmi: {filteredMedia.length} fayl
        </span>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredMedia.map(item => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              {/* Media Preview Box */}
              <div className="h-32 bg-slate-50 flex items-center justify-center p-2 overflow-hidden relative">
                {item.mimeType.startsWith('image/') ? (
                  <img src={item.url} alt={item.originalName} className="w-full h-full object-contain" />
                ) : (
                  <FileCheck className="w-10 h-10 text-slate-400" />
                )}

                {/* Overlay actions on hover */}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopyUrl(item.url, item.id); }}
                    className="p-1.5 bg-white text-slate-800 rounded-md hover:bg-slate-100"
                    title="URL Kopyala"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-slate-900" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteMedia(item.id); }}
                    className="p-1.5 bg-white text-rose-600 rounded-md hover:bg-rose-50"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Info Bottom */}
              <div className="p-2.5 space-y-0.5 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-800 truncate" title={item.originalName}>
                  {item.originalName}
                </p>
<div className="flex items-center justify-between text-[10.5px] text-slate-400">
                   <span>{formatBytes(item.size)}</span>
                   <span>{item.mimeType.split('/')[1]?.toUpperCase()}</span>
                 </div>
                 {item.uploadedAt && (
                   <div className="text-[10px] text-slate-300 mt-0.5">
                     {new Date(item.uploadedAt).toLocaleDateString('az-AZ', { day: '2-digit', month: 'short', year: 'numeric' })}
                   </div>
                 )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredMedia.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-700">Fayl tapılmadı</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Yuxarıdakı sahəyə fayl ataraq yükləyə bilərsiniz.</p>
        </div>
      )}
    </div>
  );
};
