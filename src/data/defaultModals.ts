import { Locale } from '../types';

export interface LocalizedString {
  AZ?: string;
  EN?: string;
  TR?: string;
  RU?: string;
  AR?: string;
  ES?: string;
  [key: string]: string | undefined;
}

export interface TransportModeConfig {
  id: string;
  label: LocalizedString;
  icon: string;
}

export interface PaymentTermConfig {
  id: string;
  label: LocalizedString;
}

export interface MandateTypeConfig {
  id: string;
  title: LocalizedString;
  desc: LocalizedString;
  badge?: string;
}

export interface FaqChipConfig {
  q: string;
  a?: string;
}

export interface SpecTabConfig {
  id: string;
  label: LocalizedString;
  icon?: string;
  enabled: boolean;
}

export interface SpecBadgeConfig {
  id: string;
  label: LocalizedString;
  bg?: string;
  text?: string;
}

export interface SearchCategoryConfig {
  id: string;
  label: LocalizedString;
  query: string;
}

export interface TrendingTagConfig {
  tag: string;
  query: string;
}

export interface RFQModalConfig {
  enabled: boolean;
  notificationEmail?: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  submitButton: LocalizedString;
  incoterms: string[];
  defaultIncoterm: string;
  transportModes: TransportModeConfig[];
  certificates: string[];
  paymentTerms: PaymentTermConfig[];
  currencies: string[];
  destinationPorts: string[];
  corridorRoutes: string[];
  flags: {
    requirePhone: boolean;
    requirePort: boolean;
    requireCertificates: boolean;
    allowCustomCertificates: boolean;
    allowCustomProducts: boolean;
  };
}

export interface ProducerModalConfig {
  enabled: boolean;
  notificationEmail?: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  submitButton: LocalizedString;
  enterpriseTypes: string[];
  productCategories: string[];
  capacityUnits: string[];
  targetMarkets: string[];
  certificatesHeld: string[];
  mandateTypes: MandateTypeConfig[];
}

export interface ServiceModalConfig {
  enabled: boolean;
  notificationEmail?: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  submitButton: LocalizedString;
  companyTypes?: string[];
  urgencyLevels?: string[];
  privacyNote?: LocalizedString;
  fullNameLabel?: LocalizedString;
  companyLabel?: LocalizedString;
  countryLabel?: LocalizedString;
  emailLabel?: LocalizedString;
  phoneLabel?: LocalizedString;
  servicesLabel?: LocalizedString;
  selectedBadge?: LocalizedString;
  detailsLabel?: LocalizedString;
  detailsPlaceholder?: LocalizedString;
  cancelButton?: LocalizedString;
  successMessage?: LocalizedString;
}

export interface AIDeskModalConfig {
  enabled: boolean;
  notificationEmail?: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  avatarUrl: string;
  greetingMessage: LocalizedString;
  faqChips: Record<string, FaqChipConfig[]>;
  leadCaptureTitle: LocalizedString;
  leadCaptureDesc: LocalizedString;
  leadCaptureSuccess: LocalizedString;
}

export interface ProductSpecModalConfig {
  enabled: boolean;
  tabs: SpecTabConfig[];
  badges: SpecBadgeConfig[];
  rfqButtonText: LocalizedString;
  contactButtonText: LocalizedString;
}

export interface SearchModalConfig {
  enabled: boolean;
  placeholder: LocalizedString;
  quickCategories: SearchCategoryConfig[];
  trendingTags: TrendingTagConfig[];
  emptyStateTitle: LocalizedString;
  emptyStateDesc: LocalizedString;
}

export interface DossierModalConfig {
  enabled: boolean;
  title: LocalizedString;
  subtitle: LocalizedString;
  officialSealText: LocalizedString;
  termsNote: LocalizedString;
  printButtonText: LocalizedString;
}

export interface AllModalsConfig {
  rfqModal: RFQModalConfig;
  producerModal: ProducerModalConfig;
  serviceModal: ServiceModalConfig;
  aiDeskModal: AIDeskModalConfig;
  productSpecModal: ProductSpecModalConfig;
  searchModal: SearchModalConfig;
  dossierModal: DossierModalConfig;
}

export const DEFAULT_MODALS_CONFIG: AllModalsConfig = {
  rfqModal: {
    enabled: true,
    notificationEmail: 'procurement@azexbuy.com',
    title: {
      AZ: 'Rəsmi İxrac Qiymət Sorğusu (RFQ)',
      EN: 'Request an Official Export Quotation (RFQ)',
      TR: 'Resmi İhracat Fiyat Teklifi (RFQ)',
      RU: 'Запрос коммерческого предложения (RFQ)',
      AR: 'طلب عرض سعر التصدير الرسمي (RFQ)',
      ES: 'Solicitud de Cotización de Exportación (RFQ)',
    },
    subtitle: {
      AZ: 'Azərbaycan istehsalçılarından birbaşa rəsmi qiymət təklifi, spesifikasiya və logistika şərtləri alın.',
      EN: 'Receive direct official price quotations, technical specifications, and freight terms from verified Azerbaijani producers.',
      TR: 'Doğrulanmış Azerbaycan üreticilerinden doğrudan resmi fiyat teklifi, teknik şartname ve lojistik koşulları alın.',
      RU: 'Получите официальное коммерческое предложение, спецификации и условия доставки напрямую от азербайджанских производителей.',
      AR: 'احصل على عروض أسعار رسمية ومواصفات وشروط شحن مباشرة من المنتجين الأذربيجانيين المعتمدين.',
      ES: 'Obtenga cotizaciones oficiales directas, especificaciones y términos de flete de productores azerbaiyanos verificados.',
    },
    submitButton: {
      AZ: 'RFQ Göndər & Sənəd Yarat',
      EN: 'Submit RFQ & Issue Dossier',
      TR: 'RFQ Gönder & Dosya Oluştur',
      RU: 'Отправить RFQ & Создать досье',
      AR: 'إرسال RFQ وإنشاء الملف',
      ES: 'Enviar RFQ y Emitir Expediente',
    },
    incoterms: ['CIF', 'FOB', 'CFR', 'EXW', 'FCA', 'CIP', 'DDP'],
    defaultIncoterm: 'CIF',
    transportModes: [
      { id: 'ocean', label: { AZ: 'Dəniz / Konteyner (FCL/LCL)', EN: 'Ocean Container (FCL/LCL)', TR: 'Deniz / Konteyner', RU: 'Морской контейнер', AR: 'حاوية بحرية', ES: 'Contenedor Marítimo' }, icon: 'fa-solid fa-ship' },
      { id: 'rail', label: { AZ: 'Dəmir yolu (BTK & Trans-Xəzər)', EN: 'Rail Freight (BTK & Trans-Caspian)', TR: 'Demiryolu (BTK & Hazar Geçişli)', RU: 'Железнодорожный транспорт', AR: 'شحن بالسكك الحديدية', ES: 'Transporte Ferroviario' }, icon: 'fa-solid fa-train' },
      { id: 'truck', label: { AZ: 'Avtomobil / TIR Daşımaları', EN: 'Road Freight (Full / Groupage TIR)', TR: 'Karayolu / TIR', RU: 'Автомобильные перевозки (TIR)', AR: 'شحن بري بالمركبات', ES: 'Transporte por Carretera' }, icon: 'fa-solid fa-truck-fast' },
      { id: 'air', label: { AZ: 'Hava Karqosu (Təcili)', EN: 'Air Cargo Express', TR: 'Hava Kargo', RU: 'Авиагруз', AR: 'شحن جوي سريع', ES: 'Carga Aérea' }, icon: 'fa-solid fa-plane-departure' },
      { id: 'multimodal', label: { AZ: 'Multimodal (Orta Dəhliz / TITR)', EN: 'Multimodal (Middle Corridor / TITR)', TR: 'Multimodal (Orta Koridor)', RU: 'Мультимодальный (Срединный коридор)', AR: 'نقل متعدد الوسائط', ES: 'Multimodal (Corredor Central)' }, icon: 'fa-solid fa-route' },
    ],
    certificates: [
      'AQTA Fitosanitar Sertifikatı',
      'EUR.1 Mənşə Sertifikatı (CT-1)',
      'ISO 22000 (Qida Təhlükəsizliyi)',
      'Halal Sertifikatı',
      'Global G.A.P',
      'BRCGS Food Safety',
      'Kosher Sertifikatı',
      'HACCP Standartı',
      'Organik / Eko Sertifikat',
    ],
    paymentTerms: [
      { id: 'lc', label: { AZ: '100% Geri Çağırılmaz Akkreditiv (L/C at sight)', EN: '100% Irrevocable Letter of Credit (L/C at sight)', TR: '%100 Dönülemez Akreditif (L/C at sight)', RU: '100% Безотзывный аккредитив (L/C at sight)', AR: 'اعتماد مستندي غير قابل للإلغاء 100٪', ES: '100% Carta de Crédito Irrevocable (L/C a la vista)' } },
      { id: 'dp', label: { AZ: '30% Avans + 70% B/L qarşılığı (CAD / D/P)', EN: '30% Advance + 70% against B/L (CAD / D/P)', TR: '%30 Avans + %70 Konşimento karşılığı (CAD)', RU: '30% Аванс + 70% против коносамента (CAD)', AR: '30٪ دفعة مقدمة + 70٪ مقابل بوليصة الشحن', ES: '30% Anticipo + 70% contra B/L (CAD)' } },
      { id: 'escrow', label: { AZ: 'AZEXBUY Escrow Ticarət Təminatı', EN: 'AZEXBUY Trade Escrow Account', TR: 'AZEXBUY Güvenli Ticaret Hesabı (Escrow)', RU: 'Эскроу-счёт AZEXBUY Trade Guarantee', AR: 'حساب الضمان التجاري AZEXBUY Escrow', ES: 'Cuenta de Custodia Comercial AZEXBUY Escrow' } },
      { id: 'oa', label: { AZ: 'Açıq Hesab (Sığortalı Alıcılar üçün)', EN: 'Open Account (For Insured Trade)', TR: 'Açık Hesap (Sigortalı Alıcılar)', RU: 'Открытый счёт (со страхованием)', AR: 'حساب مفتوح مع تأمين تجاري', ES: 'Cuenta Abierta (Con Seguro de Crédito)' } },
    ],
    currencies: ['USD', 'EUR', 'AZN', 'RUB', 'AED', 'TRY', 'CNY'],
    destinationPorts: [
      'Poti / Batumi Limanı (Gürcüstan)',
      'Ələt Beynəlxalq Dəniz Ticarət Limanı (Bakı)',
      'Constanța Limanı (Rumıniya)',
      'Mersin Limanı (Türkiyə)',
      'Aktau / Kuryk Limanı (Qazaxıstan)',
      'Rotterdam Limanı (Niderland)',
      'Dubai Jebel Ali (BƏƏ)',
      'Qingdao Limanı (Çin)',
      'Novorossiysk Limanı (Rusiya)',
      'Ceyhan Terminalı (Türkiyə)',
    ],
    corridorRoutes: [
      'Trans-Caspian International Transport Route (Middle Corridor / TITR)',
      'Baku-Tbilisi-Kars (BTK) Rail Corridor',
      'North-South International Transport Corridor (INSTC)',
      'Black Sea Express Feeder (Poti/Batumi - Constanța/Burgas)',
      'Baku - Astrakhan / Makhachkala Caspian Maritime Route',
    ],
    flags: {
      requirePhone: true,
      requirePort: false,
      requireCertificates: false,
      allowCustomCertificates: true,
      allowCustomProducts: true,
    },
  },

  producerModal: {
    enabled: true,
    notificationEmail: 'export@azexbuy.com',
    title: {
      AZ: 'İstehsalçı İxrac Qeydiyyatı & Alıcı Uyğunlaşdırması',
      EN: 'Producer Export Onboarding & Global Buyer Matchmaking',
      TR: 'Üretici İhracat Kaydı & Alıcı Eşleştirme',
      RU: 'Регистрация производителя для экспорта и подбор покупателей',
      AR: 'تسجيل المصنّع للتصدير ومطابقة المشترين الدوليين',
      ES: 'Registro de Productor para Exportación y Emparejamiento',
    },
    subtitle: {
      AZ: 'Məhsullarınızı beynəlxalq bazarlara çıxarın, rəsmi dövlət ticarət evləri və qlobal alıcı şəbəkəsinə inteqrasiya olun.',
      EN: 'Showcase your commodities to international markets and connect directly with verified buyers via sovereign export channels.',
      TR: 'Ürünlerinizi uluslararası pazarlara açın, resmi ticaret evleri ve küresel alıcı ağına doğrudan bağlanın.',
      RU: 'Выводите продукцию на международные рынки и подключайтесь к проверенной базе иностранных покупателей.',
      AR: 'اعرض منتجاتك في الأسواق الدولية وتواصل مباشرة مع المشترين العالميين المعتمدين.',
      ES: 'Lleve sus productos a los mercados globales y conéctese con compradores internacionales calificados.',
    },
    submitButton: {
      AZ: 'İstehsalçı Qeydiyyatı & Sənəd Yarat',
      EN: 'Register Producer & Issue Dossier',
      TR: 'Üreticiyi Kaydet & Dosya Oluştur',
      RU: 'Зарегистрировать производителя & Создать досье',
      AR: 'تسجيل المنتج وإنشاء الملف',
      ES: 'Registrar Productor y Crear Expediente',
    },
    enterpriseTypes: [
      'Məhdud Məsuliyyətli Cəmiyyət (MMC)',
      'Açıq Səhmdar Cəmiyyəti (ASC)',
      'Qapalı Səhmdar Cəmiyyəti (QSC)',
      'Fərdi Sahibkar (F/S)',
      'Kənd Təsərrüfatı Kooperativi',
      'Aqropark / Sənaye Məhəlləsi Rezidenti',
      'Xarici İnvestisiyalı Müəssisə',
    ],
    productCategories: [
      'Qabıqlı və Ləpə Fındıq (Ata-baba, Yağlı fındıq)',
      'Təzə Pomidor və İstixana Məhsulları',
      'Nar, Nar Şirəsi və Narşərab',
      'Təzə və Qurudulmuş Xurma (Persimmon)',
      'Alma, Armud, Gilas və Çəyirdəkli Meyvələr',
      'Azərbaycan Çayı və Lənkəran Sitrusları',
      'Təbii Zəfəran və Ədviyyatlar',
      'Təbii Dağ Balı və Arıçılıq Məhsulları',
      'Şərab, Konyak və Spirtli İçkilər',
      'Xam Pambıq, Pambıq İpliyi və Tekstil',
      'Polimerlər, Plastik Xammal və Kimyəvi Maddələr',
      'Təbii Tikinti Daşları, Mərmər və Əhəngdaşı',
      'Konservləşdirilmiş Meyvə-Tərəvəz və Mürəbbələr',
    ],
    capacityUnits: [
      'Ton / İl',
      'Min Ədəd / İl',
      'Min Litr / İl',
      'Standart Konteyner (TEU) / İl',
      'Kiloqram / İl',
    ],
    targetMarkets: [
      'Avropa İttifaqı (Aİ / EU)',
      'Rusiya Federasiyası və MDB Ölkələri',
      'Körfəz Ölkələri (BƏƏ, Səudiyyə Ərəbistanı, Qətər)',
      'Türkiyə Respublikası və Balkanlar',
      'Çin Xalq Respublikası və Şərqi Asiya',
      'Şimali Amerika (ABŞ və Kanada)',
      'Mərkəzi Asiya (Qazaxıstan, Özbəkistan)',
    ],
    certificatesHeld: [
      'AQTA Qida Təhlükəsizliyi Qeydiyyatı',
      'ISO 9001:2015 (Keyfiyyət Sistemi)',
      'ISO 22000 / FSSC 22000 (Qida Təhlükəsizliyi)',
      'HACCP Sertifikatı',
      'Global G.A.P Sertifikatı',
      'Halal Standart Sertifikatı',
      'Eko / Organic Bioloji Sertifikat',
      'Kosher Sertifikatı',
    ],
    mandateTypes: [
      {
        id: 'full_mandate',
        title: {
          AZ: 'Tam İxrac Mandatı (Turnkey Trade Desk)',
          EN: 'Turnkey Export Desk Mandate',
          TR: 'Tam İhracat Yetki Mandatı',
          RU: 'Полный экспортный мандат (Turnkey)',
          AR: 'تفويض التصدير الشامل',
          ES: 'Mandato Completo de Exportación',
        },
        desc: {
          AZ: 'Bütün xarici alıcı danışıqları, müqavilələr, gömrük və daşıma AZEXBUY tərəfindən idarə olunur.',
          EN: 'Complete overseas buyer negotiation, contracting, customs, and multimodal logistics handled end-to-end.',
          TR: 'Yurtdışı alıcı müzakereleri, sözleşmeler, gümrük ve lojistik AZEXBUY tarafından uçtan uca yürütülür.',
          RU: 'Все переговоры с иностранными покупателями, контракты, таможня и логистика ведутся под ключ.',
          AR: 'إدارة شاملة لجميع المفاوضات والعقود والجمارك والشحن الدولي بواسطة AZEXBUY.',
          ES: 'Gestión completa de compradores internacionales, contratos, aduanas y logística multimodal.',
        },
        badge: 'Recommended',
      },
      {
        id: 'direct_matching',
        title: {
          AZ: 'Birbaşa Alıcı Uyğunlaşdırması',
          EN: 'Direct Buyer Matchmaking',
          TR: 'Doğrudan Alıcı Eşleştirme',
          RU: 'Прямой подбор покупателей',
          AR: 'مطابقة المشترين المباشرة',
          ES: 'Emparejamiento Directo de Compradores',
        },
        desc: {
          AZ: 'Təsdiqlənmiş xarici alıcı sorğuları yönləndirilir, ticarət müqaviləsi tərəflər arasında birbaşa bağlanır.',
          EN: 'Verified overseas buy RFQs forwarded directly; contract executed directly between producer and buyer.',
          TR: 'Doğrulanmış alıcı talepleri yönlendirilir, sözleşme taraflarca doğrudan imzalanır.',
          RU: 'Проверенные запросы направляются напрямую; договор заключается напрямую между сторонами.',
          AR: 'توجيه طلبات الشراء المؤكدة مباشرة لإتمام العقود بين الأطراف.',
          ES: 'Las solicitudes verificadas se reenvían directamente para contratación bilateral.',
        },
      },
      {
        id: 'logistics_customs',
        title: {
          AZ: 'Logistika və Gömrük Dəstəyi',
          EN: 'Logistics & Customs Clearance',
          TR: 'Lojistik & Gümrük Desteği',
          RU: 'Логистическое и таможенное сопровождение',
          AR: 'دعم الشحن والتخليص الجمركي',
          ES: 'Apoyo Logístico y Aduanero',
        },
        desc: {
          AZ: 'Mövcud alıcılarınıza göndərişlər üçün fitosanitar, mənşə sertifikatı və Orta Dəhliz tranzit dəstəyi.',
          EN: 'Export documentation, EUR.1 / phytosanitary certificates, and Middle Corridor transit handling.',
          TR: 'Mevcut alıcılarınıza ihracat için fitosaniter, menşe şahadetnamesi ve transit lojistik desteği.',
          RU: 'Фитосанитарное оформление, сертификаты происхождения и транзит по Срединному коридору.',
          AR: 'إصدار الشهادات الجمركية والصحية وتنسيق النقل عبر الممر الأوسط.',
          ES: 'Documentación de exportación, certificados fitosanitarios y gestión del Corredor Central.',
        },
      },
    ],
  },

  serviceModal: {
    enabled: true,
    notificationEmail: 'export@azexbuy.com',
    title: {
      AZ: 'Xidmət Müraciəti Formu',
      EN: 'Service Application Form',
      TR: 'Hizmet Başvuru Formu',
      RU: 'Форма подачи заявки на услуги',
      AR: 'نموذج طلب الخدمة',
      ES: 'Formulario de Solicitud de Servicios',
    },
    subtitle: {
      AZ: 'AZEXBUY ticarət, logistika və hüquqi konsaltinq xidmətləri üçün rəsmi müraciət edin. Mütəxəssislərimiz 24 saat ərzində sizinlə əlaqə saxlayacaq.',
      EN: 'Submit an official inquiry for AZEXBUY trade desk, forwarding, and compliance services. Our specialists will respond within 24 business hours.',
      TR: 'AZEXBUY ticaret, lojistik ve hukuki danışmanlık hizmetleri için resmi başvuru yapın. Uzmanlarımız 24 saat içinde dönüş yapacaktır.',
      RU: 'Официальная заявка на логистические, торговые и сертификационные услуги AZEXBUY. Ответ в течение 24 рабочих часов.',
      AR: 'قدم طلباً رسمياً لخدمات التجارة واللوجستيات والاستشارات القانونية من AZEXBUY.',
      ES: 'Solicite servicios comerciales, logísticos y de cumplimiento aduanero de AZEXBUY.',
    },
    submitButton: {
      AZ: 'Müraciəti Göndər',
      EN: 'Submit Application',
      TR: 'Başvuruyu Gönder',
      RU: 'Отправить заявку',
      AR: 'إرسال الطلب',
      ES: 'Enviar Solicitud',
    },
    cancelButton: {
      AZ: 'Ləğv et',
      EN: 'Cancel',
      TR: 'İptal',
      RU: 'Отмена',
      AR: 'إلغاء',
      ES: 'Cancelar',
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
    successMessage: {
      AZ: 'Müraciətiniz uğurla göndərildi!',
      EN: 'Your application was submitted successfully!',
      TR: 'Başvurunuz başarıyla gönderildi!',
      RU: 'Ваша заявка успешно отправлена!',
      AR: 'تم إرسال طلبك بنجاح!',
      ES: '¡Su solicitud fue enviada con éxito!',
    },
    companyTypes: [
      'İdxalçı / Xarici Alıcı',
      'Yerli İstehsalçı / İxracatçı',
      'Beynəlxalq Ticarət Evi (Trading House)',
      'Logistika və Ekspedisiya Şirkəti',
      'Dövlət / Assosiasiya Nümayəndəsi',
      'Fərdi Sahibkar / İnvestor',
    ],
    urgencyLevels: [
      'Təcili (1-3 iş günü)',
      'Standart (1 həftə ərzində)',
      'Planlaşdırılan Layihə (1 ay ərzində)',
      'İlkin Məsləhətləşmə & Təklif',
    ],
    privacyNote: {
      AZ: 'Məlumatlarınız Azərbaycan Respublikasının fərdi məlumatların qorunması qanunvericiliyinə və kommersiya sirri prinsiplərinə uyğun qorunur.',
      EN: 'All data is secured strictly under trade confidentiality regulations and non-disclosure standards.',
      TR: 'Bilgileriniz ticari gizlilik ve veri güvenliği standartları çerçevesinde korunmaktadır.',
      RU: 'Конфиденциальность данных гарантируется в соответствии со стандартами коммерческой тайны.',
      AR: 'يتم حفظ جميع المعلومات بسرية تامة ووفقاً للمعايير القانونية.',
      ES: 'Sus datos se procesan con estricta confidencialidad comercial.',
    },
  },

  aiDeskModal: {
    enabled: true,
    notificationEmail: 'support@azexbuy.com',
    title: {
      AZ: 'AZEXBUY Trade Desk',
      EN: 'AZEXBUY Trade Desk',
      TR: 'AZEXBUY Trade Desk',
      RU: 'AZEXBUY Trade Desk',
      AR: 'AZEXBUY Trade Desk',
      ES: 'AZEXBUY Trade Desk',
    },
    subtitle: {
      AZ: '3D AI Ticarət & İxrac Məsləhətçisi',
      EN: '3D AI Trade & Export Consultant',
      TR: '3D Yapay Zeka Ticaret & İhracat Danışmanı',
      RU: '3D ИИ Консультант по ВЭД и экспорту',
      AR: 'مستشار الذكاء الاصطناعي ثلاثي الأبعاد للتجارة والتصدير',
      ES: 'Consultor de Comercio Exterior 3D IA',
    },
    avatarUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f916/512.webp',
    greetingMessage: {
      AZ: 'Salam! Mən AZEXBUY Trade Desk AI məsləhətçisiyəm. Azərbaycan məhsulları, HS kodlar, Orta Dəhliz logistikası, AQTA sertifikatları və Incoterms qaydaları haqqında istədiyinizi soruşa bilərsiniz.',
      EN: 'Hello! I am your AZEXBUY Trade Desk AI consultant. Ask me anything about Azerbaijani commodities, HS codes, Middle Corridor logistics, phytosanitary certifications, or Incoterms terms.',
      TR: 'Merhaba! Ben AZEXBUY Trade Desk yapay zeka danışmanıyım. Azerbaycan ürünleri, HS kodları, Orta Koridor lojistiği, AQTA sertifikaları ve Incoterms kuralları hakkında sorularınızı yanıtlayabilirim.',
      RU: 'Здравствуйте! Я ИИ-консультант AZEXBUY Trade Desk. Задайте любой вопрос по азербайджанской продукции, кодам ТН ВЭД, логистике по Срединному коридору и сертификации.',
      AR: 'مرحباً! أنا مستشارك الذكي في AZEXBUY Trade Desk. اسألني عن المنتجات الأذربيجانية وشفرات HS واللوجستيات والشهادات.',
      ES: '¡Hola! Soy su asesor virtual de AZEXBUY Trade Desk. Pregúnteme sobre productos azerbaiyanos, códigos HS, logística del Corredor Central e Incoterms.',
    },
    faqChips: {
      AZ: [
        { q: 'Orta Dəhliz tranzit müddətləri və Ələt Limanı marşrutları' },
        { q: 'Azərbaycan fındığı üçün HS kodu və ixrac standartları' },
        { q: 'Incoterms 2020: FOB Bakı və CIF Konstansa fərqi nədir?' },
        { q: 'AQTA Fitosanitar və EUR.1 mənşə sertifikatları qaydaları' },
        { q: 'Azərbaycan narı və narşərab üçün Avropa İttifaqı tələbləri' },
      ],
      EN: [
        { q: 'Middle Corridor transit times and Port of Alat maritime routes' },
        { q: 'Azerbaijani hazelnuts HS code and export quality standards' },
        { q: 'Incoterms 2020: difference between FOB Baku and CIF Constanta' },
        { q: 'AQTA Phytosanitary inspection and EUR.1 origin certificate rules' },
        { q: 'How to register as an international buyer for bulk commodities' },
      ],
      TR: [
        { q: 'Orta Koridor transit süreleri ve Alat Limanı güzergahları' },
        { q: 'Azerbaycan fındığı GTİP kodu ve ihracat kalite standartları' },
        { q: 'Incoterms 2020: FOB Bakü ile CIF Köstence arasındaki farklar' },
        { q: 'AQTA Bitki Sağlığı ve EUR.1 Menşe Şahadetnamesi kuralları' },
      ],
      RU: [
        { q: 'Сроки транзита по Срединному коридору через порт Алят' },
        { q: 'Код ТН ВЭД для азербайджанского фундука и стандарты качества' },
        { q: 'Incoterms 2020: разница между FOB Баку и CIF Констанца' },
        { q: 'Фитосанитарные требования AQTA и сертификат происхождения EUR.1' },
      ],
      AR: [
        { q: 'أوقات العبور عبر الممر الأوسط ومسارات ميناء ألات' },
        { q: 'رمز النظام المنسق للبندق الأذربيجاني ومعايير الجودة' },
        { q: 'شروط إنكوترمز 2020: الفرق بين FOB باكو و CIF كونستانتسا' },
      ],
      ES: [
        { q: 'Tiempos de tránsito del Corredor Central y rutas del Puerto de Alat' },
        { q: 'Código HS de avellanas azerbaiyanas y estándares de calidad' },
        { q: 'Incoterms 2020: diferencias entre FOB Bakú y CIF Constanza' },
      ],
    },
    leadCaptureTitle: {
      AZ: 'Mütəxəssislə Birbaşa Əlaqə',
      EN: 'Connect with a Trade Desk Specialist',
      TR: 'Uzman ile Doğrudan İletişim',
      RU: 'Связь с торговым специалистом',
      AR: 'التواصل مع متخصص التجارة',
      ES: 'Conectar con un Especialista Comercial',
    },
    leadCaptureDesc: {
      AZ: 'E-poçtunuzu qeyd edin, ticarət deskimizin rəhbəri sizinlə rəsmi sənədləşmə üçün əlaqə saxlasın.',
      EN: 'Provide your business email and our lead commodity broker will follow up directly with custom pricing and documentation.',
      TR: 'E-postanızı belirtin, ticaret masası yöneticimiz resmi teklif için sizinle iletişime geçsin.',
      RU: 'Укажите ваш e-mail, и наш эксперт свяжется с вами для оформления коммерческого предложения.',
      AR: 'أدخل بريدك الإلكتروني ليتواصل معك مدير المكتب التجاري مباشرة.',
      ES: 'Ingrese su correo electrónico para que nuestro especialista le envíe cotizaciones oficiales.',
    },
    leadCaptureSuccess: {
      AZ: 'Sorğunuz qeydə alındı! Trade Desk komandamız tezliklə sizinlə əlaqə saxlayacaq.',
      EN: 'Inquiry received! Our Trade Desk specialists will contact you shortly.',
      TR: 'Talebiniz alındı! Ticaret masası ekibimiz en kısa sürede sizinle iletişime geçecektir.',
      RU: 'Запрос принят! Наш торговый отдел свяжется с вами в ближайшее время.',
      AR: 'تم استلام طلبكم بنجاح! سيتواصل معكم فريقنا التجاري قريباً.',
      ES: '¡Solicitud recibida! Nuestro equipo comercial se comunicará a la brevedad.',
    },
  },

  productSpecModal: {
    enabled: true,
    tabs: [
      { id: 'overview', label: { AZ: 'Məhsul Haqqında', EN: 'Overview', TR: 'Genel Bakış', RU: 'Обзор', AR: 'نظرة عامة', ES: 'Resumen' }, icon: 'fa-solid fa-list-check', enabled: true },
      { id: 'specs', label: { AZ: 'Texniki Göstəricilər', EN: 'Specifications', TR: 'Teknik Özellikler', RU: 'Спецификация', AR: 'المواصفات', ES: 'Especificaciones' }, icon: 'fa-solid fa-sliders', enabled: true },
      { id: 'packaging', label: { AZ: 'Qablaşdırma & Logistika', EN: 'Packaging & Freight', TR: 'Ambalaj & Lojistik', RU: 'Упаковка и логистика', AR: 'التغليف والشحن', ES: 'Embalaje y Flete' }, icon: 'fa-solid fa-box-open', enabled: true },
      { id: 'compliance', label: { AZ: 'Sertifikatlar & Standartlar', EN: 'Certifications', TR: 'Sertifikalar', RU: 'Сертификаты', AR: 'الشهادات', ES: 'Certificaciones' }, icon: 'fa-solid fa-certificate', enabled: true },
    ],
    badges: [
      { id: 'origin', label: { AZ: 'Mənşə: Azərbaycan', EN: 'Origin: Azerbaijan', TR: 'Menşe: Azerbaycan', RU: 'Происхождение: Азербайджан', AR: 'المنشأ: أذربيجان', ES: 'Origen: Azerbaiyán' }, bg: '#00243E', text: '#FFFFFF' },
      { id: 'tested', label: { AZ: 'Laboratoriya Analizli', EN: 'Lab Certified', TR: 'Laboratuvar Onaylı', RU: 'Лабораторный контроль', AR: 'معتمد مخبرياً', ES: 'Certificado por Laboratorio' }, bg: '#00B58D', text: '#FFFFFF' },
      { id: 'ready', label: { AZ: 'İxraca Hazır', EN: 'Export Ready', TR: 'İhracata Hazır', RU: 'Готово к экспорту', AR: 'جاهز للتصدير', ES: 'Listo para Exportación' }, bg: '#0075D5', text: '#FFFFFF' },
    ],
    rfqButtonText: {
      AZ: 'Qiymət Təklifi İstə (RFQ)',
      EN: 'Request Quotation (RFQ)',
      TR: 'Fiyat Teklifi İste (RFQ)',
      RU: 'Запросить котировку (RFQ)',
      AR: 'طلب عرض سعر (RFQ)',
      ES: 'Solicitar Cotización (RFQ)',
    },
    contactButtonText: {
      AZ: 'İstehsalçı ilə Əlaqə',
      EN: 'Contact Verified Producer',
      TR: 'Üretici ile İletişim',
      RU: 'Связаться с производителем',
      AR: 'الاتصال بالمنتج المعتمد',
      ES: 'Contactar Productor Verificado',
    },
  },

  searchModal: {
    enabled: true,
    placeholder: {
      AZ: 'Məhsul adı, HS kodu (məs. 080222), kateqoriya və ya bölgə ilə axtarın...',
      EN: 'Search by commodity name, HS code (e.g. 080222), category, or origin region...',
      TR: 'Ürün adı, GTİP kodu (ör. 080222), kategori veya bölgeye göre arayın...',
      RU: 'Поиск по наименованию товара, коду ТН ВЭД (напр. 080222) или региону...',
      AR: 'ابحث باسم السلعة، رمز HS (مثل 080222)، الفئة أو المنطقة...',
      ES: 'Buscar por nombre, código HS (ej. 080222), categoría o región de origen...',
    },
    quickCategories: [
      { id: 'all', label: { AZ: 'Bütün Məhsullar', EN: 'All Products', TR: 'Tüm Ürünler', RU: 'Все товары', AR: 'جميع السلع', ES: 'Todos los Productos' }, query: '' },
      { id: 'agro', label: { AZ: 'Aqrar & Təzə Məhsullar', EN: 'Agro & Fresh Produce', TR: 'Tarım & Yaş Meyve-Sebze', RU: 'Агро и свежие фрукты', AR: 'زراعي وطازج', ES: 'Agro y Frescos' }, query: 'agro' },
      { id: 'hazelnut', label: { AZ: 'Fındıq & Qoz Ləpəsi', EN: 'Hazelnuts & Nuts', TR: 'Fındık & Kuruyemiş', RU: 'Фундук и орехи', AR: 'بندق ومكسرات', ES: 'Avellanas y Frutos Secos' }, query: 'hazelnut' },
      { id: 'pomegranate', label: { AZ: 'Nar & Narşərab', EN: 'Pomegranates & Juices', TR: 'Nar & Nar Ekşisi', RU: 'Гранат и наршараб', AR: 'رمان وعصائر', ES: 'Granadas y Jugos' }, query: 'pomegranate' },
      { id: 'chemicals', label: { AZ: 'Kimya & Polimerlər', EN: 'Chemicals & Polymers', TR: 'Kimya & Polimerler', RU: 'Химия и полимеры', AR: 'كيماويات وبوليمرات', ES: 'Química y Polímeros' }, query: 'chemical' },
    ],
    trendingTags: [
      { tag: 'Ləpə Fındıq', query: 'fındıq' },
      { tag: 'Göyçay Narı', query: 'nar' },
      { tag: 'Zaqatala Çayı', query: 'çay' },
      { tag: 'Zirə Pomidoru', query: 'pomidor' },
      { tag: 'Qurudulmuş Xurma', query: 'xurma' },
      { tag: 'HS 080222', query: '080222' },
      { tag: 'Orta Dəhliz Logistika', query: 'logistika' },
      { tag: 'Polietilen & Polimer', query: 'polimer' },
    ],
    emptyStateTitle: {
      AZ: 'Uyğun nəticə tapılmadı',
      EN: 'No Matching Commodities Found',
      TR: 'Eşleşen sonuç bulunamadı',
      RU: 'Ничего не найдено',
      AR: 'لم يتم العثور على نتائج مطابقة',
      ES: 'No se encontraron resultados',
    },
    emptyStateDesc: {
      AZ: 'Fərqli açar sözü daxil edin və ya istədiyiniz məhsul üçün birbaşa RFQ göndərin.',
      EN: 'Try a different search query or submit a direct RFQ for targeted sourcing across Azerbaijan.',
      TR: 'Farklı bir arama terimi deneyin veya doğrudan bir RFQ gönderin.',
      RU: 'Попробуйте изменить поисковый запрос или отправьте индивидуальный RFQ.',
      AR: 'جرب كلمة بحث أخرى أو أرسل طلباً مباشراً (RFQ).',
      ES: 'Intente con otra palabra clave o envíe una solicitud RFQ directa.',
    },
  },

  dossierModal: {
    enabled: true,
    title: {
      AZ: 'Rəsmi İxrac Əməliyyat Dosyesi',
      EN: 'Official Sovereign Export Dossier',
      TR: 'Resmi İhracat İşlem Dosyası',
      RU: 'Официальное экспортное досье',
      AR: 'الملف الرسمي لعمليات التصدير',
      ES: 'Expediente Oficial de Exportación',
    },
    subtitle: {
      AZ: 'AZEXBUY Ticarət Platforması tərəfindən generasiya edilmiş rəsmi ixrac sənədi və spesifikasiyası.',
      EN: 'Official verified trade document generated by AZEXBUY National Export Engine.',
      TR: 'AZEXBUY Ticaret Platformu tarafından oluşturulan resmi ihracat belgesi.',
      RU: 'Официальный торговый документ, сформированный экспортной платформой AZEXBUY.',
      AR: 'وثيقة تجارية رسمية صادرة من منصة AZEXBUY الوطنية للتصدير.',
      ES: 'Documento comercial oficial emitido por la plataforma nacional de exportación AZEXBUY.',
    },
    officialSealText: {
      AZ: 'RƏSMİ AZEXBUY İXRAC TƏSDİQİ & MÖHÜRÜ',
      EN: 'OFFICIAL AZEXBUY EXPORT VERIFICATION SEAL',
      TR: 'RESMİ AZEXBUY İHRACAT ONAY MÜHRÜ',
      RU: 'ОФИЦИАЛЬНАЯ ПЕЧАТЬ И ВЕРИФИКАЦИЯ AZEXBUY',
      AR: 'الختم الرسمي والتوثيق المعتمد من AZEXBUY',
      ES: 'SELLO OFICIAL DE VERIFICACIÓN DE EXPORTACIÓN AZEXBUY',
    },
    termsNote: {
      AZ: 'Bu sənəd Azərbaycan Respublikasının müvafiq gömrük və fitosanitar qaydalarına uyğun ilkin rəsmi icraat sənədidir.',
      EN: 'This document constitutes an official preliminary export brief issued under national trade compliance standards.',
      TR: 'Bu belge, ulusal dış ticaret ve bitki sağlığı mevzuatına uygun resmi ön işlem dosyasıdır.',
      RU: 'Настоящий документ является предварительным торговым досье в соответствии с нормами ВЭД.',
      AR: 'تشكل هذه الوثيقة ملف تصدير رسمي تمهيدي وفقاً للقوانين الجمركية والصحية.',
      ES: 'Este documento constituye un expediente preliminar oficial emitido bajo estándares comerciales.',
    },
    printButtonText: {
      AZ: 'Çap Et / PDF Yadda Saxla',
      EN: 'Print / Save as PDF',
      TR: 'Yazdır / PDF Olarak Kaydet',
      RU: 'Печать / Сохранить в PDF',
      AR: 'طباعة / حفظ كملف PDF',
      ES: 'Imprimir / Guardar como PDF',
    },
  },
};
