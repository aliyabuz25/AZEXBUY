import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  FileText,
  Factory,
  Briefcase,
  Bot,
  Package,
  Search,
  Printer,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  Check,
  CheckCircle,
  HelpCircle,
  X,
  Sparkles,
  Sliders,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { UiLanguage } from '../types';
import {
  DEFAULT_MODALS_CONFIG,
  AllModalsConfig,
  RFQModalConfig,
  ProducerModalConfig,
  ServiceModalConfig,
  AIDeskModalConfig,
  ProductSpecModalConfig,
  SearchModalConfig,
  DossierModalConfig,
  FaqChipConfig,
} from '../../../../src/data/defaultModals';

interface ModalsViewProps {
  uiLang: UiLanguage;
  initialModalKey?: string;
}

const LOCALES = ['AZ', 'EN', 'TR', 'RU', 'AR', 'ES'] as const;
type Loc = typeof LOCALES[number];

const OCTO = '';
const getToken = () =>
  localStorage.getItem('octotech_admin_jwt') || sessionStorage.getItem('octotech_admin_jwt') || '';

async function apiGet(path: string) {
  try {
    const t = getToken();
    const r = await fetch(`${OCTO}${path}`, {
      headers: { ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    });
    return r.ok ? r.json() : null;
  } catch {
    return null;
  }
}

async function apiPost(path: string, body: any): Promise<{ ok: boolean; data: any; error?: string }> {
  try {
    const t = getToken();
    const r = await fetch(`${OCTO}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => null);
    return { ok: r.ok, data, error: data?.error || (r.ok ? undefined : `HTTP ${r.status}`) };
  } catch (err: any) {
    return { ok: false, data: null, error: err?.message || 'Bağlantı xətası' };
  }
}

export const ModalsView: React.FC<ModalsViewProps> = ({ uiLang, initialModalKey }) => {
  const [activeModalKey, setActiveModalKey] = useState<string>(initialModalKey || 'rfq');
  const [selectedLoc, setSelectedLoc] = useState<Loc>('AZ');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [contentObj, setContentObj] = useState<any>({});
  const [cfg, setCfg] = useState<AllModalsConfig>(() => JSON.parse(JSON.stringify(DEFAULT_MODALS_CONFIG)));

  // Inputs for adding new items
  const [newIncoterm, setNewIncoterm] = useState('');
  const [newCert, setNewCert] = useState('');
  const [newPort, setNewPort] = useState('');
  const [newEnterpriseType, setNewEnterpriseType] = useState('');
  const [newProdCat, setNewProdCat] = useState('');
  const [newCapacityUnit, setNewCapacityUnit] = useState('');
  const [newTargetMarket, setNewTargetMarket] = useState('');
  const [newProdCert, setNewProdCert] = useState('');
  const [newCompanyType, setNewCompanyType] = useState('');
  const [newUrgency, setNewUrgency] = useState('');
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newTrendingTag, setNewTrendingTag] = useState('');
  const [newSearchCatName, setNewSearchCatName] = useState('');
  const [newSearchCatQuery, setNewSearchCatQuery] = useState('');

  // Load existing configuration from /api/azexbuy/content
  const loadContent = useCallback(async () => {
    const c = await apiGet('/api/azexbuy/content');
    if (c && typeof c === 'object') {
      setContentObj(c);
      const savedCfg = c.modalsConfig || c.modals;
      if (savedCfg) {
        setCfg({
          rfqModal: { ...DEFAULT_MODALS_CONFIG.rfqModal, ...(savedCfg.rfqModal || {}) },
          producerModal: { ...DEFAULT_MODALS_CONFIG.producerModal, ...(savedCfg.producerModal || {}) },
          serviceModal: { ...DEFAULT_MODALS_CONFIG.serviceModal, ...(savedCfg.serviceModal || {}) },
          aiDeskModal: { ...DEFAULT_MODALS_CONFIG.aiDeskModal, ...(savedCfg.aiDeskModal || {}) },
          productSpecModal: { ...DEFAULT_MODALS_CONFIG.productSpecModal, ...(savedCfg.productSpecModal || {}) },
          searchModal: { ...DEFAULT_MODALS_CONFIG.searchModal, ...(savedCfg.searchModal || {}) },
          dossierModal: { ...DEFAULT_MODALS_CONFIG.dossierModal, ...(savedCfg.dossierModal || {}) },
        });
      }
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleSave = async () => {
    setSaving(true);
    const updatedContent = {
      ...contentObj,
      modalsConfig: cfg,
    };
    // Exclude products array as per CMS standards
    delete (updatedContent as any).products;

    const res = await apiPost('/api/azexbuy/content', updatedContent);
    if (res.ok) {
      setContentObj(updatedContent);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      alert(`Saxlama xətası: ${res.error || 'Naməlum xəta'}`);
    }
    setSaving(false);
  };

  const resetCurrentModal = (modalKey: keyof AllModalsConfig) => {
    if (window.confirm('Bu modalın parametrlərini ilkin standart dəyərlərə sıfırlamaq istədiyinizə əminsiniz?')) {
      setCfg((prev) => ({
        ...prev,
        [modalKey]: JSON.parse(JSON.stringify(DEFAULT_MODALS_CONFIG[modalKey])),
      }));
    }
  };

  const MODAL_TABS = [
    { key: 'rfq', label: '1. Qiymət Sorğusu (RFQ)', icon: FileText, desc: 'Alıcı RFQ forması, Incoterms, limanlar və sertifikatlar' },
    { key: 'producer', label: '2. İstehsalçı Qeydiyyatı', icon: Factory, desc: 'Müəssisə növləri, kateqoriyalar, həcmlər və mandatlar' },
    { key: 'service', label: '3. Xidmət Müraciəti', icon: Briefcase, desc: 'Müraciət forması, şirkət növləri və təcililik seçimləri' },
    { key: 'aidesk', label: '4. Trade Desk AI Çat', icon: Bot, desc: 'Salamlaşma mətni, 3D köməkçi və hazır sual düymələri (FAQ)' },
    { key: 'spec', label: '5. Məhsul Detalı (Spec)', icon: Package, desc: 'Spesifikasiya tabları, sertifikat nişanları və düymələr' },
    { key: 'search', label: '6. Qlobal Axtarış', icon: Search, desc: 'Axtarış placeholderi, trend açar sözlər və filterlər' },
    { key: 'dossier', label: '7. İxrac Dosyesi Çapı', icon: Printer, desc: 'Rəsmi ixrac sənədi, möhür və hüquqi şərtlər' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00243E] text-white flex items-center justify-center shadow-md">
              <Layers className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Modallar & Pop-up İdarəetmə Mərkəzi
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Canlı İdarəetmə
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Saytdakı bütün pop-up və modalların mətnlərini, seçimlərini (+/-), parametrlərini və xüsusiyyətlərini baştan sona tənzimləyin.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action & Language Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Active Locale Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Dil:</span>
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setSelectedLoc(l)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedLoc === l
                    ? 'bg-[#00243E] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#00B58D] hover:bg-[#009e7a] active:bg-[#008969] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Yadda saxlanılır...</span>
              </>
            ) : saved ? (
              <>
                <CheckCircle className="w-4 h-4 text-white" />
                <span>Saxlanıldı!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-white" />
                <span>Dəyişiklikləri Yadda Saxla</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Tabs Sidebar, Right Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
              Tənzimlənəcək Modalı Seçin
            </p>
            {MODAL_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeModalKey === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveModalKey(tab.key)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 cursor-pointer group ${
                    isActive
                      ? 'bg-[#00243E] text-white shadow-md'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent hover:border-slate-100'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      isActive ? 'bg-white/10 text-emerald-300' : 'bg-slate-100 text-slate-500 group-hover:text-[#00243E]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-800'}`}>
                      {tab.label}
                    </h3>
                    <p className={`text-[11px] mt-1 line-clamp-1 leading-relaxed ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                      {tab.desc}
                    </p>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 mt-1 transition-transform ${
                      isActive ? 'text-emerald-400 translate-x-0.5' : 'text-slate-300 opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Quick Help Card */}
          <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 border border-emerald-100/60 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Dinamik Xüsusiyyət Sistemi</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Burada əlavə etdiyiniz və ya sildiyiniz bütün Incotermlər, sertifikatlar, daşıma növləri və digər seçimlər saytın canlı pop-up pəncərələrində anında görünür.
            </p>
          </div>
        </div>

        {/* Editor Main Content Area */}
        <div className="lg:col-span-8 space-y-5">
          {/* ═══════════════════════════════════════════════════════════
              1. RFQ BUILDER MODAL EDITOR
              ═══════════════════════════════════════════════════════════ */}
          {activeModalKey === 'rfq' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">1. İxrac Qiymət Sorğusu Modalı (RFQ Builder)</h2>
                    <p className="text-xs text-slate-500">Alıcıların qiymət təklifi istədiyi rəsmi RFQ pəncərəsinin tənzimləmələri</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => resetCurrentModal('rfqModal')}
                  className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Standart vəziyyətə sıfırla"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Sıfırla</span>
                </button>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Modal Başlığı ({selectedLoc})
                  </label>
                  <input
                    type="text"
                    value={cfg.rfqModal.title[selectedLoc] || ''}
                    onChange={(e) =>
                      setCfg((prev) => ({
                        ...prev,
                        rfqModal: {
                          ...prev.rfqModal,
                          title: { ...prev.rfqModal.title, [selectedLoc]: e.target.value },
                        },
                      }))
                    }
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alt Başlıq / İzah ({selectedLoc})
                  </label>
                  <textarea
                    rows={2}
                    value={cfg.rfqModal.subtitle[selectedLoc] || ''}
                    onChange={(e) =>
                      setCfg((prev) => ({
                        ...prev,
                        rfqModal: {
                          ...prev.rfqModal,
                          subtitle: { ...prev.rfqModal.subtitle, [selectedLoc]: e.target.value },
                        },
                      }))
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Təsdiq Düyməsi Mətni ({selectedLoc})
                  </label>
                  <input
                    type="text"
                    value={cfg.rfqModal.submitButton[selectedLoc] || ''}
                    onChange={(e) =>
                      setCfg((prev) => ({
                        ...prev,
                        rfqModal: {
                          ...prev.rfqModal,
                          submitButton: { ...prev.rfqModal.submitButton, [selectedLoc]: e.target.value },
                        },
                      }))
                    }
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Incoterms (+/-) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Ticarət Qaydaları (Incoterms 2020)</h3>
                    <p className="text-[11px] text-slate-500">RFQ-da alıcıya təklif olunan Incoterm seçimləri</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {cfg.rfqModal.incoterms.length} seçim
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {cfg.rfqModal.incoterms.map((inc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-2xs group"
                    >
                      <span>{inc}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCfg((prev) => ({
                            ...prev,
                            rfqModal: {
                              ...prev.rfqModal,
                              incoterms: prev.rfqModal.incoterms.filter((_, i) => i !== idx),
                            },
                          }))
                        }
                        className="text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                        title="Sil"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Yeni Incoterm əlavə et (məs. DDP, FAS)..."
                    value={newIncoterm}
                    onChange={(e) => setNewIncoterm(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newIncoterm.trim()) {
                        e.preventDefault();
                        if (!cfg.rfqModal.incoterms.includes(newIncoterm.trim())) {
                          setCfg((prev) => ({
                            ...prev,
                            rfqModal: {
                              ...prev.rfqModal,
                              incoterms: [...prev.rfqModal.incoterms, newIncoterm.trim()],
                            },
                          }));
                          setNewIncoterm('');
                        }
                      }
                    }}
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newIncoterm.trim() && !cfg.rfqModal.incoterms.includes(newIncoterm.trim())) {
                        setCfg((prev) => ({
                          ...prev,
                          rfqModal: {
                            ...prev.rfqModal,
                            incoterms: [...prev.rfqModal.incoterms, newIncoterm.trim()],
                          },
                        }));
                        setNewIncoterm('');
                      }
                    }}
                    className="flex items-center gap-1 bg-[#00243E] hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Əlavə et</span>
                  </button>
                </div>
              </div>

              {/* Certificates (+/-) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Tələb Olunan Sertifikatlar Seçimləri</h3>
                    <p className="text-[11px] text-slate-500">Alıcının RFQ zamanı işarələyə biləcəyi hazır sertifikat nişanları</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {cfg.rfqModal.certificates.length} sertifikat
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {cfg.rfqModal.certificates.map((cert, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs font-medium px-3 py-1.5 rounded-lg shadow-2xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{cert}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCfg((prev) => ({
                            ...prev,
                            rfqModal: {
                              ...prev.rfqModal,
                              certificates: prev.rfqModal.certificates.filter((_, i) => i !== idx),
                            },
                          }))
                        }
                        className="text-emerald-500 hover:text-rose-500 cursor-pointer transition-colors ml-1"
                        title="Sil"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Yeni sertifikat əlavə et (məs. FDA Registration, IFS Food)..."
                    value={newCert}
                    onChange={(e) => setNewCert(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newCert.trim()) {
                        e.preventDefault();
                        if (!cfg.rfqModal.certificates.includes(newCert.trim())) {
                          setCfg((prev) => ({
                            ...prev,
                            rfqModal: {
                              ...prev.rfqModal,
                              certificates: [...prev.rfqModal.certificates, newCert.trim()],
                            },
                          }));
                          setNewCert('');
                        }
                      }
                    }}
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCert.trim() && !cfg.rfqModal.certificates.includes(newCert.trim())) {
                        setCfg((prev) => ({
                          ...prev,
                          rfqModal: {
                            ...prev.rfqModal,
                            certificates: [...prev.rfqModal.certificates, newCert.trim()],
                          },
                        }));
                        setNewCert('');
                      }
                    }}
                    className="flex items-center gap-1 bg-[#00243E] hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Əlavə et</span>
                  </button>
                </div>
              </div>

              {/* Destination Ports & Corridors (+/-) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Təyinat Limanları & Hublar</h3>
                    <p className="text-[11px] text-slate-500">RFQ-da təklif olunan dəniz/quru limanları və terminallar</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {cfg.rfqModal.destinationPorts.length} liman
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {cfg.rfqModal.destinationPorts.map((port, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 bg-blue-50/70 border border-blue-200 text-blue-900 text-xs font-medium px-3 py-1.5 rounded-lg shadow-2xs"
                    >
                      <span>{port}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCfg((prev) => ({
                            ...prev,
                            rfqModal: {
                              ...prev.rfqModal,
                              destinationPorts: prev.rfqModal.destinationPorts.filter((_, i) => i !== idx),
                            },
                          }))
                        }
                        className="text-blue-500 hover:text-rose-500 cursor-pointer transition-colors"
                        title="Sil"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Yeni liman / terminal əlavə et..."
                    value={newPort}
                    onChange={(e) => setNewPort(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPort.trim() && !cfg.rfqModal.destinationPorts.includes(newPort.trim())) {
                        setCfg((prev) => ({
                          ...prev,
                          rfqModal: {
                            ...prev.rfqModal,
                            destinationPorts: [...prev.rfqModal.destinationPorts, newPort.trim()],
                          },
                        }));
                        setNewPort('');
                      }
                    }}
                    className="flex items-center gap-1 bg-[#00243E] hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Əlavə et</span>
                  </button>
                </div>
              </div>

              {/* Flags & Validation */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-900">Form Sahələri & Qaydalar</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cfg.rfqModal.flags.requirePhone}
                      onChange={(e) =>
                        setCfg((prev) => ({
                          ...prev,
                          rfqModal: {
                            ...prev.rfqModal,
                            flags: { ...prev.rfqModal.flags, requirePhone: e.target.checked },
                          },
                        }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-700">Telefon nömrəsi məcburi olsun</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cfg.rfqModal.flags.allowCustomCertificates}
                      onChange={(e) =>
                        setCfg((prev) => ({
                          ...prev,
                          rfqModal: {
                            ...prev.rfqModal,
                            flags: { ...prev.rfqModal.flags, allowCustomCertificates: e.target.checked },
                          },
                        }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-700">Alıcı fərdi sertifikat adı yaza bilsin</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              2. PRODUCER ONBOARDING MODAL EDITOR
              ═══════════════════════════════════════════════════════════ */}
          {activeModalKey === 'producer' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Factory className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">2. İstehsalçı Qeydiyyatı Modalı</h2>
                    <p className="text-xs text-slate-500">Azərbaycanlı istehsalçı və ixracatçıların qeydiyyat pop-up pəncərəsi</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => resetCurrentModal('producerModal')}
                  className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Sıfırla</span>
                </button>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Modal Başlığı ({selectedLoc})
                  </label>
                  <input
                    type="text"
                    value={cfg.producerModal.title[selectedLoc] || ''}
                    onChange={(e) =>
                      setCfg((prev) => ({
                        ...prev,
                        producerModal: {
                          ...prev.producerModal,
                          title: { ...prev.producerModal.title, [selectedLoc]: e.target.value },
                        },
                      }))
                    }
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alt Başlıq ({selectedLoc})
                  </label>
                  <textarea
                    rows={2}
                    value={cfg.producerModal.subtitle[selectedLoc] || ''}
                    onChange={(e) =>
                      setCfg((prev) => ({
                        ...prev,
                        producerModal: {
                          ...prev.producerModal,
                          subtitle: { ...prev.producerModal.subtitle, [selectedLoc]: e.target.value },
                        },
                      }))
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Qeydiyyat Düyməsi Mətni ({selectedLoc})
                  </label>
                  <input
                    type="text"
                    value={cfg.producerModal.submitButton[selectedLoc] || ''}
                    onChange={(e) =>
                      setCfg((prev) => ({
                        ...prev,
                        producerModal: {
                          ...prev.producerModal,
                          submitButton: { ...prev.producerModal.submitButton, [selectedLoc]: e.target.value },
                        },
                      }))
                    }
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Enterprise Types (+/-) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Müəssisə / Təşkilati-Hüquqi Formalar</h3>
                    <p className="text-[11px] text-slate-500">Qeydiyyat zamanı seçilən müəssisə tipləri (MMC, ASC və s.)</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {cfg.producerModal.enterpriseTypes.length} növ
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {cfg.producerModal.enterpriseTypes.map((type, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs"
                    >
                      <span>{type}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCfg((prev) => ({
                            ...prev,
                            producerModal: {
                              ...prev.producerModal,
                              enterpriseTypes: prev.producerModal.enterpriseTypes.filter((_, i) => i !== idx),
                            },
                          }))
                        }
                        className="text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Yeni hüquqi forma əlavə et..."
                    value={newEnterpriseType}
                    onChange={(e) => setNewEnterpriseType(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newEnterpriseType.trim() && !cfg.producerModal.enterpriseTypes.includes(newEnterpriseType.trim())) {
                        setCfg((prev) => ({
                          ...prev,
                          producerModal: {
                            ...prev.producerModal,
                            enterpriseTypes: [...prev.producerModal.enterpriseTypes, newEnterpriseType.trim()],
                          },
                        }));
                        setNewEnterpriseType('');
                      }
                    }}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Əlavə et</span>
                  </button>
                </div>
              </div>

              {/* Product Categories (+/-) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">İxrac Məhsul Kateqoriyaları</h3>
                    <p className="text-[11px] text-slate-500">İstehsalçının seçə biləcəyi əsas ixrac kateqoriyaları</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {cfg.producerModal.productCategories.length} kateqoriya
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {cfg.producerModal.productCategories.map((cat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs font-medium px-3 py-1.5 rounded-lg shadow-2xs"
                    >
                      <span>{cat}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCfg((prev) => ({
                            ...prev,
                            producerModal: {
                              ...prev.producerModal,
                              productCategories: prev.producerModal.productCategories.filter((_, i) => i !== idx),
                            },
                          }))
                        }
                        className="text-emerald-500 hover:text-rose-500 cursor-pointer transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Yeni məhsul kateqoriyası əlavə et..."
                    value={newProdCat}
                    onChange={(e) => setNewProdCat(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newProdCat.trim() && !cfg.producerModal.productCategories.includes(newProdCat.trim())) {
                        setCfg((prev) => ({
                          ...prev,
                          producerModal: {
                            ...prev.producerModal,
                            productCategories: [...prev.producerModal.productCategories, newProdCat.trim()],
                          },
                        }));
                        setNewProdCat('');
                      }
                    }}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Əlavə et</span>
                  </button>
                </div>
              </div>

              {/* Target Markets (+/-) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Hədəf İxrac Bazarları</h3>
                    <p className="text-[11px] text-slate-500">İstehsalçının ixrac etmək istədiyi regionlar</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {cfg.producerModal.targetMarkets.length} region
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {cfg.producerModal.targetMarkets.map((market, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 bg-blue-50/70 border border-blue-200 text-blue-900 text-xs font-medium px-3 py-1.5 rounded-lg shadow-2xs"
                    >
                      <span>{market}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCfg((prev) => ({
                            ...prev,
                            producerModal: {
                              ...prev.producerModal,
                              targetMarkets: prev.producerModal.targetMarkets.filter((_, i) => i !== idx),
                            },
                          }))
                        }
                        className="text-blue-500 hover:text-rose-500 cursor-pointer transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Yeni hədəf bazar əlavə et..."
                    value={newTargetMarket}
                    onChange={(e) => setNewTargetMarket(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newTargetMarket.trim() && !cfg.producerModal.targetMarkets.includes(newTargetMarket.trim())) {
                        setCfg((prev) => ({
                          ...prev,
                          producerModal: {
                            ...prev.producerModal,
                            targetMarkets: [...prev.producerModal.targetMarkets, newTargetMarket.trim()],
                          },
                        }));
                        setNewTargetMarket('');
                      }
                    }}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Əlavə et</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              3. SERVICE APPLICATION MODAL EDITOR
              ═══════════════════════════════════════════════════════════ */}
          {activeModalKey === 'service' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">3. Xidmət Müraciəti Modalı</h2>
                    <p className="text-xs text-slate-500">Ticarət, logistika və hüquqi xidmətlər üçün pop-up müraciət pəncərəsi</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => resetCurrentModal('serviceModal')}
                  className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Sıfırla</span>
                </button>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Modal Başlığı ({selectedLoc})
                  </label>
                  <input
                    type="text"
                    value={cfg.serviceModal.title[selectedLoc] || ''}
                    onChange={(e) =>
                      setCfg((prev) => ({
                        ...prev,
                        serviceModal: {
                          ...prev.serviceModal,
                          title: { ...prev.serviceModal.title, [selectedLoc]: e.target.value },
                        },
                      }))
                    }
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alt Başlıq ({selectedLoc})
                  </label>
                  <textarea
                    rows={2}
                    value={cfg.serviceModal.subtitle[selectedLoc] || ''}
                    onChange={(e) =>
                      setCfg((prev) => ({
                        ...prev,
                        serviceModal: {
                          ...prev.serviceModal,
                          subtitle: { ...prev.serviceModal.subtitle, [selectedLoc]: e.target.value },
                        },
                      }))
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Göndər Düyməsi Mətni ({selectedLoc})
                  </label>
                  <input
                    type="text"
                    value={cfg.serviceModal.submitButton[selectedLoc] || ''}
                    onChange={(e) =>
                      setCfg((prev) => ({
                        ...prev,
                        serviceModal: {
                          ...prev.serviceModal,
                          submitButton: { ...prev.serviceModal.submitButton, [selectedLoc]: e.target.value },
                        },
                      }))
                    }
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Company Types (+/-) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Müraciət Edən Şirkət Tipləri</h3>
                    <p className="text-[11px] text-slate-500">Müraciətçinin seçə biləcəyi şirkət fəaliyyət növləri</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {cfg.serviceModal.companyTypes.length} tip
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {cfg.serviceModal.companyTypes.map((type, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 bg-amber-50/70 border border-amber-200 text-amber-900 text-xs font-medium px-3 py-1.5 rounded-lg shadow-2xs"
                    >
                      <span>{type}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCfg((prev) => ({
                            ...prev,
                            serviceModal: {
                              ...prev.serviceModal,
                              companyTypes: prev.serviceModal.companyTypes.filter((_, i) => i !== idx),
                            },
                          }))
                        }
                        className="text-amber-500 hover:text-rose-500 cursor-pointer transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Yeni şirkət tipi əlavə et..."
                    value={newCompanyType}
                    onChange={(e) => setNewCompanyType(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCompanyType.trim() && !cfg.serviceModal.companyTypes.includes(newCompanyType.trim())) {
                        setCfg((prev) => ({
                          ...prev,
                          serviceModal: {
                            ...prev.serviceModal,
                            companyTypes: [...prev.serviceModal.companyTypes, newCompanyType.trim()],
                          },
                        }));
                        setNewCompanyType('');
                      }
                    }}
                    className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Əlavə et</span>
                  </button>
                </div>
              </div>

              {/* Urgency Levels (+/-) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Təcililik Dərəcələri</h3>
                    <p className="text-[11px] text-slate-500">Müraciətin icra müddəti və təcililik seçimləri</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {cfg.serviceModal.urgencyLevels.length} dərəcə
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {cfg.serviceModal.urgencyLevels.map((lvl, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium px-3 py-1.5 rounded-lg shadow-2xs"
                    >
                      <span>{lvl}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCfg((prev) => ({
                            ...prev,
                            serviceModal: {
                              ...prev.serviceModal,
                              urgencyLevels: prev.serviceModal.urgencyLevels.filter((_, i) => i !== idx),
                            },
                          }))
                        }
                        className="text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Yeni təcililik dərəcəsi əlavə et..."
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newUrgency.trim() && !cfg.serviceModal.urgencyLevels.includes(newUrgency.trim())) {
                        setCfg((prev) => ({
                          ...prev,
                          serviceModal: {
                            ...prev.serviceModal,
                            urgencyLevels: [...prev.serviceModal.urgencyLevels, newUrgency.trim()],
                          },
                        }));
                        setNewUrgency('');
                      }
                    }}
                    className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Əlavə et</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              4. TRADE DESK AI MODAL EDITOR
              ═══════════════════════════════════════════════════════════ */}
          {activeModalKey === 'aidesk' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">4. AZEXBUY Trade Desk AI Çat Modalı</h2>
                    <p className="text-xs text-slate-500">3D AI ticarət köməkçisi, açılış mətni və tez-tez soruşulan suallar (FAQ chips)</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => resetCurrentModal('aiDeskModal')}
                  className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Sıfırla</span>
                </button>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pəncərə Başlığı ({selectedLoc})
                  </label>
                  <input
                    type="text"
                    value={cfg.aiDeskModal.title[selectedLoc] || ''}
                    onChange={(e) =>
                      setCfg((prev) => ({
                        ...prev,
                        aiDeskModal: {
                          ...prev.aiDeskModal,
                          title: { ...prev.aiDeskModal.title, [selectedLoc]: e.target.value },
                        },
                      }))
                    }
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Köməkçi Statusu / Alt Başlıq ({selectedLoc})
                  </label>
                  <input
                    type="text"
                    value={cfg.aiDeskModal.subtitle[selectedLoc] || ''}
                    onChange={(e) =>
                      setCfg((prev) => ({
                        ...prev,
                        aiDeskModal: {
                          ...prev.aiDeskModal,
                          subtitle: { ...prev.aiDeskModal.subtitle, [selectedLoc]: e.target.value },
                        },
                      }))
                    }
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* 3D Avatar Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3D Robot / Assistant Avatar Görsəli URL
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={cfg.aiDeskModal.avatarUrl}
                    alt="Assistant Avatar"
                    className="w-10 h-10 object-contain p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0"
                  />
                  <input
                    type="text"
                    value={cfg.aiDeskModal.avatarUrl}
                    onChange={(e) =>
                      setCfg((prev) => ({
                        ...prev,
                        aiDeskModal: { ...prev.aiDeskModal, avatarUrl: e.target.value },
                      }))
                    }
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Greeting Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  İlk Salamlaşma & Təqdimat Mətni ({selectedLoc})
                </label>
                <textarea
                  rows={3}
                  value={cfg.aiDeskModal.greetingMessage[selectedLoc] || ''}
                  onChange={(e) =>
                    setCfg((prev) => ({
                      ...prev,
                      aiDeskModal: {
                        ...prev.aiDeskModal,
                        greetingMessage: { ...prev.aiDeskModal.greetingMessage, [selectedLoc]: e.target.value },
                      },
                    }))
                  }
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
                />
              </div>

              {/* FAQ Chips (+/-) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Hazır Mövzu & Sual Düymələri ({selectedLoc})</h3>
                    <p className="text-[11px] text-slate-500">İstifadəçinin bir kliklə bota yönləndirə biləcəyi hazır mövzular</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {(cfg.aiDeskModal.faqChips[selectedLoc] || []).length} sual
                  </span>
                </div>

                <div className="space-y-2">
                  {(cfg.aiDeskModal.faqChips[selectedLoc] || []).map((faq, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <span className="font-medium text-slate-700 flex-1">{faq.q}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCfg((prev) => {
                            const list = prev.aiDeskModal.faqChips[selectedLoc] || [];
                            return {
                              ...prev,
                              aiDeskModal: {
                                ...prev.aiDeskModal,
                                faqChips: {
                                  ...prev.aiDeskModal.faqChips,
                                  [selectedLoc]: list.filter((_, i) => i !== idx),
                                },
                              },
                            };
                          })
                        }
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder={`Yeni hazır mövzu / sual əlavə et (${selectedLoc})...`}
                    value={newFaqQ}
                    onChange={(e) => setNewFaqQ(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newFaqQ.trim()) {
                        setCfg((prev) => {
                          const currentList = prev.aiDeskModal.faqChips[selectedLoc] || [];
                          return {
                            ...prev,
                            aiDeskModal: {
                              ...prev.aiDeskModal,
                              faqChips: {
                                ...prev.aiDeskModal.faqChips,
                                [selectedLoc]: [...currentList, { q: newFaqQ.trim() }],
                              },
                            },
                          };
                        });
                        setNewFaqQ('');
                      }
                    }}
                    className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Əlavə et</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              5. PRODUCT SPEC MODAL EDITOR
              ═══════════════════════════════════════════════════════════ */}
          {activeModalKey === 'spec' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">5. Məhsul Detalı və Spesifikasiya Modalı</h2>
                    <p className="text-xs text-slate-500">Məhsul kartına kliklədikdə açılan texniki detal və spesifikasiya pəncərəsi</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => resetCurrentModal('productSpecModal')}
                  className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Sıfırla</span>
                </button>
              </div>

              {/* Action Buttons Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    RFQ Düyməsi Mətni ({selectedLoc})
                  </label>
                  <input
                    type="text"
                    value={cfg.productSpecModal.rfqButtonText[selectedLoc] || ''}
                    onChange={(e) =>
                      setCfg((prev) => ({
                        ...prev,
                        productSpecModal: {
                          ...prev.productSpecModal,
                          rfqButtonText: { ...prev.productSpecModal.rfqButtonText, [selectedLoc]: e.target.value },
                        },
                      }))
                    }
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    İstehsalçı ilə Əlaqə Düyməsi ({selectedLoc})
                  </label>
                  <input
                    type="text"
                    value={cfg.productSpecModal.contactButtonText[selectedLoc] || ''}
                    onChange={(e) =>
                      setCfg((prev) => ({
                        ...prev,
                        productSpecModal: {
                          ...prev.productSpecModal,
                          contactButtonText: { ...prev.productSpecModal.contactButtonText, [selectedLoc]: e.target.value },
                        },
                      }))
                    }
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Spec Tabs Management (+/-) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Spesifikasiya Tabları</h3>
                    <p className="text-[11px] text-slate-500">Məhsul pəncərəsindəki tab bölmələri və adları</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {cfg.productSpecModal.tabs.length} tab
                  </span>
                </div>

                <div className="space-y-2">
                  {cfg.productSpecModal.tabs.map((tab, idx) => (
                    <div
                      key={tab.id}
                      className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <div className="flex items-center gap-2.5 flex-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase w-16">{tab.id}:</span>
                        <input
                          type="text"
                          value={tab.label[selectedLoc] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCfg((prev) => {
                              const nextTabs = [...prev.productSpecModal.tabs];
                              nextTabs[idx] = {
                                ...nextTabs[idx],
                                label: { ...nextTabs[idx].label, [selectedLoc]: val },
                              };
                              return {
                                ...prev,
                                productSpecModal: { ...prev.productSpecModal, tabs: nextTabs },
                              };
                            });
                          }}
                          className="flex-1 text-xs font-semibold px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tab.enabled}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setCfg((prev) => {
                              const nextTabs = [...prev.productSpecModal.tabs];
                              nextTabs[idx] = { ...nextTabs[idx], enabled: checked };
                              return {
                                ...prev,
                                productSpecModal: { ...prev.productSpecModal, tabs: nextTabs },
                              };
                            });
                          }}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-[11px] font-bold">Aktiv</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              6. GLOBAL SEARCH MODAL EDITOR
              ═══════════════════════════════════════════════════════════ */}
          {activeModalKey === 'search' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">6. Qlobal Axtarış Modalı</h2>
                    <p className="text-xs text-slate-500">Üst naviqasiyada axtarış düyməsinə klikləndikdə açılan qlobal axtarış pəncərəsi</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => resetCurrentModal('searchModal')}
                  className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Sıfırla</span>
                </button>
              </div>

              {/* Placeholder text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Axtarış Girişi Placeholder Mətni ({selectedLoc})
                </label>
                <input
                  type="text"
                  value={cfg.searchModal.placeholder[selectedLoc] || ''}
                  onChange={(e) =>
                    setCfg((prev) => ({
                      ...prev,
                      searchModal: {
                        ...prev.searchModal,
                        placeholder: { ...prev.searchModal.placeholder, [selectedLoc]: e.target.value },
                      },
                    }))
                  }
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Trending Search Tags (+/-) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Trend Axtarış Teqləri (Populyar Axtarışlar)</h3>
                    <p className="text-[11px] text-slate-500">Axtarış açıldıqda təklif olunan ən çox axtarılan etiketlər</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {cfg.searchModal.trendingTags.length} teq
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {cfg.searchModal.trendingTags.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 bg-indigo-50/70 border border-indigo-200 text-indigo-900 text-xs font-medium px-3 py-1.5 rounded-lg shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>{item.tag}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCfg((prev) => ({
                            ...prev,
                            searchModal: {
                              ...prev.searchModal,
                              trendingTags: prev.searchModal.trendingTags.filter((_, i) => i !== idx),
                            },
                          }))
                        }
                        className="text-indigo-400 hover:text-rose-500 cursor-pointer transition-colors ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Yeni populyar axtarış teqi əlavə et..."
                    value={newTrendingTag}
                    onChange={(e) => setNewTrendingTag(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newTrendingTag.trim()) {
                        setCfg((prev) => ({
                          ...prev,
                          searchModal: {
                            ...prev.searchModal,
                            trendingTags: [
                              ...prev.searchModal.trendingTags,
                              { tag: newTrendingTag.trim(), query: newTrendingTag.trim().toLowerCase() },
                            ],
                          },
                        }));
                        setNewTrendingTag('');
                      }
                    }}
                    className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Əlavə et</span>
                  </button>
                </div>
              </div>

              {/* Empty State Strings */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h3 className="text-xs font-bold text-slate-900">Nəticə Tapılmadıqda Mesaj ({selectedLoc})</h3>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Boş Nəticə Başlığı</label>
                  <input
                    type="text"
                    value={cfg.searchModal.emptyStateTitle[selectedLoc] || ''}
                    onChange={(e) =>
                      setCfg((prev) => ({
                        ...prev,
                        searchModal: {
                          ...prev.searchModal,
                          emptyStateTitle: { ...prev.searchModal.emptyStateTitle, [selectedLoc]: e.target.value },
                        },
                      }))
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Boş Nəticə İzahı</label>
                  <textarea
                    rows={2}
                    value={cfg.searchModal.emptyStateDesc[selectedLoc] || ''}
                    onChange={(e) =>
                      setCfg((prev) => ({
                        ...prev,
                        searchModal: {
                          ...prev.searchModal,
                          emptyStateDesc: { ...prev.searchModal.emptyStateDesc, [selectedLoc]: e.target.value },
                        },
                      }))
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              7. PRINTABLE DOSSIER MODAL EDITOR
              ═══════════════════════════════════════════════════════════ */}
          {activeModalKey === 'dossier' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">7. İxrac Dosyesi Çap & PDF Modalı</h2>
                    <p className="text-xs text-slate-500">Məhsul dosyesinin rəsmi sənəd formatında çapı və ixrac parametrləri</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => resetCurrentModal('dossierModal')}
                  className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Sıfırla</span>
                </button>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dosye Sənəd Başlığı ({selectedLoc})
                  </label>
                  <input
                    type="text"
                    value={cfg.dossierModal.title[selectedLoc] || ''}
                    onChange={(e) =>
                      setCfg((prev) => ({
                        ...prev,
                        dossierModal: {
                          ...prev.dossierModal,
                          title: { ...prev.dossierModal.title, [selectedLoc]: e.target.value },
                        },
                      }))
                    }
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sənəd İzahı / Alt Başlıq ({selectedLoc})
                  </label>
                  <textarea
                    rows={2}
                    value={cfg.dossierModal.subtitle[selectedLoc] || ''}
                    onChange={(e) =>
                      setCfg((prev) => ({
                        ...prev,
                        dossierModal: {
                          ...prev.dossierModal,
                          subtitle: { ...prev.dossierModal.subtitle, [selectedLoc]: e.target.value },
                        },
                      }))
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rəsmi Təsdiq Möhürü Mətni ({selectedLoc})
                  </label>
                  <input
                    type="text"
                    value={cfg.dossierModal.officialSealText[selectedLoc] || ''}
                    onChange={(e) =>
                      setCfg((prev) => ({
                        ...prev,
                        dossierModal: {
                          ...prev.dossierModal,
                          officialSealText: { ...prev.dossierModal.officialSealText, [selectedLoc]: e.target.value },
                        },
                      }))
                    }
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hüquqi Qeyd & Şərtlər ({selectedLoc})
                  </label>
                  <textarea
                    rows={2}
                    value={cfg.dossierModal.termsNote[selectedLoc] || ''}
                    onChange={(e) =>
                      setCfg((prev) => ({
                        ...prev,
                        dossierModal: {
                          ...prev.dossierModal,
                          termsNote: { ...prev.dossierModal.termsNote, [selectedLoc]: e.target.value },
                        },
                      }))
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
