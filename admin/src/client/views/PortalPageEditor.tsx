import React, { useState } from 'react';
import {
  Save, Upload, Plus, Trash2, ChevronDown, ChevronRight,
  ArrowUp, ArrowDown, RefreshCw, CheckCircle, ExternalLink,
  Layers, ShieldCheck, Truck, CreditCard, Award, FileText,
  Image as ImgIcon, Globe, Sparkles, Box, Info, Check, Eye
} from 'lucide-react';
import {
  PortalPageContent,
  PortalStepItem,
  GuideCard,
  GuideCardItem,
} from '../../../../src/types';

const LOCALES = ['AZ', 'EN', 'TR', 'RU', 'AR', 'ES'] as const;
type LocaleCode = typeof LOCALES[number];

const COLOR_OPTIONS = [
  { value: 'blue', label: 'Mavi (Blue)', pill: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'emerald', label: 'Yaşıl (Emerald)', pill: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'amber', label: 'Kəhrəba (Amber)', pill: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'indigo', label: 'İndiqo (Indigo)', pill: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { value: 'purple', label: 'Bənövşəyi (Purple)', pill: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'rose', label: 'Qırmızı/Çəhrayı (Rose)', pill: 'bg-rose-100 text-rose-800 border-rose-300' },
  { value: 'cyan', label: 'Firuzəyi (Cyan)', pill: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
];

const ICON_OPTIONS = [
  { value: 'fa-solid fa-ship', label: 'Gəmi / Ship (fa-solid fa-ship)' },
  { value: 'fa-solid fa-truck', label: 'Yük maşını / Truck (fa-solid fa-truck)' },
  { value: 'fa-solid fa-file-invoice-dollar', label: 'Hesab / Qiymət (fa-solid fa-file-invoice-dollar)' },
  { value: 'fa-solid fa-credit-card', label: 'Kart / Ödəniş (fa-solid fa-credit-card)' },
  { value: 'fa-solid fa-certificate', label: 'Sertifikat (fa-solid fa-certificate)' },
  { value: 'fa-solid fa-award', label: 'Keyfiyyət (fa-solid fa-award)' },
  { value: 'fa-solid fa-folder-open', label: 'Sənədlər Qovluğu (fa-solid fa-folder-open)' },
  { value: 'fa-solid fa-file-lines', label: 'Sənəd / Qaimə (fa-solid fa-file-lines)' },
  { value: 'fa-solid fa-shield-halved', label: 'Təhlükəsizlik (fa-solid fa-shield-halved)' },
  { value: 'fa-solid fa-globe', label: 'Qlobal Ticarət (fa-solid fa-globe)' },
  { value: 'fa-solid fa-boxes-stacked', label: 'Qablaşdırma (fa-solid fa-boxes-stacked)' },
];

export interface PortalPageEditorProps {
  type: 'buyers' | 'producers';
  title: string;
  description: string;
  pageData: PortalPageContent;
  defaultData: PortalPageContent;
  heroImageKey: string;
  onChange: (updated: PortalPageContent) => void;
  onSave: (data?: PortalPageContent) => void;
  saving: boolean;
  saved: boolean;
  onTriggerUpload: (key: string) => void;
  uploading: string | null;
}

export const PortalPageEditor: React.FC<PortalPageEditorProps> = ({
  type,
  title,
  description,
  pageData,
  defaultData,
  heroImageKey,
  onChange,
  onSave,
  saving,
  saved,
  onTriggerUpload,
  uploading,
}) => {
  const [selectedLang, setSelectedLang] = useState<LocaleCode | 'ALL'>('AZ');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    hero: true,
    steps: true,
    guide: true,
    bottomCta: false,
  });
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({ 0: true });
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({ 0: true });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleStep = (idx: number) => {
    setExpandedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleCard = (idx: number) => {
    setExpandedCards(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // ── Mutators ──
  const updateHero = (fn: (hero: NonNullable<PortalPageContent['hero']>) => NonNullable<PortalPageContent['hero']>) => {
    const cur = pageData.hero || defaultData.hero || { title: {}, desc: {} };
    onChange({ ...pageData, hero: fn({ ...cur }) });
  };

  const updateStepsField = (key: 'stepsTitle' | 'clientLabel' | 'azexbuyLabel' | 'resultLabel' | 'nextLabel', val: Record<string, string>) => {
    onChange({ ...pageData, [key]: val });
  };

  const updateSteps = (newSteps: PortalStepItem[]) => {
    onChange({ ...pageData, steps: newSteps });
  };

  const updateGuideField = (key: 'guideBadge' | 'guideTitle' | 'guideDesc', val: Record<string, string>) => {
    onChange({ ...pageData, [key]: val });
  };

  const updateGuideCards = (newCards: GuideCard[]) => {
    onChange({ ...pageData, guideCards: newCards });
  };

  const updateBottomCta = (fn: (cta: NonNullable<PortalPageContent['bottomCta']>) => NonNullable<PortalPageContent['bottomCta']>) => {
    const cur = pageData.bottomCta || defaultData.bottomCta || { title: {}, desc: {} };
    onChange({ ...pageData, bottomCta: fn({ ...cur }) });
  };

  // ── Localized Field Component ──
  const LocField = ({
    label,
    value,
    onValueChange,
    multi = false,
    rows = 2,
    placeholder = '',
  }: {
    label: string;
    value?: any;
    onValueChange: (val: Record<string, string>) => void;
    multi?: boolean;
    rows?: number;
    placeholder?: string;
  }) => {
    const [forceShowAll, setForceShowAll] = useState(false);
    const valMap: Record<string, string> =
      typeof value === 'object' && value !== null ? value : { AZ: String(value || '') };

    const handleChange = (locale: string, text: string) => {
      onValueChange({ ...valMap, [locale]: text });
    };

    const isAll = selectedLang === 'ALL' || forceShowAll;

    return (
      <div className="bg-white border border-slate-200/90 rounded-md p-3 space-y-2 shadow-2xs">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">{label}</span>
            <div className="flex items-center gap-1">
              {LOCALES.map(l => (
                <span
                  key={l}
                  className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                    valMap[l]?.trim()
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                  title={`${l}: ${valMap[l] ? 'Doldurulub' : 'Boş'}`}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
          {selectedLang !== 'ALL' && (
            <button
              type="button"
              onClick={() => setForceShowAll(prev => !prev)}
              className="text-[10px] text-slate-500 hover:text-[#0f3156] font-medium flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3 h-3" />
              {forceShowAll ? 'Tək Dilə Qayıt' : 'Bütün Dilləri Göstər'}
            </button>
          )}
        </div>

        {isAll ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
            {LOCALES.map(loc => (
              <div key={loc} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 font-mono">{loc}</span>
                  <span className="text-[9px] text-slate-400 font-mono">{(valMap[loc] || '').length}c</span>
                </div>
                {multi ? (
                  <textarea
                    value={valMap[loc] || ''}
                    onChange={e => handleChange(loc, e.target.value)}
                    rows={rows}
                    placeholder={`${loc} dilində daxil edin...`}
                    className="w-full text-xs bg-slate-50/70 border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:bg-white focus:border-[#0f3156] resize-none"
                  />
                ) : (
                  <input
                    value={valMap[loc] || ''}
                    onChange={e => handleChange(loc, e.target.value)}
                    placeholder={`${loc} dilində...`}
                    className="w-full h-8 text-xs bg-slate-50/70 border border-slate-200 rounded px-2.5 focus:outline-none focus:bg-white focus:border-[#0f3156]"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="pt-1">
            <div className="flex items-start gap-2.5">
              <div className="w-10 h-8 rounded bg-[#0f3156]/10 border border-[#0f3156]/20 text-[#0f3156] font-bold text-xs font-mono flex items-center justify-center shrink-0 mt-0.5">
                {selectedLang}
              </div>
              <div className="flex-1 min-w-0">
                {multi ? (
                  <textarea
                    value={valMap[selectedLang] || ''}
                    onChange={e => handleChange(selectedLang, e.target.value)}
                    rows={rows}
                    placeholder={placeholder || `${selectedLang} dilində daxil edin...`}
                    className="w-full text-xs bg-slate-50/70 border border-slate-200 rounded px-3 py-1.5 focus:outline-none focus:bg-white focus:border-[#0f3156] resize-none"
                  />
                ) : (
                  <input
                    value={valMap[selectedLang] || ''}
                    onChange={e => handleChange(selectedLang, e.target.value)}
                    placeholder={placeholder || `${selectedLang} dilində daxil edin...`}
                    className="w-full h-8 text-xs bg-slate-50/70 border border-slate-200 rounded px-3 focus:outline-none focus:bg-white focus:border-[#0f3156]"
                  />
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-mono self-center shrink-0 min-w-[28px] text-right">
                {(valMap[selectedLang] || '').length}c
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const livePortalUrl = type === 'buyers' ? '/#/buyers' : '/#/producers';
  const heroData = pageData.hero || defaultData.hero || { title: {}, desc: {} };
  const stepsList = pageData.steps || defaultData.steps || [];
  const cardsList = pageData.guideCards || defaultData.guideCards || [];
  const ctaData = pageData.bottomCta || defaultData.bottomCta || { title: {}, desc: {} };

  // Button values
  const heroPrimaryBtn = type === 'buyers' ? heroData.ctaRFQ : heroData.ctaRegister;
  const heroSecondaryBtn = type === 'buyers' ? heroData.ctaCatalog : heroData.ctaServices;
  const bottomPrimaryBtn = type === 'buyers' ? ctaData.ctaRFQ : ctaData.ctaRegister;
  const bottomSecondaryBtn = type === 'buyers' ? ctaData.ctaCatalog : ctaData.ctaServices;

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#0f3156] text-white">
                {type === 'buyers' ? 'Alıcılar Portalı' : 'İstehsalçılar Portalı'}
              </span>
              <a
                href={livePortalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
              >
                <span>{livePortalUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">{title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSave(pageData)}
              disabled={saving}
              className={`h-9 px-4 rounded text-xs font-bold text-white flex items-center gap-2 cursor-pointer transition-all shadow-xs ${
                saved
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-[#0f3156] hover:bg-[#081c33]'
              }`}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saxlanılır...
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" /> Saxlandı
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Dəyişiklikləri Saxla
                </>
              )}
            </button>
          </div>
        </div>

        {/* Language Selector Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Redaktə Dili:
            </span>
            {LOCALES.map(loc => (
              <button
                key={loc}
                type="button"
                onClick={() => setSelectedLang(loc)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  selectedLang === loc
                    ? 'bg-[#0f3156] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {loc}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedLang('ALL')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedLang === 'ALL'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Globe className="w-3 h-3" /> Bütün Dillər (All)
            </button>
          </div>

          <span className="text-[11px] text-slate-400">
            {selectedLang === 'ALL'
              ? 'Hazırda bütün 6 dil eyni vaxtda göstərilir'
              : `Aktiv dil: ${selectedLang} (istənilən an digər dillərə keçə bilərsiniz)`}
          </span>
        </div>
      </div>

      {/* ── SECTION 1: HERO BÖLMƏSİ ── */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('hero')}
          className="w-full px-4 py-3.5 flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 transition-colors text-left border-b border-slate-200/60"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded bg-[#0f3156] text-white flex items-center justify-center text-xs font-bold font-mono">
              01
            </span>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Hero Bölməsi (Arxa Fon, Başlıq və Butonlar)
              </span>
              <span className="text-[11px] text-slate-500">
                Səhifənin ən üst hissəsi: arxa fon təsviri, şüar, izah və yönləndirmə düymələri
              </span>
            </div>
          </div>
          {expandedSections.hero ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {expandedSections.hero && (
          <div className="p-4 sm:p-5 space-y-4 bg-slate-50/40">
            {/* Hero Image */}
            <div className="bg-white border border-slate-200 rounded-md p-3.5 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                Hero Arxa Fon Görsəli URL
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={heroData.image || ''}
                  onChange={e => updateHero(h => ({ ...h, image: e.target.value }))}
                  placeholder="https://..."
                  className="flex-1 h-8 text-xs bg-slate-50 border border-slate-200 rounded px-2.5 focus:outline-none focus:border-[#0f3156]"
                />
                <button
                  type="button"
                  onClick={() => onTriggerUpload(heroImageKey)}
                  disabled={uploading === heroImageKey}
                  className="h-8 px-3.5 bg-[#0f3156] hover:bg-[#081c33] text-white text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                >
                  {uploading === heroImageKey ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>Şəkil Yüklə</span>
                </button>
              </div>

              {heroData.image && (
                <div className="mt-2 relative rounded overflow-hidden border border-slate-200 max-h-40 w-full max-w-md bg-slate-100">
                  <img
                    src={heroData.image}
                    alt="Hero Preview"
                    className="w-full h-32 object-cover"
                    onError={e => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                    Önizləmə
                  </span>
                </div>
              )}
            </div>

            {/* Multilingual Text Fields */}
            <LocField
              label="Hero Əsas Başlıq"
              value={heroData.title}
              onValueChange={val => updateHero(h => ({ ...h, title: val }))}
              placeholder={type === 'buyers' ? 'Azərbaycandan tədarük edin' : 'Məhsullarınızı dünya bazarlarına çıxarın'}
            />

            <LocField
              label="Hero Açıqlama Mətni"
              value={heroData.desc}
              onValueChange={val => updateHero(h => ({ ...h, desc: val }))}
              multi
              rows={2}
              placeholder="Tələbinizi bildirin; uyğun tədarükçüləri arayaq..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <LocField
                label={type === 'buyers' ? 'Əsas Buton Mətni (Alıcı Sorğusu)' : 'Əsas Buton Mətni (İstehsalçı Qeydiyyatı)'}
                value={heroPrimaryBtn}
                onValueChange={val => {
                  updateHero(h => type === 'buyers' ? { ...h, ctaRFQ: val } : { ...h, ctaRegister: val });
                }}
                placeholder={type === 'buyers' ? 'Alıcı sorğusu göndər' : 'İstehsalçı kimi qeydiyyat'}
              />

              <LocField
                label={type === 'buyers' ? 'İkinci Buton Mətni (Məhsul Kataloqu)' : 'İkinci Buton Mətni (Xidmətlər)'}
                value={heroSecondaryBtn}
                onValueChange={val => {
                  updateHero(h => type === 'buyers' ? { ...h, ctaCatalog: val } : { ...h, ctaServices: val });
                }}
                placeholder={type === 'buyers' ? 'Məhsul kataloquna bax' : 'Xidmətlərə bax'}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 2: MƏRHƏLƏLƏR / PROSES (STEPS SECTION) ── */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('steps')}
          className="w-full px-4 py-3.5 flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 transition-colors text-left border-b border-slate-200/60"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded bg-[#0f3156] text-white flex items-center justify-center text-xs font-bold font-mono">
              02
            </span>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Mərhələlər & Proses Bölməsi (Steps)
              </span>
              <span className="text-[11px] text-slate-500">
                {type === 'buyers'
                  ? '7 mərhələli alıcı prosesi və addımların idarə edilməsi'
                  : '10 mərhələli istehsalçı prosesi və addımların idarə edilməsi'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
              {stepsList.length} Addım
            </span>
            {expandedSections.steps ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {expandedSections.steps && (
          <div className="p-4 sm:p-5 space-y-5 bg-slate-50/40">
            {/* Section Heading & Labels */}
            <div className="space-y-3">
              <LocField
                label="Bölmə Başlığı"
                value={pageData.stepsTitle || defaultData.stepsTitle}
                onValueChange={val => updateStepsField('stepsTitle', val)}
                placeholder={type === 'buyers' ? '7 mərhələli alıcı prosesi' : '10 mərhələli istehsalçı prosesi'}
              />

              <div className="bg-white border border-slate-200 rounded-md p-3.5 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">
                  Addım Kartlarının Detal Etiketləri (Labels)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <LocField
                    label='"AZEXBUY nə edir?" Etiketi'
                    value={pageData.azexbuyLabel || defaultData.azexbuyLabel}
                    onValueChange={val => updateStepsField('azexbuyLabel', val)}
                    placeholder="AZEXBUY nə edir?"
                  />
                  <LocField
                    label={type === 'buyers' ? '"Alıcı nə təqdim etməlidir?" Etiketi' : '"İstehsalçı nə təqdim etməlidir?" Etiketi'}
                    value={pageData.clientLabel || defaultData.clientLabel}
                    onValueChange={val => updateStepsField('clientLabel', val)}
                    placeholder={type === 'buyers' ? 'Alıcı nə təqdim etməlidir?' : 'İstehsalçı nə təqdim etməlidir?'}
                  />
                  <LocField
                    label='"Gözlənilən nəticə" Etiketi'
                    value={pageData.resultLabel || defaultData.resultLabel}
                    onValueChange={val => updateStepsField('resultLabel', val)}
                    placeholder="Gözlənilən nəticə:"
                  />
                  <LocField
                    label='"Növbəti mərhələ" Etiketi'
                    value={pageData.nextLabel || defaultData.nextLabel}
                    onValueChange={val => updateStepsField('nextLabel', val)}
                    placeholder="Növbəti mərhələ:"
                  />
                </div>
              </div>
            </div>

            {/* Steps Management Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">Addımlar Siyahısı</span>
                <span className="text-xs text-slate-500">({stepsList.length} addım mövcuddur)</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const nextNum = String(stepsList.length + 1).padStart(2, '0');
                    const newStep: PortalStepItem = {
                      num: nextNum,
                      title: { AZ: `Yeni Addım ${nextNum}`, EN: `New Step ${nextNum}` },
                      desc: { AZ: '', EN: '' },
                      azexbuy: { AZ: '', EN: '' },
                      client: { AZ: '', EN: '' },
                      result: { AZ: '', EN: '' },
                      next: { AZ: '', EN: '' },
                    };
                    updateSteps([...stepsList, newStep]);
                    setExpandedSteps(prev => ({ ...prev, [stepsList.length]: true }));
                  }}
                  className="h-8 px-3 bg-[#0f3156] hover:bg-[#081c33] text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Yeni Addım Əlavə Et
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Bütün addımları standart (default) addımlarla əvəz etmək istədiyinizə əminsiniz?')) {
                      updateSteps(defaultData.steps || []);
                    }
                  }}
                  className="h-8 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Standart addımları bərpa et"
                >
                  <RefreshCw className="w-3 h-3 text-slate-500" /> Standartları Bərpa Et
                </button>
              </div>
            </div>

            {/* Steps List Items */}
            <div className="space-y-3">
              {stepsList.map((step, idx) => {
                const isStepExpanded = !!expandedSteps[idx];
                const sTitleObj = typeof step.title === 'object' && step.title !== null ? step.title : { AZ: String(step.title || '') };
                const sDescObj = typeof step.desc === 'object' && step.desc !== null ? step.desc : { AZ: String(step.desc || '') };

                const displayTitle =
                  (sTitleObj as any)?.[selectedLang === 'ALL' ? 'AZ' : selectedLang] ||
                  (sTitleObj as any)?.AZ ||
                  (sTitleObj as any)?.EN ||
                  `Addım ${step.num || idx + 1}`;

                return (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs transition-all"
                  >
                    {/* Step Card Header */}
                    <div className="px-3.5 py-2.5 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/60 transition-colors">
                      <button
                        type="button"
                        onClick={() => toggleStep(idx)}
                        className="flex-1 flex items-center gap-2.5 text-left cursor-pointer mr-2"
                      >
                        <span className="w-7 h-7 rounded bg-[#0f3156] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {step.num || String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 truncate block">
                            {displayTitle}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate block">
                            {(sDescObj as any)?.AZ || (sDescObj as any)?.EN || 'Açıqlama daxil edilməyib'}
                          </span>
                        </div>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            if (idx === 0) return;
                            const copy = [...stepsList];
                            const temp = copy[idx - 1];
                            copy[idx - 1] = copy[idx];
                            copy[idx] = temp;
                            updateSteps(copy);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Yuxarı daşı"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={idx === stepsList.length - 1}
                          onClick={() => {
                            if (idx === stepsList.length - 1) return;
                            const copy = [...stepsList];
                            const temp = copy[idx + 1];
                            copy[idx + 1] = copy[idx];
                            copy[idx] = temp;
                            updateSteps(copy);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Aşağı daşı"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Step */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Addım "${displayTitle}" silinsin?`)) {
                              const copy = stepsList.filter((_, i) => i !== idx);
                              updateSteps(copy);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer ml-1"
                          title="Addımı sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleStep(idx)}
                          className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer ml-1"
                        >
                          {isStepExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Step Card Content */}
                    {isStepExpanded && (
                      <div className="p-4 space-y-3 border-t border-slate-100 bg-white">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="w-full sm:w-28 shrink-0">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">
                              Nömrə (Kodu)
                            </label>
                            <input
                              type="text"
                              value={step.num || ''}
                              onChange={e => {
                                const copy = [...stepsList];
                                copy[idx] = { ...copy[idx], num: e.target.value };
                                updateSteps(copy);
                              }}
                              className="w-full h-8 text-xs bg-slate-50 border border-slate-200 rounded px-2.5 font-mono font-bold focus:outline-none focus:border-[#0f3156]"
                              placeholder="01"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <LocField
                              label="Addım Başlığı"
                              value={step.title}
                              onValueChange={val => {
                                const copy = [...stepsList];
                                copy[idx] = { ...copy[idx], title: val };
                                updateSteps(copy);
                              }}
                              placeholder="Addımın adı..."
                            />
                          </div>
                        </div>

                        <LocField
                          label="Qısa İzah / Məzmun (Desc)"
                          value={step.desc}
                          onValueChange={val => {
                            const copy = [...stepsList];
                            copy[idx] = { ...copy[idx], desc: val };
                            updateSteps(copy);
                          }}
                          multi
                          rows={2}
                          placeholder="Addım haqqında ümumi məlumat..."
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <LocField
                            label="AZEXBUY nə edir?"
                            value={step.azexbuy}
                            onValueChange={val => {
                              const copy = [...stepsList];
                              copy[idx] = { ...copy[idx], azexbuy: val };
                              updateSteps(copy);
                            }}
                            multi
                            rows={2}
                            placeholder="AZEXBUY tərəfindən icra ediləcək tədbirlər..."
                          />

                          <LocField
                            label={type === 'buyers' ? 'Alıcı nə təqdim etməlidir?' : 'İstehsalçı nə təqdim etməlidir?'}
                            value={step.client}
                            onValueChange={val => {
                              const copy = [...stepsList];
                              copy[idx] = { ...copy[idx], client: val };
                              updateSteps(copy);
                            }}
                            multi
                            rows={2}
                            placeholder="Müştərinin təqdim etməli olduğu məlumatlar..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <LocField
                            label="Gözlənilən Nəticə"
                            value={step.result}
                            onValueChange={val => {
                              const copy = [...stepsList];
                              copy[idx] = { ...copy[idx], result: val };
                              updateSteps(copy);
                            }}
                            placeholder="Məs: Potensial tədarükçülərin ilkin siyahısı"
                          />

                          <LocField
                            label="Növbəti Mərhələ"
                            value={step.next}
                            onValueChange={val => {
                              const copy = [...stepsList];
                              copy[idx] = { ...copy[idx], next: val };
                              updateSteps(copy);
                            }}
                            placeholder="Məs: Tədarükçüləri ön yoxlamadan keçiririk"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 3: TİCARƏT BƏLƏDÇİSİ & STANDARTLAR (GUIDE SECTION) ── */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('guide')}
          className="w-full px-4 py-3.5 flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 transition-colors text-left border-b border-slate-200/60"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded bg-[#0f3156] text-white flex items-center justify-center text-xs font-bold font-mono">
              03
            </span>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Ticarət Bələdçisi & Standartlar (Guide Cards & Terms)
              </span>
              <span className="text-[11px] text-slate-500">
                Incoterms®, İxrac qiyməti, Keyfiyyət standartları və İxrac sənədləri kartları və qaydaları
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              {cardsList.length} Bələdçi Kartı
            </span>
            {expandedSections.guide ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {expandedSections.guide && (
          <div className="p-4 sm:p-5 space-y-5 bg-slate-50/40">
            {/* Guide Section Top Metadata */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <LocField
                  label="Bölmə Üst Etiketi (Badge)"
                  value={pageData.guideBadge || defaultData.guideBadge}
                  onValueChange={val => updateGuideField('guideBadge', val)}
                  placeholder="Tədarük Qaydaları və Beynəlxalq Standartlar"
                />

                <LocField
                  label="Bölmə Əsas Başlığı"
                  value={pageData.guideTitle || defaultData.guideTitle}
                  onValueChange={val => updateGuideField('guideTitle', val)}
                  placeholder="Alıcılar Üçün Ticarət və İdxal Bələdçisi"
                />
              </div>

              <LocField
                label="Bölmə Açıqlaması (Description)"
                value={pageData.guideDesc || defaultData.guideDesc}
                onValueChange={val => updateGuideField('guideDesc', val)}
                multi
                rows={2}
                placeholder="Azərbaycandan məhsul tədarük edərkən çatdırılma şərtləri, ödəniş mexanizmləri..."
              />
            </div>

            {/* Guide Cards Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">Bələdçi Kartları Siyahısı</span>
                <span className="text-xs text-slate-500">({cardsList.length} kart mövcuddur)</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const cardNum = cardsList.length + 1;
                    const newCard: GuideCard = {
                      badge: { AZ: `Kart ${cardNum}`, EN: `Card ${cardNum}` },
                      title: { AZ: `Yeni Bələdçi Kartı ${cardNum}`, EN: `New Guide Card ${cardNum}` },
                      tag: { AZ: 'Mövzu', EN: 'Topic' },
                      icon: 'fa-solid fa-folder-open',
                      color: 'blue',
                      overview: { AZ: '', EN: '' },
                      items: [
                        { label: { AZ: 'Nümunə Qayda 1', EN: 'Sample Rule 1' }, desc: { AZ: 'Qaydanın təsviri', EN: 'Rule description' } },
                      ],
                      note: { AZ: '', EN: '' },
                    };
                    updateGuideCards([...cardsList, newCard]);
                    setExpandedCards(prev => ({ ...prev, [cardsList.length]: true }));
                  }}
                  className="h-8 px-3 bg-[#0f3156] hover:bg-[#081c33] text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Yeni Bələdçi Kartı Əlavə Et
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Bütün bələdçi kartlarını standart kartlarla əvəz etmək istədiyinizə əminsiniz?')) {
                      updateGuideCards(defaultData.guideCards || []);
                    }
                  }}
                  className="h-8 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Standart kartları bərpa et"
                >
                  <RefreshCw className="w-3 h-3 text-slate-500" /> Standartları Bərpa Et
                </button>
              </div>
            </div>

            {/* Guide Cards List */}
            <div className="space-y-4">
              {cardsList.map((card, cardIdx) => {
                const isCardExpanded = !!expandedCards[cardIdx];
                const cTitleObj = typeof card.title === 'object' && card.title !== null ? card.title : { AZ: String(card.title || '') };
                const cBadgeObj = typeof card.badge === 'object' && card.badge !== null ? card.badge : { AZ: String(card.badge || '') };
                const cTagObj = typeof card.tag === 'object' && card.tag !== null ? card.tag : { AZ: String(card.tag || '') };

                const cardTitle =
                  (cTitleObj as any)?.[selectedLang === 'ALL' ? 'AZ' : selectedLang] ||
                  (cTitleObj as any)?.AZ ||
                  (cTitleObj as any)?.EN ||
                  `Kart ${cardIdx + 1}`;
                const cardBadge =
                  (cBadgeObj as any)?.[selectedLang === 'ALL' ? 'AZ' : selectedLang] ||
                  (cBadgeObj as any)?.AZ ||
                  `Kart ${cardIdx + 1}`;
                const cardColor = card.color || 'blue';
                const colorMeta = COLOR_OPTIONS.find(c => c.value === cardColor) || COLOR_OPTIONS[0];

                return (
                  <div
                    key={cardIdx}
                    className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs"
                  >
                    {/* Card Header */}
                    <div className="px-3.5 py-2.5 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/60 transition-colors">
                      <button
                        type="button"
                        onClick={() => toggleCard(cardIdx)}
                        className="flex-1 flex items-center gap-2.5 text-left cursor-pointer mr-2"
                      >
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colorMeta.pill}`}>
                          {cardBadge}
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 truncate block">
                            {cardTitle}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate block">
                            {(cTagObj as any)?.AZ || (cTagObj as any)?.EN || 'Alt teq yoxdur'} • {card.items?.length || 0} maddə
                          </span>
                        </div>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={cardIdx === 0}
                          onClick={() => {
                            if (cardIdx === 0) return;
                            const copy = [...cardsList];
                            const temp = copy[cardIdx - 1];
                            copy[cardIdx - 1] = copy[cardIdx];
                            copy[cardIdx] = temp;
                            updateGuideCards(copy);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Yuxarı daşı"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={cardIdx === cardsList.length - 1}
                          onClick={() => {
                            if (cardIdx === cardsList.length - 1) return;
                            const copy = [...cardsList];
                            const temp = copy[cardIdx + 1];
                            copy[cardIdx + 1] = copy[cardIdx];
                            copy[cardIdx] = temp;
                            updateGuideCards(copy);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Aşağı daşı"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Card */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`"${cardTitle}" kartı silinsin?`)) {
                              const copy = cardsList.filter((_, i) => i !== cardIdx);
                              updateGuideCards(copy);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer ml-1"
                          title="Kartı sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleCard(cardIdx)}
                          className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer ml-1"
                        >
                          {isCardExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Card Content */}
                    {isCardExpanded && (
                      <div className="p-4 space-y-4 border-t border-slate-100 bg-white">
                        {/* Card metadata (badge, title, tag, color, icon) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          <LocField
                            label="Kart Badge (Etiket)"
                            value={card.badge}
                            onValueChange={val => {
                              const copy = [...cardsList];
                              copy[cardIdx] = { ...copy[cardIdx], badge: val };
                              updateGuideCards(copy);
                            }}
                            placeholder="Kart 1"
                          />

                          <LocField
                            label="Kart Başlığı"
                            value={card.title}
                            onValueChange={val => {
                              const copy = [...cardsList];
                              copy[cardIdx] = { ...copy[cardIdx], title: val };
                              updateGuideCards(copy);
                            }}
                            placeholder="Incoterms® 2020"
                          />

                          <LocField
                            label="Alt Teq / Qrup"
                            value={card.tag}
                            onValueChange={val => {
                              const copy = [...cardsList];
                              copy[cardIdx] = { ...copy[cardIdx], tag: val };
                              updateGuideCards(copy);
                            }}
                            placeholder="Çatdırılma şərtləri"
                          />

                          <div className="bg-white border border-slate-200/90 rounded-md p-3 space-y-2 shadow-2xs">
                            <span className="text-xs font-bold text-slate-800 block">Stil & İkon</span>
                            <div className="space-y-1.5">
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Rəng Mövzusu</label>
                                <select
                                  value={card.color || 'blue'}
                                  onChange={e => {
                                    const copy = [...cardsList];
                                    copy[cardIdx] = { ...copy[cardIdx], color: e.target.value };
                                    updateGuideCards(copy);
                                  }}
                                  className="w-full h-8 text-xs bg-slate-50 border border-slate-200 rounded px-2 focus:outline-none focus:border-[#0f3156]"
                                >
                                  {COLOR_OPTIONS.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-slate-400 block mb-0.5">İkon Kodu</label>
                                <select
                                  value={card.icon || 'fa-solid fa-folder-open'}
                                  onChange={e => {
                                    const copy = [...cardsList];
                                    copy[cardIdx] = { ...copy[cardIdx], icon: e.target.value };
                                    updateGuideCards(copy);
                                  }}
                                  className="w-full h-8 text-xs bg-slate-50 border border-slate-200 rounded px-2 focus:outline-none focus:border-[#0f3156]"
                                >
                                  {ICON_OPTIONS.map(ic => (
                                    <option key={ic.value} value={ic.value}>{ic.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Overview text */}
                        <LocField
                          label="Qısa İzah / İcmal (Overview)"
                          value={card.overview}
                          onValueChange={val => {
                            const copy = [...cardsList];
                            copy[cardIdx] = { ...copy[cardIdx], overview: val };
                            updateGuideCards(copy);
                          }}
                          multi
                          rows={2}
                          placeholder="Məs: İdxal və tədarük əməliyyatında satıcının və alıcının çatdırılma, daşınma xərcləri və risklər üzrə öhdəliklərini müəyyən edən beynəlxalq qaydalar."
                        />

                        {/* ITEMS LIST INSIDE THIS CARD (EXW, FOB, CIF, DAP, etc.) */}
                        <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-3.5 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">
                                Maddələr / Şərtlər Siyahısı (Items)
                              </span>
                              <span className="text-[11px] text-slate-500">
                                Məsələn: EXW, FOB, CIF, DAP, DDP və ya ISO 9001, Packing List və s.
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const curItems = card.items || [];
                                const newItem: GuideCardItem = {
                                  label: { AZ: 'YENİ ŞƏRT', EN: 'NEW TERM' },
                                  desc: { AZ: 'Şərtin və ya sənədin izahı', EN: 'Description of the term or document' },
                                };
                                const copy = [...cardsList];
                                copy[cardIdx] = { ...copy[cardIdx], items: [...curItems, newItem] };
                                updateGuideCards(copy);
                              }}
                              className="h-7 px-2.5 bg-[#0f3156] hover:bg-[#081c33] text-white text-[11px] font-bold rounded flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto"
                            >
                              <Plus className="w-3 h-3" /> Yeni Maddə Əlavə Et
                            </button>
                          </div>

                          <div className="space-y-2">
                            {(card.items || []).map((item, itemIdx) => (
                              <div
                                key={itemIdx}
                                className="bg-white border border-slate-200/90 rounded-md p-2.5 space-y-2 shadow-2xs"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                                    Maddə #{itemIdx + 1}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {/* Move item up */}
                                    <button
                                      type="button"
                                      disabled={itemIdx === 0}
                                      onClick={() => {
                                        if (itemIdx === 0) return;
                                        const curItems = [...(card.items || [])];
                                        const temp = curItems[itemIdx - 1];
                                        curItems[itemIdx - 1] = curItems[itemIdx];
                                        curItems[itemIdx] = temp;
                                        const copy = [...cardsList];
                                        copy[cardIdx] = { ...copy[cardIdx], items: curItems };
                                        updateGuideCards(copy);
                                      }}
                                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-20 cursor-pointer"
                                      title="Yuxarı daşı"
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </button>

                                    {/* Move item down */}
                                    <button
                                      type="button"
                                      disabled={itemIdx === (card.items?.length || 0) - 1}
                                      onClick={() => {
                                        if (itemIdx === (card.items?.length || 0) - 1) return;
                                        const curItems = [...(card.items || [])];
                                        const temp = curItems[itemIdx + 1];
                                        curItems[itemIdx + 1] = curItems[itemIdx];
                                        curItems[itemIdx] = temp;
                                        const copy = [...cardsList];
                                        copy[cardIdx] = { ...copy[cardIdx], items: curItems };
                                        updateGuideCards(copy);
                                      }}
                                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-20 cursor-pointer"
                                      title="Aşağı daşı"
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </button>

                                    {/* Delete item */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const curItems = (card.items || []).filter((_, i) => i !== itemIdx);
                                        const copy = [...cardsList];
                                        copy[cardIdx] = { ...copy[cardIdx], items: curItems };
                                        updateGuideCards(copy);
                                      }}
                                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                      title="Maddəni sil"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  <div className="sm:col-span-1">
                                    <LocField
                                      label="Maddə / Kod"
                                      value={item.label}
                                      onValueChange={val => {
                                        const curItems = [...(card.items || [])];
                                        curItems[itemIdx] = { ...curItems[itemIdx], label: val };
                                        const copy = [...cardsList];
                                        copy[cardIdx] = { ...copy[cardIdx], items: curItems };
                                        updateGuideCards(copy);
                                      }}
                                      placeholder="EXW / FOB / ISO 9001..."
                                    />
                                  </div>
                                  <div className="sm:col-span-2">
                                    <LocField
                                      label="Açıqlama / Təsvir"
                                      value={item.desc}
                                      onValueChange={val => {
                                        const curItems = [...(card.items || [])];
                                        curItems[itemIdx] = { ...curItems[itemIdx], desc: val };
                                        const copy = [...cardsList];
                                        copy[cardIdx] = { ...copy[cardIdx], items: curItems };
                                        updateGuideCards(copy);
                                      }}
                                      multi
                                      rows={2}
                                      placeholder="Məhsulun təhvil verilmə və daşınma qaydası..."
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Card Note (Footer takeaway) */}
                        <LocField
                          label="Qeyd / Xülasə Tələbi (Note)"
                          value={card.note}
                          onValueChange={val => {
                            const copy = [...cardsList];
                            copy[cardIdx] = { ...copy[cardIdx], note: val };
                            updateGuideCards(copy);
                          }}
                          multi
                          rows={2}
                          placeholder="Məs: Alıcı müqavilə bağlamazdan əvvəl seçilmiş Incoterms® şərtinə uyğun gömrük və daşıma xərclərini hesablamalıdır."
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 4: AŞAĞI CTA BÖLMƏSİ (BOTTOM CTA) ── */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('bottomCta')}
          className="w-full px-4 py-3.5 flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 transition-colors text-left border-b border-slate-200/60"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded bg-[#0f3156] text-white flex items-center justify-center text-xs font-bold font-mono">
              04
            </span>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Aşağı Çağırış Bölməsi (Bottom Call-to-Action)
              </span>
              <span className="text-[11px] text-slate-500">
                Səhifənin sonunda istifadəçini sorğu göndərməyə və ya kataloqa baxmağa çağıran blok
              </span>
            </div>
          </div>
          {expandedSections.bottomCta ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {expandedSections.bottomCta && (
          <div className="p-4 sm:p-5 space-y-4 bg-slate-50/40">
            <LocField
              label="CTA Başlığı"
              value={ctaData.title}
              onValueChange={val => updateBottomCta(c => ({ ...c, title: val }))}
              placeholder="Azərbaycandan tədarük prosesinə bu gün başlayın"
            />

            <LocField
              label="CTA Açıqlaması"
              value={ctaData.desc}
              onValueChange={val => updateBottomCta(c => ({ ...c, desc: val }))}
              multi
              rows={2}
              placeholder="Sorğunuzu göndərin, komandamız 24 saat ərzində sizinlə əlaqə saxlasın."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <LocField
                label={type === 'buyers' ? 'Əsas Buton Mətni (Alıcı Sorğusu)' : 'Əsas Buton Mətni (İstehsalçı Qeydiyyatı)'}
                value={bottomPrimaryBtn}
                onValueChange={val => {
                  updateBottomCta(c => type === 'buyers' ? { ...c, ctaRFQ: val } : { ...c, ctaRegister: val });
                }}
                placeholder={type === 'buyers' ? 'Alıcı sorğusu göndər' : 'İstehsalçı kimi qeydiyyat'}
              />

              <LocField
                label={type === 'buyers' ? 'İkinci Buton Mətni (Məhsul Kataloqu)' : 'İkinci Buton Mətni (Xidmətlər)'}
                value={bottomSecondaryBtn}
                onValueChange={val => {
                  updateBottomCta(c => type === 'buyers' ? { ...c, ctaCatalog: val } : { ...c, ctaServices: val });
                }}
                placeholder={type === 'buyers' ? 'Tədarükçü kataloquna bax' : 'Xidmətlərə bax'}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Save Bar */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 py-3 px-4 rounded-lg shadow-lg flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <a
            href={livePortalUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#0f3156] hover:underline flex items-center gap-1 font-semibold"
          >
            <Eye className="w-3.5 h-3.5" /> Canlı Səhifəyə Bax ({livePortalUrl})
          </a>
          {saved && (
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle className="w-3 h-3" /> Yadda saxlanıldı
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onSave(pageData)}
          disabled={saving}
          className={`h-9 px-5 rounded text-xs font-bold text-white flex items-center gap-2 cursor-pointer transition-all shadow-xs ${
            saved
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-[#0f3156] hover:bg-[#081c33]'
          }`}
        >
          {saving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saxlanılır...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" /> Dəyişiklikləri Saxla
            </>
          )}
        </button>
      </div>
    </div>
  );
};
