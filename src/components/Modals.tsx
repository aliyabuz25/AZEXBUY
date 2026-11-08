import React, { useState, useEffect } from 'react';
import {
  IncotermCode,
  Locale,
  ProducerApplication,
  ProductItem,
  RFQLineItem,
  RFQSubmission,
  getLocalizedText,
} from '../types';
import {
  CORRIDOR_ROUTES,
  INCOTERMS_GUIDE,
  PRODUCTS_CATALOG,
} from '../data/translations';

// ── Modal localization strings ─────────────────────────────────────────────
const ML: Record<string, Record<string, string>> = {
  // RFQ Modal
  rfqTitle: { AZ: 'Rəsmi İxrac Qiymət Sorğusu (RFQ)', RU: 'Запрос коммерческого предложения (RFQ)', TR: 'Resmi İhracat Fiyat Teklifi (RFQ)', AR: 'طلب عرض سعر التصدير الرسمي (RFQ)', ES: 'Solicitud de Cotización de Exportación (RFQ)', EN: 'Request an Official Export Quotation (RFQ)' },
  cancel:   { AZ: 'Ləğv et', RU: 'Отмена', TR: 'İptal', AR: 'إلغاء', ES: 'Cancelar', EN: 'Cancel' },
  submitRfq: { AZ: 'RFQ Göndər & Sənəd Yarat', RU: 'Отправить RFQ & Создать досье', TR: 'RFQ Gönder & Dosya Oluştur', AR: 'إرسال RFQ وإنشاء الملف', ES: 'Enviar RFQ y Generar Expediente', EN: 'Submit RFQ & Generate Official Dossier' },
  rfqErrRequired: { AZ: 'Zəhmət olmasa şirkətin adını, təyinat ölkəsini, əlaqə şəxsini və e-poçtu daxil edin.', RU: 'Пожалуйста, укажите название компании, страну назначения, контактное лицо и e-mail.', TR: 'Lütfen şirket adını, varış ülkesini, yetkili kişiyi ve e-postayı girin.', AR: 'يرجى إدخال اسم الشركة والبلد المقصد وجهة الاتصال والبريد الإلكتروني.', ES: 'Por favor ingrese el nombre de la empresa, país de destino, persona de contacto y correo electrónico.', EN: 'Please complete company name, destination country, contact person, and business email.' },
  rfqErrEmail: { AZ: 'Zəhmət olmasa düzgün e-poçt ünvanı daxil edin.', RU: 'Пожалуйста, введите корректный адрес электронной почты.', TR: 'Lütfen geçerli bir e-posta adresi girin.', AR: 'يرجى إدخال عنوان بريد إلكتروني صحيح.', ES: 'Por favor ingrese un correo electrónico válido.', EN: 'Please enter a valid email address.' },
  fullNameTitle: { AZ: 'Ad, Soyad & Vəzifə', RU: 'ФИО и должность', TR: 'Ad Soyad & Unvan', AR: 'الاسم الكامل والمسمى الوظيفي', ES: 'Nombre completo y cargo', EN: 'Full Name & Title' },
  fullNamePlaceholder: { AZ: 'Ad Soyad & Vəzifə', RU: 'Имя Фамилия & Должность', TR: 'Ad Soyad & Unvan', AR: 'الاسم الكامل والمسمى الوظيفي', ES: 'Nombre Apellido & Cargo', EN: 'Full Name & Title' },
  notesPlaceholder: { AZ: 'Kalibr, özəl etiket qablaşdırması, çatdırılma cədvəli və ya akkreditiv şərtlərini bildirin...', RU: 'Укажите калибр, упаковку под частной маркой, график поставки или условия аккредитива...', TR: 'Kalibraj, özel etiket ambalaj, teslimat takvimi veya akreditif şartlarını belirtin...', AR: 'حدد المعيار والتغليف والجدول الزمني للتسليم أو شروط الاعتماد المستندي...', ES: 'Especifique calibre, embalaje de marca privada, calendario de entrega o términos de carta de crédito...', EN: 'Specify caliber, private label packaging, delivery schedule, or documentary letter of credit terms...' },
  addCertPlaceholder: { AZ: 'Sertifikat əlavə et (məs. BRC Qida Təhlükəsizliyi)...', RU: 'Добавить сертификат (напр. BRC Food Safety)...', TR: 'Sertifika ekle (ör. BRC Gıda Güvenliği)...', AR: 'إضافة شهادة (مثل BRC لسلامة الغذاء)...', ES: 'Agregar certificado (ej. BRC Seguridad Alimentaria)...', EN: 'Add custom certificate (e.g. BRC Food Safety)...' },
  removeItem: { AZ: 'Elementi sil', RU: 'Удалить элемент', TR: 'Öğeyi kaldır', AR: 'إزالة العنصر', ES: 'Eliminar elemento', EN: 'Remove item' },
  // Producer Modal
  producerTitle: { AZ: 'İstehsalçı İxrac Qeydiyyatı & Alıcı Uyğunlaşdırması', RU: 'Регистрация производителя для экспорта', TR: 'Üretici İhracat Kaydı & Alıcı Eşleştirme', AR: 'تسجيل المصنّع للتصدير ومطابقة المشتري', ES: 'Registro de Productor para Exportación', EN: 'Producer Export Onboarding & Global Buyer Matchmaking' },
  submitProducer: { AZ: 'İstehsalçı Qeydiyyatı & Sənəd Yarat', RU: 'Зарегистрировать производителя & Создать досье', TR: 'Üreticiyi Kaydet & Dosya Oluştur', AR: 'تسجيل المنتج وإنشاء الملف', ES: 'Registrar Productor e Emitir Expediente', EN: 'Register Producer & Issue Dossier' },
  prodErrRequired: { AZ: 'Zəhmət olmasa müəssisə adını, VÖEN, əsas ixrac məhsulunu və e-poçtu daxil edin.', RU: 'Пожалуйста, укажите название предприятия, VOEN, основной экспортный продукт и e-mail.', TR: 'Lütfen işletme adını, VÖEN, ana ihracat ürünü ve e-postayı girin.', AR: 'يرجى إدخال اسم الشركة ورقم VOEN والمنتج الرئيسي وعنوان البريد الإلكتروني.', ES: 'Por favor ingrese el nombre de la empresa, VOEN, producto principal de exportación y correo electrónico.', EN: 'Please enter your enterprise name, VOEN tax number, main export product, and email.' },
  prodErrEmail: { AZ: 'Zəhmət olmasa düzgün e-poçt ünvanı daxil edin.', RU: 'Введите корректный адрес электронной почты.', TR: 'Geçerli bir e-posta adresi girin.', AR: 'أدخل بريدًا إلكترونيًا صحيحًا.', ES: 'Ingrese un correo electrónico válido.', EN: 'Please enter a valid email address.' },
  exportReadiness: { AZ: 'İxraca Hazırlıq İndeksi:', RU: 'Индекс готовности к экспорту:', TR: 'İhracata Hazırlık İndeksi:', AR: 'مؤشر الاستعداد للتصدير:', ES: 'Índice de Preparación para la Exportación:', EN: 'Export Readiness Index:' },
  mandateActive: { AZ: 'Mandate Aktiv', RU: 'Мандат активен', TR: 'Yetki Aktif', AR: 'التفويض نشط', ES: 'Mandato Activo', EN: 'Mandate Active' },
  selectMandate: { AZ: 'Mandate Seç', RU: 'Выбрать мандат', TR: 'Yetki Seç', AR: 'اختر التفويض', ES: 'Seleccionar Mandato', EN: 'Select Mandate' },
  // Search Modal
  searchPlaceholder: { AZ: 'Məhsul adı, HS kodu (məs. 080222) və ya bölgə ilə axtar...', RU: 'Поиск по наименованию товара, коду HS или региону...', TR: 'Ürün adı, HS kodu veya bölgeye göre ara...', AR: 'ابحث باسم السلعة أو رمز HS أو المنطقة...', ES: 'Buscar por nombre de producto, código HS o región...', EN: 'Search by commodity name, HS Code (e.g. 080222, 5701, 2515), or region...' },
  requestBtn: { AZ: 'Sorğu Göndər', RU: 'Запросить', TR: 'Talep Et', ES: 'Solicitar', AR: 'طلب', EN: 'Request' },
};

const ml = (key: string, locale: string): string =>
  ML[key]?.[locale] || ML[key]?.['EN'] || key;

interface RFQModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  initialProduct?: ProductItem | null;
  shortlistedIds: string[];
  onSubmitRFQ: (rfq: RFQSubmission) => void;
}

export const RFQBuilderModal: React.FC<RFQModalProps> = ({
  isOpen,
  onClose,
  locale,
  initialProduct,
  shortlistedIds,
  onSubmitRFQ,
}) => {
  const [buyerCompany, setBuyerCompany] = useState('');
  const [country, setCountry] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [incoterm, setIncoterm] = useState<IncotermCode>('CIF');
  const [destinationPort, setDestinationPort] = useState('');
  const [corridorRoute, setCorridorRoute] = useState(CORRIDOR_ROUTES[0].id);
  const [requiredCerts, setRequiredCerts] = useState<string[]>([
    'AQTA Phytosanitary Certificate',
    'Certificate of Origin (CT-1 / EUR.1)',
    'ISO 22000 / Quality Assay',
  ]);
  const [items, setItems] = useState<RFQLineItem[]>([]);
  const [itemModes, setItemModes] = useState<('catalog' | 'custom')[]>([]);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [customCertInput, setCustomCertInput] = useState('');

  useEffect(() => { if (!isOpen) { setBuyerCompany(''); setCountry(''); setContactName(''); setEmail(''); setPhone(''); setNotes(''); setItems([]); setItemModes([]); setErrorMsg(''); } }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');
    if (initialProduct) {
      setItems([
        {
          productId: initialProduct.id,
          productName: getLocalizedText(initialProduct.name, locale),
          hsCode: initialProduct.hsCode,
          quantity: '20',
          unit: initialProduct.categoryKey === 'construction' || initialProduct.id === 'carpet-5701' ? 'm²' : 'MT',
        },
      ]);
    } else if (shortlistedIds.length > 0) {
      const prefilled: RFQLineItem[] = shortlistedIds
        .map((id) => PRODUCTS_CATALOG.find((p) => p.id === id))
        .filter((p): p is ProductItem => Boolean(p))
        .map((p) => ({
          productId: p.id,
          productName: getLocalizedText(p.name, locale),
          hsCode: p.hsCode,
          quantity: '20',
          unit: 'MT',
        }));
      setItems(prefilled);
    } else if (items.length === 0) {
      const def = PRODUCTS_CATALOG[0];
      setItems([
        {
          productId: def.id,
          productName: getLocalizedText(def.name, locale),
          hsCode: def.hsCode,
          quantity: '20',
          unit: 'MT',
        },
      ]);
    }
  }, [isOpen, initialProduct, locale]);

  if (!isOpen) return null;

  const availableCerts = [
    'AQTA Phytosanitary Certificate',
    'Certificate of Origin (CT-1 / EUR.1)',
    'ISO 22000 / Quality Assay',
    'GLOBALG.A.P. Certified',
    'Halal Certification',
    'SGS Pre-Shipment Inspection',
  ];

  const handleToggleCert = (cert: string) => {
    setRequiredCerts((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  const handleAddCustomCert = () => {
    const val = customCertInput.trim();
    if (!val || requiredCerts.includes(val)) return;
    setRequiredCerts((prev) => [...prev, val]);
    setCustomCertInput('');
  };

  const handleAddLineItem = () => {
    const nextProd =
      PRODUCTS_CATALOG.find((p) => !items.some((i) => i.productId === p.id)) ||
      PRODUCTS_CATALOG[0];
    setItems((prev) => [
      ...prev,
      {
        productId: nextProd.id,
        productName: getLocalizedText(nextProd.name, locale),
        hsCode: nextProd.hsCode,
        quantity: '20',
        unit: 'MT',
      },
    ]);
    setItemModes((prev) => [...prev, 'catalog']);
  };

  const handleProductChange = (idx: number, productId: string) => {
    const prod = PRODUCTS_CATALOG.find((p) => p.id === productId);
    if (!prod) return;
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              productId: prod.id,
              productName: getLocalizedText(prod.name, locale),
              hsCode: prod.hsCode,
            }
          : item
      )
    );
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerCompany.trim() || !country.trim() || !contactName.trim() || !email.trim()) {
      setErrorMsg(ml('rfqErrRequired', locale));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { setErrorMsg(ml('rfqErrEmail', locale)); return; }
    const routeObj = CORRIDOR_ROUTES.find((r) => r.id === corridorRoute) || CORRIDOR_ROUTES[0];
    const newRFQ: RFQSubmission = {
      id: `AZX-RFQ-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      buyerCompany: buyerCompany.trim(),
      country: country.trim(),
      contactName: contactName.trim(),
      email: email.trim(),
      phone: phone.trim() || '+994 12 404 85 00',
      incoterm,
      destinationPort: destinationPort.trim() || `${country.trim()} Main Terminal`,
      corridorRoute: routeObj.name.EN,
      requiredCertifications: requiredCerts,
      items,
      notes: notes.trim(),
      status: 'Pending',
    };
    onSubmitRFQ(newRFQ);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 no-print"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white border border-slate-200 rounded-t-2xl sm:rounded-xl w-full sm:max-w-3xl sm:mx-4 shadow-lg sm:my-8 flex flex-col max-h-[92dvh] sm:max-h-[88vh]">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-800">
              {ml('rfqTitle', locale)}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 p-1.5 rounded cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form id="rfq-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs font-semibold text-red-800">
              {errorMsg}
            </div>
          )}

          {/* Commodity Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-600">
                1. Selected Azerbaijani Commodities & HS Codes
              </label>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="text-xs font-bold text-brandGreen hover:underline flex items-center gap-1 cursor-pointer"
              >
                <i className="fa-solid fa-plus text-[10px]"></i>
                <span>Add Commodity Line</span>
              </button>
            </div>
            <div className="space-y-2.5">
              {items.map((item, idx) => {
                const mode = itemModes[idx] || 'catalog';
                return (
                <div
                  key={idx}
                  className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2"
                >
                  {/* Mode toggle */}
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      type="button"
                      onClick={() => setItemModes(prev => { const n = [...prev]; n[idx] = 'catalog'; return n; })}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer ${mode === 'catalog' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                    >Catalog</button>
                    <button
                      type="button"
                      onClick={() => setItemModes(prev => { const n = [...prev]; n[idx] = 'custom'; return n; })}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer ${mode === 'custom' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                    >Custom Product</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  <div className="sm:col-span-6">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      {mode === 'catalog' ? 'Commodity / HS Code' : 'Product Name'}
                    </label>
                    {mode === 'catalog' ? (
                    <select
                      value={item.productId}
                      onChange={(e) => handleProductChange(idx, e.target.value)}
                      className="w-full h-9 px-2.5 text-xs font-semibold bg-white border border-slate-300 rounded text-slate-900"
                    >
                      {PRODUCTS_CATALOG.map((p) => (
                        <option key={p.id} value={p.id}>
                          {getLocalizedText(p.name, locale)} — HS: {p.hsCode} ({getLocalizedText(p.originRegion, locale)})
                        </option>
                      ))}
                    </select>
                    ) : (
                    <input
                      type="text"
                      value={item.productName}
                      onChange={(e) => setItems(prev => prev.map((it, i) => i === idx ? { ...it, productName: e.target.value } : it))}
                      placeholder="e.g. Organic Pomegranate Juice"
                      className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded text-slate-900"
                    />
                    )}
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Target Volume
                    </label>
                    <input
                      type="text"
                      value={item.quantity}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((it, i) =>
                            i === idx ? { ...it, quantity: e.target.value } : it
                          )
                        )
                      }
                      className="w-full h-9 px-2.5 text-xs font-semibold bg-white border border-slate-300 rounded text-slate-900 tabular-nums"
                      placeholder="e.g. 40"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Unit
                    </label>
                    <select
                      value={item.unit}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((it, i) =>
                            i === idx
                              ? { ...it, unit: e.target.value as RFQLineItem['unit'] }
                              : it
                          )
                        )
                      }
                      className="w-full h-9 px-2 text-xs font-semibold bg-white border border-slate-300 rounded text-slate-900"
                    >
                      <option value="MT">MT (Metric Tons)</option>
                      <option value="20ft FCL">20ft FCL</option>
                      <option value="40ft FCL">40ft FCL</option>
                      <option value="m²">m² (Slabs/Rugs)</option>
                      <option value="Units">Units / Lots</option>
                    </select>
                  </div>
                  <div className="sm:col-span-1 flex justify-end pt-4">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        title={ml('removeItem', locale)}
                      >
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    )}
                  </div>
                  </div>
                </div>
              )})}
            </div>
          </div>

          {/* Logistics & Incoterms */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Incoterms® 2020 Basis
              </label>
              <select
                value={incoterm}
                onChange={(e) => setIncoterm(e.target.value as IncotermCode)}
                className="w-full h-10 px-3 text-xs font-semibold bg-white border border-slate-300 rounded text-slate-900"
              >
                {INCOTERMS_GUIDE.map((ic) => (
                  <option key={ic.code} value={ic.code}>
                    {ic.code} — {ic.name.split('(')[0].trim()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Destination Port / Terminal
              </label>
              <input
                type="text"
                value={destinationPort}
                onChange={(e) => setDestinationPort(e.target.value)}
                placeholder="e.g. Hamburg, Mersin, Jebel Ali"
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preferred Trade Corridor
              </label>
              <select
                value={corridorRoute}
                onChange={(e) => setCorridorRoute(e.target.value)}
                className="w-full h-10 px-3 text-xs font-semibold bg-white border border-slate-300 rounded text-slate-900"
              >
                {CORRIDOR_ROUTES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {getLocalizedText(r.name, locale)} ({r.transitDays})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Required Certifications */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              2. Required Export & Quality Dossier Certificates
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {availableCerts.map((cert) => {
                const checked = requiredCerts.includes(cert);
                return (
                  <button
                    key={cert}
                    type="button"
                    onClick={() => handleToggleCert(cert)}
                    className={`flex items-center gap-2 p-2 rounded border text-left text-xs font-medium transition-colors cursor-pointer ${
                      checked
                        ? 'bg-blue-50/80 border-brandNavy text-brandNavy font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <i
                      className={`fa-solid ${
                        checked ? 'fa-square-check text-brandNavy' : 'fa-regular fa-square text-slate-400'
                      }`}
                    ></i>
                    <span className="truncate">{cert}</span>
                  </button>
                );
              })}
              {/* Custom certs added by user */}
              {requiredCerts.filter(c => !availableCerts.includes(c)).map(cert => (
                <button
                  key={cert}
                  type="button"
                  onClick={() => handleToggleCert(cert)}
                  className="flex items-center gap-2 p-2 rounded border text-left text-xs font-medium transition-colors cursor-pointer bg-blue-50/80 border-brandNavy text-brandNavy font-semibold"
                >
                  <i className="fa-solid fa-square-check text-brandNavy"></i>
                  <span className="truncate">{cert}</span>
                </button>
              ))}
            </div>
            {/* Add custom certificate */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={customCertInput}
                onChange={(e) => setCustomCertInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomCert(); }}}
                placeholder={ml('addCertPlaceholder', locale)}
                className="flex-1 h-8 px-3 text-xs bg-white border border-slate-300 rounded text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddCustomCert}
                className="h-8 px-3 text-xs font-bold bg-brandNavy text-white rounded cursor-pointer hover:bg-brandNavyDark"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Buyer Organization Details */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              3. International Buyer / Procurement Officer Credentials
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Buyer Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={buyerCompany}
                  onChange={(e) => setBuyerCompany(e.target.value)}
                  placeholder="e.g. EuroAgro Commodities GmbH"
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination Country *
                </label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Germany, UAE, Turkey, Poland"
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
{ml('fullNameTitle', locale)} *
                 </label>
                 <input
                   type="text"
                   required
                   value={contactName}
                   onChange={(e) => setContactName(e.target.value)}
                   placeholder={ml('fullNamePlaceholder', locale)}
                   className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded text-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="procurement@company.com"
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+49 / +971 ..."
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded text-slate-900"
                  />
                </div>
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Technical Specifications, Packaging & Payment Terms (L/C, TT, Escrow)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={ml('notesPlaceholder', locale)}
                className="w-full p-3 text-xs bg-white border border-slate-300 rounded text-slate-900"
              />
            </div>
          </div>

</form>
        {/* Sticky footer */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 hidden sm:block">
            <i className="fa-solid fa-shield-halved text-brandGreen mr-1.5"></i>
            Target RFQ Match SLA: <strong>&lt; 48 Hours</strong> with 3+ verified Azerbaijani producers.
          </span>
<div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              form="rfq-form"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
            >
              {ml('cancel', locale)}
            </button>
            <button
              type="submit"
              form="rfq-form"
              className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-bold text-white bg-brandNavy hover:bg-brandNavyDark rounded cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{ml('submitRfq', locale)}</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProducerModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onSubmitProducer: (app: ProducerApplication) => void;
}

export const ProducerOnboardingModal: React.FC<ProducerModalProps> = ({
  isOpen,
  onClose,
  locale,
  onSubmitProducer,
}) => {
  const [companyName, setCompanyName] = useState('');
  const [voenTin, setVoenTin] = useState('');
  const [economicRegion, setEconomicRegion] = useState('Absheron – Khizi');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [productName, setProductName] = useState('');
  const [hsCode, setHsCode] = useState('080222');
  const [categoryKey, setCategoryKey] = useState('Agriculture & Food');
  const [monthlyCapacity, setMonthlyCapacity] = useState('100 MT / Month');
  const [certs, setCerts] = useState<string[]>(['AQTA Registration', 'CT-1 / EUR.1 Eligible']);
  const [targetMarkets, setTargetMarkets] = useState<string[]>(['European Union', 'GCC / Middle East']);
  const [outsourcedDesk, setOutsourcedDesk] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setCompanyName('');
      setVoenTin('');
      setEconomicRegion('Absheron – Khizi');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setProductName('');
      setHsCode('080222');
      setCategoryKey('Agriculture & Food');
      setMonthlyCapacity('100 MT / Month');
      setCerts(['AQTA Registration', 'CT-1 / EUR.1 Eligible']);
      setTargetMarkets(['European Union', 'GCC / Middle East']);
      setOutsourcedDesk(true);
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const regions = [
    'Baku Economic Region',
    'Absheron – Khizi (Sumgayit Industrial Park)',
    'Sheki – Zaqatala',
    'Central Aran (Goychay – Kurdamir)',
    'Ganja – Dashkasan',
    'Quba – Khachmaz',
    'Lankaran – Astara',
    'Karabakh & East Zangezur',
    'Nakhchivan Economic Region',
  ];

  const certOptions = [
    'AQTA Registration',
    'CT-1 / EUR.1 Eligible',
    'ISO 9001 / 22000',
    'GLOBALG.A.P.',
    'Halal Certified',
    'OEKO-TEX / CE Mark',
  ];

  const marketOptions = [
    'European Union',
    'GCC / Middle East',
    'CIS & Central Asia',
    'Turkey & Mediterranean',
    'East & South Asia',
    'North America',
  ];

  const readinessScore = Math.min(
    98,
    55 + certs.length * 6 + (outsourcedDesk ? 10 : 0) + (voenTin.length >= 8 ? 5 : 0)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !voenTin.trim() || !productName.trim() || !email.trim()) {
      setErrorMsg(ml('prodErrRequired', locale));
      return;
    }
    const app: ProducerApplication = {
      id: `AZX-EXP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      companyName: companyName.trim(),
      voenTin: voenTin.trim(),
      economicRegion,
      contactPerson: contactPerson.trim() || 'Export Director',
      email: email.trim(),
      phone: phone.trim() || '+994 50 200 00 00',
      productName: productName.trim(),
      hsCode: hsCode.trim(),
      categoryKey,
      monthlyCapacity,
      certifications: certs,
      targetMarkets,
      outsourcedDeskRequested: outsourcedDesk,
      readinessScore,
      status: 'Pending',
    };
    onSubmitProducer(app);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 no-print"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white border border-slate-200 rounded-t-2xl sm:rounded-xl w-full sm:max-w-3xl sm:mx-4 shadow-lg sm:my-8 flex flex-col max-h-[92dvh] sm:max-h-[88vh]">
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-800">
              {ml('producerTitle', locale)}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 p-1.5 rounded cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form id="producer-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs font-semibold text-red-800">
              {errorMsg}
            </div>
          )}

          {/* Enterprise & VOEN */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Azerbaijani Enterprise / Agro-Cluster Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Zaqatala Agro Processing LLC"
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tax ID (VÖEN / TIN) *
              </label>
              <input
                type="text"
                required
                value={voenTin}
                onChange={(e) => setVoenTin(e.target.value)}
                placeholder="10-digit VÖEN"
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded text-slate-900 tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Economic Region (14 Clusters)
              </label>
              <select
                value={economicRegion}
                onChange={(e) => setEconomicRegion(e.target.value)}
                className="w-full h-10 px-3 text-xs font-semibold bg-white border border-slate-300 rounded text-slate-900"
              >
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Export Product *
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Roasted Hazelnut Kernels"
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded text-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  HS Code
                </label>
                <input
                  type="text"
                  value={hsCode}
                  onChange={(e) => setHsCode(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded text-slate-900 tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Monthly Capacity
                </label>
                <input
                  type="text"
                  value={monthlyCapacity}
                  onChange={(e) => setMonthlyCapacity(e.target.value)}
                  className="w-full h-10 px-2.5 text-xs bg-white border border-slate-300 rounded text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Certifications & Target Markets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">
                Active Compliance Certifications
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {certOptions.map((c) => {
                  const active = certs.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        setCerts((prev) =>
                          prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                        )
                      }
                      className={`p-2 rounded border text-left text-[11px] font-medium cursor-pointer flex items-center gap-1.5 ${
                        active
                          ? 'bg-emerald-50 border-brandGreen text-brandNavy font-semibold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <i
                        className={`fa-solid ${
                          active ? 'fa-circle-check text-brandGreen' : 'fa-regular fa-circle text-slate-400'
                        }`}
                      ></i>
                      <span className="truncate">{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">
                Priority Export Destinations
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {marketOptions.map((m) => {
                  const active = targetMarkets.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() =>
                        setTargetMarkets((prev) =>
                          prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
                        )
                      }
                      className={`p-2 rounded border text-left text-[11px] font-medium cursor-pointer flex items-center gap-1.5 ${
                        active
                          ? 'bg-blue-50 border-brandNavy text-brandNavy font-semibold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <i
                        className={`fa-solid ${
                          active ? 'fa-circle-check text-brandNavy' : 'fa-regular fa-circle text-slate-400'
                        }`}
                      ></i>
                      <span className="truncate">{m}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Outsourced Export Department Toggle */}
          <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-700 block">
                Appoint AZEXBUY as Your Outsourced Export Department
              </span>
              <span className="text-[11px] text-slate-600">
                Includes turnkey multilingual B2B sales, contract preparation, AQTA/DGK clearance, and Middle Corridor freight.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOutsourcedDesk(!outsourcedDesk)}
              className={`px-3 py-1.5 rounded text-xs font-bold cursor-pointer shrink-0 ${
                outsourcedDesk
                  ? 'bg-brandGreen text-white'
                  : 'bg-white border border-slate-300 text-slate-700'
              }`}
            >
              {outsourcedDesk ? ml('mandateActive', locale) : ml('selectMandate', locale)}
            </button>
          </div>

          {/* Contact row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Export Director / Contact
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder={ml('fullNamePlaceholder', locale)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="export@producer.az"
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone (+994)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+994 50 ..."
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded"
              />
            </div>
          </div>

</form>
        {/* Sticky footer */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-slate-600">{ml('exportReadiness', locale)}</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded tabular-nums">
              {readinessScore} / 100
            </span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
            >
              {ml('cancel', locale)}
            </button>
            <button
              type="submit"
              form="producer-form"
              className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold text-white bg-brandGreen hover:bg-brandGreenDark rounded cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{ml('submitProducer', locale)}</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DossierPrintModalProps {
  rfq: RFQSubmission | null;
  producerApp: ProducerApplication | null;
  onClose: () => void;
}

export const PrintableDossierModal: React.FC<DossierPrintModalProps> = ({
  rfq,
  producerApp,
  onClose,
}) => {
  if (!rfq && !producerApp) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const payload = rfq || producerApp;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(rfq?.id || producerApp?.id || 'AZEXBUY-DOSSIER')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        id="printable-dossier"
        className="bg-white border border-slate-200 rounded-t-2xl sm:rounded-xl w-full sm:max-w-3xl sm:mx-4 shadow-lg sm:my-8 flex flex-col max-h-[92dvh] sm:max-h-[88vh]"
      >
        {/* Top Action Bar (Hidden in Print) */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-brandNavy">
            <i className="fa-solid fa-circle-check text-brandGreen"></i>
            <span>Saved to Local Registry · Official Printable Dossier</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadJSON}
              className="px-3 py-1.5 text-xs font-bold text-brandNavy bg-white border border-slate-300 hover:bg-slate-50 rounded cursor-pointer flex items-center gap-1.5"
            >
              <i className="fa-solid fa-download text-[11px]"></i>
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-brandNavy hover:bg-brandNavyDark rounded cursor-pointer flex items-center gap-1.5"
            >
              <i className="fa-solid fa-print text-[11px]"></i>
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 p-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-base"></i>
            </button>
          </div>
        </div>

        {/* Official Document Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-5">
          <div className="flex items-start justify-between border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-semibold text-slate-800">
                  AZEXBUY
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
                  Sovereign Trade & Sourcing Authority
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Baku Alliance Business Center, Heydar Aliyev Ave 95, Baku AZ1033, Azerbaijan
              </p>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                DOCUMENT REFERENCE
              </span>
              <span className="text-sm font-semibold text-slate-800 tabular-nums">
                {rfq ? rfq.id : producerApp?.id}
              </span>
              <span className="block text-[11px] text-slate-500 tabular-nums mt-0.5">
                Issued: {new Date(rfq?.createdAt || producerApp?.createdAt || '').toLocaleDateString()}
              </span>
            </div>
          </div>

          {rfq && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Buyer Organization
                  </span>
                  <span className="font-bold text-slate-900">{rfq.buyerCompany}</span>
                  <span className="block text-slate-500">{rfq.country}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Procurement Officer
                  </span>
                  <span className="font-bold text-slate-900">{rfq.contactName}</span>
                  <span className="block text-slate-500">{rfq.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Incoterms® 2020 & Port
                  </span>
                  <span className="font-bold text-brandNavy">
                    {rfq.incoterm} — {rfq.destinationPort}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Dossier Status
                  </span>
                  <span className="font-bold text-brandGreen">{rfq.status}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium text-slate-600 mb-2">
                  Requested Export Commodities & HS Classification
                </h4>
                <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                      <th className="p-2.5 border-b border-slate-200">#</th>
                      <th className="p-2.5 border-b border-slate-200">Commodity Description</th>
                      <th className="p-2.5 border-b border-slate-200">HS Code</th>
                      <th className="p-2.5 border-b border-slate-200 text-right">Requested Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rfq.items.map((item, i) => (
                      <tr key={i} className="border-b border-slate-200">
                        <td className="p-2.5 tabular-nums text-slate-500">{i + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900">{item.productName}</td>
                        <td className="p-2.5 font-medium tabular-nums text-slate-700">{item.hsCode}</td>
                        <td className="p-2.5 text-right font-bold tabular-nums text-brandNavy">
                          {item.quantity} {item.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 border border-slate-200 rounded">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Selected Logistics Route
                  </span>
                  <span className="font-semibold text-slate-800">{rfq.corridorRoute}</span>
                </div>
                <div className="p-3.5 border border-slate-200 rounded">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Required Export Certificates
                  </span>
                  <span className="font-semibold text-slate-800">
                    {rfq.requiredCertifications.join(' · ')}
                  </span>
                </div>
              </div>

              {rfq.notes && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded text-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Buyer Instructions & Payment Terms
                  </span>
                  <p className="text-slate-700">{rfq.notes}</p>
                </div>
              )}
            </>
          )}

          {producerApp && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-emerald-50/60 p-4 rounded border border-emerald-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Azerbaijani Producer
                  </span>
                  <span className="font-bold text-slate-900">{producerApp.companyName}</span>
                  <span className="block text-slate-600 tabular-nums">VÖEN: {producerApp.voenTin}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Economic Region
                  </span>
                  <span className="font-bold text-slate-900">{producerApp.economicRegion}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Readiness Score
                  </span>
                  <span className="font-semibold text-emerald-700 tabular-nums">
                    {producerApp.readinessScore} / 100
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Assigned Desk
                  </span>
                  <span className="font-bold text-brandNavy">{producerApp.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 border border-slate-200 rounded">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Export Commodity & HS Code
                  </span>
                  <span className="font-bold text-slate-900">
                    {producerApp.productName} (HS: {producerApp.hsCode})
                  </span>
                </div>
                <div className="p-3.5 border border-slate-200 rounded">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Declared Monthly Capacity
                  </span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {producerApp.monthlyCapacity}
                  </span>
                </div>
                <div className="p-3.5 border border-slate-200 rounded">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Outsourced Export Desk
                  </span>
                  <span className="font-bold text-brandGreen">
                    {producerApp.outsourcedDeskRequested ? 'Full Turnkey Mandate' : 'Standard Listing'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 border border-slate-200 rounded">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Verified Certifications
                  </span>
                  <span className="font-medium text-slate-800">
                    {producerApp.certifications.join(' · ')}
                  </span>
                </div>
                <div className="p-3.5 border border-slate-200 rounded">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Target Export Markets
                  </span>
                  <span className="font-medium text-slate-800">
                    {producerApp.targetMarkets.join(' · ')}
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>AZEXBUY Official B2B Trade Portal · National Export Network</span>
            <span>Incoterms® 2020 ICC Official Rules Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onSelectProduct: (p: ProductItem) => void;
  onRequestProduct: (p: ProductItem) => void;
}

export const GlobalSearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  locale,
  onSelectProduct,
  onRequestProduct,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();
  const filteredProducts = PRODUCTS_CATALOG.filter(
    (p) =>
      !q ||
      (p.name?.EN || '').toLowerCase().includes(q) ||
      (p.name?.AZ || '').toLowerCase().includes(q) ||
      (p.name?.RU || '').toLowerCase().includes(q) ||
      (p.hsCode || '').includes(q) ||
      getLocalizedText(p.originRegion, locale).toLowerCase().includes(q) ||
      getLocalizedText(p.categoryLabel, locale).toLowerCase().includes(q)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-start justify-center bg-black/40 p-0 sm:p-4 sm:pt-16 no-print"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white border border-slate-200 rounded-t-2xl sm:rounded-xl w-full max-w-2xl mx-auto overflow-hidden shadow-md max-h-[85dvh] flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <i className="fa-solid fa-magnifying-glass text-brandNavy"></i>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={ml('searchPlaceholder', locale)}
            className="w-full text-sm text-slate-900 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded bg-slate-100 cursor-pointer"
          >
            ESC
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-4 transition-colors"
            >
              <div
                onClick={() => {
                  onSelectProduct(p);
                  onClose();
                }}
                className="flex items-center gap-3.5 cursor-pointer flex-1"
              >
                <img
                  src={p.image}
                  alt={getLocalizedText(p.name, locale)}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded object-cover bg-slate-100 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{getLocalizedText(p.name, locale)}</span>
                    <span className="text-[11px] font-medium text-slate-500 tabular-nums">
                      HS {p.hsCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{getLocalizedText(p.shortDesc, locale)}</p>
                  <span className="text-[10px] text-slate-400">
                    {getLocalizedText(p.originRegion, locale)} · MOQ: {p.minOrderQty}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequestProduct(p);
                }}
                className="bg-brandGreen hover:bg-brandGreenDark text-white text-[11px] font-bold px-3 py-1.5 rounded shrink-0 cursor-pointer"
              >
                {ml('requestBtn', locale)}
              </button>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching HS codes or commodities found. Try searching for "Hazelnut", "080222", "Marble", or "Steel".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
