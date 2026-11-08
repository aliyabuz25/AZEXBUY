import type BetterSqlite3 from 'better-sqlite3';
import { ABOUT_PAGE_DEFAULT } from '../../src/data/translations';

// ── 1. Categories ────────────────────────────────────────────────────────────
export const SEED_CATEGORIES = [
  { id: 'cat-food', name: 'Food Products', slug: 'food-products', description: 'Natural and processed organic food products from Azerbaijan', sort_order: 1 },
  { id: 'cat-agri', name: 'Agriculture & Fresh Produce', slug: 'agriculture', description: 'Fresh fruits, nuts, grains, and agricultural raw materials', sort_order: 2 },
  { id: 'cat-industrial', name: 'Industrial & Textiles', slug: 'industrial-products', description: 'Raw silk, cotton yarn, metals, and industrial materials', sort_order: 3 },
  { id: 'cat-chemicals', name: 'Chemicals & Extracts', slug: 'chemicals', description: 'Herbal extracts, licorice, saffron derivatives, and compounds', sort_order: 4 },
  { id: 'cat-construction', name: 'Construction Materials', slug: 'construction-materials', description: 'High-purity gypsum, bentonite, natural stone, and cement', sort_order: 5 },
  { id: 'cat-packaging', name: 'Packaging & Bulk Bags', slug: 'packaging', description: 'Industrial polypropylene sacks, FIBC big bags, and containers', sort_order: 6 },
];

// ── 2. Products ──────────────────────────────────────────────────────────────
export const SEED_PRODUCTS: any[] = [];

// ── 3. Services ──────────────────────────────────────────────────────────────
export const SEED_SERVICES = [
    {
      id: 'srv-market-access',
      title: {
        AZ: 'Beynəlxalq Bazar Araşdırması & Alıcı Axtarışı',
        EN: 'Global Market Intelligence & Buyer Sourcing',
        TR: 'Uluslararası Pazar Araştırması & Alıcı Temini',
        RU: 'Исследования глобальных рынков и поиск покупателей',
        AR: 'أبحاث السوق العالمية واستقطاب المشترين',
        ES: 'Inteligencia de Mercado Global y Búsqueda de Compradores'
      },
      description: {
        AZ: 'Məhsullarınız üçün Aİ, Körfəz (GCC), MDB və Asiya bazarlarında birbaşa B2B idxalçılar və distribyutorlar şəbəkəsinin formalaşdırılması.',
        EN: 'Establishing qualified B2B importer and distributor networks across EU, GCC, CIS and Asian priority trade corridors with verified buyers.',
        TR: 'Ürünleriniz için AB, Körfez (GCC), BDT ve Asya pazarlarında doğrudan B2B ithalatçı ve distribütör ağlarının kurulması.',
        RU: 'Формирование проверенных сетей импортеров и дистрибьюторов в ЕС, странах Персидского залива, СНГ и Азии с верифицированными контрагентами.',
        AR: 'تأسيس شبكات موثوقة من المستوردين والموزعين في الاتحاد الأوروبي ودول الخليج وآسيا.',
        ES: 'Establecimiento de redes cualificadas de importadores y distribuidores en mercados prioritarios con compradores verificados.'
      },
      scope: {
        AZ: [
          'Hədəf bazar idxal tariflərinin və gömrük tələblərinin analizi',
          'Təsdiqlənmiş kommersiya alıcılarının qısa siyahısının (shortlist) hazırlanması',
          'Birbaşa ikitərəfli B2B danışıqların təşkili və təqibi',
          'Rəqib qiymət analizi və daxilolma strategiyasının qurulması'
        ],
        EN: [
          'Customs tariff & import regulation feasibility analysis in target markets',
          'Vetted B2B commercial buyer shortlisting and KYC compliance check',
          'Direct buyer-supplier negotiation scheduling & structured follow-up',
          'Competitive price benchmarking and landed-cost modeling'
        ],
        TR: [
          'Hedef pazar gümrük tarifleri ve mevzuat analizi',
          'Onaylı ticari alıcı eşleştirmesi ve güvenilirlik incelemesi',
          'B2B görüşme koordinasyonu ve müzakere desteği',
          'Piyasa fiyat analizi ve maliyet simülasyonu'
        ],
        RU: [
          'Анализ таможенных тарифов и регуляторных требований целевого рынка',
          'Шорт-лист проверенных коммерческих покупателей и проверка благонадежности',
          'Организация и сопровождение прямых переговоров B2B',
          'Анализ цен конкурентов и расчет себестоимости с доставкой'
        ],
        AR: [
          'تحليل الرسوم الجمركية واللوائح التنظيمية في الأسواق المستهدفة',
          'إعداد قوائم المشترين التجاريين المعتمدين والموثوقين',
          'تنسيق وجدولة مفاوضات التجارة المباشرة بين الأطراف',
          'دراسة الأسعار المنافسة وحساب التكلفة الإجمالية'
        ],
        ES: [
          'Análisis arancelario y de normativas de importación en destino',
          'Selección de compradores B2B verificados y evaluación de solvencia',
          'Coordinación de reuniones comerciales y seguimiento de acuerdos',
          'Estudio comparativo de precios y cálculo de costes landed'
        ]
      },
      targetAudience: {
        AZ: 'Məhsulunu xarici bazarlara çıxarmaq istəyən yerli istehsalçılar və fermer təsərrüfatları',
        EN: 'Azerbaijani agricultural, industrial and chemical producers targeting global export markets',
        TR: 'Dış pazarlara açılmak isteyen Azerbaycanlı üreticiler ve sanayi kuruluşları',
        RU: 'Азербайджанские производители пищевой, аграрной и промышленной продукции',
        AR: 'الشركات المصنعة في أذربيجان الراغبة في التصدير للأسواق العالمية',
        ES: 'Fabricantes azerbaiyanos que buscan expandir sus ventas en mercados internacionales'
      },
      iconClass: 'fa-solid fa-chart-line',
      colorClass: 'bg-brandNavy',
      serviceType: 'primary',
      sortOrder: 1,
      isActive: 1
    },
    {
      id: 'srv-contracts-legal',
      title: {
        AZ: 'İxrac Müqavilələri, Escrow & Hüquqi Təminat',
        EN: 'Export Contracting, Escrow & Arbitration Support',
        TR: 'İhracat Sözleşmeleri, Escrow & Hukuki Destek',
        RU: 'Экспортные контракты, Эскроу и правовая поддержка',
        AR: 'عقود التصدير وخدمات الضمان المالي والتحكيم',
        ES: 'Contratos de Exportación, Garantía Escrow y Arbitraje'
      },
      description: {
        AZ: 'Incoterms® 2020 standartlarına uyğun ikidilli ixrac müqavilələrinin tərtibi, akkreditiv (L/C) və beynəlxalq arbitraj dəstəyi.',
        EN: 'Bilingual export contracts under Incoterms® 2020 standards, Letter of Credit (L/C) review, and Baku International Arbitration protocols.',
        TR: 'Incoterms® 2020 standartlarında çift dilli sözleşmeler, Akreditif (L/C) ve uluslararası tahkim mekanizmaları.',
        RU: 'Двуязычные экспортные контракты по стандартам Incoterms® 2020, аккредитивы (L/C) и арбитраж.',
        AR: 'صياغة عقود تصدير متوافقة مع شروط Incoterms® 2020 والاعتمادات المستندية.',
        ES: 'Contratos bilingües según Incoterms® 2020, cartas de crédito y arbitraje comercial.'
      },
      scope: {
        AZ: [
          'Incoterms® 2020 (FOB, CIF, DAP, FCA) üzrə hüquqi müqavilə tərtibi',
          'Bank akkreditivlərinin (L/C) və qarantiya məktublarının hüquqi ekspertizası',
          'Beynəlxalq ticarət mübahisələrinin məhkəmədənkənar tənzimlənməsi və arbitraj dəstəyi'
        ],
        EN: [
          'Drafting legally binding export agreements compliant with Incoterms® 2020',
          'Letter of Credit (L/C) and bank performance guarantee review',
          'Dispute mitigation and arbitration clauses under ICC & Baku Arbitration standards'
        ],
        TR: [
          'Incoterms® 2020 uyumlu uluslararası satış sözleşmelerinin hazırlanması',
          'Akreditif şartlarının risk denetimi ve bankacılık uyumu',
          'Uluslararası ticari uyuşmazlıklarda tahkim ve uzlaşma desteği'
        ],
        RU: [
          'Разработка экспортных договоров по правилам Incoterms® 2020',
          'Экспертиза условий аккредитивов и банковских гарантий',
          'Юридическое сопровождение споров в международном арбитраже'
        ],
        AR: [
          'صياغة عقود تجارية ملزمة وفق قواعد Incoterms® 2020',
          'مراجعة بنود خطابات الاعتماد المصرفية والضمانات البنكية',
          'تقديم الدعم القانوني والتحكيم الدولي في النزاعات التجارية'
        ],
        ES: [
          'Redacción de contratos de compraventa internacional bajo Incoterms® 2020',
          'Auditoría y verificación de cartas de crédito bancarias',
          'Soporte en resolución de disputas y cláusulas de arbitraje comercial'
        ]
      },
      targetAudience: {
        AZ: 'Hüquqi və maliyyə risklərini sıfıra endirmək istəyən ixracatçılar və xarici alıcılar',
        EN: 'Exporters and global buyers seeking secure legal framework and trade finance protection',
        TR: 'Hukuki ve finansal risklerini sıfırlamak isteyen ihracatçılar ve ithalatçılar',
        RU: 'Экспортеры и импортеры, заинтересованные в защите коммерческих интересов',
        AR: 'المصدرون والمستوردون الباحثون عن حماية قانونية ومالية شاملة',
        ES: 'Empresas exportadoras e importadoras que requieren total seguridad jurídica y financiera'
      },
      iconClass: 'fa-solid fa-file-contract',
      colorClass: 'bg-emerald-600',
      serviceType: 'primary',
      sortOrder: 2,
      isActive: 1
    },
    {
      id: 'srv-cert-phytosanitary',
      title: {
        AZ: 'AQTA, FSSC & Mənşə Sertifikatlaşdırılması',
        EN: 'AQTA, FSSC, Halal & Origin Certification Stack',
        TR: 'AQTA, FSSC, Helal & Menşe Belgelendirme',
        RU: 'Сертификация AQTA, FSSC, Халяль и происхождения',
        AR: 'شهادات AQTA وسلامة الغذاء وشهادة المنشأ',
        ES: 'Certificaciones Fitosanitarias, AQTA, Halal y Origen'
      },
      description: {
        AZ: 'EUR.1, CT-1, AQTA fitosanitar, ISO 22000, FSSC və Halal sertifikatlarının tam müşayiətlə operativ rəsmiləşdirilməsi.',
        EN: 'Full-stack support for EUR.1, Form CT-1, AQTA Phytosanitary, ISO 22000, FSSC 22000, and accredited Halal trade certificates.',
        TR: 'EUR.1, Form CT-1, AQTA bitki sağlığı, ISO 22000, FSSC 22000 ve Helal sertifikasyon süreçlerinin uçtan uca yönetimi.',
        RU: 'Оформление сертификатов EUR.1, СТ-1, фитосанитарных сертификатов AQTA, ISO 22000 и Халяль.',
        AR: 'استخراج شهادات EUR.1 و CT-1 والشهادات الصحية والامتثال لسلامة الأغذية.',
        ES: 'Tramitación integral de certificados EUR.1, CT-1, fitosanitarios y de calidad alimentaria.'
      },
      scope: {
        AZ: [
          'AQTA Qida Təhlükəsizliyi Qeydiyyatı və Fitosanitar/Baytarlıq sertifikatları',
          'EUR.1 və Forma CT-1 gömrük mənşə sertifikatlarının alınması (0% gömrük rüsumu üstünlüyü)',
          'Beynəlxalq akkreditə olunmuş laboratoriya analiz protokolları (CoA)'
        ],
        EN: [
          'AQTA Food Safety System registration, Phytosanitary and Veterinary clearance',
          'EUR.1 and Form CT-1 Certificate of Origin for preferential zero-duty customs access',
          'Accredited third-party laboratory Certificate of Analysis (CoA) protocol fulfillment'
        ],
        TR: [
          'AQTA Gıda Güvenliği ve Bitki Sağlığı/Veterinerlik ihraç belgeleri temini',
          'EUR.1 ve Form CT-1 menşe belgeleri ile gümrüksüz ticaret avantajı',
          'Uluslararası akredite laboratuvar analiz raporlarının (CoA) hazırlanması'
        ],
        RU: [
          'Регистрация в AQTA и получение фитосанитарных/ветеринарных сертификатов',
          'Сертификаты происхождения EUR.1 и СТ-1 для беспошлинного ввоза',
          'Организация испытаний в аккредитованных лабораториях (CoA)'
        ],
        AR: [
          'التسجيل في هيئة سلامة الغذاء AQTA واستخراج الشهادات الصحية الفيتوسانيتارية',
          'استخراج شهادات المنشأ EUR.1 و CT-1 للاستفادة من الإعفاءات الجمركية',
          'إجراء التحاليل المخبرية المعتمدة دولياً وشهادات الجودة (CoA)'
        ],
        ES: [
          'Registro en AQTA y obtención de certificados fitosanitarios y veterinarios',
          'Gestión de certificados de origen EUR.1 y Formulario CT-1 para arancel cero',
          'Informes analíticos en laboratorios acreditados de control de calidad (CoA)'
        ]
      },
      targetAudience: {
        AZ: 'Kənd təsərrüfatı, qida və kimya sənayesi istehsalçıları',
        EN: 'Food processors, agricultural producers and chemical manufacturers requiring trade accreditation',
        TR: 'Tarım, gıda ve kimya sektöründe faaliyet gösteren ihracatçı işletmeler',
        RU: 'Сельскохозяйственные и пищевые предприятия, планирующие экспорт',
        AR: 'منتجو الأغذية والسلع الزراعية الساعون للامتثال للمعايير الدولية',
        ES: 'Productores agroalimentarios e industriales con requisitos de certificación internacional'
      },
      iconClass: 'fa-solid fa-stamp',
      colorClass: 'bg-sky-600',
      serviceType: 'primary',
      sortOrder: 3,
      isActive: 1
    },
    {
      id: 'srv-logistics-corridor',
      title: {
        AZ: 'Orta Dəhliz Logistikası & Multimodal Nəqliyyat',
        EN: 'Middle Corridor Multimodal Logistics & Freight',
        TR: 'Orta Koridor Multimodal Lojistik & Taşımacılık',
        RU: 'Логистика Среднего коридора и мультимодальные перевозки',
        AR: 'الخدمات اللوجستية عبر الممر الأوسط والنقل متعدد الوسائط',
        ES: 'Logística Multimodal y Transporte por el Corredor Medio'
      },
      description: {
        AZ: 'Bakı Beynəlxalq Dəniz Ticarət Limanı (Ələt), BTQ dəmiryolu və multimodal quru yolları üzrə optimal tariflər və konteyner rezervasiyası.',
        EN: 'Port of Baku (Alat Hub), Baku-Tbilisi-Kars railway routing, multimodal road/rail bookings, and refrigerated reefer container solutions.',
        TR: 'Bakü Uluslararası Deniz Ticaret Limanı (Alat), BTK demiryolu ve karayolu rotalarında rekabetçi navlun ve konteyner tahsisi.',
        RU: 'Маршруты через порт Баку (Алят), ж/д Баку-Тбилиси-Карс, контейнерные и рефрижераторные перевозки.',
        AR: 'حلول الشحن عبر ميناء باكو (ألات) والسكك الحديدية وشاحنات التبريد.',
        ES: 'Rutas logísticas vía Puerto de Bakú, ferrocarril BTK y flete multimodal consolidado.'
      },
      scope: {
        AZ: [
          'Bakı Limanı (Ələt) vasitəsilə Xəzər dənizi fider daşımaları',
          'Bakı-Tbilisi-Qars (BTQ) xətti ilə Avropaya və Türkiyəyə birbaşa dəmiryol karvanları',
          'Temperatur nəzarətli (reefer) soyuduculu yükdaşımalar və GPS monitorinq'
        ],
        EN: [
          'Trans-Caspian feeder vessel shipping via Port of Baku (Alat Maritime Hub)',
          'Direct block-train bookings via Baku-Tbilisi-Kars (BTK) railway to Europe & Turkey',
          'Cold-chain reefer container logistics with live 24/7 telemetric GPS tracking'
        ],
        TR: [
          'Bakü Limanı (Alat) üzerinden Hazar Denizi besleme gemisi taşımacılığı',
          'Bakü-Tiflis-Kars (BTK) demiryolu ile Avrupa ve Türkiye bağlantılı blok trenler',
          'Sıcaklık kontrollü frigorifik (reefer) konteynerler ve anlık uydu takibi'
        ],
        RU: [
          'Транскаспийские перевозки через порт Баку (Алятский логистический хаб)',
          'Блок-поезда по железной дороге Баку-Тбилиси-Карс (БТК) в Турцию и Европу',
          'Рефрижераторные перевозки с круглосуточным температурным мониторингом'
        ],
        AR: [
          'النقل البحري عبر ميناء باكو (ألات) في بحر قزوين',
          'شحن القطارات المباشر عبر خط باكو - تبليسي - كارس نحو تركيا وأوروبا',
          'حاويات مبردة للحفاظ على سلسلة التبريد مع تتبع فوري عبر الأقمار الصناعية'
        ],
        ES: [
          'Transporte marítimo por el mar Caspio a través del Puerto de Bakú (Alat)',
          'Rutas en trenes bloque vía ferrocarril Bakú-Tiflis-Kars hacia Turquía y la UE',
          'Contenedores reefer con control térmico y seguimiento GPS 24/7'
        ]
      },
      targetAudience: {
        AZ: 'Tez və təhlükəsiz yük çatdırılması tələb edən beynəlxalq ticarət iştirakçıları',
        EN: 'International commercial buyers and export producers requiring predictable transit timeframes',
        TR: 'Hızlı ve güvenli teslimat isteyen uluslararası ticaret şirketleri',
        RU: 'Компании, заинтересованные в оптимизации сроков и стоимости транзита',
        AR: 'الشركات التجارية الباحثة عن سرعة وأمان نقل الشحنات الدولية',
        ES: 'Operadores comerciales que buscan plazos fiables y costes competitivos de flete'
      },
      iconClass: 'fa-solid fa-truck-fast',
      colorClass: 'bg-purple-600',
      serviceType: 'primary',
      sortOrder: 4,
      isActive: 1
    },
    {
      id: 'srv-outsourced-export',
      title: {
        AZ: 'Kənarlaşdırılmış (Outsourced) İxrac Departamenti',
        EN: 'Outsourced Export Department as a Service',
        TR: 'Dış Kaynaklı (Outsourced) İhracat Departmanı',
        RU: 'Аутсорсинг экспортного отдела (Turnkey Export)',
        AR: 'إدارة قسم التصدير الخارجي المتكامل للشركات',
        ES: 'Departamento de Exportación Externo (Outsourced)'
      },
      description: {
        AZ: 'Yerli istehsalçı üçün sıfırdan xarici ticarət komandasının qurulması: beynəlxalq yazışmalar, qiymət kalkulyasiyası, RFP/RFQ cavablandırma və logistik idarəetmə.',
        EN: 'Turnkey institutional export department for Azerbaijani manufacturers: international client correspondence, landed cost modeling, and end-to-end deal closing.',
        TR: 'Azerbaycanlı üreticiler için anahtar teslim dış ticaret yönetimi: uluslararası teklifler, maliyet hesapları ve sevkiyat takibi.',
        RU: 'Полное ведение экспортных операций производителя: международная переписка, расчет цен и закрытие сделок.',
        AR: 'إدارة عمليات التصدير بالكامل من تقديم العروض حتى إتمام الصفقات وتتبع الشحن.',
        ES: 'Gestión externalizada integral del departamento de comercio exterior para fabricantes.'
      },
      scope: {
        AZ: [
          'İngilis, Rus və Ərəb dillərində professional xarici ticarət yazışmaları və danışıqlar',
          'Məhsulun beynəlxalq standartlara uyğun texniki məlumat vərəqinin (TDS/MSDS) hazırlanması',
          'Daimi B2B sorğuların (RFQ) emalı, qiymət təkliflərinin göndərilməsi və sövdələşmələrin bağlanması',
          'Bütün gömrük və logistika proseslərinin açar-təhvil idarə edilməsi'
        ],
        EN: [
          'Multilingual export desk operating in English, Russian, Arabic, and Turkish',
          'Technical Data Sheet (TDS) and Material Safety Data Sheet (MSDS) localization',
          'Continuous inbound/outbound RFQ commercial proposal handling & closing',
          'End-to-end customs broker and shipping line coordination'
        ],
        TR: [
          'İngilizce, Rusça, Arapça ve Türkçe dillerinde tam kapsamlı ihracat yönetimi',
          'Uluslararası standartlarda teknik veri föyleri (TDS) ve katalog hazırlığı',
          'Gelen ticari taleplerin (RFQ) değerlendirilmesi ve satışa dönüştürülmesi',
          'Gümrük, nakliye ve tahsilat süreçlerinin uçtan uca yürütülmesi'
        ],
        RU: [
          'Ведение внешней торговли на английском, русском, арабском и турецком языках',
          'Разработка технических паспортов (TDS) и каталогов по мировым стандартам',
          'Обработка входящих запросов (RFQ), расчет котировок и заключение сделок',
          'Полное сопровождение таможенных и транспортных процедур'
        ],
        AR: [
          'إدارة اتصالات التجارة الخارجية متعددة اللغات (الإنجليزية، الروسية، العربية، التركية)',
          'إعداد المواصفات الفنية للسلع (TDS) والكتالوجات التصديرية الاحترافية',
          'معالجة استفسارات وعروض الشراء (RFQ) وإتمام التعاقدات التجارية',
          'إدارة العمليات الجمركية واللوجستية من البداية وحتى التسليم'
        ],
        ES: [
          'Mesa de exportación multilingüe en inglés, ruso, árabe y turco',
          'Fichas técnicas de producto (TDS) y catálogos comerciales adaptados',
          'Gestión activa de solicitudes de cotización (RFQ) y cierre de acuerdos',
          'Supervisión completa de aduanas, transporte y documentación de embarque'
        ]
      },
      targetAudience: {
        AZ: 'Ştatında xarici ticarət mütəxəssisi olmayan, lakin qlobal bazara çıxmaq istəyən istehsalçılar',
        EN: 'Manufacturers with strong production capacity but lacking an internal institutional export division',
        TR: 'Kendi bünyesinde dış ticaret ekibi kurmadan profesyonelce ihracat yapmak isteyen firmalar',
        RU: 'Производственные компании, желающие экспортировать без затрат на собственный штат ВЭД',
        AR: 'الشركات المصنعة ذات القدرات الإنتاجية الراغبة في التصدير دون تكاليف تأسيس قسم داخلي',
        ES: 'Empresas con capacidad productiva que prefieren externalizar la operativa de comercio exterior'
      },
      iconClass: 'fa-solid fa-briefcase',
      colorClass: 'bg-rose-600',
      serviceType: 'secondary',
      sortOrder: 5,
      isActive: 1
    },
    {
      id: 'srv-trade-fairs',
      title: {
        AZ: 'Beynəlxalq Sərgilərdə Təmsilçilik & B2B Missiyalar',
        EN: 'International Trade Exhibitions & B2B Matchmaking',
        TR: 'Uluslararası Fuarlarda Temsil & B2B Ticaret Heyetleri',
        RU: 'Представительство на международных выставках и B2B миссии',
        AR: 'التمثيل في المعارض التجارية الدولية وبعثات B2B',
        ES: 'Representación en Ferias Comerciales Internacionales y Misiones B2B'
      },
      description: {
        AZ: 'Gulfood, SIAL, Anuga və digər aparıcı qlobal sərgilərdə Azərbaycan məhsullarının təmsilçiliyi və fərdi B2B görüşlərin təşkili.',
        EN: 'Professional showcase and deal negotiation at premier global trade platforms including Gulfood (Dubai), SIAL (Paris), and Anuga (Cologne).',
        TR: 'Gulfood (Dubai), SIAL (Paris), Anuga (Köln) gibi küresel fuarlarda temsil ve ikili iş görüşmeleri organizasyonu.',
        RU: 'Участие и проведение переговоров на ключевых выставках: Gulfood (Дубай), SIAL (Париж), Anuga (Кельн).',
        AR: 'التمثيل في المعارض العالمية الكبرى مثل Gulfood و SIAL وتنظيم اللقاءات الثنائية مع المشترين الدوليين.',
        ES: 'Presencia en plataformas globales como Gulfood, SIAL y Anuga con agendas B2B cerradas.'
      },
      scope: {
        AZ: [
          'Aparıcı qlobal sərgilərdə vahid stend altında nümayiş və numunələrin təqdimatı',
          'Əvvəlcədən razılaşdırılmış fərdi B2B görüşlər cədvəli (matchmaking)',
          'Sərgi sonrası əlaqələrin sistemli təqibi və müqavilələrin bağlanması dəstəyi'
        ],
        EN: [
          'Product sampling and commercial booth representation at premier global expos',
          'Pre-scheduled curated one-on-one B2B matchmaking agendas with top buyers',
          'Post-exhibition CRM lead nurturing and direct order conversion support'
        ],
        TR: [
          'Prestijli uluslararası fuarlarda stant temsili ve ürün numunesi tanıtımı',
          'Büyük satın almacılarla önceden planlanmış B2B ikili iş görüşmeleri',
          'Fuar sonrası müşteri takibi ve siparişlerin sözleşmeye dönüştürülmesi'
        ],
        RU: [
          'Презентация образцов продукции на ведущих отраслевых выставках',
          'Организация индивидуальных B2B встреч с крупными байерами',
          'Поствыставочная работа с лидами и заключение контрактов'
        ],
        AR: [
          'عرض العينات والتمثيل في أجنحة كبرى المعارض الصناعية والغذائية الدولية',
          'جدولة اجتماعات عمل ثنائية B2B مع كبار المشترين وسلاسل التوريد',
          'متابعة العملاء المحتملين بعد المعرض وتحويل الفرص إلى عقود توريد'
        ],
        ES: [
          'Exhibición de muestras de producto en las principales ferias del sector',
          'Agendas personalizadas de reuniones B2B con compradores estratégicos',
          'Seguimiento post-feria para la conversión de contactos en contratos en firme'
        ]
      },
      targetAudience: {
        AZ: 'Brendini qlobal arenada tanıtmaq və birbaşa iri pərakəndə şəbəkələri ilə əlaqə qurmaq istəyən istehsalçılar',
        EN: 'Producers ready for international retail, supermarket and wholesale distributor exposure',
        TR: 'Markasını küresel vitrine çıkarmak isteyen ve büyük alıcı ağlarıyla buluşmayı hedefleyen firmalar',
        RU: 'Предприятия, нацеленные на выход в международные торговые сети и дистрибьюторские каналы',
        AR: 'الشركات الراغبة في تسويق علامتها التجارية والوصول لسلاسل التجزئة والموزعين الكبار',
        ES: 'Empresas con potencial de exportación interesadas en contactar con grandes distribuidores y cadenas'
      },
      iconClass: 'fa-solid fa-handshake',
      colorClass: 'bg-emerald-600',
      serviceType: 'secondary',
      sortOrder: 6,
      isActive: 1
    }
];

// ── 4. Articles ──────────────────────────────────────────────────────────────
export const SEED_ARTICLES = [
    {
      id: 'art-001',
      title: "Azerbaijan's Middle Corridor (TITR): Strategic Transit Gateway Connecting Asia and Europe in 2026",
      slug: 'azerbaijan-middle-corridor-new-silk-road',
      category: 'Market Insights',
      summary: 'How the Trans-Caspian International Transport Route (TITR) offers 12-day transit between China, Central Asia, Azerbaijan, and the European Union with unprecedented tariff predictability.',
      coverImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&q=80',
      seoTitle: 'Middle Corridor Logistics Gateway — Azerbaijan TITR Rail & Port of Baku',
      seoDescription: 'Strategic analysis of the Trans-Caspian Middle Corridor routing via Port of Baku and Baku-Tbilisi-Kars railway for Eurasian container shipping.',
      isFeatured: 1,
      isPublished: 1,
      author: 'AZEXBUY Logistics Desk',
      content: `### Executive Overview: The Trans-Caspian Advantage

The **Trans-Caspian International Transport Route (TITR)**, commonly designated as the **Middle Corridor**, has emerged as the premier geostrategic artery linking East Asian manufacturing hubs and Central Asian commodity basins with Western Europe.

Passing directly through the **Port of Baku at Alat**, the Middle Corridor eliminates congested maritime bottlenecks while bypassing northern transit routes subject to international sanctions and volatility.

---

### Key Infrastructure Pillars

1. **Port of Baku (Alat Logistics Hub):**
   * Annual cargo throughput capacity exceeding 15 million tons and 100,000 TEU containers in Phase 1, expanding to 25 million tons and 500,000 TEU in Phase 2.
   * Direct intermodal connection to standard and broad gauge railway networks.
   * Free Economic Zone (AFEZ) privileges with 0% corporate tax, 0% VAT, and free repatriation of capital.

2. **Baku–Tbilisi–Kars (BTK) Railway:**
   * Modernized rail corridor providing direct uninterrupted rail freight connectivity through Georgia and Turkey into the European standard gauge network.
   * Transit times from Baku to Turkish Mediterranean and Aegean ports reduced to just 48–72 hours.

3. **Digital Single Window & Unified Transit Tariffs:**
   * Elimination of redundant customs checks through harmonized electronic CIM/SMGS consignment notes.
   * Block-train tracking via synchronized GPS telematics across all participating Caspian littoral operators.

---

### Commercial Implications for Exporters and Buyers

International procurement desks sourcing Azerbaijani hazelnuts, pomegranates, petrochemicals, and mineral commodities benefit directly from guaranteed **door-to-door transit timeframes of 7–12 days** into Southern and Central Europe.

AZEXBUY provides integrated multimodal booking, container allocation, and transit insurance across all Middle Corridor segments.`
    },
    {
      id: 'art-002',
      title: 'Azerbaijani Hazelnut Export: 2026 Harvest Outlook, Calibration Standards and EU Compliance',
      slug: 'azerbaijan-hazelnut-export-2026-season',
      category: 'Export Guides',
      summary: 'Comprehensive B2B buyer guide on Ata-Baba hazelnut grading, aflatoxin control protocols, and preferential zero-tariff access under the EU-Azerbaijan partnership.',
      coverImage: 'https://images.unsplash.com/photo-1543257580-7269da773bf5?w=1200&q=80',
      seoTitle: 'Azerbaijani Hazelnut Export Guide 2026 — Ata-Baba Caliber & EU Standards',
      seoDescription: 'In-depth commercial guide for bulk buyers of Azerbaijani shelled and roasted hazelnuts. Quality grades, laboratory certification and packaging.',
      isFeatured: 1,
      isPublished: 1,
      author: 'AZEXBUY Agro Desk',
      content: `### Global Footprint of Azerbaijani Hazelnut

Azerbaijan consistently ranks within the **top four global exporters of premium shelled hazelnuts**, yielding over 50,000 metric tons of in-shell nuts annually. Cultivated predominantly in the fertile microclimates of Zaqatala, Balakan, Qakh, and Sheki, the endemic **Ata-Baba** cultivar represents over 85% of commercial export production.

---

### Critical Quality Parameters for Confectionery Buyers

* **Fat & Oleic Acid Composition:** Ata-Baba kernels feature 64%–68% natural oil content, imparting a naturally buttery, sweet profile ideal for chocolate, praline, and paste processing.
* **Caliber Classification:**
  * 11–13 mm: Preferred for whole-nut inclusions in milk and dark chocolate bars.
  * 13–15 mm: Premium retail snack packing and high-end dragees.
  * 9–11 mm: Optimal for roasting, dicing, and industrial hazelnut butter milling.

---

### Strict Aflatoxin and Microbiological Controls

To guarantee compliance with European Union Regulation (EU) 2023/915:
1. Every export consignment undergoes double Sortex optical laser sorting followed by manual inspection tables.
2. Official AQTA (Food Safety Agency of Azerbaijan) sampling verifies total Aflatoxin < 4.0 ppb and Aflatoxin B1 < 2.0 ppb.
3. Consignments are packed in food-grade multi-ply vacuum foil sacks flushed with nitrogen to suppress mold sporulation during ocean and rail transit.`
    },
    {
      id: 'art-003',
      title: 'The Sovereign Export Compliance Stack: How AQTA, Form CT-1, EUR.1 and ISO 22000 Unlock Zero-Tariff Access',
      slug: 'azerbaijan-export-certifications-guide',
      category: 'Trade Knowledge',
      summary: 'A step-by-step institutional overview of trade documentation required for zero-duty clearance into the CIS, European Union, and Gulf Cooperation Council (GCC) markets.',
      coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
      seoTitle: 'Azerbaijan Export Certifications Guide — AQTA, EUR.1, CT-1 and ISO Stack',
      seoDescription: 'Complete roadmap to trade certifications for Azerbaijani products. Preferential customs treatment, sanitary protocols, and international validity.',
      isFeatured: 0,
      isPublished: 1,
      author: 'AZEXBUY Legal & Compliance',
      content: `### Navigating the Azerbaijani Export Regulatory Landscape

For international buyers and local manufacturers alike, documentation integrity is the single most critical factor in guaranteeing frictionless border clearance.

---

### 1. Proof of Preferential Origin

* **Form CT-1:** Issued for trade within the Commonwealth of Independent States (CIS) Free Trade Agreement. Grants **0% import tariff** on all qualifying Azerbaijani agricultural and manufactured goods.
* **Movement Certificate EUR.1:** Issued under bilateral trade agreements with the EU, EFTA, and partner nations. Certifies that goods have undergone substantial transformation in Azerbaijan.

---

### 2. Sanitary and Phytosanitary Governance: AQTA

The **Food Safety Agency of the Republic of Azerbaijan (AQTA)** operates in direct alignment with Codex Alimentarius, the World Organisation for Animal Health (WOAH), and IPPC standards.

Every commercial food consignment dispatched via AZEXBUY includes:
* International Phytosanitary Certificate (Plant products)
* International Veterinary Health Certificate (Animal products & honey)
* Food Safety Certificate verifying absence of heavy metals, pesticides, and radionuclide contamination.`
    },
    {
      id: 'art-004',
      title: 'Goychay Pomegranate (PGI): Seasonal Windows, NFC Juice Processing and Gulf Market Expansion',
      slug: 'pomegranate-goychay-pgi-export-2026',
      category: 'Industry Updates',
      summary: 'Analyzing the commercial dynamics of Azerbaijan’s iconic ruby pomegranate harvest, cold-pressed processing capabilities, and burgeoning GCC retail demand.',
      coverImage: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=1200&q=80',
      seoTitle: 'Goychay Pomegranate Export 2026 — Fresh Fruit & NFC Juice B2B Guide',
      seoDescription: 'Market dynamics of Goychay PGI pomegranates. Harvest calendars, cold chain logistics to Dubai, Doha and Riyadh, and bulk juice procurement.',
      isFeatured: 1,
      isPublished: 1,
      author: 'AZEXBUY Agricultural Desk',
      content: `### The Unique Terroir of Goychay

Situated at the intersection of four climatic zones in the Shirvan plain, the Goychay district possesses alluvial soils rich in calcium carbonate, combined with scorching summer heat and crisp autumn nights. This produces pomegranates with **unrivaled sugar-acid balance (16.5°–18° Brix)** and thin, pliable rinds that resist splitting during packing.

---

### Harvest Calendar and Export Shipping Windows

* **Early Harvest (Guleysha Pink):** September 25 – October 15. Ideal for early airfreight into premium supermarket programs in the UAE and Qatar.
* **Peak Harvest (Guleysha Red & Bala Mursal):** October 15 – November 25. Large heavy fruits (400g–650g) with deep ruby arils, optimized for sea reefer and cold-chain road transit.
* **Cold Storage Window:** November 25 – February 28. Stored in modern Controlled Atmosphere (CA) cold storage facilities at 5°C and 90% relative humidity.`
    }
];

// ── 5. CMS Carousel Products ─────────────────────────────────────────────────
export const SEED_CMS_PRODUCTS = [
      {
        id: 'hazelnut-080222',
        featured: true,
        hsCode: '080222',
        categoryKey: 'agro',
        name: {
          EN: 'Ata-Baba Shelled Hazelnuts',
          AZ: 'Ata-Baba Fındıq Ləpəsi',
          TR: 'Ata-Baba Fındık İçi',
          RU: 'Фундук очищенный Ата-Баба',
          AR: 'بندق أتا-بابا مقشر فاخر',
          ES: 'Avellanas Peladas Ata-Baba'
        },
        categoryLabel: {
          EN: 'Agriculture & Food',
          AZ: 'Kənd Təsərrüfatı və Qida',
          TR: 'Tarım ve Gıda',
          RU: 'Сельское хозяйство и продукты',
          AR: 'الزراعة والأغذية',
          ES: 'Agricultura y Alimentos'
        },
        shortDesc: {
          EN: 'Extra-grade shelled natural & roasted Ata-Baba hazelnuts from Zaqatala-Sheki orchards.',
          AZ: 'Zaqatala-Şəki bağlarından ekstra növlü təbii və qovrulmuş Ata-Baba fındıq ləpəsi.',
          TR: 'Zakatala-Şeki bahçelerinden ekstra kalite doğal ve kavrulmuş Ata-Baba fındık içi.',
          RU: 'Очищенный натуральный и обжаренный фундук сорта Ата-Баба высшего качества из Загаталы.',
          AR: 'بندق طبيعي ومحمص من الدرجة الأولى من بساتين زاقاتالا وشكي الأذربيجانية.',
          ES: 'Avellanas naturales y tostadas de calidad extra de los huertos de Zaqatala-Sheki.'
        },
        originRegion: {
          EN: 'Zaqatala – Sheki Economic Region',
          AZ: 'Zaqatala – Şəki İqtisadi Rayonu',
          TR: 'Zakatala – Şeki Ekonomik Bölgesi',
          RU: 'Загатало-Шекинский экономический район',
          AR: 'منطقة زاقاتالا - شكي الاقتصادية',
          ES: 'Región Económica de Zaqatala – Sheki'
        },
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6iP6ACTY6rFPAXNJlK_W-AfkWR_1OBE8I3wLkCwVMAlQIyNvxAXxK1kYe6-itoVecrpqtsSok0_wQ1QnYyWcn40Hikz269v2ag3TbKrY9lfqw3mEVtR-I0GvclcQXFDi0q_xVPYMdzpIFMaXwgeJEs4gwsCpcf-Dn7Df8QGIeKoSael0DxSBY2ZpmoWYe8Ynhio_Q0dONzHarqS9Kp31IStn01T44xVmJ90B5TY2WFQr7mOmo4Ucq',
        minOrderQty: '20 MT (1x 20ft FCL)',
        annualCapacity: '24,000 MT',
        verifiedSuppliersCount: 38,
        incoterms: ['FCA', 'FOB', 'CIF', 'DAP'],
        certifications: ['ISO 22000', 'FSSC 22000', 'AQTA Phytosanitary', 'EUR.1 / CT-1', 'Halal'],
        leadTimeDays: '7–12 Days',
        packaging: {
          EN: '25kg / 50kg vacuum foil bags in corrugated cartons or 800kg big-bags',
          AZ: '25kq / 50kq vakuum folqa kisələr və ya 800kq biq-bəqlər',
          TR: '25kg / 50kg vakumlu folyo torbalarda veya 800kg big-bag',
          RU: 'Вакуумные пакеты по 25/50 кг в картонных коробах или биг-бэги по 800 кг',
          AR: 'أكياس رقائق مفرغة من الهواء سعة 25/50 كجم أو أكياس كبيرة سعة 800 كجم',
          ES: 'Bolsas de vacío de 25/50 kg en cajas de cartón o big-bags de 800 kg'
        },
        gradeSpecs: {
          EN: 'Caliber 11–13mm, 13–15mm | Moisture < 5.0% | Aflatoxin B1 < 2ppb (EU Standard)',
          AZ: 'Kalibr 11–13mm, 13–15mm | Nəmlik < 5.0% | Aflatoksin B1 < 2ppb (Aİ Standartı)',
          TR: 'Kalibre 11–13mm, 13–15mm | Nem < %5.0 | Aflatoksin B1 < 2ppb (AB Standardı)',
          RU: 'Калибр 11–13мм, 13–15мм | Влажность < 5.0% | Афлатоксин B1 < 2ppb (Стандарт ЕС)',
          AR: 'العيار 11-13 مم، 13-15 مم | الرطوبة < 5% | الأفلاتوكسين B1 < 2 جزء في المليار',
          ES: 'Calibre 11–13mm, 13–15mm | Humedad < 5.0% | Aflatoxina B1 < 2ppb (Norma UE)'
        }
      },
      {
        id: 'pomegranate-081090',
        featured: true,
        hsCode: '081090',
        categoryKey: 'agro',
        name: {
          EN: 'Goychay Pomegranate & 100% NFC Juice',
          AZ: 'Göyçay Narı və 100% Təbii Nar Şirəsi',
          TR: 'Göyçay Narı ve %100 Doğal Nar Suyu',
          RU: 'Гранат Гёйчай и 100% сок прямого отжима',
          AR: 'رمان غويتشاي الشهير وعصير طبيعي 100%',
          ES: 'Granadas de Goychay y Zumo 100% Natural NFC'
        },
        categoryLabel: {
          EN: 'Agriculture & Food',
          AZ: 'Kənd Təsərrüfatı və Qida',
          TR: 'Tarım ve Gıda',
          RU: 'Сельское хозяйство и продукты',
          AR: 'الزراعة والأغذية',
          ES: 'Agricultura y Alimentos'
        },
        shortDesc: {
          EN: 'Protected Geographical Indication (PGI) Goychay red ruby pomegranates and cold-pressed NFC pure juice.',
          AZ: 'Coğrafi göstəricili (PGI) Göyçay yaqut narları və soyuq sıxım 100% təbii nar şirəsi.',
          TR: 'Coğrafi işaretli (PGI) Göyçay yakut narları ve soğuk sıkım %100 doğal nar suyu.',
          RU: 'Географически защищенный гёйчайский рубиновый гранат и 100% сок прямого отжима.',
          AR: 'رمان غويتشاي ذو المؤشر الجغرافي المحمي وعصير الرمان الطبيعي المعصور على البارد.',
          ES: 'Granadas rubí de Goychay con Indicación Geográfica Protegida y zumo puro prensado en frío.'
        },
        originRegion: {
          EN: 'Central Aran (Goychay) Economic Region',
          AZ: 'Mərkəzi Aran (Göyçay) İqtisadi Rayonu',
          TR: 'Merkezi Aran (Göyçay) Ekonomik Bölgesi',
          RU: 'Центрально-Аранский (Гёйчай) экономический район',
          AR: 'منطقة أران الوسطى (غويتشاي) الاقتصادية',
          ES: 'Región Económica de Aran Central (Goychay)'
        },
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHo5g8iKevybJcG4jlFPGTNzuPMU2721wxSfNRS3s0FmbZeA3YW4AxkdXtyhH_55x-4s5Uh_5-S2-S3LVPexC1O1ahPg_Hgeeion6snYi_eyi7MNDXh5coR3k9acztB4DSA_PV9JjS_JAitpfDEAmO4UUbAUjAs0VuwpjvFbKeEaRXeqGiJ2JKU_vHqlhTa6Meil6iamn-3I_33E-Y7Tii2hclP8mfc_jBNp_gJSQpmbKniKtPJu5s',
        minOrderQty: '18 MT (1x 40ft Reefer FCL)',
        annualCapacity: '40,000 MT',
        verifiedSuppliersCount: 42,
        incoterms: ['FCA', 'FOB', 'CIF', 'CIP'],
        certifications: ['GlobalG.A.P.', 'ISO 22000', 'AQTA Phytosanitary', 'EUR.1 / CT-1', 'Halal'],
        leadTimeDays: '5–10 Days',
        packaging: {
          EN: 'Fresh: 4.5kg open-top cartons with cell dividers. Juice: 200L aseptic drums / 1L glass bottles',
          AZ: 'Təzə: 4.5kq xüsusi karton qutular. Şirə: 200L aseptik çəlləklər / 1L şüşə butulkalar',
          TR: 'Taze: 4.5kg viyollü açık karton kutular. Meyve suyu: 200L aseptik variller / 1L cam şişeler',
          RU: 'Свежий: картонные коробки 4.5 кг с ячейками. Сок: асептические бочки 200 л / стекло 1 л',
          AR: 'طازج: كراتين 4.5 كجم مع فواصل. عصير: براميل معقمة سعة 200 لتر أو زجاجات سعة 1 لتر',
          ES: 'Fresco: cajas de 4.5 kg con alvéolos. Zumo: bidones asépticos de 200L / botellas de 1L'
        },
        gradeSpecs: {
          EN: 'Brix 16.5°–18.0° | Weight 300g–550g | Cold-Chain Reefer 5°C with controlled atmosphere',
          AZ: 'Briks 16.5°–18.0° | Çəki 300q–550q | 5°C dərəcədə idarəolunan soyuducu zəncir',
          TR: 'Brix %16.5–%18.0 | Ağırlık 300g–550g | 5°C kontrollü atmosferli soğuk zincir',
          RU: 'Брикс 16.5°–18.0° | Вес 300–550 г | Рефрижераторная цепочка 5°C с контролем среды',
          AR: 'بريكس 16.5° - 18.0° | الوزن 300 - 550 جم | نقل مبرد بدرجة حرارة 5 مئوية',
          ES: 'Brix 16.5°–18.0° | Peso 300g–550g | Cadena de frío a 5°C en atmósfera controlada'
        }
      },
      {
        id: 'saffron-091020',
        featured: true,
        hsCode: '091020',
        categoryKey: 'agro',
        name: {
          EN: 'Absheron Royal Saffron Threads',
          AZ: 'Abşeron Şah Zəfəran Ləçəkləri',
          TR: 'Abşeron Şah Safran Telleri',
          RU: 'Абшеронский царский шафран (нити)',
          AR: 'خيوط زعفران أبشيرون الملكي النقي',
          ES: 'Hebras de Azafrán Real de Absheron'
        },
        categoryLabel: {
          EN: 'Specialty Crops & Spices',
          AZ: 'Xüsusi Bitkilər və Ədviyyatlar',
          TR: 'Özel Mahsuller ve Baharatlar',
          RU: 'Специи и особые культуры',
          AR: 'المحاصيل الخاصة والتوابل',
          ES: 'Especias y Cultivos Especiales'
        },
        shortDesc: {
          EN: 'ISO 3632 Category I pure all-red Sargol saffron hand-harvested in Bilgah, Absheron.',
          AZ: 'Bilgəh kəndində əllə yığılmış ISO 3632 Kateqoriya I təmiz qırmızı Şah zəfəran.',
          TR: 'Bilgah köyünde elle toplanmış ISO 3632 Kategori I saf kırmızı Şah safranı.',
          RU: 'Чистый красный шафран высшей категории ISO 3632 I, собранный вручную в Бильгя.',
          AR: 'زعفران سارجول أحمر نقي مقطوف يدوياً وفق معايير ISO 3632 الفئة الأولى.',
          ES: 'Azafrán puro Sargol Categoría I ISO 3632 cosechado a mano en Bilgah, Absheron.'
        },
        originRegion: {
          EN: 'Absheron – Khizi (Bilgah) Economic Region',
          AZ: 'Abşeron – Xızı (Bilgəh) İqtisadi Rayonu',
          TR: 'Abşeron – Hızı (Bilgah) Ekonomik Bölgesi',
          RU: 'Абшерон-Хызынский (Бильгя) экономический район',
          AR: 'منطقة أبشيرون - خيزي (بيلغاه) الاقتصادية',
          ES: 'Región Económica de Absheron – Khizi (Bilgah)'
        },
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtNJYRxE2w63MPzGdjf8CPD9AEFm8HRgiA_8S4bLzI4JlWkzMSr7mOrBFN0clACdJ8Z4fdPmTxcUeQZoVHwM8X0BSrp3Ge5V1rjnXGei5GwaARNkgff5T_0xspZitbC-LuPEjlYnoFGRTUx9-xnXkSS6296Qbk6OBMxFoPcu45Ph_IWPgxe8ghwkwSRb4DFc747hiqPs4hl6mD0u0fkbzXC86IW3Go3l5Gt49vsGvyFE6w27cyqJpi',
        minOrderQty: '5 kg (Express Air Freight)',
        annualCapacity: '1,500 kg',
        verifiedSuppliersCount: 14,
        incoterms: ['FCA', 'CIP', 'DAP'],
        certifications: ['ISO 3632-1 Cat I', 'AQTA Health Certificate', 'EUR.1 / CT-1', 'CoA Lab Test'],
        leadTimeDays: '3–7 Days',
        packaging: {
          EN: '100g, 250g, 500g nitrogen-sealed tins or glass jars in luxury master cartons',
          AZ: '100q, 250q, 500q azotla qorunan metal bankalar və ya şüşə qablar',
          TR: '100g, 250g, 500g azot korumalı metal kutularda veya cam kavanozlarda',
          RU: 'Азотонаполненные металлические банки 100/250/500 г или стекло в подарочных коробах',
          AR: 'علب معدنية محكمة محقونة بالنيتروجين سعة 100 و 250 و 500 جم أو عبوات زجاجية',
          ES: 'Latas selladas con nitrógeno de 100g, 250g, 500g o frascos de vidrio'
        },
        gradeSpecs: {
          EN: 'Crocin (Coloring Strength) > 240 | Safranal (Aroma) 35–45 | Picrocrocin > 85',
          AZ: 'Krosin (Rəng gücü) > 240 | Safranal (Ətir) 35–45 | Pikrokrosin > 85',
          TR: 'Krosin (Renk gücü) > 240 | Safranal (Aroma) 35–45 | Pikrokrosin > 85',
          RU: 'Кроцин (красящая сила) > 240 | Сафранал (аромат) 35–45 | Пикрокроцин > 85',
          AR: 'قوة التلوين كروسين > 240 | الرائحة سافرانال 35-45 | المذاق بيكروكروسين > 85',
          ES: 'Crocin (Fuerza colorante) > 240 | Safranal (Aroma) 35–45 | Picrocrocin > 85'
        }
      },
      {
        id: 'silk-500200',
        featured: true,
        hsCode: '500200',
        categoryKey: 'industrial',
        name: {
          EN: 'Sheki 100% Mulberry Raw Silk Yarn (20/22D)',
          AZ: 'Şəki 100% Barama Xam İpək İpliyi (20/22D)',
          TR: 'Şeki %100 Doğal Ham İpek İpliği (20/22D)',
          RU: 'Шекинский 100% шелк-сырец из коконов шелкопряда (20/22D)',
          AR: 'خيوط حرير التوت الطبيعي الخام من شكي (20/22D)',
          ES: 'Hilos de Seda Cruda 100% de Morera de Sheki (20/22D)'
        },
        categoryLabel: {
          EN: 'Industrial Materials & Textiles',
          AZ: 'Sənaye Materialları və Tekstil',
          TR: 'Sanayi Malzemeleri ve Tekstil',
          RU: 'Промышленные материалы и текстиль',
          AR: 'المواد الصناعية والمنسوجات',
          ES: 'Materiales Industriales y Textiles'
        },
        shortDesc: {
          EN: 'Premium 4A/5A grade white mulberry raw silk yarn reeled at the historic Sheki Silk mill.',
          AZ: 'Tarixi Şəki İpək kombinatında istehsal edilmiş 4A/5A növlü ağ tut ipək ipliyi.',
          TR: 'Tarihi Şeki İpek fabrikasında üretilen 4A/5A kalite beyaz dut ham ipek ipliği.',
          RU: 'Белый шелк-сырец высшего сорта 4A/5A с исторического Шекинского шелкового комбината.',
          AR: 'خيوط حرير التوت الأبيض الطبيعي الفاخر فئة 4A/5A من مصانع شكي التاريخية.',
          ES: 'Seda cruda blanca de morera de grado 4A/5A hilada en la fábrica histórica de Sheki.'
        },
        originRegion: {
          EN: 'Sheki – Zaqatala Economic Region',
          AZ: 'Şəki – Zaqatala İqtisadi Rayonu',
          TR: 'Şeki – Zakatala Ekonomik Bölgesi',
          RU: 'Шеки-Загатальский экономический район',
          AR: 'منطقة شكي - زاقاتالا الاقتصادية',
          ES: 'Región Económica de Sheki – Zaqatala'
        },
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD03XXHtlryKOF4P13Jsyapcx1cJC4md04R7W4OmhEOlilzH3GXC84pohKdFeZC2E26PSlasR8hsE1ZhUMI_m0G3EvLUmCLYXAFuMf-8fVmPxAaSz6rXZE5DhZfy_GWTdrnj6b_8WD4Q3Rrvlu3AYTUq_hrwc41KTaORWxIqz41fZ3sVhVp_icHS5yhXQKuIuOFb0jjF16nF7IcXL9rWJ5SplYRdK1DWGo-wlLK2UlgnkEWl6JIaR20',
        minOrderQty: '500 kg (1 Pallet)',
        annualCapacity: '120 MT',
        verifiedSuppliersCount: 6,
        incoterms: ['FCA', 'FOB', 'CIF', 'CIP'],
        certifications: ['OEKO-TEX Standard 100', 'ISO 9001:2015', 'EUR.1 / CT-1'],
        leadTimeDays: '10–18 Days',
        packaging: {
          EN: '50kg export wooden cases or heavy corrugated cartons, hanks wrapped in protective polyethylene',
          AZ: '50kq ixrac taxta yeşikləri və ya polietilenlə qorunan qalın karton qutular',
          TR: '50kg ahşap sandıklarda veya polietilen korumalı mukavva kolilerde',
          RU: 'Деревянные ящики по 50 кг или плотный картон с полиэтиленовой защитой мотков',
          AR: 'صناديق خشبية سعة 50 كجم أو كراتين مقواة مع تغليف عازل للرطوبة',
          ES: 'Cajas de madera de exportación de 50 kg o cartón grueso con protección de polietileno'
        },
        gradeSpecs: {
          EN: 'Grade 4A/5A | Denier 20/22D | Elongation 18%–22% | Evenness Deviation < 85%',
          AZ: 'Növ 4A/5A | Denye 20/22D | Uzama 18%–22% | Bərabərlik sapması < 85%',
          TR: 'Kalite 4A/5A | Denye 20/22D | Uzama %18–%22 | Düzgünlük sapması < %85',
          RU: 'Сорт 4A/5A | Денье 20/22D | Удлинение 18%–22% | Отклонение равномерности < 85%',
          AR: 'درجة الجودة 4A/5A | العيار 20/22D | الاستطالة 18% - 22% | انتظام الخيط < 85%',
          ES: 'Grado 4A/5A | Denier 20/22D | Elongación 18%–22% | Desviación de uniformidad < 85%'
        }
      }
    ];

// ── 6. Seeding Function ──────────────────────────────────────────────────────
export function seedAzexbuyData(db: BetterSqlite3.Database) {
  const now = new Date().toISOString();

  // 1. Categories
  const insertCat = db.prepare(`
    INSERT OR REPLACE INTO azexbuy_categories (id, created_at, name, slug, description, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);
  for (const c of SEED_CATEGORIES) {
    insertCat.run(c.id, now, c.name, c.slug, c.description, c.sort_order);
  }

  // 2. Products
  const insertProd = db.prepare(`
    INSERT OR REPLACE INTO azexbuy_products
    (id, created_at, updated_at, category_id, name, slug, short_description, description, technical_specs, images, moq, certificates, packaging_info, hs_code, origin_region, is_active, is_featured, seo_title, seo_description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
  `);
  for (const p of SEED_PRODUCTS) {
    insertProd.run(
      p.id, now, now, p.categoryId, p.name, p.slug, p.shortDescription, p.description,
      JSON.stringify(p.technicalSpecs), JSON.stringify(p.images), p.moq,
      JSON.stringify(p.certificates), p.packagingInfo, p.hsCode, p.originRegion,
      p.isFeatured, p.seoTitle, p.seoDescription
    );
  }

  // 3. Services
  const insertService = db.prepare(`
    INSERT OR REPLACE INTO azexbuy_services
    (id, created_at, updated_at, title, description, scope, target_audience, icon_class, color_class, service_type, is_active, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const s of SEED_SERVICES) {
    insertService.run(
      s.id, now, now,
      JSON.stringify(s.title),
      JSON.stringify(s.description),
      JSON.stringify(s.scope),
      JSON.stringify(s.targetAudience),
      s.iconClass, s.colorClass, s.serviceType, s.isActive, s.sortOrder
    );
  }

  // 4. Articles
  const insertArticle = db.prepare(`
    INSERT OR REPLACE INTO azexbuy_articles
    (id, created_at, updated_at, title, slug, category, summary, content, cover_image, seo_title, seo_description, is_published, is_featured, published_at, author)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const a of SEED_ARTICLES) {
    insertArticle.run(
      a.id, now, now, a.title, a.slug, a.category, a.summary, a.content, a.coverImage,
      a.seoTitle, a.seoDescription, a.isPublished, a.isFeatured, now, a.author
    );
  }

  // 5. Team Members
  const insertTeam = db.prepare(`
    INSERT OR REPLACE INTO azexbuy_team_members
    (id, created_at, updated_at, name, role, bio, photo, email, linkedin, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const SEED_TEAM = [
    {
      id: 'tm-001', name: 'Ali Əhmədov',
      role: { AZ:'Baş İcraçı Direktor', EN:'Chief Executive Officer', TR:'Genel Müdür', RU:'Генеральный директор', AR:'الرئيس التنفيذي', ES:'Director Ejecutivo' },
      bio: { AZ:'Beynəlxalq ticarət və ixrac sahəsində 15 ildən çox təcrübəyə malik. AZEXBUY-un quruluşundan bəri şirkətin inkişafına rəhbərlik edir.', EN:'Over 15 years of experience in international trade and export. Leading the strategic growth and global partnerships of AZEXBUY.', TR:'Uluslararası ticaret ve ihracat alanında 15 yılı aşkın deneyime sahip.', RU:'Более 15 лет опыта в международной торговле и экспорте.', AR:'أكثر من 15 عاماً من الخبرة في التجارة الدولية والتصدير.', ES:'Más de 15 años de experiencia en comercio internacional y exportación.' },
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      email: 'ceo@azexbuy.com', linkedin: 'https://linkedin.com', sortOrder: 1
    },
    {
      id: 'tm-002', name: 'Leyla Hüseynova',
      role: { AZ:'İxrac Əməliyyatları Direktoru', EN:'Director of Export Operations', TR:'İhracat Operasyonları Direktörü', RU:'Директор по экспортным операциям', AR:'مديرة عمليات التصدير', ES:'Directora de Operaciones de Exportación' },
      bio: { AZ:'Sertifikasiya, gömrük prosedurları və beynəlxalq lojistika sahəsində ixtisaslaşmış. 10 ildən çox sahə təcrübəsi var.', EN:'Specializes in product certification, customs regulations, and multimodal logistics across EU and GCC corridors.', TR:'Sertifikasyon, gümrük prosedürleri ve uluslararası lojistik alanında uzmanlaşmış.', RU:'Специализируется на сертификации, таможенных процедурах и международной логистике.', AR:'متخصصة في الشهادات والإجراءات الجمركية واللوجستيات الدولية.', ES:'Especializada en certificación, procedimientos aduaneros y logística internacional.' },
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
      email: 'export@azexbuy.com', linkedin: 'https://linkedin.com', sortOrder: 2
    },
    {
      id: 'tm-003', name: 'Murad Quliyev',
      role: { AZ:'Bazar Araşdırması və Alıcı Əlaqələri', EN:'Market Research & Buyer Relations', TR:'Pazar Araştırması ve Alıcı İlişkileri', RU:'Исследование рынков и работа с покупателями', AR:'بحوث السوق وعلاقات المشترين', ES:'Investigación de Mercado y Relaciones con Compradores' },
      bio: { AZ:'Avropa, Körfəz və Asiya bazarlarında alıcı axtarışı və kommersiya danışıqlarında ixtisaslaşmışdır.', EN:'Focuses on buyer sourcing, market intelligence, and structured commercial negotiations in European and Asian markets.', TR:'Avrupa, Körfez ve Asya pazarlarında alıcı arama ve ticari müzakerelerde uzmanlaşmıştır.', RU:'Специализируется на поиске покупателей и коммерческих переговорах на европейских, ближневосточных и азиатских рынках.', AR:'متخصص في البحث عن المشترين والتفاوض التجاري في الأسواق الأوروبية وأسواق الخليج وآسيا.', ES:'Especializado en búsqueda de compradores y negociaciones comerciales en mercados europeos, del Golfo y asiáticos.' },
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      email: 'buyers@azexbuy.com', linkedin: 'https://linkedin.com', sortOrder: 3
    },
    {
      id: 'tm-004', name: 'Nərgiz Məmmədova',
      role: { AZ:'Keyfiyyət və Uyğunluq Mütəxəssisi', EN:'Quality & Compliance Specialist', TR:'Kalite ve Uygunluk Uzmanı', RU:'Специалист по качеству и соответствию', AR:'أخصائية الجودة والامتثال', ES:'Especialista en Calidad y Cumplimiento' },
      bio: { AZ:'ISO, HACCP, Halal və GlobalGAP standartları üzrə yoxlama və akkreditasiya proseslərini idarə edir.', EN:'Oversees product audit, AQTA phytosanitary licensing, and international conformity assessments (ISO, GlobalGAP, Halal).', TR:'ISO, HACCP, Helal ve GlobalGAP standartları üzere denetim ve akreditasyon süreçlerini yönetir.', RU:'Курирует проверку стандартов качества, фитосанитарные сертификаты AQTA и международный комплаенс.', AR:'تشرف على معايير الجودة الدولية وتراخيص الامتثال (ISO, GlobalGAP, حلال).', ES:'Gestiona auditorías de producto, normativas de calidad y acreditaciones internacionales.' },
      photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
      email: 'compliance@azexbuy.com', linkedin: 'https://linkedin.com', sortOrder: 4
    }
  ];
  for (const t of SEED_TEAM) {
    insertTeam.run(
      t.id, now, now, t.name,
      JSON.stringify(t.role), JSON.stringify(t.bio),
      t.photo, t.email, t.linkedin, t.sortOrder, 1
    );
  }

  // 6. CMS Content for Homepage Carousel
  const existingKv = db.prepare("SELECT value FROM azexbuy_kv WHERE key = 'content'").get() as any;
  let cmsContent: any = {};
  if (existingKv) {
    try { cmsContent = JSON.parse(existingKv.value); } catch {}
  }
  if (!cmsContent.products || cmsContent.products.length < 4) {
    cmsContent.products = SEED_CMS_PRODUCTS;
  }
  if (!cmsContent.about) {
    cmsContent.about = ABOUT_PAGE_DEFAULT;
  }
  db.prepare("INSERT OR REPLACE INTO azexbuy_kv (key, value, updated_at) VALUES ('content', ?, ?)")
    .run(JSON.stringify(cmsContent), now);

  return {
    categoriesCount: SEED_CATEGORIES.length,
    productsCount: SEED_PRODUCTS.length,
    servicesCount: SEED_SERVICES.length,
    articlesCount: SEED_ARTICLES.length,
    teamCount: SEED_TEAM.length,
    cmsProductsCount: (cmsContent.products || []).length
  };
}
