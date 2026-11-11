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
  Save,
  Copy,
  ChevronDown,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { TranslationItem, UiLanguage } from '../types';

interface LocalizationViewProps {
  translations: TranslationItem[];
  onSaveTranslation: (item: TranslationItem) => Promise<void>;
  onAddTranslation: (item: TranslationItem) => Promise<void>;
  onDeleteTranslation: (key: string) => Promise<void>;
  uiLang: UiLanguage;
}

const ALL_LANGS = [
  { code: 'az', label: 'Azərbaycan (AZ)' },
  { code: 'en', label: 'English (EN)' },
  { code: 'tr', label: 'Türkçe (TR)' },
  { code: 'ru', label: 'Русский (RU)' },
  { code: 'ar', label: 'العربية (AR)' },
  { code: 'es', label: 'Español (ES)' },
] as const;

type LangCode = typeof ALL_LANGS[number]['code'];

export const LocalizationView: React.FC<LocalizationViewProps> = ({
  translations,
  onSaveTranslation,
  onAddTranslation,
  onDeleteTranslation,
  uiLang
}) => {
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [targetLang, setTargetLang] = useState<LangCode>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<TranslationItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New key form
  const [newKey, setNewKey] = useState('');
  const [newModule, setNewModule] = useState('common');
  const [newAzText, setNewAzText] = useState('');
  const [newEnText, setNewEnText] = useState('');
  const [newTrText, setNewTrText] = useState('');
  const [newRuText, setNewRuText] = useState('');
  const [newArText, setNewArText] = useState('');
  const [newEsText, setNewEsText] = useState('');

  // Extract unique modules dynamically
  const uniqueModules = React.useMemo(() => {
    const s = new Set<string>();
    translations.forEach(t => {
      if (t.module) s.add(t.module);
    });
    return ['all', ...Array.from(s).sort()];
  }, [translations]);

  const filteredItems = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return translations.filter(item => {
      const matchesModule = selectedModule === 'all' || item.module === selectedModule;
      if (!matchesModule) return false;
      if (!q) return true;

      return (
        item.key.toLowerCase().includes(q) ||
        (item.az && item.az.toLowerCase().includes(q)) ||
        (item.en && item.en.toLowerCase().includes(q)) ||
        (item.tr && item.tr.toLowerCase().includes(q)) ||
        (item.ru && item.ru.toLowerCase().includes(q)) ||
        (item.ar && item.ar.toLowerCase().includes(q)) ||
        (item.es && item.es.toLowerCase().includes(q))
      );
    });
  }, [translations, selectedModule, searchQuery]);

  const handleStartEdit = (item: TranslationItem) => {
    setEditingItem({ ...item });
    setExpandedKey(item.key);
  };

  const handleSave = async (itemToSave: TranslationItem) => {
    setSavingKey(itemToSave.key);
    await onSaveTranslation(itemToSave);
    setSavingKey(null);
    setEditingItem(null);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard?.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleExportJson = () => {
    const dataObj: Record<string, string> = {};
    translations.forEach(t => {
      const val = (t as any)[targetLang];
      dataObj[t.key] = val || t.az || t.en || '';
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
      en: newEnText.trim() || newAzText.trim(),
      tr: newTrText.trim() || newAzText.trim(),
      ru: newRuText.trim() || newAzText.trim(),
      ar: newArText.trim() || '',
      es: newEsText.trim() || ''
    };

    await onAddTranslation(newItem);
    setNewKey('');
    setNewAzText('');
    setNewEnText('');
    setNewTrText('');
    setNewRuText('');
    setNewArText('');
    setNewEsText('');
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            <span>Lokalizasiya & Tərcümə Redaktoru</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            AZEXBUY saytının bütün 6 dildə (AZ, EN, TR, RU, AR, ES) açar və mətnlərini idarə edin. Dəyişikliklər dərhal canlı sayta tətbiq olunur.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="h-9 px-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>JSON İxrac ({targetLang.toUpperCase()})</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="h-9 px-4 rounded-lg bg-[#0f3156] hover:bg-[#091e35] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Açar</span>
          </button>
        </div>
      </div>

      {/* Filter and Target Lang Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        {/* Module Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {uniqueModules.map(mod => (
            <button
              key={mod}
              onClick={() => setSelectedModule(mod)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap cursor-pointer ${
                selectedModule === mod
                  ? 'bg-[#0f3156] text-white shadow-xs'
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
              className="h-8 pl-8 pr-3 w-48 sm:w-60 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0f3156] focus:ring-1 focus:ring-[#0f3156]/20 transition-all placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            {ALL_LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => setTargetLang(l.code)}
                className={`px-2 py-1 rounded-md font-bold uppercase text-[11px] transition-all cursor-pointer ${
                  targetLang === l.code
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title={l.label}
              >
                {l.code}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Translations Count & Status */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Göstərilən: <strong className="text-slate-800">{filteredItems.length}</strong> / {translations.length} açar</span>
        <span className="text-[11px] text-slate-400 font-medium">Bütün dəyişikliklər dərhal canlı sayt və Redis keşinə sinxronizasiya olunur</span>
      </div>

      {/* Translations Grid / Cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredItems.map(item => {
            const isEditing = editingItem?.key === item.key;
            const isExpanded = expandedKey === item.key;
            const targetVal = (item as any)[targetLang] || '';

            return (
              <motion.div
                key={item.key}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white rounded-xl border border-slate-200/90 p-4 hover:border-slate-300 transition-all shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Key & Source AZ */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-slate-800 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md select-all">
                        {item.key}
                      </span>
                      <button
                        onClick={() => handleCopyKey(item.key)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                        title="Açar adını kopyala"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {copiedKey === item.key && (
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">Kopyalandı!</span>
                      )}
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.module || 'common'}
                      </span>
                    </div>
                    
                    {/* Primary Azerbaijani Source Text */}
                    <p className="text-[13px] text-slate-800 font-medium leading-relaxed">
                      {item.az}
                    </p>
                  </div>

                  {/* Right: Target Translation Preview & Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        if (isEditing) {
                          setEditingItem(null);
                        } else {
                          handleStartEdit(item);
                        }
                      }}
                      className={`h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isEditing 
                          ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isEditing ? 'Düzəlişi Bağla' : '6 Dildə Redaktə Et'}
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={async () => {
                        if (!confirm(`"${item.key}" açarını silmək istəyirsiniz?`)) return;
                        await onDeleteTranslation(item.key);
                      }}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      title="Açarı sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Target Language Preview bar when collapsed */}
                {!isEditing && (
                  <div 
                    onClick={() => handleStartEdit(item)}
                    className="p-2.5 rounded-lg border border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 cursor-pointer transition-all flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold uppercase bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                        {targetLang}
                      </span>
                      <span className={targetVal ? 'text-slate-700' : 'text-slate-400 italic'}>
                        {targetVal || `Tərcümə daxil edilməyib (${targetLang.toUpperCase()})...`}
                      </span>
                    </div>
                    <span className="text-[11px] text-indigo-600 font-medium">
                      Redaktə üçün klikləyin →
                    </span>
                  </div>
                )}

                {/* Full 6-Language Expanded Editor */}
                {isEditing && editingItem && (
                  <div className="pt-2 border-t border-slate-100 space-y-3 bg-slate-50/60 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-bold text-slate-800">Bütün Dillər üzrə Tərcümə Redaktoru</span>
                      <span className="text-[10px] text-slate-400">Canlı saytda anında yenilənəcək</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {ALL_LANGS.map(lang => {
                        const val = (editingItem as any)[lang.code] || '';
                        return (
                          <div key={lang.code} className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-1.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                                <span className="font-mono text-[10px] uppercase bg-slate-100 text-slate-800 px-1.5 py-0.2 rounded border border-slate-200">
                                  {lang.code}
                                </span>
                                <span>{lang.label}</span>
                              </label>
                              <span className="text-[10px] text-slate-400 font-mono">{val.length}c</span>
                            </div>
                            <textarea
                              rows={2}
                              value={val}
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setEditingItem(prev => prev ? { ...prev, [lang.code]: newVal } : null);
                              }}
                              className="w-full text-xs text-slate-900 bg-slate-50/50 border border-slate-200 rounded p-2 focus:outline-none focus:bg-white focus:border-[#0f3156] focus:ring-1 focus:ring-[#0f3156]/20 transition-all resize-none"
                              placeholder={`${lang.label} tərcüməsi...`}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => setEditingItem(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md cursor-pointer transition-colors"
                      >
                        İmtina
                      </button>
                      <button
                        onClick={() => handleSave(editingItem)}
                        disabled={savingKey === item.key}
                        className="h-8 px-4 bg-[#0f3156] hover:bg-[#091e35] disabled:opacity-50 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{savingKey === item.key ? 'Saxlanılır...' : 'Yadda Saxla'}</span>
                      </button>
                    </div>
                  </div>
                )}
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
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Yeni Lokalizasiya Açarı</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Açar Kodu (Key) *</label>
                  <input
                    type="text"
                    required
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="məs: nav.quickSupport"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0f3156] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Modul</label>
                  <select
                    value={newModule}
                    onChange={(e) => setNewModule(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0f3156] bg-white cursor-pointer"
                  >
                    <option value="navigation">navigation (Naviqasiya)</option>
                    <option value="hero">hero (Hero Bölməsi)</option>
                    <option value="whyAzexbuy">whyAzexbuy (Niyə AZEXBUY)</option>
                    <option value="bilateral">bilateral (Alıcı / İstehsalçı)</option>
                    <option value="services">services (Xidmətlər)</option>
                    <option value="howItWorks">howItWorks (Necə İşləyir)</option>
                    <option value="products">products (Məhsullar)</option>
                    <option value="whyAzerbaijan">whyAzerbaijan (Niyə Azərbaycan)</option>
                    <option value="footer">footer (Footer & Ünvan)</option>
                    <option value="common">common (Ümumi)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ana Dil Mətni (AZ) *</label>
                <textarea
                  required
                  rows={2}
                  value={newAzText}
                  onChange={(e) => setNewAzText(e.target.value)}
                  placeholder="Azərbaycan dilində əsas mətn..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0f3156] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">İngiliscə (EN)</label>
                  <input
                    type="text"
                    value={newEnText}
                    onChange={(e) => setNewEnText(e.target.value)}
                    placeholder="English translation..."
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0f3156]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Türkcə (TR)</label>
                  <input
                    type="text"
                    value={newTrText}
                    onChange={(e) => setNewTrText(e.target.value)}
                    placeholder="Türkçe çeviri..."
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0f3156]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rusca (RU)</label>
                  <input
                    type="text"
                    value={newRuText}
                    onChange={(e) => setNewRuText(e.target.value)}
                    placeholder="Русский перевод..."
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0f3156]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ərəbcə (AR)</label>
                  <input
                    type="text"
                    value={newArText}
                    onChange={(e) => setNewArText(e.target.value)}
                    placeholder="الترجمة العربية..."
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0f3156]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">İspanca (ES)</label>
                <input
                  type="text"
                  value={newEsText}
                  onChange={(e) => setNewEsText(e.target.value)}
                  placeholder="Traducción al español..."
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0f3156]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0f3156] text-white text-xs font-semibold hover:bg-[#091e35] cursor-pointer shadow-xs"
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
