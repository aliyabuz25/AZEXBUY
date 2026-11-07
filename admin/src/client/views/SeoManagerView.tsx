import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Share2,
  Bot,
  Sliders
} from 'lucide-react';
import { SeoConfig, UiLanguage } from '../types';

interface SeoManagerViewProps {
  seo: SeoConfig;
  onSaveSeo: (seo: SeoConfig) => Promise<void>;
  uiLang: UiLanguage;
}

export const SeoManagerView: React.FC<SeoManagerViewProps> = ({ seo, onSaveSeo }) => {
  const [formData, setFormData] = useState<SeoConfig>(seo);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleChange = (key: keyof SeoConfig, val: any) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSaveSeo(formData);
    setSaving(false);
    setToastMsg('SEO tənzimləmələri uğurla yeniləndi!');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const titleLen = formData.title?.length || 0;
  const descLen = formData.description?.length || 0;

  // Dynamic SEO score — mirrors server.ts logic
  const computedSeoScore = (() => {
    let score = 50;
    if (titleLen >= 25 && titleLen <= 65) score += 20;
    if (descLen >= 60 && descLen <= 165) score += 15;
    if (formData.canonical && formData.canonical.startsWith('http')) score += 5;
    if (formData.ogImage) score += 5;
    if (formData.robotsIndex && formData.robotsFollow) score += 5;
    return Math.min(100, score);
  })();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-700" />
            <span>SEO & Axtarış Mühərriki İdarəetməsi</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Meta başlıqlar, canonical URL və Google axtarış önizləməsi (Real API).
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-2 shadow-sm transition-all"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Yadda saxlanılır...' : 'Dəyişiklikləri Saxla'}</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 bg-slate-100 text-slate-800 text-xs font-medium rounded-lg border border-slate-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-slate-700" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: 2 cols */}
        <div className="lg:col-span-2 space-y-5">
          {/* Main Meta Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
              Əsas Meta Teqləri
            </h3>

            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Səhifə Başlığı (Meta Title) *</span>
                <span className={`text-[11px] ${titleLen >= 50 && titleLen <= 60 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  {titleLen} / 60
                </span>
              </div>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Meta Təsvir (Meta Description) *</span>
                <span className={`text-[11px] ${descLen >= 120 && descLen <= 160 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  {descLen} / 160
                </span>
              </div>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Kanonik URL (Canonical)</label>
                <input
                  type="text"
                  value={formData.canonical || ''}
                  onChange={(e) => handleChange('canonical', e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Açar Sözlər (Keywords)</label>
                <input
                  type="text"
                  value={formData.keywords || ''}
                  onChange={(e) => handleChange('keywords', e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Crawlers & Robots Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Bot className="w-4 h-4 text-slate-500" />
              <span>Axtarış Botları & İndekslənmə (Robots)</span>
            </h3>

            <div className="space-y-3 pt-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.robotsIndex}
                  onChange={(e) => handleChange('robotsIndex', e.target.checked)}
                  className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                />
                <div>
                  <div className="text-xs font-medium text-slate-900">Axtarış Mühərrikləri Səhifəni İndeksləsin (index)</div>
                  <div className="text-[11px] text-slate-400">Google və digər axtarış sistemlərinin səhifəni bazaya əlavə etməsinə icazə verir.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.robotsFollow}
                  onChange={(e) => handleChange('robotsFollow', e.target.checked)}
                  className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                />
                <div>
                  <div className="text-xs font-medium text-slate-900">Linkləri İzləsin (follow)</div>
                  <div className="text-[11px] text-slate-400">Səhifədəki daxili və xarici keçidlərin izlənməsinə icazə verir.</div>
                </div>
              </label>
            </div>
          </div>

          {/* OpenGraph Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Share2 className="w-4 h-4 text-slate-500" />
              <span>OpenGraph & Sosial Şəbəkə Paylaşımı</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Paylaşım Başlığı (og:title)</label>
                <input
                  type="text"
                  value={formData.ogTitle || ''}
                  onChange={(e) => handleChange('ogTitle', e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Paylaşım Şəkli URL (og:image)</label>
                <input
                  type="text"
                  value={formData.ogImage || ''}
                  onChange={(e) => handleChange('ogImage', e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Paylaşım Təsviri (og:description)</label>
              <textarea
                rows={2}
                value={formData.ogDescription || ''}
                onChange={(e) => handleChange('ogDescription', e.target.value)}
                placeholder="Sosial şəbəkə paylaşımlarında görünəcək qısa təsvir..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Google SERP Preview & Diagnostics */}
        <div className="space-y-5">
          {/* Real Google SERP Preview Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Google Axtarış Nəticəsi Önizləməsi
            </h3>

            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[9px] text-slate-700">O</span>
                <span className="truncate">{formData.canonical || 'https://mystore.az'}</span>
              </div>
              <h4 className="text-[14px] font-medium text-slate-900 hover:underline cursor-pointer leading-snug">
                {formData.title || 'Səhifə Başlığı'}
              </h4>
              <p className="text-[11.5px] text-slate-600 leading-relaxed line-clamp-2">
                {formData.description || 'Axtarış sistemlərində görünəcək meta təsvir burada yer alacaq...'}
              </p>
            </div>
          </div>

          {/* Real-time Diagnostics */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Real-Time SEO Təhlili
              </h3>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                computedSeoScore >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                computedSeoScore >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-red-50 text-red-700 border-red-200'
              }`}>
                {computedSeoScore} / 100
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600">Başlıq uzunluğu (50-60 simvol)</span>
                {titleLen >= 50 && titleLen <= 60 ? (
                  <CheckCircle2 className="w-4 h-4 text-slate-700" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-slate-400" />
                )}
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600">Meta təsvir dolğunluğu (120-160 simvol)</span>
                {descLen >= 120 && descLen <= 160 ? (
                  <CheckCircle2 className="w-4 h-4 text-slate-700" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-slate-400" />
                )}
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600">Kanonik etiket təyini</span>
                {formData.canonical ? (
                  <CheckCircle2 className="w-4 h-4 text-slate-700" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-slate-400" />
                )}
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600">Botların indekslənmə icazəsi</span>
                {formData.robotsIndex ? (
                  <CheckCircle2 className="w-4 h-4 text-slate-700" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
