import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Share2,
  Bot,
  Globe,
  FileCode,
  Layers,
  Sparkles,
  Smartphone,
  Monitor,
  Copy,
  Check,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { SeoConfig, UiLanguage } from '../types';

interface SeoManagerViewProps {
  seo: SeoConfig;
  onSaveSeo: (seo: SeoConfig) => Promise<void>;
  uiLang: UiLanguage;
}

const DEFAULT_PAGES_LIST = [
  { key: 'home', label: 'Ana Səhifə', defaultTitle: 'AZEXBUY — Connecting Azerbaijani Products with Global Buyers', defaultDesc: 'Azərbaycan istehsalçılarının məhsullarını qlobal alıcılarla birləşdirən rəsmi B2B ticarət qapısı.' },
  { key: 'services', label: 'İxrac Xidmətləri', defaultTitle: 'İxrac Xidmətləri & Konsaltinq | AZEXBUY', defaultDesc: 'Bazarlara çıxış, alıcı axtarışı, beynəlxalq logistika, Orta Dəhliz və tənzimləyici dəstək xidmətləri.' },
  { key: 'products', label: 'Məhsul Kataloqu', defaultTitle: 'Azərbaycan Məhsulları Kataloqu | AZEXBUY', defaultDesc: 'Kənd təsərrüfatı, qida, sənaye, tekstil və kimya üzrə beynəlxalq standartlı Azərbaycan məhsulları.' },
  { key: 'buyers', label: 'Beynəlxalq Alıcılar Masası', defaultTitle: 'Alıcılar Portalı & RFQ Masası | AZEXBUY', defaultDesc: 'Beynəlxalq şirkətlər və distribütorlar üçün birbaşa istehsalçı ilə əlaqə və RFQ qiymət sorğusu.' },
  { key: 'producers', label: 'Yerli İstehsalçılar Masası', defaultTitle: 'İstehsalçılar Portalı & İxrac Qeydiyyatı | AZEXBUY', defaultDesc: 'Məhsulunu qlobal bazarlara çıxarmaq istəyən yerli fabriklər və aqro-parklar üçün ixrac mandatı.' },
  { key: 'articles', label: 'Bloq & Analitika', defaultTitle: 'İxrac Xəbərləri & Ticarət Analitikası | AZEXBUY', defaultDesc: 'Qlobal bazarlar, logistika marşrutları, gömrük qaydaları və xarici ticarət üzrə ən son analitikalar.' },
  { key: 'about', label: 'Haqqımızda', defaultTitle: 'Haqqımızda & Missiyamız | AZEXBUY', defaultDesc: 'AZEXBUY — Azərbaycanın milli ixrac potensialını dünyaya təqdim edən peşəkar ticarət mərkəzi.' },
  { key: 'contact', label: 'Əlaqə & Qərargah', defaultTitle: 'Əlaqə & Qlobal Nümayəndəliklər | AZEXBUY', defaultDesc: 'Bakı baş ofisimiz və xarici ticarət üzrə mütəxəssislərimizlə birbaşa əlaqə qurun.' },
];

export const SeoManagerView: React.FC<SeoManagerViewProps> = ({ seo, onSaveSeo }) => {
  const [formData, setFormData] = useState<SeoConfig>(() => ({
    title: seo?.title || 'AZEXBUY — Connecting Azerbaijani Products with Global Buyers',
    description: seo?.description || 'Sovereign digital trade gateway connecting international business buyers with vetted Azerbaijani manufacturers, producers, and export suppliers.',
    canonical: seo?.canonical || 'https://azexbuy.com',
    keywords: seo?.keywords || 'Azərbaycan ixracı, Made in Azerbaijan, B2B ticarət, qida ixracı, sənaye malları, aqrar ixrac, Orta Dəhliz, AZEXBUY, Azerbaijani export, buy from Azerbaijan',
    robotsIndex: seo?.robotsIndex !== false,
    robotsFollow: seo?.robotsFollow !== false,
    ogTitle: seo?.ogTitle || seo?.title || 'AZEXBUY — Connecting Azerbaijani Products with Global Buyers',
    ogDescription: seo?.ogDescription || seo?.description || 'Sovereign digital trade gateway connecting international business buyers with vetted Azerbaijani manufacturers, producers, and export suppliers.',
    ogImage: seo?.ogImage || 'https://azexbuy.com/logo-192.png',
    sitemapUrl: seo?.sitemapUrl || 'https://azexbuy.com/sitemap.xml',
    lastUpdated: seo?.lastUpdated || new Date().toISOString(),
    pageOverrides: seo?.pageOverrides || {},
  }));

  const [activeTab, setActiveTab] = useState<'global' | 'social' | 'pages' | 'sitemap'>('global');
  const [activePageKey, setActivePageKey] = useState<string>('home');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    if (seo) {
      setFormData(prev => ({
        ...prev,
        ...seo,
        title: seo.title || prev.title,
        description: seo.description || prev.description,
        canonical: seo.canonical || prev.canonical,
        pageOverrides: seo.pageOverrides || prev.pageOverrides || {},
      }));
    }
  }, [seo]);

  const handleChange = (key: keyof SeoConfig, val: any) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const handlePageOverrideChange = (pageKey: string, field: 'title' | 'description' | 'keywords', val: string) => {
    setFormData(prev => {
      const existing = prev.pageOverrides?.[pageKey] || {};
      return {
        ...prev,
        pageOverrides: {
          ...(prev.pageOverrides || {}),
          [pageKey]: {
            ...existing,
            [field]: val,
          },
        },
      };
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await onSaveSeo(formData);
      setToastMsg('✓ SEO və Meta Teq tənzimləmələri uğurla yeniləndi!');
      setTimeout(() => setToastMsg(''), 3000);
    } catch {
      setToastMsg('Xəta: SEO məlumatları saxlanıla bilmədi.');
      setTimeout(() => setToastMsg(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const titleLen = formData.title?.length || 0;
  const descLen = formData.description?.length || 0;

  // Real-time SEO Diagnostic Score
  const computedSeoScore = (() => {
    let score = 40;
    if (titleLen >= 30 && titleLen <= 65) score += 20;
    else if (titleLen > 15) score += 10;
    if (descLen >= 80 && descLen <= 165) score += 20;
    else if (descLen > 30) score += 10;
    if (formData.canonical && formData.canonical.startsWith('http')) score += 10;
    if (formData.ogImage && formData.ogImage.startsWith('http')) score += 5;
    if (formData.robotsIndex && formData.robotsFollow) score += 5;
    return Math.min(100, score);
  })();

  const currentPage = DEFAULT_PAGES_LIST.find(p => p.key === activePageKey) || DEFAULT_PAGES_LIST[0];
  const currentPageTitle = formData.pageOverrides?.[activePageKey]?.title || currentPage.defaultTitle;
  const currentPageDesc = formData.pageOverrides?.[activePageKey]?.description || currentPage.defaultDesc;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* ── Top Header Banner ── */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00243E] text-white flex items-center justify-center shadow-md">
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>SEO & Axtarış Mühərriki İdarəetməsi</span>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold font-mono">
                  Score: {computedSeoScore}/100
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Google, Yandex və sosial şəbəkələrdə saytın başlıqlarını, təsvirlərini, sitemap və robots.txt parametrlərini canlı idarə edin.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
            title="Sitemap.xml faylına bax"
          >
            <FileCode className="w-3.5 h-3.5 text-slate-500" />
            <span>Sitemap.xml</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="h-9 px-5 rounded-lg bg-[#00243E] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{saving ? 'Yadda saxlanılır...' : 'Yadda Saxla'}</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Sub-navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { key: 'global', label: '1. Qlobal Meta Teqlər & Robots', icon: SlidersHorizontal },
          { key: 'social', label: '2. Sosial Şəbəkələr (OpenGraph)', icon: Share2 },
          { key: 'pages', label: '3. Səhifələr üzrə Fərdi SEO', icon: Layers },
          { key: 'sitemap', label: '4. Google SERP & Sitemap', icon: Search },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#00243E] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 1: QLOBAL META TEQLƏR & ROBOTS
          ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'global' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Main Meta Card */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Qlobal Axtarış Teqləri (Bütün Sayt Üçün)</h3>
                <p className="text-xs text-slate-500">Google, Yandex və Bing axtarış sistemlərində əsas görünən başlıq və təsvir.</p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Qlobal Meta Başlıq (Meta Title) *</span>
                  <span className={`text-[11px] font-mono ${titleLen >= 35 && titleLen <= 65 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    {titleLen} / 60 simvol
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="AZEXBUY — Connecting Azerbaijani Products with Global Buyers"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#00243E] focus:ring-1 focus:ring-[#00243E] transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Qlobal Meta Təsvir (Meta Description) *</span>
                  <span className={`text-[11px] font-mono ${descLen >= 80 && descLen <= 165 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    {descLen} / 160 simvol
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Sovereign digital trade gateway connecting international business buyers with vetted Azerbaijani manufacturers, producers, and export suppliers."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#00243E] focus:ring-1 focus:ring-[#00243E] transition-all resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Kanonik URL (Canonical Base URL)</label>
                  <input
                    type="text"
                    value={formData.canonical || ''}
                    onChange={(e) => handleChange('canonical', e.target.value)}
                    placeholder="https://azexbuy.com"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#00243E]"
                  />
                  <p className="text-[10.5px] text-slate-400 mt-1">Axtarış sistemləri üçün əsas domen ünvanı.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Açar Sözlər (Keywords, vergüllə)</label>
                  <input
                    type="text"
                    value={formData.keywords || ''}
                    onChange={(e) => handleChange('keywords', e.target.value)}
                    placeholder="Azərbaycan ixracı, Made in Azerbaijan, B2B ticarət..."
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#00243E]"
                  />
                  <p className="text-[10.5px] text-slate-400 mt-1">Hədəf axtarış sorğuları və teqlər.</p>
                </div>
              </div>
            </div>

            {/* Robots & Crawlers Card */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Bot className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">Axtarış Botları & İndekslənmə (Robots Metatags)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.robotsIndex}
                    onChange={(e) => handleChange('robotsIndex', e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">İndeksləməyə İcazə Ver (index)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Google və axtarış sistemlərinin saytın səhifələrini nəticələrə çıxarmasına icazə verir.</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.robotsFollow}
                    onChange={(e) => handleChange('robotsFollow', e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Keçidləri İzləsin (follow)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Axtarış robotlarının səhifələrdəki daxili linkləri izləməsinə imkan verir.</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Sidebar: SERP Preview & Diagnostics */}
          <div className="space-y-5">
            {/* SERP Preview */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Google SERP Canlı Baxış</span>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1 rounded ${previewDevice === 'desktop' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'}`}
                    title="Masaüstü görünüş"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1 rounded ${previewDevice === 'mobile' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'}`}
                    title="Mobil görünüş"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className={`p-4 rounded-xl border border-slate-200 bg-white space-y-1 ${previewDevice === 'mobile' ? 'max-w-[280px] mx-auto shadow-inner' : ''}`}>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <span className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[9px] text-[#00243E]">A</span>
                  <span className="truncate font-mono">{formData.canonical || 'https://azexbuy.com'}</span>
                </div>
                <h4 className="text-[14px] font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug break-words">
                  {formData.title || 'Səhifə Başlığı'}
                </h4>
                <p className="text-[11.5px] text-[#4d5156] leading-relaxed line-clamp-3 break-words">
                  {formData.description || 'Axtarış sistemlərində görünəcək meta təsvir burada əks olunacaq...'}
                </p>
              </div>
            </div>

            {/* Diagnostic Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">SEO Uyğunluq Skoru</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  computedSeoScore >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  computedSeoScore >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {computedSeoScore} / 100
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-600">Başlıq uzunluğu (30-65 simvol)</span>
                  {titleLen >= 30 && titleLen <= 65 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-600">Təsvir dolğunluğu (80-165 simvol)</span>
                  {descLen >= 80 && descLen <= 165 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-600">Kanonik etiket təyini</span>
                  {formData.canonical ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-slate-400" />}
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-600">Botların indekslənmə icazəsi</span>
                  {formData.robotsIndex ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-slate-400" />}
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-600">OpenGraph vizualı təyin edilib</span>
                  {formData.ogImage ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-slate-400" />}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 2: SOSİAL ŞƏBƏKƏLƏR (OPENGRAPH & TWITTER)
          ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'social' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Sosial Şəbəkə Paylaşımı (OpenGraph Teqləri)</h3>
                <p className="text-xs text-slate-500">Saytın linki WhatsApp, Telegram, LinkedIn, Facebook və X-də paylaşıldıqda çıxan kart məlumatları.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Sosial Paylaşım Başlığı (og:title)</label>
                <input
                  type="text"
                  value={formData.ogTitle || ''}
                  onChange={(e) => handleChange('ogTitle', e.target.value)}
                  placeholder="AZEXBUY — Connecting Azerbaijani Products with Global Buyers"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#00243E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Sosial Paylaşım Təsviri (og:description)</label>
                <textarea
                  rows={3}
                  value={formData.ogDescription || ''}
                  onChange={(e) => handleChange('ogDescription', e.target.value)}
                  placeholder="WhatsApp və LinkedIn paylaşımlarında görünən qısa izah..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#00243E] resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Paylaşım Şəkli URL (og:image)</label>
                <input
                  type="text"
                  value={formData.ogImage || ''}
                  onChange={(e) => handleChange('ogImage', e.target.value)}
                  placeholder="https://azexbuy.com/logo-192.png"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#00243E]"
                />
                <p className="text-[10.5px] text-slate-400 mt-1">Tövsiyə olunan ölçü: 1200x630px və ya 1:1 kvadrat logo formatı.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Social Share Card Preview */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block border-b border-slate-100 pb-2">
                Sosial Kart Canlı Baxış (LinkedIn / WhatsApp)
              </span>

              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-xs">
                <div className="w-full aspect-[1.91/1] bg-slate-200 flex items-center justify-center overflow-hidden relative">
                  {formData.ogImage ? (
                    <img
                      src={formData.ogImage}
                      alt="OG Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-slate-400 text-xs font-semibold flex items-center gap-1">
                      <Share2 className="w-4 h-4" />
                      <span>Şəkil təyin edilməyib</span>
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-1 bg-white">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block truncate">
                    {formData.canonical ? new URL(formData.canonical).hostname : 'azexbuy.com'}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {formData.ogTitle || formData.title || 'AZEXBUY'}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug">
                    {formData.ogDescription || formData.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 3: SƏHİFƏLƏR ÜZRƏ FƏRDİ SEO (PAGE OVERRIDES)
          ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'pages' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Pages List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block px-1">
              Saytın Səhifələri ({DEFAULT_PAGES_LIST.length})
            </span>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-xs">
              {DEFAULT_PAGES_LIST.map(p => {
                const isSelected = activePageKey === p.key;
                const hasCustom = Boolean(formData.pageOverrides?.[p.key]?.title);
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setActivePageKey(p.key)}
                    className={`w-full text-left p-3.5 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#00243E] text-white font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{p.label}</div>
                      <div className={`text-[10px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>/{p.key === 'home' ? '' : p.key}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {hasCustom && (
                        <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                          Fərdi
                        </span>
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Editor for Active Page */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{currentPage.label} — Fərdi Meta Tənzimləməsi</h3>
                  <p className="text-xs text-slate-500">Ziyarətçi bu səhifəyə keçdikdə brauzer sekmesində və axtarışda çıxacaq başlıq.</p>
                </div>
                <span className="text-xs font-mono px-2 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold">
                  URL: /{currentPage.key === 'home' ? '' : currentPage.key}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Səhifə Meta Başlığı</label>
                <input
                  type="text"
                  value={formData.pageOverrides?.[activePageKey]?.title || ''}
                  onChange={(e) => handlePageOverrideChange(activePageKey, 'title', e.target.value)}
                  placeholder={currentPage.defaultTitle}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#00243E]"
                />
                <p className="text-[10.5px] text-slate-400 mt-1">Boş qoyulduqda standart: <em>"{currentPage.defaultTitle}"</em> tətbiq olunur.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Səhifə Meta Təsviri</label>
                <textarea
                  rows={3}
                  value={formData.pageOverrides?.[activePageKey]?.description || ''}
                  onChange={(e) => handlePageOverrideChange(activePageKey, 'description', e.target.value)}
                  placeholder={currentPage.defaultDesc}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#00243E] resize-none"
                />
                <p className="text-[10.5px] text-slate-400 mt-1">Boş qoyulduqda standart: <em>"{currentPage.defaultDesc}"</em> tətbiq olunur.</p>
              </div>

              {/* SERP preview for this specific page */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Bu səhifə üçün Google axtarış önizləməsi:</span>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="text-[11px] text-slate-500 font-mono">
                    {formData.canonical || 'https://azexbuy.com'}/{currentPage.key === 'home' ? '' : currentPage.key}
                  </div>
                  <h4 className="text-[13px] font-semibold text-[#1a0dab] leading-snug">
                    {currentPageTitle}
                  </h4>
                  <p className="text-[11px] text-[#4d5156] leading-relaxed line-clamp-2">
                    {currentPageDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 4: SITEMAP & ROBOTS.TXT
          ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'sitemap' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sitemap Info Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <FileCode className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Dinamik XML Sitemap (sitemap.xml)</h3>
                  <p className="text-xs text-slate-500">Google Search Console və Yandex Webmaster üçün avtomatik yaradılan xəritə.</p>
                </div>
              </div>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 px-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100"
              >
                <span>Aç</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 font-mono text-xs text-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-bold uppercase">Sitemap Linki:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('https://azexbuy.com/sitemap.xml', 'sitemap')}
                  className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 cursor-pointer hover:underline"
                >
                  {copiedLink === 'sitemap' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink === 'sitemap' ? 'Kopyalandı' : 'Linki Kopyala'}</span>
                </button>
              </div>
              <div className="p-2 bg-white border border-slate-200 rounded font-semibold text-slate-900">
                https://azexbuy.com/sitemap.xml
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bütün 6 dildə (AZ, EN, TR, RU, AR, ES) <strong>hreflang</strong> teqləri avtomatik daxildir.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Aktiv məhsullar və məqalələr bazadan anlıq hesablanıb sitemapa əlavə olunur.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Google Search Console-a təqdim edilməyə 100% hazırdır.</span>
              </div>
            </div>
          </div>

          {/* Robots.txt Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Bot className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Axtarış Botları Qaydaları (robots.txt)</h3>
                  <p className="text-xs text-slate-500">Axtarış robotlarının icazəli və qadağan yolları.</p>
                </div>
              </div>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 px-3 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-100"
              >
                <span>Aç</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] leading-relaxed border border-slate-800">
              <div className="text-slate-400 pb-1 border-b border-slate-800 mb-2 font-bold uppercase text-[10px]">
                Canlı robots.txt çıxışı:
              </div>
              <div>User-agent: *</div>
              <div>Allow: /</div>
              <div>Disallow: /octo-admin</div>
              <div>Disallow: /api/</div>
              <div className="mt-2 text-emerald-400">Sitemap: https://azexbuy.com/sitemap.xml</div>
            </div>

            <p className="text-xs text-slate-500">
              Admin paneli və daxili API-lər botlardan qorunur, əsas sayt səhifələri isə tam indekslənmə üçün açıq saxlanılır.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
