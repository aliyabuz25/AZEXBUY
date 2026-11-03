import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Search, 
  Download, 
  Plus, 
  Check, 
  Layers, 
  FileText, 
  Code, 
  Trash2,
  Save
} from 'lucide-react';
import { TranslationItem, UiLanguage } from '../types';

interface LocalizationViewProps {
  translations: TranslationItem[];
  onSaveTranslation: (item: TranslationItem) => Promise<void>;
  onAddTranslation: (item: TranslationItem) => Promise<void>;
  onDeleteTranslation: (key: string) => Promise<void>;
  uiLang: UiLanguage;
}

export const LocalizationView: React.FC<LocalizationViewProps> = ({
  translations,
  onSaveTranslation,
  onAddTranslation,
  onDeleteTranslation,
  uiLang
}) => {
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [targetLang, setTargetLang] = useState<'tr' | 'ru' | 'en'>('tr');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // New key form
  const [newKey, setNewKey] = useState('');
  const [newModule, setNewModule] = useState('common');
  const [newAzText, setNewAzText] = useState('');

  const modules = ['all', 'common', 'marketing', 'products', 'checkout'];

  const filteredItems = translations.filter(item => {
    const matchesModule = selectedModule === 'all' || item.module === selectedModule;
    const matchesSearch = 
      item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.az.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item[targetLang] && item[targetLang].toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesModule && matchesSearch;
  });

  const handleStartEdit = (item: TranslationItem) => {
    setEditingKey(item.key);
    setEditValue(item[targetLang] || '');
  };

  const handleSave = async (item: TranslationItem) => {
    setSavingKey(item.key);
    const updated: TranslationItem = {
      ...item,
      [targetLang]: editValue
    };
    await onSaveTranslation(updated);
    setSavingKey(null);
    setEditingKey(null);
  };

  const handleExportJson = () => {
    const dataObj: Record<string, string> = {};
    translations.forEach(t => {
      dataObj[t.key] = t[targetLang] || t.az;
    });
    const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translations_${targetLang}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newAzText.trim()) return;

    const newItem: TranslationItem = {
      key: newKey.trim(),
      module: newModule,
      type: 'text',
      az: newAzText.trim(),
      tr: newAzText.trim(),
      ru: newAzText.trim(),
      en: newAzText.trim()
    };

    await onAddTranslation(newItem);
    setNewKey('');
    setNewAzText('');
    setShowAddModal(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-slate-700" />
            <span>Lokalizasiya & Tərcümə Redaktoru</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sadeleşdirilmiş, modul əsaslı və yüksək dəqiqlikli çoxdilli lüğət idarəetməsi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="h-9 px-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>JSON İxrac Et</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Açar</span>
          </button>
        </div>
      </div>

      {/* Filter and Target Lang Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        {/* Module Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {modules.map(mod => (
            <button
              key={mod}
              onClick={() => setSelectedModule(mod)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${
                selectedModule === mod
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {mod === 'all' ? 'Bütün Modullar' : mod}
            </button>
          ))}
        </div>

        {/* Search & Target Selector */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Açar və ya mətn axtar..."
              className="h-8 pl-8 pr-3 w-48 sm:w-60 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            {(['tr', 'ru', 'en'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setTargetLang(lang)}
                className={`px-2.5 py-1 rounded-md font-semibold uppercase text-[11px] transition-all ${
                  targetLang === lang
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Translations Grid / Cards */}
      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {filteredItems.map(item => {
            const isEditing = editingKey === item.key;
            return (
              <motion.div
                key={item.key}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white rounded-xl border border-slate-200/90 p-4 hover:border-slate-300 transition-all shadow-xs"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Key & Source AZ */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
                        {item.key}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.module}
                      </span>
                      {item.type === 'rich' && (
                        <span className="text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200/70 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Code className="w-2.5 h-2.5" /> Rich Text
                        </span>
                      )}
                    </div>
                    
                    {/* Primary Azerbaijani Source Text */}
                    <p className="text-[13px] text-slate-800 font-medium leading-relaxed">
                      {item.az}
                    </p>
                  </div>

                  {/* Right: Target Translation Editor */}
                  <div className="w-1/2 flex flex-col justify-start">
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 leading-relaxed resize-none"
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingKey(null)}
                            className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 rounded"
                          >
                            İmtina
                          </button>
                          <button
                            onClick={() => handleSave(item)}
                            disabled={savingKey === item.key}
                            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            <span>{savingKey === item.key ? 'Saxlanılır...' : 'Yadda Saxla'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => handleStartEdit(item)}
                        className="group p-2.5 rounded-lg border border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <p className={`text-xs leading-relaxed ${item[targetLang] ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                          {item[targetLang] || `Tərcümə daxil edin (${targetLang.toUpperCase()})...`}
                        </p>
                        <span className="opacity-0 group-hover:opacity-100 text-[11px] text-slate-400 font-medium transition-opacity ml-2">
                          Düzəlt
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Globe className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">Axtarışa uyğun açar tapılmadı</p>
            <p className="text-xs text-slate-400 mt-1">Fərqli modul seçin və ya yeni açar əlavə edin.</p>
          </div>
        )}
      </div>

      {/* Add New Key Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-semibold text-slate-900">Yeni Lokalizasiya Açarı</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Açar Kodu (Key) *</label>
                <input
                  type="text"
                  required
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="məs: header.tagline"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Modul</label>
                <select
                  value={newModule}
                  onChange={(e) => setNewModule(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-900 bg-white"
                >
                  <option value="common">common (Ümumi)</option>
                  <option value="marketing">marketing (Marketinq)</option>
                  <option value="products">products (Məhsullar)</option>
                  <option value="checkout">checkout (Ödəniş)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ana Dil Mətni (AZ) *</label>
                <textarea
                  required
                  rows={3}
                  value={newAzText}
                  onChange={(e) => setNewAzText(e.target.value)}
                  placeholder="Azərbaycan dilində əsas mətn..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-900 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800"
                >
                  Açarı Yarat
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
