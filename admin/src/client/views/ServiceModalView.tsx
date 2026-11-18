import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus, Trash2, Save, RefreshCw, CheckCircle, ArrowUp, ArrowDown,
  Layers, Palette, Eye, Sliders, Globe, AlertCircle, Sparkles
} from 'lucide-react';
import { UiLanguage } from '../types';
import { IconPickerDropdown } from './AzexbuyCMSView';

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

const COLOR_PRESETS = [
  { label: 'Navy', value: 'bg-[#0f3156]' },
  { label: 'Brand Navy', value: 'bg-brandNavy' },
  { label: 'Emerald', value: 'bg-emerald-500' },
  { label: 'Emerald Dark', value: 'bg-emerald-600' },
  { label: 'Sky', value: 'bg-sky-600' },
  { label: 'Blue', value: 'bg-blue-600' },
  { label: 'Purple', value: 'bg-purple-600' },
  { label: 'Amber', value: 'bg-amber-500' },
  { label: 'Rose', value: 'bg-rose-600' },
  { label: 'Indigo', value: 'bg-indigo-600' },
  { label: 'Teal', value: 'bg-teal-600' },
  { label: 'Slate', value: 'bg-slate-700' },
];

export const DEFAULT_SERVICE_MODAL_CONFIG = {
  title: {
    AZ: 'Xidmət Müraciəti Formu',
    EN: 'Service Application Form',
    TR: 'Hizmet Başvuru Formu',
    RU: 'Форма заявки на услуги',
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
  servicesLabel: {
    AZ: 'Xidmət seçimi',
    EN: 'Service Selection',
    TR: 'Hizmet Seçimi',
    RU: 'Выбор услуги',
    AR: 'اختيار الخدمة',
    ES: 'Selección de servicio',
  },
  primaryBadge: {
    AZ: 'Əsas xidmət',
    EN: 'Primary service',
    TR: 'Ana hizmet',
    RU: 'Основная услуга',
    AR: 'الخدمة الرئيسية',
    ES: 'Servicio principal',
  },
  additionalBadge: {
    AZ: 'Əlavə xidmət',
    EN: 'Additional service',
    TR: 'Ek hizmet',
    RU: 'Дополнительная услуга',
    AR: 'خدمة إضافية',
    ES: 'Servicio adicional',
  },
  submitButton: {
    AZ: 'Müraciəti göndər',
    EN: 'Submit Application',
    TR: 'Başvuruyu Gönder',
    RU: 'Отправить заявку',
    AR: 'إرسال الطلب',
    ES: 'Enviar solicitud',
  },
  detailsLabel: {
    AZ: 'Müraciətin təfərrüatları',
    EN: 'Application Details',
    TR: 'Başvurunun ayrıntıları',
    RU: 'Детали заявки',
    AR: 'تفاصيل الطلب',
    ES: 'Detalles de la solicitud',
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

export const DEFAULT_MODAL_SERVICES = [
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
    serviceType: 'primary',
    sortOrder: 1,
    isActive: true,
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
    serviceType: 'primary',
    sortOrder: 2,
    isActive: true,
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
    serviceType: 'primary',
    sortOrder: 3,
    isActive: true,
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
    serviceType: 'primary',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'srv-outsourced-team',
    title: {
      AZ: 'Kənarlaşdırılmış (Outsourced) İxrac Departamenti',
      EN: 'Outsourced Export Department',
      TR: 'Dış Kaynaklı (Outsourced) İhracat Departmanı',
      RU: 'Аутсорсинг отдела экспорта',
      AR: 'قسم التصدير الخارجي المتكامل',
      ES: 'Departamento de Exportación Externo',
    },
    targetAudience: {
      AZ: 'Yerli istehsalçı üçün sıfırdan xarici ticarət komandasının qurulması: beynəlxalq yazışmalar, qiymət kalkulyasiyası, RFP/RFQ cavablandırma və logistik idarəetmə.',
      EN: 'Turnkey foreign trade team for domestic manufacturers: international correspondence, pricing, RFQ responses and logistics.',
      TR: 'Yerli üreticiler için sıfırdan dış ticaret ekibi: uluslararası yazışmalar, fiyat hesaplama, RFQ yanıtlama ve lojistik yönetim.',
      RU: 'Создание экспортной команды с нуля: деловая переписка, расчет цен, ответы на запросы котировок и управление логистикой.',
      AR: 'إنشاء فريق تجارة خارجية متكامل: المراسلات الدولية وحساب الأسعار والاستجابة لطلبات عروض الأسعار وإدارة اللوجستيات.',
      ES: 'Creación de un equipo de comercio exterior desde cero: correspondencia, cálculo de precios, respuestas a RFQ y logística.',
    },
    iconClass: 'fa-solid fa-building-user',
    colorClass: 'bg-indigo-600',
    serviceType: 'primary',
    sortOrder: 5,
    isActive: true,
  },
  {
    id: 'srv-expo-missions',
    title: {
      AZ: 'Beynəlxalq Sərgilərdə Təmsilçilik & B2B Missiyalar',
      EN: 'Trade Exhibitions & B2B Trade Missions',
      TR: 'Uluslararası Fuarlarda Temsil & B2B Heyetleri',
      RU: 'Выставки и торговые миссии B2B',
      AR: 'المعارض التجارية والبعثات التجارية B2B',
      ES: 'Ferias Comerciales y Misiones B2B',
    },
    targetAudience: {
      AZ: 'Gulfood, SIAL, Anuga və digər aparıcı qlobal sərgilərdə Azərbaycan məhsullarının təmsilçiliyi və fərdi B2B görüşlərin təşkili.',
      EN: 'Representation of Azerbaijani goods at Gulfood, SIAL, Anuga and organization of targeted B2B meetings.',
      TR: 'Gulfood, SIAL, Anuga gibi önde gelen fuarlarda Azerbaycan ürünlerinin temsili ve birebir B2B görüşmelerin organizasyonu.',
      RU: 'Представительство продукции Азербайджана на выставках Gulfood, SIAL, Anuga и организация B2B встреч.',
      AR: 'تمثيل المنتجات الأذربيجانية في معارض Gulfood وSIAL وAnuga وتنظيم لقاءات B2B المخصصة.',
      ES: 'Representación de productos azerbaiyanos en Gulfood, SIAL, Anuga y reuniones B2B directas.',
    },
    iconClass: 'fa-solid fa-award',
    colorClass: 'bg-rose-600',
    serviceType: 'primary',
    sortOrder: 6,
    isActive: true,
  },
  {
    id: 'srv-digital-presence',
    title: {
      AZ: 'Rəqəmsal Mövcudluq və Onlayn Biznes Həlləri',
      EN: 'Digital Presence & Online Business Solutions',
      TR: 'Dijital Varlık ve Çevrimiçi İş Çözümleri',
      RU: 'Цифровое присутствие и онлайн-бизнес решения',
      AR: 'التواجد الرقمي وحلول الأعمال عبر الإنترنت',
      ES: 'Presencia Digital y Soluciones de Negocios Online',
    },
    targetAudience: {
      AZ: 'Azərbaycan istehsalçılarının beynəlxalq bazarlarda peşəkar görünməsi üçün korporativ rəqəmsal platformalarının yaradılmasına, onlayn təqdimatının və rəqəmsal kommunikasiya imkanlarının inkişafına dəstək oluruq.',
      EN: 'Building corporate digital platforms and communication tools for Azerbaijani manufacturers to excel in international markets.',
      TR: 'Azerbaycan üreticilerinin uluslararası pazarlarda profesyonelce yer alması için kurumsal dijital platformlar ve iletişim çözümleri.',
      RU: 'Создание корпоративных цифровых платформ и коммуникационных каналов для продвижения экспортеров на мировом рынке.',
      AR: 'إنشاء منصات رقمية احترافية وحلول تواصل متطورة للمصنعين الأذربيجانيين في الأسواق الدولية.',
      ES: 'Desarrollo de plataformas digitales corporativas y comunicación para que los fabricantes destaquen en mercados internacionales.',
    },
    iconClass: 'fa-solid fa-laptop-code',
    colorClass: 'bg-brandNavy',
    serviceType: 'primary',
    sortOrder: 7,
    isActive: true,
  },
  {
    id: 'srv-market-readiness',
    title: {
      AZ: 'İxrac Hazırlığı və Məhsulun Bazara Uyğunlaşdırılması',
      EN: 'Export Readiness & Product Market Adaptation',
      TR: 'İhracata Hazırlık ve Ürün Uyumluluğu',
      RU: 'Подготовка к экспорту и адаптация продукта',
      AR: 'الجاهزية للتصدير ومواءمة المنتجات للأسواق',
      ES: 'Preparación para la Exportación y Adaptación del Producto',
    },
    targetAudience: {
      AZ: 'İstehsalçıların məhsullarını beynəlxalq bazarların kommersiya, texniki və keyfiyyət tələblərinə uyğun hazırlamasına, ixrac potensialını artırmasına və xarici alıcılara peşəkar təqdim etməsinə dəstək göstəririk.',
      EN: 'Preparing products to meet international commercial, technical and quality standards, maximizing export potential.',
      TR: 'Ürünlerin uluslararası ticari, teknik ve kalite gereksinimlerine uygun şekilde hazırlanması ve ihracat potansiyelinin artırılması.',
      RU: 'Подготовка продукции к международным коммерческим, техническим стандартам и повышение экспортного потенциала.',
      AR: 'تجهيز المنتجات لتلبية المتطلبات التجارية والفنية ومتطلبات الجودة الدولية لزيادة فرص التصدير.',
      ES: 'Preparación de productos para cumplir con los estándares comerciales, técnicos y de calidad internacionales.',
    },
    iconClass: 'fa-solid fa-sliders',
    colorClass: 'bg-emerald-600',
    serviceType: 'primary',
    sortOrder: 8,
    isActive: true,
  },
];

export const ServiceModalView: React.FC<ServiceModalViewProps> = () => {
  const [activeTab, setActiveTab] = useState<'services' | 'headers' | 'preview'>('services');
  const [filterType, setFilterType] = useState<'all' | 'primary' | 'secondary'>('all');
  const [selectedLang, setSelectedLang] = useState<LocaleKey>('AZ');
  const [previewLocale, setPreviewLocale] = useState<LocaleKey>('AZ');
  const [previewSelectedServices, setPreviewSelectedServices] = useState<string[]>(['srv-buyer-sourcing']);

  // Configuration and services state
  const [modalConfig, setModalConfig] = useState<any>(DEFAULT_SERVICE_MODAL_CONFIG);
  const [servicesList, setServicesList] = useState<any[]>(DEFAULT_MODAL_SERVICES);

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
        if (Array.isArray(data.cmsServices) && data.cmsServices.length > 0) {
          setServicesList(data.cmsServices);
        } else {
          // If content.cmsServices is not yet populated, check /api/azexbuy/services
          try {
            const srvRes = await fetch('/api/azexbuy/services');
            if (srvRes.ok) {
              const srvData = await srvRes.json();
              if (Array.isArray(srvData) && srvData.length > 0) {
                setServicesList(srvData);
                return;
              }
            }
          } catch {}
          setServicesList(DEFAULT_MODAL_SERVICES);
        }
      }
    } catch (e: any) {
      setErrorMessage('Məlumatları yükləyərkən xəta baş verdi: ' + (e?.message || 'Server xətası'));
    } finally {
      setLoading(false);
    }
  }, []);

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
        cmsServices: servicesList,
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

      // 2. Also sync to individual /api/azexbuy/services for consistency
      for (const srv of servicesList) {
        try {
          await fetch('/api/azexbuy/services', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(srv),
          });
        } catch {}
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e: any) {
      setErrorMessage('Yadda saxlayarkən xəta: ' + (e?.message || 'Server xətası'));
    } finally {
      setSaving(false);
    }
  };

  // Add a new service option
  const handleAddService = (type: 'primary' | 'secondary') => {
    const newId = `srv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const newOrder = servicesList.length + 1;
    const newItem = {
      id: newId,
      title: {
        AZ: 'Yeni Xidmət',
        EN: 'New Service',
        TR: 'Yeni Hizmet',
        RU: 'Новая услуга',
        AR: 'خدمة جديدة',
        ES: 'Nuevo Servicio',
      },
      targetAudience: {
        AZ: 'Qısa təsvir və ya hədəf auditoriya mətni',
        EN: 'Brief description or target audience text',
        TR: 'Kısa açıklama veya hedef kitle metni',
        RU: 'Краткое описание или целевая аудитория',
        AR: 'وصف موجز أو نص الجمهور المستهدف',
        ES: 'Breve descripción o público objetivo',
      },
      iconClass: type === 'primary' ? 'fa-solid fa-briefcase' : 'fa-solid fa-sliders',
      colorClass: type === 'primary' ? 'bg-[#0f3156]' : 'bg-slate-700',
      serviceType: type,
      sortOrder: newOrder,
      isActive: true,
    };
    setServicesList((prev) => [...prev, newItem]);
  };

  // Remove a service
  const handleRemoveService = (id: string) => {
    if (confirm('Bu xidməti siyahıdan silmək istədiyinizə əminsiniz?')) {
      setServicesList((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Move item up / down
  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= servicesList.length) return;
    const copy = [...servicesList];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    // Reassign sortOrder
    const reordered = copy.map((item, i) => ({ ...item, sortOrder: i + 1 }));
    setServicesList(reordered);
  };

  // Update specific field in service
  const handleUpdateServiceField = (id: string, field: string, value: any) => {
    setServicesList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleUpdateServiceLang = (
    id: string,
    field: 'title' | 'targetAudience',
    loc: LocaleKey,
    val: string
  ) => {
    setServicesList((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          [field]: {
            ...(s[field] || {}),
            [loc]: val,
          },
        };
      })
    );
  };

  // Reset to default 8 services
  const handleResetToDefault = () => {
    if (confirm('Bütün xidmət seçimləri və başlıqlar ilkin standart form vəziyyətinə sıfırlansın?')) {
      setModalConfig(DEFAULT_SERVICE_MODAL_CONFIG);
      setServicesList(DEFAULT_MODAL_SERVICES);
    }
  };

  const filteredServices = useMemo(() => {
    return servicesList.filter((s) => {
      if (filterType === 'all') return true;
      return s.serviceType === filterType;
    });
  }, [servicesList, filterType]);

  const primaryCount = servicesList.filter((s) => s.serviceType === 'primary').length;
  const secondaryCount = servicesList.filter((s) => s.serviceType === 'secondary').length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
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
                Tam Təchizatlı
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Saytın &quot;Xidmət Müraciəti Formu&quot; pop-up pəncərəsinin başlıqlarını, xidmət seçimlərini (+/-), ikonlarını və çoxdilli mətnlərini idarə edin.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {savedSuccess && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold animate-pulse">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Uğurla Saxlanıldı!
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
            className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg cursor-pointer transition-colors"
            title="İlkin Standart Formaya Sıfırla"
          >
            İlkinə Sıfırla
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0f3156] hover:bg-[#1a4a7a] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Yadda saxlanılır...' : 'Bütün Dəyişiklikləri Saxla'}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Mode Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'services'
              ? 'border-[#0f3156] text-[#0f3156]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Xidmət Seçimləri (+/- İdarəetmə)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700">
            {servicesList.length}
          </span>
        </button>

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
          <span>Form Başlıqları &amp; Mətnləri (6 Dil)</span>
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
          TAB 1: XİDMƏT SEÇİMLƏRİ (+/- İDARƏETMƏ)
          ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 border border-slate-200/90 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hamısı ({servicesList.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('primary')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  filterType === 'primary'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Əsas Xidmətlər ({primaryCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('secondary')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  filterType === 'secondary'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Əlavə Xidmətlər ({secondaryCount})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddService('primary')}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Yeni Əsas Xidmət</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddService('secondary')}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Yeni Əlavə Xidmət</span>
              </button>
            </div>
          </div>

          {/* Service Cards List */}
          <div className="space-y-4">
            {filteredServices.length === 0 ? (
              <div className="p-12 text-center bg-white border border-dashed border-slate-300 rounded-xl">
                <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">Seçilmiş filtr üzrə xidmət tapılmadı</p>
                <button
                  type="button"
                  onClick={() => handleAddService('primary')}
                  className="mt-3 px-4 py-1.5 text-xs font-bold text-white bg-[#0f3156] rounded-lg"
                >
                  + Yeni Xidmət Əlavə Et
                </button>
              </div>
            ) : (
              filteredServices.map((srv, index) => {
                const isPrimary = srv.serviceType === 'primary';
                return (
                  <div
                    key={srv.id}
                    className={`bg-white border rounded-xl p-4 sm:p-5 shadow-xs transition-all space-y-4 ${
                      srv.isActive === false
                        ? 'border-slate-200 opacity-60 bg-slate-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Item Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Service Icon Badge Preview */}
                        <div
                          className={`w-10 h-10 rounded-xl ${
                            srv.colorClass || (isPrimary ? 'bg-emerald-500' : 'bg-slate-700')
                          } text-white flex items-center justify-center shrink-0 shadow-2xs text-base`}
                        >
                          <i className={srv.iconClass || 'fa-solid fa-briefcase'}></i>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-extrabold text-slate-900">
                              #{index + 1}. {srv.title?.AZ || srv.title?.EN || srv.id}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                isPrimary
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {isPrimary ? 'Əsas xidmət' : 'Əlavə xidmət'}
                            </span>
                            {srv.isActive === false && (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                Passiv
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {srv.targetAudience?.AZ || srv.targetAudience?.EN || 'Alt izah qeyd edilməyib'}
                          </p>
                        </div>
                      </div>

                      {/* Item Quick Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Move Up / Down */}
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors disabled:opacity-30 cursor-pointer"
                          title="Yuxarı qaldır"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(index, 'down')}
                          disabled={index === servicesList.length - 1}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors disabled:opacity-30 cursor-pointer"
                          title="Aşağı endir"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>

                        {/* Switch Primary / Secondary */}
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateServiceField(
                              srv.id,
                              'serviceType',
                              srv.serviceType === 'primary' ? 'secondary' : 'primary'
                            )
                          }
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                          title="Növü dəyiş (Əsas / Əlavə)"
                        >
                          {isPrimary ? 'Əlavə Et' : 'Əsas Et'}
                        </button>

                        {/* Active / Inactive */}
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateServiceField(srv.id, 'isActive', srv.isActive === false)
                          }
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                            srv.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {srv.isActive !== false ? 'Aktiv' : 'Passiv'}
                        </button>

                        {/* Delete Service */}
                        <button
                          type="button"
                          onClick={() => handleRemoveService(srv.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Xidmət seçimini sil (-)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Icon Picker & Color Picker */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80">
                      <div>
                        <IconPickerDropdown
                          label="İkon Seçimi (Önizləməli FontAwesome)"
                          value={srv.iconClass || 'fa-solid fa-briefcase'}
                          onChange={(newIcon) => handleUpdateServiceField(srv.id, 'iconClass', newIcon)}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">
                          İkon Fon Rəngi (Tailwind Rəng / Palitra)
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={srv.colorClass || 'bg-brandNavy'}
                              onChange={(e) =>
                                handleUpdateServiceField(srv.id, 'colorClass', e.target.value)
                              }
                              placeholder="məs: bg-emerald-500, bg-sky-600, bg-[#0f3156]"
                              className="flex-1 h-8 text-xs bg-white border border-slate-200 px-2.5 rounded-sm focus:outline-none focus:border-[#0f3156] font-mono text-slate-800"
                            />
                            <div
                              className={`w-8 h-8 rounded-lg shrink-0 ${
                                srv.colorClass || 'bg-brandNavy'
                              } border border-slate-200 shadow-2xs`}
                            ></div>
                          </div>

                          {/* Quick color preset chips */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {COLOR_PRESETS.map((col) => (
                              <button
                                key={col.value}
                                type="button"
                                onClick={() => handleUpdateServiceField(srv.id, 'colorClass', col.value)}
                                className={`w-5 h-5 rounded-full ${col.value} border cursor-pointer transition-transform ${
                                  srv.colorClass === col.value
                                    ? 'ring-2 ring-[#0f3156] ring-offset-1 scale-110 border-transparent'
                                    : 'border-white/50 hover:scale-105'
                                }`}
                                title={col.label}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Multilingual Title Fields (6 Languages) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-slate-700 uppercase font-mono">
                          Xidmət Başlığı (6 Dil)
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {LOCALES.map((loc) => (
                          <div
                            key={loc}
                            className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-[#0f3156] focus-within:bg-white transition-colors"
                          >
                            <span className="text-[10px] font-extrabold text-slate-400 font-mono w-5">
                              {loc}
                            </span>
                            <input
                              type="text"
                              value={srv.title?.[loc] || ''}
                              onChange={(e) =>
                                handleUpdateServiceLang(srv.id, 'title', loc, e.target.value)
                              }
                              placeholder={`Başlıq (${loc})`}
                              className="w-full text-xs bg-transparent focus:outline-none text-slate-900 font-medium"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Multilingual Target Audience / Subtitle Fields (6 Languages) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-slate-700 uppercase font-mono">
                          Alt İzah / Təsvir Mətni (6 Dil)
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {LOCALES.map((loc) => (
                          <div
                            key={loc}
                            className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-[#0f3156] focus-within:bg-white transition-colors"
                          >
                            <span className="text-[10px] font-extrabold text-slate-400 font-mono w-5 mt-0.5">
                              {loc}
                            </span>
                            <textarea
                              rows={2}
                              value={srv.targetAudience?.[loc] || ''}
                              onChange={(e) =>
                                handleUpdateServiceLang(srv.id, 'targetAudience', loc, e.target.value)
                              }
                              placeholder={`Alt izah (${loc})`}
                              className="w-full text-xs bg-transparent focus:outline-none text-slate-800 resize-none leading-relaxed"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 2: FORM BAŞLIQLARI & MƏTNLƏRİ (6 DİL)
          ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'headers' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Form Başlıq və Mətn Parametrləri</h2>
              <p className="text-xs text-slate-500">
                Müraciət pəncərəsinin yuxarı başlığını, izahatını, bölmə başlıqlarını və göndər düyməsini istənilən dildə fərdiləşdirin.
              </p>
            </div>

            {/* Language Selector for Focused Editing */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {LOCALES.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setSelectedLang(loc)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                    selectedLang === loc
                      ? 'bg-white text-[#0f3156] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Active Locale Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Modal Title */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Pəncərə Başlığı ({selectedLang})
              </label>
              <input
                type="text"
                value={modalConfig.title?.[selectedLang] || ''}
                onChange={(e) =>
                  setModalConfig((prev: any) => ({
                    ...prev,
                    title: { ...(prev.title || {}), [selectedLang]: e.target.value },
                  }))
                }
                className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f3156]"
                placeholder="Xidmət Müraciəti Formu"
              />
            </div>

            {/* Submit Button Text */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Göndər Düyməsi Mətni ({selectedLang})
              </label>
              <input
                type="text"
                value={modalConfig.submitButton?.[selectedLang] || ''}
                onChange={(e) =>
                  setModalConfig((prev: any) => ({
                    ...prev,
                    submitButton: { ...(prev.submitButton || {}), [selectedLang]: e.target.value },
                  }))
                }
                className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f3156]"
                placeholder="Müraciəti göndər"
              />
            </div>

            {/* Modal Subtitle / Description */}
            <div className="md:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Alt İzah Mətni ({selectedLang})
              </label>
              <textarea
                rows={2}
                value={modalConfig.subtitle?.[selectedLang] || ''}
                onChange={(e) =>
                  setModalConfig((prev: any) => ({
                    ...prev,
                    subtitle: { ...(prev.subtitle || {}), [selectedLang]: e.target.value },
                  }))
                }
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f3156] leading-relaxed resize-none"
                placeholder="AZEXBUY ticarət, logistika və hüquqi konsaltinq xidmətləri üçün rəsmi müraciət edin..."
              />
            </div>

            {/* Services Section Label */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Xidmət Seçimi Bölmə Başlığı ({selectedLang})
              </label>
              <input
                type="text"
                value={modalConfig.servicesLabel?.[selectedLang] || ''}
                onChange={(e) =>
                  setModalConfig((prev: any) => ({
                    ...prev,
                    servicesLabel: { ...(prev.servicesLabel || {}), [selectedLang]: e.target.value },
                  }))
                }
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f3156]"
                placeholder="Xidmət seçimi"
              />
            </div>

            {/* Application Details Label */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Müraciət Təfərrüatları Sahə Başlığı ({selectedLang})
              </label>
              <input
                type="text"
                value={modalConfig.detailsLabel?.[selectedLang] || ''}
                onChange={(e) =>
                  setModalConfig((prev: any) => ({
                    ...prev,
                    detailsLabel: { ...(prev.detailsLabel || {}), [selectedLang]: e.target.value },
                  }))
                }
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f3156]"
                placeholder="Müraciətin təfərrüatları"
              />
            </div>

            {/* Primary Badge Label */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Əsas Xidmət Qrupu Başlığı ({selectedLang})
              </label>
              <input
                type="text"
                value={modalConfig.primaryBadge?.[selectedLang] || ''}
                onChange={(e) =>
                  setModalConfig((prev: any) => ({
                    ...prev,
                    primaryBadge: { ...(prev.primaryBadge || {}), [selectedLang]: e.target.value },
                  }))
                }
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f3156]"
                placeholder="Əsas xidmət"
              />
            </div>

            {/* Additional Badge Label */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Əlavə Xidmət Qrupu Başlığı ({selectedLang})
              </label>
              <input
                type="text"
                value={modalConfig.additionalBadge?.[selectedLang] || ''}
                onChange={(e) =>
                  setModalConfig((prev: any) => ({
                    ...prev,
                    additionalBadge: { ...(prev.additionalBadge || {}), [selectedLang]: e.target.value },
                  }))
                }
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f3156]"
                placeholder="Əlavə xidmət"
              />
            </div>

            {/* Success Message */}
            <div className="md:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Uğurlu Göndərmə Bildirişi ({selectedLang})
              </label>
              <input
                type="text"
                value={modalConfig.successMessage?.[selectedLang] || ''}
                onChange={(e) =>
                  setModalConfig((prev: any) => ({
                    ...prev,
                    successMessage: { ...(prev.successMessage || {}), [selectedLang]: e.target.value },
                  }))
                }
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f3156]"
                placeholder="Müraciətiniz uğurla göndərildi!"
              />
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 3: CANLI MODAL ÖNİZLƏMƏ
          ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          {/* Preview Language Switcher */}
          <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">
                Canlı Sayt Simulyasiyası:
              </span>
            </div>
            <div className="flex items-center gap-1">
              {LOCALES.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setPreviewLocale(loc)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                    previewLocale === loc
                      ? 'bg-[#0f3156] text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Modal Card Preview */}
          <div className="bg-slate-900/40 p-4 sm:p-8 rounded-2xl flex items-center justify-center min-h-[500px]">
            <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
              {/* Header */}
              <div className="bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">
                    {modalConfig.title?.[previewLocale] || 'Xidmət Müraciəti Formu'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {modalConfig.subtitle?.[previewLocale] ||
                      'AZEXBUY ticarət, logistika və hüquqi konsaltinq xidmətləri üçün rəsmi müraciət edin. Mütəxəssislərimiz 24 saat ərzində sizinlə əlaqə saxlayacaq.'}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded transition-colors"
                >
                  <i className="fa-solid fa-xmark text-base"></i>
                </button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Contact Fields (Mocked View) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-80 pointer-events-none">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Ad Soyad <span className="text-red-500">*</span>
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
                      Şirkət adı <span className="text-red-500">*</span>
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
                      Ölkə <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded text-slate-700 flex items-center justify-between">
                      <span>Azerbaijan (+994)</span>
                      <i className="fa-solid fa-chevron-down text-slate-400 text-[10px]"></i>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      E-poçt <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="export@company.az"
                      readOnly
                      className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-md text-slate-400"
                    />
                  </div>
                </div>

                {/* Service Selection List (Interactive Preview) */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">
                    {modalConfig.servicesLabel?.[previewLocale] || 'Xidmət seçimi'}{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  {/* Primary Services */}
                  {servicesList.filter((s) => s.serviceType === 'primary' && s.isActive !== false)
                    .length > 0 && (
                    <div className="mb-3">
                      <div className="text-[10px] font-medium text-emerald-700 uppercase mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                        {modalConfig.primaryBadge?.[previewLocale] || 'Əsas xidmət'}
                      </div>
                      <div className="space-y-1.5">
                        {servicesList
                          .filter((s) => s.serviceType === 'primary' && s.isActive !== false)
                          .map((srv) => {
                            const isSelected = previewSelectedServices.includes(srv.id);
                            return (
                              <button
                                key={srv.id}
                                type="button"
                                onClick={() =>
                                  setPreviewSelectedServices((prev) =>
                                    prev.includes(srv.id)
                                      ? prev.filter((id) => id !== srv.id)
                                      : [...prev, srv.id]
                                  )
                                }
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all cursor-pointer text-left ${
                                  isSelected
                                    ? 'border-slate-800 bg-slate-50'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-lg ${
                                    srv.colorClass || 'bg-emerald-500'
                                  } flex items-center justify-center shrink-0 text-white`}
                                >
                                  <i className={`${srv.iconClass || 'fa-solid fa-briefcase'} text-xs`}></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div
                                    className={`text-sm font-medium ${
                                      isSelected ? 'text-slate-900' : 'text-slate-700'
                                    }`}
                                  >
                                    {srv.title?.[previewLocale] || srv.title?.AZ || srv.id}
                                  </div>
                                  <div className="text-xs text-slate-400 truncate">
                                    {srv.targetAudience?.[previewLocale] ||
                                      srv.targetAudience?.AZ ||
                                      ''}
                                  </div>
                                </div>
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                    isSelected
                                      ? 'bg-slate-800 border-slate-800'
                                      : 'border-slate-300'
                                  }`}
                                >
                                  {isSelected && (
                                    <i className="fa-solid fa-check text-white text-[8px]"></i>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Secondary Services */}
                  {servicesList.filter((s) => s.serviceType === 'secondary' && s.isActive !== false)
                    .length > 0 && (
                    <div>
                      <div className="text-[10px] font-medium text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block"></span>
                        {modalConfig.additionalBadge?.[previewLocale] || 'Əlavə xidmət'}
                      </div>
                      <div className="space-y-1.5">
                        {servicesList
                          .filter((s) => s.serviceType === 'secondary' && s.isActive !== false)
                          .map((srv) => {
                            const isSelected = previewSelectedServices.includes(srv.id);
                            return (
                              <button
                                key={srv.id}
                                type="button"
                                onClick={() =>
                                  setPreviewSelectedServices((prev) =>
                                    prev.includes(srv.id)
                                      ? prev.filter((id) => id !== srv.id)
                                      : [...prev, srv.id]
                                  )
                                }
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all cursor-pointer text-left ${
                                  isSelected
                                    ? 'border-slate-800 bg-slate-50'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-lg ${
                                    srv.colorClass || 'bg-slate-700'
                                  } flex items-center justify-center shrink-0 text-white`}
                                >
                                  <i className={`${srv.iconClass || 'fa-solid fa-briefcase'} text-xs`}></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div
                                    className={`text-sm font-medium ${
                                      isSelected ? 'text-slate-900' : 'text-slate-700'
                                    }`}
                                  >
                                    {srv.title?.[previewLocale] || srv.title?.AZ || srv.id}
                                  </div>
                                  <div className="text-xs text-slate-400 truncate">
                                    {srv.targetAudience?.[previewLocale] ||
                                      srv.targetAudience?.AZ ||
                                      ''}
                                  </div>
                                </div>
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                    isSelected
                                      ? 'bg-slate-800 border-slate-800'
                                      : 'border-slate-300'
                                  }`}
                                >
                                  {isSelected && (
                                    <i className="fa-solid fa-check text-white text-[8px]"></i>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    {modalConfig.detailsLabel?.[previewLocale] || 'Müraciətin təfərrüatları'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Əlavə qeydləriniz..."
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
                  Ləğv et
                </button>
                <button
                  type="button"
                  className="px-6 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg shadow-xs"
                >
                  {modalConfig.submitButton?.[previewLocale] || 'Müraciəti göndər'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
