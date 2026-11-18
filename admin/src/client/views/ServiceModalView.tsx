import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Layers, Eye, Globe, Sliders, CheckCircle, RefreshCw, Save,
  AlertCircle, Briefcase, Check, ExternalLink, RotateCcw
} from 'lucide-react';
import { UiLanguage } from '../types';
import { ModalEmailSelector } from '../components/ModalEmailSelector';

interface ServiceModalViewProps {
  uiLang: UiLanguage;
}

const LOCALES = ['AZ', 'EN', 'TR', 'RU', 'AR', 'ES'] as const;
type LocaleKey = typeof LOCALES[number];

const LOCALE_LABELS: Record<LocaleKey, string> = {
  AZ: 'Azərbaycanca (AZ)',
  EN: 'English (EN)',
  TR: 'Türkçe (TR)',
  RU: 'Русский (RU)',
  AR: 'العربية (AR)',
  ES: 'Español (ES)',
};

export const DEFAULT_SERVICE_MODAL_CONFIG = {
  enabled: true,
  notificationEmail: 'export@azexbuy.com',
  title: {
    AZ: 'Xidmət Müraciəti Formu',
    EN: 'Service Application Form',
    TR: 'Hizmet Başvuru Formu',
    RU: 'Форма заявки на услугу',
    AR: 'نموذج طلب الخدمة',
    ES: 'Formulario de Solicitud de Servicios',
  },
  subtitle: {
    AZ: 'AZEXBUY ticarət, logistika və hüquqi konsaltinq xidmətləri üçün rəsmi müraciət edin. Mütəxəssislərimiz 24 saat ərzində sizinlə əlaqə saxlayacaq.',
    EN: 'Submit an official application for AZEXBUY trade, logistics, and legal consulting services. Our specialists will contact you within 24 hours.',
    TR: 'AZEXBUY ticaret, lojistik ve hukuki danışmanlık hizmetleri için resmi başvuruda bulunun. Uzmanlarımız 24 saat içinde sizinle iletişime geçecektir.',
    RU: 'Подайте официальную заявку на торговые, логистические и юридические консультационные услуги AZEXBUY. Наши специалисты свяжутся с вами в течение 24 часов.',
    AR: 'قدم طلباً رسمياً لخدمات التجارة واللوجستيات والاستشارات القانونية من AZEXBUY. سيتواصل معك خبراؤنا خلال 24 ساعة.',
    ES: 'Presente una solicitud oficial para los servicios comerciales, logísticos y de consultoría legal de AZEXBUY. Nuestros especialistas se comunicarán con usted en 24 horas.',
  },
  fullNameLabel: {
    AZ: 'Ad Soyad',
    EN: 'Full Name',
    TR: 'Ad Soyad',
    RU: 'Имя и фамилия',
    AR: 'الاسم الكامل',
    ES: 'Nombre completo',
  },
  companyLabel: {
    AZ: 'Şirkət adı',
    EN: 'Company Name',
    TR: 'Şirket Adı',
    RU: 'Название компании',
    AR: 'اسم الشركة',
    ES: 'Nombre de empresa',
  },
  countryLabel: {
    AZ: 'Ölkə',
    EN: 'Country',
    TR: 'Ülke',
    RU: 'Страна',
    AR: 'الدولة',
    ES: 'País',
  },
  emailLabel: {
    AZ: 'E-poçt',
    EN: 'Email',
    TR: 'E-posta',
    RU: 'Эл. почта',
    AR: 'البريد الإلكتروني',
    ES: 'Correo electrónico',
  },
  phoneLabel: {
    AZ: 'Telefon',
    EN: 'Phone',
    TR: 'Telefon',
    RU: 'Телефон',
    AR: 'الهاتف',
    ES: 'Teléfono',
  },
  servicesLabel: {
    AZ: 'Müraciət edilən xidmət',
    EN: 'Requested Service',
    TR: 'Başvurulan Hizmet',
    RU: 'Выбранная услуга',
    AR: 'الخدمة المطلوبة',
    ES: 'Servicio Solicitado',
  },
  selectedBadge: {
    AZ: 'Seçildi',
    EN: 'Selected',
    TR: 'Seçildi',
    RU: 'Выбрано',
    AR: 'تم الاختيار',
    ES: 'Seleccionado',
  },
  detailsLabel: {
    AZ: 'Müraciətin təfərrüatları',
    EN: 'Application Details',
    TR: 'Başvurunun ayrıntıları',
    RU: 'Детали заявки',
    AR: 'تفاصيل الطلب',
    ES: 'Detalles de la solicitud',
  },
  detailsPlaceholder: {
    AZ: 'Əlavə qeydləriniz və ya xüsusi tələbləriniz...',
    EN: 'Your additional notes or specific requirements...',
    TR: 'Ek notlarınız veya özel gereksinimleriniz...',
    RU: 'Дополнительные примечания или особые требования...',
    AR: 'ملاحظاتك الإضافية أو متطلباتك الخاصة...',
    ES: 'Sus notas adicionales o requisitos específicos...',
  },
  submitButton: {
    AZ: 'Müraciəti göndər',
    EN: 'Submit Application',
    TR: 'Başvuruyu Gönder',
    RU: 'Отправить заявку',
    AR: 'إرسال الطلب',
    ES: 'Enviar solicitud',
  },
  cancelButton: {
    AZ: 'Ləğv et',
    EN: 'Cancel',
    TR: 'İptal',
    RU: 'Отмена',
    AR: 'إلغاء',
    ES: 'Cancelar',
  },
  successMessage: {
    AZ: 'Müraciətiniz uğurla göndərildi!',
    EN: 'Your application was submitted successfully!',
    TR: 'Başvurunuz başarıyla gönderildi!',
    RU: 'Ваша заявка успешно отправлена!',
    AR: 'تم إرسال طلبك بنجاح!',
    ES: '¡Su solicitud fue enviada con éxito!',
  },
};

export const DEFAULT_SITE_SERVICES = [
  {
    id: 'srv-market-access',
    title: {
      AZ: 'Bazarlara Çıxış',
      EN: 'Market Access',
      TR: 'Pazarlara Erişim',
      RU: 'Выход на рынки',
      AR: 'الوصول إلى الأسواق',
      ES: 'Acceso al Mercado',
    },
    targetAudience: {
      AZ: 'Strateji ixrac marşrutlarının modelləşdirilməsi, tarif təhlili və tənzimləyici uyğunluq.',
      EN: 'Strategic export route modeling, tariff analysis and regulatory compliance.',
      TR: 'Stratejik ihracat rotalarının modellenmesi, tarife analizi ve mevzuat uyumluluğu.',
      RU: 'Моделирование стратегических маршрутов экспорта, тарифный анализ и соответствие требованиям.',
      AR: 'نمذجة مسارات التصدير الاستراتيجية وتحليل التعرفة الجمركية والامتثال التنظيمي.',
      ES: 'Modelado de rutas estratégicas de exportación, análisis arancelario y cumplimiento normativo.',
    },
    iconClass: 'fa-solid fa-leaf',
    colorClass: 'bg-emerald-500',
  },
  {
    id: 'srv-buyer-sourcing',
    title: {
      AZ: 'Alıcı Axtarışı və Satış',
      EN: 'Buyer Sourcing & Sales',
      TR: 'Alıcı Temini ve Satış',
      RU: 'Поиск покупателей и сбыт',
      AR: 'البحث عن المشترين والمبيعات',
      ES: 'Búsqueda de Compradores y Ventas',
    },
    targetAudience: {
      AZ: 'Yoxlanılmış beynəlxalq satınalma mərkəzləri və distribütorlarla birbaşa B2B əlaqələr.',
      EN: 'Direct B2B connections with verified international procurement centers and distributors.',
      TR: 'Doğrulanmış uluslararası satın alma merkezleri ve distribütörlerle doğrudan B2B temaslar.',
      RU: 'Прямые B2B-контакты с проверенными международными центрами закупок и дистрибьюторами.',
      AR: 'اتصالات مباشرة للشركات مع مراكز الشراء والموزعين الدوليين المعتمدين.',
      ES: 'Conexiones B2B directas con centros de compras y distribuidores internacionales verificados.',
    },
    iconClass: 'fa-regular fa-address-book',
    colorClass: 'bg-sky-600',
  },
  {
    id: 'srv-export-mgmt',
    title: {
      AZ: 'İxracın İdarə Edilməsi',
      EN: 'Export Management',
      TR: 'İhracat Yönetimi',
      RU: 'Управление экспортом',
      AR: 'إدارة التصدير',
      ES: 'Gestión de Exportaciones',
    },
    targetAudience: {
      AZ: 'Tam tənzimləyici uyğunluq, fitosanitar sertifikatlar, mənşə sənədləri və gömrük rəsmiləşdirilməsi.',
      EN: 'Full regulatory compliance, phytosanitary certificates, origin documents and customs clearance.',
      TR: 'Tam mevzuat uyumu, fitosaniter sertifikaları, menşe belgeleri ve gümrükleme.',
      RU: 'Полное соблюдение нормативных требований, фитосанитарные сертификаты, документы происхождения и таможенное оформление.',
      AR: 'الامتثال التنظيمي الكامل والشهادات الصحية النباتية ووثائق المنشأ والتخليص الجمركي.',
      ES: 'Cumplimiento normativo total, certificados fitosanitarios, documentos de origen y despacho de aduanas.',
    },
    iconClass: 'fa-solid fa-boxes-stacked',
    colorClass: 'bg-purple-600',
  },
  {
    id: 'srv-intl-logistics',
    title: {
      AZ: 'Beynəlxalq Logistika',
      EN: 'International Logistics',
      TR: 'Uluslararası Lojistik',
      RU: 'Международная логистика',
      AR: 'اللوجستيات الدولية',
      ES: 'Logística Internacional',
    },
    targetAudience: {
      AZ: 'Orta Dəhliz (TİTR), Ələt Bakı Beynəlxalq Dəniz Ticarət Limanı və BTQ dəmir yolu ilə multimodal daşıma.',
      EN: 'Multimodal freight via Middle Corridor (TITR), Port of Baku (Alat) and BTK railway.',
      TR: 'Orta Koridor (TITR), Bakü Uluslararası Deniz Ticaret Limanı (Alat) ve BTK demiryolu ile multimodal taşımacılık.',
      RU: 'Мультимодальные перевозки через Средний коридор (ТИТР), Бакинский порт в Аляте и железную дорогу БТК.',
      AR: 'النقل المتعدد الوسائط عبر الممر الأوسط وميناء باكو (ألات) وخط سكة حديد باكو-تبليسي-قارس.',
      ES: 'Transporte multimodal a través del Corredor Medio (TITR), el Puerto de Alat y el ferrocarril BTK.',
    },
    iconClass: 'fa-solid fa-truck-fast',
    colorClass: 'bg-amber-500',
  },
];

export const ServiceModalView: React.FC<ServiceModalViewProps> = () => {
  const [activeTab, setActiveTab] = useState<'headers' | 'services' | 'preview'>('headers');
  const [selectedLang, setSelectedLang] = useState<LocaleKey>('AZ');
  const [previewLocale, setPreviewLocale] = useState<LocaleKey>('AZ');
  const [previewServiceId, setPreviewServiceId] = useState<string>('srv-market-access');
  const [previewSuccessState, setPreviewSuccessState] = useState<boolean>(false);

  // Configuration and services state
  const [modalConfig, setModalConfig] = useState<any>(DEFAULT_SERVICE_MODAL_CONFIG);
  const [siteServices, setSiteServices] = useState<any[]>(DEFAULT_SITE_SERVICES);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getAuthToken = () =>
    localStorage.getItem('octotech_admin_jwt') || sessionStorage.getItem('octotech_admin_jwt') || '';

  // Load content & services
  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/azexbuy/content');
      if (res.ok) {
        const data = await res.json();
        if (data.modalsConfig?.serviceModal) {
          setModalConfig((prev: any) => ({
            ...prev,
            ...data.modalsConfig.serviceModal,
          }));
        }

        // Fetch site services from /api/azexbuy/services or data.cmsServices
        try {
          const srvRes = await fetch('/api/azexbuy/services');
          if (srvRes.ok) {
            const srvData = await srvRes.json();
            if (Array.isArray(srvData) && srvData.length > 0) {
              setSiteServices(srvData);
              if (!previewServiceId && srvData[0]?.id) {
                setPreviewServiceId(srvData[0].id);
              }
              return;
            }
          }
        } catch {}

        if (Array.isArray(data.cmsServices) && data.cmsServices.length > 0) {
          setSiteServices(data.cmsServices);
        }
      }
    } catch (e: any) {
      setErrorMessage('Məlumatları yükləyərkən xəta baş verdi: ' + (e?.message || 'Server xətası'));
    } finally {
      setLoading(false);
    }
  }, [previewServiceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save changes to backend
  const handleSaveAll = async () => {
    setSaving(true);
    setErrorMessage(null);
    try {
      const token = getAuthToken();

      // 1. Fetch current content to preserve other fields
      let currentContent: any = {};
      try {
        const cRes = await fetch('/api/azexbuy/content');
        if (cRes.ok) currentContent = await cRes.json();
      } catch {}

      const updatedContent = {
        ...currentContent,
        modalsConfig: {
          ...(currentContent.modalsConfig || {}),
          serviceModal: modalConfig,
        },
      };

      const resContent = await fetch('/api/azexbuy/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedContent),
      });

      if (!resContent.ok) {
        throw new Error(`Content saxlanıla bilmədi (Status: ${resContent.status})`);
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e: any) {
      setErrorMessage('Yadda saxlayarkən xəta: ' + (e?.message || 'Server xətası'));
    } finally {
      setSaving(false);
    }
  };

  // Reset to default configuration
  const handleResetToDefault = () => {
    if (confirm('Bütün başlıqlar və form mətnləri standart vəziyyətə sıfırlansın?')) {
      setModalConfig(DEFAULT_SERVICE_MODAL_CONFIG);
    }
  };

  // Helper to update a localized field
  const updateField = (field: string, lang: LocaleKey, val: string) => {
    setModalConfig((prev: any) => ({
      ...prev,
      [field]: {
        ...(prev[field] || {}),
        [lang]: val,
      },
    }));
  };

  const activePreviewService = useMemo(() => {
    return siteServices.find(s => s.id === previewServiceId) || siteServices[0] || DEFAULT_SITE_SERVICES[0];
  }, [siteServices, previewServiceId]);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#0f3156] text-white flex items-center justify-center shadow-xs shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900">
                Xidmət Müraciəti Formu Redaktoru
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                Yeni Format
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pop-up müraciət pəncərəsinin başlıqlarını, əlaqə sahələrini, çoxdilli mətnlərini və canlı önizləməsini idarə edin.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {savedSuccess && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold animate-pulse">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Saxlanıldı!
            </span>
          )}
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
            title="Yenilə"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
            title="İlkin Standart Formaya Sıfırla"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>İlkinə Sıfırla</span>
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0f3156] hover:bg-[#1a4a7a] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Yadda saxlanılır...' : 'Dəyişiklikləri Saxla'}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('headers')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'headers'
              ? 'border-[#0f3156] text-[#0f3156]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Form Başlıqları &amp; Sahələri (6 Dil)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'services'
              ? 'border-[#0f3156] text-[#0f3156]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Müraciət Edilən Xidmət Kartları ({siteServices.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'preview'
              ? 'border-[#0f3156] text-[#0f3156]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Canlı Modal Önizləmə</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 1: FORM BAŞLIQLARI VƏ SAHƏLƏRİ (6 DİLDƏ)
          ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'headers' && (
        <div className="bg-white border border-slate-200 rounded-b-xl p-5 sm:p-6 shadow-xs space-y-6">
          {/* Connected Notification Email (SMTP) */}
          <ModalEmailSelector
            value={modalConfig.notificationEmail}
            onChange={(email) => setModalConfig((prev: any) => ({ ...prev, notificationEmail: email }))}
            defaultEmail="export@azexbuy.com"
            modalName="Xidmət Müraciəti Formu"
            helpText="Ziyarətçi saytda Xidmət Müraciəti göndərdikdə bildiriş məktubu və ərizə detalları bu e-poçt ünvanına çatdırılır."
          />

          {/* Language Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-900">Redaktə Edilən Dil:</div>
              <p className="text-[11px] text-slate-500">Mətnləri 6 dil arasında dəyişərək fərdiləşdirin.</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {LOCALES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setSelectedLang(lang)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                    selectedLang === lang
                      ? 'bg-[#0f3156] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {LOCALE_LABELS[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Form Groups */}
          <div className="space-y-6">
            {/* 1. Modal Header & Subtitle */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-blue-900">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                1. Modal Başlığı və İzah Mətni
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Modal Başlığı ({selectedLang})
                  </label>
                  <input
                    type="text"
                    value={modalConfig.title?.[selectedLang] || ''}
                    onChange={(e) => updateField('title', selectedLang, e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f3156]"
                    placeholder="Xidmət Müraciəti Formu"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Alt Başlıq / Açıqlama ({selectedLang})
                  </label>
                  <input
                    type="text"
                    value={modalConfig.subtitle?.[selectedLang] || ''}
                    onChange={(e) => updateField('subtitle', selectedLang, e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f3156]"
                    placeholder="AZEXBUY xidmətləri üçün rəsmi müraciət edin..."
                  />
                </div>
              </div>
            </div>

            {/* 2. Contact Fields Labels */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-slate-800">
                <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                2. Əlaqə Sahələrinin Etiketləri (Labels)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Ad Soyad sahəsi ({selectedLang})
                  </label>
                  <input
                    type="text"
                    value={modalConfig.fullNameLabel?.[selectedLang] || ''}
                    onChange={(e) => updateField('fullNameLabel', selectedLang, e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f3156]"
                    placeholder="Ad Soyad"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Şirkət adı sahəsi ({selectedLang})
                  </label>
                  <input
                    type="text"
                    value={modalConfig.companyLabel?.[selectedLang] || ''}
                    onChange={(e) => updateField('companyLabel', selectedLang, e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f3156]"
                    placeholder="Şirkət adı"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Ölkə sahəsi ({selectedLang})
                  </label>
                  <input
                    type="text"
                    value={modalConfig.countryLabel?.[selectedLang] || ''}
                    onChange={(e) => updateField('countryLabel', selectedLang, e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f3156]"
                    placeholder="Ölkə"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-600">
                    E-poçt sahəsi ({selectedLang})
                  </label>
                  <input
                    type="text"
                    value={modalConfig.emailLabel?.[selectedLang] || ''}
                    onChange={(e) => updateField('emailLabel', selectedLang, e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f3156]"
                    placeholder="E-poçt"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Telefon sahəsi ({selectedLang})
                  </label>
                  <input
                    type="text"
                    value={modalConfig.phoneLabel?.[selectedLang] || ''}
                    onChange={(e) => updateField('phoneLabel', selectedLang, e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f3156]"
                    placeholder="Telefon"
                  />
                </div>
              </div>
            </div>

            {/* 3. Service Card & Details Section */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                3. Xidmət Kartı və Müraciət Detalları
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Xidmət kartı başlığı ({selectedLang})
                  </label>
                  <input
                    type="text"
                    value={modalConfig.servicesLabel?.[selectedLang] || ''}
                    onChange={(e) => updateField('servicesLabel', selectedLang, e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f3156]"
                    placeholder="Müraciət edilən xidmət"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-600">
                    "Seçildi" nişanı mətni ({selectedLang})
                  </label>
                  <input
                    type="text"
                    value={modalConfig.selectedBadge?.[selectedLang] || ''}
                    onChange={(e) => updateField('selectedBadge', selectedLang, e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f3156]"
                    placeholder="Seçildi"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Təfərrüatlar etiketi ({selectedLang})
                  </label>
                  <input
                    type="text"
                    value={modalConfig.detailsLabel?.[selectedLang] || ''}
                    onChange={(e) => updateField('detailsLabel', selectedLang, e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f3156]"
                    placeholder="Müraciətin təfərrüatları"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Təfərrüatlar placeholderi ({selectedLang})
                  </label>
                  <input
                    type="text"
                    value={modalConfig.detailsPlaceholder?.[selectedLang] || ''}
                    onChange={(e) => updateField('detailsPlaceholder', selectedLang, e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f3156]"
                    placeholder="Əlavə qeydləriniz..."
                  />
                </div>
              </div>
            </div>

            {/* 4. Action Buttons & Success Message */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                4. Düymələr və Uğurlu Bildiriş
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Müraciəti göndər düyməsi ({selectedLang})
                  </label>
                  <input
                    type="text"
                    value={modalConfig.submitButton?.[selectedLang] || ''}
                    onChange={(e) => updateField('submitButton', selectedLang, e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f3156]"
                    placeholder="Müraciəti göndər"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Ləğv et düyməsi ({selectedLang})
                  </label>
                  <input
                    type="text"
                    value={modalConfig.cancelButton?.[selectedLang] || ''}
                    onChange={(e) => updateField('cancelButton', selectedLang, e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f3156]"
                    placeholder="Ləğv et"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Uğurlu göndərmə bildirişi ({selectedLang})
                  </label>
                  <input
                    type="text"
                    value={modalConfig.successMessage?.[selectedLang] || ''}
                    onChange={(e) => updateField('successMessage', selectedLang, e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f3156]"
                    placeholder="Müraciətiniz uğurla göndərildi!"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 2: MÜRACİƏT EDİLƏ BİLƏN XİDMƏT KARTLARI
          ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'services' && (
        <div className="bg-white border border-slate-200 rounded-b-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-800">Avtomatik Xidmət Əlaqələndirməsi:</span> Müştəri saytın <b>Xidmətlər</b> səhifəsindəki istənilən xidmət kartında "Müraciət Et" kliklədikdə, modal həmin xidmət üçün açılır və müraciət kartı kimi avtomatik nümayiş olunur. Xidmətlərin mətn və şəkillərini dəyişmək üçün <b>Xidmətlər İdarəetməsi</b> bölməsindən istifadə edin.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {siteServices.map((srv, idx) => (
              <div
                key={srv.id || idx}
                className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl ${srv.colorClass || 'bg-[#0f3156]'} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                    <i className={`${srv.iconClass || 'fa-solid fa-briefcase'} text-sm`}></i>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {srv.title?.AZ || srv.title?.EN || srv.id}
                    </div>
                    {(srv.targetAudience?.AZ || srv.description?.AZ || srv.subtitle?.AZ) && (
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {srv.targetAudience?.AZ || srv.description?.AZ || srv.subtitle?.AZ}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPreviewServiceId(srv.id);
                    setActiveTab('preview');
                  }}
                  className="px-2.5 py-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors shrink-0 flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>Önizlə</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 3: CANLI MODAL ÖNİZLƏMƏ
          ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          {/* Controls Bar for Preview */}
          <div className="bg-white p-3.5 border border-slate-200 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Service selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                Test Xidməti:
              </span>
              <select
                value={previewServiceId}
                onChange={(e) => setPreviewServiceId(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-none"
              >
                {siteServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title?.[previewLocale] || s.title?.AZ || s.id}
                  </option>
                ))}
              </select>
            </div>

            {/* View State Toggle (Normal Form vs Success Screen) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewSuccessState(false)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  !previewSuccessState
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Müraciət Formu
              </button>
              <button
                type="button"
                onClick={() => setPreviewSuccessState(true)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  previewSuccessState
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Uğurlu Göndərmə Ekranı
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1">
              {LOCALES.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setPreviewLocale(loc)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                    previewLocale === loc
                      ? 'bg-[#0f3156] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Simulation Box */}
          <div className="bg-slate-900/40 p-4 sm:p-8 rounded-2xl flex items-center justify-center min-h-[520px]">
            <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">
                    {modalConfig.title?.[previewLocale] || DEFAULT_SERVICE_MODAL_CONFIG.title[previewLocale]}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {modalConfig.subtitle?.[previewLocale] || DEFAULT_SERVICE_MODAL_CONFIG.subtitle[previewLocale]}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded transition-colors"
                >
                  <i className="fa-solid fa-xmark text-base"></i>
                </button>
              </div>

              {previewSuccessState ? (
                /* Success Screen Simulation */
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <i className="fa-solid fa-check text-xl text-emerald-600"></i>
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {modalConfig.successMessage?.[previewLocale] || DEFAULT_SERVICE_MODAL_CONFIG.successMessage[previewLocale]}
                  </p>
                  <button
                    type="button"
                    onClick={() => setPreviewSuccessState(false)}
                    className="mt-1 px-6 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                  >
                    OK
                  </button>
                </div>
              ) : (
                /* Normal Form Simulation */
                <>
                  <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Contact Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-90 pointer-events-none">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          {modalConfig.fullNameLabel?.[previewLocale] || DEFAULT_SERVICE_MODAL_CONFIG.fullNameLabel[previewLocale]} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Məs: Əli Məmmədov"
                          readOnly
                          className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-md text-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          {modalConfig.companyLabel?.[previewLocale] || DEFAULT_SERVICE_MODAL_CONFIG.companyLabel[previewLocale]} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Məs: Caspian Agro MMC"
                          readOnly
                          className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-md text-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          {modalConfig.countryLabel?.[previewLocale] || DEFAULT_SERVICE_MODAL_CONFIG.countryLabel[previewLocale]} <span className="text-red-500">*</span>
                        </label>
                        <div className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded text-slate-700 flex items-center justify-between">
                          <span>Azerbaijan (+994)</span>
                          <i className="fa-solid fa-chevron-down text-slate-400 text-[10px]"></i>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          {modalConfig.emailLabel?.[previewLocale] || DEFAULT_SERVICE_MODAL_CONFIG.emailLabel[previewLocale]} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          placeholder="export@company.az"
                          readOnly
                          className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-md text-slate-400"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          {modalConfig.phoneLabel?.[previewLocale] || DEFAULT_SERVICE_MODAL_CONFIG.phoneLabel[previewLocale]}
                        </label>
                        <input
                          type="tel"
                          placeholder="+994 50 123 45 67"
                          readOnly
                          className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-md text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Pre-selected Service Card (Locked based on clicked card) */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">
                        {modalConfig.servicesLabel?.[previewLocale] || DEFAULT_SERVICE_MODAL_CONFIG.servicesLabel[previewLocale]}
                      </label>
                      <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/80 shadow-2xs">
                        <div
                          className={`w-10 h-10 rounded-xl ${
                            activePreviewService.colorClass || 'bg-brandNavy'
                          } flex items-center justify-center shrink-0 text-white shadow-xs`}
                        >
                          <i className={`${activePreviewService.iconClass || 'fa-solid fa-briefcase'} text-sm`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-900 leading-snug truncate">
                            {activePreviewService.title?.[previewLocale] || activePreviewService.title?.AZ || activePreviewService.id}
                          </div>
                          {(activePreviewService.targetAudience?.[previewLocale] || activePreviewService.targetAudience?.AZ || activePreviewService.description?.AZ) && (
                            <div className="text-xs text-slate-500 truncate mt-0.5">
                              {activePreviewService.targetAudience?.[previewLocale] || activePreviewService.targetAudience?.AZ || activePreviewService.description?.AZ}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-700">
                          <i className="fa-solid fa-check text-[9px]"></i>
                          <span>{modalConfig.selectedBadge?.[previewLocale] || DEFAULT_SERVICE_MODAL_CONFIG.selectedBadge[previewLocale]}</span>
                        </div>
                      </div>
                    </div>

                    {/* Application Details */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        {modalConfig.detailsLabel?.[previewLocale] || DEFAULT_SERVICE_MODAL_CONFIG.detailsLabel[previewLocale]}
                      </label>
                      <textarea
                        rows={3}
                        placeholder={modalConfig.detailsPlaceholder?.[previewLocale] || DEFAULT_SERVICE_MODAL_CONFIG.detailsPlaceholder[previewLocale]}
                        readOnly
                        className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-md text-slate-400 resize-none"
                      />
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="shrink-0 px-5 py-3.5 border-t border-slate-200 bg-white flex items-center gap-3 justify-end">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg"
                    >
                      {modalConfig.cancelButton?.[previewLocale] || DEFAULT_SERVICE_MODAL_CONFIG.cancelButton[previewLocale]}
                    </button>
                    <button
                      type="button"
                      className="px-6 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg shadow-xs"
                    >
                      {modalConfig.submitButton?.[previewLocale] || DEFAULT_SERVICE_MODAL_CONFIG.submitButton[previewLocale]}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
