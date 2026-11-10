import React, { useState } from 'react';
import { Locale, CmsService, ServiceApplication, getLocalizedText } from '../types';
import { CountrySelect } from './CountrySelect';

interface ServiceApplicationModalProps {
  locale: Locale;
  services: CmsService[];
  preselectedServiceId?: string;
  onClose: () => void;
  onSubmit: (application: ServiceApplication) => void;
}

const LABEL: Record<string, Record<Locale, string>> = {
  title:           { AZ: 'Xidmət Müraciəti',              EN: 'Service Application',          TR: 'Hizmet Başvurusu',          RU: 'Заявка на услугу',              AR: 'طلب الخدمة',              ES: 'Solicitud de servicio' },
  fullName:        { AZ: 'Ad Soyad',                       EN: 'Full Name',                    TR: 'Ad Soyad',                  RU: 'Имя и фамилия',                 AR: 'الاسم الكامل',            ES: 'Nombre completo' },
  company:         { AZ: 'Şirkət adı',                     EN: 'Company Name',                 TR: 'Şirket Adı',                RU: 'Название компании',             AR: 'اسم الشركة',              ES: 'Nombre de empresa' },
  country:         { AZ: 'Ölkə',                           EN: 'Country',                      TR: 'Ülke',                      RU: 'Страна',                        AR: 'الدولة',                  ES: 'País' },
  email:           { AZ: 'E-poçt',                         EN: 'Email',                        TR: 'E-posta',                   RU: 'Эл. почта',                     AR: 'البريد الإلكتروني',       ES: 'Correo electrónico' },
  phone:           { AZ: 'Telefon',                        EN: 'Phone',                        TR: 'Telefon',                   RU: 'Телефон',                       AR: 'الهاتف',                  ES: 'Teléfono' },
  details:         { AZ: 'Müraciətin təfərrüatları',       EN: 'Application Details',          TR: 'Başvurunun ayrıntıları',    RU: 'Детали заявки',                 AR: 'تفاصيل الطلب',            ES: 'Detalles de la solicitud' },
  services:        { AZ: 'Xidmət seçimi',                  EN: 'Service Selection',            TR: 'Hizmet Seçimi',             RU: 'Выбор услуги',                  AR: 'اختيار الخدمة',           ES: 'Selección de servicio' },
  submit:          { AZ: 'Müraciəti göndər',               EN: 'Submit Application',           TR: 'Başvuruyu Gönder',          RU: 'Отправить заявку',              AR: 'إرسال الطلب',             ES: 'Enviar solicitud' },
  cancel:          { AZ: 'Ləğv et',                        EN: 'Cancel',                       TR: 'İptal',                     RU: 'Отмена',                        AR: 'إلغاء',                   ES: 'Cancelar' },
  required:        { AZ: 'Bu sahə məcburidir',             EN: 'This field is required',       TR: 'Bu alan zorunludur',        RU: 'Это поле обязательно',          AR: 'هذا الحقل مطلوب',         ES: 'Este campo es obligatorio' },
  success:         { AZ: 'Müraciətiniz uğurla göndərildi!', EN: 'Your application was submitted successfully!', TR: 'Başvurunuz başarıyla gönderildi!', RU: 'Ваша заявка успешно отправлена!', AR: 'تم إرسال طلبك بنجاح!', ES: '¡Su solicitud fue enviada con éxito!' },
  selectAtLeastOne:{ AZ: 'Ən azı bir xidmət seçin',       EN: 'Select at least one service',  TR: 'En az bir hizmet seçin',    RU: 'Выберите хотя бы одну услугу',  AR: 'اختر خدمة واحدة على الأقل', ES: 'Seleccione al menos un servicio' },
  primaryBadge:    { AZ: 'Əsas xidmət',                   EN: 'Primary service',              TR: 'Ana hizmet',                RU: 'Основная услуга',               AR: 'الخدمة الرئيسية',         ES: 'Servicio principal' },
  additionalBadge: { AZ: 'Əlavə xidmət',                  EN: 'Additional service',           TR: 'Ek hizmet',                 RU: 'Дополнительная услуга',         AR: 'خدمة إضافية',             ES: 'Servicio adicional' },
  serverErr:       { AZ: 'Server xətası. Yenidən cəhd edin.', EN: 'Server error. Please try again.', TR: 'Sunucu hatası. Lütfen tekrar deneyin.', RU: 'Ошибка сервера. Попробуйте снова.', AR: 'خطأ في الخادم. حاول مرة أخرى.', ES: 'Error del servidor. Inténtelo de nuevo.' },
  networkErr:      { AZ: 'Şəbəkə xətası. Yenidən cəhd edin.', EN: 'Network error. Please try again.', TR: 'Ağ hatası. Lütfen tekrar deneyin.', RU: 'Ошибка сети. Попробуйте снова.', AR: 'خطأ في الشبكة. حاول مرة أخرى.', ES: 'Error de red. Inténtelo de nuevo.' },
};

const t = (key: string, locale: Locale): string =>
  LABEL[key]?.[locale] || LABEL[key]?.['EN'] || '';

const inputCls = 'w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-slate-400 transition-colors';
const labelCls = 'block text-xs font-medium text-slate-500 mb-1';

export const ServiceApplicationModal: React.FC<ServiceApplicationModalProps> = ({
  locale,
  services,
  preselectedServiceId,
  onClose,
  onSubmit,
}) => {
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>(
    preselectedServiceId ? [preselectedServiceId] : []
  );
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleService = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) return setError(t('required', locale));
    if (!company.trim()) return setError(t('required', locale));
    if (!country.trim()) return setError(t('required', locale));
    if (!email.trim()) return setError(t('required', locale));
    if (selectedServices.length === 0) return setError(t('selectAtLeastOne', locale));

    setLoading(true);
    const application: ServiceApplication = {
      id: `svc-app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      fullName: fullName.trim(),
      company: company.trim(),
      country: country.trim(),
      email: email.trim(),
      phone: phone.trim(),
      details: details.trim(),
      selectedServices,
      status: 'Pending',
    };

    try {
      const res = await fetch('/api/azexbuy/service-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(application),
      });
      if (res.ok) {
        onSubmit(application);
        setSubmitted(true);
      } else {
        setError(t('serverErr', locale));
      }
    } catch {
      setError(t('networkErr', locale));
    } finally {
      setLoading(false);
    }
  };

  const primaryServices = services.filter(s => s.serviceType === 'primary');
  const secondaryServices = services.filter(s => s.serviceType === 'secondary');

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 no-print"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white border border-slate-200 rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl sm:mx-4 shadow-lg sm:my-8 flex flex-col max-h-[92dvh] sm:max-h-[88vh]">

        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between shrink-0">
          <h3 className="text-base font-semibold text-slate-800">{t('title', locale)}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded transition-colors cursor-pointer">
            <i className="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <i className="fa-solid fa-check text-xl text-emerald-600"></i>
            </div>
            <p className="text-sm font-medium text-slate-700">{t('success', locale)}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-1 px-6 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
            >
              OK
            </button>
          </div>
        ) : (
          <>
            <form id="svc-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs font-medium text-red-700">
                  {error}
                </div>
              )}

              {/* Contact fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t('fullName', locale)} <span className="text-red-500">*</span></label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>{t('company', locale)} <span className="text-red-500">*</span></label>
                  <input type="text" value={company} onChange={e => setCompany(e.target.value)} className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>{t('country', locale)} <span className="text-red-500">*</span></label>
                  <CountrySelect
                    value={country}
                    onChange={setCountry}
                    required
                    placeholder="Select Country..."
                  />
                </div>
                <div>
                  <label className={labelCls}>{t('email', locale)} <span className="text-red-500">*</span></label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} required />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>{t('phone', locale)}</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} />
                </div>
              </div>

              {/* Service selection */}
              <div>
                <label className={`${labelCls} mb-2`}>{t('services', locale)} <span className="text-red-500">*</span></label>

                {primaryServices.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[10px] font-medium text-emerald-700 uppercase mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                      {t('primaryBadge', locale)}
                    </div>
                    <div className="space-y-1.5">
                      {primaryServices.map(srv => {
                        const isSelected = selectedServices.includes(srv.id);
                        return (
                          <button
                            key={srv.id}
                            type="button"
                            onClick={() => toggleService(srv.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all cursor-pointer text-left ${
                              isSelected
                                ? 'border-slate-800 bg-slate-50'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg ${srv.colorClass} flex items-center justify-center shrink-0`}>
                              <i className={`${srv.iconClass} text-white text-xs`}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                {getLocalizedText(srv.title, locale)}
                              </div>
                              <div className="text-xs text-slate-400 truncate">
                                {getLocalizedText(srv.targetAudience, locale)}
                              </div>
                            </div>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? 'bg-slate-800 border-slate-800' : 'border-slate-300'
                            }`}>
                              {isSelected && <i className="fa-solid fa-check text-white text-[8px]"></i>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {secondaryServices.length > 0 && (
                  <div>
                    <div className="text-[10px] font-medium text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block"></span>
                      {t('additionalBadge', locale)}
                    </div>
                    <div className="space-y-1.5">
                      {secondaryServices.map(srv => {
                        const isSelected = selectedServices.includes(srv.id);
                        return (
                          <button
                            key={srv.id}
                            type="button"
                            onClick={() => toggleService(srv.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all cursor-pointer text-left ${
                              isSelected
                                ? 'border-slate-800 bg-slate-50'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg ${srv.colorClass} flex items-center justify-center shrink-0`}>
                              <i className={`${srv.iconClass} text-white text-xs`}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                {getLocalizedText(srv.title, locale)}
                              </div>
                              <div className="text-xs text-slate-400 truncate">
                                {getLocalizedText(srv.targetAudience, locale)}
                              </div>
                            </div>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? 'bg-slate-800 border-slate-800' : 'border-slate-300'
                            }`}>
                              {isSelected && <i className="fa-solid fa-check text-white text-[8px]"></i>}
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
                <label className={labelCls}>{t('details', locale)}</label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-slate-400 resize-none transition-colors"
                />
              </div>
            </form>

            {/* Sticky footer */}
            <div className="shrink-0 px-5 py-3.5 border-t border-slate-200 bg-white flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
              >
                {t('cancel', locale)}
              </button>
              <button
                type="submit"
                form="svc-form"
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin text-xs"></i>
                    <span>...</span>
                  </>
                ) : (
                  t('submit', locale)
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
